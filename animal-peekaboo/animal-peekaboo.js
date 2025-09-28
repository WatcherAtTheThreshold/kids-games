/* === CSS CHANGES === */
// Add these styles to your index.html file in the <style> section

/* === HIDING SPOTS === */
.hiding-spot {
    /* Keep existing styles */
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
    min-width: 140px;
    min-height: 140px;
    
    /* Add this to ensure spots stay visible */
    z-index: 20; /* Higher than animals */
}

/* === ANIMAL IN SPOT === */
.animal-in-spot {
    position: absolute;
    font-size: 3rem;
    width: 80px;
    height: 80px;
    z-index: 10; /* Lower than hiding spots */
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* === PEEKING ANIMATION === */
@keyframes peek-animation {
    0% { transform: translateY(40px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

/* === VISUAL FEEDBACK STYLES === */
.correct-feedback {
    /* Make sure this doesn't hide the spot */
    box-shadow: 0 0 20px 10px rgba(76, 217, 100, 0.7);
    transform: scale(1.05);
    /* Don't change opacity or visibility */
}

.has-animal {
    /* Subtle indication that there's an animal here */
    transform: scale(1.05);
}

/* === JAVASCRIPT CHANGES === */
// Replace the showAnimalInSpot function with this version:

/* === SHOW ANIMAL IN SPOT === */
function showAnimalInSpot() {
    if (!gameActive) return;
    
    const targetSpot = document.querySelector(`[data-spot="${currentSpot}"]`);
    const spotRect = targetSpot.getBoundingClientRect();
    const containerRect = hidingSpotsContainer.getBoundingClientRect();
    
    // === CREATE ANIMAL ELEMENT ===
    const animalElement = document.createElement('div');
    animalElement.className = 'animal-in-spot';
    animalElement.id = 'currentAnimal';
    
    // === USE CUSTOM IMAGE IF AVAILABLE, OTHERWISE USE EMOJI ===
    if (currentAnimal.image) {
        const img = document.createElement('img');
        img.src = currentAnimal.image;
        img.alt = currentAnimal.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        animalElement.appendChild(img);
    } else {
        animalElement.textContent = currentAnimal.emoji;
    }
    
    // === ADD TO CONTAINER INSTEAD OF SPOT (IMPORTANT) ===
    hidingSpotsContainer.appendChild(animalElement);
    
    // === POSITION ANIMAL PEEKING FROM BEHIND SPOT ===
    const spotLeft = spotRect.left - containerRect.left;
    const spotTop = spotRect.top - containerRect.top;
    
    // Position calculations - animal peeks from behind/above the spot
    const peekOffset = 30; // How much the animal peeks out
    const posLeft = spotLeft + (spotRect.width/2 - 40); // Center horizontally
    const posTop = spotTop - peekOffset; // Peek from top
    
    animalElement.style.left = posLeft + 'px';
    animalElement.style.top = posTop + 'px';
    animalElement.style.animation = 'peek-animation 0.5s ease-out';
    
    // Add a reference class to the spot
    targetSpot.classList.add('has-animal');
    
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
// Update this function to ensure clean removal
function hideAnimal() {
    const animalElement = document.getElementById('currentAnimal');
    const targetSpot = document.querySelector(`[data-spot="${currentSpot}"]`);
    
    if (animalElement) {
        animalElement.style.animation = 'none'; // Stop animation
        animalElement.classList.add('fade-out');
        
        // Remove the reference class from spot
        if (targetSpot) {
            targetSpot.classList.remove('has-animal');
        }
        
        setTimeout(() => {
            if (animalElement.parentNode) {
                animalElement.parentNode.removeChild(animalElement);
            }
        }, 300);
    }
}

/* === HANDLE CORRECT GUESS === */
// Update to ensure hiding spots remain visible
function handleCorrectGuess(clickedSpot) {
    roundComplete = true;
    clearTimeout(hideTimer);
    
    // === SHOW ANIMAL CLEARLY IF HIDDEN ===
    const animalElement = document.getElementById('currentAnimal');
    if (animalElement) {
        // Bring animal more into view as "found"
        const currentTop = parseInt(animalElement.style.top);
        animalElement.style.top = (currentTop - 15) + 'px'; // Move further up
        animalElement.style.zIndex = '25'; // Temporarily show above hiding spot
        animalElement.classList.add('celebrating');
    }
    
    // === VISUAL FEEDBACK WITHOUT HIDING THE SPOT ===
    clickedSpot.classList.add('correct-feedback');
    
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
        clickedSpot.classList.remove('correct-feedback');
        instructionText.classList.remove('sparkle');
        
        // Remove the celebrating animal
        if (animalElement) {
            animalElement.classList.remove('celebrating');
        }
        
        nextRound();
    }, 2500);
}

/* === CLEAR ALL ANIMALS === */
// Ensure this function properly cleans up
function clearAllAnimals() {
    const existingAnimals = document.querySelectorAll('.animal-in-spot');
    existingAnimals.forEach(animal => {
        if (animal.parentNode) {
            animal.parentNode.removeChild(animal);
        }
    });
    
    // === CLEAR SPOT EFFECTS BUT DON'T REMOVE SPOTS ===
    allHidingSpots.forEach(spot => {
        spot.classList.remove('has-animal', 'success-glow', 'correct-feedback', 'try-again-feedback');
    });
    
    clearTimeout(hideTimer);
}

// Add this CSS class for the fade-out animation
// .fade-out {
//   opacity: 0;
//   transition: opacity 0.3s ease;
// }

// .celebrating {
//   animation: celebration 0.8s ease-out;
// }

// @keyframes celebration {
//   0%, 100% { transform: scale(1) translateY(0); }
//   25% { transform: scale(1.2) translateY(-10px); }
//   50% { transform: scale(1.3) translateY(-15px); }
//   75% { transform: scale(1.2) translateY(-5px); }
// }
