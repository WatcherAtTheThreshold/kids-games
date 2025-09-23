/* ===================================================================
   KIDS GAMES - GAME FLOW MANAGEMENT SYSTEM
   Orchestrates rounds, sessions, and state transitions
   =================================================================== */

class GameFlowManager {
    constructor(options = {}) {
        // === System dependencies ===
        this.audioSystem = options.audioSystem || null;
        this.feedbackSystem = options.feedbackSystem || null;
        this.touchSystem = options.touchSystem || null;
        
        // === Game configuration ===
        this.config = {
            minSessionTime: options.minSessionTime || 60000,    // 60 seconds minimum
            maxSessionTime: options.maxSessionTime || 180000,   // 180 seconds maximum
            roundsPerSession: options.roundsPerSession || 5,     // Default 5 rounds
            gameTitle: options.gameTitle || 'Kids Game',
            stickerReward: options.stickerReward || 'star'
        };
        
        // === Game state ===
        this.gameState = {
            phase: 'not-started',    // not-started, intro, playing, paused, completed, rewarding
            currentRound: 0,
            totalRounds: this.config.roundsPerSession,
            sessionStartTime: null,
            sessionEndTime: null,
            roundStartTime: null,
            score: {
                correct: 0,
                total: 0,
                streak: 0
            }
        };
        
        // === Callbacks for game-specific logic ===
        this.callbacks = {
            onGameStart: null,
            onRoundStart: null,
            onRoundComplete: null,
            onGameComplete: null,
            onRewardShown: null
        };
        
        this.init();
    }

    /* === INITIALIZATION === */
    init() {
        this.setupGameContainer();
        console.log(`Game Flow Manager initialized for: ${this.config.gameTitle}`);
    }

    /* === GAME LIFECYCLE CONTROL === */
    startGame() {
        if (this.gameState.phase !== 'not-started' && this.gameState.phase !== 'completed') {
            console.warn('Game already in progress');
            return false;
        }
        
        this.resetGameState();
        this.gameState.phase = 'intro';
        this.gameState.sessionStartTime = Date.now();
        
        // Play intro audio and show intro screen
        this.showIntroScreen();
        
        return true;
    }

    beginGameplay() {
        if (this.gameState.phase !== 'intro') return false;
        
        this.gameState.phase = 'playing';
        this.startNextRound();
        
        return true;
    }

    pauseGame() {
        if (this.gameState.phase === 'playing') {
            this.gameState.phase = 'paused';
            
            // Pause any active timers or animations
            if (this.callbacks.onGamePause) {
                this.callbacks.onGamePause();
            }
            
            return true;
        }
        return false;
    }

    resumeGame() {
        if (this.gameState.phase === 'paused') {
            this.gameState.phase = 'playing';
            
            if (this.callbacks.onGameResume) {
                this.callbacks.onGameResume();
            }
            
            return true;
        }
        return false;
    }

    endGame() {
        this.gameState.sessionEndTime = Date.now();
        this.gameState.phase = 'completed';
        
        // Show completion celebration
        this.showGameComplete();
        
        return true;
    }

    /* === ROUND MANAGEMENT === */
    startNextRound() {
        if (this.gameState.phase !== 'playing') return false;
        
        this.gameState.currentRound++;
        this.gameState.roundStartTime = Date.now();
        
        // Check if we've completed all rounds
        if (this.gameState.currentRound > this.gameState.totalRounds) {
            this.endGame();
            return false;
        }
        
        // Announce round start
        this.announceRoundStart();
        
        // Execute game-specific round start logic
        if (this.callbacks.onRoundStart) {
            const roundData = this.createRoundData();
            this.callbacks.onRoundStart(roundData);
        }
        
        return true;
    }

    completeCurrentRound(success = true) {
        if (this.gameState.phase !== 'playing') return false;
        
        const roundDuration = Date.now() - this.gameState.roundStartTime;
        
        // Update score tracking
        this.updateScore(success);
        
        // Execute game-specific round complete logic
        if (this.callbacks.onRoundComplete) {
            const roundResults = {
                roundNumber: this.gameState.currentRound,
                success: success,
                duration: roundDuration,
                score: { ...this.gameState.score }
            };
            this.callbacks.onRoundComplete(roundResults);
        }
        
        // Provide round completion feedback
        //this.showRoundFeedback(success);
        
        // Start next round after brief delay
        setTimeout(() => {
            this.startNextRound();
        }, 1500);
        
        return true;
    }

    /* === SCORE & PROGRESS TRACKING === */
    updateScore(correct) {
        this.gameState.score.total++;
        
        if (correct) {
            this.gameState.score.correct++;
            this.gameState.score.streak++;
        } else {
            this.gameState.score.streak = 0;
        }
    }

    getProgress() {
        return {
            currentRound: this.gameState.currentRound,
            totalRounds: this.gameState.totalRounds,
            percentage: (this.gameState.currentRound / this.gameState.totalRounds) * 100,
            timeElapsed: this.getSessionDuration(),
            score: { ...this.gameState.score }
        };
    }

    getSessionDuration() {
        if (!this.gameState.sessionStartTime) return 0;
        
        const endTime = this.gameState.sessionEndTime || Date.now();
        return endTime - this.gameState.sessionStartTime;
    }

    /* === VISUAL FEEDBACK METHODS === */
    showIntroScreen() {
        // Create or update intro screen
        this.updateGameDisplay('intro', {
            title: this.config.gameTitle,
            instruction: 'Ready to play?',
            showStartButton: true
        });
        
        // Play welcome audio
        if (this.audioSystem && this.audioSystem.isReady()) {
            this.audioSystem.playVoicePrompt('welcome');
        }
    }

    announceRoundStart() {
        const roundNumber = this.gameState.currentRound;
        const isLastRound = roundNumber === this.gameState.totalRounds;
        
        // Visual round indicator
        this.updateGameDisplay('round-start', {
            roundNumber: roundNumber,
            totalRounds: this.gameState.totalRounds,
            isLastRound: isLastRound
        });
        
        // Audio announcement - but keep it brief for toddlers
        if (this.audioSystem && this.audioSystem.isReady()) {
            if (roundNumber === 1) {
                this.audioSystem.playVoicePrompt('lets-play');
            } else if (isLastRound) {
                this.audioSystem.playVoicePrompt('last-one');
            }
        }
    }

    showRoundFeedback(success) {
        if (this.feedbackSystem) {
            const gameContainer = document.querySelector('[data-game-container]');
            
            if (success) {
                this.feedbackSystem.celebrateCorrect(gameContainer, 'normal');
            } else {
                // For kids games, even "incorrect" gets gentle positive reinforcement
                this.feedbackSystem.gentleRedirect(gameContainer, 'try-again');
            }
        }
    }

    showGameComplete() {
        // Big celebration for completing the session
        if (this.feedbackSystem) {
            const gameContainer = document.querySelector('[data-game-container]');
            this.feedbackSystem.bigCelebration(gameContainer);
        }
        
        // Update display to completion screen
        this.updateGameDisplay('complete', {
            score: this.gameState.score,
            sessionDuration: this.getSessionDuration(),
            stickerEarned: this.config.stickerReward
        });
        
        // Play completion audio
        //if (this.audioSystem && this.audioSystem.isReady()) {
           // this.audioSystem.playVoicePrompt('amazing');
            //setTimeout(() => {
                //this.audioSystem.playSound('celebrate');
            //}, 500);
        }
        
        // Transition to reward screen
        setTimeout(() => {
            this.showRewardScreen();
        }, 3000);
    }

    showRewardScreen() {
        this.gameState.phase = 'rewarding';
        
        this.updateGameDisplay('reward', {
            stickerEarned: this.config.stickerReward,
            score: this.gameState.score
        });
        
        if (this.callbacks.onRewardShown) {
            this.callbacks.onRewardShown({
                sticker: this.config.stickerReward,
                performance: this.gameState.score
            });
        }
    }

    /* === DISPLAY MANAGEMENT === */
    updateGameDisplay(displayType, data) {
        const gameContainer = document.querySelector('[data-game-container]');
        if (!gameContainer) return;
        
        // Remove previous display classes
        gameContainer.className = gameContainer.className.replace(/display-\w+/g, '');
        gameContainer.classList.add(`display-${displayType}`);
        
        // Emit display update event for game-specific handling
        const displayEvent = new CustomEvent('gameDisplayUpdate', {
            detail: { type: displayType, data: data }
        });
        gameContainer.dispatchEvent(displayEvent);
    }

    setupGameContainer() {
        let gameContainer = document.querySelector('[data-game-container]');
        
        if (!gameContainer) {
            gameContainer = document.createElement('div');
            gameContainer.setAttribute('data-game-container', '');
            gameContainer.setAttribute('data-game-area', ''); // For touch system
            document.body.appendChild(gameContainer);
        }
        
        // Add basic container styles
        gameContainer.style.cssText = `
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            touch-action: manipulation;
        `;
        
        return gameContainer;
    }

    /* === CALLBACK REGISTRATION === */
    onGameStart(callback) {
        this.callbacks.onGameStart = callback;
    }

    onRoundStart(callback) {
        this.callbacks.onRoundStart = callback;
    }

    onRoundComplete(callback) {
        this.callbacks.onRoundComplete = callback;
    }

    onGameComplete(callback) {
        this.callbacks.onGameComplete = callback;
    }

    onRewardShown(callback) {
        this.callbacks.onRewardShown = callback;
    }

    /* === UTILITY METHODS === */
    createRoundData() {
        return {
            roundNumber: this.gameState.currentRound,
            totalRounds: this.gameState.totalRounds,
            isFirstRound: this.gameState.currentRound === 1,
            isLastRound: this.gameState.currentRound === this.gameState.totalRounds,
            currentScore: { ...this.gameState.score },
            sessionDuration: this.getSessionDuration()
        };
    }

    resetGameState() {
        this.gameState = {
            phase: 'not-started',
            currentRound: 0,
            totalRounds: this.config.roundsPerSession,
            sessionStartTime: null,
            sessionEndTime: null,
            roundStartTime: null,
            score: {
                correct: 0,
                total: 0,
                streak: 0
            }
        };
    }

    /* === STATE QUERIES === */
    isPlaying() {
        return this.gameState.phase === 'playing';
    }

    isCompleted() {
        return this.gameState.phase === 'completed';
    }

    getCurrentRound() {
        return this.gameState.currentRound;
    }

    getGameState() {
        return { ...this.gameState };
    }

    /* === CONFIGURATION UPDATES === */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    }

    setRoundsPerSession(rounds) {
        this.config.roundsPerSession = rounds;
        this.gameState.totalRounds = rounds;
    }

    setStickerReward(sticker) {
        this.config.stickerReward = sticker;
    }
}

/* ===================================================================
   EXPORT FOR MODULE USE
   =================================================================== */
// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameFlowManager;
}

// For global use
if (typeof window !== 'undefined') {
    window.GameFlowManager = GameFlowManager;
}
