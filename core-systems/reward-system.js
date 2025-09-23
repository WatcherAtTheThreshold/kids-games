/* ===================================================================
   KIDS GAMES - REWARD SYSTEM
   Manages sticker collection, placement, and display
   =================================================================== */

class RewardSystem {
    constructor(options = {}) {
        // === System dependencies ===
        this.audioSystem = options.audioSystem || null;
        this.feedbackSystem = options.feedbackSystem || null;
        this.touchSystem = options.touchSystem || null;
        
        // === Reward configuration ===
        this.config = {
            maxStickersPerShelf: options.maxStickersPerShelf || 12,
            stickerSize: options.stickerSize || 60,
            shelfColumns: options.shelfColumns || 4,
            autoSaveEnabled: options.autoSaveEnabled || true
        };
        
        // === Sticker collection data (stored in memory) ===
        this.collection = {
            earned: [],         // Stickers earned but not placed
            placed: [],         // Stickers placed on shelf with positions
            totalEarned: 0,     // Lifetime count of earned stickers
            achievements: []    // Special milestones reached
        };
        
        // === Available sticker types ===
        this.stickerTypes = {
            'star': { emoji: '⭐', name: 'Golden Star', rarity: 'common' },
            'balloon': { emoji: '🎈', name: 'Happy Balloon', rarity: 'common' },
            'sun': { emoji: '☀️', name: 'Bright Sun', rarity: 'common' },
            'flower': { emoji: '🌸', name: 'Pretty Flower', rarity: 'common' },
            'butterfly': { emoji: '🦋', name: 'Beautiful Butterfly', rarity: 'uncommon' },
            'rainbow': { emoji: '🌈', name: 'Colorful Rainbow', rarity: 'uncommon' },
            'trophy': { emoji: '🏆', name: 'Champion Trophy', rarity: 'rare' },
            'crown': { emoji: '👑', name: 'Royal Crown', rarity: 'rare' },
            'diamond': { emoji: '💎', name: 'Sparkling Diamond', rarity: 'legendary' },
            'unicorn': { emoji: '🦄', name: 'Magic Unicorn', rarity: 'legendary' }
        };
        
        // === UI state ===
        this.ui = {
            rewardScreenVisible: false,
            stickerShelfVisible: false,
            selectedSticker: null,
            placementMode: false
        };
        
        this.init();
    }

    /* === INITIALIZATION === */
    init() {
        this.createStickerShelf();
        this.loadCollection();
        console.log('Reward System initialized');
    }

    /* === STICKER EARNING === */
    earnSticker(stickerType, gameTitle = 'Game') {
        if (!this.stickerTypes[stickerType]) {
            console.warn(`Unknown sticker type: ${stickerType}`);
            return false;
        }
        
        const newSticker = this.createStickerData(stickerType, gameTitle);
        this.collection.earned.push(newSticker);
        this.collection.totalEarned++;
        
        // Check for achievements
        this.checkAchievements();
        
        // Auto-save progress
        if (this.config.autoSaveEnabled) {
            this.saveCollection();
        }
        
        console.log(`Earned sticker: ${stickerType} from ${gameTitle}`);
        return newSticker;
    }

    createStickerData(stickerType, gameTitle) {
        const stickerInfo = this.stickerTypes[stickerType];
        return {
            id: this.generateStickerId(),
            type: stickerType,
            emoji: stickerInfo.emoji,
            name: stickerInfo.name,
            rarity: stickerInfo.rarity,
            earnedFrom: gameTitle,
            earnedAt: new Date().toISOString(),
            isPlaced: false
        };
    }

    /* === REWARD SCREEN MANAGEMENT === */
    showRewardScreen(stickerType, gameTitle = 'Game') {
        // First earn the sticker
        const earnedSticker = this.earnSticker(stickerType, gameTitle);
        if (!earnedSticker) return;
        
        this.ui.rewardScreenVisible = true;
        this.ui.selectedSticker = earnedSticker;
        
        // Create reward display
        this.displayRewardScreen(earnedSticker);
        
        // Celebration feedback
        if (this.feedbackSystem) {
            const rewardScreen = document.querySelector('.reward-screen');
            setTimeout(() => {
                this.feedbackSystem.bigCelebration(rewardScreen);
            }, 500);
        }
        
        // Audio celebration
       // if (this.audioSystem && this.audioSystem.isReady()) {
           // this.audioSystem.playVoicePrompt('amazing');
           // setTimeout(() => {
              //  this.audioSystem.playSound('celebrate');
           // }, 800);
       // }
    }

    displayRewardScreen(sticker) {
        // Remove existing reward screen
        const existingScreen = document.querySelector('.reward-screen');
        if (existingScreen) existingScreen.remove();
        
        const rewardScreen = document.createElement('div');
        rewardScreen.className = 'reward-screen';
        rewardScreen.innerHTML = `
            <div class="reward-content">
                <h2>You earned a sticker!</h2>
                <div class="earned-sticker" data-sticker-type="${sticker.type}">
                    <div class="sticker-emoji">${sticker.emoji}</div>
                    <div class="sticker-name">${sticker.name}</div>
                </div>
                <div class="reward-buttons">
                    <button class="place-sticker-btn">Place on Shelf</button>
                    <button class="collect-later-btn">Collect Later</button>
                </div>
                <div class="navigation-buttons">
                    <button class="play-again-nav-btn">Play Again</button>
                    <a href="../index.html" class="back-to-hub-nav-btn">Back to Games</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(rewardScreen);
        
        // Setup button interactions
        this.setupRewardScreenInteractions(rewardScreen, sticker);
    }

    setupRewardScreenInteractions(rewardScreen, sticker) {
        const placeBtn = rewardScreen.querySelector('.place-sticker-btn');
        const collectBtn = rewardScreen.querySelector('.collect-later-btn');
        const playAgainBtn = rewardScreen.querySelector('.play-again-nav-btn');
        const backToHubBtn = rewardScreen.querySelector('.back-to-hub-nav-btn');
        
        if (this.touchSystem) {
            // Place sticker button
            this.touchSystem.registerTouchTarget(placeBtn, {
                callback: () => {
                    this.hideRewardScreen();
                    this.enterPlacementMode(sticker);
                },
                minSize: 80
            });
            
            // Collect later button  
            this.touchSystem.registerTouchTarget(collectBtn, {
                callback: () => {
                    this.hideRewardScreen();
                },
                minSize: 80
            });
            
            // Play again navigation
            if (playAgainBtn) {
                this.touchSystem.registerTouchTarget(playAgainBtn, {
                    callback: () => {
                        this.hideRewardScreen();
                        // Call restart game if the game instance exists
                        if (window.colorPopGame) {
                            window.colorPopGame.restartGame();
                        }
                    },
                    minSize: 80
                });
            }
            
            // Back to hub button (href handles navigation)
            if (backToHubBtn) {
                this.touchSystem.registerTouchTarget(backToHubBtn, {
                    callback: () => {
                        console.log('Returning to game hub...');
                        // Navigation handled by href="../index.html"
                    },
                    minSize: 80
                });
            }
        }
    }

    hideRewardScreen() {
        const rewardScreen = document.querySelector('.reward-screen');
        if (rewardScreen) {
            rewardScreen.classList.add('reward-screen-exit');
            setTimeout(() => rewardScreen.remove(), 300);
        }
        this.ui.rewardScreenVisible = false;
        this.ui.selectedSticker = null;
    }

    /* === STICKER PLACEMENT === */
    enterPlacementMode(sticker) {
        this.ui.placementMode = true;
        this.ui.selectedSticker = sticker;
        
        this.showStickerShelf();
        this.showPlacementInstructions();
        
        // Audio instruction
        if (this.audioSystem && this.audioSystem.isReady()) {
            this.audioSystem.playVoicePrompt('place-sticker');
        }
    }

    showPlacementInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'placement-instructions';
        instructions.innerHTML = `
            <p>Tap where you want to place your ${this.ui.selectedSticker.name}!</p>
        `;
        
        const shelf = document.querySelector('.sticker-shelf');
        shelf.appendChild(instructions);
        
        // Remove instructions after a few seconds
        setTimeout(() => {
            if (instructions.parentNode) {
                instructions.parentNode.removeChild(instructions);
            }
        }, 3000);
    }

    placeStickerAt(position) {
        if (!this.ui.selectedSticker || !this.ui.placementMode) return false;
        
        // Update sticker data with placement position
        this.ui.selectedSticker.isPlaced = true;
        this.ui.selectedSticker.position = position;
        this.ui.selectedSticker.placedAt = new Date().toISOString();
        
        // Move from earned to placed collection
        const stickerIndex = this.collection.earned.findIndex(s => s.id === this.ui.selectedSticker.id);
        if (stickerIndex >= 0) {
            this.collection.earned.splice(stickerIndex, 1);
            this.collection.placed.push(this.ui.selectedSticker);
        }
        
        // Create visual sticker on shelf
        this.createPlacedStickerElement(this.ui.selectedSticker);
        
        // Celebration for placement
        if (this.feedbackSystem) {
            const stickerElement = document.querySelector(`[data-sticker-id="${this.ui.selectedSticker.id}"]`);
            this.feedbackSystem.celebrateCorrect(stickerElement, 'gentle');
        }
        
        // Audio feedback
        if (this.audioSystem && this.audioSystem.isReady()) {
            //this.audioSystem.playVoicePrompt('great-job');
            this.audioSystem.playSound('pop');
        }
        
        // Exit placement mode
        this.exitPlacementMode();
        
        // Save progress
        if (this.config.autoSaveEnabled) {
            this.saveCollection();
        }
        
        return true;
    }

    exitPlacementMode() {
        this.ui.placementMode = false;
        this.ui.selectedSticker = null;
        
        // Remove placement instructions
        const instructions = document.querySelector('.placement-instructions');
        if (instructions) instructions.remove();
    }

    /* === STICKER SHELF MANAGEMENT === */
    createStickerShelf() {
        // Check if shelf already exists
        let shelf = document.querySelector('.sticker-shelf');
        if (!shelf) {
            shelf = document.createElement('div');
            shelf.className = 'sticker-shelf';
            shelf.innerHTML = `
                <div class="shelf-header">
                    <h3>My Sticker Collection</h3>
                    <button class="close-shelf-btn">×</button>
                </div>
                <div class="shelf-grid"></div>
                <div class="earned-stickers-list"></div>
            `;
            document.body.appendChild(shelf);
        }
        
        // Setup shelf interactions
        this.setupShelfInteractions(shelf);
        return shelf;
    }

    setupShelfInteractions(shelf) {
        const closeBtn = shelf.querySelector('.close-shelf-btn');
        const shelfGrid = shelf.querySelector('.shelf-grid');
        
        if (this.touchSystem) {
            // Close button
            this.touchSystem.registerTouchTarget(closeBtn, {
                callback: () => this.hideStickerShelf(),
                minSize: 44
            });
            
            // Shelf grid for placement
            this.touchSystem.registerTouchTarget(shelfGrid, {
                callback: (touchData) => {
                    if (this.ui.placementMode) {
                        const position = this.calculateGridPosition(touchData.position, shelfGrid);
                        this.placeStickerAt(position);
                    }
                },
                hitboxPadding: 0 // Precise placement for shelf
            });
        }
        
        // Create grid positions
        this.createShelfGrid(shelfGrid);
    }

    createShelfGrid(container) {
        container.innerHTML = ''; // Clear existing grid
        
        const totalSlots = this.config.maxStickersPerShelf;
        const columns = this.config.shelfColumns;
        
        for (let i = 0; i < totalSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'shelf-slot';
            slot.setAttribute('data-slot-index', i);
            container.appendChild(slot);
        }
        
        // Set CSS grid layout
        container.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${columns}, 1fr);
            gap: 10px;
            padding: 20px;
        `;
    }

    calculateGridPosition(touchPosition, gridElement) {
        const rect = gridElement.getBoundingClientRect();
        const relativeX = touchPosition.x - rect.left;
        const relativeY = touchPosition.y - rect.top;
        
        const columns = this.config.shelfColumns;
        const slotWidth = rect.width / columns;
        const slotHeight = (rect.height / Math.ceil(this.config.maxStickersPerShelf / columns));
        
        const column = Math.floor(relativeX / slotWidth);
        const row = Math.floor(relativeY / slotHeight);
        
        return {
            x: relativeX,
            y: relativeY,
            gridColumn: Math.min(column, columns - 1),
            gridRow: row,
            slotIndex: row * columns + column
        };
    }

    createPlacedStickerElement(sticker) {
        const shelf = document.querySelector('.shelf-grid');
        if (!shelf) return;
        
        const stickerElement = document.createElement('div');
        stickerElement.className = 'placed-sticker';
        stickerElement.setAttribute('data-sticker-id', sticker.id);
        stickerElement.innerHTML = `
            <div class="sticker-emoji">${sticker.emoji}</div>
        `;
        
        // Position in grid
        if (sticker.position) {
            const slot = shelf.querySelector(`[data-slot-index="${sticker.position.slotIndex}"]`);
            if (slot) {
                slot.appendChild(stickerElement);
            }
        }
        
        return stickerElement;
    }

    showStickerShelf() {
        const shelf = document.querySelector('.sticker-shelf');
        if (shelf) {
            shelf.classList.add('shelf-visible');
            this.ui.stickerShelfVisible = true;
            
            // Refresh shelf display with current collection
            this.refreshShelfDisplay();
        }
    }

    hideStickerShelf() {
        const shelf = document.querySelector('.sticker-shelf');
        if (shelf) {
            shelf.classList.remove('shelf-visible');
            this.ui.stickerShelfVisible = false;
            
            // Exit placement mode if active
            if (this.ui.placementMode) {
                this.exitPlacementMode();
            }
        }
    }

    refreshShelfDisplay() {
        // Re-create placed stickers on shelf
        this.collection.placed.forEach(sticker => {
            this.createPlacedStickerElement(sticker);
        });
        
        // Update earned stickers list
        this.updateEarnedStickersList();
    }

    updateEarnedStickersList() {
        const earnedList = document.querySelector('.earned-stickers-list');
        if (!earnedList) return;
        
        earnedList.innerHTML = '';
        
        if (this.collection.earned.length > 0) {
            const listTitle = document.createElement('h4');
            listTitle.textContent = 'New Stickers to Place:';
            earnedList.appendChild(listTitle);
            
            this.collection.earned.forEach(sticker => {
                const stickerItem = document.createElement('div');
                stickerItem.className = 'earned-sticker-item';
                stickerItem.innerHTML = `
                    <span class="sticker-emoji">${sticker.emoji}</span>
                    <span class="sticker-name">${sticker.name}</span>
                `;
                earnedList.appendChild(stickerItem);
            });
        }
    }

    /* === ACHIEVEMENTS === */
    checkAchievements() {
        const totalStickers = this.collection.totalEarned;
        const placedStickers = this.collection.placed.length;
        
        // First sticker achievement
        if (totalStickers === 1 && !this.hasAchievement('first-sticker')) {
            this.unlockAchievement('first-sticker', 'First Sticker!', '⭐');
        }
        
        // Collection milestones
        if (totalStickers === 5 && !this.hasAchievement('collector')) {
            this.unlockAchievement('collector', 'Sticker Collector!', '🎉');
        }
        
        if (totalStickers === 10 && !this.hasAchievement('expert-collector')) {
            this.unlockAchievement('expert-collector', 'Expert Collector!', '🏆');
        }
        
        // Full shelf achievement
        if (placedStickers >= this.config.maxStickersPerShelf && !this.hasAchievement('full-shelf')) {
            this.unlockAchievement('full-shelf', 'Full Shelf!', '👑');
        }
    }

    hasAchievement(achievementId) {
        return this.collection.achievements.some(a => a.id === achievementId);
    }

    unlockAchievement(id, title, emoji) {
        const achievement = {
            id: id,
            title: title,
            emoji: emoji,
            unlockedAt: new Date().toISOString()
        };
        
        this.collection.achievements.push(achievement);
        this.showAchievementNotification(achievement);
        
        console.log(`Achievement unlocked: ${title}`);
    }

    showAchievementNotification(achievement) {
        // Create achievement popup
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-emoji">${achievement.emoji}</div>
                <div class="achievement-title">${achievement.title}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after display
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
        // Audio celebration
        if (this.audioSystem && this.audioSystem.isReady()) {
            //this.audioSystem.playVoicePrompt('amazing');
        }
    }

    /* === DATA PERSISTENCE === */
    saveCollection() {
        // Store in memory (localStorage not available in Claude artifacts)
        // In real implementation, this would save to localStorage or backend
        console.log('Collection saved:', this.collection);
    }

    loadCollection() {
        // Load from memory/storage
        // In real implementation, this would load from localStorage or backend
        console.log('Collection loaded');
    }

    /* === UTILITY METHODS === */
    generateStickerId() {
        return 'sticker_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    getStickerCount() {
        return {
            earned: this.collection.earned.length,
            placed: this.collection.placed.length,
            total: this.collection.totalEarned
        };
    }

    getAvailableStickerTypes() {
        return Object.keys(this.stickerTypes);
    }

    /* === CSS INJECTION === */
    injectRewardCSS() {
        if (document.getElementById('reward-system-styles')) return;
        
        const styles = `
            <style id="reward-system-styles">
                /* === REWARD SCREEN === */
                .reward-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: reward-screen-enter 0.3s ease-out;
                }
                
                .reward-content {
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    text-align: center;
                    max-width: 350px;
                    animation: reward-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                .earned-sticker .sticker-emoji {
                    font-size: 60px;
                    margin: 20px 0;
                    animation: sticker-celebration 1s ease-in-out;
                }
                
                .reward-buttons {
                    display: flex;
                    gap: 15px;
                    margin-top: 25px;
                }
                
                .reward-buttons button {
                    flex: 1;
                    padding: 15px;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    min-height: 50px;
                }
                
                .place-sticker-btn {
                    background: #4ECDC4;
                    color: white;
                }
                
                .collect-later-btn {
                    background: #f0f0f0;
                    color: #666;
                }
                
                /* === NAVIGATION BUTTONS === */
                .navigation-buttons {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #ECF0F1;
                }
                
                .play-again-nav-btn,
                .back-to-hub-nav-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    min-height: 44px;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .play-again-nav-btn {
                    background: #4D96FF;
                    color: white;
                }
                
                .play-again-nav-btn:active {
                    background: #3182FF;
                    transform: scale(0.95);
                }
                
                .back-to-hub-nav-btn {
                    background: #9B59B6;
                    color: white;
                }
                
                .back-to-hub-nav-btn:active {
                    background: #8E44AD;
                    transform: scale(0.95);
                }
                
                /* === STICKER SHELF === */
                .sticker-shelf {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: white;
                    z-index: 1500;
                    transform: translateY(100%);
                    transition: transform 0.3s ease-out;
                }
                
                .shelf-visible {
                    transform: translateY(0);
                }
                
                .shelf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 2px solid #f0f0f0;
                }
                
                .close-shelf-btn {
                    width: 44px;
                    height: 44px;
                    border: none;
                    background: #f0f0f0;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                }
                
                .shelf-slot {
                    width: 70px;
                    height: 70px;
                    border: 2px dashed #ddd;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                
                .placed-sticker {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .placed-sticker .sticker-emoji {
                    font-size: 40px;
                }
                
                /* === ANIMATIONS === */
                @keyframes reward-screen-enter {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes reward-bounce {
                    0% { transform: scale(0.3) rotate(-10deg); }
                    50% { transform: scale(1.05) rotate(5deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                
                @keyframes sticker-celebration {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    25% { transform: scale(1.2) rotate(-10deg); }
                    75% { transform: scale(1.1) rotate(10deg); }
                }
                
                /* === RESPONSIVE === */
                @media (max-width: 480px) {
                    .reward-content {
                        max-width: 300px;
                        padding: 25px;
                    }
                    
                    .navigation-buttons {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .play-again-nav-btn,
                    .back-to-hub-nav-btn {
                        min-height: 50px;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

/* ===================================================================
   EXPORT FOR MODULE USE
   =================================================================== */
// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RewardSystem;
}

// For global use
if (typeof window !== 'undefined') {
    window.RewardSystem = RewardSystem;
}
