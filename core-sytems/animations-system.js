/* ===================================================================
   KIDS GAMES - ANIMATION SYSTEM
   Mobile-optimized CSS animations with performance management
   =================================================================== */

class AnimationSystem {
    constructor(options = {}) {
        // === Performance configuration ===
        this.config = {
            maxConcurrentAnimations: options.maxConcurrentAnimations || 8,
            performanceMode: options.performanceMode || 'auto', // 'high', 'balanced', 'low', 'auto'
            enableHardwareAcceleration: options.enableHardwareAcceleration !== false,
            frameRateTarget: options.frameRateTarget || 60,
            animationDuration: {
                fast: 200,
                normal: 400,
                slow: 600,
                celebration: 1200
            }
        };
        
        // === Animation tracking ===
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.performanceStats = {
            frameRate: 60,
            droppedFrames: 0,
            activeCount: 0
        };
        
        // === Built-in animation presets ===
        this.presets = {
            // Basic movements
            'bounce': { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
            'pop': { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            'wobble': { duration: 600, easing: 'ease-in-out' },
            'float': { duration: 2000, easing: 'ease-in-out', infinite: true },
            'shake': { duration: 500, easing: 'ease-in-out' },
            
            // Entrance animations
            'slide-in-up': { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            'slide-in-down': { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            'fade-in': { duration: 300, easing: 'ease-out' },
            'zoom-in': { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            
            // Exit animations
            'slide-out-up': { duration: 300, easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)' },
            'slide-out-down': { duration: 300, easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)' },
            'fade-out': { duration: 250, easing: 'ease-in' },
            'zoom-out': { duration: 250, easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)' },
            
            // Special effects
            'sparkle': { duration: 800, easing: 'ease-out' },
            'confetti': { duration: 2000, easing: 'ease-out' },
            'pulse': { duration: 1000, easing: 'ease-in-out', infinite: true },
            'glow': { duration: 800, easing: 'ease-in-out' }
        };
        
        this.init();
    }

    /* === INITIALIZATION === */
    init() {
        this.detectPerformanceCapabilities();
        this.injectAnimationCSS();
        this.startPerformanceMonitoring();
        console.log(`Animation System initialized - Performance mode: ${this.config.performanceMode}`);
    }

    detectPerformanceCapabilities() {
        if (this.config.performanceMode === 'auto') {
            // Simple device capability detection
            const isHighPerformance = this.checkHighPerformanceDevice();
            this.config.performanceMode = isHighPerformance ? 'high' : 'balanced';
            
            // Adjust concurrent animation limits based on capability
            if (!isHighPerformance) {
                this.config.maxConcurrentAnimations = Math.min(this.config.maxConcurrentAnimations, 6);
            }
        }
    }

    checkHighPerformanceDevice() {
        // Basic performance indicators
        const hasHardwareAcceleration = 'transform' in document.body.style;
        const hasHighMemory = navigator.deviceMemory ? navigator.deviceMemory >= 4 : true;
        const hasModernBrowser = 'requestAnimationFrame' in window;
        
        return hasHardwareAcceleration && hasHighMemory && hasModernBrowser;
    }

    /* === ANIMATION EXECUTION === */
    animate(element, animationType, options = {}) {
        if (!element || !animationType) {
            console.warn('Animation requires element and type');
            return null;
        }
        
        // Check performance limits
        if (this.activeAnimations.size >= this.config.maxConcurrentAnimations) {
            if (options.priority === 'high') {
                this.cancelOldestAnimation();
            } else {
                this.queueAnimation(element, animationType, options);
                return null;
            }
        }
        
        const animationId = this.generateAnimationId();
        const animationConfig = this.createAnimationConfig(animationType, options);
        
        // Apply animation
        this.applyAnimation(element, animationConfig, animationId);
        
        // Track animation
        this.trackAnimation(animationId, element, animationConfig);
        
        return animationId;
    }

    createAnimationConfig(animationType, options) {
        const preset = this.presets[animationType] || {};
        
        return {
            type: animationType,
            duration: options.duration || preset.duration || this.config.animationDuration.normal,
            easing: options.easing || preset.easing || 'ease-out',
            delay: options.delay || 0,
            infinite: options.infinite || preset.infinite || false,
            direction: options.direction || 'normal',
            fillMode: options.fillMode || 'forwards',
            callback: options.callback || null,
            cleanup: options.cleanup !== false
        };
    }

    applyAnimation(element, config, animationId) {
        // Add animation class with hardware acceleration
        element.classList.add('animated', `anim-${config.type}`);
        
        if (this.config.enableHardwareAcceleration) {
            element.style.willChange = 'transform, opacity';
            element.style.transform = element.style.transform || 'translateZ(0)';
        }
        
        // Apply custom animation properties
        element.style.animationDuration = config.duration + 'ms';
        element.style.animationTimingFunction = config.easing;
        element.style.animationDelay = config.delay + 'ms';
        element.style.animationFillMode = config.fillMode;
        element.style.animationDirection = config.direction;
        
        if (config.infinite) {
            element.style.animationIterationCount = 'infinite';
        }
        
        // Set completion handler
        this.setAnimationCompleteHandler(element, config, animationId);
    }

    setAnimationCompleteHandler(element, config, animationId) {
        const handleComplete = () => {
            // Execute callback
            if (config.callback) {
                config.callback();
            }
            
            // Cleanup if enabled
            if (config.cleanup) {
                this.cleanupAnimation(element, animationId);
            }
            
            // Remove event listener
            element.removeEventListener('animationend', handleComplete);
            
            // Update tracking
            this.stopTracking(animationId);
            
            // Process queued animations
            this.processAnimationQueue();
        };
        
        element.addEventListener('animationend', handleComplete);
        
        // Handle infinite animations differently (no auto-cleanup)
        if (!config.infinite && config.duration > 0) {
            // Fallback timeout in case animationend doesn't fire
            setTimeout(() => {
                if (this.activeAnimations.has(animationId)) {
                    handleComplete();
                }
            }, config.duration + config.delay + 100);
        }
    }

    /* === ANIMATION SEQUENCES === */
    animateSequence(elements, animationType, options = {}) {
        if (!Array.isArray(elements)) elements = [elements];
        
        const sequenceDelay = options.stagger || 150;
        const animationIds = [];
        
        elements.forEach((element, index) => {
            const delayedOptions = {
                ...options,
                delay: (options.delay || 0) + (index * sequenceDelay)
            };
            
            const animationId = this.animate(element, animationType, delayedOptions);
            if (animationId) {
                animationIds.push(animationId);
            }
        });
        
        return animationIds;
    }

    animateChain(animationChain) {
        // Execute animations one after another
        let currentIndex = 0;
        
        const executeNext = () => {
            if (currentIndex >= animationChain.length) return;
            
            const animation = animationChain[currentIndex];
            const originalCallback = animation.options?.callback;
            
            animation.options = animation.options || {};
            animation.options.callback = () => {
                if (originalCallback) originalCallback();
                currentIndex++;
                executeNext();
            };
            
            this.animate(animation.element, animation.type, animation.options);
        };
        
        executeNext();
    }

    /* === SPECIALIZED ANIMATION HELPERS === */
    bounce(element, options = {}) {
        return this.animate(element, 'bounce', {
            duration: 400,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            ...options
        });
    }

    pop(element, options = {}) {
        return this.animate(element, 'pop', {
            duration: 300,
            ...options
        });
    }

    wobble(element, options = {}) {
        return this.animate(element, 'wobble', {
            duration: 600,
            ...options
        });
    }

    float(element, options = {}) {
        return this.animate(element, 'float', {
            infinite: true,
            duration: 2000,
            ...options
        });
    }

    sparkle(element, options = {}) {
        return this.animate(element, 'sparkle', {
            duration: 800,
            cleanup: true,
            ...options
        });
    }

    slideIn(element, direction = 'up', options = {}) {
        return this.animate(element, `slide-in-${direction}`, {
            duration: 400,
            ...options
        });
    }

    slideOut(element, direction = 'up', options = {}) {
        return this.animate(element, `slide-out-${direction}`, {
            duration: 300,
            ...options
        });
    }

    fadeIn(element, options = {}) {
        return this.animate(element, 'fade-in', {
            duration: 300,
            ...options
        });
    }

    fadeOut(element, options = {}) {
        return this.animate(element, 'fade-out', {
            duration: 250,
            ...options
        });
    }

    /* === QUEUE MANAGEMENT === */
    queueAnimation(element, animationType, options) {
        this.animationQueue.push({
            element: element,
            type: animationType,
            options: options,
            priority: options.priority || 'normal',
            queuedAt: Date.now()
        });
        
        // Sort queue by priority
        this.animationQueue.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    processAnimationQueue() {
        while (this.animationQueue.length > 0 && this.activeAnimations.size < this.config.maxConcurrentAnimations) {
            const queuedAnimation = this.animationQueue.shift();
            this.animate(queuedAnimation.element, queuedAnimation.type, queuedAnimation.options);
        }
    }

    /* === ANIMATION CONTROL === */
    pause(animationId) {
        const animationData = this.activeAnimations.get(animationId);
        if (animationData) {
            animationData.element.style.animationPlayState = 'paused';
        }
    }

    resume(animationId) {
        const animationData = this.activeAnimations.get(animationId);
        if (animationData) {
            animationData.element.style.animationPlayState = 'running';
        }
    }

    cancel(animationId) {
        const animationData = this.activeAnimations.get(animationId);
        if (animationData) {
            this.cleanupAnimation(animationData.element, animationId);
            this.stopTracking(animationId);
        }
    }

    cancelAll() {
        const animationIds = Array.from(this.activeAnimations.keys());
        animationIds.forEach(id => this.cancel(id));
        this.animationQueue = [];
    }

    cancelOldestAnimation() {
        if (this.activeAnimations.size > 0) {
            const oldestId = this.activeAnimations.keys().next().value;
            this.cancel(oldestId);
        }
    }

    /* === CLEANUP & TRACKING === */
    trackAnimation(animationId, element, config) {
        this.activeAnimations.set(animationId, {
            id: animationId,
            element: element,
            config: config,
            startTime: Date.now()
        });
        
        this.performanceStats.activeCount = this.activeAnimations.size;
    }

    stopTracking(animationId) {
        this.activeAnimations.delete(animationId);
        this.performanceStats.activeCount = this.activeAnimations.size;
    }

    cleanupAnimation(element, animationId) {
        // Remove animation classes
        element.classList.remove('animated');
        element.className = element.className.replace(/anim-[\w-]+/g, '');
        
        // Clear inline animation styles
        element.style.animationDuration = '';
        element.style.animationTimingFunction = '';
        element.style.animationDelay = '';
        element.style.animationFillMode = '';
        element.style.animationDirection = '';
        element.style.animationIterationCount = '';
        element.style.animationPlayState = '';
        
        // Clear hardware acceleration hint
        if (this.config.enableHardwareAcceleration) {
            element.style.willChange = '';
        }
    }

    /* === PERFORMANCE MONITORING === */
    startPerformanceMonitoring() {
        if (typeof window === 'undefined' || !window.requestAnimationFrame) return;
        
        let frameCount = 0;
        let lastTime = Date.now();
        
        const measureFrameRate = () => {
            frameCount++;
            const currentTime = Date.now();
            
            if (currentTime - lastTime >= 1000) {
                this.performanceStats.frameRate = frameCount;
                
                // Adjust performance if frame rate drops
                if (frameCount < 50 && this.config.performanceMode === 'high') {
                    this.degradePerformance();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFrameRate);
        };
        
        requestAnimationFrame(measureFrameRate);
    }

    degradePerformance() {
        console.warn('Frame rate below 50fps, reducing animation complexity');
        this.config.performanceMode = 'balanced';
        this.config.maxConcurrentAnimations = Math.max(this.config.maxConcurrentAnimations - 2, 4);
    }

    /* === UTILITY METHODS === */
    generateAnimationId() {
        return 'anim_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    getPerformanceStats() {
        return {
            ...this.performanceStats,
            queueLength: this.animationQueue.length,
            performanceMode: this.config.performanceMode
        };
    }

    isAnimating(element) {
        for (const [id, data] of this.activeAnimations) {
            if (data.element === element) {
                return id;
            }
        }
        return false;
    }

    /* === CSS INJECTION === */
    injectAnimationCSS() {
        if (document.getElementById('animation-system-styles')) return;
        
        const styles = `
            <style id="animation-system-styles">
                /* === BASE ANIMATION CLASS === */
                .animated {
                    animation-fill-mode: both;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                
                /* === HARDWARE ACCELERATION === */
                .animated {
                    will-change: transform, opacity;
                    transform: translateZ(0);
                }
                
                /* === BOUNCE ANIMATIONS === */
                @keyframes anim-bounce {
                    0%, 20%, 53%, 80%, 100% {
                        animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
                        transform: translate3d(0, 0, 0);
                    }
                    40%, 43% {
                        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
                        transform: translate3d(0, -30px, 0);
                    }
                    70% {
                        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
                        transform: translate3d(0, -15px, 0);
                    }
                    90% {
                        transform: translate3d(0, -4px, 0);
                    }
                }
                
                /* === POP ANIMATION === */
                @keyframes anim-pop {
                    0% { transform: scale3d(1, 1, 1); }
                    50% { transform: scale3d(1.15, 1.15, 1); }
                    100% { transform: scale3d(1.05, 1.05, 1); }
                }
                
                /* === WOBBLE ANIMATION === */
                @keyframes anim-wobble {
                    0% { transform: translate3d(0, 0, 0) rotate3d(0, 0, 1, 0deg); }
                    15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); }
                    30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); }
                    45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); }
                    60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); }
                    75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); }
                    100% { transform: translate3d(0, 0, 0) rotate3d(0, 0, 1, 0deg); }
                }
                
                /* === FLOAT ANIMATION === */
                @keyframes anim-float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                
                /* === SHAKE ANIMATION === */
                @keyframes anim-shake {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); }
                    20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); }
                }
                
                /* === SLIDE ANIMATIONS === */
                @keyframes anim-slide-in-up {
                    0% {
                        transform: translate3d(0, 100%, 0);
                        visibility: visible;
                        opacity: 0;
                    }
                    100% {
                        transform: translate3d(0, 0, 0);
                        opacity: 1;
                    }
                }
                
                @keyframes anim-slide-in-down {
                    0% {
                        transform: translate3d(0, -100%, 0);
                        visibility: visible;
                        opacity: 0;
                    }
                    100% {
                        transform: translate3d(0, 0, 0);
                        opacity: 1;
                    }
                }
                
                @keyframes anim-slide-out-up {
                    0% {
                        transform: translate3d(0, 0, 0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate3d(0, -100%, 0);
                        opacity: 0;
                    }
                }
                
                @keyframes anim-slide-out-down {
                    0% {
                        transform: translate3d(0, 0, 0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate3d(0, 100%, 0);
                        opacity: 0;
                    }
                }
                
                /* === FADE ANIMATIONS === */
                @keyframes anim-fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                
                @keyframes anim-fade-out {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
                
                /* === ZOOM ANIMATIONS === */
                @keyframes anim-zoom-in {
                    0% {
                        opacity: 0;
                        transform: scale3d(0.3, 0.3, 0.3);
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: scale3d(1, 1, 1);
                    }
                }
                
                @keyframes anim-zoom-out {
                    0% {
                        opacity: 1;
                        transform: scale3d(1, 1, 1);
                    }
                    50% {
                        opacity: 0;
                        transform: scale3d(0.3, 0.3, 0.3);
                    }
                    100% {
                        opacity: 0;
                    }
                }
                
                /* === SPECIAL EFFECTS === */
                @keyframes anim-sparkle {
                    0% { 
                        transform: scale(0) rotate(0deg); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: scale(1.2) rotate(180deg); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: scale(0.8) rotate(360deg); 
                        opacity: 0; 
                    }
                }
                
                @keyframes anim-pulse {
                    0% { transform: scale3d(1, 1, 1); }
                    50% { transform: scale3d(1.05, 1.05, 1); }
                    100% { transform: scale3d(1, 1, 1); }
                }
                
                @keyframes anim-glow {
                    0% { 
                        filter: brightness(1) drop-shadow(0 0 0px rgba(255, 255, 255, 0));
                    }
                    50% { 
                        filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
                    }
                    100% { 
                        filter: brightness(1) drop-shadow(0 0 0px rgba(255, 255, 255, 0));
                    }
                }
                
                /* === PERFORMANCE OPTIMIZATIONS === */
                @media (prefers-reduced-motion: reduce) {
                    .animated {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
                
                /* === LOW PERFORMANCE MODE === */
                .performance-mode-low .animated {
                    animation-duration: 0.2s !important;
                    will-change: auto !important;
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
    module.exports = AnimationSystem;
}

// For global use
if (typeof window !== 'undefined') {
    window.AnimationSystem = AnimationSystem;
}