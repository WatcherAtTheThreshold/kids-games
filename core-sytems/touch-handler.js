/* ===================================================================
   KIDS GAMES - TOUCH & INPUT HANDLING SYSTEM
   Toddler-friendly touch interactions with forgiving hitboxes
   =================================================================== */

class TouchSystem {
    constructor(feedbackSystem = null) {
        this.feedbackSystem = feedbackSystem;
        this.touchTargets = new Map();
        this.isEnabled = true;
        this.debugMode = false;
        
        // === Touch configuration ===
        this.config = {
            minTargetSize: 80,        // Minimum 80px touch targets
            forgivenessPadding: 20,   // Extra 20px around targets for near-misses
            doubleTapWindow: 300,     // 300ms window to prevent double-taps
            holdThreshold: 500,       // 500ms for long press detection
            dragThreshold: 10         // 10px movement before considering drag
        };
        
        // === Touch state tracking ===
        this.touchState = {
            lastTapTime: 0,
            lastTapTarget: null,
            isHolding: false,
            isDragging: false,
            startPosition: { x: 0, y: 0 },
            currentTouch: null
        };
        
        this.init();
    }

    /* === INITIALIZATION === */
    init() {
        this.setupEventListeners();
        this.injectDebugCSS();
        console.log('Touch System initialized');
    }

    /* === EVENT LISTENER SETUP === */
    setupEventListeners() {
        // Prevent default touch behaviors that interfere with games
        document.addEventListener('touchstart', this.preventDefaultTouch.bind(this), { passive: false });
        document.addEventListener('touchmove', this.preventDefaultTouch.bind(this), { passive: false });
        
        // Main touch event handlers
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        
        // Mouse events for desktop testing
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /* === TOUCH TARGET REGISTRATION === */
    registerTouchTarget(element, options = {}) {
        if (!element) return null;
        
        const targetId = this.generateTargetId();
        const targetConfig = {
            element: element,
            callback: options.callback || (() => {}),
            hitboxPadding: options.hitboxPadding || this.config.forgivenessPadding,
            minSize: options.minSize || this.config.minTargetSize,
            allowDoubleTap: options.allowDoubleTap || false,
            dragEnabled: options.dragEnabled || false,
            holdEnabled: options.holdEnabled || false,
            data: options.data || {}
        };
        
        this.touchTargets.set(targetId, targetConfig);
        element.setAttribute('data-touch-id', targetId);
        
        // Ensure minimum target size
        this.ensureMinimumTargetSize(element, targetConfig.minSize);
        
        // Visual debug indicator
        if (this.debugMode) {
            this.addDebugIndicator(element, targetConfig);
        }
        
        return targetId;
    }

    /* === TOUCH TARGET MANAGEMENT === */
    unregisterTouchTarget(targetId) {
        const config = this.touchTargets.get(targetId);
        if (config) {
            config.element.removeAttribute('data-touch-id');
            this.touchTargets.delete(targetId);
        }
    }

    updateTouchTarget(targetId, newOptions) {
        const config = this.touchTargets.get(targetId);
        if (config) {
            Object.assign(config, newOptions);
        }
    }

    /* === TOUCH EVENT HANDLING === */
    handleTouchStart(event) {
        if (!this.isEnabled) return;
        
        const touch = event.touches[0];
        this.touchState.currentTouch = touch;
        this.touchState.startPosition = { x: touch.clientX, y: touch.clientY };
        this.touchState.isDragging = false;
        
        const target = this.findTouchTarget(touch.clientX, touch.clientY);
        if (target) {
            this.handleTargetTouchStart(target, touch, event);
        }
    }

    handleTouchEnd(event) {
        if (!this.isEnabled) return;
        
        const touch = event.changedTouches[0];
        const target = this.findTouchTarget(touch.clientX, touch.clientY);
        
        if (target && !this.touchState.isDragging) {
            this.handleTargetTap(target, touch, event);
        }
        
        this.resetTouchState();
    }

    handleTouchMove(event) {
        if (!this.isEnabled || !this.touchState.currentTouch) return;
        
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchState.startPosition.x);
        const deltaY = Math.abs(touch.clientY - this.touchState.startPosition.y);
        
        // Check if movement exceeds drag threshold
        if (deltaX > this.config.dragThreshold || deltaY > this.config.dragThreshold) {
            this.touchState.isDragging = true;
            
            const target = this.findTouchTarget(touch.clientX, touch.clientY);
            if (target && target.dragEnabled) {
                this.handleTargetDrag(target, touch, event);
            }
        }
    }

    /* === TARGET INTERACTION HANDLERS === */
    handleTargetTouchStart(target, touch, event) {
        // Visual feedback for touch start
        if (this.feedbackSystem) {
            target.element.classList.add('touch-active');
        }
        
        // Handle long press detection
        if (target.holdEnabled) {
            setTimeout(() => {
                if (!this.touchState.isDragging && this.touchState.currentTouch) {
                    this.handleTargetHold(target, touch, event);
                }
            }, this.config.holdThreshold);
        }
    }

    handleTargetTap(target, touch, event) {
        // Double-tap prevention
        if (!target.allowDoubleTap && this.isDoubleTap(target)) {
            return;
        }
        
        // Visual feedback cleanup
        target.element.classList.remove('touch-active');
        
        // Execute callback with enriched data
        const touchData = {
            element: target.element,
            position: { x: touch.clientX, y: touch.clientY },
            targetData: target.data,
            timestamp: Date.now(),
            event: event
        };
        
        // Provide immediate haptic feedback through feedback system
        if (this.feedbackSystem) {
            this.feedbackSystem.triggerHaptic('light');
        }
        
        // Execute the registered callback
        target.callback(touchData);
        
        // Update double-tap tracking
        this.touchState.lastTapTime = Date.now();
        this.touchState.lastTapTarget = target;
    }

    handleTargetDrag(target, touch, event) {
        const dragData = {
            element: target.element,
            startPosition: this.touchState.startPosition,
            currentPosition: { x: touch.clientX, y: touch.clientY },
            deltaX: touch.clientX - this.touchState.startPosition.x,
            deltaY: touch.clientY - this.touchState.startPosition.y,
            targetData: target.data,
            event: event
        };
        
        if (target.onDrag) {
            target.onDrag(dragData);
        }
    }

    handleTargetHold(target, touch, event) {
        const holdData = {
            element: target.element,
            position: { x: touch.clientX, y: touch.clientY },
            targetData: target.data,
            duration: this.config.holdThreshold,
            event: event
        };
        
        if (target.onHold) {
            target.onHold(holdData);
        }
    }

    /* === TOUCH TARGET DETECTION === */
    findTouchTarget(x, y) {
        for (const [targetId, config] of this.touchTargets) {
            if (this.isPointInTarget(x, y, config)) {
                return config;
            }
        }
        return null;
    }

    isPointInTarget(x, y, targetConfig) {
        const rect = targetConfig.element.getBoundingClientRect();
        const padding = targetConfig.hitboxPadding;
        
        return (
            x >= rect.left - padding &&
            x <= rect.right + padding &&
            y >= rect.top - padding &&
            y <= rect.bottom + padding
        );
    }

    /* === UTILITY FUNCTIONS === */
    isDoubleTap(target) {
        const timeSinceLastTap = Date.now() - this.touchState.lastTapTime;
        return (
            timeSinceLastTap < this.config.doubleTapWindow &&
            this.touchState.lastTapTarget === target
        );
    }

    resetTouchState() {
        this.touchState.currentTouch = null;
        this.touchState.isDragging = false;
        this.touchState.isHolding = false;
        
        // Remove visual feedback from all targets
        this.touchTargets.forEach(config => {
            config.element.classList.remove('touch-active');
        });
    }

    ensureMinimumTargetSize(element, minSize) {
        const computedStyle = window.getComputedStyle(element);
        const currentWidth = parseInt(computedStyle.width);
        const currentHeight = parseInt(computedStyle.height);
        
        if (currentWidth < minSize || currentHeight < minSize) {
            console.warn(`Touch target smaller than ${minSize}px:`, element);
        }
    }

    generateTargetId() {
        return 'touch_' + Math.random().toString(36).substr(2, 9);
    }

    /* === MOUSE EVENT HANDLERS (FOR DESKTOP TESTING) === */
    handleMouseDown(event) {
        // Simulate touch start for desktop testing
        const fakeTouch = { clientX: event.clientX, clientY: event.clientY };
        this.touchState.currentTouch = fakeTouch;
        this.touchState.startPosition = { x: event.clientX, y: event.clientY };
        
        const target = this.findTouchTarget(event.clientX, event.clientY);
        if (target) {
            this.handleTargetTouchStart(target, fakeTouch, event);
        }
    }

    handleMouseUp(event) {
        if (!this.touchState.currentTouch) return;
        
        const fakeTouch = { clientX: event.clientX, clientY: event.clientY };
        const target = this.findTouchTarget(event.clientX, event.clientY);
        
        if (target && !this.touchState.isDragging) {
            this.handleTargetTap(target, fakeTouch, event);
        }
        
        this.resetTouchState();
    }

    handleMouseMove(event) {
        if (!this.touchState.currentTouch) return;
        
        const deltaX = Math.abs(event.clientX - this.touchState.startPosition.x);
        const deltaY = Math.abs(event.clientY - this.touchState.startPosition.y);
        
        if (deltaX > this.config.dragThreshold || deltaY > this.config.dragThreshold) {
            this.touchState.isDragging = true;
        }
    }

    /* === TOUCH BEHAVIOR PREVENTION === */
    preventDefaultTouch(event) {
        // Prevent scrolling, zooming, and other default touch behaviors
        if (event.touches && event.touches.length > 1) {
            event.preventDefault(); // Prevent pinch zoom
        }
        
        // Allow single finger scrolling outside game areas
        const gameArea = event.target.closest('[data-game-area]');
        if (gameArea) {
            event.preventDefault();
        }
    }

    /* === DEBUG TOOLS === */
    enableDebugMode() {
        this.debugMode = true;
        this.touchTargets.forEach(config => {
            this.addDebugIndicator(config.element, config);
        });
    }

    disableDebugMode() {
        this.debugMode = false;
        document.querySelectorAll('.touch-debug-indicator').forEach(el => el.remove());
    }

    addDebugIndicator(element, config) {
        const indicator = document.createElement('div');
        indicator.className = 'touch-debug-indicator';
        indicator.style.cssText = `
            position: absolute;
            border: 2px dashed red;
            pointer-events: none;
            z-index: 9999;
        `;
        
        const rect = element.getBoundingClientRect();
        const padding = config.hitboxPadding;
        
        indicator.style.left = (rect.left - padding) + 'px';
        indicator.style.top = (rect.top - padding) + 'px';
        indicator.style.width = (rect.width + padding * 2) + 'px';
        indicator.style.height = (rect.height + padding * 2) + 'px';
        
        document.body.appendChild(indicator);
    }

    /* === CSS INJECTION === */
    injectDebugCSS() {
        if (document.getElementById('touch-system-styles')) return;
        
        const styles = `
            <style id="touch-system-styles">
                /* === TOUCH FEEDBACK STYLES === */
                
                .touch-active {
                    transform: scale(0.95);
                    opacity: 0.8;
                    transition: transform 0.1s ease, opacity 0.1s ease;
                }
                
                .touch-debug-indicator {
                    animation: debug-pulse 1s ease-in-out infinite;
                }
                
                @keyframes debug-pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /* === CONTROL METHODS === */
    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.resetTouchState();
    }

    clearAllTargets() {
        this.touchTargets.clear();
        this.resetTouchState();
    }
}

/* ===================================================================
   EXPORT FOR MODULE USE
   =================================================================== */
// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchSystem;
}

// For global use
if (typeof window !== 'undefined') {
    window.TouchSystem = TouchSystem;
}