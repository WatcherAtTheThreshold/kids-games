/* ===================================================================
   KIDS GAMES - AUDIO SYSTEM
   Core audio management for all games
   =================================================================== */

class AudioSystem {
   constructor() {
    this.sounds = new Map();
    this.isEnabled = true;
    this.isInitialized = false;
    this.audioContext = null;
    
    // === Smart path detection ===
    // Check if we're in a game subfolder by looking at the URL
    const currentPath = window.location.pathname;
    const currentURL = window.location.href;  // Fixed: define this variable
    
    const isInGameFolder = currentPath.includes('/color-pop/') || 
                          currentPath.includes('/animal-peekaboo/') || 
                          currentPath.includes('/bug-count/') ||      // Fixed: added missing semicolon
                          currentURL.includes('/color-pop/') ||       // Fixed: use currentURL instead of currentFile
                          currentURL.includes('color-pop/index.html'); // Fixed: use currentURL
    
    // Set base path accordingly
    const audioBasePath = isInGameFolder ? '../assets/audio/' : './assets/audio/';
    
    console.log(`Current path: ${currentPath}`);
    console.log(`Audio path detected: ${audioBasePath} (in game folder: ${isInGameFolder})`);
    
    // === Audio file paths (dynamically set) ===
    this.soundPaths = {
        // Voice prompts
        'find-red': audioBasePath + 'find-red.mp3',
        'find-blue': audioBasePath + 'find-blue.mp3',
        'find-yellow': audioBasePath + 'find-yellow.mp3',
        'find-green': audioBasePath + 'find-green.mp3',
        'great-job': audioBasePath + 'great-job.mp3',
        'try-again': audioBasePath + 'try-again.mp3',
        'amazing': audioBasePath + 'amazing.mp3',
        
        // Sound effects
        'pop': audioBasePath + 'pop.mp3',
        'chime': audioBasePath + 'chime.mp3',
        'whoosh': audioBasePath + 'whoosh.mp3',
        'celebrate': audioBasePath + 'celebrate.mp3',
        'gentle-no': audioBasePath + 'gentle-no.mp3'
    };
}

    /* === INITIALIZATION === */
    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.createAudioContext();
            await this.preloadAllSounds();
            this.isInitialized = true;
            console.log('Audio System initialized successfully');
        } catch (error) {
            console.warn('Audio System initialization failed:', error);
            this.isEnabled = false;
        }
    }

    /* === AUDIO CONTEXT SETUP === */
    async createAudioContext() {
        // Handle mobile audio unlock requirement
        if (typeof window !== 'undefined' && window.AudioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume context on first user interaction (mobile requirement)
            if (this.audioContext.state === 'suspended') {
                document.addEventListener('touchstart', () => this.unlockAudioContext(), { once: true });
                document.addEventListener('click', () => this.unlockAudioContext(), { once: true });
            }
        }
    }

    /* === MOBILE AUDIO UNLOCK === */
    async unlockAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('Audio context unlocked for mobile');
        }
    }

    /* === SOUND PRELOADING === */
    async preloadAllSounds() {
        const preloadPromises = Object.entries(this.soundPaths).map(([key, path]) => {
            return this.preloadSound(key, path);
        });
        
        await Promise.allSettled(preloadPromises);
        console.log(`Preloaded ${this.sounds.size} audio files`);
    }

    /* === INDIVIDUAL SOUND PRELOAD === */
    async preloadSound(key, path) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(path);
            
            audio.addEventListener('canplaythrough', () => {
                this.sounds.set(key, audio);
                resolve();
            });
            
            audio.addEventListener('error', () => {
                console.warn(`Failed to load audio: ${path}`);
                reject();
            });
            
            audio.preload = 'auto';
            audio.load();
        });
    }

    /* === PLAY SOUND EFFECTS === */
    playSound(soundKey) {
        if (!this.isEnabled || !this.isInitialized) return;
        
        const audio = this.sounds.get(soundKey);
        if (!audio) {
            console.warn(`Sound not found: ${soundKey}`);
            return;
        }
        
        // Clone audio for overlapping plays
        const audioClone = audio.cloneNode();
        audioClone.play().catch(error => {
            console.warn(`Failed to play sound ${soundKey}:`, error);
        });
    }

    /* === PLAY VOICE PROMPTS === */
    playVoicePrompt(promptKey) {
        // Same as playSound but semantic separation for voice vs effects
        this.playSound(promptKey);
    }

    /* === AUDIO CONTROL === */
    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        // Stop all currently playing sounds
        this.sounds.forEach(audio => {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }

    toggle() {
        this.isEnabled ? this.disable() : this.enable();
        return this.isEnabled;
    }

    /* === UTILITY === */
    isReady() {
        return this.isInitialized && this.isEnabled;
    }

    getSoundsList() {
        return Array.from(this.sounds.keys());
    }
}

/* ===================================================================
   EXPORT FOR MODULE USE
   =================================================================== */
// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
}

// For global use
if (typeof window !== 'undefined') {
    window.AudioSystem = AudioSystem;
}
