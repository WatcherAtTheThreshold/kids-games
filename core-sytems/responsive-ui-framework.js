/* ===================================================================
   KIDS GAMES - RESPONSIVE UI FRAMEWORK
   Mobile-first, high-contrast UI components for toddler games
   =================================================================== */

class ResponsiveUIFramework {
    constructor(options = {}) {
        // === Framework configuration ===
        this.config = {
            breakpoints: {
                phone: 480,
                tablet: 768,
                desktop: 1024
            },
            minTouchTarget: options.minTouchTarget || 80,
            maxContentWidth: options.maxContentWidth || 600,
            colorScheme: options.colorScheme || 'auto', // 'light', 'dark', 'auto', 'high-contrast'
            orientation: options.orientation || 'portrait',
            safeAreaHandling: options.safeAreaHandling !== false
        };
        
        // === Color-safe palettes ===
        this.colorPalettes = {
            primary: {
                red: '#FF6B6B',      // High contrast friendly red
                blue: '#4D96FF',     // Clear, vibrant blue  
                green: '#6BCB77',    // Fresh, readable green
                yellow: '#FFD93D',   // Bright, safe yellow
                purple: '#9B59B6',   // Rich purple
                orange: '#FF8C42'    // Warm orange
            },
            neutral: {
                white: '#FFFFFF',
                light: '#F8F9FA',
                gray: '#6C757D', 
                dark: '#343A40',
                black: '#000000'
            },
            semantic: {
                success: '#28A745',
                warning: '#FFC107', 
                error: '#DC3545',
                info: '#17A2B8'
            },
            backgrounds: {
                sky: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%)',
                sunset: 'linear-gradient(135deg, #FFB347 0%, #FFCCCB 100%)',
                forest: 'linear-gradient(135deg, #90EE90 0%, #E6FFE6 100%)',
                ocean: 'linear-gradient(135deg, #4682B4 0%, #B0E0E6 100%)'
            }
        };
        
        // === Device state ===
        this.deviceInfo = {
            screenWidth: 0,
            screenHeight: 0,
            pixelRatio: 1,
            orientation: 'portrait',
            isPhone: false,
            isTablet: false,
            isDesktop: false,
            safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
        };
        
        this.init();
    }

    /* === INITIALIZATION === */
    init() {
        this.detectDeviceCapabilities();
        this.setupViewport();
        this.injectFrameworkCSS();
        this.setupResponsiveListeners();
        this.applySafeAreaHandling();
        console.log('Responsive UI Framework initialized');
        console.log('Device Info:', this.deviceInfo);
    }

    detectDeviceCapabilities() {
        // Screen dimensions
        this.deviceInfo.screenWidth = window.innerWidth;
        this.deviceInfo.screenHeight = window.innerHeight;
        this.deviceInfo.pixelRatio = window.devicePixelRatio || 1;
        
        // Device type classification
        this.deviceInfo.isPhone = this.deviceInfo.screenWidth <= this.config.breakpoints.phone;
        this.deviceInfo.isTablet = this.deviceInfo.screenWidth > this.config.breakpoints.phone && 
                                    this.deviceInfo.screenWidth <= this.config.breakpoints.tablet;
        this.deviceInfo.isDesktop = this.deviceInfo.screenWidth > this.config.breakpoints.tablet;
        
        // Orientation
        this.deviceInfo.orientation = this.deviceInfo.screenWidth < this.deviceInfo.screenHeight ? 'portrait' : 'landscape';
        
        // Safe area detection (for iPhone notches, etc)
        this.detectSafeArea();
    }

    detectSafeArea() {
        // CSS environment variables for safe area
        const computedStyle = getComputedStyle(document.documentElement);
        
        this.deviceInfo.safeArea = {
            top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
            bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
            left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
            right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0
        };
    }

    setupViewport() {
        // Ensure proper viewport meta tag exists
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        // Optimized viewport for games - prevent zoom, enable hardware acceleration
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        
        // Lock to portrait if configured
        if (this.config.orientation === 'portrait') {
            this.lockOrientation('portrait');
        }
    }

    setupResponsiveListeners() {
        // Window resize handling
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Orientation change handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }

    /* === RESPONSIVE BEHAVIOR === */
    handleResize() {
        this.detectDeviceCapabilities();
        this.updateCSSCustomProperties();
        this.adjustLayoutForDevice();
        
        // Emit resize event for other systems
        const resizeEvent = new CustomEvent('uiFrameworkResize', {
            detail: this.deviceInfo
        });
        document.dispatchEvent(resizeEvent);
    }

    handleOrientationChange() {
        // Force re-detection after orientation change
        setTimeout(() => {
            this.detectDeviceCapabilities();
            this.updateCSSCustomProperties();
            
            // Warn if landscape on phone (games designed for portrait)
            if (this.deviceInfo.isPhone && this.deviceInfo.orientation === 'landscape') {
                this.showOrientationPrompt();
            }
        }, 500);
    }

    lockOrientation(orientation) {
        // Modern browsers
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock(orientation + '-primary').catch(err => {
                console.log('Orientation lock not supported:', err);
            });
        }
        
        // Legacy support
        const lockFn = screen.lockOrientation || 
                      screen.mozLockOrientation || 
                      screen.msLockOrientation;
        
        if (lockFn) {
            lockFn(orientation);
        }
    }

    /* === COMPONENT CREATORS === */
    createGameContainer(gameTitle, options = {}) {
        const container = document.createElement('div');
        container.className = 'ui-game-container';
        container.setAttribute('data-game-container', '');
        container.setAttribute('data-game-area', '');
        
        if (options.background) {
            container.style.background = this.colorPalettes.backgrounds[options.background] || options.background;
        }
        
        if (gameTitle) {
            container.innerHTML = `
                <div class="ui-game-header">
                    <h1 class="ui-game-title">${gameTitle}</h1>
                    <button class="ui-menu-btn" aria-label="Menu">☰</button>
                </div>
                <div class="ui-game-content">
                    <div class="ui-game-playground"></div>
                </div>
                <div class="ui-game-footer">
                    <div class="ui-progress-container"></div>
                </div>
            `;
        }
        
        return container;
    }

    createButton(text, options = {}) {
        const button = document.createElement('button');
        button.className = `ui-button ${options.variant || 'primary'} ${options.size || 'normal'}`;
        
        if (options.icon) {
            button.innerHTML = `
                <span class="ui-button-icon">${options.icon}</span>
                <span class="ui-button-text">${text}</span>
            `;
        } else {
            button.textContent = text;
        }
        
        // Ensure minimum touch target
        this.ensureMinimumTouchTarget(button);
        
        return button;
    }

    createProgressBar(current, total, options = {}) {
        const container = document.createElement('div');
        container.className = 'ui-progress-bar';
        
        const percentage = Math.round((current / total) * 100);
        
        container.innerHTML = `
            <div class="ui-progress-track">
                <div class="ui-progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="ui-progress-text">${current} / ${total}</div>
        `;
        
        return container;
    }

    createCard(content, options = {}) {
        const card = document.createElement('div');
        card.className = `ui-card ${options.variant || 'default'}`;
        
        if (typeof content === 'string') {
            card.innerHTML = content;
        } else {
            card.appendChild(content);
        }
        
        return card;
    }

    createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'ui-modal';
        
        modal.innerHTML = `
            <div class="ui-modal-backdrop"></div>
            <div class="ui-modal-content">
                <div class="ui-modal-header">
                    <h2 class="ui-modal-title">${title}</h2>
                    <button class="ui-modal-close" aria-label="Close">×</button>
                </div>
                <div class="ui-modal-body">
                    ${typeof content === 'string' ? content : ''}
                </div>
                ${options.actions ? `
                    <div class="ui-modal-footer">
                        ${options.actions.map(action => 
                            `<button class="ui-button ${action.variant || 'secondary'}">${action.text}</button>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Setup close functionality
        const closeBtn = modal.querySelector('.ui-modal-close');
        const backdrop = modal.querySelector('.ui-modal-backdrop');
        
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        return modal;
    }

    createIconButton(icon, label, options = {}) {
        const button = document.createElement('button');
        button.className = `ui-icon-button ${options.variant || 'default'}`;
        button.setAttribute('aria-label', label);
        button.innerHTML = `<span class="ui-icon">${icon}</span>`;
        
        this.ensureMinimumTouchTarget(button);
        
        return button;
    }

    /* === LAYOUT HELPERS === */
    createResponsiveGrid(items, options = {}) {
        const grid = document.createElement('div');
        grid.className = 'ui-responsive-grid';
        
        const columns = {
            phone: options.phoneColumns || 2,
            tablet: options.tabletColumns || 3,
            desktop: options.desktopColumns || 4
        };
        
        grid.style.cssText = `
            --grid-phone-columns: ${columns.phone};
            --grid-tablet-columns: ${columns.tablet};
            --grid-desktop-columns: ${columns.desktop};
        `;
        
        items.forEach(item => {
            const gridItem = document.createElement('div');
            gridItem.className = 'ui-grid-item';
            gridItem.appendChild(item);
            grid.appendChild(gridItem);
        });
        
        return grid;
    }

    createCenteredContent(content, options = {}) {
        const container = document.createElement('div');
        container.className = 'ui-centered-content';
        
        if (options.maxWidth) {
            container.style.maxWidth = options.maxWidth + 'px';
        }
        
        if (typeof content === 'string') {
            container.innerHTML = content;
        } else {
            container.appendChild(content);
        }
        
        return container;
    }

    createSafeAreaContainer() {
        const container = document.createElement('div');
        container.className = 'ui-safe-area-container';
        return container;
    }

    /* === UTILITY METHODS === */
    ensureMinimumTouchTarget(element) {
        const computedStyle = window.getComputedStyle(element);
        const currentWidth = parseInt(computedStyle.width) || 0;
        const currentHeight = parseInt(computedStyle.height) || 0;
        
        if (currentWidth < this.config.minTouchTarget || currentHeight < this.config.minTouchTarget) {
            const minSize = this.config.minTouchTarget + 'px';
            element.style.minWidth = minSize;
            element.style.minHeight = minSize;
            
            if (this.config.minTouchTarget > 60) {
                console.log(`Enhanced touch target for toddler accessibility: ${element.tagName}`);
            }
        }
    }

    applySafeAreaHandling() {
        if (!this.config.safeAreaHandling) return;
        
        document.documentElement.style.setProperty('--safe-area-top', this.deviceInfo.safeArea.top + 'px');
        document.documentElement.style.setProperty('--safe-area-bottom', this.deviceInfo.safeArea.bottom + 'px');
        document.documentElement.style.setProperty('--safe-area-left', this.deviceInfo.safeArea.left + 'px');
        document.documentElement.style.setProperty('--safe-area-right', this.deviceInfo.safeArea.right + 'px');
    }

    updateCSSCustomProperties() {
        const root = document.documentElement;
        
        // Device dimensions
        root.style.setProperty('--screen-width', this.deviceInfo.screenWidth + 'px');
        root.style.setProperty('--screen-height', this.deviceInfo.screenHeight + 'px');
        root.style.setProperty('--pixel-ratio', this.deviceInfo.pixelRatio);
        
        // Device type flags
        root.style.setProperty('--is-phone', this.deviceInfo.isPhone ? '1' : '0');
        root.style.setProperty('--is-tablet', this.deviceInfo.isTablet ? '1' : '0');
        root.style.setProperty('--is-desktop', this.deviceInfo.isDesktop ? '1' : '0');
        
        // Touch target sizing
        root.style.setProperty('--min-touch-target', this.config.minTouchTarget + 'px');
        
        // Dynamic font sizing based on screen
        const baseFontSize = this.deviceInfo.isPhone ? 16 : this.deviceInfo.isTablet ? 18 : 20;
        root.style.setProperty('--base-font-size', baseFontSize + 'px');
    }

    adjustLayoutForDevice() {
        document.body.classList.remove('device-phone', 'device-tablet', 'device-desktop');
        
        if (this.deviceInfo.isPhone) {
            document.body.classList.add('device-phone');
        } else if (this.deviceInfo.isTablet) {
            document.body.classList.add('device-tablet');
        } else {
            document.body.classList.add('device-desktop');
        }
        
        document.body.classList.toggle('orientation-landscape', this.deviceInfo.orientation === 'landscape');
        document.body.classList.toggle('orientation-portrait', this.deviceInfo.orientation === 'portrait');
    }

    /* === USER PROMPTS === */
    showOrientationPrompt() {
        // Only show if not already visible
        if (document.querySelector('.ui-orientation-prompt')) return;
        
        const prompt = document.createElement('div');
        prompt.className = 'ui-orientation-prompt';
        prompt.innerHTML = `
            <div class="ui-orientation-content">
                <div class="ui-orientation-icon">📱</div>
                <p>For the best experience, please rotate your device to portrait mode!</p>
                <button class="ui-button primary" onclick="this.parentNode.parentNode.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // Auto-hide when orientation changes to portrait
        const checkOrientation = () => {
            if (this.deviceInfo.orientation === 'portrait') {
                prompt.remove();
            } else {
                setTimeout(checkOrientation, 1000);
            }
        };
        setTimeout(checkOrientation, 1000);
    }

    /* === COLOR THEME MANAGEMENT === */
    setColorScheme(scheme) {
        this.config.colorScheme = scheme;
        document.body.classList.remove('color-scheme-light', 'color-scheme-dark', 'color-scheme-high-contrast');
        
        if (scheme !== 'auto') {
            document.body.classList.add(`color-scheme-${scheme}`);
        }
        
        this.updateColorCustomProperties();
    }

    updateColorCustomProperties() {
        const root = document.documentElement;
        
        // Primary colors
        Object.entries(this.colorPalettes.primary).forEach(([name, color]) => {
            root.style.setProperty(`--color-primary-${name}`, color);
        });
        
        // Neutral colors  
        Object.entries(this.colorPalettes.neutral).forEach(([name, color]) => {
            root.style.setProperty(`--color-neutral-${name}`, color);
        });
        
        // Semantic colors
        Object.entries(this.colorPalettes.semantic).forEach(([name, color]) => {
            root.style.setProperty(`--color-semantic-${name}`, color);
        });
    }

    /* === ACCESSIBILITY HELPERS === */
    enableHighContrastMode() {
        document.body.classList.add('high-contrast-mode');
        this.setColorScheme('high-contrast');
    }

    disableAnimationsForAccessibility() {
        document.body.classList.add('reduce-motion');
    }

    increaseTouchTargets(multiplier = 1.5) {
        this.config.minTouchTarget = Math.round(this.config.minTouchTarget * multiplier);
        this.updateCSSCustomProperties();
        
        // Re-process existing buttons
        document.querySelectorAll('button, .ui-button').forEach(btn => {
            this.ensureMinimumTouchTarget(btn);
        });
    }

    /* === CSS FRAMEWORK INJECTION === */
    injectFrameworkCSS() {
        if (document.getElementById('ui-framework-styles')) return;
        
        const styles = `
            <style id="ui-framework-styles">
                /* === CSS CUSTOM PROPERTIES (UPDATED DYNAMICALLY) === */
                :root {
                    --min-touch-target: ${this.config.minTouchTarget}px;
                    --max-content-width: ${this.config.maxContentWidth}px;
                    --safe-area-top: 0px;
                    --safe-area-bottom: 0px;
                    --safe-area-left: 0px;
                    --safe-area-right: 0px;
                    
                    /* Base colors */
                    --color-primary-red: #FF6B6B;
                    --color-primary-blue: #4D96FF;
                    --color-primary-green: #6BCB77;
                    --color-primary-yellow: #FFD93D;
                    --color-primary-purple: #9B59B6;
                    --color-primary-orange: #FF8C42;
                    
                    --color-neutral-white: #FFFFFF;
                    --color-neutral-light: #F8F9FA;
                    --color-neutral-gray: #6C757D;
                    --color-neutral-dark: #343A40;
                    --color-neutral-black: #000000;
                    
                    /* Spacing scale */
                    --spacing-xs: 4px;
                    --spacing-sm: 8px;
                    --spacing-md: 16px;
                    --spacing-lg: 24px;
                    --spacing-xl: 32px;
                    --spacing-2xl: 48px;
                    
                    /* Typography */
                    --font-size-xs: 12px;
                    --font-size-sm: 14px;
                    --font-size-base: 16px;
                    --font-size-lg: 18px;
                    --font-size-xl: 20px;
                    --font-size-2xl: 24px;
                    --font-size-3xl: 30px;
                    
                    /* Border radius */
                    --radius-sm: 4px;
                    --radius-md: 8px;
                    --radius-lg: 12px;
                    --radius-xl: 16px;
                    --radius-full: 9999px;
                    
                    /* Shadows */
                    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
                    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
                    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
                }
                
                /* === GLOBAL RESET & BASE === */
                * {
                    box-sizing: border-box;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: var(--base-font-size, 16px);
                    line-height: 1.5;
                    color: var(--color-neutral-dark);
                    background: var(--color-neutral-light);
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                /* === SAFE AREA HANDLING === */
                .ui-safe-area-container {
                    padding-top: var(--safe-area-top);
                    padding-bottom: var(--safe-area-bottom);
                    padding-left: var(--safe-area-left);
                    padding-right: var(--safe-area-right);
                }
                
                /* === GAME CONTAINER === */
                .ui-game-container {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    touch-action: manipulation;
                }
                
                .ui-game-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-md);
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    z-index: 100;
                }
                
                .ui-game-title {
                    font-size: var(--font-size-xl);
                    font-weight: bold;
                    color: var(--color-neutral-dark);
                    margin: 0;
                }
                
                .ui-game-content {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }
                
                .ui-game-playground {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                
                .ui-game-footer {
                    padding: var(--spacing-md);
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                }
                
                /* === BUTTONS === */
                .ui-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-md) var(--spacing-lg);
                    min-width: var(--min-touch-target);
                    min-height: var(--min-touch-target);
                    border: none;
                    border-radius: var(--radius-lg);
                    font-size: var(--font-size-base);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }
                
                .ui-button.primary {
                    background: var(--color-primary-blue);
                    color: white;
                }
                
                .ui-button.secondary {
                    background: var(--color-neutral-light);
                    color: var(--color-neutral-dark);
                    border: 2px solid var(--color-neutral-gray);
                }
                
                .ui-button.success {
                    background: var(--color-primary-green);
                    color: white;
                }
                
                .ui-button.large {
                    padding: var(--spacing-lg) var(--spacing-xl);
                    font-size: var(--font-size-lg);
                    min-height: calc(var(--min-touch-target) * 1.2);
                }
                
                .ui-button:active {
                    transform: scale(0.95);
                }
                
                /* === ICON BUTTONS === */
                .ui-icon-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: var(--min-touch-target);
                    height: var(--min-touch-target);
                    border: none;
                    border-radius: var(--radius-full);
                    background: rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                
                .ui-icon-button:active {
                    transform: scale(0.9);
                    background: rgba(0, 0, 0, 0.2);
                }
                
                .ui-icon {
                    font-size: var(--font-size-lg);
                }
                
                /* === PROGRESS BAR === */
                .ui-progress-bar {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }
                
                .ui-progress-track {
                    flex: 1;
                    height: 8px;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                }
                
                .ui-progress-fill {
                    height: 100%;
                    background: var(--color-primary-green);
                    border-radius: var(--radius-full);
                    transition: width 0.3s ease;
                }
                
                .ui-progress-text {
                    font-size: var(--font-size-sm);
                    font-weight: 600;
                    color: var(--color-neutral-gray);
                    white-space: nowrap;
                }
                
                /* === CARDS === */
                .ui-card {
                    background: white;
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    box-shadow: var(--shadow-md);
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }
                
                /* === MODALS === */
                .ui-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-lg);
                }
                
                .ui-modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                }
                
                .ui-modal-content {
                    position: relative;
                    background: white;
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    max-width: 400px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .ui-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                }
                
                .ui-modal-title {
                    font-size: var(--font-size-lg);
                    font-weight: bold;
                    margin: 0;
                }
                
                .ui-modal-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: none;
                    font-size: 24px;
                    cursor: pointer;
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .ui-modal-body {
                    padding: var(--spacing-lg);
                }
                
                .ui-modal-footer {
                    display: flex;
                    gap: var(--spacing-md);
                    padding: var(--spacing-lg);
                    border-top: 1px solid rgba(0, 0, 0, 0.1);
                }
                
                /* === RESPONSIVE GRID === */
                .ui-responsive-grid {
                    display: grid;
                    gap: var(--spacing-md);
                    grid-template-columns: repeat(var(--grid-phone-columns, 2), 1fr);
                }
                
                .ui-grid-item {
                    display: flex;
                    flex-direction: column;
                }
                
                /* === CENTERED CONTENT === */
                .ui-centered-content {
                    max-width: var(--max-content-width);
                    margin: 0 auto;
                    padding: 0 var(--spacing-md);
                }
                
                /* === ORIENTATION PROMPT === */
                .ui-orientation-prompt {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 3000;
                    padding: var(--spacing-lg);
                }
                
                .ui-orientation-content {
                    background: white;
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-2xl);
                    text-align: center;
                    max-width: 300px;
                }
                
                .ui-orientation-icon {
                    font-size: 48px;
                    margin-bottom: var(--spacing-lg);
                }
                
                /* === DEVICE-SPECIFIC BREAKPOINTS === */
                @media (min-width: 481px) {
                    .ui-responsive-grid {
                        grid-template-columns: repeat(var(--grid-tablet-columns, 3), 1fr);
                    }
                }
                
                @media (min-width: 769px) {
                    .ui-responsive-grid {
                        grid-template-columns: repeat(var(--grid-desktop-columns, 4), 1fr);
                    }
                    
                    .ui-game-title {
                        font-size: var(--font-size-2xl);
                    }
                }
                
                /* === HIGH CONTRAST MODE === */
                .high-contrast-mode {
                    --color-neutral-white: #FFFFFF;
                    --color-neutral-black: #000000;
                    --color-primary-blue: #0066CC;
                    --color-primary-green: #009900;
                    --color-primary-red: #CC0000;
                }
                
                .high-contrast-mode .ui-button {
                    border: 2px solid currentColor;
                }
                
                /* === REDUCED MOTION === */
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
                
                .reduce-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
        
        // Initialize CSS custom properties
        this.updateCSSCustomProperties();
        this.updateColorCustomProperties();
        this.adjustLayoutForDevice();
    }

    /* === PUBLIC API === */
    getDeviceInfo() {
        return { ...this.deviceInfo };
    }

    getColorPalette() {
        return { ...this.colorPalettes };
    }

    isPhone() {
        return this.deviceInfo.isPhone;
    }

    isTablet() {
        return this.deviceInfo.isTablet;
    }

    isDesktop() {
        return this.deviceInfo.isDesktop;
    }

    isPortrait() {
        return this.deviceInfo.orientation === 'portrait';
    }

    isLandscape() {
        return this.deviceInfo.orientation === 'landscape';
    }
}

/* ===================================================================
   EXPORT FOR MODULE USE
   =================================================================== */
// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveUIFramework;
}

// For global use
if (typeof window !== 'undefined') {
    window.ResponsiveUIFramework = ResponsiveUIFramework;
}