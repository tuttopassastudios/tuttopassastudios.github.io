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

  const webamp = new Webamp({
    initialTracks: INITIAL_TRACKS,
    availableSkins: SKIN_LIBRARY.length > 0 ? SKIN_LIBRARY : undefined,
  });

  webamp.renderWhenReady(document.getElementById('webamp-container'));
}

// ─── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 10000);

  initWindowDragging();
  initWindowControls();
  initDesktopIcons();
  initWebamp();

  const finderWindow = document.getElementById('finder-window');
  if (finderWindow) bringToFront(finderWindow);
});
