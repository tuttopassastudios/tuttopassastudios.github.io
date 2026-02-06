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

// ─── Game Library ─────────────────────────────────────────────
// Drop .swf files into public/games/ and add entries here.
const GAME_LIBRARY = [
  { url: '/games/interactive_buddy.swf', title: 'Interactive Buddy', aspect: '550 / 400' },
  { url: '/games/impossible_quiz.swf', title: 'The Impossible Quiz', aspect: '550 / 400' },
  { url: '/games/gunblood.swf', title: 'Gunblood', aspect: '720 / 425' },
  { url: '/games/age_of_war.swf', title: 'Age of War', aspect: '800 / 600' },
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

      // Unload game when game window is closed
      if (win.id === 'game-window') {
        const embed = document.getElementById('game-embed');
        if (embed) embed.innerHTML = '';
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
      // Handle action icons (e.g., Stickies creates a new note)
      const actionIcon = icon.dataset.actionIcon;
      if (actionIcon) {
        handleMenuAction(actionIcon);
        return;
      }

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

      // No special handling needed — games load from game list
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
        if (active.id === 'game-window') {
          const embed = document.getElementById('game-embed');
          if (embed) embed.innerHTML = '';
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
    case 'new-message':
      openWindow('mail-window');
      break;
    case 'new-sticky':
      createStickyNote();
      break;
    case 'control-panels':
      openWindow('controlpanel-window');
      break;
    case 'chooser':
      openWindow('chooser-window');
      break;
    case 'buddy-list':
      openWindow('buddy-window');
      break;
  }
}

function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.classList.remove('hidden');
  win.classList.remove('fullscreen');
  bringToFront(win);
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

// ─── Game List Init ───────────────────────────────────────────
function initGameList() {
  const listEl = document.getElementById('game-list');
  if (!listEl) return;

  GAME_LIBRARY.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'game-list-item';
    item.textContent = entry.title;
    item.addEventListener('click', () => {
      loadGame(entry);
    });
    listEl.appendChild(item);
  });
}

function loadGame(entry) {
  const gameWin = document.getElementById('game-window');
  const container = document.getElementById('game-embed');
  if (!gameWin || !container) return;

  // Clear any previous game
  container.innerHTML = '';
  container.style.aspectRatio = entry.aspect;

  const ruffle = window.RufflePlayer?.newest();
  if (!ruffle) return;

  const player = ruffle.createPlayer();
  player.style.width = '100%';
  player.style.height = '100%';
  container.appendChild(player);
  player.load({
    url: entry.url,
    autoplay: 'on',
    letterbox: 'on',
    scale: 'showAll',
    forceScale: true,
    forceAlign: true,
    backgroundColor: '#000000',
  });

  gameWin.querySelector('.title-bar-text').textContent = entry.title;
  gameWin.classList.remove('hidden');
  bringToFront(gameWin);

  // Sync volume to current slider value
  const slider = document.getElementById('game-volume');
  if (slider) applyGameVolume(player, Number(slider.value) / 100);
}

function getGamePlayer() {
  return document.querySelector('#game-embed ruffle-player');
}

function applyGameVolume(player, vol) {
  try { player.ruffle().volume = vol; } catch {}
}

function initGameAudio() {
  const muteBtn = document.getElementById('game-mute-btn');
  const slider = document.getElementById('game-volume');
  if (!muteBtn || !slider) return;

  let savedVolume = 100;

  slider.addEventListener('input', () => {
    const vol = Number(slider.value) / 100;
    const player = getGamePlayer();
    if (player) applyGameVolume(player, vol);
    muteBtn.textContent = vol === 0 ? '\u{1F507}' : vol < 0.5 ? '\u{1F509}' : '\u{1F508}';
  });

  muteBtn.addEventListener('click', () => {
    const player = getGamePlayer();
    if (Number(slider.value) > 0) {
      savedVolume = Number(slider.value);
      slider.value = 0;
    } else {
      slider.value = savedVolume || 100;
    }
    const vol = Number(slider.value) / 100;
    if (player) applyGameVolume(player, vol);
    muteBtn.textContent = vol === 0 ? '\u{1F507}' : vol < 0.5 ? '\u{1F509}' : '\u{1F508}';
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
let IDLE_TIMEOUT = 3 * 60 * 1000; // 3 minutes
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
  if (IDLE_TIMEOUT <= 0) return; // "Never" — don't start screensaver
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
let mouseTrailsEnabled = true;

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
    if (screensaverActive || !mouseTrailsEnabled) return;

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

// ═══════════════════════════════════════════════════════════════
// NEW FEATURES
// ═══════════════════════════════════════════════════════════════

// ─── 1. Tutto Passa Mail ─────────────────────────────────────
function initMail() {
  const sendBtn = document.getElementById('mail-send');
  const clearBtn = document.getElementById('mail-clear');
  if (!sendBtn) return;

  sendBtn.addEventListener('click', () => {
    const from = document.getElementById('mail-from').value.trim();
    const subject = document.getElementById('mail-subject').value.trim();
    const body = document.getElementById('mail-body').value.trim();

    if (!from || !body) {
      showAlert({
        icon: '✉️',
        message: 'Please fill in your name and message before sending.',
        buttons: [{ label: 'OK', isDefault: true }],
      });
      return;
    }

    const mailto = 'mailto:hello@tuttopassastudios.com'
      + '?subject=' + encodeURIComponent(subject || 'Message from ' + from)
      + '&body=' + encodeURIComponent('From: ' + from + '\n\n' + body);
    window.location.href = mailto;

    showAlert({
      icon: '✉️',
      message: 'Your email client should open now. If not, email us directly at hello@tuttopassastudios.com',
      buttons: [{ label: 'OK', isDefault: true }],
    });
  });

  clearBtn.addEventListener('click', () => {
    document.getElementById('mail-from').value = '';
    document.getElementById('mail-subject').value = '';
    document.getElementById('mail-body').value = '';
  });
}

// ─── 2. SimpleText — Services ────────────────────────────────
const SERVICES = [
  {
    icon: '🎵',
    title: 'Music Production',
    description: 'Full-service music production including mixing, mastering, beat-making, and sound design. From concept to final master, we bring your sonic vision to life.',
  },
  {
    icon: '🎨',
    title: 'Design',
    description: 'Brand identity, graphic design, album artwork, and visual content creation. We craft distinctive visuals that tell your story.',
  },
  {
    icon: '💻',
    title: 'Code & Web Development',
    description: 'Custom websites, web applications, and creative coding projects. Modern tech with a distinctive aesthetic — like this site.',
  },
];

function initServices() {
  const list = document.getElementById('services-list');
  if (!list) return;

  SERVICES.forEach(svc => {
    const item = document.createElement('div');
    item.className = 'service-item';

    const header = document.createElement('div');
    header.className = 'service-header';
    header.innerHTML = `<span class="service-arrow">&#9654;</span><span class="service-icon">${svc.icon}</span><span>${svc.title}</span>`;

    const body = document.createElement('div');
    body.className = 'service-body';
    body.innerHTML = `<p>${svc.description}</p><span class="service-quote-link" data-service="${svc.title}">Request a Quote &#8594;</span>`;

    header.addEventListener('click', () => item.classList.toggle('open'));

    body.querySelector('.service-quote-link').addEventListener('click', (e) => {
      e.stopPropagation();
      openWindow('chooser-window');
    });

    item.appendChild(header);
    item.appendChild(body);
    list.appendChild(item);
  });
}

// ─── 3. Buddy List ───────────────────────────────────────────
const BUDDY_GROUPS = [
  {
    name: 'Online',
    buddies: [
      { name: 'Instagram', status: 'online', url: 'https://instagram.com/tuttopassastudios' },
      { name: 'SoundCloud', status: 'online', url: 'https://soundcloud.com/tuttopassastudios' },
      { name: 'GitHub', status: 'online', url: 'https://github.com/tuttopassastudios' },
    ],
  },
  {
    name: 'Away',
    buddies: [
      { name: 'Email', status: 'away', url: '#', action: 'mail' },
      { name: 'Twitter / X', status: 'away', url: 'https://x.com/tuttopassastudio' },
    ],
  },
];

function initBuddyList() {
  const container = document.getElementById('buddy-groups');
  if (!container) return;

  BUDDY_GROUPS.forEach((group, gi) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'buddy-group' + (gi === 0 ? ' open' : '');

    const header = document.createElement('div');
    header.className = 'buddy-group-header';
    header.innerHTML = `<span class="buddy-group-arrow">&#9654;</span><span>${group.name}</span><span class="buddy-group-count">(${group.buddies.length})</span>`;
    header.addEventListener('click', () => groupEl.classList.toggle('open'));

    const items = document.createElement('div');
    items.className = 'buddy-list-items';

    group.buddies.forEach(buddy => {
      const entry = document.createElement('a');
      entry.className = 'buddy-entry';
      entry.href = buddy.url;
      if (buddy.action !== 'mail') {
        entry.target = '_blank';
        entry.rel = 'noopener noreferrer';
      }
      entry.innerHTML = `<span class="buddy-status ${buddy.status}"></span><span class="buddy-name">${buddy.name}</span>`;

      if (buddy.action === 'mail') {
        entry.addEventListener('click', (e) => {
          e.preventDefault();
          openWindow('mail-window');
        });
      }

      items.appendChild(entry);
    });

    groupEl.appendChild(header);
    groupEl.appendChild(items);
    container.appendChild(groupEl);
  });
}

// ─── 4. Guestbook ────────────────────────────────────────────
function initGuestbook() {
  const signBtn = document.getElementById('gb-sign');
  if (!signBtn) return;

  renderGuestbookEntries();

  signBtn.addEventListener('click', () => {
    const name = document.getElementById('gb-name').value.trim();
    const url = document.getElementById('gb-url').value.trim();
    const message = document.getElementById('gb-message').value.trim();

    if (!name || !message) {
      showAlert({
        icon: '📝',
        message: 'Please enter your name and a message.',
        buttons: [{ label: 'OK', isDefault: true }],
      });
      return;
    }

    const entries = safeParseJSON('tuttopassa-guestbook', []);
    entries.unshift({
      name,
      url: url || '',
      message,
      date: new Date().toISOString(),
    });
    // Keep max 50 entries
    if (entries.length > 50) entries.length = 50;
    localStorage.setItem('tuttopassa-guestbook', JSON.stringify(entries));

    document.getElementById('gb-name').value = '';
    document.getElementById('gb-url').value = '';
    document.getElementById('gb-message').value = '';

    renderGuestbookEntries();

    showAlert({
      icon: '📝',
      message: 'Thanks for signing the guestbook!',
      buttons: [{ label: 'OK', isDefault: true }],
    });
  });
}

function renderGuestbookEntries() {
  const container = document.getElementById('gb-entries');
  if (!container) return;

  const entries = safeParseJSON('tuttopassa-guestbook', []);
  container.innerHTML = '';

  if (entries.length === 0) {
    container.innerHTML = '<div class="gb-empty">No entries yet. Be the first to sign!</div>';
    return;
  }

  entries.forEach(entry => {
    const el = document.createElement('div');
    el.className = 'gb-entry';

    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let html = `<div class="gb-entry-header"><span class="gb-entry-name">${escapeHtml(entry.name)}</span><span class="gb-entry-date">${dateStr}</span></div>`;
    html += `<div class="gb-entry-message">${escapeHtml(entry.message)}</div>`;
    if (entry.url && /^https?:\/\//i.test(entry.url)) {
      const safeUrl = escapeHtml(entry.url);
      html += `<div class="gb-entry-url"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a></div>`;
    }

    el.innerHTML = html;
    container.appendChild(el);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function safeParseJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    // Verify the parsed value matches the expected type of the fallback
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'object' && !Array.isArray(fallback) && (typeof parsed !== 'object' || Array.isArray(parsed))) return fallback;
    return parsed;
  } catch (_) {
    return fallback;
  }
}

// ─── 5. Control Panels ──────────────────────────────────────
const DESKTOP_PATTERNS = [
  { name: 'Teal',   colors: ['#5a8a8a', '#70a3a3'] },
  { name: 'Purple', colors: ['#6a5a8a', '#8370a3'] },
  { name: 'Rose',   colors: ['#8a5a6a', '#a37083'] },
  { name: 'Olive',  colors: ['#6a7a5a', '#839370'] },
  { name: 'Slate',  colors: ['#5a6a7a', '#708393'] },
  { name: 'Mono',   colors: ['#666666', '#888888'] },
];

function initControlPanels() {
  const patternsEl = document.getElementById('cp-patterns');
  const trailsCb = document.getElementById('cp-trails');
  const ssTimeoutSel = document.getElementById('cp-ss-timeout');
  const scanlinesCb = document.getElementById('cp-scanlines');
  if (!patternsEl) return;

  // Load saved prefs
  const prefs = safeParseJSON('tuttopassa-prefs', {});

  // Patterns
  DESKTOP_PATTERNS.forEach((pat, i) => {
    const swatch = document.createElement('div');
    swatch.className = 'cp-pattern-swatch';
    swatch.title = pat.name;
    swatch.style.background = `repeating-conic-gradient(${pat.colors[0]} 0% 25%, ${pat.colors[1]} 0% 50%)`;
    swatch.style.backgroundSize = '4px 4px';
    if ((prefs.pattern ?? 0) === i) swatch.classList.add('active');

    swatch.addEventListener('click', () => {
      patternsEl.querySelectorAll('.cp-pattern-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      applyDesktopPattern(i);
      prefs.pattern = i;
      localStorage.setItem('tuttopassa-prefs', JSON.stringify(prefs));
    });

    patternsEl.appendChild(swatch);
  });

  // Apply saved pattern
  if (prefs.pattern != null) applyDesktopPattern(prefs.pattern);

  // Mouse trails
  if (prefs.trails === false) {
    mouseTrailsEnabled = false;
    trailsCb.checked = false;
  }
  trailsCb.addEventListener('change', () => {
    mouseTrailsEnabled = trailsCb.checked;
    prefs.trails = trailsCb.checked;
    localStorage.setItem('tuttopassa-prefs', JSON.stringify(prefs));
  });

  // Screensaver timeout
  if (prefs.ssTimeout != null) {
    IDLE_TIMEOUT = prefs.ssTimeout;
    ssTimeoutSel.value = String(prefs.ssTimeout);
    resetIdleTimer();
  }
  ssTimeoutSel.addEventListener('change', () => {
    IDLE_TIMEOUT = parseInt(ssTimeoutSel.value, 10);
    prefs.ssTimeout = IDLE_TIMEOUT;
    localStorage.setItem('tuttopassa-prefs', JSON.stringify(prefs));
    resetIdleTimer();
  });

  // CRT Scanlines
  if (prefs.scanlines === false) {
    scanlinesCb.checked = false;
    document.querySelectorAll('.crt-scanlines').forEach(el => el.style.display = 'none');
  }
  scanlinesCb.addEventListener('change', () => {
    prefs.scanlines = scanlinesCb.checked;
    localStorage.setItem('tuttopassa-prefs', JSON.stringify(prefs));
    document.querySelectorAll('.crt-scanlines').forEach(el => {
      el.style.display = scanlinesCb.checked ? '' : 'none';
    });
  });
}

function applyDesktopPattern(index) {
  const pat = DESKTOP_PATTERNS[index];
  if (!pat) return;
  const desktop = document.getElementById('desktop');
  desktop.style.backgroundColor = pat.colors[0];
  desktop.style.backgroundImage = `repeating-conic-gradient(${pat.colors[0]} 0% 25%, ${pat.colors[1]} 0% 50%)`;
}

// ─── 6. Stickies ─────────────────────────────────────────────
const STICKY_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple'];
let stickyCount = 0;

function initStickies() {
  loadStickies();
}

function createStickyNote(savedData) {
  const container = document.getElementById('stickies-container');
  if (!container) return;

  // Max 6 stickies
  if (container.children.length >= 6 && !savedData) {
    showAlert({
      icon: '📌',
      message: 'Maximum of 6 sticky notes reached. Close one first.',
      buttons: [{ label: 'OK', isDefault: true }],
    });
    return;
  }

  const color = savedData ? savedData.color : STICKY_COLORS[stickyCount % STICKY_COLORS.length];
  const id = savedData ? savedData.id : 'sticky-' + Date.now();
  stickyCount++;

  const note = document.createElement('div');
  note.className = `sticky-note sticky-${color}`;
  note.id = id;
  note.style.left = savedData ? savedData.x + 'px' : (60 + stickyCount * 20) + 'px';
  note.style.top = savedData ? savedData.y + 'px' : (80 + stickyCount * 20) + 'px';
  note.style.zIndex = ++topZ;

  const titlebar = document.createElement('div');
  titlebar.className = 'sticky-titlebar';

  const closeBtn = document.createElement('div');
  closeBtn.className = 'sticky-close';
  closeBtn.textContent = '\u00D7';
  closeBtn.addEventListener('click', () => {
    note.remove();
    saveStickies();
  });

  titlebar.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'sticky-body';
  body.contentEditable = 'true';
  body.textContent = savedData ? savedData.text : '';
  body.addEventListener('input', () => saveStickies());

  note.appendChild(titlebar);
  note.appendChild(body);
  container.appendChild(note);

  // Dragging
  if (window.innerWidth >= 768) {
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target === closeBtn) return;
      isDragging = true;
      note.style.zIndex = ++topZ;
      const rect = note.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      note.style.left = Math.max(0, origLeft + e.clientX - startX) + 'px';
      note.style.top = Math.max(0, origTop + e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        saveStickies();
      }
    });
  }

  if (!savedData) saveStickies();
}

function saveStickies() {
  const container = document.getElementById('stickies-container');
  if (!container) return;
  const data = [];
  container.querySelectorAll('.sticky-note').forEach(note => {
    const colorClass = [...note.classList].find(c => c.startsWith('sticky-') && c !== 'sticky-note');
    data.push({
      id: note.id,
      color: colorClass ? colorClass.replace('sticky-', '') : 'yellow',
      x: parseInt(note.style.left, 10) || 0,
      y: parseInt(note.style.top, 10) || 0,
      text: note.querySelector('.sticky-body').textContent,
    });
  });
  localStorage.setItem('tuttopassa-stickies', JSON.stringify(data));
}

function loadStickies() {
  const data = safeParseJSON('tuttopassa-stickies', []);
  data.forEach(s => createStickyNote(s));
}

// ─── 7. Chooser — Project Request Wizard ─────────────────────
const CHOOSER_SERVICES = [
  {
    name: 'Music Production',
    subs: ['Mixing', 'Mastering', 'Beat Production', 'Sound Design', 'Recording'],
  },
  {
    name: 'Design',
    subs: ['Brand Identity', 'Album Artwork', 'Graphic Design', 'Social Media Assets', 'Motion Graphics'],
  },
  {
    name: 'Code & Web Development',
    subs: ['Website Design', 'Web Application', 'Landing Page', 'E-commerce', 'Creative Coding'],
  },
];

let chooserState = { step: 0, service: null, subs: [], contact: {} };

function initChooser() {
  const stepsEl = document.getElementById('chooser-steps');
  const nextBtn = document.getElementById('chooser-next');
  const backBtn = document.getElementById('chooser-back');
  if (!stepsEl) return;

  renderChooserStep();

  nextBtn.addEventListener('click', () => {
    if (chooserState.step === 0 && chooserState.service == null) {
      showAlert({ icon: '👆', message: 'Please select a service.', buttons: [{ label: 'OK', isDefault: true }] });
      return;
    }
    if (chooserState.step === 2) {
      const name = document.getElementById('chooser-name');
      const email = document.getElementById('chooser-email');
      if (name && email && (!name.value.trim() || !email.value.trim())) {
        showAlert({ icon: '👆', message: 'Please enter your name and email.', buttons: [{ label: 'OK', isDefault: true }] });
        return;
      }
      chooserState.contact = {
        name: name.value.trim(),
        email: email.value.trim(),
        budget: document.getElementById('chooser-budget').value,
        timeline: document.getElementById('chooser-timeline').value,
        notes: document.getElementById('chooser-notes').value.trim(),
      };
    }
    if (chooserState.step === 3) {
      submitChooser();
      return;
    }
    chooserState.step = Math.min(3, chooserState.step + 1);
    renderChooserStep();
  });

  backBtn.addEventListener('click', () => {
    chooserState.step = Math.max(0, chooserState.step - 1);
    renderChooserStep();
  });
}

function renderChooserStep() {
  const stepsEl = document.getElementById('chooser-steps');
  const progressBar = document.getElementById('chooser-progress-bar');
  const stepLabel = document.getElementById('chooser-step-label');
  const nextBtn = document.getElementById('chooser-next');
  const backBtn = document.getElementById('chooser-back');

  const step = chooserState.step;
  progressBar.style.width = ((step + 1) * 25) + '%';
  stepLabel.textContent = `Step ${step + 1} of 4`;
  backBtn.disabled = step === 0;
  nextBtn.textContent = step === 3 ? 'Submit' : 'Next';

  stepsEl.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'chooser-step active';

  if (step === 0) {
    div.innerHTML = '<h2>What service do you need?</h2>';
    CHOOSER_SERVICES.forEach((svc, i) => {
      const opt = document.createElement('div');
      opt.className = 'chooser-option' + (chooserState.service === i ? ' selected' : '');
      opt.innerHTML = `<input type="radio" name="chooser-svc" ${chooserState.service === i ? 'checked' : ''} /><span>${svc.name}</span>`;
      opt.addEventListener('click', () => {
        chooserState.service = i;
        chooserState.subs = [];
        stepsEl.querySelectorAll('.chooser-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        opt.querySelector('input').checked = true;
      });
      div.appendChild(opt);
    });
  } else if (step === 1) {
    const svc = CHOOSER_SERVICES[chooserState.service];
    div.innerHTML = `<h2>${svc.name} — What do you need?</h2>`;
    svc.subs.forEach((sub, i) => {
      const opt = document.createElement('div');
      opt.className = 'chooser-option' + (chooserState.subs.includes(i) ? ' selected' : '');
      opt.innerHTML = `<input type="checkbox" ${chooserState.subs.includes(i) ? 'checked' : ''} /><span>${sub}</span>`;
      opt.addEventListener('click', () => {
        const idx = chooserState.subs.indexOf(i);
        if (idx >= 0) {
          chooserState.subs.splice(idx, 1);
          opt.classList.remove('selected');
          opt.querySelector('input').checked = false;
        } else {
          chooserState.subs.push(i);
          opt.classList.add('selected');
          opt.querySelector('input').checked = true;
        }
      });
      div.appendChild(opt);
    });
  } else if (step === 2) {
    div.innerHTML = `<h2>Tell us about your project</h2>
      <div class="chooser-form-field"><label>Name *</label><input type="text" id="chooser-name" value="${escapeHtml(chooserState.contact.name || '')}" /></div>
      <div class="chooser-form-field"><label>Email *</label><input type="email" id="chooser-email" value="${escapeHtml(chooserState.contact.email || '')}" /></div>
      <div class="chooser-form-field"><label>Budget</label><select id="chooser-budget">
        <option value="">Select...</option>
        <option value="< $500">Under $500</option>
        <option value="$500 - $1000">$500 – $1,000</option>
        <option value="$1000 - $5000">$1,000 – $5,000</option>
        <option value="$5000+">$5,000+</option>
      </select></div>
      <div class="chooser-form-field"><label>Timeline</label><select id="chooser-timeline">
        <option value="">Select...</option>
        <option value="ASAP">ASAP</option>
        <option value="1-2 weeks">1–2 weeks</option>
        <option value="1 month">1 month</option>
        <option value="Flexible">Flexible</option>
      </select></div>
      <div class="chooser-form-field"><label>Notes</label><textarea id="chooser-notes" rows="3" placeholder="Anything else we should know?">${escapeHtml(chooserState.contact.notes || '')}</textarea></div>`;

    // Restore budget/timeline selections
    setTimeout(() => {
      if (chooserState.contact.budget) document.getElementById('chooser-budget').value = chooserState.contact.budget;
      if (chooserState.contact.timeline) document.getElementById('chooser-timeline').value = chooserState.contact.timeline;
    }, 0);
  } else if (step === 3) {
    const svc = CHOOSER_SERVICES[chooserState.service];
    const subNames = chooserState.subs.map(i => svc.subs[i]).join(', ') || 'None selected';
    div.innerHTML = `<h2>Review Your Request</h2>
      <dl class="chooser-review">
        <dt>Service</dt><dd>${svc.name}</dd>
        <dt>Details</dt><dd>${subNames}</dd>
        <dt>Name</dt><dd>${escapeHtml(chooserState.contact.name)}</dd>
        <dt>Email</dt><dd>${escapeHtml(chooserState.contact.email)}</dd>
        <dt>Budget</dt><dd>${escapeHtml(chooserState.contact.budget) || 'Not specified'}</dd>
        <dt>Timeline</dt><dd>${escapeHtml(chooserState.contact.timeline) || 'Not specified'}</dd>
        <dt>Notes</dt><dd>${escapeHtml(chooserState.contact.notes) || 'None'}</dd>
      </dl>`;
  }

  stepsEl.appendChild(div);
}

function submitChooser() {
  const svc = CHOOSER_SERVICES[chooserState.service];
  const subNames = chooserState.subs.map(i => svc.subs[i]).join(', ') || 'None selected';
  const c = chooserState.contact;

  const subject = `Project Request: ${svc.name}`;
  const body = `Service: ${svc.name}\nDetails: ${subNames}\n\nName: ${c.name}\nEmail: ${c.email}\nBudget: ${c.budget || 'Not specified'}\nTimeline: ${c.timeline || 'Not specified'}\nNotes: ${c.notes || 'None'}`;

  const mailto = 'mailto:hello@tuttopassastudios.com'
    + '?subject=' + encodeURIComponent(subject)
    + '&body=' + encodeURIComponent(body);
  window.location.href = mailto;

  showAlert({
    icon: '📋',
    message: 'Your email client should open with the project request. Thanks for reaching out!',
    buttons: [{ label: 'OK', isDefault: true, action: () => {
      chooserState = { step: 0, service: null, subs: [], contact: {} };
      renderChooserStep();
    }}],
  });
}

// ─── 8. Easter Egg — Breakout Game ───────────────────────────
let breakoutGame = null;
let easterEggBuffer = '';

function initEasterEgg() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger if typing in a field
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.contentEditable === 'true') return;

    easterEggBuffer += e.key.toLowerCase();
    if (easterEggBuffer.length > 10) easterEggBuffer = easterEggBuffer.slice(-10);

    if (easterEggBuffer.endsWith('game')) {
      easterEggBuffer = '';
      openWindow('breakout-window');
      startBreakout();
    }
  });
}

function initBreakoutWindow() {
  const startOverlay = document.getElementById('breakout-start');
  if (!startOverlay) return;

  // Load high score
  const hi = parseInt(localStorage.getItem('tuttopassa-breakout-hi') || '0', 10);
  document.getElementById('breakout-high').textContent = 'High: ' + hi;

  startOverlay.addEventListener('click', () => {
    startBreakout();
  });
}

function startBreakout() {
  const canvas = document.getElementById('breakout-canvas');
  const ctx = canvas.getContext('2d');
  const startOverlay = document.getElementById('breakout-start');
  startOverlay.classList.add('hidden');

  // Stop previous game loop
  if (breakoutGame) cancelAnimationFrame(breakoutGame);

  const W = canvas.width;
  const H = canvas.height;

  // Game state
  const paddle = { x: W / 2 - 30, y: H - 20, w: 60, h: 8 };
  const ball = { x: W / 2, y: H - 35, dx: 2.5, dy: -2.5, r: 5 };
  let score = 0;
  let lives = 3;

  // Bricks
  const COLS = 8;
  const ROWS = 5;
  const BRICK_W = (W - 20) / COLS;
  const BRICK_H = 14;
  const bricks = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({ x: 10 + c * BRICK_W, y: 30 + r * (BRICK_H + 2), w: BRICK_W - 2, h: BRICK_H, alive: true });
    }
  }

  // Audio context for bleeps
  let audioCtx = null;
  function bleep(freq, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (_) {}
  }

  // Mouse/touch control
  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    paddle.x = Math.max(0, Math.min(W - paddle.w, (clientX - rect.left) * (W / rect.width) - paddle.w / 2));
  }
  function onTouchMove(e) { e.preventDefault(); onMove(e); }
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });

  function updateHUD() {
    document.getElementById('breakout-score').textContent = 'Score: ' + score;
    document.getElementById('breakout-lives').textContent = 'Lives: ' + lives;
  }

  function gameOver(won) {
    cancelAnimationFrame(breakoutGame);
    breakoutGame = null;

    const hi = Math.max(score, parseInt(localStorage.getItem('tuttopassa-breakout-hi') || '0', 10));
    localStorage.setItem('tuttopassa-breakout-hi', String(hi));
    document.getElementById('breakout-high').textContent = 'High: ' + hi;

    ctx.fillStyle = '#fff';
    ctx.font = "bold 16px 'Chicago', 'Geneva', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(won ? 'YOU WIN!' : 'GAME OVER', W / 2, H / 2);
    ctx.font = "12px 'Chicago', 'Geneva', sans-serif";
    ctx.fillText('Score: ' + score, W / 2, H / 2 + 20);

    startOverlay.classList.remove('hidden');
    startOverlay.textContent = 'Click to Retry';

    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('touchmove', onTouchMove);
  }

  function loop() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Draw bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // Draw paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall bouncing
    if (ball.x - ball.r <= 0 || ball.x + ball.r >= W) {
      ball.dx = -ball.dx;
      bleep(300, 0.05);
    }
    if (ball.y - ball.r <= 0) {
      ball.dy = -ball.dy;
      bleep(300, 0.05);
    }

    // Bottom — lose life
    if (ball.y + ball.r >= H) {
      lives--;
      updateHUD();
      if (lives <= 0) {
        gameOver(false);
        return;
      }
      bleep(150, 0.2);
      ball.x = W / 2;
      ball.y = H - 35;
      ball.dx = 2.5 * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = -2.5;
    }

    // Paddle collision
    if (ball.dy > 0 && ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
      ball.dy = -ball.dy;
      // Angle based on hit position
      const hitPos = (ball.x - paddle.x) / paddle.w;
      ball.dx = 4 * (hitPos - 0.5);
      bleep(440, 0.05);
    }

    // Brick collision
    let allDead = true;
    bricks.forEach(b => {
      if (!b.alive) return;
      allDead = false;
      if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
          ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
        b.alive = false;
        ball.dy = -ball.dy;
        score += 10;
        updateHUD();
        bleep(660, 0.05);
      }
    });

    if (allDead) {
      gameOver(true);
      return;
    }

    breakoutGame = requestAnimationFrame(loop);
  }

  updateHUD();
  loop();
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
    initGameList();
    initGameAudio();
    initWebamp();
    initHitCounter();
    initMouseTrails();
    initScreenSaver();

    // New features
    initMail();
    initServices();
    initBuddyList();
    initGuestbook();
    initControlPanels();
    initStickies();
    initChooser();
    initBreakoutWindow();
    initEasterEgg();

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
