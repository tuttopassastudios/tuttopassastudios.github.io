// CSS is linked directly in index.html so it loads even without a bundler.
// Webamp is loaded via CDN <script> in index.html (window.Webamp).

// ─── Placeholder Tracks ───────────────────────────────────────
const INITIAL_TRACKS = [
  {
    metaData: {
      artist: 'Tutto Passa Studios',
      title: 'Just Can\'t Get Enough V2',
    },
    url: '/audio/JUST CANT GET ENOUGH V2.m4a',
  },
];

// ─── Skin Library ─────────────────────────────────────────────
// Drop .wsz files into public/skins/ and add entries here.
const SKIN_LIBRARY = [
  { url: '/skins/For_The_Birds.wsz', name: 'For The Birds' },
  { url: '/skins/dexter_amp.wsz', name: 'Dexter Amp' },
  { url: '/skins/slimshdy.wsz', name: 'Slim Shady' },
  { url: '/skins/the_Neverhood_amp.wsz', name: 'The Neverhood' },
];

// ─── Window Management ───────────────────────────────────────
let topZ = 100;

function bringToFront(win) {
  document.querySelectorAll('.mac-window').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  topZ += 1;
  win.style.zIndex = topZ;
}

function initWindowDragging() {
  document.querySelectorAll('.window-title-bar').forEach(titleBar => {
    const win = titleBar.closest('.mac-window');
    if (!win || win.closest('.mac-dialog')) return;
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    function onPointerDown(e) {
      if (e.target.closest('.title-btn')) return;
      if (window.innerWidth < 768) return;

      isDragging = true;
      bringToFront(win);

      const rect = win.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;

      if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else {
        startX = e.clientX;
        startY = e.clientY;
      }

      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;

      let clientX, clientY;
      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const dx = clientX - startX;
      const dy = clientY - startY;

      const newLeft = Math.max(0, origLeft + dx);
      const newTop = Math.max(0, origTop + dy);

      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    }

    function onPointerUp() {
      isDragging = false;
    }

    titleBar.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);

    titleBar.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
  });

  document.querySelectorAll('.mac-window').forEach(win => {
    if (win.closest('.mac-dialog')) return;
    win.addEventListener('mousedown', () => bringToFront(win));
  });
}

// ─── Close & Zoom Buttons ─────────────────────────────────────
function initWindowControls() {
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const win = btn.closest('.mac-window');
      win.classList.add('hidden');
      win.classList.remove('active');
    });
  });

  document.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const win = btn.closest('.mac-window');
      win.classList.toggle('fullscreen');
    });
  });
}

// ─── Desktop Icons ────────────────────────────────────────────
function initDesktopIcons() {
  const icons = document.querySelectorAll('.desktop-icon');

  icons.forEach(icon => {
    icon.addEventListener('click', () => {
      icons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });

    icon.addEventListener('dblclick', () => {
      const targetId = icon.dataset.window;
      if (!targetId) return;
      const win = document.getElementById(targetId);
      if (!win) return;
      win.classList.remove('hidden');
      win.classList.remove('fullscreen');
      bringToFront(win);
    });
  });

  document.getElementById('desktop').addEventListener('click', (e) => {
    if (e.target.id === 'desktop') {
      icons.forEach(i => i.classList.remove('selected'));
    }
  });
}

// ─── Menu Bar Clock ───────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('menu-clock');
  if (!el) return;
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[now.getDay()];
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${day} ${hours}:${minutes} ${ampm}`;
}

// ─── Dropdown Menu System ─────────────────────────────────────
let menuOpen = false;

function closeAllMenus() {
  document.querySelectorAll('.menu-trigger.open').forEach(t => t.classList.remove('open'));
  menuOpen = false;
}

function openMenu(trigger) {
  closeAllMenus();
  trigger.classList.add('open');
  menuOpen = true;
}

function initMenuSystem() {
  const triggers = document.querySelectorAll('.menu-trigger');

  triggers.forEach(trigger => {
    // Click to open/close
    trigger.addEventListener('mousedown', (e) => {
      if (e.target.closest('.dropdown-menu')) return;
      e.preventDefault();
      if (trigger.classList.contains('open')) {
        closeAllMenus();
      } else {
        openMenu(trigger);
      }
    });

    // Hover to switch when a menu is already open
    trigger.addEventListener('mouseenter', () => {
      if (menuOpen && !trigger.classList.contains('open')) {
        openMenu(trigger);
      }
    });
  });

  // Click outside closes menus
  document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.menu-trigger') && menuOpen) {
      closeAllMenus();
    }
  });

  // Handle menu item clicks (mouseup for classic Mac feel)
  document.addEventListener('mouseup', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item || item.classList.contains('disabled')) return;
    const action = item.dataset.action;
    closeAllMenus();
    if (action) handleMenuAction(action);
  });

  // Touch support: tap items
  document.addEventListener('touchend', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item || item.classList.contains('disabled')) return;
    const action = item.dataset.action;
    closeAllMenus();
    if (action) handleMenuAction(action);
  });
}

// ─── Menu Actions ─────────────────────────────────────────────
function handleMenuAction(action) {
  switch (action) {
    case 'about':
      openAboutDialog();
      break;
    case 'close-window': {
      const active = document.querySelector('.mac-window.active:not(.mac-dialog)');
      if (active) {
        active.classList.add('hidden');
        active.classList.remove('active');
      }
      break;
    }
    case 'shutdown':
      showAlert({
        icon: '⚠️',
        message: 'Are you sure you want to shut down your computer now?',
        buttons: [
          { label: 'Cancel' },
          { label: 'Shut Down', action: doShutDown, isDefault: true },
        ],
      });
      break;
    case 'restart':
      showAlert({
        icon: '🔄',
        message: 'Are you sure you want to restart your computer now?',
        buttons: [
          { label: 'Cancel' },
          { label: 'Restart', action: () => location.reload(), isDefault: true },
        ],
      });
      break;
  }
}

// ─── About Dialog ─────────────────────────────────────────────
function openAboutDialog() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('about-dialog').classList.remove('hidden');
}

function closeAboutDialog() {
  document.getElementById('about-dialog').classList.add('hidden');
  document.getElementById('modal-overlay').classList.add('hidden');
}

function initAboutDialog() {
  document.querySelector('[data-action="close-about"]').addEventListener('click', closeAboutDialog);
  document.getElementById('modal-overlay').addEventListener('click', closeAboutDialog);
}

// ─── Reusable Alert System ────────────────────────────────────
function showAlert({ icon, message, buttons }) {
  const dialog = document.getElementById('alert-dialog');
  const overlay = document.getElementById('modal-overlay');

  // Close about dialog first if it's open
  document.getElementById('about-dialog').classList.add('hidden');

  dialog.querySelector('.alert-icon').textContent = icon || '⚠️';
  dialog.querySelector('.alert-message').textContent = message;

  const btnContainer = dialog.querySelector('.alert-buttons');
  btnContainer.innerHTML = '';

  buttons.forEach(btn => {
    const el = document.createElement('button');
    el.className = 'mac-button' + (btn.isDefault ? ' default-btn' : '');
    el.textContent = btn.label;
    el.addEventListener('click', () => {
      closeAlert();
      if (btn.action) btn.action();
    });
    btnContainer.appendChild(el);
  });

  overlay.classList.remove('hidden');
  dialog.classList.remove('hidden');
}

function closeAlert() {
  document.getElementById('alert-dialog').classList.add('hidden');
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ─── Shut Down ────────────────────────────────────────────────
function doShutDown() {
  const desktop = document.getElementById('desktop');
  const menuBar = document.getElementById('menu-bar');
  const shutdownScreen = document.getElementById('shutdown-screen');

  desktop.style.display = 'none';
  menuBar.style.display = 'none';
  shutdownScreen.classList.remove('hidden');

  // Clear the boot session so next visit boots again
  sessionStorage.removeItem('tuttopassa-booted');

  shutdownScreen.addEventListener('click', () => {
    location.reload();
  }, { once: true });
}

// ─── Webamp Init ──────────────────────────────────────────────
function initWebamp() {
  const Webamp = window.Webamp;
  if (!Webamp || !Webamp.browserIsSupported()) {
    const container = document.getElementById('webamp-container');
    if (container) {
      container.innerHTML =
        '<p style="text-align:center;padding:20px;font-size:12px;">' +
        '&#9888; Your browser does not support Webamp.</p>';
    }
    return;
  }

  const randomSkin = SKIN_LIBRARY.length > 0
    ? SKIN_LIBRARY[Math.floor(Math.random() * SKIN_LIBRARY.length)]
    : null;

  const webamp = new Webamp({
    initialTracks: INITIAL_TRACKS,
    initialSkin: randomSkin ? { url: randomSkin.url } : undefined,
    availableSkins: SKIN_LIBRARY.length > 0 ? SKIN_LIBRARY : undefined,
  });

  webamp.renderWhenReady(document.getElementById('webamp-container'));
}

// ─── Boot Sequence ────────────────────────────────────────────
function runBootSequence(onComplete) {
  const bootScreen = document.getElementById('boot-screen');
  const bootText = document.getElementById('boot-text');
  const bootProgress = document.getElementById('boot-progress');
  const bootBar = document.getElementById('boot-progress-bar');

  // Phase 1: Show TP icon (already visible)
  setTimeout(() => {
    // Phase 2: Show welcome text
    bootText.classList.add('visible');

    setTimeout(() => {
      // Phase 3: Show and fill progress bar
      bootProgress.classList.add('visible');

      requestAnimationFrame(() => {
        bootBar.style.width = '100%';
      });

      setTimeout(() => {
        // Phase 4: Fade out
        bootScreen.classList.add('fade-out');

        setTimeout(() => {
          bootScreen.classList.add('hidden');
          bootScreen.classList.remove('fade-out');
          onComplete();
        }, 500);
      }, 1800);
    }, 800);
  }, 1200);
}

// ─── Main Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Clock starts immediately (visible during boot via menu bar... but menu bar is under boot screen)
  updateClock();
  setInterval(updateClock, 10000);

  const shouldBoot = !sessionStorage.getItem('tuttopassa-booted');

  function initDesktop() {
    initWindowDragging();
    initWindowControls();
    initDesktopIcons();
    initMenuSystem();
    initAboutDialog();
    initWebamp();

    const finderWindow = document.getElementById('finder-window');
    if (finderWindow) bringToFront(finderWindow);
  }

  if (shouldBoot) {
    runBootSequence(() => {
      sessionStorage.setItem('tuttopassa-booted', '1');
      initDesktop();
    });
  } else {
    // Skip boot — hide boot screen immediately and init
    document.getElementById('boot-screen').classList.add('hidden');
    initDesktop();
  }
});
