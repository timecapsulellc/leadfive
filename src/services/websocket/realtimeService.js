/**
 * Real-time Service using WebSocket
 * Handles live data updates and notifications
 */

class RealtimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscribers = new Map();
    this.heartbeatInterval = null;
    this.config = {
      url: this.getWebSocketUrl(),
      protocols: ['leadfive-v1'],
      options: {
        maxReconnectDelay: 10000,
        minReconnectDelay: 1000,
        reconnectDecay: 1.5,
        timeoutInterval: 2000,
        maxReconnectAttempts: 5,
      },
    };
  }

  /**
   * Get WebSocket URL based on environment
   */
  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host =
      process.env.NODE_ENV === 'production'
        ? 'leadfive.today'
        : 'localhost:8080';
    return `${protocol}//${host}/ws`;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(userAddress) {
    try {
      console.log('Connecting to WebSocket...', this.config.url);

      this.socket = new WebSocket(this.config.url, this.config.protocols);
      this.userAddress = userAddress;

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Send authentication
        this.authenticate(userAddress);

        // Start heartbeat
        this.startHeartbeat();

        // Notify subscribers
        this.notifySubscribers('connection', { status: 'connected' });
      };

      this.socket.onmessage = event => {
        this.handleMessage(event);
      };

      this.socket.onclose = event => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.cleanup();

        // Attempt reconnection if not intentional
        if (event.code !== 1000) {
          this.attemptReconnect();
        }

        this.notifySubscribers('connection', {
          status: 'disconnected',
          code: event.code,
          reason: event.reason,
        });
      };

      this.socket.onerror = error => {
        console.error('WebSocket error:', error);
        this.notifySubscribers('error', { error: error.message });
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Authenticate with the WebSocket server
   */
  authenticate(userAddress) {
    if (!this.isConnected) return;

    const authMessage = {
      type: 'auth',
      data: {
        userAddress,
        timestamp: Date.now(),
        version: '1.0',
      },
    };

    this.send(authMessage);
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);

      switch (message.type) {
        case 'auth_success':
          console.log('WebSocket authentication successful');
          this.subscribeToUserEvents();
          break;

        case 'auth_error':
          console.error('WebSocket authentication failed:', message.data);
          this.notifySubscribers('auth_error', message.data);
          break;

        case 'earnings_update':
          this.handleEarningsUpdate(message.data);
          break;

        case 'referral_update':
          this.handleReferralUpdate(message.data);
          break;

        case 'withdrawal_update':
          this.handleWithdrawalUpdate(message.data);
          break;

        case 'team_update':
          this.handleTeamUpdate(message.data);
          break;

        case 'notification':
          this.handleNotification(message.data);
          break;

        case 'heartbeat':
          this.handleHeartbeat(message.data);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Subscribe to user-specific events
   */
  subscribeToUserEvents() {
    if (!this.isConnected || !this.userAddress) return;

    const subscriptions = [
      'earnings',
      'referrals',
      'withdrawals',
      'team',
      'notifications',
    ];

    subscriptions.forEach(eventType => {
      this.send({
        type: 'subscribe',
        data: {
          event: eventType,
          userAddress: this.userAddress,
        },
      });
    });
  }

  /**
   * Handle earnings updates
   */
  handleEarningsUpdate(data) {
    const earningsData = {
      type: 'earnings',
      userAddress: data.userAddress,
      amount: parseFloat(data.amount),
      earningsType: data.earningsType,
      newTotal: parseFloat(data.newTotal),
      timestamp: new Date(data.timestamp),
      transactionHash: data.transactionHash,
      blockNumber: data.blockNumber,
    };

    this.notifySubscribers('earnings', earningsData);

    // Update local storage for persistence
    this.updateLocalStorage('lastEarningsUpdate', earningsData);
  }

  /**
   * Handle referral updates
   */
  handleReferralUpdate(data) {
    const referralData = {
      type: 'referral',
      sponsor: data.sponsor,
      referral: data.referral,
      packageValue: parseFloat(data.packageValue),
      commission: parseFloat(data.commission),
      timestamp: new Date(data.timestamp),
      transactionHash: data.transactionHash,
      blockNumber: data.blockNumber,
    };

    this.notifySubscribers('referral', referralData);

    // Update local storage
    this.updateLocalStorage('lastReferralUpdate', referralData);
  }

  /**
   * Handle withdrawal updates
   */
  handleWithdrawalUpdate(data) {
    const withdrawalData = {
      type: 'withdrawal',
      userAddress: data.userAddress,
      amount: parseFloat(data.amount),
      fee: parseFloat(data.fee),
      status: data.status,
      timestamp: new Date(data.timestamp),
      transactionHash: data.transactionHash,
      blockNumber: data.blockNumber,
    };

    this.notifySubscribers('withdrawal', withdrawalData);
  }

  /**
   * Handle team updates
   */
  handleTeamUpdate(data) {
    const teamData = {
      type: 'team',
      userAddress: data.userAddress,
      newMember: data.newMember,
      teamSize: data.teamSize,
      level: data.level,
      timestamp: new Date(data.timestamp),
    };

    this.notifySubscribers('team', teamData);
  }

  /**
   * Handle notifications
   */
  handleNotification(data) {
    const notification = {
      id: data.id || Date.now().toString(),
      type: data.notificationType,
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      timestamp: new Date(data.timestamp),
      read: false,
      data: data.additionalData || {},
    };

    this.notifySubscribers('notification', notification);

    // Store in local storage for persistence
    this.storeNotification(notification);
  }

  /**
   * Handle heartbeat
   */
  handleHeartbeat(data) {
    // Respond to server heartbeat
    this.send({
      type: 'heartbeat_response',
      data: {
        clientTimestamp: Date.now(),
        serverTimestamp: data.timestamp,
      },
    });
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'heartbeat',
          data: { timestamp: Date.now() },
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Send message to WebSocket server
   */
  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
      }
    };
  }

  /**
   * Notify event subscribers
   */
  notifySubscribers(eventType, data) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket subscriber callback:', error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifySubscribers('reconnect_failed', {
        attempts: this.reconnectAttempts,
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      this.config.options.maxReconnectDelay
    );

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      if (this.userAddress) {
        this.connect(this.userAddress);
      }
    }, delay);
  }

  /**
   * Update local storage with latest data
   */
  updateLocalStorage(key, data) {
    try {
      localStorage.setItem(
        `leadfive_${key}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Error updating local storage:', error);
    }
  }

  /**
   * Store notification in local storage
   */
  storeNotification(notification) {
    try {
      const stored = JSON.parse(
        localStorage.getItem('leadfive_notifications') || '[]'
      );
      stored.unshift(notification);

      // Keep only last 50 notifications
      const limited = stored.slice(0, 50);
      localStorage.setItem('leadfive_notifications', JSON.stringify(limited));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Get stored notifications
   */
  getStoredNotifications() {
    try {
      return JSON.parse(localStorage.getItem('leadfive_notifications') || '[]');
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(notificationId) {
    try {
      const stored = this.getStoredNotifications();
      const updated = stored.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      localStorage.setItem('leadfive_notifications', JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('Disconnecting WebSocket...');
    this.cleanup();

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.isConnected = false;
    this.userAddress = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Check connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      userAddress: this.userAddress,
      socketState: this.socket ? this.socket.readyState : null,
    };
  }

  /**
   * Send custom message to server
   */
  sendCustomMessage(type, data) {
    this.send({
      type,
      data: {
        ...data,
        userAddress: this.userAddress,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Request historical data
   */
  requestHistoricalData(dataType, options = {}) {
    this.sendCustomMessage('request_historical', {
      dataType,
      options: {
        limit: options.limit || 100,
        fromDate: options.fromDate,
        toDate: options.toDate,
      },
    });
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// Fallback service for when WebSocket is not available
export class FallbackRealtimeService {
  constructor() {
    this.subscribers = new Map();
    this.intervals = new Map();
  }

  connect(userAddress) {
    console.log('Using fallback real-time service (polling)');
    this.userAddress = userAddress;
    this.startPolling();
    return Promise.resolve();
  }

  startPolling() {
    // Simulate real-time updates with polling
    const interval = setInterval(() => {
      this.simulateUpdate();
    }, 30000); // Every 30 seconds

    this.intervals.set('main', interval);
  }

  simulateUpdate() {
    // Simulate random updates for demo purposes
    const updateTypes = ['earnings', 'referral', 'team'];
    const randomType =
      updateTypes[Math.floor(Math.random() * updateTypes.length)];

    const simulatedData = {
      type: randomType,
      timestamp: new Date(),
      simulated: true,
    };

    this.notifySubscribers(randomType, simulatedData);
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
      }
    };
  }

  notifySubscribers(eventType, data) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in fallback subscriber callback:', error);
        }
      });
    }
  }

  disconnect() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
  }

  getConnectionStatus() {
    return {
      isConnected: true,
      isFallback: true,
      userAddress: this.userAddress,
    };
  }
}

export default realtimeService;
