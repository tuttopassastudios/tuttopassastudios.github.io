// CSS is linked directly in index.html so it loads even without a bundler.
// Webamp is loaded via CDN <script> in index.html (window.Webamp).

// ─── Placeholder Tracks ───────────────────────────────────────
const INITIAL_TRACKS = [
  {
    metaData: {
      artist: 'Tutto Passa Studios',
      title: 'Don\'t Trust Me V2',
    },
    url: '/audio/DONT TRUST ME V2.m4a',
  },
  {
    metaData: {
      artist: 'Tutto Passa Studios',
      title: 'Just Can\'t Get Enough V2',
    },
    url: '/audio/JUST CANT GET ENOUGH V2.m4a',
  },
  {
    metaData: {
      artist: 'Tutto Passa Studios',
      title: 'slave4u v2',
    },
    url: '/audio/slave4u v2.m4a',
  },
];

// ─── Video Library ────────────────────────────────────────────
// Drop .mp4 files into public/video/ and add entries here.
const VIDEO_LIBRARY = [
  { url: '/video/Inflated Logo 001.mp4', title: 'Inflated Logo 001' },
  { url: '/video/RING LOGO TUTTO PASSA 01.mp4', title: 'Ring Logo Tutto Passa 01' },
  { url: '/video/STROBE NEON SIGN.mp4', title: 'Strobe Neon Sign' },
];

// ─── Skin Library ─────────────────────────────────────────────
// Drop .wsz files into public/skins/ and add entries here.
const SKIN_LIBRARY = [
  { url: '/skins/AlexAmp_Black_Paper.wsz', name: 'AlexAmp Black Paper' },
  { url: '/skins/dexter_amp.wsz', name: 'Dexter Amp' },
  { url: '/skins/For_The_Birds.wsz', name: 'For The Birds' },
  { url: '/skins/NapsterAmp.wsz', name: 'NapsterAmp' },
  { url: '/skins/PSXkin.wsz', name: 'PSXkin' },
  { url: '/skins/slimshdy.wsz', name: 'Slim Shady' },
  { url: '/skins/the_Neverhood_amp.wsz', name: 'The Neverhood' },
  { url: '/skins/Zilver_Chrome.wsz', name: 'Zilver Chrome' },
  { url: '/skins/Porsche_2000_-_911_Turbo.wsz', name: 'Porsche 911 Turbo' },
  { url: '/skins/peasncarrots.wsz', name: 'Peas N Carrots' },
  { url: '/skins/bttf.wsz', name: 'Back to the Future' },
  { url: '/skins/Metasoft_Archangel.wsz', name: 'Metasoft Archangel' },
  { url: '/skins/Nicks_Memory.wsz', name: 'Nicks Memory' },
  { url: '/skins/Powerpuff_Girls_Redux.wsz', name: 'Powerpuff Girls Redux' },
  { url: '/skins/Windows_like_Amp.wsz', name: 'Windows Like Amp' },
  { url: '/skins/Garungaha2.wsz', name: 'Garungaha 2' },
  { url: '/skins/Dread-Snake.wsz', name: 'Dread Snake' },
  { url: '/skins/d2bnet.wsz', name: 'D2BNet' },
  { url: '/skins/WindowsXP.wsz', name: 'Windows XP' },
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

      // Stop video when TV window is closed
      if (win.id === 'tv-window') {
        const video = document.getElementById('tv-player');
        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load();
        }
      }
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

      // Webamp: toggle visibility
      if (targetId === 'webamp-container') {
        win.classList.toggle('hidden');
        return;
      }

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
        if (active.id === 'tv-window') {
          const video = document.getElementById('tv-player');
          if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
          }
        }
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
  const ticker = document.getElementById('ticker-bar');
  const shutdownScreen = document.getElementById('shutdown-screen');

  // Stop screensaver if active
  if (screensaverActive) stopScreenSaver();
  clearTimeout(idleTimer);

  desktop.style.display = 'none';
  menuBar.style.display = 'none';
  if (ticker) ticker.style.display = 'none';
  shutdownScreen.classList.remove('hidden');

  // Clear the boot session so next visit boots again
  sessionStorage.removeItem('tuttopassa-booted');

  shutdownScreen.addEventListener('click', () => {
    location.reload();
  }, { once: true });
}

// ─── Video List Init ──────────────────────────────────────────
function initVideoList() {
  const listEl = document.getElementById('video-list');
  if (!listEl) return;

  VIDEO_LIBRARY.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'video-list-item';
    item.textContent = entry.title;
    item.addEventListener('click', () => {
      const tvWin = document.getElementById('tv-window');
      const video = document.getElementById('tv-player');
      if (!tvWin || !video) return;

      video.src = entry.url;
      video.load();
      tvWin.querySelector('.title-bar-text').textContent = entry.title;
      tvWin.classList.remove('hidden');
      bringToFront(tvWin);
      video.play();
    });
    listEl.appendChild(item);
  });
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

  document.body.classList.add('cursor-wait');

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
          document.body.classList.remove('cursor-wait');
          onComplete();
        }, 500);
      }, 1800);
    }, 800);
  }, 1200);
}

// ─── Screen Saver ─────────────────────────────────────────────
let screensaverActive = false;
const IDLE_TIMEOUT = 3 * 60 * 1000; // 3 minutes
let idleTimer = null;
let ssAnimFrame = null;

function startScreenSaver() {
  if (window.innerWidth < 768) return;

  const canvas = document.getElementById('screensaver');
  if (!canvas) return;

  canvas.classList.remove('hidden');
  screensaverActive = true;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const text = 'TP';
  const fontSize = 60;
  ctx.font = `bold ${fontSize}px 'Geneva', sans-serif`;
  const textWidth = ctx.measureText(text).width;
  const textHeight = fontSize;

  let x = Math.random() * (canvas.width - textWidth);
  let y = Math.random() * (canvas.height - textHeight) + textHeight;
  let dx = 2;
  let dy = 2;

  const colors = ['#669999', '#ff6666', '#66cc66', '#cc66cc', '#ffcc33', '#6699ff', '#ff9933'];
  let colorIndex = 0;

  function animate() {
    // Trail fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `bold ${fontSize}px 'Geneva', sans-serif`;
    ctx.fillStyle = colors[colorIndex];
    ctx.fillText(text, x, y);

    x += dx;
    y += dy;

    // Bounce off walls
    if (x + textWidth >= canvas.width || x <= 0) {
      dx = -dx;
      colorIndex = (colorIndex + 1) % colors.length;
    }
    if (y >= canvas.height || y - textHeight <= 0) {
      dy = -dy;
      colorIndex = (colorIndex + 1) % colors.length;
    }

    ssAnimFrame = requestAnimationFrame(animate);
  }

  animate();
}

function stopScreenSaver() {
  const canvas = document.getElementById('screensaver');
  if (canvas) canvas.classList.add('hidden');
  screensaverActive = false;
  if (ssAnimFrame) {
    cancelAnimationFrame(ssAnimFrame);
    ssAnimFrame = null;
  }
  resetIdleTimer();
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (window.innerWidth < 768) return;
  idleTimer = setTimeout(startScreenSaver, IDLE_TIMEOUT);
}

function initScreenSaver() {
  if (window.innerWidth < 768) return;

  const dismiss = () => {
    if (screensaverActive) stopScreenSaver();
    else resetIdleTimer();
  };

  document.addEventListener('mousemove', dismiss);
  document.addEventListener('mousedown', dismiss);
  document.addEventListener('keydown', dismiss);

  resetIdleTimer();
}

// ─── Mouse Trails ─────────────────────────────────────────────
function initMouseTrails() {
  // Skip on touch/mobile devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const POOL_SIZE = 20;
  const THROTTLE_MS = 50;
  const dots = [];

  for (let i = 0; i < POOL_SIZE; i++) {
    const dot = document.createElement('div');
    dot.className = 'mouse-trail-dot';
    document.body.appendChild(dot);
    dots.push(dot);
  }

  let index = 0;
  let lastTime = 0;

  document.addEventListener('mousemove', (e) => {
    if (screensaverActive) return;

    const now = Date.now();
    if (now - lastTime < THROTTLE_MS) return;
    lastTime = now;

    const dot = dots[index % POOL_SIZE];
    index++;

    // Reset and position
    dot.style.transition = 'none';
    dot.style.opacity = '0.8';
    dot.style.transform = 'scale(1)';
    dot.style.left = (e.clientX - 4) + 'px';
    dot.style.top = (e.clientY - 4) + 'px';

    // Force reflow then animate out
    dot.offsetHeight;
    dot.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    dot.style.opacity = '0';
    dot.style.transform = 'scale(0.2)';
  });
}

// ─── Hit Counter ──────────────────────────────────────────────
function initHitCounter() {
  const BASE = 13827;
  let visits = parseInt(localStorage.getItem('tuttopassa-hits') || '0', 10);
  visits += 1;
  localStorage.setItem('tuttopassa-hits', String(visits));
  const count = String(BASE + visits).padStart(6, '0');

  const el = document.getElementById('hit-counter');
  if (el) el.textContent = count;

  // Also update ticker bar visitor counters
  document.querySelectorAll('.ticker-counter').forEach(s => {
    s.textContent = count;
  });
}

// ─── Main Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Clock starts immediately
  updateClock();
  setInterval(updateClock, 10000);

  const shouldBoot = !sessionStorage.getItem('tuttopassa-booted');

  function initDesktop() {
    initWindowDragging();
    initWindowControls();
    initDesktopIcons();
    initMenuSystem();
    initAboutDialog();
    initVideoList();
    initWebamp();
    initHitCounter();
    initMouseTrails();
    initScreenSaver();

    const finderWindow = document.getElementById('finder-window');
    if (finderWindow) bringToFront(finderWindow);
  }

  if (shouldBoot) {
    // First visit — show click-to-start overlay
    const overlay = document.getElementById('click-to-start');
    overlay.classList.remove('hidden');

    overlay.addEventListener('click', () => {
      // Play startup chime (satisfies autoplay policy)
      const chime = new Audio('/audio/startup.mp3');
      chime.play().catch(() => {});

      overlay.classList.add('hidden');

      runBootSequence(() => {
        sessionStorage.setItem('tuttopassa-booted', '1');
        initDesktop();
      });
    }, { once: true });
  } else {
    // Revisit — skip click-to-start and boot
    document.getElementById('boot-screen').classList.add('hidden');
    initDesktop();
  }
});
