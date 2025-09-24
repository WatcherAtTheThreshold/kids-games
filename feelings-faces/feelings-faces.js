/* === FEELINGS FACES GAME JAVASCRIPT === */

// === GLOBAL GAME VARIABLES ===
let currentRound = 1;
let totalRounds = 5;
let correctAnswers = 0;
let currentTargetEmotion = '';
let currentFaces = [];
let gameInProgress = false;
let soundEnabled = true;

// === EMOTION DATA ===
const emotions = [
    { name: 'happy', emoji: '😊', prompts: ['Find the happy face!', 'Which face is smiling?', 'Show me happy!'] },
    { name: 'sad', emoji: '😢', prompts: ['Find the sad face!', 'Which face is crying?', 'Show me sad!'] },
    { name: 'mad', emoji: '😠', prompts: ['Find the mad face!', 'Which face is angry?', 'Show me mad!'] },
    { name: 'scared', emoji: '😨', prompts: ['Find the scared face!', 'Which face is frightened?', 'Show me scared!'] },
    { name: 'surprised', emoji: '😲', prompts: ['Find the surprised face!', 'Which face is shocked?', 'Show me surprised!'] },
    { name: 'sleepy', emoji: '😴', prompts: ['Find the sleepy face!', 'Which face is tired?', 'Show me sleepy!'] }
];

// === DOM ELEMENTS ===
const backButton = document.getElementById('backButton');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');
const startGameButton = document.getElementById('startGameButton');
const promptText = document.getElementById('promptText');
const roundCounter = document.getElementById('roundCounter');
const facesGrid = document.getElementById('facesGrid');
const playAgainButton = document.getElementById('playAgainButton');
const homeButton = document.getElementById('homeButton');

/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    loadSoundPreference();
    setupEventListeners();
    initializeGame();
});

/* === LOAD SOUND PREFERENCE === */
function loadSoundPreference() {
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
}

/* === SETUP EVENT LISTENERS === */
function setupEventListeners() {
    // === NAVIGATION BUTTONS ===
    backButton.addEventListener('click', goBackToHub);
    startGameButton.addEventListener('click', startNewGame);
    playAgainButton.addEventListener('click', startNewGame);
    homeButton.addEventListener('click', goBackToHub);
}

/* === INITIALIZE GAME === */
function initializeGame() {
    // === RESET GAME STATE ===
    currentRound = 1;
    correctAnswers = 0;
    gameInProgress = false;
    
    // === SHOW START SCREEN ===
    showScreen('start');
    
    // === SPEAK WELCOME MESSAGE ===
    setTimeout(() => {
        speakText("Let's learn about feelings! Tap start when you're ready!");
    }, 500);
}

/* === START NEW GAME === */
function startNewGame() {
    // === RESET COUNTERS ===
    currentRound = 1;
    correctAnswers = 0;
    gameInProgress = true;
    
    // === SHOW GAME SCREEN ===
    showScreen('game');
    
    // === START FIRST ROUND ===
    setTimeout(() => {
        setupRound();
    }, 500);
}

/* === SETUP ROUND === */
function setupRound() {
    if (currentRound > totalRounds) {
        // === GAME COMPLETE ===
        endGame();
        return;
    }
    
    // === UPDATE ROUND COUNTER ===
    roundCounter.textContent = `Round ${currentRound} of ${totalRounds}`;
    
    // === SELECT RANDOM TARGET EMOTION ===
    currentTargetEmotion = getRandomEmotion();
    
    // === GENERATE FACE OPTIONS ===
    currentFaces = generateFaceOptions(currentTargetEmotion);
    
    // === DISPLAY FACES ===
    displayFaces();
    
    // === UPDATE PROMPT ===
    updatePrompt();
    
    // === SPEAK PROMPT ===
    setTimeout(() => {
        speakPrompt();
    }, 800);
}

/* === GET RANDOM EMOTION === */
function getRandomEmotion() {
    const randomIndex = Math.floor(Math.random() * emotions.length);
    return emotions[randomIndex];
}

/* === GENERATE FACE OPTIONS === */
function generateFaceOptions(targetEmotion) {
    const faces = [targetEmotion];
    const availableEmotions = emotions.filter(emotion => emotion.name !== targetEmotion.name);
    
    // === ADD 2-3 RANDOM INCORRECT EMOTIONS ===
    const numIncorrect = Math.random() < 0.5 ? 2 : 3;
    
    for (let i = 0; i < numIncorrect && faces.length < 4; i++) {
        const randomIndex = Math.floor(Math.random() * availableEmotions.length);
        const selectedEmotion = availableEmotions.splice(randomIndex, 1)[0];
        faces.push(selectedEmotion);
    }
    
    // === SHUFFLE ARRAY ===
    return shuffleArray(faces);
}

/* === SHUFFLE ARRAY === */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/* === DISPLAY FACES === */
function displayFaces() {
    // === CLEAR PREVIOUS FACES ===
    facesGrid.innerHTML = '';
    
    // === CREATE FACE BUTTONS ===
    currentFaces.forEach((emotion, index) => {
        const faceButton = createFaceButton(emotion, index);
        facesGrid.appendChild(faceButton);
    });
}

/* === CREATE FACE BUTTON === */
function createFaceButton(emotion, index) {
    const button = document.createElement('button');
    button.className = 'face-button big-touch-target';
    button.textContent = emotion.emoji;
    button.dataset.emotion = emotion.name;
    button.setAttribute('aria-label', `${emotion.name} face`);
    
    // === ADD CLICK HANDLER ===
    button.addEventListener('click', () => handleFaceClick(emotion, button));
    
    return button;
}

/* === HANDLE FACE CLICK === */
function handleFaceClick(selectedEmotion, buttonElement) {
    if (!gameInProgress) return;
    
    // === CHECK IF CORRECT ===
    const isCorrect = selectedEmotion.name === currentTargetEmotion.name;
    
    if (isCorrect) {
        // === CORRECT ANSWER ===
        handleCorrectAnswer(buttonElement);
    } else {
        // === INCORRECT ANSWER ===
        handleIncorrectAnswer(buttonElement);
    }
}

/* === HANDLE CORRECT ANSWER === */
function handleCorrectAnswer(buttonElement) {
    // === DISABLE ALL BUTTONS ===
    disableAllFaceButtons();
    
    // === ADD SUCCESS STYLING ===
    buttonElement.classList.add('correct-feedback', 'sparkle');
    
    // === PLAY SUCCESS SOUND ===
    speakText('Great job! That\'s right!');
    
    // === UPDATE SCORE ===
    correctAnswers++;
    
    // === PROCEED TO NEXT ROUND ===
    setTimeout(() => {
        currentRound++;
        setupRound();
    }, 2000);
}

/* === HANDLE INCORRECT ANSWER === */
function handleIncorrectAnswer(buttonElement) {
    // === ADD TRY AGAIN STYLING ===
    buttonElement.classList.add('try-again-feedback', 'shake');
    
    // === SPEAK ENCOURAGEMENT ===
    speakText('Try again! Look for the ' + currentTargetEmotion.name + ' face!');
    
    // === REMOVE STYLING AFTER ANIMATION ===
    setTimeout(() => {
        buttonElement.classList.remove('try-again-feedback', 'shake');
    }, 1000);
}

/* === DISABLE ALL FACE BUTTONS === */
function disableAllFaceButtons() {
    const faceButtons = document.querySelectorAll('.face-button');
    faceButtons.forEach(button => {
        button.style.pointerEvents = 'none';
        button.classList.add('disabled');
    });
}

/* === UPDATE PROMPT === */
function updatePrompt() {
    const randomPrompt = getRandomPrompt(currentTargetEmotion);
    promptText.textContent = randomPrompt;
}

/* === GET RANDOM PROMPT === */
function getRandomPrompt(emotion) {
    const prompts = emotion.prompts;
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
}

/* === SPEAK PROMPT === */
function speakPrompt() {
    if (!soundEnabled) return;
    
    const promptToSpeak = promptText.textContent;
    speakText(promptToSpeak);
}

/* === END GAME === */
function endGame() {
    gameInProgress = false;
    
    // === SAVE STICKER REWARD ===
    saveSticker();
    
    // === SHOW END SCREEN ===
    showScreen('end');
    
    // === SPEAK COMPLETION MESSAGE ===
    setTimeout(() => {
        speakText('Fantastic! You found all the feelings! You earned a star sticker!');
    }, 500);
    
    // === ADD CELEBRATION ANIMATION ===
    setTimeout(() => {
        const stickerReward = document.querySelector('.sticker-reward');
        if (stickerReward) {
            stickerReward.classList.add('celebration');
        }
    }, 1000);
}

/* === SAVE STICKER TO STORAGE === */
function saveSticker() {
    // === GET CURRENT STICKER COUNT ===
    const currentCount = localStorage.getItem('kidsGames_stickerCount');
    const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
    
    // === SAVE NEW COUNT ===
    localStorage.setItem('kidsGames_stickerCount', newCount.toString());
    
    // === LOG COMPLETION ===
    console.log('Feelings Faces completed! Sticker saved. Total stickers:', newCount);
}

/* === SCREEN MANAGEMENT === */
function showScreen(screenType) {
    // === HIDE ALL SCREENS ===
    startScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    endScreen.classList.remove('active');
    
    // === SHOW REQUESTED SCREEN ===
    switch (screenType) {
        case 'start':
            startScreen.classList.add('active');
            break;
        case 'game':
            gameScreen.classList.add('active');
            break;
        case 'end':
            endScreen.classList.add('active');
            break;
    }
}

/* === NAVIGATION === */
function goBackToHub() {
    // === CONFIRM IF GAME IN PROGRESS ===
    if (gameInProgress) {
        const confirmLeave = confirm('Are you sure you want to leave the game?');
        if (!confirmLeave) return;
    }
    
    // === NAVIGATE TO HUB ===
    window.location.href = '../index.html';
}

/* === TEXT TO SPEECH === */
function speakText(text) {
    if (!soundEnabled) return;
    
    // === CHECK IF SPEECH SYNTHESIS IS AVAILABLE ===
    if ('speechSynthesis' in window) {
        // === CANCEL ANY CURRENT SPEECH ===
        window.speechSynthesis.cancel();
        
        // === CREATE NEW UTTERANCE ===
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        utterance.volume = 0.8;
        
        // === SPEAK THE TEXT ===
        window.speechSynthesis.speak(utterance);
    }
}

/* === UTILITY FUNCTIONS === */

/* === GET GAME STATUS === */
function getGameStatus() {
    return {
        round: currentRound,
        totalRounds: totalRounds,
        correct: correctAnswers,
        inProgress: gameInProgress
    };
}

/* === RESET GAME === */
function resetGame() {
    // === STOP ANY CURRENT SPEECH ===
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    // === RESET ALL VARIABLES ===
    currentRound = 1;
    correctAnswers = 0;
    gameInProgress = false;
    currentTargetEmotion = '';
    currentFaces = [];
    
    // === RETURN TO START SCREEN ===
    showScreen('start');
}