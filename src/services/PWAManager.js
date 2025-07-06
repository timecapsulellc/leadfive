/**
 * PWA Manager - Handles service worker registration and offline functionality
 */

class PWAManager {
  constructor() {
    this.registration = null;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    this.installPrompt = null;
    this.listeners = {
      online: [],
      offline: [],
      updateAvailable: [],
      installed: []
    };
    
    this.init();
  }

  /**
   * Initialize PWA functionality
   */
  async init() {
    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Setup offline detection
      this.setupOfflineDetection();
      
      // Setup install prompt handling
      this.setupInstallPrompt();
      
      // Setup update checking
      this.setupUpdateChecking();
      
      console.log('PWA Manager initialized successfully');
    } catch (error) {
      console.error('PWA Manager initialization failed:', error);
    }
  }

  /**
   * Register the service worker
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.emit('updateAvailable', { registration: this.registration });
            }
          });
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', event => {
        this.handleServiceWorkerMessage(event.data);
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Setup offline/online detection
   */
  setupOfflineDetection() {
    const updateOnlineStatus = () => {
      const wasOnline = this.isOnline;
      this.isOnline = navigator.onLine;
      
      if (wasOnline !== this.isOnline) {
        if (this.isOnline) {
          this.emit('online');
          this.showOnlineNotification();
        } else {
          this.emit('offline');
          this.showOfflineNotification();
        }
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }

  /**
   * Setup install prompt handling
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.installPrompt = event;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.emit('installed');
      this.showInstalledNotification();
    });
  }

  /**
   * Setup automatic update checking
   */
  setupUpdateChecking() {
    // Check for updates every 30 minutes
    setInterval(() => {
      if (this.registration) {
        this.registration.update();
      }
    }, 30 * 60 * 1000);

    // Check for updates when the app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.registration) {
        this.registration.update();
      }
    });
  }

  /**
   * Handle messages from service worker
   */
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'SW_ACTIVATED':
        console.log('Service Worker activated:', data.version);
        break;
      case 'SYNC_COMPLETE':
        console.log('Background sync completed');
        break;
      default:
        console.log('Service Worker message:', data);
    }
  }

  /**
   * Prompt user to install the app
   */
  async promptInstall() {
    if (!this.installPrompt) {
      return false;
    }

    try {
      this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;
      this.installPrompt = null;
      
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Apply available service worker update
   */
  async applyUpdate() {
    if (!this.registration || !this.updateAvailable) {
      return false;
    }

    try {
      const newWorker = this.registration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
        return true;
      }
    } catch (error) {
      console.error('Update application failed:', error);
    }
    
    return false;
  }

  /**
   * Cache important resources for offline use
   */
  async cacheResources(resources) {
    if (!this.registration) {
      console.warn('Service Worker not available for caching');
      return;
    }

    try {
      const cache = await caches.open('user-cache');
      await cache.addAll(resources);
      console.log('Resources cached for offline use');
    } catch (error) {
      console.error('Caching failed:', error);
    }
  }

  /**
   * Check if the app is running in standalone mode
   */
  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }

  /**
   * Get offline status and cache information
   */
  async getStatus() {
    const cacheNames = await caches.keys();
    const cacheInfo = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      cacheInfo[cacheName] = keys.length;
    }

    return {
      isOnline: this.isOnline,
      isStandalone: this.isStandalone(),
      serviceWorkerRegistered: !!this.registration,
      updateAvailable: this.updateAvailable,
      canInstall: !!this.installPrompt,
      cacheInfo
    };
  }

  /**
   * Show user notifications
   */
  showInstallPrompt() {
    this.showNotification({
      type: 'install',
      title: '📱 Install LeadFive',
      message: 'Add LeadFive to your home screen for quick access and offline functionality.',
      actions: [
        { text: 'Install', action: () => this.promptInstall() },
        { text: 'Later', action: () => {} }
      ]
    });
  }

  showOfflineNotification() {
    this.showNotification({
      type: 'offline',
      title: '📡 You\'re Offline',
      message: 'Some features may be limited. Your data will sync when you\'re back online.',
      persistent: true
    });
  }

  showOnlineNotification() {
    this.showNotification({
      type: 'online',
      title: '🌐 Back Online',
      message: 'All features are now available. Syncing your data...',
      duration: 3000
    });
  }

  showInstalledNotification() {
    this.showNotification({
      type: 'installed',
      title: '✅ App Installed',
      message: 'LeadFive is now installed and available offline!',
      duration: 5000
    });
  }

  /**
   * Generic notification system
   */
  showNotification({ type, title, message, actions = [], persistent = false, duration = 5000 }) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `pwa-notification pwa-notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        ${actions.length > 0 ? `
          <div class="notification-actions">
            ${actions.map(action => `
              <button class="notification-action" data-action="${action.action}">${action.text}</button>
            `).join('')}
          </div>
        ` : ''}
        ${!persistent ? '<button class="notification-close">×</button>' : ''}
      </div>
    `;

    // Add styles if not already present
    this.ensureNotificationStyles();

    // Add event listeners
    if (actions.length > 0) {
      notification.querySelectorAll('.notification-action').forEach((button, index) => {
        button.addEventListener('click', () => {
          actions[index].action();
          notification.remove();
        });
      });
    }

    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => notification.remove());
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Auto-remove after duration
    if (!persistent && duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, duration);
    }
  }

  /**
   * Ensure notification styles are present
   */
  ensureNotificationStyles() {
    if (document.querySelector('#pwa-notification-styles')) {
      return;
    }

    const styles = document.createElement('style');
    styles.id = 'pwa-notification-styles';
    styles.textContent = `
      .pwa-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 350px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      }
      
      .notification-content {
        padding: 16px;
      }
      
      .notification-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: #00d4ff;
      }
      
      .notification-message {
        font-size: 14px;
        line-height: 1.4;
        margin-bottom: 12px;
      }
      
      .notification-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      
      .notification-action {
        padding: 6px 12px;
        background: rgba(0, 212, 255, 0.2);
        border: 1px solid rgba(0, 212, 255, 0.4);
        color: #00d4ff;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }
      
      .notification-action:hover {
        background: rgba(0, 212, 255, 0.3);
      }
      
      .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 18px;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .pwa-notification {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

// Export singleton instance
export default new PWAManager();