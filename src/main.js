import './style.css';
import Webamp from 'webamp';

// ─── Placeholder Tracks ───────────────────────────────────────
// Drop your .mp3 files into public/audio/ and update this array.
const INITIAL_TRACKS = [
  {
    metaData: {
      artist: 'Tutto Passa Studios',
      title: 'Just Can\'t Get Enough V2',
    },
    url: '/audio/JUST CANT GET ENOUGH V2.m4a',
  },
];

// ─── Hit Counter Animation ────────────────────────────────────
function animateHitCounter() {
  const el = document.getElementById('hit-count');
  if (!el) return;
  const target = 8_675_309 + Math.floor(Math.random() * 1000);
  let current = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString();
    if (current >= target) clearInterval(interval);
  }, 30);
}

// ─── Webamp Init ──────────────────────────────────────────────
function initWebamp() {
  if (!Webamp.browserIsSupported()) {
    const container = document.getElementById('webamp-container');
    if (container) {
      container.innerHTML =
        '<p style="color:#ff0000;text-align:center;padding:20px;font-size:16px;">' +
        '&#9888; Your browser does not support Webamp.<br>' +
        'Please upgrade to Netscape Navigator 4.0 or Internet Explorer 5.5!</p>';
    }
    return;
  }

  const webamp = new Webamp({
    initialTracks: INITIAL_TRACKS,
  });

  webamp.renderWhenReady(document.getElementById('webamp-container'));
}

// ─── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  animateHitCounter();
  initWebamp();
});
