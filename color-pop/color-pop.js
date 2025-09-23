/* === COLOR POP GAME JAVASCRIPT === */

// === GLOBAL GAME VARIABLES ===
let currentRound = 1;
let totalRounds = 5;
let targetColor = '';
let balloons = [];
let gameActive = false;
let soundEnabled = true;
let roundComplete = false;

// === GAME COLORS ARRAY ===
const gameColors = [
    { name: 'red', display: 'Red' },
    { name: 'blue', display: 'Blue' },
    { name: 'yellow', display: 'Yellow' },
    { name: 'green', display: 'Green' },
    { name: 'purple', display: 'Purple' },
    { name: 'orange', display: 'Orange' }
];

// === BALLOON FACES ARRAY ===
const balloonFaces = ['😊', '😄', '🙂', '😃', '😁', '🥰'];

// === DOM ELEMENTS ===
const gameArea = document.getElementById('gameArea');
const instructionText = document.getElementById('instructionText');
const progressIndicator = document.getElementById('progressIndicator');
const backButton = document.getElementById('backButton');
const celebrationOverlay = document.getElementById('celebrationOverlay');
const celebrationText = document.getElementById('celebrationText');
const continueButton = document.getElementById('continueButton');

/* === GAME INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    loadSoundPreference();
    
    // === iOS FIX: INITIALIZE SPEECH ON FIRST TOUCH ===
    initializeSpeechForIOS();
});

/* === INITIALIZE GAME === */
function initializeGame() {
    // === RESET GAME STATE ===
    currentRound = 1;
    gameActive = false;
    roundComplete = false;
    
    // === SHOW WELCOME MESSAGE ===
    updateInstruction('Get ready to pop balloons!', '👀', '🎈');
    updateProgress();
    
    // === START FIRST ROUND AFTER DELAY ===
    setTimeout(() => {
        startNewRound();
    }, 2000);
}

/* === SETUP EVENT LISTENERS === */
function setupEventListeners() {
    // === BACK BUTTON ===
    backButton.addEventListener('click', handleBackToHub);
    
    // === CONTINUE BUTTON ===
    continueButton.addEventListener('click', handleContinueFromCelebration);
    
    // === PREVENT ACCIDENTAL SELECTIONS DURING TRANSITIONS ===
    document.addEventListener('click', handleDocumentClick);
}

/* === INITIALIZE SPEECH FOR iOS === */
function initializeSpeechForIOS() {
    // === iOS REQUIRES USER INTERACTION FOR SPEECH ===
    let speechInitialized = false;
    
    function initSpeech() {
        if (speechInitialized) return;
        
        if ('speechSynthesis' in window) {
            // === TRIGGER SPEECH SYNTHESIS TO "WAKE IT UP" ===
            const testUtterance = new SpeechSynthesisUtterance('');
            testUtterance.volume = 0;
            speechSynthesis.speak(testUtterance);
            speechInitialized = true;
        }
    }
    
    // === INITIALIZE ON FIRST TOUCH/CLICK ===
    document.addEventListener('touchstart', initSpeech, { once: true });
    document.addEventListener('click', initSpeech, { once: true });
}

/* === LOAD SOUND PREFERENCE === */
function loadSoundPreference() {
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
}
function loadSoundPreference() {
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
}

/* === START NEW ROUND === */
function startNewRound() {
    // === RESET ROUND STATE ===
    roundComplete = false;
    gameActive = false;
    
    // === CLEAR PREVIOUS BALLOONS ===
    clearBalloons();
    
    // === SELECT TARGET COLOR ===
    selectTargetColor();
    
    // === CREATE BALLOONS ===
    createBalloons();
    
    // === UPDATE INSTRUCTION WITH COLOR STYLING ===
    updateInstructionWithColor(`Find the ${targetColor.display} balloon!`, '👆', '🎈', targetColor.name);
    
    // === PLAY VOICE PROMPT ===
    playVoicePrompt(targetColor.display);
    
    // === ACTIVATE GAME AFTER VOICE PROMPT ===
    setTimeout(() => {
        gameActive = true;
        addBalloonEventListeners();
    }, 1500);
}

/* === SELECT TARGET COLOR === */
function selectTargetColor() {
    // === RANDOMLY SELECT FROM AVAILABLE COLORS ===
    const randomIndex = Math.floor(Math.random() * gameColors.length);
    targetColor = gameColors[randomIndex];
}

/* === CREATE BALLOONS === */
function createBalloons() {
    balloons = [];
    
    // === CREATE 4-6 BALLOONS ===
    const balloonCount = 4 + Math.floor(Math.random() * 3); // 4-6 balloons
    
    // === ENSURE TARGET COLOR IS INCLUDED ===
    const colorsToUse = [targetColor];
    
    // === ADD RANDOM OTHER COLORS ===
    while (colorsToUse.length < balloonCount) {
        const randomColor = gameColors[Math.floor(Math.random() * gameColors.length)];
        if (!colorsToUse.find(color => color.name === randomColor.name)) {
            colorsToUse.push(randomColor);
        }
    }
    
    // === SHUFFLE COLORS ===
    shuffleArray(colorsToUse);
    
    // === CREATE BALLOON ELEMENTS ===
    for (let i = 0; i < balloonCount; i++) {
        createBalloon(colorsToUse[i], i, balloonCount);
    }
}

/* === CREATE INDIVIDUAL BALLOON === */
function createBalloon(color, index, totalCount) {
    // === CREATE BALLOON ELEMENT ===
    const balloon = document.createElement('div');
    balloon.classList.add('balloon', color.name);
    balloon.dataset.color = color.name;
    
    // === ADD FACE EMOJI ===
    const randomFace = balloonFaces[Math.floor(Math.random() * balloonFaces.length)];
    balloon.textContent = randomFace;
    
    // === POSITION BALLOON ===
    positionBalloon(balloon, index, totalCount);
    
    // === ADD FLOATING ANIMATION ===
    balloon.classList.add('float');
    
    // === ADD TO GAME AREA ===
    gameArea.appendChild(balloon);
    balloons.push(balloon);
}

/* === POSITION BALLOON IN GAME AREA === */
function positionBalloon(balloon, index, totalCount) {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const balloonSize = 120;
    const padding = 20;
    
    // === CALCULATE SAFE POSITIONING AREA ===
    const maxX = gameArea.offsetWidth - balloonSize - padding;
    const maxY = gameArea.offsetHeight - balloonSize - padding;
    
    // === USE GRID-LIKE POSITIONING FOR BETTER DISTRIBUTION ===
    const cols = Math.ceil(Math.sqrt(totalCount));
    const rows = Math.ceil(totalCount / cols);
    
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // === BASE POSITION WITH RANDOM OFFSET ===
    const baseX = (maxX / (cols - 1 || 1)) * col;
    const baseY = (maxY / (rows - 1 || 1)) * row;
    
    // === ADD RANDOM OFFSET FOR NATURAL LOOK ===
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;
    
    // === CLAMP TO SAFE AREA ===
    const finalX = Math.max(padding, Math.min(maxX, baseX + offsetX));
    const finalY = Math.max(padding, Math.min(maxY, baseY + offsetY));
    
    // === SET POSITION ===
    balloon.style.left = finalX + 'px';
    balloon.style.top = finalY + 'px';
}

/* === ADD EVENT LISTENERS TO BALLOONS === */
function addBalloonEventListeners() {
    balloons.forEach(balloon => {
        balloon.addEventListener('click', handleBalloonClick);
    });
}

/* === HANDLE BALLOON CLICK === */
function handleBalloonClick(event) {
    // === PREVENT ACTION IF GAME NOT ACTIVE ===
    if (!gameActive || roundComplete) {
        return;
    }
    
    const clickedBalloon = event.currentTarget;
    const clickedColor = clickedBalloon.dataset.color;
    
    // === CHECK IF CORRECT COLOR ===
    if (clickedColor === targetColor.name) {
        handleCorrectChoice(clickedBalloon);
    } else {
        handleIncorrectChoice(clickedBalloon);
    }
}

/* === HANDLE CORRECT CHOICE === */
function handleCorrectChoice(balloon) {
    // === DISABLE FURTHER CLICKS ===
    gameActive = false;
    roundComplete = true;
    
    // === VISUAL FEEDBACK ===
    balloon.classList.add('correct-feedback', 'pop-animation');
    
    // === AUDIO FEEDBACK ===
    playPopSound();
    playCheerSound();
    
    // === UPDATE INSTRUCTION ===
    updateInstruction('Great job!', '🎉', '⭐');
    
    // === REMOVE OTHER BALLOONS ===
    setTimeout(() => {
        removeOtherBalloons(balloon);
    }, 500);
    
    // === PROCEED TO NEXT ROUND OR FINISH ===
    setTimeout(() => {
        proceedToNextRoundOrFinish();
    }, 2000);
}

/* === HANDLE INCORRECT CHOICE === */
function handleIncorrectChoice(balloon) {
    // === VISUAL FEEDBACK ===
    balloon.classList.add('try-again-feedback', 'shake');
    
    // === AUDIO FEEDBACK ===
    playTryAgainSound();
    
    // === UPDATE INSTRUCTION ===
    updateInstructionWithColor(`Try again! Find the ${targetColor.display} balloon!`, '🤔', '🎈', targetColor.name);
    
    // === REMOVE FEEDBACK AFTER ANIMATION ===
    setTimeout(() => {
        balloon.classList.remove('try-again-feedback', 'shake');
    }, 1000);
}

/* === REMOVE OTHER BALLOONS === */
function removeOtherBalloons(correctBalloon) {
    balloons.forEach(balloon => {
        if (balloon !== correctBalloon) {
            balloon.classList.add('fade-out');
            setTimeout(() => {
                if (balloon.parentNode) {
                    balloon.parentNode.removeChild(balloon);
                }
            }, 300);
        }
    });
}

/* === PROCEED TO NEXT ROUND OR FINISH === */
function proceedToNextRoundOrFinish() {
    if (currentRound < totalRounds) {
        // === MOVE TO NEXT ROUND ===
        currentRound++;
        updateProgress();
        startNewRound();
    } else {
        // === FINISH GAME ===
        finishGame();
    }
}

/* === FINISH GAME === */
function finishGame() {
    // === AWARD STICKER ===
    awardSticker();
    
    // === SHOW FINAL CELEBRATION ===
    showGameCompletion();
}

/* === AWARD STICKER === */
function awardSticker() {
    // === GET CURRENT STICKER COUNT ===
    let currentStickers = localStorage.getItem('kidsGames_stickerCount');
    currentStickers = currentStickers ? parseInt(currentStickers) : 0;
    
    // === INCREMENT STICKER COUNT ===
    currentStickers++;
    
    // === SAVE TO STORAGE ===
    localStorage.setItem('kidsGames_stickerCount', currentStickers.toString());
}

/* === SHOW GAME COMPLETION === */
function showGameCompletion() {
    // === UPDATE CELEBRATION TEXT ===
    celebrationText.textContent = 'Amazing! You popped all the balloons!';
    
    // === SHOW CELEBRATION OVERLAY ===
    celebrationOverlay.style.display = 'flex';
    
    // === ADD CELEBRATION ANIMATION ===
    const celebrationContent = document.querySelector('.celebration-content');
    celebrationContent.classList.add('celebration', 'fade-in');
    
    // === PLAY COMPLETION SOUND ===
    playCompletionSound();
}

/* === HANDLE CONTINUE FROM CELEBRATION === */
function handleContinueFromCelebration() {
    // === HIDE CELEBRATION ===
    celebrationOverlay.style.display = 'none';
    
    // === RETURN TO HUB ===
    returnToHub();
}

/* === CLEAR BALLOONS === */
function clearBalloons() {
    balloons.forEach(balloon => {
        if (balloon.parentNode) {
            balloon.parentNode.removeChild(balloon);
        }
    });
    balloons = [];
}

/* === UPDATE INSTRUCTION TEXT WITH COLOR === */
function updateInstructionWithColor(text, emoji1, emoji2, colorName) {
    const colorStyles = {
        'red': '#ff6b6b',
        'blue': '#48dbfb', 
        'yellow': '#f9ca24',
        'green': '#4ecdc4',
        'purple': '#9b59b6',
        'orange': '#ffa726'
    };
    
    const colorHex = colorStyles[colorName] || '#333';
    
    const newHTML = `
        <span class="instruction-emoji">${emoji1}</span>
        ${text.replace(colorName.charAt(0).toUpperCase() + colorName.slice(1), 
            `<span style="color: ${colorHex}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${colorName.charAt(0).toUpperCase() + colorName.slice(1)}</span>`)}
        <span class="instruction-emoji">${emoji2}</span>
    `;
    instructionText.innerHTML = newHTML;
}

/* === UPDATE INSTRUCTION TEXT === */
function updateInstruction(text, emoji1, emoji2) {
    const instructionEmojis = document.querySelectorAll('.instruction-emoji');
    
    if (instructionEmojis.length >= 2) {
        instructionEmojis[0].textContent = emoji1;
        instructionEmojis[1].textContent = emoji2;
    }
    
    // === UPDATE TEXT BETWEEN EMOJIS ===
    const textParts = instructionText.innerHTML.split('<span class="instruction-emoji">');
    if (textParts.length >= 3) {
        const newHTML = `
            <span class="instruction-emoji">${emoji1}</span>
            ${text}
            <span class="instruction-emoji">${emoji2}</span>
        `;
        instructionText.innerHTML = newHTML;
    }
}
function updateInstruction(text, emoji1, emoji2) {
    const instructionEmojis = document.querySelectorAll('.instruction-emoji');
    
    if (instructionEmojis.length >= 2) {
        instructionEmojis[0].textContent = emoji1;
        instructionEmojis[1].textContent = emoji2;
    }
    
    // === UPDATE TEXT BETWEEN EMOJIS ===
    const textParts = instructionText.innerHTML.split('<span class="instruction-emoji">');
    if (textParts.length >= 3) {
        const newHTML = `
            <span class="instruction-emoji">${emoji1}</span>
            ${text}
            <span class="instruction-emoji">${emoji2}</span>
        `;
        instructionText.innerHTML = newHTML;
    }
}

/* === UPDATE PROGRESS INDICATOR === */
function updateProgress() {
    progressIndicator.textContent = `Round ${currentRound} of ${totalRounds}`;
}

/* === HANDLE BACK TO HUB === */
function handleBackToHub() {
    // === CONFIRM IF GAME IN PROGRESS ===
    if (gameActive || currentRound > 1) {
        const confirmExit = confirm('Are you sure you want to go back? Your progress will be lost.');
        if (!confirmExit) {
            return;
        }
    }
    
    returnToHub();
}

/* === RETURN TO HUB === */
function returnToHub() {
    // === CLEAN UP GAME ===
    gameActive = false;
    clearBalloons();
    
    // === NAVIGATE BACK ===
    window.location.href = '../index.html';
}

/* === PREVENT DOCUMENT CLICKS DURING TRANSITIONS === */
function handleDocumentClick(event) {
    // === ALLOW CLICKS ON BALLOONS AND BUTTONS ===
    if (event.target.classList.contains('balloon') || 
        event.target.classList.contains('back-button') ||
        event.target.classList.contains('continue-button')) {
        return;
    }
    
    // === PREVENT OTHER CLICKS DURING ANIMATIONS ===
    if (!gameActive) {
        event.preventDefault();
        event.stopPropagation();
    }
}

/* === AUDIO FUNCTIONS === */

/* === PLAY VOICE PROMPT === */
function playVoicePrompt(colorName) {
    if (!soundEnabled) return;
    
    // === USE SPEECH SYNTHESIS WITH iOS FIXES ===
    if ('speechSynthesis' in window) {
        // === iOS FIX: CANCEL ANY PENDING SPEECH ===
        speechSynthesis.cancel();
        
        // === CREATE UTTERANCE ===
        const utterance = new SpeechSynthesisUtterance(`Find ${colorName}!`);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        utterance.volume = 1.0; // Max volume for iOS
        
        // === iOS FIX: SET VOICE EXPLICITLY ===
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            // === PREFER ENGLISH VOICES ===
            const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
        }
        
        // === iOS FIX: HANDLE VOICE LOADING ===
        if (voices.length === 0) {
            // === WAIT FOR VOICES TO LOAD ===
            speechSynthesis.addEventListener('voiceschanged', function() {
                const newVoices = speechSynthesis.getVoices();
                const englishVoice = newVoices.find(voice => voice.lang.startsWith('en'));
                if (englishVoice) {
                    utterance.voice = englishVoice;
                }
                speechSynthesis.speak(utterance);
            }, { once: true });
        } else {
            speechSynthesis.speak(utterance);
        }
        
        // === FALLBACK: PLAY INSTRUCTION CHIMES IF SPEECH FAILS ===
        setTimeout(() => {
            if (speechSynthesis.speaking) return; // Speech worked
            
            // === PLAY CHIME PATTERN FOR COLOR INSTRUCTION ===
            playInstructionChimes(colorName);
        }, 1000);
    } else {
        // === NO SPEECH SYNTHESIS AVAILABLE ===
        playInstructionChimes(colorName);
    }
}

/* === PLAY POP SOUND === */
function playPopSound() {
    if (!soundEnabled) return;
    playBeepSound(800, 100);
}

/* === PLAY CHEER SOUND === */
function playCheerSound() {
    if (!soundEnabled) return;
    setTimeout(() => playBeepSound(600, 200), 100);
    setTimeout(() => playBeepSound(800, 200), 200);
    setTimeout(() => playBeepSound(1000, 300), 300);
}

/* === PLAY TRY AGAIN SOUND === */
function playTryAgainSound() {
    if (!soundEnabled) return;
    playBeepSound(300, 200);
}

/* === PLAY INSTRUCTION CHIMES (FALLBACK FOR iOS) === */
function playInstructionChimes(colorName) {
    if (!soundEnabled) return;
    
    // === PLAY DIFFERENT CHIME PATTERNS FOR EACH COLOR ===
    const colorFrequencies = {
        'Red': [440, 550],      // Lower tones for red
        'Blue': [550, 660],     // Mid tones for blue  
        'Yellow': [660, 770],   // Higher tones for yellow
        'Green': [330, 440],    // Lower-mid tones for green
        'Purple': [770, 880],   // Higher tones for purple
        'Orange': [495, 550]    // Orange between red and yellow
    };
    
    const frequencies = colorFrequencies[colorName] || [440, 550];
    
    // === PLAY TWO-TONE CHIME ===
    playBeepSound(frequencies[0], 300);
    setTimeout(() => playBeepSound(frequencies[1], 400), 200);
}

/* === PLAY COMPLETION SOUND === */
function playCompletionSound() {
    if (!soundEnabled) return;
    
    // === PLAY VICTORY MELODY ===
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, index) => {
        setTimeout(() => playBeepSound(freq, 400), index * 200);
    });
}
function playCompletionSound() {
    if (!soundEnabled) return;
    
    // === PLAY VICTORY MELODY ===
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, index) => {
        setTimeout(() => playBeepSound(freq, 400), index * 200);
    });
}

/* === PLAY BEEP SOUND === */
function playBeepSound(frequency, duration) {
    if (!soundEnabled || !window.AudioContext && !window.webkitAudioContext) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
        console.log('Audio playback not available');
    }
}

/* === UTILITY FUNCTIONS === */

/* === SHUFFLE ARRAY === */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/* === GET RANDOM ELEMENT FROM ARRAY === */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
