/* ============================================
   TUTTO PASSA DIGITAL
   Windows ME Desktop - Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initDesktopIcons();
    initStartMenu();
    initPlaylist();
    initTransportControls();
});

/* ============================================
   TASKBAR CLOCK
   ============================================ */
function initClock() {
    const clock = document.querySelector('.tray-clock');
    if (!clock) return;

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        clock.textContent = `${hours}:${minutes} ${ampm}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* ============================================
   DESKTOP ICONS
   ============================================ */
function initDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    let selectedIcon = null;

    icons.forEach(icon => {
        // Single click - select
        icon.addEventListener('click', (e) => {
            if (selectedIcon) {
                selectedIcon.classList.remove('selected');
            }
            icon.classList.add('selected');
            selectedIcon = icon;
        });

        // Double click - navigate
        icon.addEventListener('dblclick', (e) => {
            const href = icon.getAttribute('href');
            if (href && href !== '#') {
                if (href.startsWith('mailto:')) {
                    window.location.href = href;
                } else if (href.startsWith('#')) {
                    // Smooth scroll to section or focus player
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    });

    // Click on desktop to deselect
    document.querySelector('.desktop').addEventListener('click', (e) => {
        if (e.target.classList.contains('desktop') && selectedIcon) {
            selectedIcon.classList.remove('selected');
            selectedIcon = null;
        }
    });
}

/* ============================================
   START MENU (Simple Toggle)
   ============================================ */
function initStartMenu() {
    const startBtn = document.querySelector('.start-btn');
    if (!startBtn) return;

    let menuOpen = false;

    startBtn.addEventListener('click', () => {
        if (menuOpen) {
            startBtn.style.borderStyle = 'outset';
            menuOpen = false;
        } else {
            startBtn.style.borderStyle = 'inset';
            menuOpen = true;
            // Auto close after 2 seconds for demo
            setTimeout(() => {
                startBtn.style.borderStyle = 'outset';
                menuOpen = false;
            }, 2000);
        }
    });
}

/* ============================================
   PLAYLIST INTERACTION
   ============================================ */
function initPlaylist() {
    const tracks = document.querySelectorAll('.track');
    const brandText = document.querySelector('.brand-text');

    tracks.forEach(track => {
        track.addEventListener('click', () => {
            // Remove active from all
            tracks.forEach(t => t.classList.remove('active'));
            // Add active to clicked
            track.classList.add('active');

            // Update brand text with track name
            const trackName = track.querySelector('.track-name').textContent;
            if (brandText) {
                brandText.textContent = trackName.toUpperCase();
            }
        });
    });
}

/* ============================================
   TRANSPORT CONTROLS
   ============================================ */
function initTransportControls() {
    const playBtn = document.querySelector('.btn-play');
    const stopBtn = document.querySelector('.btn-stop');
    const vizBars = document.querySelectorAll('.viz-bar-3d');
    const miniVizBars = document.querySelectorAll('.mini-viz span');

    let isPlaying = true;

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            isPlaying = true;
            vizBars.forEach(bar => {
                bar.style.animationPlayState = 'running';
            });
            miniVizBars.forEach(bar => {
                bar.style.animationPlayState = 'running';
            });
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            isPlaying = false;
            vizBars.forEach(bar => {
                bar.style.animationPlayState = 'paused';
            });
            miniVizBars.forEach(bar => {
                bar.style.animationPlayState = 'paused';
            });
        });
    }

    // Add click feedback to all transport buttons
    const transportBtns = document.querySelectorAll('.transport-btn');
    transportBtns.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'scale(0.95)';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
    });
}

/* ============================================
   WINDOW BUTTON INTERACTION
   ============================================ */
const windowBtns = document.querySelectorAll('.window-btn');
windowBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        windowBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

/* ============================================
   EQUALIZER SLIDERS (Visual Only)
   ============================================ */
const freqSliders = document.querySelectorAll('.freq-fill');
setInterval(() => {
    freqSliders.forEach(slider => {
        const randomHeight = 30 + Math.random() * 70;
        slider.style.height = `${randomHeight}%`;
        slider.style.transition = 'height 0.3s ease';
    });
}, 500);

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */
document.addEventListener('keydown', (e) => {
    // Space to toggle play/pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const playBtn = document.querySelector('.btn-play');
        if (playBtn) playBtn.click();
    }

    // Escape to deselect icons
    if (e.code === 'Escape') {
        const selected = document.querySelector('.desktop-icon.selected');
        if (selected) selected.classList.remove('selected');
    }
});
