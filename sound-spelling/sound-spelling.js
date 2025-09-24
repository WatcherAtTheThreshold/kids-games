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
const repeatButton = document.getElementById('repeatButton');
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
    
    // === REPEAT BUTTON ===
    repeatButton.addEventListener('click', handleRepeatPrompt);
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
    const currentWord = gameWords[currentWordIndex].word;
    
    // === SHOW CELEBRATION MESSAGE ===
    celebrationMessage.textContent = `Great job! You spelled ${currentWord}! 🌟`;
    celebrationMessage.classList.add('show');
    
    // === ADD CELEBRATION ANIMATIONS ===
    spellingArea.classList.add('celebration');
    
    // === PLAY CELEBRATION SOUND AND SPEECH ===
    playCelebrationSound();
    speakCelebration(`Great job! You spelled ${currentWord}!`);
    
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
    
    // === SPEAK FINAL CELEBRATION ===
    speakCelebration('Amazing! You completed all words! Great job spelling!');
    
    // === AWARD STICKER ===
    awardSticker();
    
    // === RETURN TO HUB AFTER CELEBRATION ===
    setTimeout(() => {
        returnToHub();
    }, 4000); // Extra time for final speech
}

/* === AWARD SPECIFIC STICKER === */
function awardSticker() {
    const gameKey = 'sound-spelling';
    
    // === GET CURRENT EARNED STICKERS ===
    const earnedStickers = localStorage.getItem('kidsGames_earnedStickers') || '';
    const stickerList = earnedStickers ? earnedStickers.split(',').filter(s => s.length > 0) : [];
    
    // === CHECK IF ALREADY EARNED ===
    if (stickerList.includes(gameKey)) {
        console.log(`Sticker ${gameKey} already earned`);
        return; // Already earned, don't duplicate
    }
    
    // === ADD NEW STICKER ===
    stickerList.push(gameKey);
    
    // === SAVE UPDATED LIST ===
    localStorage.setItem('kidsGames_earnedStickers', stickerList.join(','));
    
    // === UPDATE COUNT FOR BACKWARD COMPATIBILITY ===
    localStorage.setItem('kidsGames_stickerCount', stickerList.length.toString());
    
    console.log(`🔤 Sound Spelling sticker earned! Total: ${stickerList.length}`);
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
    if (!soundEnabled) return;
    
    // === CHECK IF SPEECH SYNTHESIS IS AVAILABLE ===
    if ('speechSynthesis' in window) {
        // === CANCEL ANY PREVIOUS SPEECH ===
        window.speechSynthesis.cancel();
        
        // === CREATE SPEECH UTTERANCE ===
        const utterance = new SpeechSynthesisUtterance(text);
        
        // === CONFIGURE SPEECH SETTINGS ===
        utterance.rate = 0.8; // Slightly slower for kids
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 0.8; // Good volume level
        
        // === TRY TO USE A CHILD-FRIENDLY VOICE ===
        const voices = window.speechSynthesis.getVoices();
        const childFriendlyVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Karen') || 
            voice.name.includes('Samantha') ||
            voice.lang.startsWith('en')
        );
        
        if (childFriendlyVoice) {
            utterance.voice = childFriendlyVoice;
        }
        
        // === SPEAK THE TEXT ===
        window.speechSynthesis.speak(utterance);
        
        console.log(`Speaking: ${text}`);
    } else {
        // === FALLBACK TO TONE ===
        playTone(440, 0.3, 0.1);
        console.log(`Audio prompt: ${text}`);
    }
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

/* === SPEAK CELEBRATION === */
function speakCelebration(text) {
    if (!soundEnabled) return;
    
    if ('speechSynthesis' in window) {
        // === WAIT A MOMENT THEN SPEAK ===
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.2; // Higher pitch for excitement
            utterance.volume = 0.9;
            
            const voices = window.speechSynthesis.getVoices();
            const childFriendlyVoice = voices.find(voice => 
                voice.name.includes('Google') || 
                voice.name.includes('Karen') || 
                voice.name.includes('Samantha') ||
                voice.lang.startsWith('en')
            );
            
            if (childFriendlyVoice) {
                utterance.voice = childFriendlyVoice;
            }
            
            window.speechSynthesis.speak(utterance);
            console.log(`Speaking celebration: ${text}`);
        }, 200);
    }
}

/* === HANDLE REPEAT PROMPT === */
function handleRepeatPrompt() {
    // === ADD BUTTON FEEDBACK ===
    repeatButton.classList.add('pop-animation');
    
    // === REPEAT THE CURRENT PROMPT ===
    repeatPrompt();
    
    // === REMOVE ANIMATION ===
    setTimeout(() => {
        repeatButton.classList.remove('pop-animation');
    }, 300);
}

/* === REPEAT CURRENT PROMPT === */
function repeatPrompt() {
    if (currentWordIndex < gameWords.length) {
        const currentWord = gameWords[currentWordIndex];
        playAudioPrompt(currentWord.audio);
    }
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
