/* ============================================
   TUTTO PASSA DIGITAL
   Windows ME Desktop - Interactive Scripts
   ============================================ */

import Webamp from "https://unpkg.com/webamp@^2/butterchurn";

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initDesktopIcons();
    initStartMenu();
    initWebamp();
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
   AUDIO FOLDER SCANNER
   Discovers audio files in the audio folder
   ============================================ */
class AudioScanner {
    static async getFiles() {
        // Try PHP scanner first (works on PHP-enabled servers)
        try {
            const phpResponse = await fetch('audio/scan.php');
            if (phpResponse.ok) {
                const contentType = phpResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const files = await phpResponse.json();
                    if (Array.isArray(files) && files.length > 0) {
                        console.log('Loaded playlist from PHP scanner');
                        return files.filter(f => f.endsWith('.mp3') || f.endsWith('.m4a'));
                    }
                }
            }
        } catch (e) {
            console.log('PHP scanner not available');
        }

        // Try JSON playlist file (for static hosting)
        try {
            const jsonResponse = await fetch('audio/playlist.json');
            if (jsonResponse.ok) {
                const files = await jsonResponse.json();
                if (Array.isArray(files) && files.length > 0) {
                    console.log('Loaded playlist from playlist.json');
                    return files.filter(f => f.endsWith('.mp3') || f.endsWith('.m4a'));
                }
            }
        } catch (e) {
            console.log('playlist.json not available');
        }

        // Auto-discovery: try numbered files (track1.mp3, track2.mp3, etc.)
        console.log('Attempting auto-discovery of numbered tracks...');
        const discovered = [];
        for (let i = 1; i <= 50; i++) {
            const filename = `track${i}.mp3`;
            const exists = await this.fileExists(`audio/${filename}`);
            if (exists) {
                discovered.push(filename);
            } else if (discovered.length > 0) {
                // Stop after first gap
                break;
            }
        }

        if (discovered.length > 0) {
            console.log(`Auto-discovered ${discovered.length} tracks`);
            return discovered;
        }

        console.log('No audio files found');
        return [];
    }

    static async fileExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
}

/* ============================================
   ID3 TAG READER
   Reads metadata from MP3 files
   ============================================ */
class ID3Reader {
    static async readTags(url) {
        try {
            // Fetch the first 10KB of the file (enough for ID3v2 header)
            const response = await fetch(url, {
                headers: { 'Range': 'bytes=0-10240' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const buffer = await response.arrayBuffer();
            const view = new DataView(buffer);

            // Try ID3v2 first (at the beginning of file)
            const id3v2 = this.parseID3v2(view);
            if (id3v2.title) {
                return id3v2;
            }

            // If no ID3v2, try to fetch ID3v1 (last 128 bytes)
            const id3v1 = await this.tryID3v1(url);
            if (id3v1.title) {
                return id3v1;
            }

            // Fall back to filename
            return this.parseFilename(url);
        } catch (error) {
            console.warn('Could not read ID3 tags:', error);
            return this.parseFilename(url);
        }
    }

    static parseID3v2(view) {
        const result = { title: '', artist: '', album: '' };

        // Check for ID3v2 header
        if (view.byteLength < 10) return result;

        const id3 = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
        if (id3 !== 'ID3') return result;

        const majorVersion = view.getUint8(3);

        // Calculate tag size (syncsafe integer)
        const size = (view.getUint8(6) << 21) |
                     (view.getUint8(7) << 14) |
                     (view.getUint8(8) << 7) |
                     view.getUint8(9);

        let offset = 10;
        const end = Math.min(offset + size, view.byteLength);

        // Parse frames
        while (offset < end - 10) {
            // Frame ID (4 bytes for v2.3/v2.4, 3 bytes for v2.2)
            const frameIdLength = majorVersion >= 3 ? 4 : 3;
            let frameId = '';
            for (let i = 0; i < frameIdLength; i++) {
                const char = view.getUint8(offset + i);
                if (char === 0) break;
                frameId += String.fromCharCode(char);
            }

            if (!frameId || frameId[0] === '\0') break;

            let frameSize, headerSize;
            if (majorVersion >= 3) {
                if (majorVersion === 4) {
                    frameSize = (view.getUint8(offset + 4) << 21) |
                                (view.getUint8(offset + 5) << 14) |
                                (view.getUint8(offset + 6) << 7) |
                                view.getUint8(offset + 7);
                } else {
                    frameSize = (view.getUint8(offset + 4) << 24) |
                                (view.getUint8(offset + 5) << 16) |
                                (view.getUint8(offset + 6) << 8) |
                                view.getUint8(offset + 7);
                }
                headerSize = 10;
            } else {
                frameSize = (view.getUint8(offset + 3) << 16) |
                            (view.getUint8(offset + 4) << 8) |
                            view.getUint8(offset + 5);
                headerSize = 6;
            }

            if (frameSize <= 0 || offset + headerSize + frameSize > end) break;

            const frameData = new Uint8Array(view.buffer, offset + headerSize, frameSize);

            if (frameId === 'TIT2' || frameId === 'TT2') {
                result.title = this.decodeTextFrame(frameData);
            } else if (frameId === 'TPE1' || frameId === 'TP1') {
                result.artist = this.decodeTextFrame(frameData);
            } else if (frameId === 'TALB' || frameId === 'TAL') {
                result.album = this.decodeTextFrame(frameData);
            }

            offset += headerSize + frameSize;
        }

        return result;
    }

    static decodeTextFrame(data) {
        if (data.length === 0) return '';

        const encoding = data[0];
        let text = '';
        let start = 1;

        if (encoding === 0) {
            for (let i = start; i < data.length; i++) {
                if (data[i] === 0) break;
                text += String.fromCharCode(data[i]);
            }
        } else if (encoding === 1 || encoding === 2) {
            if (encoding === 1 && data.length >= 3) {
                if ((data[1] === 0xFF && data[2] === 0xFE) ||
                    (data[1] === 0xFE && data[2] === 0xFF)) {
                    start = 3;
                }
            }
            for (let i = start; i < data.length - 1; i += 2) {
                const code = data[i] | (data[i + 1] << 8);
                if (code === 0) break;
                text += String.fromCharCode(code);
            }
        } else if (encoding === 3) {
            const utf8Data = data.slice(start);
            const decoder = new TextDecoder('utf-8');
            text = decoder.decode(utf8Data).replace(/\0.*$/, '');
        }

        return text.trim();
    }

    static async tryID3v1(url) {
        const result = { title: '', artist: '', album: '' };

        try {
            const response = await fetch(url, {
                headers: { 'Range': 'bytes=-128' }
            });

            if (!response.ok) return result;

            const buffer = await response.arrayBuffer();
            const view = new DataView(buffer);

            const tag = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
            if (tag !== 'TAG') return result;

            result.title = this.readFixedString(view, 3, 30);
            result.artist = this.readFixedString(view, 33, 30);
            result.album = this.readFixedString(view, 63, 30);

        } catch (error) {
            console.warn('Could not read ID3v1:', error);
        }

        return result;
    }

    static readFixedString(view, offset, length) {
        let str = '';
        for (let i = 0; i < length; i++) {
            const char = view.getUint8(offset + i);
            if (char === 0) break;
            str += String.fromCharCode(char);
        }
        return str.trim();
    }

    static parseFilename(url) {
        const decoded = decodeURIComponent(url);
        const filename = decoded.split('/').pop().replace(/\.[^.]+$/, '');

        let title = filename
            .replace(/^\d+[\s_.-]+/, '')
            .replace(/[_-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        title = title.replace(/\b\w/g, c => c.toUpperCase());

        return { title, artist: '', album: '' };
    }

    static async getDuration(url) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'metadata';

            audio.onloadedmetadata = () => {
                resolve(audio.duration);
            };

            audio.onerror = () => {
                resolve(null);
            };

            audio.src = url;
        });
    }
}

/* ============================================
   WEBAMP INTEGRATION
   ============================================ */
async function initWebamp() {
    if (!Webamp.browserIsSupported()) {
        console.warn('Webamp is not supported in this browser');
        return;
    }

    const container = document.getElementById('webamp-container');
    if (!container) return;

    // Discover audio files
    const files = await AudioScanner.getFiles();

    // Build initial tracks with metadata
    const initialTracks = [];
    for (const filename of files) {
        const url = `audio/${encodeURIComponent(filename)}`;
        const tags = await ID3Reader.readTags(url);

        initialTracks.push({
            metaData: {
                artist: tags.artist || 'Tutto Passa Digital',
                title: tags.title || filename.replace(/\.[^.]+$/, '')
            },
            url: url
        });
    }

    // Create Webamp instance
    const webamp = new Webamp({
        initialTracks: initialTracks.length > 0 ? initialTracks : [{
            metaData: { artist: 'Tutto Passa Digital', title: 'No tracks found' },
            url: ''
        }],
        enableHotkeys: true,
        enableMediaSession: true,
        zIndex: 100
    });

    // Store globally for external access
    window.webampInstance = webamp;

    // Render Webamp
    await webamp.renderWhenReady(container);

    // Set up taskbar integration
    setupWebampTaskbar(webamp);

    // Set up desktop icon integration
    setupMediaPlayerIcon(webamp);

    // Handle close
    webamp.onClose(() => {
        updateTaskbarButton(false);
    });

    // Handle minimize
    webamp.onMinimize(() => {
        updateTaskbarButton(true);
    });

    // Handle track changes
    webamp.onTrackDidChange((track) => {
        if (track) {
            const text = track.metaData?.title
                ? `${track.metaData.artist || ''} - ${track.metaData.title}`.replace(/^\s*-\s*/, '')
                : 'Winamp';
            updateTaskbarText(text);
        }
    });
}

/* ============================================
   TASKBAR INTEGRATION
   ============================================ */
function setupWebampTaskbar(webamp) {
    const taskbarWindows = document.getElementById('taskbar-windows');
    if (!taskbarWindows) return;

    const btn = document.createElement('button');
    btn.className = 'window-btn active';
    btn.id = 'webamp-taskbar-btn';
    btn.innerHTML = '<span class="win-icon">&#x1f3b5;</span><span class="win-text">Winamp</span>';

    btn.addEventListener('click', () => {
        // Reopen Webamp if it was closed
        const container = document.getElementById('webamp-container');
        if (container && container.children.length === 0) {
            // Re-initialize if fully closed
            initWebamp();
        }
        btn.classList.add('active');
    });

    taskbarWindows.appendChild(btn);
}

function setupMediaPlayerIcon(webamp) {
    const icon = document.getElementById('icon-media-player');
    if (!icon) return;

    icon.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const container = document.getElementById('webamp-container');
        if (container && container.children.length === 0) {
            // Re-initialize if fully closed
            initWebamp();
        }

        updateTaskbarButton(true);
    });
}

function updateTaskbarButton(visible) {
    const btn = document.getElementById('webamp-taskbar-btn');
    if (!btn) return;

    if (visible) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}

function updateTaskbarText(text) {
    const btn = document.getElementById('webamp-taskbar-btn');
    if (!btn) return;

    const winText = btn.querySelector('.win-text');
    if (winText) {
        winText.textContent = text || 'Winamp';
    }
}
