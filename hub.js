/* === HUB JAVASCRIPT - NAVIGATION AND DISPLAY === */

// === GLOBAL VARIABLES ===
let stickerCount = 0;
let gamesPlayedToday = 0;
let soundEnabled = true;

// === SLIDER VARIABLES ===
let isDragging = false;
let currentSlider = null;
let currentSticker = null;

// === STICKER REGISTRY - Easy to expand tomorrow ===
const STICKER_REGISTRY = {
    'color-pop': { emoji: '🎈', name: 'Balloon Pop', unlocked: false },
    'animal-peekaboo': { emoji: '🐶', name: 'Happy Puppy', unlocked: false },
    'bug-count': { emoji: '🐞', name: 'Ladybug Count', unlocked: false },
    'bird-match': { emoji: '🦅', name: 'Bird Match', unlocked: false },
    'feelings-faces': { emoji: '😊', name: 'Happy Face', unlocked: false },
    'sound-spelling': { emoji: '🔤', name: 'Word Star', unlocked: false }
};


/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements(); // THIS MUST BE FIRST
    loadHubData();
    setupEventListeners();
    updateDisplay();
    updateStickerDisplay();
    initializeSliders();
    initializeStickerModal();
});

// === DOM ELEMENT INITIALIZATION (CALLED AFTER DOM LOADS) ===
function initializeDOMElements() {
    stickerCountElement = document.getElementById('stickerCount');
    gamesPlayedElement = document.getElementById('gamesPlayedToday');
    soundToggleButton = document.getElementById('soundToggle');
    helpButton = document.getElementById('helpButton');
    gameCards = document.querySelectorAll('.game-card');
    floatingStickers = document.querySelectorAll('.floating-sticker');
    
    stickerModalOverlay = document.getElementById('stickerModalOverlay');
    modalCloseButton = document.getElementById('modalCloseButton');
    stickerGrid = document.getElementById('stickerGrid');
    modalSubtitle = document.getElementById('modalSubtitle');
    collectedCount = document.getElementById('collectedCount');
    totalCount = document.getElementById('totalCount');
}



/* === LOAD DATA FROM STORAGE === */
function loadHubData() {
    // === LOAD INDIVIDUAL STICKER DATA ===
    const earnedStickers = localStorage.getItem('kidsGames_earnedStickers');
    const stickerCount_old = localStorage.getItem('kidsGames_stickerCount');
    
    if (earnedStickers) {
        // === NEW SYSTEM: Parse earned stickers list ===
        const stickerList = earnedStickers.split(',').filter(s => s.length > 0);
        stickerCount = stickerList.length;
    } else if (stickerCount_old) {
        // === BACKWARD COMPATIBILITY: Convert old count to new system ===
        const oldCount = parseInt(stickerCount_old);
        stickerCount = oldCount;
        
        // === Create earned stickers list from registry (first N stickers) ===
        const stickerKeys = Object.keys(STICKER_REGISTRY);
        const earnedList = stickerKeys.slice(0, oldCount);
        localStorage.setItem('kidsGames_earnedStickers', earnedList.join(','));
    } else {
        // === NO STICKERS YET ===
        stickerCount = 0;
    }
    
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
    
    // === COLLECTION BOX CLICK - ADD THIS ===
    const collectionCard = document.querySelector('.collection-card');
    if (collectionCard) {
        collectionCard.addEventListener('click', openStickerModal);
    }
    
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

/* === UPDATE STICKER DISPLAY BASED ON EARNED STICKERS === */
function updateStickerDisplay() {
    // === GET EARNED STICKERS LIST ===
    const earnedStickers = localStorage.getItem('kidsGames_earnedStickers');
    const earnedList = earnedStickers ? earnedStickers.split(',').filter(s => s.length > 0) : [];
    
    // === UNLOCK SPECIFIC EARNED STICKERS ===
    Object.keys(STICKER_REGISTRY).forEach(gameKey => {
        if (earnedList.includes(gameKey)) {
            STICKER_REGISTRY[gameKey].unlocked = true;
        } else {
            STICKER_REGISTRY[gameKey].unlocked = false;
        }
    });
    
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
    
    // === UPDATE FLOATING STICKERS TO SHOW EARNED ONES ===
    updateFloatingStickers(earnedList);
}

/* === UPDATE FLOATING STICKERS TO SHOW ACTUAL EARNED STICKERS === */
function updateFloatingStickers(earnedList) {
    // === GET FIRST 3 EARNED STICKERS (OR DEFAULTS IF LESS THAN 3) ===
    const defaultStickers = ['color-pop', 'animal-peekaboo', 'bug-count'];
    
    floatingStickers.forEach((stickerElement, index) => {
        let gameKey;
        
        if (index < earnedList.length) {
            // === SHOW ACTUAL EARNED STICKER ===
            gameKey = earnedList[index];
        } else {
            // === SHOW DEFAULT PLACEHOLDER ===
            gameKey = defaultStickers[index];
        }
        
        // === UPDATE STICKER DISPLAY ===
        const stickerData = STICKER_REGISTRY[gameKey];
        if (stickerData) {
            stickerElement.dataset.game = gameKey;
            const iconElement = stickerElement.querySelector('.sticker-icon');
            iconElement.textContent = stickerData.emoji;
        }
    });
}

/* === SHARED STICKER UTILITY - FOR GAMES TO USE === */

/* === AWARD SPECIFIC STICKER === */
function awardSticker(gameKey) {
    // === VALIDATE GAME KEY ===
    if (!STICKER_REGISTRY[gameKey]) {
        console.warn(`Unknown game key: ${gameKey}`);
        return false;
    }
    
    // === GET CURRENT EARNED STICKERS ===
    const earnedStickers = localStorage.getItem('kidsGames_earnedStickers') || '';
    const stickerList = earnedStickers ? earnedStickers.split(',').filter(s => s.length > 0) : [];
    
    // === CHECK IF STICKER ALREADY EARNED ===
    if (stickerList.includes(gameKey)) {
        console.log(`Sticker ${gameKey} already earned`);
        return false; // Already earned
    }
    
    // === ADD NEW STICKER ===
    stickerList.push(gameKey);
    
    // === SAVE UPDATED LIST ===
    localStorage.setItem('kidsGames_earnedStickers', stickerList.join(','));
    
    // === UPDATE COUNT FOR BACKWARD COMPATIBILITY ===
    localStorage.setItem('kidsGames_stickerCount', stickerList.length.toString());
    
    // === LOG SUCCESS ===
    console.log(`🌟 Awarded sticker: ${gameKey} (${STICKER_REGISTRY[gameKey].name})`);
    
    return true; // Successfully awarded
}

/* === GET EARNED STICKERS LIST === */
function getEarnedStickers() {
    const earnedStickers = localStorage.getItem('kidsGames_earnedStickers') || '';
    return earnedStickers ? earnedStickers.split(',').filter(s => s.length > 0) : [];
}

/* === CHECK IF STICKER IS EARNED === */
function hasStickerBeenEarned(gameKey) {
    const earnedList = getEarnedStickers();
    return earnedList.includes(gameKey);
}

/* === HANDLE STICKER CLICK - UPDATED === */
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
    
    // === UNLOCKED STICKER - OPEN SHOWCASE MODAL ===
    const stickerIcon = stickerElement.querySelector('.sticker-icon');
    stickerIcon.classList.add('pop-animation');
    
    setTimeout(() => {
        openStickerModal();
        stickerIcon.classList.remove('pop-animation');
    }, 200);
}
    
    // === UNLOCKED STICKER - ADD BOUNCE EFFECT ===
    //const stickerIcon = stickerElement.querySelector('.sticker-icon');
    //stickerIcon.classList.add('pop-animation');
    
    // === TODO: OPEN STICKER SHOWCASE MODAL ===
    //console.log(`Clicked sticker: ${stickerData.name}`);
    
    //setTimeout(() => {
        //stickerIcon.classList.remove('pop-animation');
    //}, 300);


/* === SLIDER SYSTEM === */


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

/* === SET SLIDER POSITION ON CURVED ARC === */
function setSliderPosition(handle, percentage) {
    // === CALCULATE CURVED ARC POSITION ===
    const sliderWidth = handle.parentElement.offsetWidth;
    const sliderHeight = handle.parentElement.offsetHeight;
    
    // === ARC MATH: QUADRATIC CURVE FROM LEFT TO RIGHT ===
    const startX = 15; // Left curve start
    const endX = sliderWidth - 15; // Right curve end  
    const peakY = 10; // Curve peak height
    const baseY = 40; // Base level
    
    // === X POSITION ALONG ARC ===
    const x = startX + (percentage * (endX - startX));
    
    // === Y POSITION FOLLOWING CURVE ===
    const curveHeight = baseY - peakY;
    const y = baseY - (curveHeight * Math.sin(percentage * Math.PI));
    
    // === APPLY POSITION ===
    handle.style.left = (x - 10) + 'px'; // Center handle on path
    handle.style.bottom = (sliderHeight - y - 10) + 'px'; // Center handle vertically
}

/* === APPLY STICKER EFFECTS === */
function applyStickerEffects(stickerElement, percentage) {
    const stickerIcon = stickerElement.querySelector('.sticker-icon');
    
    // === ROTATION EFFECT === 
    const rotation = -15 + (percentage * 30); // -15deg to +15deg
    
    // === SCALE EFFECT - MAXIMUM IMPACT === 
    const scale = 0.6 + (percentage * 1.0); // 0.6x to 1.6x - DRAMATIC!
    
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

/* === STICKER SHOWCASE MODAL SYSTEM === */

/* === INITIALIZE MODAL === */
function initializeStickerModal() {
    // === CLOSE BUTTON EVENT ===
    modalCloseButton.addEventListener('click', closeStickerModal);
    
    // === CLICK OUTSIDE TO CLOSE ===
    stickerModalOverlay.addEventListener('click', (event) => {
        if (event.target === stickerModalOverlay) {
            closeStickerModal();
        }
    });
    
    // === ESCAPE KEY TO CLOSE ===
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && stickerModalOverlay.classList.contains('active')) {
            closeStickerModal();
        }
    });
}

/* === OPEN STICKER MODAL === */
function openStickerModal() {
    // === GENERATE STICKER GRID ===
    generateStickerGrid();
    
    // === UPDATE STATS ===
    updateCollectionStats();
    
    // === SHOW MODAL ===
    stickerModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    // === PLAY OPEN SOUND ===
    if (soundEnabled) {
        playModalSound('open');
    }
}

/* === CLOSE STICKER MODAL === */
function closeStickerModal() {
    stickerModalOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    
    // === PLAY CLOSE SOUND ===
    if (soundEnabled) {
        playModalSound('close');
    }
}

/* === GENERATE STICKER GRID === */
function generateStickerGrid() {
    stickerGrid.innerHTML = '';
    
    Object.entries(STICKER_REGISTRY).forEach(([gameKey, stickerData]) => {
        const stickerSlot = document.createElement('div');
        stickerSlot.className = `sticker-slot ${stickerData.unlocked ? 'earned' : 'empty'}`;
        stickerSlot.dataset.game = gameKey;
        
        stickerSlot.innerHTML = `
            <div class="sticker-emoji">${stickerData.unlocked ? stickerData.emoji : '❓'}</div>
            <div class="sticker-name">${stickerData.unlocked ? stickerData.name : 'Play to unlock!'}</div>
        `;
        
        // === ADD CLICK HANDLER ===
        stickerSlot.addEventListener('click', () => handleModalStickerClick(stickerSlot, stickerData));
        
        stickerGrid.appendChild(stickerSlot);
    });
}

/* === HANDLE MODAL STICKER CLICK === */
function handleModalStickerClick(stickerSlot, stickerData) {
    if (!stickerData.unlocked) {
        // === EMPTY SLOT FEEDBACK ===
        stickerSlot.classList.add('shake');
        setTimeout(() => {
            stickerSlot.classList.remove('shake');
        }, 600);
        
        if (soundEnabled) {
            playModalSound('locked');
        }
        return;
    }
    
    // === EARNED STICKER - ADD EFFECTS ===
    const stickerEmoji = stickerSlot.querySelector('.sticker-emoji');
    
    // === RANDOM EFFECT CHOICE ===
    const effects = ['bounce', 'sparkle', 'pop-animation'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    
    stickerEmoji.classList.add(randomEffect);
    
    // === PLAY SUCCESS SOUND ===
    if (soundEnabled) {
        playModalSound('click');
    }
    
    // === REMOVE EFFECT AFTER ANIMATION ===
    setTimeout(() => {
        stickerEmoji.classList.remove(randomEffect);
    }, 600);
}

/* === UPDATE COLLECTION STATS === */
function updateCollectionStats() {
    const earnedStickers = Object.values(STICKER_REGISTRY).filter(sticker => sticker.unlocked).length;
    const totalStickers = Object.keys(STICKER_REGISTRY).length;
    
    collectedCount.textContent = earnedStickers;
    totalCount.textContent = totalStickers;
    
    // === UPDATE SUBTITLE BASED ON PROGRESS ===
    if (earnedStickers === 0) {
        modalSubtitle.textContent = 'Play games to start your collection!';
    } else if (earnedStickers === totalStickers) {
        modalSubtitle.textContent = 'Amazing! You collected them all! 🎉';
    } else {
        modalSubtitle.textContent = `${totalStickers - earnedStickers} more stickers to find!`;
    }
}

/* === MODAL SOUND EFFECTS === */
function playModalSound(type) {
    if (!soundEnabled) return;
    
    const soundMap = {
        'open': { freq: 440, volume: 0.2, duration: 0.3 },
        'close': { freq: 330, volume: 0.15, duration: 0.2 },
        'click': { freq: 660, volume: 0.1, duration: 0.1 },
        'locked': { freq: 200, volume: 0.1, duration: 0.1 }
    };
    
    const sound = soundMap[type];
    if (sound) {
        playSliderSound(sound.freq, sound.volume, sound.duration);
    }
}
