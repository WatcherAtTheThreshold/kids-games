/* === BIRD MATCH GAME JAVASCRIPT === */

// === GLOBAL VARIABLES ===
let currentRound = 1;
let totalRounds = 5;
let currentBirds = [];
let matchedCount = 0;
let totalBirds = 0;
let soundEnabled = true;
let isDragging = false;
let draggedBird = null;

// === BIRD DATA === 
const birdTypes = {
    robin: { 
        emoji: '🐦', 
        color: '#8B4513', 
        name: 'Robin',
        shadow: '🐦‍⬛' 
    },
    duck: { 
        emoji: '🦆', 
        color: '#DAA520', 
        name: 'Duck',
        shadow: '🦆' 
    },
    owl: { 
        emoji: '🦉', 
        color: '#8B4513', 
        name: 'Owl',
        shadow: '🦉' 
    },
    cardinal: { 
        emoji: '🐦‍🔥', 
        color: '#DC143C', 
        name: 'Cardinal',
        shadow: '🐦‍⬛' 
    },
    bluejay: { 
        emoji: '🐦', 
        color: '#4169E1', 
        name: 'Blue Jay',
        shadow: '🐦‍⬛' 
    },
    crane: { 
        emoji: '🕊️', 
        color: '#B0B0B0', 
        name: 'Crane',
        shadow: '🕊️' 
    }
};

// === DOM ELEMENTS ===
const silhouettesContainer = document.getElementById('silhouettesContainer');
const birdsContainer = document.getElementById('birdsContainer');
const roundInfo = document.getElementById('roundInfo');
const scoreInfo = document.getElementById('scoreInfo');
const backButton = document.getElementById('backButton');
const completionScreen = document.getElementById('completionScreen');
const returnButton = document.getElementById('returnButton');

/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', function() {
    loadSoundPreference();
    setupEventListeners();
    startNewRound();
});

/* === LOAD SOUND PREFERENCE FROM HUB === */
function loadSoundPreference() {
    const savedSound = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = savedSound !== null ? savedSound === 'true' : true;
}

/* === SETUP EVENT LISTENERS === */
function setupEventListeners() {
    // === BACK BUTTON ===
    backButton.addEventListener('click', returnToHub);
    
    // === RETURN BUTTON ===
    returnButton.addEventListener('click', returnToHub);
    
    // === PREVENT DEFAULT DRAG BEHAVIORS ===
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('selectstart', function(e) {
        if (e.target.classList.contains('draggable-bird')) {
            e.preventDefault();
        }
    });
}

/* === START NEW ROUND === */
function startNewRound() {
    // === CLEAR PREVIOUS ROUND ===
    silhouettesContainer.innerHTML = '';
    birdsContainer.innerHTML = '';
    matchedCount = 0;
    
    // === GET BIRDS FOR THIS ROUND ===
    currentBirds = getBirdsForRound(currentRound);
    totalBirds = currentBirds.length;
    
    // === UPDATE DISPLAY ===
    updateProgressDisplay();
    
    // === CREATE GAME ELEMENTS ===
    createSilhouettes();
    createDraggableBirds();
    
    // === PLAY ROUND START SOUND ===
    if (soundEnabled) {
        playRoundStartAudio();
    }
}

/* === GET BIRDS FOR ROUND BASED ON DIFFICULTY === */
function getBirdsForRound(round) {
    const allBirds = Object.keys(birdTypes);
    let selectedBirds = [];
    
    if (round === 1) {
        // === ROUND 1: 2 VERY DIFFERENT BIRDS ===
        selectedBirds = ['duck', 'owl'];
    } else if (round === 2) {
        // === ROUND 2: 3 MODERATE DIFFICULTY ===
        selectedBirds = ['robin', 'cardinal', 'crane'];
    } else if (round === 3) {
        // === ROUND 3: 3 BIRDS WITH SIMILAR SIZES ===
        selectedBirds = ['robin', 'bluejay', 'cardinal'];
    } else if (round === 4) {
        // === ROUND 4: 3 BIRDS MIXED DIFFICULTY ===
        selectedBirds = ['duck', 'owl', 'crane'];
    } else {
        // === ROUND 5: 4 BIRDS FINAL CHALLENGE ===
        selectedBirds = ['robin', 'duck', 'owl', 'bluejay'];
    }
    
    return selectedBirds;
}

/* === CREATE BIRD SILHOUETTES (TARGET ZONE) === */
function createSilhouettes() {
    currentBirds.forEach((birdKey, index) => {
        const bird = birdTypes[birdKey];
        
        // === CREATE SILHOUETTE ELEMENT ===
        const silhouette = document.createElement('div');
        silhouette.className = 'bird-silhouette';
        silhouette.dataset.birdType = birdKey;
        silhouette.innerHTML = bird.shadow;
        
        // === ADD TO CONTAINER ===
        silhouettesContainer.appendChild(silhouette);
        
        // === SETUP DROP ZONE EVENTS ===
        setupDropZone(silhouette);
    });
}

/* === CREATE DRAGGABLE BIRDS (DRAG ZONE) === */
function createDraggableBirds() {
    // === SHUFFLE BIRDS FOR RANDOM ORDER ===
    const shuffledBirds = [...currentBirds].sort(() => Math.random() - 0.5);
    
    shuffledBirds.forEach((birdKey, index) => {
        const bird = birdTypes[birdKey];
        
        // === CREATE DRAGGABLE ELEMENT ===
        const draggableBird = document.createElement('div');
        draggableBird.className = 'draggable-bird';
        draggableBird.dataset.birdType = birdKey;
        draggableBird.innerHTML = bird.emoji;
        draggableBird.style.background = bird.color;
        
        // === ADD TO CONTAINER ===
        birdsContainer.appendChild(draggableBird);
        
        // === SETUP DRAG EVENTS ===
        setupDragEvents(draggableBird);
    });
}

/* === SETUP DRAG EVENTS FOR BIRD === */
function setupDragEvents(birdElement) {
    // === MOUSE EVENTS ===
    birdElement.addEventListener('mousedown', handleDragStart);
    
    // === TOUCH EVENTS ===
    birdElement.addEventListener('touchstart', handleDragStart, { passive: false });
}

/* === SETUP DROP ZONE EVENTS === */
function setupDropZone(silhouetteElement) {
    // === MOUSE EVENTS ===
    silhouetteElement.addEventListener('mouseenter', handleDropZoneEnter);
    silhouetteElement.addEventListener('mouseleave', handleDropZoneLeave);
    
    // === TOUCH EVENTS ===
    silhouetteElement.addEventListener('touchmove', handleTouchMove, { passive: false });
}

/* === HANDLE DRAG START === */
function handleDragStart(event) {
    if (event.target.classList.contains('matched')) {
        return;
    }
    
    event.preventDefault();
    
    isDragging = true;
    draggedBird = event.target;
    draggedBird.classList.add('dragging');
    
    // === SETUP GLOBAL MOVE AND END EVENTS ===
    if (event.type === 'mousedown') {
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    } else {
        document.addEventListener('touchmove', handleTouchDrag, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
    }
}

/* === HANDLE DRAG MOVE (MOUSE) === */
function handleDragMove(event) {
    if (!isDragging || !draggedBird) return;
    
    // === MOVE BIRD TO MOUSE POSITION ===
    const rect = draggedBird.getBoundingClientRect();
    draggedBird.style.position = 'fixed';
    draggedBird.style.left = (event.clientX - rect.width / 2) + 'px';
    draggedBird.style.top = (event.clientY - rect.height / 2) + 'px';
    draggedBird.style.zIndex = '1000';
    
    // === CHECK FOR DROP ZONE HIGHLIGHTS ===
    checkDropZoneHighlights(event.clientX, event.clientY);
}

/* === HANDLE TOUCH DRAG === */
function handleTouchDrag(event) {
    if (!isDragging || !draggedBird) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = draggedBird.getBoundingClientRect();
    
    // === MOVE BIRD TO TOUCH POSITION ===
    draggedBird.style.position = 'fixed';
    draggedBird.style.left = (touch.clientX - rect.width / 2) + 'px';
    draggedBird.style.top = (touch.clientY - rect.height / 2) + 'px';
    draggedBird.style.zIndex = '1000';
    
    // === CHECK FOR DROP ZONE HIGHLIGHTS ===
    checkDropZoneHighlights(touch.clientX, touch.clientY);
}

/* === HANDLE TOUCH MOVE FOR DROP ZONES === */
function handleTouchMove(event) {
    // === PREVENT DEFAULT SCROLLING DURING DRAG ===
    if (isDragging) {
        event.preventDefault();
    }
}

/* === CHECK DROP ZONE HIGHLIGHTS === */
function checkDropZoneHighlights(x, y) {
    const silhouettes = document.querySelectorAll('.bird-silhouette');
    
    silhouettes.forEach(silhouette => {
        const rect = silhouette.getBoundingClientRect();
        const isOver = (
            x >= rect.left && x <= rect.right &&
            y >= rect.top && y <= rect.bottom
        );
        
        if (isOver && !silhouette.classList.contains('filled')) {
            silhouette.classList.add('highlight');
        } else {
            silhouette.classList.remove('highlight');
        }
    });
}

/* === HANDLE DRAG END === */
function handleDragEnd(event) {
    if (!isDragging || !draggedBird) return;
    
    const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
    const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
    
    // === FIND DROP TARGET ===
    const dropTarget = findDropTarget(clientX, clientY);
    
    if (dropTarget) {
        // === ATTEMPT TO MATCH ===
        attemptMatch(draggedBird, dropTarget);
    } else {
        // === RETURN BIRD TO ORIGINAL POSITION ===
        returnBirdToOriginal(draggedBird);
    }
    
    // === CLEANUP DRAG STATE ===
    cleanupDragState();
}

/* === FIND DROP TARGET UNDER CURSOR === */
function findDropTarget(x, y) {
    const silhouettes = document.querySelectorAll('.bird-silhouette:not(.filled)');
    
    for (let silhouette of silhouettes) {
        const rect = silhouette.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return silhouette;
        }
    }
    
    return null;
}

/* === ATTEMPT TO MATCH BIRD WITH SILHOUETTE === */
function attemptMatch(birdElement, silhouetteElement) {
    const birdType = birdElement.dataset.birdType;
    const silhouetteType = silhouetteElement.dataset.birdType;
    
    if (birdType === silhouetteType) {
        // === CORRECT MATCH ===
        handleCorrectMatch(birdElement, silhouetteElement);
    } else {
        // === INCORRECT MATCH ===
        handleIncorrectMatch(birdElement);
    }
}

/* === HANDLE CORRECT MATCH === */
function handleCorrectMatch(birdElement, silhouetteElement) {
    // === MARK AS MATCHED ===
    birdElement.classList.add('matched');
    silhouetteElement.classList.add('filled');
    silhouetteElement.classList.remove('highlight');
    
    // === VISUAL FEEDBACK ===
    silhouetteElement.classList.add('correct-feedback');
    silhouetteElement.classList.add('pop-animation');
    
    // === AUDIO FEEDBACK ===
    if (soundEnabled) {
        playSuccessSound();
    }
    
    // === UPDATE SCORE ===
    matchedCount++;
    updateProgressDisplay();
    
    // === CHECK ROUND COMPLETION ===
    if (matchedCount === totalBirds) {
        setTimeout(handleRoundComplete, 800);
    }
    
    // === CLEANUP ANIMATIONS ===
    setTimeout(() => {
        silhouetteElement.classList.remove('correct-feedback', 'pop-animation');
    }, 600);
}

/* === HANDLE INCORRECT MATCH === */
function handleIncorrectMatch(birdElement) {
    // === VISUAL FEEDBACK ===
    birdElement.classList.add('try-again-feedback');
    
    // === AUDIO FEEDBACK ===
    if (soundEnabled) {
        playTryAgainSound();
    }
    
    // === RETURN TO ORIGINAL POSITION ===
    returnBirdToOriginal(birdElement);
    
    // === CLEANUP ANIMATION ===
    setTimeout(() => {
        birdElement.classList.remove('try-again-feedback');
    }, 500);
}

/* === RETURN BIRD TO ORIGINAL POSITION === */
function returnBirdToOriginal(birdElement) {
    birdElement.style.position = '';
    birdElement.style.left = '';
    birdElement.style.top = '';
    birdElement.style.zIndex = '';
}

/* === CLEANUP DRAG STATE === */
function cleanupDragState() {
    if (draggedBird) {
        draggedBird.classList.remove('dragging');
        draggedBird = null;
    }
    
    isDragging = false;
    
    // === REMOVE EVENT LISTENERS ===
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleTouchDrag);
    document.removeEventListener('touchend', handleDragEnd);
    
    // === REMOVE ALL HIGHLIGHTS ===
    document.querySelectorAll('.bird-silhouette').forEach(silhouette => {
        silhouette.classList.remove('highlight');
    });
}

/* === HANDLE DROP ZONE ENTER === */
function handleDropZoneEnter(event) {
    if (isDragging && !event.target.classList.contains('filled')) {
        event.target.classList.add('highlight');
    }
}

/* === HANDLE DROP ZONE LEAVE === */
function handleDropZoneLeave(event) {
    event.target.classList.remove('highlight');
}

/* === HANDLE ROUND COMPLETE === */
function handleRoundComplete() {
    // === CELEBRATION ANIMATION ===
    const gameContainer = document.querySelector('.game-container');
    gameContainer.classList.add('celebration');
    
    // === AUDIO FEEDBACK ===
    if (soundEnabled) {
        playRoundCompleteSound();
    }
    
    // === CLEANUP CELEBRATION ===
    setTimeout(() => {
        gameContainer.classList.remove('celebration');
        
        if (currentRound < totalRounds) {
            // === NEXT ROUND ===
            currentRound++;
            setTimeout(startNewRound, 500);
        } else {
            // === GAME COMPLETE ===
            setTimeout(handleGameComplete, 500);
        }
    }, 1500);
}

/* === HANDLE GAME COMPLETE === */
function handleGameComplete() {
    // === AWARD STICKER ===
    awardSticker();
    
    // === SHOW COMPLETION SCREEN ===
    completionScreen.classList.remove('hidden');
    completionScreen.classList.add('celebration', 'fade-in');
    
    // === AUDIO FEEDBACK ===
    if (soundEnabled) {
        playGameCompleteSound();
    }
}

/* === AWARD STICKER TO PLAYER === */
function awardSticker() {
    // === GET CURRENT STICKER COUNT ===
    let currentStickers = localStorage.getItem('kidsGames_stickerCount');
    currentStickers = currentStickers ? parseInt(currentStickers) : 0;
    
    // === INCREMENT AND SAVE ===
    currentStickers++;
    localStorage.setItem('kidsGames_stickerCount', currentStickers.toString());
}

/* === UPDATE PROGRESS DISPLAY === */
function updateProgressDisplay() {
    roundInfo.textContent = `Round ${currentRound} of ${totalRounds}`;
    scoreInfo.textContent = `${matchedCount} / ${totalBirds} matched`;
}

/* === RETURN TO HUB === */
function returnToHub() {
    window.location.href = '../index.html';
}

/* === AUDIO FUNCTIONS === */

/* === PLAY ROUND START AUDIO === */
function playRoundStartAudio() {
    // === PLACEHOLDER FOR AUDIO - WOULD USE WEB AUDIO API ===
    console.log('🔊 Playing round start audio: "Match the birds!"');
}

/* === PLAY SUCCESS SOUND === */
function playSuccessSound() {
    // === PLACEHOLDER FOR AUDIO - WOULD USE WEB AUDIO API ===
    console.log('🔊 Playing success sound: "Great job!"');
}

/* === PLAY TRY AGAIN SOUND === */
function playTryAgainSound() {
    // === PLACEHOLDER FOR AUDIO - WOULD USE WEB AUDIO API ===
    console.log('🔊 Playing try again sound: "Try again!"');
}

/* === PLAY ROUND COMPLETE SOUND === */
function playRoundCompleteSound() {
    // === PLACEHOLDER FOR AUDIO - WOULD USE WEB AUDIO API ===
    console.log('🔊 Playing round complete sound: "Round complete!"');
}

/* === PLAY GAME COMPLETE SOUND === */
function playGameCompleteSound() {
    // === PLACEHOLDER FOR AUDIO - WOULD USE WEB AUDIO API ===
    console.log('🔊 Playing game complete sound: "Amazing! You finished Bird Match!"');
}