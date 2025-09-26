/* === HIDE AND SEEK GAME JAVASCRIPT === */

// === GLOBAL GAME VARIABLES ===
let currentRound = 1;
let totalRounds = 3;
let animalsFound = 0;
let animalsInRound = 0;
let gameActive = false;
let soundEnabled = true;

// === SLIDER VARIABLES ===
let isDragging = false;
let currentSlider = null;
let currentAnimal = null;
let currentHidingSpot = null;
let sliderStartX = 0;

// === ROUND CONFIGURATIONS ===
const roundConfigs = [
    { round: 1, animals: ['kitty', 'puppy', 'bunny'] },
    { round: 2, animals: ['kitty', 'puppy', 'bunny', 'froggie'] },
    { round: 3, animals: ['kitty', 'puppy', 'bunny', 'froggie', 'teddy'] }
];

// === DOM ELEMENTS ===
let gameContainer, roundInfo, introOverlay, countingText;
let sliderContainer, sliderHandle, completionOverlay, completionText;
let homeBtn, soundBtn, continueBtn, startGameBtn;
let hidingSpots, animals;
let audioElements = {};

/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    getDOMElements();
    loadSoundPreference();
    setupEventListeners();
    // === WAIT FOR USER TO CLICK START (ENABLES AUDIO) ===
    showStartScreen();
});

/* === GET DOM ELEMENTS === */
function getDOMElements() {
    gameContainer = document.getElementById('gameContainer');
    roundInfo = document.getElementById('roundInfo');
    introOverlay = document.getElementById('introOverlay');
    countingText = document.getElementById('countingText');
    sliderContainer = document.getElementById('sliderContainer');
    sliderHandle = document.getElementById('sliderHandle');
    completionOverlay = document.getElementById('completionOverlay');
    completionText = document.getElementById('completionText');
    homeBtn = document.getElementById('homeBtn');
    soundBtn = document.getElementById('soundBtn');
    continueBtn = document.getElementById('continueBtn');
    startGameBtn = document.getElementById('startGameBtn');
    
    hidingSpots = document.querySelectorAll('.hiding-spot');
    animals = document.querySelectorAll('.animal');
    
    // === AUDIO ELEMENTS ===
    audioElements = {
        countToFive: document.getElementById('audioCountToFive'),
        readyOrNot: document.getElementById('audioReadyOrNot'),
        amazing: document.getElementById('audioAmazing'),
        goodJob: document.getElementById('audioGoodJob'),
        chime: document.getElementById('audioChime'),
        pop: document.getElementById('audioPop'),
        whoosh: document.getElementById('audioWhoosh')
    };
}

/* === LOAD SOUND PREFERENCE === */
function loadSoundPreference() {
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
    updateSoundButton();
}

/* === SETUP EVENT LISTENERS === */
function setupEventListeners() {
    // === CONTROL BUTTONS ===
    homeBtn.addEventListener('click', handleHomeClick);
    soundBtn.addEventListener('click', handleSoundToggle);
    continueBtn.addEventListener('click', handleContinue);
    startGameBtn.addEventListener('click', handleStartGame);
    
    // === HIDING SPOT CLICKS ===
    hidingSpots.forEach(spot => {
        spot.addEventListener('click', handleHidingSpotClick);
    });
    
    // === SLIDER EVENTS ===
    sliderHandle.addEventListener('mousedown', handleSliderStart);
    sliderHandle.addEventListener('touchstart', handleSliderStart, { passive: false });
    
    document.addEventListener('mousemove', handleSliderMove);
    document.addEventListener('mouseup', handleSliderEnd);
    document.addEventListener('touchmove', handleSliderMove, { passive: false });
    document.addEventListener('touchend', handleSliderEnd);
}

/* === SHOW START SCREEN === */
function showStartScreen() {
    roundInfo.textContent = `Round ${currentRound} of ${totalRounds}`;
    countingText.textContent = 'Ready to play Hide and Seek?';
    introOverlay.classList.remove('hidden');
    startGameBtn.classList.add('bounce');
}

/* === HANDLE START GAME === */
function handleStartGame() {
    // === USER INTERACTION ENABLES AUDIO ===
    startGameBtn.classList.add('fade-out');
    startGameBtn.classList.remove('bounce');
    
    setTimeout(() => {
        startGameBtn.style.display = 'none';
        startIntroSequence();
    }, 300);
}

/* === START INTRO SEQUENCE === */
function startIntroSequence() {
    const config = roundConfigs[currentRound - 1];
    animalsInRound = config.animals.length;
    animalsFound = 0;
    
    // === UPDATE ROUND DISPLAY ===
    roundInfo.textContent = `Round ${currentRound} of ${totalRounds}`;
    
    // === SHOW INTRO OVERLAY ===
    introOverlay.classList.remove('hidden');
    countingText.textContent = 'Get Ready!';
    
    // === HIDE ANIMALS ONE BY ONE ===
    setTimeout(() => {
        hideAnimalsSequence(config.animals);
    }, 1000);
}

/* === HIDE ANIMALS SEQUENCE === */
function hideAnimalsSequence(animalList) {
    let delay = 0;
    
    animalList.forEach((animalId, index) => {
        setTimeout(() => {
            showAndHideAnimal(animalId, index + 1);
        }, delay);
        delay += 1200; // Slower stagger for 8 second total
    });
    
    // === START COUNTING AUDIO ===
    if (soundEnabled) {
        playAudio('countToFive');
    }
    
    // === AFTER ALL ANIMALS HIDE (8 SECONDS TOTAL) ===
    setTimeout(() => {
        startGameplay();
    }, 8000);
}

/* === SHOW AND HIDE ANIMAL === */
function showAndHideAnimal(animalId, spotNumber) {
    const animal = document.querySelector(`[data-animal="${animalId}"]`);
    const spot = document.querySelector(`[data-spot="${spotNumber}"]`);
    
    if (!animal || !spot) return;
    
    // === ASSOCIATE ANIMAL WITH SPOT ===
    animal.dataset.spot = spotNumber;
    
    // === POSITION ANIMAL AT SPOT ===
    const spotRect = spot.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    animal.style.left = (spotRect.left - containerRect.left) + 'px';
    animal.style.top = (spotRect.top - containerRect.top) + 'px';
    animal.style.width = spotRect.width + 'px';
    animal.style.height = spotRect.height + 'px';
    
    // === SHOW ANIMAL WITH ANIMATION ===
    animal.classList.remove('hidden');
    animal.classList.add('fade-in');
    
    // === PLAY CHIME SOUND ===
    if (soundEnabled) {
        playAudio('chime');
    }
    
    // === SLIDE BEHIND HIDING SPOT (PARTIAL PEEK) ===
    setTimeout(() => {
        // === ANIMAL STARTS PEEKING FROM RIGHT SIDE (10% VISIBLE) ===
        const peekOffset = spotRect.width * 0.1;
        animal.style.transform = `translateX(${peekOffset}px)`;
        
        // === STORE VALUES FOR DRAGGING ===
        animal.dataset.peekOffset = peekOffset;
        animal.dataset.totalRevealDistance = spotRect.width * 1.0;
    }, 300);
}

/* === START GAMEPLAY === */
function startGameplay() {
    // === PLAY READY OR NOT AUDIO ===
    if (soundEnabled) {
        playAudio('readyOrNot');
    }
    
    // === UPDATE INTRO TEXT ===
    countingText.textContent = 'Ready or not, here I come!';
    
    // === HIDE INTRO OVERLAY (4 SECONDS FOR AUDIO) ===
    setTimeout(() => {
        introOverlay.classList.add('hidden');
        gameActive = true;
    }, 4000);
}

/* === HANDLE HIDING SPOT CLICK === */
function handleHidingSpotClick(event) {
    if (!gameActive) return;
    
    const spot = event.currentTarget;
    const spotNumber = spot.dataset.spot;
    
    // === CHECK IF SPOT IS ACTIVE ===
    if (!spot.classList.contains('active')) return;
    
    // === FIND ANIMAL AT THIS SPOT ===
    const animal = document.querySelector(`[data-animal][data-spot="${spotNumber}"]`);
    
    // === ONLY SHOW SLIDER IF ANIMAL EXISTS AT THIS SPOT ===
    if (!animal) {
        console.log('No animal at this spot!');
        return;
    }
    
    // === SHOW SLIDER AT SPOT POSITION ===
    showSliderAtSpot(spot, animal);
}

/* === SHOW SLIDER AT SPOT === */
function showSliderAtSpot(spot, animal) {
    currentHidingSpot = spot;
    currentAnimal = animal;
    
    // === POSITION SLIDER AT BOTTOM OF SPOT ===
    const spotRect = spot.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    const sliderLeft = spotRect.left - containerRect.left + (spotRect.width / 2) - 100;
    const sliderTop = spotRect.bottom - containerRect.top - 20;
    
    sliderContainer.style.left = sliderLeft + 'px';
    sliderContainer.style.top = sliderTop + 'px';
    
    // === RESET SLIDER POSITION ===
    sliderHandle.style.left = '5px';
    
    // === SHOW SLIDER ===
    sliderContainer.classList.add('active');
    
    // === DEACTIVATE OTHER SPOTS TEMPORARILY ===
    hidingSpots.forEach(s => {
        if (s !== spot) s.style.pointerEvents = 'none';
    });
}

/* === HANDLE SLIDER START === */
function handleSliderStart(event) {
    if (!gameActive || !currentAnimal) return;
    
    event.preventDefault();
    isDragging = true;
    currentSlider = sliderHandle;
    
    // === GET STARTING POSITION ===
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    sliderStartX = clientX - sliderHandle.offsetLeft;
    
    // === ADD ACTIVE STATE ===
    sliderHandle.style.cursor = 'grabbing';
}

/* === HANDLE SLIDER MOVE === */
function handleSliderMove(event) {
    if (!isDragging || !currentSlider || !currentAnimal) return;
    
    event.preventDefault();
    
    // === GET MOUSE/TOUCH POSITION ===
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    
    // === CALCULATE NEW POSITION ===
    const sliderTrack = sliderContainer.querySelector('.slider-track');
    const trackWidth = sliderTrack.offsetWidth;
    const handleWidth = sliderHandle.offsetWidth;
    const maxPosition = trackWidth - handleWidth - 10;
    
    let newLeft = clientX - sliderContainer.getBoundingClientRect().left - (handleWidth / 2);
    newLeft = Math.max(5, Math.min(newLeft, maxPosition));
    
    // === UPDATE HANDLE POSITION ===
    sliderHandle.style.left = newLeft + 'px';
    
    // === CALCULATE PERCENTAGE ===
    const percentage = newLeft / maxPosition;
    
    // === MOVE ANIMAL PROPORTIONALLY ===
    revealAnimalByPercentage(percentage);
    
    // === PLAY WHOOSH SOUND (THROTTLED) ===
    if (soundEnabled && Math.random() < 0.1) {
        playAudio('whoosh');
    }
}

/* === REVEAL ANIMAL BY PERCENTAGE === */
function revealAnimalByPercentage(percentage) {
    if (!currentAnimal) return;
    
    // === GET STORED VALUES ===
    const peekOffset = parseFloat(currentAnimal.dataset.peekOffset) || 0;
    const totalDistance = parseFloat(currentAnimal.dataset.totalRevealDistance) || 0;
    
    // === CALCULATE POSITION (MOVES RIGHT AS PERCENTAGE INCREASES) ===
    const currentPosition = peekOffset + (totalDistance * percentage);
    
    // === UPDATE ANIMAL POSITION ===
    currentAnimal.style.transform = `translateX(${currentPosition}px)`;
}

/* === HANDLE SLIDER END === */
function handleSliderEnd(event) {
    if (!isDragging || !currentSlider) return;
    
    // === CALCULATE FINAL PERCENTAGE ===
    const sliderTrack = sliderContainer.querySelector('.slider-track');
    const trackWidth = sliderTrack.offsetWidth;
    const handleWidth = sliderHandle.offsetWidth;
    const maxPosition = trackWidth - handleWidth - 10;
    const currentLeft = parseInt(sliderHandle.style.left);
    const percentage = currentLeft / maxPosition;
    
    // === CHECK IF SUCCESS (85% THRESHOLD - FORGIVING) ===
    if (percentage >= 0.85) {
        handleAnimalFound();
    } else {
        // === RESET SLIDER AND ANIMAL ===
        resetSliderAndAnimal();
    }
    
    // === CLEANUP DRAG STATE ===
    isDragging = false;
    currentSlider = null;
    sliderHandle.style.cursor = 'grab';
}

/* === HANDLE ANIMAL FOUND === */
function handleAnimalFound() {
    // === FULLY REVEAL ANIMAL (MOVE ALL THE WAY RIGHT) ===
    const peekOffset = parseFloat(currentAnimal.dataset.peekOffset) || 0;
    const totalDistance = parseFloat(currentAnimal.dataset.totalRevealDistance) || 0;
    currentAnimal.style.transform = `translateX(${peekOffset + totalDistance}px)`;
    
    // === BRING ANIMAL TO FRONT ===
    currentAnimal.style.zIndex = '150';
    
    currentAnimal.classList.add('revealed', 'celebrating');
    
    // === PLAY SUCCESS SOUNDS ===
    if (soundEnabled) {
        playAudio('pop');
        setTimeout(() => {
            playAudio(Math.random() < 0.5 ? 'goodJob' : 'amazing');
        }, 200);
    }
    
    // === MARK SPOT AS FOUND ===
    currentHidingSpot.classList.remove('active');
    currentHidingSpot.classList.add('found');
    
    // === HIDE SLIDER ===
    sliderContainer.classList.remove('active');
    
    // === INCREMENT FOUND COUNTER ===
    animalsFound++;
    
    // === REACTIVATE OTHER SPOTS ===
    hidingSpots.forEach(s => {
        s.style.pointerEvents = '';
    });
    
    // === CLEANUP CURRENT REFERENCES ===
    const foundAnimal = currentAnimal;
    currentAnimal = null;
    currentHidingSpot = null;
    currentSlider = null;
    
    // === CHECK ROUND COMPLETION ===
    setTimeout(() => {
        foundAnimal.classList.remove('celebrating');
        
        if (animalsFound >= animalsInRound) {
            // === WAIT 3 SECONDS TO SEE ALL ANIMALS ===
            setTimeout(() => {
                completeRound();
            }, 3000);
        }
    }, 1000);
}

/* === RESET SLIDER AND ANIMAL === */
function resetSliderAndAnimal() {
    // === RESET SLIDER POSITION ===
    sliderHandle.style.left = '5px';
    
    // === RESET ANIMAL TO PEEKING POSITION ===
    if (currentAnimal) {
        const peekOffset = parseFloat(currentAnimal.dataset.peekOffset) || 0;
        currentAnimal.style.transform = `translateX(${peekOffset}px)`;
    }
    
    // === HIDE SLIDER ===
    sliderContainer.classList.remove('active');
    
    // === REACTIVATE SPOTS ===
    hidingSpots.forEach(s => {
        s.style.pointerEvents = '';
    });
    
    // === CLEANUP REFERENCES ===
    currentAnimal = null;
    currentHidingSpot = null;
}

/* === COMPLETE ROUND === */
function completeRound() {
    gameActive = false;
    
    if (currentRound < totalRounds) {
        // === SHOW ROUND COMPLETION ===
        completionText.textContent = `Round ${currentRound} Complete!`;
        completionOverlay.classList.add('active');
        
        // === SETUP NEXT ROUND ===
        currentRound++;
    } else {
        // === GAME COMPLETE ===
        completeGame();
    }
}

/* === HANDLE CONTINUE === */
function handleContinue() {
    // === HIDE COMPLETION OVERLAY ===
    completionOverlay.classList.remove('active');
    
    // === RESET ANIMALS ===
    animals.forEach(animal => {
        animal.classList.add('hidden');
        animal.classList.remove('revealed', 'celebrating');
        animal.style.transform = '';
        animal.style.zIndex = '50'; // Reset to behind hiding spots
    });
    
    // === RESET HIDING SPOTS ===
    hidingSpots.forEach(spot => {
        spot.classList.remove('found');
        spot.classList.add('active');
    });
    
    // === SHOW START BUTTON FOR NEXT ROUND ===
    startGameBtn.style.display = '';
    startGameBtn.classList.remove('fade-out');
    
    setTimeout(() => {
        showStartScreen();
    }, 500);
}

/* === COMPLETE GAME === */
function completeGame() {
    // === SAVE STICKER ===
    saveSticker();
    
    // === SHOW FINAL COMPLETION ===
    completionText.textContent = 'Amazing! You found everyone! 🎉';
    completionOverlay.classList.add('active');
    
    // === CHANGE CONTINUE BUTTON TO RETURN ===
    continueBtn.textContent = 'Return to Hub';
    continueBtn.onclick = returnToHub;
}

/* === SAVE STICKER === */
function saveSticker() {
    const currentStickers = localStorage.getItem('kidsGames_stickerCount');
    const newCount = currentStickers ? parseInt(currentStickers) + 1 : 1;
    localStorage.setItem('kidsGames_stickerCount', newCount.toString());
}

/* === RETURN TO HUB === */
function returnToHub() {
    window.location.href = '../index.html';
}

/* === HANDLE HOME CLICK === */
function handleHomeClick() {
    if (gameActive && animalsFound > 0) {
        returnToHub();
}

/* === HANDLE SOUND TOGGLE === */
function handleSoundToggle() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('kidsGames_soundEnabled', soundEnabled.toString());
    updateSoundButton();
    
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
