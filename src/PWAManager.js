// PWA Manager for LeadFive Dashboard
class PWAManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    console.log('🚀 PWA Manager: Initializing...');

    // Register service worker
    this.registerServiceWorker();

    // Setup network monitoring
    this.setupNetworkMonitoring();

    // Setup install prompt
    this.setupInstallPrompt();

    console.log('✅ PWA Manager: Initialization complete');
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log(
          '✅ Service Worker registered successfully:',
          registration.scope
        );

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log(
                '🔄 New service worker available, prompting for update...'
              );
              // Show update available notification
              this.showUpdateAvailable();
            }
          });
        });
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 App is online');
      this.showNetworkStatus('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 App is offline');
      this.showNetworkStatus('offline');
    });
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('📱 PWA install prompt available');
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      this.deferredPrompt = null;
      this.hideInstallButton();
    });
  }

  async promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`PWA install prompt result: ${outcome}`);
      this.deferredPrompt = null;
    }
  }

  showNetworkStatus(status) {
    // Create or update network status indicator
    let indicator = document.getElementById('network-status');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'network-status';
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        border-radius: 4px;
        color: white;
        font-size: 12px;
        z-index: 10000;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }

    if (status === 'online') {
      indicator.style.backgroundColor = '#4CAF50';
      indicator.textContent = '✅ Online';
      setTimeout(() => indicator.remove(), 3000);
    } else {
      indicator.style.backgroundColor = '#F44336';
      indicator.textContent = '📱 Offline Mode';
    }
  }

  showInstallButton() {
    let installBtn = document.getElementById('pwa-install-btn');
    if (!installBtn) {
      installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.textContent = '📱 Install App';
      installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
      `;
      installBtn.onclick = () => this.promptInstall();
      document.body.appendChild(installBtn);
    }
  }

  hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.remove();
    }
  }

  showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #FF9800;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 10001;
    `;
    updateBanner.innerHTML = `
      <span>🔄 App update available!</span>
      <button onclick="window.location.reload()" style="margin-left: 10px; padding: 4px 8px; background: white; color: #FF9800; border: none; border-radius: 4px; cursor: pointer;">
        Update Now
      </button>
    `;
    document.body.prepend(updateBanner);
  }
}

// Initialize PWA Manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
  });
} else {
  window.pwaManager = new PWAManager();
}

export default PWAManager;
