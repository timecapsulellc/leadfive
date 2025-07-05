import wsService from './WebSocketService.js';
import { ethers } from 'ethers';

class BlockchainWebSocketService {
  constructor() {
    this.contractEvents = {
      REGISTRATION: 'user_registered',
      PACKAGE_PURCHASED: 'package_purchased', 
      COMMISSION_PAID: 'commission_paid',
      WITHDRAWAL_REQUESTED: 'withdrawal_requested',
      WITHDRAWAL_PROCESSED: 'withdrawal_processed',
      TREE_UPDATED: 'tree_updated',
      POOL_DISTRIBUTION: 'pool_distribution',
      LEVEL_BONUS: 'level_bonus_paid',
      UPLINE_BONUS: 'upline_bonus_paid'
    };

    this.eventCache = new Map();
    this.maxCacheSize = 100;
    this.subscribers = new Map();
    
    // Initialize WebSocket connection
    this.initializeConnection();
  }

  /**
   * Initialize WebSocket connection and set up blockchain event handling
   */
  initializeConnection() {
    // Connect to WebSocket service
    if (!wsService.isConnected()) {
      wsService.connect();
    }

    // Set up blockchain-specific event handlers
    this.setupBlockchainEventHandlers();
    
    // Set up contract event listeners
    this.setupContractEventListeners();
  }

  /**
   * Set up handlers for blockchain-specific WebSocket events
   */
  setupBlockchainEventHandlers() {
    // Listen for user registration events
    wsService.on('user_registered', (data) => {
      this.handleUserRegistration(data);
    });

    // Listen for commission events
    wsService.on('commission_paid', (data) => {
      this.handleCommissionPaid(data);
    });

    // Listen for withdrawal events
    wsService.on('withdrawal_processed', (data) => {
      this.handleWithdrawalProcessed(data);
    });

    // Listen for tree updates
    wsService.on('tree_updated', (data) => {
      this.handleTreeUpdate(data);
    });

    // Listen for pool distributions
    wsService.on('pool_distribution', (data) => {
      this.handlePoolDistribution(data);
    });
  }

  /**
   * Set up contract event listeners for real-time blockchain events
   */
  setupContractEventListeners() {
    // This would connect to an Ethereum provider and listen for contract events
    // For now, we'll simulate with periodic updates
    this.startBlockchainSimulation();
  }

  /**
   * Start blockchain event simulation for demo purposes
   */
  startBlockchainSimulation() {
    // Simulate blockchain events every 30-60 seconds
    setInterval(() => {
      this.simulateBlockchainEvent();
    }, 30000 + Math.random() * 30000);

    // Simulate earnings updates every 45 seconds
    setInterval(() => {
      this.simulateEarningsUpdate();
    }, 45000);

    // Simulate tree updates every 2 minutes
    setInterval(() => {
      this.simulateTreeUpdate();
    }, 120000);
  }

  /**
   * Simulate a random blockchain event
   */
  simulateBlockchainEvent() {
    const events = [
      'user_registered',
      'package_purchased',
      'commission_paid',
      'withdrawal_requested'
    ];

    const eventType = events[Math.floor(Math.random() * events.length)];
    const mockData = this.generateMockEventData(eventType);
    
    this.broadcastEvent(eventType, mockData);
  }

  /**
   * Generate mock event data for simulation
   */
  generateMockEventData(eventType) {
    const baseData = {
      timestamp: Date.now(),
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      gasUsed: Math.floor(Math.random() * 100000) + 21000
    };

    switch (eventType) {
      case 'user_registered':
        return {
          ...baseData,
          userAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          sponsorAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          package: ['30', '50', '100', '200'][Math.floor(Math.random() * 4)],
          position: Math.random() > 0.5 ? 'left' : 'right'
        };

      case 'package_purchased':
        return {
          ...baseData,
          userAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          packageValue: ['30', '50', '100', '200'][Math.floor(Math.random() * 4)],
          previousPackage: ['0', '30', '50', '100'][Math.floor(Math.random() * 4)]
        };

      case 'commission_paid':
        return {
          ...baseData,
          recipient: `0x${Math.random().toString(16).substr(2, 40)}`,
          payer: `0x${Math.random().toString(16).substr(2, 40)}`,
          amount: (Math.random() * 100).toFixed(2),
          commissionType: ['direct', 'level', 'upline', 'pool'][Math.floor(Math.random() * 4)],
          level: Math.floor(Math.random() * 10) + 1
        };

      case 'withdrawal_requested':
        return {
          ...baseData,
          userAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          amount: (Math.random() * 500).toFixed(2),
          withdrawalType: Math.random() > 0.5 ? 'withdraw' : 'reinvest'
        };

      default:
        return baseData;
    }
  }

  /**
   * Simulate earnings update for connected users
   */
  simulateEarningsUpdate() {
    const mockEarningsData = {
      timestamp: Date.now(),
      userAddress: '0x1234567890123456789012345678901234567890', // Mock current user
      earnings: {
        totalEarnings: 450 + Math.random() * 50,
        directReferralEarnings: 240 + Math.random() * 20,
        levelBonusEarnings: 60 + Math.random() * 10,
        uplineBonusEarnings: 45 + Math.random() * 5,
        leaderPoolEarnings: Math.random() * 10,
        helpPoolEarnings: 110 + Math.random() * 15,
        pendingRewards: 20 + Math.random() * 10,
        dailyEarnings: 15 + Math.random() * 5
      },
      changesSince: {
        totalEarnings: Math.random() * 5,
        dailyEarnings: Math.random() * 2
      }
    };

    this.broadcastEvent('earnings_updated', mockEarningsData);
  }

  /**
   * Simulate tree structure update
   */
  simulateTreeUpdate() {
    const mockTreeData = {
      timestamp: Date.now(),
      rootAddress: '0x1234567890123456789012345678901234567890',
      changes: {
        newNodes: Math.floor(Math.random() * 3),
        activatedNodes: Math.floor(Math.random() * 2),
        totalNodes: 25 + Math.floor(Math.random() * 5),
        maxDepth: 5 + Math.floor(Math.random() * 2)
      },
      recentActivity: [
        {
          type: 'new_member',
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          position: Math.random() > 0.5 ? 'left' : 'right',
          level: Math.floor(Math.random() * 5) + 1,
          timestamp: Date.now() - Math.random() * 300000 // Within last 5 minutes
        }
      ]
    };

    this.broadcastEvent('tree_updated', mockTreeData);
  }

  /**
   * Subscribe to real-time updates for a specific user address
   */
  subscribeToUserUpdates(userAddress, callback) {
    if (!this.subscribers.has(userAddress)) {
      this.subscribers.set(userAddress, new Set());
    }
    
    this.subscribers.get(userAddress).add(callback);
    
    // Send subscription request to WebSocket server
    wsService.subscribeToUser(userAddress);
    
    return () => {
      this.unsubscribeFromUserUpdates(userAddress, callback);
    };
  }

  /**
   * Unsubscribe from user updates
   */
  unsubscribeFromUserUpdates(userAddress, callback) {
    if (this.subscribers.has(userAddress)) {
      this.subscribers.get(userAddress).delete(callback);
      
      if (this.subscribers.get(userAddress).size === 0) {
        this.subscribers.delete(userAddress);
        wsService.unsubscribe('user', userAddress);
      }
    }
  }

  /**
   * Subscribe to earnings updates
   */
  subscribeToEarningsUpdates(userAddress, callback) {
    const earningsCallback = (data) => {
      if (data.userAddress === userAddress) {
        callback(data);
      }
    };

    wsService.on('earnings_updated', earningsCallback);
    
    return () => {
      wsService.off('earnings_updated', earningsCallback);
    };
  }

  /**
   * Subscribe to tree updates
   */
  subscribeToTreeUpdates(rootAddress, callback) {
    const treeCallback = (data) => {
      if (data.rootAddress === rootAddress) {
        callback(data);
      }
    };

    wsService.on('tree_updated', treeCallback);
    wsService.subscribeToTree(rootAddress);
    
    return () => {
      wsService.off('tree_updated', treeCallback);
      wsService.unsubscribe('tree', rootAddress);
    };
  }

  /**
   * Subscribe to withdrawal updates
   */
  subscribeToWithdrawalUpdates(userAddress, callback) {
    const withdrawalCallback = (data) => {
      if (data.userAddress === userAddress) {
        callback(data);
      }
    };

    wsService.on('withdrawal_processed', withdrawalCallback);
    
    return () => {
      wsService.off('withdrawal_processed', withdrawalCallback);
    };
  }

  /**
   * Subscribe to referral updates
   */
  subscribeToReferralUpdates(userAddress, callback) {
    const referralCallback = (data) => {
      if (data.sponsor === userAddress || data.userAddress === userAddress) {
        callback(data);
      }
    };

    wsService.on('user_registered', referralCallback);
    
    return () => {
      wsService.off('user_registered', referralCallback);
    };
  }

  /**
   * Handle user registration event
   */
  handleUserRegistration(data) {
    this.cacheEvent('user_registered', data);
    
    // Notify relevant subscribers
    this.notifySubscribers(data.sponsorAddress, {
      type: 'new_referral',
      data: data
    });
  }

  /**
   * Handle commission paid event
   */
  handleCommissionPaid(data) {
    this.cacheEvent('commission_paid', data);
    
    // Notify earnings subscribers
    this.notifySubscribers(data.recipient, {
      type: 'earnings_update',
      data: data
    });
  }

  /**
   * Handle withdrawal processed event
   */
  handleWithdrawalProcessed(data) {
    this.cacheEvent('withdrawal_processed', data);
    
    // Notify withdrawal subscribers
    this.notifySubscribers(data.userAddress, {
      type: 'withdrawal_update',
      data: data
    });
  }

  /**
   * Handle tree update event
   */
  handleTreeUpdate(data) {
    this.cacheEvent('tree_updated', data);
    
    // Notify tree subscribers
    this.notifySubscribers(data.rootAddress, {
      type: 'tree_update',
      data: data
    });
  }

  /**
   * Handle pool distribution event
   */
  handlePoolDistribution(data) {
    this.cacheEvent('pool_distribution', data);
    
    // Notify all relevant users
    if (data.recipients) {
      data.recipients.forEach(recipient => {
        this.notifySubscribers(recipient.address, {
          type: 'pool_distribution',
          data: { ...data, amount: recipient.amount }
        });
      });
    }
  }

  /**
   * Notify subscribers of events
   */
  notifySubscribers(userAddress, event) {
    if (this.subscribers.has(userAddress)) {
      this.subscribers.get(userAddress).forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error notifying subscriber:', error);
        }
      });
    }
  }

  /**
   * Broadcast event to WebSocket service
   */
  broadcastEvent(eventType, data) {
    wsService.emit(eventType, data);
  }

  /**
   * Cache event for recent activity
   */
  cacheEvent(eventType, data) {
    const eventKey = `${eventType}_${Date.now()}`;
    this.eventCache.set(eventKey, { eventType, data, timestamp: Date.now() });
    
    // Maintain cache size
    if (this.eventCache.size > this.maxCacheSize) {
      const oldestKey = this.eventCache.keys().next().value;
      this.eventCache.delete(oldestKey);
    }
  }

  /**
   * Get recent events from cache
   */
  getRecentEvents(eventType = null, limit = 10) {
    const events = Array.from(this.eventCache.values());
    
    let filteredEvents = eventType 
      ? events.filter(event => event.eventType === eventType)
      : events;
    
    return filteredEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      status: wsService.getStatus(),
      isConnected: wsService.isConnected(),
      subscribers: this.subscribers.size,
      cachedEvents: this.eventCache.size
    };
  }

  /**
   * Manually trigger data refresh
   */
  refreshData(userAddress) {
    // Request fresh data from server
    wsService.send('refresh_user_data', { userAddress });
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    this.subscribers.clear();
    this.eventCache.clear();
    wsService.disconnect();
  }
}

// Create singleton instance
const blockchainWsService = new BlockchainWebSocketService();

export default blockchainWsService;