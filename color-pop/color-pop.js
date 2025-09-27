/* === BUBBLE POP GAME JAVASCRIPT === */

// === GLOBAL GAME VARIABLES ===
let currentRound = 1;
let totalRounds = 5;
let targetColor = '';
let bubbles = [];
let gameActive = false;
let soundEnabled = true;
let roundComplete = false;

// === GAME COLORS ARRAY ===
const gameColors = [
    { name: 'red', display: 'Red', image: 'images/red-bubble.png' },
    { name: 'blue', display: 'Blue', image: 'images/blue-bubble.png' },
    { name: 'yellow', display: 'Yellow', image: 'images/yellow-bubble.png' },
    { name: 'green', display: 'Green', image: 'images/green-bubble.png' },
    { name: 'purple', display: 'Purple', image: 'images/purple-bubble.png' },
    { name: 'orange', display: 'Orange', image: 'images/orange-bubble.png' }
];

// === DOM ELEMENTS ===
const gameArea = document.getElementById('gameArea');
const instructionText = document.getElementById('instructionText');
const progressIndicator = document.getElementById('progressIndicator');
const backButton = document.getElementById('backButton');
const celebrationOverlay = document.getElementById('celebrationOverlay');
const celebrationText = document.getElementById('celebrationText');
const continueButton = document.getElementById('continueButton');

// === AUDIO ELEMENTS ===
const audioElements = {
    pop: document.getElementById('audioPop'),
    amazing: document.getElementById('audioAmazing'),
    greatJob: document.getElementById('audioGreatJob'),
    chime: document.getElementById('audioChime'),
    whoosh: document.getElementById('audioWhoosh')
};

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
    updateInstruction('Get ready to pop bubbles!', '👀', '🫧');
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

/* === START NEW ROUND === */
function startNewRound() {
    // === RESET ROUND STATE ===
    roundComplete = false;
    gameActive = false;
    
    // === CLEAR PREVIOUS BUBBLES ===
    clearBubbles();
    
    // === SELECT TARGET COLOR ===
    selectTargetColor();
    
    // === CREATE BUBBLES ===
    createBubbles();
    
    // === UPDATE INSTRUCTION WITH COLOR STYLING ===
    updateInstructionWithColor(`Find the ${targetColor.display} bubble!`, '👆', '🫧', targetColor.name);
    
    // === PLAY VOICE PROMPT ===
    playVoicePrompt(targetColor.display);
    
    // === ACTIVATE GAME AFTER VOICE PROMPT ===
    setTimeout(() => {
        gameActive = true;
        addBubbleEventListeners();
    }, 1500);
}

/* === SELECT TARGET COLOR === */
function selectTargetColor() {
    // === RANDOMLY SELECT FROM AVAILABLE COLORS ===
    const randomIndex = Math.floor(Math.random() * gameColors.length);
    targetColor = gameColors[randomIndex];
}

/* === CREATE BUBBLES === */
function createBubbles() {
    bubbles = [];
    
    // === CREATE 4-6 BUBBLES ===
    const bubbleCount = 4 + Math.floor(Math.random() * 3); // 4-6 bubbles
    
    // === ENSURE TARGET COLOR IS INCLUDED ===
    const colorsToUse = [targetColor];
    
    // === ADD RANDOM OTHER COLORS ===
    while (colorsToUse.length < bubbleCount) {
        const randomColor = gameColors[Math.floor(Math.random() * gameColors.length)];
        if (!colorsToUse.find(color => color.name === randomColor.name)) {
            colorsToUse.push(randomColor);
        }
    }
    
    // === SHUFFLE COLORS ===
    shuffleArray(colorsToUse);
    
    // === CREATE BUBBLE ELEMENTS ===
    for (let i = 0; i < bubbleCount; i++) {
        createBubble(colorsToUse[i], i, bubbleCount);
    }
}

/* === CREATE INDIVIDUAL BUBBLE === */
function createBubble(color, index, totalCount) {
    // === CREATE BUBBLE ELEMENT ===
    const bubble = document.createElement('div');
    bubble.classList.add('bubble', color.name);
    bubble.dataset.color = color.name;
    
    // === ADD BUBBLE IMAGE ===
    const bubbleImg = document.createElement('img');
    bubbleImg.src = color.image;
    bubbleImg.alt = `${color.display} bubble`;
    bubble.appendChild(bubbleImg);
    
    // === POSITION BUBBLE ===
    positionBubble(bubble, index, totalCount);
    
    // === ADD FLOATING ANIMATION ===
    bubble.classList.add('float');
    
    // === ADD TO GAME AREA ===
    gameArea.appendChild(bubble);
    bubbles.push(bubble);
}

/* === POSITION BUBBLE IN GAME AREA === */
function positionBubble(bubble, index, totalCount) {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const bubbleSize = 120;
    const padding = 20;
    
    // === CALCULATE SAFE POSITIONING AREA ===
    const maxX = gameArea.offsetWidth - bubbleSize - padding;
    const maxY = gameArea.offsetHeight - bubbleSize - padding;
    
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
    bubble.style.left = finalX + 'px';
    bubble.style.top = finalY + 'px';
}

/* === ADD EVENT LISTENERS TO BUBBLES === */
function addBubbleEventListeners() {
    bubbles.forEach(bubble => {
        bubble.addEventListener('click', handleBubbleClick);
    });
}

/* === HANDLE BUBBLE CLICK === */
function handleBubbleClick(event) {
    // === PREVENT ACTION IF GAME NOT ACTIVE ===
    if (!gameActive || roundComplete) {
        return;
    }
    
    const clickedBubble = event.currentTarget;
    const clickedColor = clickedBubble.dataset.color;
    
    // === CHECK IF CORRECT COLOR ===
    if (clickedColor === targetColor.name) {
        handleCorrectChoice(clickedBubble);
    } else {
        handleIncorrectChoice(clickedBubble);
    }
}

/* === HANDLE CORRECT CHOICE === */
function handleCorrectChoice(bubble) {
    // === DISABLE FURTHER CLICKS ===
    gameActive = false;
    roundComplete = true;
    
    // === VISUAL FEEDBACK ===
    bubble.classList.add('correct-feedback', 'pop-animation');
    
    // === AUDIO FEEDBACK ===
    playAudio('pop');
    setTimeout(() => {
        playAudio(Math.random() < 0.5 ? 'amazing' : 'greatJob');
    }, 300);
    
    // === UPDATE INSTRUCTION ===
    updateInstruction('Great job!', '🎉', '⭐');
    
    // === REMOVE OTHER BUBBLES ===
    setTimeout(() => {
        removeOtherBubbles(bubble);
    }, 500);
    
    // === PROCEED TO NEXT ROUND OR FINISH ===
    setTimeout(() => {
        proceedToNextRoundOrFinish();
    }, 2000);
}

/* === HANDLE INCORRECT CHOICE === */
function handleIncorrectChoice(bubble) {
    // === VISUAL FEEDBACK ===
    bubble.classList.add('try-again-feedback', 'shake');
    
    // === AUDIO FEEDBACK ===
    playAudio('whoosh');
    
    // === UPDATE INSTRUCTION ===
    updateInstructionWithColor(`Try again! Find the ${targetColor.display} bubble!`, '🤔', '🫧', targetColor.name);
    
    // === REMOVE FEEDBACK AFTER ANIMATION ===
    setTimeout(() => {
        bubble.classList.remove('try-again-feedback', 'shake');
    }, 1000);
}

/* === REMOVE OTHER BUBBLES === */
function removeOtherBubbles(correctBubble) {
    bubbles.forEach(bubble => {
        if (bubble !== correctBubble) {
            bubble.classList.add('fade-out');
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
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

/* === AWARD SPECIFIC STICKER === */
function awardSticker() {
    const gameKey = 'color-pop';
    
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
    
    console.log(`🫧 Bubble Pop sticker earned! Total: ${stickerList.length}`);
}

/* === SHOW GAME COMPLETION === */
function showGameCompletion() {
    // === UPDATE CELEBRATION TEXT ===
    celebrationText.textContent = 'Amazing! You popped all the bubbles!';
    
    // === SHOW CELEBRATION OVERLAY ===
    celebrationOverlay.style.display = 'flex';
    
    // === ADD CELEBRATION ANIMATION ===
    const celebrationContent = document.querySelector('.celebration-content');
    celebrationContent.classList.add('celebration', 'fade-in');
    
    // === PLAY COMPLETION SOUND ===
    playAudio('amazing');
}

/* === HANDLE CONTINUE FROM CELEBRATION === */
function handleContinueFromCelebration() {
    // === HIDE CELEBRATION ===
    celebrationOverlay.style.display = 'none';
    
    // === RETURN TO HUB ===
    returnToHub();
}

/* === CLEAR BUBBLES === */
function clearBubbles() {
    bubbles.forEach(bubble => {
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
    });
    bubbles = [];
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
    clearBubbles();
    
    // === NAVIGATE BACK ===
    window.location.href = '../index.html';
}

/* === PREVENT DOCUMENT CLICKS DURING TRANSITIONS === */
function handleDocumentClick(event) {
    // === ALLOW CLICKS ON BUBBLES AND BUTTONS ===
    if (event.target.classList.contains('bubble') || 
        event.target.closest('.bubble') ||
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
        
        // === FALLBACK: PLAY CHIME IF SPEECH FAILS ===
        setTimeout(() => {
            if (speechSynthesis.speaking) return; // Speech worked
            playAudio('chime');
        }, 1000);
    } else {
        // === NO SPEECH SYNTHESIS AVAILABLE ===
        playAudio('chime');
    }
}

/* === PLAY AUDIO === */
function playAudio(audioName) {
    if (!soundEnabled) return;
    
    const audio = audioElements[audioName];
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => {
            console.log('Audio play failed:', err);
        });
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
