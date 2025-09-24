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
    updateStickerDisplay(); // ADD THIS LINE
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
}
