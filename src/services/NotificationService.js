// LeadFive PWA Push Notification Service
// Handles PWA notifications with Web3 integration and brand consistency

class LeadFiveNotificationService {
  constructor() {
    this.registration = null;
    this.permission = 'default';
    this.isEnabled = false;
    this.vapidKey = null; // Will be set from environment
    this.subscription = null;
    
    this.init();
  }

  async init() {
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Check current permission
      this.permission = await Notification.permission;
      console.log('Notification service initialized');
      return true;
    } catch (error) {
      console.error('Notification service init failed:', error);
      return false;
    }  }

  async loadVapidKey() {
    // Simplified version without service worker dependency
    try {
      const res = await fetch('/vapid-public-key.txt');
      if (res.ok) {
        this.vapidKey = await res.text();
      }
    } catch (e) {
      console.warn('Could not load VAPID key:', e);
    }
    console.log('🔔 Notification service initialized');
    return true;
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (this.permission === 'granted') {
      return true;
    }

    // Request permission with branded message
    const permission = await Notification.requestPermission();
    this.permission = permission;

    if (permission === 'granted') {
      this.isEnabled = true;
      
      // Show welcome notification
      await this.showNotification('🎉 LeadFive Notifications Enabled', {
        body: 'You\'ll receive real-time updates about your Web3 activities',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'welcome',
        requireInteraction: false,
        actions: [
          {
            action: 'open-dashboard',
            title: 'Open Dashboard',
            icon: '/icons/icon-72x72.png'
          }
        ]
      });
      
      return true;
    }

    throw new Error(`Permission denied: ${permission}`);
  }

  async subscribe(vapidKey) {
    if (!this.registration) {
      throw new Error('Service worker not ready');
    }

    if (this.permission !== 'granted') {
      await this.requestPermission();
    }

    // Use loaded VAPID key if not provided
    const key = vapidKey || this.vapidKey;
    if (!key) throw new Error('No VAPID key available');

    try {
      // Unsubscribe from existing subscription
      if (this.subscription) {
        await this.subscription.unsubscribe();
      }

      // Create new subscription
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(key)
      });

      this.vapidKey = key;
      this.isEnabled = true;

      console.log('✅ Push subscription created');
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribe() {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.subscription = null;
        this.isEnabled = false;
        console.log('🔕 Push subscription removed');
        return true;
      } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return false;
      }
    }
    return true;
  }

  async showNotification(title, options = {}) {
    if (!this.registration || this.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return false;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'leadfive-notification',
      requireInteraction: false,
      timestamp: Date.now(),
      vibrate: [200, 100, 200],
      data: {
        timestamp: Date.now(),
        source: 'LeadFive'
      }
    };

    const notificationOptions = {
      ...defaultOptions,
      ...options,
      data: {
        ...defaultOptions.data,
        ...options.data
      }
    };

    try {
      await this.registration.showNotification(title, notificationOptions);
      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  // Predefined LeadFive notification types
  async showWeb3Notification(type, data = {}) {
    const notifications = {
      'user-registered': {
        title: '🎉 New User Registered',
        body: `User ID ${data.userId} joined the network${data.sponsor ? ` via ${data.sponsor.slice(0, 8)}...` : ''}`,
        tag: 'user-activity',
        actions: [
          { action: 'view-user', title: 'View User', icon: '/icons/icon-72x72.png' }
        ]
      },

      'withdrawal-made': {
        title: '💰 Withdrawal Processed',
        body: `${data.amount || 'Amount'} withdrawn ${data.user ? `by ${data.user.slice(0, 8)}...` : ''}`,
        tag: 'withdrawal',
        requireInteraction: true,
        actions: [
          { action: 'view-transaction', title: 'View Transaction', icon: '/icons/icon-72x72.png' }
        ]
      },

      'pool-distribution': {
        title: '🎯 Pool Distribution',
        body: `${data.amount || 'Funds'} distributed to ${data.participants || 'participants'} in ${data.poolType || 'pool'}`,
        tag: 'distribution',
        actions: [
          { action: 'view-pool', title: 'View Pool', icon: '/icons/icon-72x72.png' }
        ]
      },

      'system-alert': {
        title: '⚠️ System Alert',
        body: data.message || 'System status update',
        tag: 'system-alert',
        requireInteraction: true,
        actions: [
          { action: 'view-dashboard', title: 'Check Dashboard', icon: '/icons/icon-72x72.png' }
        ]
      },

      'network-congestion': {
        title: '🚦 Network Status',
        body: `Network congestion: ${data.level || 'Unknown'}. Gas price: ${data.gasPrice || 'N/A'}`,
        tag: 'network-status',
        actions: [
          { action: 'view-network', title: 'View Network', icon: '/icons/icon-72x72.png' }
        ]
      },

      'emergency-mode': {
        title: '🚨 Emergency Mode Activated',
        body: data.reason || 'System safety measures have been activated',
        tag: 'emergency',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        actions: [
          { action: 'view-emergency', title: 'View Details', icon: '/icons/icon-72x72.png' }
        ]
      },

      'connection-lost': {
        title: '📡 Connection Lost',
        body: 'Real-time updates disconnected. Attempting to reconnect...',
        tag: 'connection-status',
        actions: [
          { action: 'retry-connection', title: 'Retry', icon: '/icons/icon-72x72.png' }
        ]
      },

      'connection-restored': {
        title: '✅ Connection Restored',
        body: 'Real-time updates are now active',
        tag: 'connection-status',
        vibrate: [100, 50, 100]
      }
    };

    const config = notifications[type];
    if (!config) {
      console.warn(`Unknown notification type: ${type}`);
      return false;
    }

    return await this.showNotification(config.title, {
      ...config,
      data: {
        type,
        timestamp: Date.now(),
        ...data
      }
    });
  }

  // Schedule delayed notifications
  async scheduleNotification(title, options, delay) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.showNotification(title, options);
        resolve(result);
      }, delay);
    });
  }

  // Batch notifications for multiple events
  async showBatchNotification(events) {
    if (!events || events.length === 0) return false;

    if (events.length === 1) {
      return await this.showWeb3Notification(events[0].type, events[0].data);
    }

    // Summarize multiple events
    const summary = this.createEventSummary(events);
    return await this.showNotification(summary.title, {
      body: summary.body,
      tag: 'batch-update',
      data: {
        events: events,
        timestamp: Date.now()
      },
      actions: [
        { action: 'view-all', title: 'View All', icon: '/icons/icon-72x72.png' }
      ]
    });
  }

  createEventSummary(events) {
    const counts = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    const typeNames = {
      'user-registered': 'registrations',
      'withdrawal-made': 'withdrawals',
      'pool-distribution': 'distributions'
    };

    const summary = Object.entries(counts)
      .map(([type, count]) => `${count} ${typeNames[type] || type}`)
      .join(', ');

    return {
      title: `📊 ${events.length} Updates`,
      body: `Recent activity: ${summary}`
    };
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get subscription details for server
  getSubscriptionDetails() {
    if (!this.subscription) return null;

    return {
      endpoint: this.subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(this.subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(this.subscription.getKey('auth'))))
      }
    };
  }

  // Check if notifications are supported and enabled
  isSupported() {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  getStatus() {
    return {
      supported: this.isSupported(),
      permission: this.permission,
      enabled: this.isEnabled,
      subscribed: !!this.subscription
    };
  }

  // Utility: Test push notification (for dev/testing)
  async testPushNotification() {
    if (!this.vapidKey) {
      await this.init();
    }
    await this.requestPermission();
    await this.subscribe();
    await this.showNotification('🔔 Test Push Notification', {
      body: 'This is a test push notification from LeadFive.',
      tag: 'test-push',
      requireInteraction: false
    });
  }

  // Server integration methods
  async registerWithServer(userId, walletAddress) {
    if (!this.subscription) {
      console.warn('No push subscription available');
      return false;
    }

    try {
      const response = await fetch('http://localhost:3002/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: this.getSubscriptionDetails(),
          userId,
          walletAddress
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Registered with push server');
        return true;
      } else {
        console.error('❌ Server registration failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Server registration failed:', error);
      return false;
    }
  }

  async unregisterFromServer(userId, walletAddress) {
    try {
      const response = await fetch('http://localhost:3002/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, walletAddress })
      });

      const result = await response.json();
      console.log(result.success ? '✅ Unregistered from push server' : '❌ Server unregistration failed');
      return result.success;
    } catch (error) {
      console.error('❌ Server unregistration failed:', error);
      return false;
    }
  }

  // Enhanced subscribe method with server registration
  async subscribeWithServer(vapidKey, userId, walletAddress) {
    try {
      // First subscribe to push notifications
      await this.subscribe(vapidKey);
      
      // Then register with push server
      await this.registerWithServer(userId, walletAddress);
      
      console.log('✅ Full push notification setup complete');
      return true;
    } catch (error) {
      console.error('❌ Full subscription setup failed:', error);
      return false;
    }
  }
}

// Create global instance
window.LeadFiveNotifications = new LeadFiveNotificationService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeadFiveNotificationService;
}

console.log('🔔 LeadFive Notification Service loaded');
