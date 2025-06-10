// PWA Installation Manager - Mobile-first Progressive Web App support
// Handles installation prompts, updates, and mobile optimization

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.updateAvailable = false;
        this.serviceWorkerRegistration = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 PWA Manager: Initializing...');
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup installation handlers
        this.setupInstallationHandlers();
        
        // Setup update handlers
        this.setupUpdateHandlers();
        
        // Setup mobile UI enhancements
        this.setupMobileUI();
        
        // Check if already installed
        this.checkInstallationStatus();
        
        console.log('✅ PWA Manager: Initialization complete');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered successfully');
                
                // Listen for service worker updates
                this.serviceWorkerRegistration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate();
                });
                
                return this.serviceWorkerRegistration;
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
                return null;
            }
        } else {
            console.warn('⚠️ Service Workers not supported');
            return null;
        }
    }

    setupInstallationHandlers() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA: Install prompt available');
            
            // Prevent default mini-infobar
            e.preventDefault();
            
            // Store the event for later use
            this.deferredPrompt = e;
            
            // Show custom install button
            this.showInstallButton();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('🎉 PWA: App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccessMessage();
        });
    }

    setupUpdateHandlers() {
        // Listen for service worker controller change
        navigator.serviceWorker?.addEventListener('controllerchange', () => {
            console.log('🔄 PWA: App updated, reloading...');
            window.location.reload();
        });

        // Check for updates every 30 minutes
        setInterval(() => {
            this.checkForUpdates();
        }, 30 * 60 * 1000);
    }

    setupMobileUI() {
        // Add iOS status bar styling
        this.addIOSStatusBarStyling();
        
        // Add viewport meta for proper mobile scaling
        this.ensureViewportMeta();
        
        // Add touch-friendly CSS classes
        this.addTouchOptimizations();
        
        // Setup gesture handling
        this.setupGestureHandling();
        
        // Add mobile-specific CSS
        this.addMobileCSS();
    }

    showInstallButton() {
        // Check if install button already exists
        let installButton = document.getElementById('pwa-install-button');
        
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'pwa-install-button';
            installButton.className = 'pwa-install-btn';
            installButton.innerHTML = `
                <i class="fas fa-download"></i>
                <span>Install App</span>
            `;
            
            // Position the button
            installButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                background: linear-gradient(45deg, #00D4FF, #7B2CBF);
                border: none;
                color: white;
                padding: 12px 20px;
                border-radius: 50px;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            `;
            
            // Add click handler
            installButton.addEventListener('click', () => this.promptInstall());
            
            // Add to page
            document.body.appendChild(installButton);
        }
        
        installButton.style.display = 'flex';
    }

    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.warn('⚠️ PWA: No install prompt available');
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for user choice
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`👤 PWA: User choice: ${outcome}`);
        
        if (outcome === 'accepted') {
            this.hideInstallButton();
        }
        
        // Clear the prompt
        this.deferredPrompt = null;
    }

    showInstallSuccessMessage() {
        this.showNotification(
            '🎉 App Installed Successfully!',
            'OrphiChain is now available on your home screen',
            'success',
            5000
        );
    }

    checkInstallationStatus() {
        // Check if running in standalone mode (installed PWA)
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('📱 PWA: Running in installed mode');
            
            // Add installed class to body
            document.body.classList.add('pwa-installed');
            
            // Hide install button if visible
            this.hideInstallButton();
        }
    }

    async checkForUpdates() {
        if (!this.serviceWorkerRegistration) return;
        
        try {
            await this.serviceWorkerRegistration.update();
            console.log('🔍 PWA: Checked for updates');
        } catch (error) {
            console.error('❌ PWA: Update check failed:', error);
        }
    }

    handleServiceWorkerUpdate() {
        const installingWorker = this.serviceWorkerRegistration.installing;
        
        if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🆕 PWA: Update available');
                    this.updateAvailable = true;
                    this.showUpdateNotification();
                }
            });
        }
    }

    showUpdateNotification() {
        const updateBanner = document.createElement('div');
        updateBanner.id = 'pwa-update-banner';
        updateBanner.className = 'pwa-update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <div class="update-text">
                    <strong>🆕 Update Available</strong>
                    <p>A new version of OrphiChain is ready</p>
                </div>
                <div class="update-actions">
                    <button onclick="pwaManager.dismissUpdate()" class="btn-dismiss">Later</button>
                    <button onclick="pwaManager.applyUpdate()" class="btn-update">Update Now</button>
                </div>
            </div>
        `;
        
        updateBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10000;
            background: linear-gradient(45deg, #00D4FF, #7B2CBF);
            color: white;
            padding: 15px;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(updateBanner);
        
        // Animate in
        setTimeout(() => {
            updateBanner.style.transform = 'translateY(0)';
        }, 100);
    }

    dismissUpdate() {
        const banner = document.getElementById('pwa-update-banner');
        if (banner) {
            banner.style.transform = 'translateY(-100%)';
            setTimeout(() => banner.remove(), 300);
        }
    }

    async applyUpdate() {
        if (this.serviceWorkerRegistration?.waiting) {
            // Tell the waiting service worker to skip waiting
            this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Reload the page
        window.location.reload();
    }

    addIOSStatusBarStyling() {
        // Add iOS status bar meta tags if not present
        const metas = [
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'apple-mobile-web-app-title', content: 'OrphiChain' }
        ];
        
        metas.forEach(meta => {
            if (!document.querySelector(`meta[name="${meta.name}"]`)) {
                const metaTag = document.createElement('meta');
                metaTag.name = meta.name;
                metaTag.content = meta.content;
                document.head.appendChild(metaTag);
            }
        });
    }

    ensureViewportMeta() {
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            document.head.appendChild(viewport);
        }
    }

    addTouchOptimizations() {
        // Add touch-friendly CSS
        const style = document.createElement('style');
        style.textContent = `
            /* Touch optimizations */
            .touch-target {
                min-height: 44px;
                min-width: 44px;
            }
            
            button, .btn, .clickable {
                min-height: 44px;
                padding: 12px 16px;
                touch-action: manipulation;
            }
            
            /* iOS safe area support */
            .safe-area-inset-top { padding-top: env(safe-area-inset-top); }
            .safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
            .safe-area-inset-left { padding-left: env(safe-area-inset-left); }
            .safe-area-inset-right { padding-right: env(safe-area-inset-right); }
            
            /* Prevent zoom on input focus (iOS) */
            input, select, textarea {
                font-size: 16px;
            }
            
            /* Hide system UI on scroll */
            body.pwa-installed {
                -webkit-overflow-scrolling: touch;
                overflow-x: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    setupGestureHandling() {
        // Add swipe gesture support
        let startX, startY, startTime;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = Date.now() - startTime;
            
            // Check for swipe gesture
            if (Math.abs(deltaX) > 100 && deltaTime < 300) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
            
            startX = startY = null;
        }, { passive: true });
    }

    handleSwipeRight() {
        // Custom swipe right logic
        console.log('👆 PWA: Swipe right detected');
        
        // Example: Navigate back if possible
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    handleSwipeLeft() {
        // Custom swipe left logic
        console.log('👆 PWA: Swipe left detected');
    }

    addMobileCSS() {
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
            /* PWA Mobile Styles */
            @media (max-width: 768px) {
                .pwa-mobile-optimized {
                    font-size: 16px;
                    line-height: 1.4;
                }
                
                .pwa-mobile-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(11, 20, 38, 0.95);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid rgba(0, 212, 255, 0.3);
                    padding: env(safe-area-inset-bottom) 0 0 0;
                    z-index: 1000;
                }
                
                .pwa-mobile-content {
                    padding-bottom: 80px; /* Account for mobile nav */
                }
            }
            
            /* Install button animations */
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .pwa-install-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0, 212, 255, 0.4);
            }
            
            /* Update banner styles */
            .pwa-update-banner .update-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .pwa-update-banner .update-actions {
                display: flex;
                gap: 10px;
            }
            
            .pwa-update-banner button {
                padding: 8px 16px;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 600;
            }
            
            .btn-dismiss {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            
            .btn-update {
                background: white;
                color: #00D4FF;
            }
        `;
        document.head.appendChild(mobileStyles);
    }

    showNotification(title, message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `pwa-notification pwa-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
            <button onclick="this.parentElement.remove()" class="notification-close">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            background: ${type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 212, 255, 0.9)'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transform: translateX(350px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(350px)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Offline data management
    async storeOfflineData(key, data) {
        try {
            if ('localStorage' in window) {
                localStorage.setItem(`orphi-offline-${key}`, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error('Failed to store offline data:', error);
        }
    }

    async getOfflineData(key) {
        try {
            if ('localStorage' in window) {
                const stored = localStorage.getItem(`orphi-offline-${key}`);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return parsed.data;
                }
            }
        } catch (error) {
            console.error('Failed to get offline data:', error);
        }
        return null;
    }

    // Background sync registration
    async registerBackgroundSync(tag) {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            const registration = await navigator.serviceWorker.ready;
            try {
                await registration.sync.register(tag);
                console.log(`✅ Background sync registered: ${tag}`);
            } catch (error) {
                console.error('Background sync registration failed:', error);
            }
        }
    }

    // Push notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log(`📢 Notification permission: ${permission}`);
            return permission === 'granted';
        }
        return false;
    }
}

// Initialize PWA Manager
window.pwaManager = new PWAManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}
