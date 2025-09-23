/* === BUG COUNT GAME JAVASCRIPT === */

// === GLOBAL GAME VARIABLES ===
let currentRound = 1;
let totalRounds = 5;
let ladybugsCount = 0;
let ladybugsFound = 0;
let gameActive = false;
let soundEnabled = true;
let audioContext = null;

// === ROUND CONFIGURATIONS ===
const roundConfigs = [
    { ladybugs: 1, totalBugs: 4 },  // Round 1: 1 ladybug, 4 total bugs
    { ladybugs: 2, totalBugs: 5 },  // Round 2: 2 ladybugs, 5 total bugs  
    { ladybugs: 3, totalBugs: 6 },  // Round 3: 3 ladybugs, 6 total bugs
    { ladybugs: 2, totalBugs: 5 },  // Round 4: 2 ladybugs, 5 total bugs
    { ladybugs: 4, totalBugs: 7 }   // Round 5: 4 ladybugs, 7 total bugs
];

// === OTHER BUG TYPES FOR DECORATION ===
const otherBugs = ['🦋', '🐝', '🐞', '🦗', '🐛'];

// === DOM ELEMENTS ===
let startScreen, startButton, gameHeader, instructionPanel, gardenContainer;
let answerPanel, numberButtons, completionScreen, backButton;
let roundInfo, instructionText, foundCount, answerQuestion, completionButton;

/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

/* === INITIALIZE GAME === */
function initializeGame() {
    // === GET DOM ELEMENTS ===
    getDOMElements();
    
    // === LOAD SOUND PREFERENCE ===
    loadSoundPreference();
    
    // === SETUP EVENT LISTENERS ===
    setupEventListeners();
    
    // === SHOW START SCREEN ===
    showStartScreen();
}

/* === GET ALL DOM ELEMENTS === */
function getDOMElements() {
    startScreen = document.getElementById('startScreen');
    startButton = document.getElementById('startButton');
    gameHeader = document.getElementById('gameHeader');
    instructionPanel = document.getElementById('instructionPanel');
    gardenContainer = document.getElementById('gardenContainer');
    answerPanel = document.getElementById('answerPanel');
    numberButtons = document.getElementById('numberButtons');
    completionScreen = document.getElementById('completionScreen');
    backButton = document.getElementById('backButton');
    
    roundInfo = document.getElementById('roundInfo');
    instructionText = document.getElementById('instructionText');
    foundCount = document.getElementById('foundCount');
    answerQuestion = document.getElementById('answerQuestion');
    completionButton = document.getElementById('completionButton');
}

/* === LOAD SOUND PREFERENCE === */
function loadSoundPreference() {
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
}

/* === SETUP EVENT LISTENERS === */
function setupEventListeners() {
    // === START BUTTON ===
    startButton.addEventListener('click', handleStartGame);
    
    // === BACK BUTTON ===
    backButton.addEventListener('click', handleBackToHub);
    
    // === NUMBER BUTTONS ===
    const buttons = numberButtons.querySelectorAll('.number-button');
    buttons.forEach(button => {
        button.addEventListener('click', handleNumberSelect);
    });
    
    // === COMPLETION BUTTON ===
    completionButton.addEventListener('click', handleBackToHub);
}

/* === SHOW START SCREEN === */
function showStartScreen() {
    startScreen.classList.remove('hidden');
    gameHeader.classList.add('hidden');
    instructionPanel.classList.add('hidden');
    gardenContainer.classList.add('hidden');
    answerPanel.classList.add('hidden');
}

/* === HANDLE START GAME === */
function handleStartGame() {
    // === INITIALIZE AUDIO CONTEXT ===
    initializeAudio();
    
    // === HIDE START SCREEN ===
    startScreen.classList.add('hidden');
    
    // === SHOW GAME ELEMENTS ===
    gameHeader.classList.remove('hidden');
    instructionPanel.classList.remove('hidden');
    gardenContainer.classList.remove('hidden');
    
    // === ADD ENTRANCE ANIMATIONS ===
    gameHeader.classList.add('fade-in');
    instructionPanel.classList.add('fade-in');
    gardenContainer.classList.add('fade-in');
    
    // === START FIRST ROUND ===
    setTimeout(() => {
        startRound();
    }, 500);
}

/* === INITIALIZE AUDIO === */
function initializeAudio() {
    if (soundEnabled && !audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } catch (error) {
            console.log('Audio context initialization failed:', error);
            soundEnabled = false;
        }
    }
}

/* === START ROUND === */
function startRound() {
    // === RESET ROUND VARIABLES ===
    const config = roundConfigs[currentRound - 1];
    ladybugsCount = config.ladybugs;
    ladybugsFound = 0;
    gameActive = true;
    
    // === UPDATE DISPLAY ===
    updateRoundDisplay();
    
    // === CLEAR PREVIOUS BUGS ===
    clearBugs();
    
    // === CREATE NEW BUGS ===
    createBugs(config);
    
    // === PLAY VOICE PROMPT ===
    setTimeout(() => {
        playVoicePrompt();
    }, 800);
}

/* === UPDATE ROUND DISPLAY === */
function updateRoundDisplay() {
    roundInfo.textContent = `Round ${currentRound} of ${totalRounds}`;
    instructionText.textContent = 'Find and tap all the ladybugs!';
    foundCount.textContent = `Found: 0 ladybugs`;
    answerQuestion.textContent = 'How many ladybugs did you find?';
}

/* === CLEAR PREVIOUS BUGS === */
function clearBugs() {
    const existingBugs = gardenContainer.querySelectorAll('.bug');
    existingBugs.forEach(bug => {
        bug.remove();
    });
}

/* === CREATE BUGS === */
function createBugs(config) {
    const positions = generateBugPositions(config.totalBugs);
    
    // === CREATE LADYBUGS ===
    for (let i = 0; i < config.ladybugs; i++) {
        createLadybug(positions[i]);
    }
    
    // === CREATE OTHER BUGS ===
    for (let i = config.ladybugs; i < config.totalBugs; i++) {
        createOtherBug(positions[i], i);
    }
}

/* === GENERATE BUG POSITIONS === */
function generateBugPositions(count) {
    const positions = [];
    const container = gardenContainer.getBoundingClientRect();
    const margin = 60; // Margin from edges
    
    for (let i = 0; i < count; i++) {
        let position;
        let attempts = 0;
        
        do {
            position = {
                x: margin + Math.random() * (container.width - 2 * margin),
                y: margin + Math.random() * (container.height - 2 * margin)
            };
            attempts++;
        } while (attempts < 50 && isPositionTooClose(position, positions));
        
        positions.push(position);
    }
    
    return positions;
}

/* === CHECK IF POSITION IS TOO CLOSE === */
function isPositionTooClose(newPos, existingPositions) {
    const minDistance = 80; // Minimum distance between bugs
    
    return existingPositions.some(pos => {
        const distance = Math.sqrt(
            Math.pow(newPos.x - pos.x, 2) + 
            Math.pow(newPos.y - pos.y, 2)
        );
        return distance < minDistance;
    });
}

/* === CREATE LADYBUG === */
function createLadybug(position) {
    const ladybug = document.createElement('div');
    ladybug.className = 'bug ladybug';
    ladybug.textContent = '🐞';
    ladybug.style.left = position.x + 'px';
    ladybug.style.top = position.y + 'px';
    ladybug.style.animationDelay = Math.random() * 2 + 's';
    
    // === ADD CLICK HANDLER ===
    ladybug.addEventListener('click', handleLadybugClick);
    
    gardenContainer.appendChild(ladybug);
}

/* === CREATE OTHER BUG === */
function createOtherBug(position, index) {
    const bug = document.createElement('div');
    bug.className = 'bug ' + ['butterfly', 'bee', 'butterfly', 'bee'][index % 4];
    bug.textContent = otherBugs[index % otherBugs.length];
    bug.style.left = position.x + 'px';
    bug.style.top = position.y + 'px';
    bug.style.animationDelay = Math.random() * 3 + 's';
    
    // === ADD CLICK HANDLER FOR FEEDBACK ===
    bug.addEventListener('click', handleOtherBugClick);
    
    gardenContainer.appendChild(bug);
}

/* === HANDLE LADYBUG CLICK === */
function handleLadybugClick(event) {
    if (!gameActive) return;
    
    const ladybug = event.target;
    
    // === PREVENT DOUBLE CLICKS ===
    if (ladybug.classList.contains('found')) return;
    
    // === MARK AS FOUND ===
    ladybug.classList.add('found');
    ladybugsFound++;
    
    // === PLAY SUCCESS SOUND ===
    playSuccessSound();
    
    // === ADD SUCCESS ANIMATION ===
    ladybug.classList.add('pop-animation');
    
    // === UPDATE FOUND COUNT ===
    foundCount.textContent = `Found: ${ladybugsFound} ladybug${ladybugsFound !== 1 ? 's' : ''}`;
    
    // === CHECK IF ALL FOUND ===
    if (ladybugsFound >= ladybugsCount) {
        setTimeout(() => {
            showAnswerPanel();
        }, 1000);
    }
}

/* === HANDLE OTHER BUG CLICK === */
function handleOtherBugClick(event) {
    if (!gameActive) return;
    
    const bug = event.target;
    
    // === GENTLE FEEDBACK ===
    bug.classList.add('try-again-feedback');
    playTryAgainSound();
    
    // === RESET ANIMATION ===
    setTimeout(() => {
        bug.classList.remove('try-again-feedback');
    }, 500);
}

/* === SHOW ANSWER PANEL === */
function showAnswerPanel() {
    gameActive = false;
    
    // === HIDE INSTRUCTIONS ===
    instructionPanel.classList.add('fade-out');
    
    // === SHOW ANSWER PANEL ===
    setTimeout(() => {
        instructionPanel.classList.add('hidden');
        answerPanel.classList.remove('hidden');
        answerPanel.classList.add('fade-in');
        
        // === PLAY QUESTION PROMPT ===
        setTimeout(() => {
            playQuestionPrompt();
        }, 500);
    }, 300);
}

/* === HANDLE NUMBER SELECT === */
function handleNumberSelect(event) {
    const selectedNumber = parseInt(event.target.dataset.number);
    const button = event.target;
    
    // === VISUAL FEEDBACK ===
    button.classList.add('pop-animation');
    
    // === CHECK ANSWER ===
    if (selectedNumber === ladybugsCount) {
        handleCorrectAnswer(button);
    } else {
        handleIncorrectAnswer(button);
    }
}

/* === HANDLE CORRECT ANSWER === */
function handleCorrectAnswer(button) {
    // === SUCCESS FEEDBACK ===
    button.classList.add('correct-feedback');
    playCorrectSound();
    
    // === DISABLE ALL BUTTONS ===
    disableNumberButtons();
    
    // === PROCEED TO NEXT ROUND ===
    setTimeout(() => {
        if (currentRound < totalRounds) {
            nextRound();
        } else {
            completeGame();
        }
    }, 1500);
}

/* === HANDLE INCORRECT ANSWER === */
function handleIncorrectAnswer(button) {
    // === GENTLE FEEDBACK ===
    button.classList.add('try-again-feedback');
    playTryAgainSound();
    
    // === RESET FEEDBACK ===
    setTimeout(() => {
        button.classList.remove('try-again-feedback');
    }, 1000);
}

/* === DISABLE NUMBER BUTTONS === */
function disableNumberButtons() {
    const buttons = numberButtons.querySelectorAll('.number-button');
    buttons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
    });
}

/* === ENABLE NUMBER BUTTONS === */
function enableNumberButtons() {
    const buttons = numberButtons.querySelectorAll('.number-button');
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled', 'correct-feedback', 'try-again-feedback');
    });
}

/* === NEXT ROUND === */
function nextRound() {
    currentRound++;
    
    // === HIDE ANSWER PANEL ===
    answerPanel.classList.add('fade-out');
    
    setTimeout(() => {
        // === RESET PANELS ===
        answerPanel.classList.add('hidden');
        answerPanel.classList.remove('fade-in', 'fade-out');
        instructionPanel.classList.remove('hidden', 'fade-out');
        instructionPanel.classList.add('fade-in');
        
        // === ENABLE BUTTONS ===
        enableNumberButtons();
        
        // === START NEXT ROUND ===
        setTimeout(() => {
            startRound();
        }, 500);
    }, 300);
}

/* === COMPLETE GAME === */
function completeGame() {
    // === SAVE STICKER REWARD ===
    saveSticker();
    
    // === SHOW COMPLETION SCREEN ===
    setTimeout(() => {
        showCompletionScreen();
    }, 1000);
}

/* === SAVE STICKER === */
function saveSticker() {
    const currentStickers = parseInt(localStorage.getItem('kidsGames_stickerCount') || '0');
    const newStickerCount = currentStickers + 1;
    localStorage.setItem('kidsGames_stickerCount', newStickerCount.toString());
}

/* === SHOW COMPLETION SCREEN === */
function showCompletionScreen() {
    completionScreen.classList.remove('hidden');
    completionScreen.classList.add('fade-in');
    
    // === ADD CELEBRATION ANIMATION ===
    const content = completionScreen.querySelector('.completion-content');
    content.classList.add('celebration');
    
    // === PLAY COMPLETION SOUND ===
    playCompletionSound();
}

/* === HANDLE BACK TO HUB === */
function handleBackToHub() {
    // === NAVIGATE BACK TO MAIN HUB ===
    window.location.href = '../index.html';
}

/* === AUDIO FUNCTIONS === */

/* === PLAY VOICE PROMPT === */
function playVoicePrompt() {
    if (!soundEnabled || !audioContext) return;
    
    // === CREATE SUCCESS TONE ===
    createTone(800, 0.3, 0.1);
    setTimeout(() => createTone(1000, 0.3, 0.1), 200);
}

/* === PLAY QUESTION PROMPT === */
function playQuestionPrompt() {
    if (!soundEnabled || !audioContext) return;
    
    // === CREATE QUESTION TONE ===
    createTone(600, 0.4, 0.15);
    setTimeout(() => createTone(700, 0.4, 0.15), 300);
}

/* === PLAY SUCCESS SOUND === */
function playSuccessSound() {
    if (!soundEnabled || !audioContext) return;
    
    // === CREATE SUCCESS CHIME ===
    createTone(1200, 0.2, 0.1);
    setTimeout(() => createTone(1500, 0.2, 0.1), 150);
}

/* === PLAY CORRECT SOUND === */
function playCorrectSound() {
    if (!soundEnabled || !audioContext) return;
    
    // === CREATE CELEBRATION MELODY ===
    const notes = [1000, 1200, 1500];
    notes.forEach((freq, index) => {
        setTimeout(() => createTone(freq, 0.3, 0.1), index * 200);
    });
}

/* === PLAY TRY AGAIN SOUND === */
function playTryAgainSound() {
    if (!soundEnabled || !audioContext) return;
    
    // === CREATE GENTLE FEEDBACK TONE ===
    createTone(400, 0.3, 0.1);
}

/* === PLAY COMPLETION SOUND === */
function playCompletionSound() {
    if (!soundEnabled || !audioContext) return;
    
    // === CREATE VICTORY FANFARE ===
    const melody = [800, 1000, 1200, 1500, 1800];
    melody.forEach((freq, index) => {
        setTimeout(() => createTone(freq, 0.4, 0.1), index * 300);
    });
}

/* === CREATE TONE === */
function createTone(frequency, duration, volume = 0.1) {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
    } catch (error) {
        console.log('Audio tone creation failed:', error);
    }
}

/* === UTILITY FUNCTIONS === */

/* === GET CURRENT ROUND === */
function getCurrentRound() {
    return currentRound;
}

/* === GET LADYBUGS FOUND === */
function getLadybugsFound() {
    return ladybugsFound;
}

/* === IS GAME ACTIVE === */
function isGameActive() {
    return gameActive;
}