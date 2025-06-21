// Simple EventEmitter implementation for browser compatibility
class SimpleEventEmitter {
  constructor() {
    this._listeners = {};
  }

  on(event, listener) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(listener);
  }

  emit(event, ...args) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(listener => listener(...args));
    }
  }

  off(event, listener) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(l => l !== listener);
    }
  }

  removeListener(event, listener) {
    this.off(event, listener);
  }

  removeAllListeners(event) {
    if (event) {
      delete this._listeners[event];
    } else {
      this._listeners = {};
    }
  }
}

class WebSocketService extends SimpleEventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.isManualClose = false;
    
    // Event types
    this.events = {
      CONNECTED: 'connected',
      DISCONNECTED: 'disconnected',
      ERROR: 'error',
      USER_UPDATED: 'user_updated',
      TREE_UPDATED: 'tree_updated',
      EARNINGS_UPDATED: 'earnings_updated',
      NEW_REFERRAL: 'new_referral',
      NETWORK_STATS: 'network_stats'
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(url = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isManualClose = false;
    
    // Use environment variable or fallback to localhost for development
    const wsUrl = url || import.meta.env.VITE_WEBSOCKET_URL || 
      (import.meta.env.DEV ? 'ws://localhost:8080' : 'wss://ws.leadfive.today');
    
    try {
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.emit(this.events.ERROR, error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.isManualClose = true;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit(this.events.CONNECTED);
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.emit(this.events.DISCONNECTED, { code: event.code, reason: event.reason });
      
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
      
      if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit(this.events.ERROR, error);
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    const { type, payload, timestamp } = data;
    
    switch (type) {
      case 'user_updated':
        this.emit(this.events.USER_UPDATED, payload);
        break;
        
      case 'tree_updated':
        this.emit(this.events.TREE_UPDATED, payload);
        break;
        
      case 'earnings_updated':
        this.emit(this.events.EARNINGS_UPDATED, payload);
        break;
        
      case 'new_referral':
        this.emit(this.events.NEW_REFERRAL, payload);
        break;
        
      case 'network_stats':
        this.emit(this.events.NETWORK_STATS, payload);
        break;
        
      case 'pong':
        // Heartbeat response - connection is alive
        break;
        
      default:
        console.log('Unknown WebSocket message type:', type);
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(type, payload = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }

    try {
      const message = {
        type,
        payload,
        timestamp: Date.now()
      };
      
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time updates for a specific user
   */
  subscribeToUser(address) {
    return this.send('subscribe', { type: 'user', address });
  }

  /**
   * Subscribe to tree updates
   */
  subscribeToTree(rootAddress) {
    return this.send('subscribe', { type: 'tree', rootAddress });
  }

  /**
   * Subscribe to network statistics
   */
  subscribeToNetworkStats() {
    return this.send('subscribe', { type: 'network_stats' });
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(type, identifier = null) {
    return this.send('unsubscribe', { type, identifier });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping');
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const wsService = new WebSocketService();

// Flag to prevent multiple simulation starts
let simulationStarted = false;

// For development/demo purposes, simulate WebSocket events
if (process.env.NODE_ENV === 'development') {
  wsService.simulateUpdates = () => {
    if (simulationStarted) {
      console.log('WebSocket simulation already running');
      return;
    }
    simulationStarted = true;
    console.log('Starting WebSocket simulation...');
    
    // Simulate user earnings update every 45 seconds (reduced frequency)
    setInterval(() => {
      wsService.emit(wsService.events.EARNINGS_UPDATED, {
        address: '0x1234567890123456789012345678901234567890',
        earnings: {
          totalEarned: Math.random() * 1000,
          withdrawableAmount: Math.random() * 500,
          sponsorCommission: Math.random() * 200,
          levelBonus: Math.random() * 150
        },
        timestamp: Date.now()
      });
    }, 45000);

    // Simulate new referral every 90 seconds (reduced frequency)
    setInterval(() => {
      wsService.emit(wsService.events.NEW_REFERRAL, {
        sponsor: '0x1234567890123456789012345678901234567890',
        newUser: `0x${Math.random().toString(16).substring(2, 42)}`,
        package: '$100',
        timestamp: Date.now()
      });
    }, 90000);

    // Simulate network stats update every 75 seconds (reduced frequency)
    setInterval(() => {
      wsService.emit(wsService.events.NETWORK_STATS, {
        totalUsers: 1000 + Math.floor(Math.random() * 100),
        totalEarnings: 50000 + Math.random() * 10000,
        activeUsers: 800 + Math.floor(Math.random() * 50),
        timestamp: Date.now()
      });
    }, 75000);
  };
}

export default wsService;
