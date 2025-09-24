/* === SOUND SPELLING GAME - COMPLETE LOGIC === */

// === GLOBAL VARIABLES ===
let currentWordIndex = 0;
let currentLetterPosition = 0;
let gameWords = [];
let audioContext = null;
let soundEnabled = true;
let gameCompleted = false;

// === GAME WORDS DATA ===
const WORD_DATA = [
    {
        word: 'CAT',
        picture: '🐱',
        audio: 'Can you spell CAT?'
    },
    {
        word: 'DOG', 
        picture: '🐶',
        audio: 'Can you spell DOG?'
    },
    {
        word: 'SUN',
        picture: '☀️',
        audio: 'Can you spell SUN?'
    },
    {
        word: 'BEE',
        picture: '🐝',
        audio: 'Can you spell BEE?'
    },
    {
        word: 'HAT',
        picture: '👒',
        audio: 'Can you spell HAT?'
    }
];

// === WRONG LETTERS POOL ===
const WRONG_LETTERS = ['X', 'Z', 'Q', 'J', 'V', 'W', 'Y', 'K', 'F', 'P', 'M', 'L'];

// === DOM ELEMENTS ===
const startScreen = document.getElementById('startScreen');
const loadingState = document.getElementById('loadingState');
const gameContent = document.getElementById('gameContent');
const startGameButton = document.getElementById('startGameButton');
const backToHubButton = document.getElementById('backToHub');
const wordPicture = document.getElementById('wordPicture');
const wordInstruction = document.getElementById('wordInstruction');
const spellingArea = document.getElementById('spellingArea');
const lettersArea = document.getElementById('lettersArea');
const celebrationMessage = document.getElementById('celebrationMessage');
const roundCounter = document.getElementById('roundCounter');

/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    loadSoundPreference();
    setupEventListeners();
    shuffleWords();
});

/* === LOAD SOUND PREFERENCE === */
function loadSoundPreference() {
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
}

/* === SHUFFLE GAME WORDS === */
function shuffleWords() {
    gameWords = [...WORD_DATA];
    // === SIMPLE SHUFFLE ALGORITHM ===
    for (let i = gameWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameWords[i], gameWords[j]] = [gameWords[j], gameWords[i]];
    }
}

/* === SETUP EVENT LISTENERS === */
function setupEventListeners() {
    // === START GAME BUTTON ===
    startGameButton.addEventListener('click', handleStartGame);
    
    // === BACK TO HUB BUTTON ===
    backToHubButton.addEventListener('click', handleBackToHub);
}

/* === HANDLE START GAME === */
function handleStartGame() {
    // === INITIALIZE AUDIO CONTEXT ===
    initializeAudio();
    
    // === ADD BUTTON FEEDBACK ===
    startGameButton.classList.add('pop-animation');
    
    // === TRANSITION TO LOADING ===
    setTimeout(() => {
        startScreen.classList.add('fade-out');
        setTimeout(() => {
            startScreen.classList.add('hidden');
            loadingState.classList.remove('hidden');
            loadingState.classList.add('fade-in');
            
            // === START FIRST WORD AFTER LOADING ===
            setTimeout(() => {
                startFirstWord();
            }, 1500);
        }, 300);
    }, 200);
}

/* === INITIALIZE AUDIO CONTEXT === */
function initializeAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context initialized');
    } catch (error) {
        console.log('Audio context initialization failed:', error);
        audioContext = null;
    }
}

/* === START FIRST WORD === */
function startFirstWord() {
    // === HIDE LOADING AND SHOW GAME ===
    loadingState.classList.add('fade-out');
    setTimeout(() => {
        loadingState.classList.add('hidden');
        gameContent.classList.remove('hidden');
        gameContent.classList.add('fade-in');
        
        // === SETUP FIRST WORD ===
        setupCurrentWord();
    }, 300);
}

/* === SETUP CURRENT WORD === */
function setupCurrentWord() {
    const currentWord = gameWords[currentWordIndex];
    currentLetterPosition = 0;
    
    // === UPDATE DISPLAY ELEMENTS ===
    wordPicture.textContent = currentWord.picture;
    wordInstruction.textContent = `Can you spell ${currentWord.word}?`;
    roundCounter.textContent = `Word ${currentWordIndex + 1} of 5`;
    
    // === CREATE SPELLING SLOTS ===
    createSpellingSlots(currentWord.word);
    
    // === CREATE LETTER BUTTONS ===
    createLetterButtons(currentWord.word);
    
    // === PLAY AUDIO PROMPT ===
    setTimeout(() => {
        playAudioPrompt(currentWord.audio);
    }, 500);
}

/* === CREATE SPELLING SLOTS === */
function createSpellingSlots(word) {
    spellingArea.innerHTML = '';
    
    // === CREATE SLOT FOR EACH LETTER ===
    for (let i = 0; i < word.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        slot.dataset.position = i;
        spellingArea.appendChild(slot);
    }
}

/* === CREATE LETTER BUTTONS === */
function createLetterButtons(word) {
    lettersArea.innerHTML = '';
    
    // === GET CORRECT LETTERS ===
    const correctLetters = word.split('');
    
    // === ADD WRONG LETTERS ===
    const wrongLetters = getRandomWrongLetters(correctLetters.length);
    
    // === COMBINE AND SHUFFLE ===
    const allLetters = [...correctLetters, ...wrongLetters];
    shuffleArray(allLetters);
    
    // === CREATE BUTTONS ===
    allLetters.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'letter-button big-touch-target';
        button.textContent = letter;
        button.dataset.letter = letter;
        button.addEventListener('click', handleLetterClick);
        lettersArea.appendChild(button);
    });
}

/* === GET RANDOM WRONG LETTERS === */
function getRandomWrongLetters(numCorrect) {
    const numWrong = Math.min(3, Math.floor(numCorrect * 0.8) + 1);
    const shuffledWrong = [...WRONG_LETTERS];
    shuffleArray(shuffledWrong);
    return shuffledWrong.slice(0, numWrong);
}

/* === SHUFFLE ARRAY === */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/* === HANDLE LETTER CLICK === */
function handleLetterClick(event) {
    const button = event.currentTarget;
    const letter = button.dataset.letter;
    const currentWord = gameWords[currentWordIndex];
    
    // === CHECK IF BUTTON IS ALREADY USED ===
    if (button.classList.contains('used')) {
        return;
    }
    
    // === CHECK IF CORRECT LETTER ===
    if (letter === currentWord.word[currentLetterPosition]) {
        handleCorrectLetter(button, letter);
    } else {
        handleWrongLetter(button);
    }
}

/* === HANDLE CORRECT LETTER === */
function handleCorrectLetter(button, letter) {
    // === ADD VISUAL FEEDBACK ===
    button.classList.add('correct-feedback', 'used');
    
    // === FILL SPELLING SLOT ===
    const slot = document.querySelector(`[data-position="${currentLetterPosition}"]`);
    slot.textContent = letter;
    slot.classList.add('filled');
    
    // === PLAY SUCCESS SOUND ===
    playSuccessSound();
    
    // === ADVANCE POSITION ===
    currentLetterPosition++;
    
    // === CHECK IF WORD COMPLETE ===
    if (currentLetterPosition >= gameWords[currentWordIndex].word.length) {
        handleWordComplete();
    }
}

/* === HANDLE WRONG LETTER === */
function handleWrongLetter(button) {
    // === ADD TRY AGAIN FEEDBACK ===
    button.classList.add('try-again-feedback');
    
    // === PLAY TRY AGAIN SOUND ===
    playTryAgainSound();
    
    // === REMOVE FEEDBACK AFTER ANIMATION ===
    setTimeout(() => {
        button.classList.remove('try-again-feedback');
    }, 600);
}

/* === HANDLE WORD COMPLETE === */
function handleWordComplete() {
    // === SHOW CELEBRATION MESSAGE ===
    celebrationMessage.textContent = `Great job! You spelled ${gameWords[currentWordIndex].word}! 🌟`;
    celebrationMessage.classList.add('show');
    
    // === ADD CELEBRATION ANIMATIONS ===
    spellingArea.classList.add('celebration');
    
    // === PLAY CELEBRATION SOUND ===
    playCelebrationSound();
    
    // === MOVE TO NEXT WORD OR FINISH GAME ===
    setTimeout(() => {
        if (currentWordIndex < gameWords.length - 1) {
            moveToNextWord();
        } else {
            finishGame();
        }
    }, 2500);
}

/* === MOVE TO NEXT WORD === */
function moveToNextWord() {
    // === RESET ANIMATIONS ===
    celebrationMessage.classList.remove('show');
    spellingArea.classList.remove('celebration');
    
    // === ADVANCE TO NEXT WORD ===
    currentWordIndex++;
    
    // === SETUP NEXT WORD ===
    setTimeout(() => {
        setupCurrentWord();
    }, 500);
}

/* === FINISH GAME === */
function finishGame() {
    if (gameCompleted) return;
    gameCompleted = true;
    
    // === UPDATE CELEBRATION MESSAGE ===
    celebrationMessage.textContent = '🎉 Amazing! You completed all words! 🎉';
    
    // === AWARD STICKER ===
    awardSticker();
    
    // === RETURN TO HUB AFTER CELEBRATION ===
    setTimeout(() => {
        returnToHub();
    }, 3000);
}

/* === AWARD STICKER === */
function awardSticker() {
    // === GET CURRENT STICKER COUNT ===
    const currentStickers = localStorage.getItem('kidsGames_stickerCount');
    const stickerCount = currentStickers ? parseInt(currentStickers) : 0;
    
    // === INCREMENT STICKER COUNT ===
    const newStickerCount = stickerCount + 1;
    localStorage.setItem('kidsGames_stickerCount', newStickerCount.toString());
    
    console.log(`Sticker awarded! New total: ${newStickerCount}`);
}

/* === RETURN TO HUB === */
function returnToHub() {
    // === ADD FADE OUT EFFECT ===
    gameContent.classList.add('fade-out');
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 300);
}

/* === HANDLE BACK TO HUB === */
function handleBackToHub() {
    // === CONFIRM IF IN MIDDLE OF GAME ===
    if (currentWordIndex > 0 && !gameCompleted) {
        if (confirm('Are you sure you want to go back? Your progress will be lost.')) {
            returnToHub();
        }
    } else {
        returnToHub();
    }
}

/* === AUDIO FUNCTIONS === */

/* === PLAY AUDIO PROMPT === */
function playAudioPrompt(text) {
    if (!soundEnabled || !audioContext) return;
    
    // === SIMPLE AUDIO FEEDBACK ===
    playTone(440, 0.3, 0.1); // Pleasant prompt tone
    
    // === IN REAL APP: Use speech synthesis or audio files ===
    console.log(`Audio prompt: ${text}`);
}

/* === PLAY SUCCESS SOUND === */
function playSuccessSound() {
    if (!soundEnabled || !audioContext) return;
    
    // === SUCCESS CHORD ===
    playTone(523, 0.2, 0.15); // C note
    setTimeout(() => playTone(659, 0.2, 0.15), 100); // E note
}

/* === PLAY TRY AGAIN SOUND === */
function playTryAgainSound() {
    if (!soundEnabled || !audioContext) return;
    
    // === GENTLE INCORRECT SOUND ===
    playTone(220, 0.1, 0.3); // Low A note
}

/* === PLAY CELEBRATION SOUND === */
function playCelebrationSound() {
    if (!soundEnabled || !audioContext) return;
    
    // === CELEBRATION SEQUENCE ===
    playTone(523, 0.2, 0.15); // C
    setTimeout(() => playTone(659, 0.2, 0.15), 150); // E
    setTimeout(() => playTone(784, 0.2, 0.15), 300); // G
    setTimeout(() => playTone(1047, 0.3, 0.2), 450); // High C
}

/* === PLAY TONE === */
function playTone(frequency, volume, duration) {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log('Error playing tone:', error);
    }
}

/* === UTILITY FUNCTIONS === */

/* === GET SOUND ENABLED STATUS === */
function getSoundEnabled() {
    return soundEnabled;
}

/* === GET CURRENT PROGRESS === */
function getCurrentProgress() {
    return {
        currentWord: currentWordIndex + 1,
        totalWords: gameWords.length,
        completed: gameCompleted
    };
}