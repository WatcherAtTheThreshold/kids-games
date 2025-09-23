/* ===================================================================
   KIDS GAMES - FEEDBACK SYSTEM
   Handles positive reinforcement and gentle redirections
   =================================================================== */

class FeedbackSystem {
    constructor(audioSystem) {
        this.audioSystem = audioSystem;
        this.activeAnimations = new Set();
        
        // === Timing constants ===
        this.IMMEDIATE_RESPONSE_MS = 100;
        this.SPARKLE_DURATION_MS = 800;
        this.WOBBLE_DURATION_MS = 600;
        this.CELEBRATION_DURATION_MS = 2000;
        
        // === Animation CSS classes (to be defined in CSS) ===
        this.cssClasses = {
            sparkle: 'feedback-sparkle',
            pop: 'feedback-pop', 
            wobble: 'feedback-wobble',
            bounce: 'feedback-bounce',
            confetti: 'feedback-confetti',
            glow: 'feedback-glow'
        };
        
        this.init();
    }

    /* === INITIALIZATION === */
    init() {
        this.injectFeedbackCSS();
        console.log('Feedback System initialized');
    }

    /* === POSITIVE FEEDBACK === */
    celebrateCorrect(targetElement, intensity = 'normal') {
        // Immediate visual response
        this.addSparkleEffect(targetElement);
        
        // Audio response based on intensity
        const audioPrompts = {
            'gentle': ['great-job'],
            'normal': ['great-job', 'amazing'],
            'big': ['amazing', 'celebrate']
        };
        
        const sounds = audioPrompts[intensity] || audioPrompts['normal'];
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        
        // Play audio immediately
        setTimeout(() => {
            if (this.audioSystem && this.audioSystem.isReady()) {
                this.audioSystem.playVoicePrompt(randomSound);
                this.audioSystem.playSound('pop');
            }
        }, this.IMMEDIATE_RESPONSE_MS);
        
        // Visual celebration
        this.addPopEffect(targetElement);
        
        // Haptic feedback if available
        this.triggerHaptic('light');
        
        return this.SPARKLE_DURATION_MS;
    }

    /* === GENTLE REDIRECTION === */
    gentleRedirect(targetElement, message = 'try-again') {
        // Wobble animation for "not quite" feedback
        this.addWobbleEffect(targetElement);
        
        // Gentle audio cue
        setTimeout(() => {
            if (this.audioSystem && this.audioSystem.isReady()) {
                this.audioSystem.playVoicePrompt(message);
                this.audioSystem.playSound('gentle-no');
            }
        }, this.IMMEDIATE_RESPONSE_MS);
        
        // Very light haptic
        this.triggerHaptic('soft');
        
        return this.WOBBLE_DURATION_MS;
    }

    /* === BIG CELEBRATIONS === */
    bigCelebration(containerElement) {
        // Full screen confetti effect
        this.addConfettiEffect(containerElement);
        
        // Celebration audio sequence
        setTimeout(() => {
            if (this.audioSystem && this.audioSystem.isReady()) {
                //this.audioSystem.playVoicePrompt('amazing');
                //this.audioSystem.playSound('celebrate');
            }
        }, 200);
        
        // Multiple sparkles across screen
        this.scatterSparkles(containerElement);
        
        // Strong haptic
        this.triggerHaptic('medium');
        
        return this.CELEBRATION_DURATION_MS;
    }

    /* === VISUAL EFFECT FUNCTIONS === */
    addSparkleEffect(element) {
        if (!element) return;
        
        const sparkle = this.createEffectElement('sparkle');
        this.positionEffectOnElement(sparkle, element);
        document.body.appendChild(sparkle);
        
        // Auto cleanup
        this.cleanupAfterDelay(sparkle, this.SPARKLE_DURATION_MS);
        this.activeAnimations.add(sparkle);
    }

    addPopEffect(element) {
        if (!element) return;
        
        element.classList.add(this.cssClasses.pop);
        
        // Remove class after animation
        setTimeout(() => {
            element.classList.remove(this.cssClasses.pop);
        }, 300);
    }

    addWobbleEffect(element) {
        if (!element) return;
        
        element.classList.add(this.cssClasses.wobble);
        
        setTimeout(() => {
            element.classList.remove(this.cssClasses.wobble);
        }, this.WOBBLE_DURATION_MS);
    }

    addConfettiEffect(container) {
        const confetti = this.createEffectElement('confetti');
        container.appendChild(confetti);
        
        this.cleanupAfterDelay(confetti, this.CELEBRATION_DURATION_MS);
    }

    /* === UTILITY EFFECT FUNCTIONS === */
    createEffectElement(effectType) {
        const element = document.createElement('div');
        element.className = `feedback-effect ${this.cssClasses[effectType]}`;
        element.setAttribute('data-effect', effectType);
        return element;
    }

    positionEffectOnElement(effectElement, targetElement) {
        const rect = targetElement.getBoundingClientRect();
        effectElement.style.position = 'fixed';
        effectElement.style.left = rect.left + (rect.width / 2) + 'px';
        effectElement.style.top = rect.top + (rect.height / 2) + 'px';
        effectElement.style.pointerEvents = 'none';
        effectElement.style.zIndex = '1000';
    }

    scatterSparkles(container, count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const sparkle = this.createEffectElement('sparkle');
                
                // Random positioning within container
                sparkle.style.position = 'absolute';
                sparkle.style.left = Math.random() * 80 + 10 + '%';
                sparkle.style.top = Math.random() * 80 + 10 + '%';
                sparkle.style.pointerEvents = 'none';
                
                container.appendChild(sparkle);
                this.cleanupAfterDelay(sparkle, this.SPARKLE_DURATION_MS);
            }, i * 200);
        }
    }

    /* === HAPTIC FEEDBACK === */
    triggerHaptic(intensity = 'light') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = {
                'soft': [50],
                'light': [100],
                'medium': [200],
                'strong': [300]
            };
            
            const pattern = patterns[intensity] || patterns['light'];
            navigator.vibrate(pattern);
        }
    }

    /* === CLEANUP & MANAGEMENT === */
    cleanupAfterDelay(element, delay) {
        setTimeout(() => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
                this.activeAnimations.delete(element);
            }
        }, delay);
    }

    clearAllEffects() {
        this.activeAnimations.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.activeAnimations.clear();
    }

    /* === CSS INJECTION === */
    injectFeedbackCSS() {
        // Check if styles already injected
        if (document.getElementById('feedback-system-styles')) return;
        
        const styles = `
            <style id="feedback-system-styles">
                /* === FEEDBACK ANIMATIONS === */
                
                .feedback-sparkle {
                    width: 30px;
                    height: 30px;
                    background: radial-gradient(circle, #FFD700 0%, #FFA500 70%, transparent 100%);
                    border-radius: 50%;
                    animation: sparkle-burst 0.8s ease-out forwards;
                    transform-origin: center;
                }
                
                @keyframes sparkle-burst {
                    0% { transform: scale(0) rotate(0deg); opacity: 1; }
                    50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
                    100% { transform: scale(0.8) rotate(360deg); opacity: 0; }
                }
                
                .feedback-pop {
                    animation: pop-bounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
                }
                
                @keyframes pop-bounce {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1.05); }
                }
                
                .feedback-wobble {
                    animation: gentle-wobble 0.6s ease-in-out;
                }
                
                @keyframes gentle-wobble {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    25% { transform: translateX(-3px) rotate(-2deg); }
                    75% { transform: translateX(3px) rotate(2deg); }
                }
                
                .feedback-confetti {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 30%, #FF6B6B 2px, transparent 3px),
                        radial-gradient(circle at 60% 20%, #4ECDC4 2px, transparent 3px),
                        radial-gradient(circle at 80% 60%, #45B7D1 2px, transparent 3px),
                        radial-gradient(circle at 30% 80%, #96CEB4 2px, transparent 3px),
                        radial-gradient(circle at 70% 40%, #FECA57 2px, transparent 3px);
                    background-size: 50px 50px;
                    animation: confetti-fall 2s ease-out forwards;
                    pointer-events: none;
                }
                
                @keyframes confetti-fall {
                    0% { 
                        transform: translateY(-100vh) rotate(0deg); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(100vh) rotate(360deg); 
                        opacity: 0; 
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
    module.exports = FeedbackSystem;
}

// For global use
if (typeof window !== 'undefined') {
    window.FeedbackSystem = FeedbackSystem;
}
