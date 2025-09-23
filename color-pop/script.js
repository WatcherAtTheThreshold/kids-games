/* ===================================================================
   COLOR POP - MAIN GAME LOGIC
   Orchestrates all core systems for balloon popping gameplay
   =================================================================== */

class ColorPopGame {
    constructor() {
        // === Core System Instances ===
        this.uiFramework = null;
        this.audioSystem = null;
        this.touchSystem = null;
        this.feedbackSystem = null;
        this.animationSystem = null;
        this.gameFlow = null;
        this.rewardSystem = null;
        
        // === Game Configuration ===
        this.gameConfig = {
            totalRounds: 5,
            balloonsPerRound: 3,
            stickerReward: 'balloon',
            gameTitle: 'Color Pop'
        };
        
        // === Available Colors ===
        this.availableColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        
        // === Game State ===
        this.gameState = {
            currentScreen: 'intro',
            currentRound: 0,
            targetColor: '',
            roundBalloons: [],
            isWaitingForInput: false,
            score: { correct: 0, total: 0 }
        };
        
        // === DOM References ===
        this.elements = {
            gameContainer: null,
            screens: {},
            balloons: [],
            progressBar: null,
            progressText: null,
            audioToggle: null
        };
        
        this.init();
    }

    /* ===================================================================
       GAME INITIALIZATION
       Set up all systems and prepare for gameplay
       =================================================================== */
    async init() {
        try {
            console.log('🎈 Initializing Color Pop Game...');
            
            await this.initializeSystems();
            this.cacheDOM();
            this.setupGameFlow();
            this.setupInteractions();
            this.showIntroScreen();
            
            console.log('✅ Color Pop Game ready to play!');
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            this.showErrorState();
        }
    }

    /* ===================================================================
       CORE SYSTEMS SETUP
       Initialize all our reusable game systems
       =================================================================== */
    async initializeSystems() {
        // === UI Framework ===
        this.uiFramework = new ResponsiveUIFramework({
            minTouchTarget: 80,
            colorScheme: 'auto',
            orientation: 'auto'  // Don't force orientation lock - let it be flexible
        });
        
        // === Audio System ===
        this.audioSystem = new AudioSystem();
        await this.audioSystem.init();
        
        // === Touch System ===  
        this.feedbackSystem = new FeedbackSystem(this.audioSystem);
        this.touchSystem = new TouchSystem(this.feedbackSystem);
        
        // === Animation System ===
        this.animationSystem = new AnimationSystem({
            maxConcurrentAnimations: 6,
            performanceMode: 'auto'
        });
        
        // === Game Flow Manager ===
        this.gameFlow = new GameFlowManager({
            audioSystem: this.audioSystem,
            feedbackSystem: this.feedbackSystem,
            touchSystem: this.touchSystem,
            roundsPerSession: this.gameConfig.totalRounds,
            gameTitle: this.gameConfig.gameTitle,
            stickerReward: this.gameConfig.stickerReward
        });
        
        // === Reward System ===
        this.rewardSystem = new RewardSystem({
            audioSystem: this.audioSystem,
            feedbackSystem: this.feedbackSystem,
            touchSystem: this.touchSystem
        });
        
        // === Inject CSS for reward system ===
        this.rewardSystem.injectRewardCSS();
    }

    /* ===================================================================
       DOM ELEMENT CACHING
       Store references to frequently used elements
       =================================================================== */
    cacheDOM() {
        this.elements.gameContainer = document.querySelector('[data-game-container]');
        
        // Cache all screen elements
        this.elements.screens = {
            intro: document.querySelector('[data-screen="intro"]'),
            gameplay: document.querySelector('[data-screen="gameplay"]'),
            completion: document.querySelector('[data-screen="completion"]')
        };
        
        // Cache interactive elements
        this.elements.startButton = document.querySelector('.start-game-btn');
        this.elements.claimStickerButton = document.querySelector('.claim-sticker-btn');
        this.elements.audioToggle = document.querySelector('.audio-toggle-btn');
        
        // Cache game status elements
        this.elements.currentRoundSpan = document.querySelector('.current-round');
        this.elements.totalRoundsSpan = document.querySelector('.total-rounds');
        this.elements.promptText = document.querySelector('.prompt-text');
        this.elements.progressBar = document.querySelector('.progress-fill');
        this.elements.progressText = document.querySelector('.progress-text');
        this.elements.scoreCorrect = document.querySelector('.score-correct');
        
        // Cache balloon playground
        this.elements.balloonPlayground = document.querySelector('.balloon-playground');
        this.elements.balloons = Array.from(document.querySelectorAll('.balloon'));
        
        console.log('📋 DOM elements cached successfully');
    }

    /* ===================================================================
       GAME FLOW SETUP
       Configure callbacks for game state management
       =================================================================== */
    setupGameFlow() {
        // === Game Flow Callbacks ===
        this.gameFlow.onRoundStart((roundData) => {
            this.startNewRound(roundData);
        });
        
        this.gameFlow.onRoundComplete((results) => {
            this.handleRoundComplete(results);
        });
        
        this.gameFlow.onGameComplete(() => {
            this.handleGameComplete();
        });
        
        this.gameFlow.onRewardShown((rewardData) => {
            this.handleRewardShown(rewardData);
        });
    }

    /* ===================================================================
       INTERACTION SETUP
       Register all touch targets and button handlers
       =================================================================== */
    setupInteractions() {
        // === Start Game Button ===
        this.touchSystem.registerTouchTarget(this.elements.startButton, {
            callback: () => this.startGame(),
            minSize: 80
        });
        
        // === Claim Sticker Button ===
        this.touchSystem.registerTouchTarget(this.elements.claimStickerButton, {
            callback: () => this.claimSticker(),
            minSize: 80
        });
        
        // === Play Again Button ===
        this.elements.playAgainButton = document.querySelector('.play-again-btn');
        if (this.elements.playAgainButton) {
            this.touchSystem.registerTouchTarget(this.elements.playAgainButton, {
                callback: () => this.restartGame(),
                minSize: 80
            });
        }
        
        // === Audio Toggle Button ===
        this.touchSystem.registerTouchTarget(this.elements.audioToggle, {
            callback: () => this.toggleAudio(),
            minSize: 44
        });
        
        // NOTE: Balloon interactions are registered dynamically each round in displayRoundBalloons()
        
        console.log('🎯 Touch interactions registered');
    }

    /* ===================================================================
       BALLOON INTERACTION SETUP
       Register touch handlers for all balloons
       =================================================================== */
    setupBalloonInteractions() {
        this.elements.balloons.forEach((balloon, index) => {
            this.touchSystem.registerTouchTarget(balloon, {
                callback: (touchData) => this.handleBalloonTap(balloon, touchData),
                minSize: 120,
                hitboxPadding: 20,
                data: { 
                    color: balloon.dataset.color,
                    balloonId: balloon.dataset.balloonId 
                }
            });
        });
    }

    /* ===================================================================
       SCREEN MANAGEMENT
       Handle transitions between different game screens
       =================================================================== */
    showIntroScreen() {
        this.switchToScreen('intro');
        this.gameState.currentScreen = 'intro';
        
        // Play welcome audio
        if (this.audioSystem && this.audioSystem.isReady()) {
            setTimeout(() => {
                this.audioSystem.playVoicePrompt('welcome');
            }, 1000);
        }
    }

    showGameplayScreen() {
        this.switchToScreen('gameplay');
        this.gameState.currentScreen = 'gameplay';
        this.updateGameplayUI();
    }

    showCompletionScreen() {
        this.switchToScreen('completion');
        this.gameState.currentScreen = 'completion';
        this.updateCompletionStats();
    }

    switchToScreen(screenName) {
        // Hide all screens
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = this.elements.screens[screenName];
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        console.log(`📺 Switched to ${screenName} screen`);
    }

    /* ===================================================================
       GAME LIFECYCLE METHODS
       Start, progress, and complete game sessions
       =================================================================== */
    startGame() {
        console.log('🎮 Starting Color Pop Game!');
        
        // Reset game state
        this.gameState.score = { correct: 0, total: 0 };
        this.gameState.currentRound = 0;
        
        // Initialize game flow
        if (this.gameFlow.startGame()) {
            this.showGameplayScreen();
            
            // Start first round after brief delay
            setTimeout(() => {
                this.gameFlow.beginGameplay();
            }, 1000);
        }
    }

    startNewRound(roundData) {
        console.log(`🎯 Starting Round ${roundData.roundNumber}`);
        
        this.gameState.currentRound = roundData.roundNumber;
        
        // IMPORTANT: Reset input state IMMEDIATELY
        this.gameState.isWaitingForInput = true;
        console.log('✅ Input enabled for round', roundData.roundNumber);
        
        // Generate round balloons and target color
        this.generateRoundData();
        
        // Update UI
        this.updateGameplayUI();
        this.updateProgressBar();
        
        // Display balloons
        this.displayRoundBalloons();
        
        // Play voice prompt after balloons appear
        setTimeout(() => {
            this.playColorPrompt();
        }, 1500);
    }

    handleRoundComplete(results) {
        console.log(`✅ Round ${results.roundNumber} completed:`, results);
        
        this.gameState.isWaitingForInput = false;
        this.updateProgressBar();
        
        console.log(`📊 Current score: ${this.gameState.score.correct}/${this.gameState.score.total}`);
        
        // Brief pause before next round
        setTimeout(() => {
            if (results.roundNumber < this.gameConfig.totalRounds) {
                console.log('➡️  Proceeding to next round...');
            } else {
                console.log('🎉 All rounds completed! Waiting for game completion...');
            }
        }, 1500);
    }

    handleGameComplete() {
        console.log('🎉 Game completed successfully!');
        
        // Show completion celebration
        this.showCompletionScreen();
        
        // Trigger big celebration
        setTimeout(() => {
            if (this.feedbackSystem) {
                this.feedbackSystem.bigCelebration(this.elements.gameContainer);
            }
        }, 500);
        
        // Automatically show reward popup after celebration
        setTimeout(() => {
            this.claimSticker();
        }, 3000);
    }

    handleRewardShown(rewardData) {
        console.log('🏆 Reward shown:', rewardData);
        
        // ACTUALLY SHOW THE REWARD POPUP
        // This is called by GameFlowManager when the game naturally completes
        setTimeout(() => {
            this.claimSticker();
        }, 1000); // Brief delay after the game flow completion
    }

    /* ===================================================================
       ROUND DATA GENERATION
       Create balloon colors and select target for each round
       =================================================================== */
    generateRoundData() {
        // Select 3 random colors (ensuring target is included)
        const roundColors = this.selectRoundColors();
        this.gameState.roundBalloons = roundColors;
        
        // Pick one as the target
        this.gameState.targetColor = roundColors[Math.floor(Math.random() * roundColors.length)];
        
        console.log(`🎯 Target color: ${this.gameState.targetColor}`);
        console.log(`🎈 Balloon colors: ${roundColors.join(', ')}`);
    }

    selectRoundColors() {
        const selectedColors = [];
        const shuffledColors = [...this.availableColors].sort(() => Math.random() - 0.5);
        
        // Take first 3 colors from shuffled array
        for (let i = 0; i < this.gameConfig.balloonsPerRound && i < shuffledColors.length; i++) {
            selectedColors.push(shuffledColors[i]);
        }
        
        return selectedColors;
    }

    /* ===================================================================
       BALLOON DISPLAY AND ANIMATION
       Show balloons for current round with floating animations
       =================================================================== */
    displayRoundBalloons() {
        this.elements.balloons.forEach((balloon, index) => {
            if (index < this.gameState.roundBalloons.length) {
                const color = this.gameState.roundBalloons[index];
                
                // Set balloon color
                balloon.dataset.color = color;
                
                // FORCE visual color update by directly setting CSS
                const balloonBody = balloon.querySelector('.balloon-body');
                if (balloonBody) {
                    this.setBalloonBodyColor(balloonBody, color);
                }
                
                // FORCE CSS class update to ensure visual color changes
                balloon.classList.remove('popping', 'wobbling');
                balloon.style.display = 'block';
                
                // RE-REGISTER TOUCH TARGET WITH NEW COLOR DATA
                // This ensures TouchSystem reads the updated color
                this.touchSystem.unregisterTouchTarget(balloon.dataset.touchId);
                const newTouchId = this.touchSystem.registerTouchTarget(balloon, {
                    callback: (touchData) => this.handleBalloonTap(balloon, touchData),
                    minSize: 120,
                    hitboxPadding: 20,
                    data: { 
                        color: color,  // Use the NEW color
                        balloonId: balloon.dataset.balloonId 
                    }
                });
                
                console.log(`🎨 Balloon ${index + 1} set to: ${color} (TouchID: ${newTouchId})`);
                
                // Start floating animation
                this.animationSystem.float(balloon, { 
                    duration: 3000 + (index * 500)  // Stagger animations
                });
                
            } else {
                // Hide extra balloons and unregister touch
                balloon.style.display = 'none';
                if (balloon.dataset.touchId) {
                    this.touchSystem.unregisterTouchTarget(balloon.dataset.touchId);
                }
            }
        });
        
        // Slide in balloons
        this.animationSystem.animateSequence(
            this.elements.balloons.filter(b => b.style.display !== 'none'),
            'slide-in-up',
            { stagger: 200 }
        );
    }

    /* ===================================================================
       BALLOON COLOR HELPER
       Directly set balloon background colors to force visual updates
       =================================================================== */
    setBalloonBodyColor(balloonBody, color) {
        const colorGradients = {
            'red': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
            'blue': 'linear-gradient(135deg, #4D96FF 0%, #7BB3FF 100%)',
            'green': 'linear-gradient(135deg, #6BCB77 0%, #8FD999 100%)',
            'yellow': 'linear-gradient(135deg, #FFD93D 0%, #FFE066 100%)',
            'purple': 'linear-gradient(135deg, #9B59B6 0%, #B377D9 100%)',
            'orange': 'linear-gradient(135deg, #FF8C42 0%, #FFA366 100%)'
        };
        
        const gradient = colorGradients[color] || colorGradients['blue'];
        balloonBody.style.background = gradient;
        
        console.log(`🎨 Applied ${color} gradient to balloon body`);
    }

    /* ===================================================================
       BALLOON INTERACTION HANDLING
       Process taps on balloons with feedback
       =================================================================== */
    handleBalloonTap(balloon, touchData) {
        console.log(`🎈 Balloon tap attempt - Round ${this.gameState.currentRound}, Waiting: ${this.gameState.isWaitingForInput}`);
        
        if (!this.gameState.isWaitingForInput) {
            console.log('❌ Tap ignored - not waiting for input');
            return; // Ignore taps when not waiting for input
        }
        
        console.log(`🎈 Balloon tapped: ${touchData.targetData.color}`);
        console.log(`🎯 Expected color: ${this.gameState.targetColor}`);
        
        const tappedColor = touchData.targetData.color;
        const isCorrect = tappedColor === this.gameState.targetColor;
        
        // DISABLE INPUT IMMEDIATELY after tap
        this.gameState.isWaitingForInput = false;
        console.log('🚫 Input disabled after tap');
        
        // Update score
        this.gameState.score.total++;
        if (isCorrect) {
            this.gameState.score.correct++;
        }
        
        // Process the tap result
        if (isCorrect) {
            this.handleCorrectTap(balloon);
        } else {
            this.handleIncorrectTap(balloon);
        }
        
        // Complete the round after feedback
        setTimeout(() => {
            this.gameFlow.completeCurrentRound(isCorrect);
        }, isCorrect ? 1500 : 1000);
    }
handleCorrectTap(balloon) {
    console.log('✅ Correct balloon tapped!');
    
    this.gameState.isWaitingForInput = false;
    
    // Pop animation
   // balloon.classList.add('popping');
    //this.animationSystem.pop(balloon);
    
    // Simple feedback - no big celebration
   // if (this.feedbackSystem) {
     //   this.feedbackSystem.celebrateCorrect(balloon, 'gentle'); // Changed from 'normal' to 'gentle'
   // }
    
    // Show success message
    //this.showFeedbackMessage('Great job! 🎉', 'success');
}

    handleIncorrectTap(balloon) {
        console.log('❌ Incorrect balloon tapped');
        
        // Gentle wobble animation
        balloon.classList.add('wobbling');
        this.animationSystem.wobble(balloon);
        
        // Gentle redirection feedback
        this.feedbackSystem.gentleRedirect(balloon, 'try-again');
        
        // Audio redirection
        if (this.audioSystem && this.audioSystem.isReady()) {
            this.audioSystem.playVoicePrompt('try-again');
        }
        
        // Show gentle message
        this.showFeedbackMessage('Try again! 😊', 'gentle');
    }

    /* ===================================================================
       VOICE PROMPTS
       Play color-specific voice instructions
       =================================================================== */
    playColorPrompt() {
        const promptKey = `find-${this.gameState.targetColor}`;
        
        if (this.audioSystem && this.audioSystem.isReady()) {
            this.audioSystem.playVoicePrompt(promptKey);
        }
        
        // Update visual prompt
        const colorName = this.gameState.targetColor.charAt(0).toUpperCase() + 
                         this.gameState.targetColor.slice(1);
        this.elements.promptText.textContent = `Find the ${colorName} balloon!`;
    }

    /* ===================================================================
       UI UPDATE METHODS
       Keep visual elements synchronized with game state
       =================================================================== */
    updateGameplayUI() {
        // Update round counter
        this.elements.currentRoundSpan.textContent = this.gameState.currentRound;
        this.elements.totalRoundsSpan.textContent = this.gameConfig.totalRounds;
        
        // Clear previous prompt
        this.elements.promptText.textContent = 'Get ready...';
    }

    updateProgressBar() {
        const progress = (this.gameState.currentRound / this.gameConfig.totalRounds) * 100;
        this.elements.progressBar.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${this.gameState.currentRound} / ${this.gameConfig.totalRounds}`;
    }

    updateCompletionStats() {
        if (this.elements.scoreCorrect) {
            this.elements.scoreCorrect.textContent = this.gameState.score.correct;
        }
    }

    showFeedbackMessage(message, type) {
        const feedbackElement = document.querySelector('.feedback-message');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = `feedback-message show ${type}`;
            
            // Hide after 2 seconds
            setTimeout(() => {
                feedbackElement.classList.remove('show');
            }, 2000);
        }
    }

    /* ===================================================================
       AUDIO CONTROL
       Handle audio toggle for parental controls
       =================================================================== */
    toggleAudio() {
        if (this.audioSystem) {
            const isEnabled = this.audioSystem.toggle();
            
            // Update button visual state
            this.elements.audioToggle.classList.toggle('muted', !isEnabled);
            
            console.log(`🔊 Audio ${isEnabled ? 'enabled' : 'disabled'}`);
        }
    }

    /* ===================================================================
       REWARD SYSTEM INTEGRATION
       Handle sticker earning and placement
       =================================================================== */
    claimSticker() {
        console.log('🏆 Claiming sticker reward...');
        
        // Show reward screen with earned sticker
        this.rewardSystem.showRewardScreen(this.gameConfig.stickerReward, this.gameConfig.gameTitle);
        
        // After claiming, offer to play again
        setTimeout(() => {
            this.showPlayAgainOption();
        }, 5000);
    }

    showPlayAgainOption() {
        // Add play again button to completion screen
        const completionContent = document.querySelector('.completion-content');
        
        if (!completionContent.querySelector('.play-again-btn')) {
            const playAgainBtn = document.createElement('button');
            playAgainBtn.className = 'play-again-btn big-button';
            playAgainBtn.textContent = 'Play Again';
            playAgainBtn.style.marginTop = '20px';
            
            completionContent.appendChild(playAgainBtn);
            
            // Register touch handler
            this.touchSystem.registerTouchTarget(playAgainBtn, {
                callback: () => this.restartGame(),
                minSize: 80
            });
        }
    }

    restartGame() {
        console.log('🔄 Restarting game...');
        
        // Reset to intro screen
        this.showIntroScreen();
        
        // Clear any existing animations
        this.animationSystem.cancelAll();
        
        // Reset balloon states
        this.elements.balloons.forEach(balloon => {
            balloon.classList.remove('popping', 'wobbling');
            balloon.style.display = 'block';
        });
    }

    /* ===================================================================
       ERROR HANDLING
       Graceful degradation if systems fail
       =================================================================== */
    showErrorState() {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-screen';
        errorMessage.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2>Oops! Something went wrong</h2>
                <p>Please refresh the page to try again.</p>
                <button onclick="location.reload()" style="padding: 15px 30px; font-size: 18px; border: none; border-radius: 10px; background: #FF6B6B; color: white; cursor: pointer;">
                    Refresh Game
                </button>
            </div>
        `;
        document.body.appendChild(errorMessage);
    }
}

/* ===================================================================
   GAME INITIALIZATION
   Start the game when page loads
   =================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎈 Loading Color Pop Game...');
    
    // Create and start the game
    window.colorPopGame = new ColorPopGame();
    
    // Backup reminder for development
    console.log('💾 Reminder: Back up your project files regularly during development!');
});

/* ===================================================================
   DEVELOPMENT HELPERS
   Useful functions for testing and debugging V2
   =================================================================== */
if (typeof window !== 'undefined') {
    // Expose game instance globally for debugging
    window.debugColorPop = {
        skipToCompletion: () => {
            if (window.colorPopGame) {
                window.colorPopGame.gameState.currentRound = 5;
                window.colorPopGame.gameState.score = { correct: 5, total: 5 };
                window.colorPopGame.handleGameComplete();
            }
        },
        toggleDebugTouch: () => {
            if (window.colorPopGame && window.colorPopGame.touchSystem) {
                window.colorPopGame.touchSystem.debugMode ? 
                    window.colorPopGame.touchSystem.disableDebugMode() :
                    window.colorPopGame.touchSystem.enableDebugMode();
            }
        },
        getGameState: () => {
            return window.colorPopGame ? window.colorPopGame.gameState : null;
        }
    };
}
