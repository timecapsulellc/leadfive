// Real-time Dashboard Integration - WebSocket Implementation
// Production-ready real-time updates with fallback strategies

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import './RealTimeDashboard.css';

const RealTimeDashboard = ({
  contractAddress,
  wsProvider,
  fallbackProvider,
  onAlert = () => {},
  enableNotifications = true,
  autoReconnect = true,
  maxReconnectAttempts = 5
}) => {
  // Connection states
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: 'disconnected', // connected, connecting, disconnected, error
    fallback: 'inactive',      // active, inactive, error
    lastUpdate: null,
    quality: 'unknown'         // excellent, good, fair, poor
  });

  // Real-time data state
  const [realtimeData, setRealtimeData] = useState({
    systemStats: {
      totalUsers: 0,
      totalVolume: '0',
      activeUsers24h: 0,
      pendingWithdrawals: 0,
      systemHealth: 100,
      gasPrice: '0',
      blockNumber: 0
    },
    liveEvents: [],
    userActivity: [],
    networkMetrics: {
      tps: 0,
      blockTime: 0,
      congestion: 'low'
    },
    poolStats: {
      ghp: { balance: '0', participants: 0 },
      fastTrack: { balance: '0', participants: 0 },
      leadership: { balance: '0', participants: 0 }
    }
  });

  // Component refs and connection management
  const wsConnectionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const wsUrlRef = useRef('ws://localhost:8080'); // OrphiChain WebSocket server
  const heartbeatIntervalRef = useRef(null);
  const fallbackIntervalRef = useRef(null);
  const eventListenersRef = useRef(new Map());
  const lastHeartbeatRef = useRef(null);

  // ===== WEBSOCKET CONNECTION MANAGEMENT =====
  
  const connectWebSocket = useCallback(async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, websocket: 'connecting' }));
      
      // Connect to OrphiChain WebSocket server
      const ws = new WebSocket(wsUrlRef.current);
      wsConnectionRef.current = ws;
      
      ws.onopen = () => {
        console.log('✅ Connected to OrphiChain WebSocket server');
        setConnectionStatus(prev => ({ 
          ...prev, 
          websocket: 'connected',
          lastUpdate: new Date(),
          quality: 'excellent'
        }));
        
        reconnectAttemptsRef.current = 0;
        onAlert('🟢 Real-time connection established', 'success');
        
        // Request initial data
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['system-stats', 'user-activity', 'contract-events', 'pool-updates']
        }));
        
        // Setup heartbeat
        setupHeartbeat();
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
          
          setConnectionStatus(prev => ({ 
            ...prev, 
            lastUpdate: new Date(),
            quality: calculateConnectionQuality()
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setConnectionStatus(prev => ({ 
          ...prev, 
          websocket: 'disconnected',
          quality: 'poor'
        }));
        
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus(prev => ({ 
          ...prev, 
          websocket: 'error',
          quality: 'poor'
        }));
        
        onAlert('🔴 Real-time connection error', 'error');
      };
      
      return true;
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      setConnectionStatus(prev => ({ 
        ...prev, 
        websocket: 'error',
        quality: 'poor'
      }));
      
      onAlert('🔴 Real-time connection failed', 'error');
      
      if (autoReconnect) {
        scheduleReconnect();
      }
      
      return false;
    }
  }, [autoReconnect, onAlert, maxReconnectAttempts]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'system-stats':
        setRealtimeData(prev => ({
          ...prev,
          systemStats: {
            ...prev.systemStats,
            ...data.payload
          }
        }));
        break;
        
      case 'contract-event':
        handleContractEvent(data.payload);
        break;
        
      case 'user-activity':
        setRealtimeData(prev => ({
          ...prev,
          userActivity: [data.payload, ...prev.userActivity.slice(0, 49)] // Keep last 50
        }));
        break;
        
      case 'pool-update':
        setRealtimeData(prev => ({
          ...prev,
          poolStats: {
            ...prev.poolStats,
            [data.payload.poolType]: data.payload.stats
          }
        }));
        break;
        
      case 'network-metrics':
        setRealtimeData(prev => ({
          ...prev,
          networkMetrics: {
            ...prev.networkMetrics,
            ...data.payload
          }
        }));
        break;
        
      case 'heartbeat':
        lastHeartbeatRef.current = Date.now();
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  // Handle contract events from WebSocket
  const handleContractEvent = useCallback((event) => {
    const eventData = {
      id: event.transactionHash || `event-${Date.now()}`,
      type: event.eventType,
      timestamp: event.timestamp || Date.now(),
      blockNumber: event.blockNumber,
      ...event.eventData
    };

    setRealtimeData(prev => ({
      ...prev,
      liveEvents: [eventData, ...prev.liveEvents.slice(0, 99)] // Keep last 100 events
    }));

    // Show notification for important events
    if (enableNotifications && ['UserRegistered', 'WithdrawalMade', 'EmergencyMode'].includes(event.eventType)) {
      showEventNotification(eventData);
    }
  }, [enableNotifications]);

  const calculateConnectionQuality = useCallback(() => {
    const now = Date.now();
    const lastUpdate = connectionStatus.lastUpdate?.getTime() || 0;
    const timeDiff = now - lastUpdate;
    
    if (timeDiff < 5000) return 'excellent';
    if (timeDiff < 15000) return 'good';
    if (timeDiff < 30000) return 'fair';
    return 'poor';
  }, [connectionStatus.lastUpdate]);

  // ===== CONTRACT EVENT LISTENERS =====
  
  // Contract event handling
  const setupContractEvents = useCallback(async () => {
    if (!contractProvider || !contractAddress) {
      console.log('📡 Contract not available, using fallback data generation');
      setupFallbackDataGeneration();
      return;
    }

    try {
      const contract = new ethers.Contract(contractAddress, ABI, contractProvider);
      contractRef.current = contract;

      // User registration events
      const handleUserRegistered = (user, id, sponsor, tier, event) => {
        const registrationEvent = {
          id: event.transactionHash,
          type: 'USER_REGISTERED',
          user: user,
          userId: Number(id),
          sponsor: sponsor,
          tier: Number(tier),
          timestamp: Date.now(),
          blockNumber: event.blockNumber
        };

        setRealtimeData(prev => ({
          ...prev,
          liveEvents: [registrationEvent, ...prev.liveEvents.slice(0, 99)],
          userActivity: [registrationEvent, ...prev.userActivity.slice(0, 49)]
        }));

        if (enableNotifications) {
          onAlert(`👤 New user registered: #${Number(id)}`, 'info');
          showPushNotification('New Registration', `User #${Number(id)} joined the matrix`);
        }
      };

    // Withdrawal events
    const handleWithdrawal = (user, amount, timestamp, event) => {
      const withdrawalEvent = {
        id: event.transactionHash,
        type: 'WITHDRAWAL',
        user: user,
        amount: ethers.formatEther(amount),
        timestamp: Number(timestamp) * 1000,
        blockNumber: event.blockNumber
      };

      setRealtimeData(prev => ({
        ...prev,
        liveEvents: [withdrawalEvent, ...prev.liveEvents.slice(0, 99)]
      }));

      if (enableNotifications) {
        onAlert(`💰 Withdrawal: ${ethers.formatEther(amount)} USDT`, 'info');
      }
    };

    // Global help distribution events
    const handleGlobalHelp = (poolType, amount, participantCount, event) => {
      const distributionEvent = {
        id: event.transactionHash,
        type: 'GLOBAL_HELP_DISTRIBUTED',
        poolType: Number(poolType),
        amount: ethers.formatEther(amount),
        participantCount: Number(participantCount),
        timestamp: Date.now(),
        blockNumber: event.blockNumber
      };

      setRealtimeData(prev => ({
        ...prev,
        liveEvents: [distributionEvent, ...prev.liveEvents.slice(0, 99)]
      }));

      if (enableNotifications) {
        const poolName = getPoolName(Number(poolType));
        onAlert(`🎯 ${poolName} distribution: ${ethers.formatEther(amount)} USDT`, 'success');
      }
    };

    // System health updates
    const handleSystemHealth = (performanceScore, avgGasPerUser, healthStatus, event) => {
      setRealtimeData(prev => ({
        ...prev,
        systemStats: {
          ...prev.systemStats,
          systemHealth: Number(performanceScore),
          gasPrice: ethers.formatUnits(avgGasPerUser, 'gwei')
        }
      }));

      const score = Number(performanceScore);
      if (score < 80 && enableNotifications) {
        onAlert(`⚠️ System health degraded: ${score}%`, 'warning');
      }
    };

    // Pool balance updates
    const handlePoolBalanceUpdate = (poolType, newBalance, timestamp, event) => {
      const poolName = getPoolName(Number(poolType));
      
      setRealtimeData(prev => {
        const updatedPoolStats = { ...prev.poolStats };
        if (poolName === 'GHP') updatedPoolStats.ghp.balance = ethers.formatEther(newBalance);
        else if (poolName === 'Fast Track') updatedPoolStats.fastTrack.balance = ethers.formatEther(newBalance);
        else if (poolName === 'Leadership') updatedPoolStats.leadership.balance = ethers.formatEther(newBalance);
        
        return {
          ...prev,
          poolStats: updatedPoolStats
        };
      });
    };

    // Emergency mode events
    const handleEmergencyMode = (reason, timestamp, event) => {
      const emergencyEvent = {
        id: event.transactionHash,
        type: 'EMERGENCY_MODE',
        reason: reason,
        timestamp: Number(timestamp) * 1000,
        blockNumber: event.blockNumber
      };

      setRealtimeData(prev => ({
        ...prev,
        liveEvents: [emergencyEvent, ...prev.liveEvents.slice(0, 99)]
      }));

      onAlert(`🚨 Emergency mode activated: ${reason}`, 'error');
      showPushNotification('Emergency Alert', `System emergency: ${reason}`);
    };

    // Register event listeners
    const listeners = [
      ['UserRegistered', handleUserRegistered],
      ['WithdrawalMade', handleWithdrawal], 
      ['GlobalHelpDistributed', handleGlobalHelp],
      ['SystemHealthUpdate', handleSystemHealth],
      ['PoolBalanceUpdated', handlePoolBalanceUpdate],
      ['EmergencyModeActivated', handleEmergencyMode]
    ];

    listeners.forEach(([eventName, handler]) => {
      contract.on(eventName, handler);
      eventListenersRef.current.set(eventName, () => contract.off(eventName, handler));
    });

    console.log('✅ Event listeners registered');
    
    } catch (error) {
      console.error('❌ Failed to setup contract events:', error);
      setupFallbackDataGeneration();
    }
  }, [enableNotifications, onAlert]);

  const loadInitialData = useCallback(async (contract) => {
    if (!contract) return;

    try {
      // Load system stats
      const [systemStats, poolData, networkMetrics] = await Promise.all([
        contract.getSystemStatsRealTime(),
        contract.getPoolBalances(),
        contract.getNetworkMetrics()
      ]);

      const currentBlockNumber = await contract.provider.getBlockNumber();

      setRealtimeData(prev => ({
        ...prev,
        systemStats: {
          totalUsers: Number(systemStats.totalUsers),
          totalVolume: ethers.formatEther(systemStats.totalVolume),
          activeUsers24h: Number(systemStats.activeUsers24h),
          pendingWithdrawals: Number(systemStats.pendingWithdrawals),
          systemHealth: Number(systemStats.systemHealth),
          gasPrice: ethers.formatUnits(networkMetrics.gasPrice, 'gwei'),
          blockNumber: currentBlockNumber
        },
        poolStats: {
          ghp: { 
            balance: ethers.formatEther(poolData.poolBalances[0] || 0),
            participants: Number(poolData.participantCounts[0] || 0)
          },
          fastTrack: { 
            balance: ethers.formatEther(poolData.poolBalances[1] || 0),
            participants: Number(poolData.participantCounts[1] || 0)
          },
          leadership: { 
            balance: ethers.formatEther(poolData.poolBalances[2] || 0),
            participants: Number(poolData.participantCounts[2] || 0)
          }
        },
        networkMetrics: {
          tps: calculateTPS(Number(networkMetrics.avgBlockTime)),
          blockTime: Number(networkMetrics.avgBlockTime),
          congestion: getCongestionLevel(Number(networkMetrics.congestionLevel))
        }
      }));

      console.log('✅ Initial data loaded');
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
    }
  }, []);

  const setupHeartbeat = useCallback(() => {
    const heartbeatInterval = setInterval(async () => {
      try {
        if (wsConnectionRef.current) {
          const blockNumber = await wsConnectionRef.current.provider.getBlockNumber();
          lastHeartbeatRef.current = Date.now();
          
          setRealtimeData(prev => ({
            ...prev,
            systemStats: {
              ...prev.systemStats,
              blockNumber
            }
          }));
          
          setConnectionStatus(prev => ({ 
            ...prev, 
            lastUpdate: new Date(),
            quality: 'excellent'
          }));
        }
      } catch (error) {
        console.warn('⚠️ Heartbeat failed, connection may be unstable');
        setConnectionStatus(prev => ({ 
          ...prev, 
          quality: 'poor'
        }));
        
        if (autoReconnect) {
          scheduleReconnect();
        }
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [autoReconnect]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      setConnectionStatus(prev => ({ ...prev, websocket: 'error' }));
      startFallbackMode();
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;
    
    console.log(`🔄 Scheduling reconnect attempt ${reconnectAttemptsRef.current} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, delay);
  }, [connectWebSocket, maxReconnectAttempts]);

  // ===== FALLBACK MODE =====
  
  const startFallbackMode = useCallback(() => {
    if (!fallbackProvider) return;
    
    console.log('🔄 Starting fallback polling mode');
    setConnectionStatus(prev => ({ ...prev, fallback: 'active' }));
    
    fallbackIntervalRef.current = setInterval(async () => {
      try {
        const contract = new ethers.Contract(contractAddress, [
          "function getSystemStatsRealTime() view returns (uint32, uint256, uint32, uint256, uint256)"
        ], fallbackProvider);
        
        const systemStats = await contract.getSystemStatsRealTime();
        
        setRealtimeData(prev => ({
          ...prev,
          systemStats: {
            ...prev.systemStats,
            totalUsers: Number(systemStats[0]),
            totalVolume: ethers.formatEther(systemStats[1]),
            activeUsers24h: Number(systemStats[2]),
            pendingWithdrawals: Number(systemStats[3]),
            systemHealth: Number(systemStats[4])
          }
        }));
        
        setConnectionStatus(prev => ({ 
          ...prev, 
          lastUpdate: new Date(),
          quality: 'fair'
        }));
        
      } catch (error) {
        console.error('❌ Fallback polling failed:', error);
        setConnectionStatus(prev => ({ ...prev, fallback: 'error' }));
      }
    }, 60000); // Every minute in fallback mode
    
  }, [contractAddress, fallbackProvider]);

  // ===== UTILITY FUNCTIONS =====
  
  const getPoolName = (poolType) => {
    switch (poolType) {
      case 1: return 'GHP';
      case 2: return 'Fast Track';
      case 3: return 'Leadership';
      case 4: return 'Ruby';
      case 5: return 'Diamond';
      default: return 'Unknown';
    }
  };

  const calculateTPS = (blockTime) => {
    return blockTime > 0 ? Math.round(1 / blockTime) : 0;
  };

  const getCongestionLevel = (level) => {
    if (level <= 30) return 'low';
    if (level <= 70) return 'medium'; 
    return 'high';
  };

  const showPushNotification = (title, body) => {
    if (enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // ===== LIFECYCLE MANAGEMENT =====
  
  useEffect(() => {
    // Initialize connection
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      // Clear all timers
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
      
      // Remove all event listeners
      eventListenersRef.current.forEach(removeListener => removeListener());
      
      console.log('🧹 Real-time dashboard cleaned up');
    };
  }, [connectWebSocket]);

  // ===== RENDER =====
  
  return (
    <div className="realtime-dashboard">
      {/* Connection Status */}
      <div className={`connection-status ${connectionStatus.websocket}`}>
        <div className="status-indicator">
          <span className={`status-dot ${connectionStatus.websocket}`}></span>
          <span className="status-text">
            {connectionStatus.websocket === 'connected' ? 'Live' : 
             connectionStatus.websocket === 'connecting' ? 'Connecting...' :
             connectionStatus.fallback === 'active' ? 'Polling Mode' : 'Disconnected'}
          </span>
          {connectionStatus.lastUpdate && (
            <span className="last-update">
              Last update: {formatTimeAgo(connectionStatus.lastUpdate.getTime())}
            </span>
          )}
        </div>
        <div className={`quality-indicator ${connectionStatus.quality}`}>
          {connectionStatus.quality === 'excellent' && '🟢'}
          {connectionStatus.quality === 'good' && '🟡'}
          {connectionStatus.quality === 'fair' && '🟠'}
          {connectionStatus.quality === 'poor' && '🔴'}
        </div>
      </div>

      {/* System Stats Dashboard */}
      <div className="system-stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{realtimeData.systemStats.totalUsers.toLocaleString()}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-change">+{realtimeData.systemStats.activeUsers24h} today</div>
          </div>
        </div>
        
        <div className="stat-card volume">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">${parseFloat(realtimeData.systemStats.totalVolume).toLocaleString()}</div>
            <div className="stat-label">Total Volume</div>
            <div className="stat-change">USDT</div>
          </div>
        </div>
        
        <div className="stat-card health">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <div className="stat-value">{realtimeData.systemStats.systemHealth}%</div>
            <div className="stat-label">System Health</div>
            <div className={`stat-change ${realtimeData.systemStats.systemHealth >= 90 ? 'positive' : 'negative'}`}>
              {realtimeData.systemStats.systemHealth >= 90 ? 'Excellent' : 'Monitoring'}
            </div>
          </div>
        </div>
        
        <div className="stat-card network">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{realtimeData.networkMetrics.tps}</div>
            <div className="stat-label">TPS</div>
            <div className="stat-change">{realtimeData.networkMetrics.blockTime}s blocks</div>
          </div>
        </div>
      </div>

      {/* Pool Status */}
      <div className="pool-status-grid">
        <div className="pool-card ghp">
          <h4>🌍 Global Help Pool</h4>
          <div className="pool-balance">${parseFloat(realtimeData.poolStats.ghp.balance).toLocaleString()}</div>
          <div className="pool-participants">{realtimeData.poolStats.ghp.participants} participants</div>
        </div>
        
        <div className="pool-card fast-track">
          <h4>🚀 Fast Track Pool</h4>
          <div className="pool-balance">${parseFloat(realtimeData.poolStats.fastTrack.balance).toLocaleString()}</div>
          <div className="pool-participants">{realtimeData.poolStats.fastTrack.participants} participants</div>
        </div>
        
        <div className="pool-card leadership">
          <h4>👑 Leadership Pool</h4>
          <div className="pool-balance">${parseFloat(realtimeData.poolStats.leadership.balance).toLocaleString()}</div>
          <div className="pool-participants">{realtimeData.poolStats.leadership.participants} participants</div>
        </div>
      </div>

      {/* Live Events Feed */}
      <div className="live-events-section">
        <h3>📡 Live Events</h3>
        <div className="events-feed">
          {realtimeData.liveEvents.slice(0, 10).map((event) => (
            <div key={event.id} className={`event-item ${event.type.toLowerCase()}`}>
              <div className="event-icon">
                {event.type === 'USER_REGISTERED' && '👤'}
                {event.type === 'WITHDRAWAL' && '💰'}
                {event.type === 'GLOBAL_HELP_DISTRIBUTED' && '🎯'}
                {event.type === 'EMERGENCY_MODE' && '🚨'}
              </div>
              <div className="event-content">
                <div className="event-text">
                  {event.type === 'USER_REGISTERED' && `User #${event.userId} registered in Tier ${event.tier}`}
                  {event.type === 'WITHDRAWAL' && `${event.amount} USDT withdrawn`}
                  {event.type === 'GLOBAL_HELP_DISTRIBUTED' && `${getPoolName(event.poolType)} distributed ${event.amount} USDT`}
                  {event.type === 'EMERGENCY_MODE' && `Emergency: ${event.reason}`}
                </div>
                <div className="event-time">{formatTimeAgo(event.timestamp)}</div>
              </div>
            </div>
          ))}
          
          {realtimeData.liveEvents.length === 0 && (
            <div className="no-events">
              <div className="no-events-icon">📡</div>
              <div className="no-events-text">Listening for live events...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
