/* === HUB JAVASCRIPT - NAVIGATION AND DISPLAY === */

// === GLOBAL VARIABLES ===
let stickerCount = 0;
let gamesPlayedToday = 0;
let soundEnabled = true;

// === STICKER REGISTRY - Easy to expand tomorrow ===
const STICKER_REGISTRY = {
    'color-pop': { emoji: '🎈', name: 'Balloon Pop', unlocked: false },
    'animal-peekaboo': { emoji: '🐶', name: 'Happy Puppy', unlocked: false },
    'bug-count': { emoji: '🐞', name: 'Ladybug Count', unlocked: false },
    'bird-match': { emoji: '🦅', name: 'Bird Match', unlocked: false },
    'feelings-faces': { emoji: '😊', name: 'Happy Face', unlocked: false },
    'sound-spelling': { emoji: '🔤', name: 'Word Star', unlocked: false }
};

// === DOM ELEMENTS ===
const stickerCountElement = document.getElementById('stickerCount');
const gamesPlayedElement = document.getElementById('gamesPlayedToday');
const soundToggleButton = document.getElementById('soundToggle');
const helpButton = document.getElementById('helpButton');
const gameCards = document.querySelectorAll('.game-card');
const floatingStickers = document.querySelectorAll('.floating-sticker');
/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    loadHubData();
    setupEventListeners();
    updateDisplay();
    updateStickerDisplay();
    initializeSliders(); // ADD THIS LINE
});

/* === LOAD DATA FROM STORAGE === */
function loadHubData() {
    // === LOAD STICKER COUNT ===
    const savedStickers = localStorage.getItem('kidsGames_stickerCount');
    stickerCount = savedStickers ? parseInt(savedStickers) : 0;
    
    // === LOAD GAMES PLAYED TODAY ===
    const today = new Date().toDateString();
    const lastPlayDate = localStorage.getItem('kidsGames_lastPlayDate');
    
    if (lastPlayDate === today) {
        const savedGames = localStorage.getItem('kidsGames_gamesPlayedToday');
        gamesPlayedToday = savedGames ? parseInt(savedGames) : 0;
    } else {
        // === NEW DAY - RESET COUNTER ===
        gamesPlayedToday = 0;
        localStorage.setItem('kidsGames_lastPlayDate', today);
        localStorage.setItem('kidsGames_gamesPlayedToday', '0');
    }
    
    // === LOAD SOUND PREFERENCE ===
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
}

/* === UPDATE DISPLAY ELEMENTS === */
function updateDisplay() {
    // === UPDATE STICKER COUNT DISPLAY ===
    if (stickerCount === 0) {
        stickerCountElement.textContent = '0 stickers collected!';
    } else if (stickerCount === 1) {
        stickerCountElement.textContent = '1 sticker collected!';
    } else {
        stickerCountElement.textContent = `${stickerCount} stickers collected!`;
    }
    
    // === UPDATE GAMES PLAYED DISPLAY ===
    if (gamesPlayedToday === 0) {
        gamesPlayedElement.textContent = '0 games played today';
    } else if (gamesPlayedToday === 1) {
        gamesPlayedElement.textContent = '1 game played today';
    } else {
        gamesPlayedElement.textContent = `${gamesPlayedToday} games played today`;
    }
    
    // === UPDATE SOUND TOGGLE BUTTON ===
    soundToggleButton.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggleButton.title = soundEnabled ? 'Turn Sound Off' : 'Turn Sound On';
}

/* === SETUP EVENT LISTENERS === */
function setupEventListeners() {
    // === GAME CARD CLICKS ===
    gameCards.forEach(card => {
        card.addEventListener('click', handleGameCardClick);
    });
    
    // === FLOATING STICKER CLICKS === 
    floatingStickers.forEach(sticker => {
        sticker.addEventListener('click', handleStickerClick);
    });
    
    // === SOUND TOGGLE BUTTON ===
    soundToggleButton.addEventListener('click', handleSoundToggle);
    
    // === HELP BUTTON ===
    helpButton.addEventListener('click', handleHelpClick);
    
    // === LISTEN FOR RETURNING FROM GAMES ===
    window.addEventListener('focus', handleWindowFocus);
}

/* === HANDLE GAME CARD CLICKS === */
function handleGameCardClick(event) {
    const gameCard = event.currentTarget;
    const gameName = gameCard.dataset.game;
    const isActive = gameCard.classList.contains('active');
    
    if (isActive) {
        // === NAVIGATE TO ACTIVE GAME ===
        navigateToGame(gameName);
    } else {
        // === SHOW COMING SOON FOR INACTIVE GAMES ===
        showComingSoon(gameName);
    }
}

/* === NAVIGATE TO ACTIVE GAME === */
function navigateToGame(gameName) {
    // === ADD LOADING FEEDBACK ===
    const gameCard = document.querySelector(`[data-game="${gameName}"]`);
    gameCard.classList.add('pulse');
    
    // === SAVE NAVIGATION TIME ===
    localStorage.setItem('kidsGames_lastNavigation', Date.now().toString());
    
    // === NAVIGATE TO GAME FOLDER ===
    setTimeout(() => {
        window.location.href = `${gameName}/index.html`;
    }, 300);
}

/* === SHOW COMING SOON MESSAGE === */
function showComingSoon(gameName) {
    const gameCard = document.querySelector(`[data-game="${gameName}"]`);
    
    // === ADD SHAKE ANIMATION ===
    gameCard.classList.add('shake');
    
    // === SHOW TEMPORARY MESSAGE ===
    const originalName = gameCard.querySelector('.game-name').textContent;
    const nameElement = gameCard.querySelector('.game-name');
    
    nameElement.textContent = 'Coming Soon!';
    nameElement.style.color = '#ffa726';
    
    // === RESET AFTER ANIMATION ===
    setTimeout(() => {
        gameCard.classList.remove('shake');
        nameElement.textContent = originalName;
        nameElement.style.color = '';
    }, 1500);
}

/* === HANDLE SOUND TOGGLE === */
function handleSoundToggle() {
    soundEnabled = !soundEnabled;
    
    // === SAVE PREFERENCE ===
    localStorage.setItem('kidsGames_soundEnabled', soundEnabled.toString());
    
    // === UPDATE DISPLAY ===
    updateDisplay();
    
    // === ADD FEEDBACK ANIMATION ===
    soundToggleButton.classList.add('pop-animation');
    setTimeout(() => {
        soundToggleButton.classList.remove('pop-animation');
    }, 300);
}

/* === HANDLE HELP BUTTON === */
function handleHelpClick() {
    // === SIMPLE HELP MESSAGE ===
    const helpMessage = `
🎮 How to Play:
• Tap Color Pop to start playing!
• Other games coming soon
• Collect stickers by completing games
• Use 🔊 to turn sound on/off

👶 Perfect for ages 3-5!
    `.trim();
    
    alert(helpMessage);
    
    // === ADD FEEDBACK ANIMATION ===
    helpButton.classList.add('bounce');
    setTimeout(() => {
        helpButton.classList.remove('bounce');
    }, 600);
}

/* === HANDLE WINDOW FOCUS (RETURNING FROM GAMES) === */
function handleWindowFocus() {
    // === CHECK IF RETURNING FROM A GAME ===
    const lastNavigation = localStorage.getItem('kidsGames_lastNavigation');
    const now = Date.now();
    
    if (lastNavigation && (now - parseInt(lastNavigation)) > 10000) {
        // === BEEN AWAY FOR MORE THAN 10 SECONDS ===
        // === INCREMENT GAMES PLAYED COUNTER ===
        incrementGamesPlayed();
        
        // === RELOAD DATA IN CASE STICKERS WERE EARNED ===
        loadHubData();
        updateDisplay();
        
        // === CLEAR NAVIGATION TIMESTAMP ===
        localStorage.removeItem('kidsGames_lastNavigation');
        
        // === SHOW WELCOME BACK ANIMATION ===
        showWelcomeBack();
    }
}

/* === INCREMENT GAMES PLAYED COUNTER === */
function incrementGamesPlayed() {
    gamesPlayedToday++;
    localStorage.setItem('kidsGames_gamesPlayedToday', gamesPlayedToday.toString());
}

/* === SHOW WELCOME BACK ANIMATION === */
function showWelcomeBack() {
    // === ADD CELEBRATION TO STICKER COLLECTION ===
    const collectionCard = document.querySelector('.collection-card');
    collectionCard.classList.add('celebration');
    
    setTimeout(() => {
        collectionCard.classList.remove('celebration');
    }, 1200);
}

/* === UTILITY FUNCTIONS === */

/* === GET CURRENT STICKER COUNT === */
function getCurrentStickerCount() {
    return stickerCount;
}

/* === GET SOUND PREFERENCE === */
function getSoundEnabled() {
    return soundEnabled;
}

/* === REFRESH HUB DATA === */
function refreshHubData() {
    loadHubData();
    updateDisplay();
    updateStickerDisplay(); // ADD THIS LINE
}

/* === STICKER SYSTEM FUNCTIONS === */

/* === UPDATE STICKER DISPLAY BASED ON COUNT === */
function updateStickerDisplay() {
    const stickerKeys = Object.keys(STICKER_REGISTRY);
    
    // === UNLOCK STICKERS BASED ON CURRENT COUNT ===
    for (let i = 0; i < Math.min(stickerCount, stickerKeys.length); i++) {
        STICKER_REGISTRY[stickerKeys[i]].unlocked = true;
    }
    
    // === UPDATE FLOATING STICKER VISIBILITY ===
    floatingStickers.forEach(stickerElement => {
        const gameType = stickerElement.dataset.game;
        const stickerData = STICKER_REGISTRY[gameType];
        
        if (stickerData && stickerData.unlocked) {
            stickerElement.classList.remove('locked');
            stickerElement.classList.add('unlocked');
        } else {
            stickerElement.classList.add('locked');
            stickerElement.classList.remove('unlocked');
        }
    });
}

/* === HANDLE STICKER CLICK === */
function handleStickerClick(event) {
    const stickerElement = event.currentTarget;
    const gameType = stickerElement.dataset.game;
    const stickerData = STICKER_REGISTRY[gameType];
    
    if (!stickerData.unlocked) {
        // === LOCKED STICKER FEEDBACK ===
        stickerElement.classList.add('shake');
        setTimeout(() => {
            stickerElement.classList.remove('shake');
        }, 600);
        return;
    }
    
    // === UNLOCKED STICKER - ADD BOUNCE EFFECT ===
    const stickerIcon = stickerElement.querySelector('.sticker-icon');
    stickerIcon.classList.add('pop-animation');
    
    // === TODO: OPEN STICKER SHOWCASE MODAL ===
    console.log(`Clicked sticker: ${stickerData.name}`);
    
    setTimeout(() => {
        stickerIcon.classList.remove('pop-animation');
    }, 300);
}

/* === SLIDER SYSTEM === */

// === SLIDER VARIABLES ===
let isDragging = false;
let currentSlider = null;
let currentSticker = null;

/* === INITIALIZE SLIDERS === */
function initializeSliders() {
    const sliderHandles = document.querySelectorAll('.slider-handle');
    
    sliderHandles.forEach(handle => {
        // === MOUSE EVENTS ===
        handle.addEventListener('mousedown', handleSliderStart);
        
        // === TOUCH EVENTS ===
        handle.addEventListener('touchstart', handleSliderStart, { passive: false });
        
        // === SET INITIAL POSITION ===
        setSliderPosition(handle, 0); // Start at 0% (left side)
    });
    
    // === GLOBAL MOVE AND END EVENTS ===
    document.addEventListener('mousemove', handleSliderMove);
    document.addEventListener('mouseup', handleSliderEnd);
    document.addEventListener('touchmove', handleSliderMove, { passive: false });
    document.addEventListener('touchend', handleSliderEnd);
}

/* === HANDLE SLIDER START === */
function handleSliderStart(event) {
    event.preventDefault();
    
    isDragging = true;
    currentSlider = event.target;
    currentSticker = currentSlider.closest('.floating-sticker');
    
    // === ADD ACTIVE STATES ===
    currentSlider.parentElement.classList.add('active');
    currentSticker.classList.add('dragging');
    
    // === PLAY START SOUND IF ENABLED ===
    if (soundEnabled) {
        playSliderSound(200, 0.1, 0.1);
    }
}

/* === HANDLE SLIDER MOVE === */
function handleSliderMove(event) {
    if (!isDragging || !currentSlider) return;
    
    event.preventDefault();
    
    // === GET MOUSE/TOUCH POSITION ===
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    
    // === CALCULATE SLIDER POSITION ===
    const sliderRect = currentSlider.parentElement.getBoundingClientRect();
    const relativeX = clientX - sliderRect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / sliderRect.width));
    
    // === UPDATE HANDLE POSITION AND STICKER EFFECTS ===
    setSliderPosition(currentSlider, percentage);
    applyStickerEffects(currentSticker, percentage);
}

/* === HANDLE SLIDER END === */
function handleSliderEnd(event) {
    if (!isDragging) return;
    
    // === REMOVE ACTIVE STATES ===
    if (currentSlider) {
        currentSlider.parentElement.classList.remove('active');
    }
    if (currentSticker) {
        currentSticker.classList.remove('dragging');
    }
    
    // === PLAY END SOUND ===
    if (soundEnabled) {
        playSliderSound(400, 0.15, 0.1);
    }
    
    // === RESET VARIABLES ===
    isDragging = false;
    currentSlider = null;
    currentSticker = null;
}

/* === SET SLIDER POSITION === */
function setSliderPosition(handle, percentage) {
    // === CALCULATE ARC POSITION ===
    const sliderWidth = handle.parentElement.offsetWidth;
    const handleSize = 20;
    const trackPadding = 10;
    
    // === X POSITION ALONG ARC ===
    const maxX = sliderWidth - handleSize - trackPadding;
    const x = trackPadding + (percentage * maxX);
    
    // === Y POSITION FOR ARC CURVE ===
    const arcHeight = 15;
    const y = 2 + (Math.sin(percentage * Math.PI) * arcHeight);
    
    // === APPLY POSITION ===
    handle.style.left = x + 'px';
    handle.style.bottom = y + 'px';
}

/* === APPLY STICKER EFFECTS === */
function applyStickerEffects(stickerElement, percentage) {
    const stickerIcon = stickerElement.querySelector('.sticker-icon');
    
    // === ROTATION EFFECT === 
    const rotation = -15 + (percentage * 30); // -15deg to +15deg
    
    // === SCALE EFFECT ===
    const scale = 0.9 + (percentage * 0.3); // 0.9x to 1.2x
    
    // === BRIGHTNESS EFFECT ===
    const brightness = 0.8 + (percentage * 0.4); // 0.8 to 1.2
    
    // === APPLY ALL EFFECTS ===
    stickerIcon.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    stickerIcon.style.filter = `brightness(${brightness})`;
    
    // === PLAY MOVE SOUND (THROTTLED) ===
    if (Math.random() < 0.3) { // Only 30% of moves play sound
        playSliderSound(300 + (percentage * 200), 0.05, 0.05);
    }
}

/* === SLIDER SOUND EFFECTS === */
function playSliderSound(frequency, volume, duration) {
    if (!soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        // Silent fail if audio context not available
    }
}
