/* === ANIMAL PEEKABOO GAME JAVASCRIPT === */

// === GLOBAL GAME VARIABLES ===
let currentRound = 1;
let totalRounds = 5;
let gameActive = false;
let soundEnabled = true;
let currentAnimal = null;
let currentSpot = null;
let hideTimer = null;
let roundComplete = false;

// === ANIMAL DATA ===
const animals = [
    { emoji: '🐶', name: 'puppy', sound: 'woof' },
    { emoji: '🐱', name: 'kitty', sound: 'meow' },
    { emoji: '🐰', name: 'bunny', sound: 'hop' },
    { emoji: '🐸', name: 'froggy', sound: 'ribbit' },
    { emoji: '🐻', name: 'teddy bear', sound: 'growl' },
    { emoji: '🦆', name: 'duck', sound: 'quack' },
    { emoji: '🐷', name: 'piggy', sound: 'oink' },
    { emoji: '🐵', name: 'monkey', sound: 'ooh-ooh' }
];

// === DOM ELEMENTS ===
const instructionText = document.getElementById('instructionText');
const roundDisplay = document.getElementById('roundDisplay');
const hidingSpotsContainer = document.getElementById('hidingSpotsContainer');
const celebrationOverlay = document.getElementById('celebrationOverlay');
const celebrationText = document.getElementById('celebrationText');
const celebrationSubtitle = document.getElementById('celebrationSubtitle');
const continueBtn = document.getElementById('continueBtn');
const homeBtn = document.getElementById('homeBtn');
const soundBtn = document.getElementById('soundBtn');
const startGameBtn = document.getElementById('startGameBtn');
const allHidingSpots = document.querySelectorAll('.hiding-spot');

/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    loadGameSettings();
    setupEventListeners();
    startGame();
});

/* === LOAD GAME SETTINGS === */
function loadGameSettings() {
    // === LOAD SOUND PREFERENCE FROM PARENT HUB ===
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
    updateSoundButton();
}

/* === SETUP EVENT LISTENERS === */
function setupEventListeners() {
    // === HIDING SPOT CLICKS ===
    allHidingSpots.forEach(spot => {
        spot.addEventListener('click', handleSpotClick);
    });
    
    // === CONTROL BUTTONS ===
    homeBtn.addEventListener('click', handleHomeClick);
    soundBtn.addEventListener('click', handleSoundToggle);
    continueBtn.addEventListener('click', handleContinueClick);
    startGameBtn.addEventListener('click', handleStartGameClick);
    
    // === PREVENT DOUBLE-CLICKS ===
    hidingSpotsContainer.addEventListener('click', preventDoubleClick);
}

/* === START GAME === */
function startGame() {
    // === GAME IS READY BUT WAITING FOR USER TO START ===
    gameActive = false;  // Will be set to true when start button clicked
    roundComplete = false;
    updateRoundDisplay();
    
    // === SHOW READY MESSAGE === 
    instructionText.textContent = 'Ready to play peekaboo with animals?';
    startGameBtn.classList.add('bounce');
}

/* === HANDLE START GAME CLICK === */
function handleStartGameClick() {
    // === USER INTERACTION ENABLES AUDIO === 
    gameActive = true;
    
    // === HIDE START BUTTON ===
    startGameBtn.classList.add('fade-out');
    startGameBtn.classList.remove('bounce');
    
    setTimeout(() => {
        startGameBtn.style.display = 'none';
        showStartMessage();
    }, 300);
}

/* === SHOW START MESSAGE === */
function showStartMessage() {
    instructionText.textContent = 'Get ready to find the animals!';
    instructionText.classList.add('bounce');
    
    setTimeout(() => {
        instructionText.classList.remove('bounce');
        startRound();
    }, 2000);
}

/* === START ROUND === */
function startRound() {
    if (!gameActive) return;
    
    // === RESET ROUND STATE === 
    roundComplete = false;  // CRITICAL: Reset so clicks work in this round
    
    // === CLEAR ANY EXISTING ANIMALS ===
    clearAllAnimals();
    
    // === SELECT RANDOM ANIMAL AND SPOT ===
    currentAnimal = animals[Math.floor(Math.random() * animals.length)];
    currentSpot = Math.floor(Math.random() * allHidingSpots.length) + 1;
    
    // === SHOW INSTRUCTION ===
    instructionText.textContent = `Find the ${currentAnimal.name}!`;
    instructionText.classList.add('pop-animation');
    
    // === PLAY VOICE PROMPT ===
    if (soundEnabled) {
        playVoicePrompt(currentAnimal.name);
    }
    
    // === WAIT THEN SHOW ANIMAL ===
    setTimeout(() => {
        instructionText.classList.remove('pop-animation');
        showAnimalInSpot();
    }, 1500);
}

/* === SHOW ANIMAL IN SPOT === */
function showAnimalInSpot() {
    if (!gameActive) return;
    
    const targetSpot = document.querySelector(`[data-spot="${currentSpot}"]`);
    
    // === CREATE ANIMAL ELEMENT ===
    const animalElement = document.createElement('div');
    animalElement.className = 'animal-in-spot';
    animalElement.textContent = currentAnimal.emoji;
    animalElement.id = 'currentAnimal';
    
    // === POSITION ANIMAL IN SPOT ===
    targetSpot.appendChild(animalElement);
    targetSpot.classList.add('success-glow');
    
    // === PLAY ANIMAL SOUND ===
    if (soundEnabled) {
        setTimeout(() => playAnimalSound(currentAnimal.sound), 500);
    }
    
    // === SET TIMER TO HIDE ANIMAL ===
    hideTimer = setTimeout(() => {
        hideAnimal();
    }, 3000); // Animal visible for 3 seconds
}

/* === HIDE ANIMAL === */
function hideAnimal() {
    const animalElement = document.getElementById('currentAnimal');
    const targetSpot = document.querySelector(`[data-spot="${currentSpot}"]`);
    
    if (animalElement) {
        animalElement.classList.add('fade-out');
        targetSpot.classList.remove('success-glow');
        
        setTimeout(() => {
            animalElement.remove();
        }, 300);
    }
}

/* === HANDLE SPOT CLICK === */
function handleSpotClick(event) {
    if (!gameActive || roundComplete) return;
    
    const clickedSpot = event.currentTarget;
    const clickedSpotNumber = parseInt(clickedSpot.dataset.spot);
    
    // === CHECK IF CORRECT SPOT ===
    if (clickedSpotNumber === currentSpot) {
        handleCorrectGuess(clickedSpot);
    } else {
        handleIncorrectGuess(clickedSpot);
    }
}

/* === HANDLE CORRECT GUESS === */
function handleCorrectGuess(clickedSpot) {
    roundComplete = true;
    clearTimeout(hideTimer);
    
    // === VISUAL FEEDBACK ===
    clickedSpot.classList.add('correct-feedback');
    clickedSpot.classList.add('celebration');
    
    // === AUDIO FEEDBACK ===
    if (soundEnabled) {
        playSuccessSound();
        setTimeout(() => playCheerSound(), 300);
    }
    
    // === UPDATE INSTRUCTION ===
    instructionText.textContent = `Great job! You found the ${currentAnimal.name}!`;
    instructionText.classList.add('sparkle');
    
    // === CONTINUE TO NEXT ROUND ===
    setTimeout(() => {
        clickedSpot.classList.remove('correct-feedback', 'celebration');
        instructionText.classList.remove('sparkle');
        nextRound();
    }, 2500);
}

/* === HANDLE INCORRECT GUESS === */
function handleIncorrectGuess(clickedSpot) {
    // === VISUAL FEEDBACK ===
    clickedSpot.classList.add('try-again-feedback');
    clickedSpot.classList.add('shake');
    
    // === AUDIO FEEDBACK ===
    if (soundEnabled) {
        playTryAgainSound();
    }
    
    // === GENTLE ENCOURAGEMENT ===
    instructionText.textContent = `Try again! Look for the ${currentAnimal.name}!`;
    instructionText.classList.add('bounce');
    
    // === RESET FEEDBACK ===
    setTimeout(() => {
        clickedSpot.classList.remove('try-again-feedback', 'shake');
        instructionText.classList.remove('bounce');
    }, 1000);
}

/* === NEXT ROUND === */
function nextRound() {
    currentRound++;
    
    if (currentRound <= totalRounds) {
        // === CONTINUE TO NEXT ROUND ===
        updateRoundDisplay();
        clearAllAnimals();
        setTimeout(() => startRound(), 1000);
    } else {
        // === GAME COMPLETE ===
        completeGame();
    }
}

/* === COMPLETE GAME === */
function completeGame() {
    gameActive = false;
    
    // === SAVE STICKER REWARD ===
    saveSticker();
    
    // === SHOW CELEBRATION ===
    showGameCompleteCelebration();
}

/* === SAVE STICKER === */
function saveSticker() {
    const currentStickers = localStorage.getItem('kidsGames_stickerCount');
    const newCount = currentStickers ? parseInt(currentStickers) + 1 : 1;
    localStorage.setItem('kidsGames_stickerCount', newCount.toString());
}

/* === SHOW GAME COMPLETE CELEBRATION === */
function showGameCompleteCelebration() {
    celebrationText.textContent = 'Amazing Detective Work!';
    celebrationSubtitle.textContent = 'You found all the hidden animals! 🎉';
    
    celebrationOverlay.classList.remove('hidden');
    celebrationOverlay.classList.add('celebration', 'fade-in');
    
    // === PLAY VICTORY SOUND ===
    if (soundEnabled) {
        setTimeout(() => playVictorySound(), 500);
    }
}

/* === HANDLE CONTINUE CLICK === */
function handleContinueClick() {
    // === RETURN TO HUB ===
    returnToHub();
}

/* === RETURN TO HUB === */
function returnToHub() {
    // === ADD EXIT ANIMATION ===
    document.body.classList.add('fade-out');
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 300);
}

/* === HANDLE HOME CLICK === */
function handleHomeClick() {
    const confirmExit = confirm('Are you sure you want to go back to the main menu?');
    if (confirmExit) {
        returnToHub();
    }
}

/* === HANDLE SOUND TOGGLE === */
function handleSoundToggle() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('kidsGames_soundEnabled', soundEnabled.toString());
    updateSoundButton();
    
    // === FEEDBACK ANIMATION ===
    soundBtn.classList.add('pop-animation');
    setTimeout(() => {
        soundBtn.classList.remove('pop-animation');
    }, 300);
}

/* === UPDATE SOUND BUTTON === */
function updateSoundButton() {
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    soundBtn.title = soundEnabled ? 'Turn Sound Off' : 'Turn Sound On';
}

/* === UPDATE ROUND DISPLAY === */
function updateRoundDisplay() {
    roundDisplay.textContent = `Round ${currentRound} of ${totalRounds}`;
}

/* === CLEAR ALL ANIMALS === */
function clearAllAnimals() {
    const existingAnimals = document.querySelectorAll('.animal-in-spot');
    existingAnimals.forEach(animal => animal.remove());
    
    // === CLEAR SPOT EFFECTS ===
    allHidingSpots.forEach(spot => {
        spot.classList.remove('success-glow', 'correct-feedback', 'try-again-feedback');
    });
    
    clearTimeout(hideTimer);
}

/* === PREVENT DOUBLE-CLICK === */
function preventDoubleClick(event) {
    event.preventDefault();
}

/* === AUDIO FUNCTIONS === */

/* === PLAY VOICE PROMPT === */
function playVoicePrompt(animalName) {
    // === CREATE SYNTHETIC SPEECH ===
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Find the ${animalName}!`);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
    }
}

/* === PLAY ANIMAL SOUND === */
function playAnimalSound(soundType) {
    // === SIMPLE SOUND SIMULATION ===
    const context = new (window.AudioContext || window.webkitAudioContext)();
    
    // === DIFFERENT FREQUENCIES FOR DIFFERENT ANIMALS ===
    const soundMap = {
        'woof': [200, 150],
        'meow': [300, 250],
        'hop': [400, 350],
        'ribbit': [180, 120],
        'growl': [100, 80],
        'quack': [250, 200],
        'oink': [150, 100],
        'ooh-ooh': [350, 300]
    };
    
    const frequencies = soundMap[soundType] || [200, 150];
    playBeepSequence(context, frequencies);
}

/* === PLAY SUCCESS SOUND === */
function playSuccessSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    playBeepSequence(context, [523, 659, 784]); // C-E-G major chord
}

/* === PLAY CHEER SOUND === */
function playCheerSound() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Hooray!');
        utterance.rate = 1.2;
        utterance.pitch = 1.4;
        utterance.volume = 0.9;
        speechSynthesis.speak(utterance);
    }
}

/* === PLAY TRY AGAIN SOUND === */
function playTryAgainSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    playBeepSequence(context, [300, 250]); // Gentle descending notes
}

/* === PLAY VICTORY SOUND === */
function playVictorySound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    // === VICTORY FANFARE ===
    playBeepSequence(context, [523, 659, 784, 1047]); // C-E-G-C octave
    
    if ('speechSynthesis' in window) {
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance('You did it! Great job!');
            utterance.rate = 1.0;
            utterance.pitch = 1.3;
            utterance.volume = 0.9;
            speechSynthesis.speak(utterance);
        }, 500);
    }
}

/* === PLAY BEEP SEQUENCE === */
function playBeepSequence(context, frequencies) {
    frequencies.forEach((freq, index) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = context.currentTime + (index * 0.2);
        const endTime = startTime + 0.15;
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
    });
}
