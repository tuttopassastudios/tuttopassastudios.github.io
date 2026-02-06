/* ============================================
   TUTTO PASSA DIGITAL
   Windows ME Desktop - Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initDesktopIcons();
    initStartMenu();
    initAudioPlayer();
    initWindowButtons();
    initKeyboardShortcuts();
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
   Discovers MP3 files in the audio folder
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
                        return files.filter(f => f.endsWith('.mp3'));
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
                    return files.filter(f => f.endsWith('.mp3'));
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
        const filename = url.split('/').pop().replace(/\.[^.]+$/, '');

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
   AUDIO PLAYER CLASS
   ============================================ */
class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;

        // UI Elements
        this.playBtn = document.querySelector('.btn-play');
        this.stopBtn = document.querySelector('.btn-stop');
        this.prevBtn = document.querySelector('.btn-prev');
        this.nextBtn = document.querySelector('.btn-next');
        this.rewindBtn = document.querySelector('.btn-rewind');
        this.forwardBtn = document.querySelector('.btn-forward');
        this.progressBar = document.getElementById('progress-bar');
        this.currentTimeEl = document.querySelector('.current-time');
        this.totalTimeEl = document.querySelector('.total-time');
        this.brandText = document.querySelector('.brand-text');
        this.mediaPlayer = document.querySelector('.media-player');
        this.volumeThumb = document.getElementById('volume-thumb');
        this.volumeControl = document.getElementById('volume-control');
        this.playlistContainer = document.querySelector('.playlist-tracks');

        // Visualizer elements
        this.vizBars = document.querySelectorAll('.viz-bar-3d');
        this.miniVizBars = document.querySelectorAll('.mini-viz span');
        this.freqSliders = document.querySelectorAll('.freq-fill');

        // EQ animation interval
        this.eqInterval = null;

        this.init();
    }

    async init() {
        await this.scanAndBuildPlaylist();
        this.bindEvents();
        this.bindAudioEvents();
        this.initVolumeControl();

        // Set initial volume
        this.audio.volume = 0.8;

        // Start in paused state
        this.updateVisualizerState(false);
    }

    async scanAndBuildPlaylist() {
        // Clear existing content
        this.playlistContainer.innerHTML = '<div class="track-loading">Scanning for tracks...</div>';

        // Scan for audio files
        const files = await AudioScanner.getFiles();

        if (files.length === 0) {
            this.playlistContainer.innerHTML = '<div class="track-loading">No tracks found. Add MP3 files to /audio/</div>';
            return;
        }

        // Clear loading message
        this.playlistContainer.innerHTML = '';

        // Create track elements
        for (let i = 0; i < files.length; i++) {
            const filename = files[i];
            const src = `audio/${filename}`;

            // Create track element
            const trackEl = document.createElement('div');
            trackEl.className = 'track' + (i === 0 ? ' active' : '');
            trackEl.dataset.src = src;
            trackEl.innerHTML = `
                <span class="track-name">Loading...</span>
                <span class="track-time">--:--</span>
            `;

            this.playlistContainer.appendChild(trackEl);

            const trackNameEl = trackEl.querySelector('.track-name');
            const trackTimeEl = trackEl.querySelector('.track-time');

            // Add to playlist
            this.playlist.push({
                element: trackEl,
                src: src,
                name: 'Loading...',
                duration: '--:--',
                trackNameEl: trackNameEl,
                trackTimeEl: trackTimeEl
            });

            // Click handler
            const index = i;
            trackEl.addEventListener('click', () => {
                this.loadTrack(index);
                this.play();
            });

            // Load metadata asynchronously
            this.loadTrackMetadata(i, src);
        }

        // Update initial display with first track name (after short delay for metadata)
        setTimeout(() => {
            if (this.playlist.length > 0 && this.playlist[0].name !== 'Loading...') {
                this.brandText.textContent = this.playlist[0].name.toUpperCase();
                this.totalTimeEl.textContent = this.playlist[0].duration;
            }
        }, 500);
    }

    async loadTrackMetadata(index, src) {
        try {
            // Load ID3 tags
            const tags = await ID3Reader.readTags(src);

            // Load duration
            const durationSeconds = await ID3Reader.getDuration(src);
            const duration = durationSeconds ? this.formatTime(durationSeconds) : '--:--';

            // Update playlist entry
            const track = this.playlist[index];
            track.name = tags.title || this.parseFilename(src);
            track.artist = tags.artist || '';
            track.album = tags.album || '';
            track.duration = duration;

            // Update UI
            track.trackNameEl.textContent = track.name;
            track.trackTimeEl.textContent = duration;

            // If this is the first track and it's active, update brand text
            if (index === 0 && track.element.classList.contains('active')) {
                this.brandText.textContent = track.name.toUpperCase();
                this.totalTimeEl.textContent = duration;
            }

        } catch (error) {
            console.warn(`Failed to load metadata for track ${index}:`, error);

            const track = this.playlist[index];
            track.name = this.parseFilename(src);
            track.trackNameEl.textContent = track.name;
        }
    }

    parseFilename(url) {
        const filename = url.split('/').pop().replace(/\.[^.]+$/, '');
        return filename
            .replace(/^\d+[\s_.-]+/, '')
            .replace(/[_-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    bindEvents() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }

        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stop());
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previous());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        if (this.rewindBtn) {
            this.rewindBtn.addEventListener('click', () => this.seek(this.audio.currentTime - 10));
        }

        if (this.forwardBtn) {
            this.forwardBtn.addEventListener('click', () => this.seek(this.audio.currentTime + 10));
        }

        if (this.progressBar) {
            this.progressBar.addEventListener('input', (e) => {
                const percent = e.target.value;
                const time = (percent / 100) * this.audio.duration;
                if (!isNaN(time)) {
                    this.seek(time);
                }
            });
        }

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

    bindAudioEvents() {
        this.audio.addEventListener('timeupdate', () => {
            this.updateTimeDisplay();
            this.updateProgressBar();
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
        });

        this.audio.addEventListener('ended', () => {
            this.next();
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
            this.updateVisualizerState(true);
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
            this.updateVisualizerState(false);
        });

        this.audio.addEventListener('error', (e) => {
            console.warn('Audio playback error:', e);
            this.handlePlaybackError();
        });
    }

    initVolumeControl() {
        if (!this.volumeControl || !this.volumeThumb) return;

        const sliderTrack = this.volumeControl.querySelector('.slider-track');
        if (!sliderTrack) return;

        let isDragging = false;

        const updateVolume = (e) => {
            const rect = sliderTrack.getBoundingClientRect();
            const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
            const percent = y / rect.height;

            const volume = 1 - percent;
            this.setVolume(volume);

            this.volumeThumb.style.top = `${percent * 100}%`;
        };

        sliderTrack.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateVolume(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateVolume(e);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        const track = this.playlist[index];

        this.playlist.forEach(t => t.element.classList.remove('active'));
        track.element.classList.add('active');

        if (this.brandText) {
            this.brandText.textContent = track.name.toUpperCase();
        }

        if (track.src) {
            this.audio.src = track.src;
            this.audio.load();
        }

        this.currentTimeEl.textContent = '0:00';
        this.totalTimeEl.textContent = track.duration || '0:00';

        if (this.progressBar) {
            this.progressBar.value = 0;
        }
    }

    play() {
        if (this.playlist.length === 0) {
            console.log('No tracks to play');
            return;
        }

        if (this.audio.src) {
            this.audio.play().catch(err => {
                console.warn('Playback failed:', err);
                this.handlePlaybackError();
            });
        } else {
            this.loadTrack(0);
            this.audio.play().catch(err => {
                console.warn('Playback failed:', err);
                this.handlePlaybackError();
            });
        }
    }

    pause() {
        this.audio.pause();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayButton();
        this.updateVisualizerState(false);
        this.currentTimeEl.textContent = '0:00';
        if (this.progressBar) {
            this.progressBar.value = 0;
        }
    }

    next() {
        if (this.playlist.length === 0) return;
        const nextIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadTrack(nextIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    previous() {
        if (this.playlist.length === 0) return;
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            const prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            this.loadTrack(prevIndex);
            if (this.isPlaying) {
                this.play();
            }
        }
    }

    seek(time) {
        if (!isNaN(this.audio.duration)) {
            this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
        }
    }

    setVolume(level) {
        this.audio.volume = Math.max(0, Math.min(1, level));
    }

    updateTimeDisplay() {
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }

    updateProgressBar() {
        if (this.progressBar && this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.value = percent;
        }
    }

    updatePlayButton() {
        if (!this.playBtn) return;

        if (this.isPlaying) {
            this.playBtn.textContent = '⏸';
            this.playBtn.title = 'Pause';
            this.playBtn.classList.add('playing');
        } else {
            this.playBtn.textContent = '▶';
            this.playBtn.title = 'Play';
            this.playBtn.classList.remove('playing');
        }
    }

    updateVisualizerState(playing) {
        if (this.mediaPlayer) {
            if (playing) {
                this.mediaPlayer.classList.remove('audio-paused');
                this.startEqAnimation();
            } else {
                this.mediaPlayer.classList.add('audio-paused');
                this.stopEqAnimation();
            }
        }

        const state = playing ? 'running' : 'paused';

        this.vizBars.forEach(bar => {
            bar.style.animationPlayState = state;
        });

        this.miniVizBars.forEach(bar => {
            bar.style.animationPlayState = state;
        });
    }

    startEqAnimation() {
        if (this.eqInterval) return;

        this.eqInterval = setInterval(() => {
            this.freqSliders.forEach(slider => {
                const randomHeight = 30 + Math.random() * 70;
                slider.style.height = `${randomHeight}%`;
                slider.style.transition = 'height 0.3s ease';
            });
        }, 500);
    }

    stopEqAnimation() {
        if (this.eqInterval) {
            clearInterval(this.eqInterval);
            this.eqInterval = null;
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    handlePlaybackError() {
        console.log('Audio file not found. Add MP3 files to the /audio/ folder.');

        this.updateVisualizerState(true);
        this.isPlaying = true;
        this.updatePlayButton();

        this.simulatePlayback();
    }

    simulatePlayback() {
        let simulatedTime = 0;
        const trackDuration = this.parseTimeToSeconds(this.playlist[this.currentIndex]?.duration || '3:00');

        const simulationInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(simulationInterval);
                return;
            }

            simulatedTime += 1;
            this.currentTimeEl.textContent = this.formatTime(simulatedTime);

            if (this.progressBar) {
                this.progressBar.value = (simulatedTime / trackDuration) * 100;
            }

            if (simulatedTime >= trackDuration) {
                clearInterval(simulationInterval);
                this.next();
            }
        }, 1000);
    }

    parseTimeToSeconds(timeStr) {
        if (!timeStr || timeStr === '--:--') return 180;
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
}

/* ============================================
   INITIALIZE AUDIO PLAYER
   ============================================ */
let audioPlayer;

function initAudioPlayer() {
    audioPlayer = new AudioPlayer();
}

/* ============================================
   WINDOW BUTTON INTERACTION
   ============================================ */
function initWindowButtons() {
    const windowBtns = document.querySelectorAll('.window-btn');
    windowBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            windowBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (audioPlayer) {
                audioPlayer.togglePlay();
            }
        }

        if (e.code === 'ArrowRight' && audioPlayer) {
            audioPlayer.seek(audioPlayer.audio.currentTime + 5);
        }
        if (e.code === 'ArrowLeft' && audioPlayer) {
            audioPlayer.seek(audioPlayer.audio.currentTime - 5);
        }

        if (e.code === 'ArrowUp' && audioPlayer) {
            e.preventDefault();
            audioPlayer.setVolume(audioPlayer.audio.volume + 0.1);
        }
        if (e.code === 'ArrowDown' && audioPlayer) {
            e.preventDefault();
            audioPlayer.setVolume(audioPlayer.audio.volume - 0.1);
        }

        if (e.code === 'KeyN' && audioPlayer) {
            audioPlayer.next();
        }

        if (e.code === 'KeyP' && audioPlayer) {
            audioPlayer.previous();
        }

        if (e.code === 'Escape') {
            const selected = document.querySelector('.desktop-icon.selected');
            if (selected) selected.classList.remove('selected');
        }
    });
}
