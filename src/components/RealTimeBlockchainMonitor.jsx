import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { 
  FaBolt, 
  FaFire, 
  FaTrophy, 
  FaStar, 
  FaMedal,
  FaCrown,
  FaRocket,
  FaLightning,
  FaChartLine
} from 'react-icons/fa';
import './RealTimeBlockchainMonitor.css';

/**
 * 🚀 REAL-TIME BLOCKCHAIN MONITOR
 * Advanced component that monitors blockchain events in real-time
 * and provides sophisticated analytics and notifications
 */
export default function RealTimeBlockchainMonitor({ 
  account, 
  provider, 
  onEarningsUpdate,
  onNewAchievement 
}) {
  const [liveEvents, setLiveEvents] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    gasPrice: '0',
    blockNumber: 0,
    networkLoad: 'optimal',
    avgTransactionTime: '3s'
  });
  const [realtimeEarnings, setRealtimeEarnings] = useState({
    lastUpdate: null,
    increment: 0,
    totalToday: 0,
    projected24h: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const contractRef = useRef(null);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (!provider || !account) return;

    const initializeRealTimeMonitoring = async () => {
      try {
        // Set up contract instance
        const contractAddress = window.LEADFIVE_CONTRACT_CONFIG?.address;
        if (contractAddress) {
          const contract = new ethers.Contract(
            contractAddress,
            window.CONTRACT_ABI,
            provider
          );
          contractRef.current = contract;

          // Listen to contract events
          setupContractEventListeners(contract);
        }

        // Initialize WebSocket for real-time data
        initializeWebSocket();
        
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to initialize real-time monitoring:', error);
      }
    };

    initializeRealTimeMonitoring();

    return () => {
      cleanup();
    };
  }, [provider, account]);

  const setupContractEventListeners = (contract) => {
    // Listen for commission distributions to user
    const commissionFilter = contract.filters.CommissionDistributed(account);
    contract.on(commissionFilter, (recipient, payer, amount, poolType, poolName, timestamp, event) => {
      const earningData = {
        type: 'earning',
        amount: ethers.utils.formatUnits(amount, 6), // USDT has 6 decimals
        poolName,
        poolType: parseInt(poolType),
        timestamp: parseInt(timestamp) * 1000,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      };

      // Add to live events
      setLiveEvents(prev => [earningData, ...prev.slice(0, 49)]);
      
      // Update real-time earnings
      updateRealtimeEarnings(parseFloat(earningData.amount));
      
      // Check for achievements
      checkForAchievements(earningData);
      
      // Notify parent component
      if (onEarningsUpdate) {
        onEarningsUpdate(earningData);
      }
    });

    // Listen for new user registrations in your network
    const registrationFilter = contract.filters.UserRegistered();
    contract.on(registrationFilter, (user, sponsor, packageTier, amount, timestamp, event) => {
      // Check if this affects user's network
      if (sponsor === account) {
        const registrationData = {
          type: 'new_referral',
          user,
          packageTier: parseInt(packageTier),
          amount: ethers.utils.formatUnits(amount, 6),
          timestamp: parseInt(timestamp) * 1000,
          txHash: event.transactionHash
        };

        setLiveEvents(prev => [registrationData, ...prev.slice(0, 49)]);
        checkForAchievements(registrationData);
      }
    });

    // Listen for withdrawals
    const withdrawalFilter = contract.filters.WithdrawalProcessed(account);
    contract.on(withdrawalFilter, (user, amount, reinvestmentAmount, timestamp, event) => {
      const withdrawalData = {
        type: 'withdrawal',
        amount: ethers.utils.formatUnits(amount, 6),
        reinvestmentAmount: ethers.utils.formatUnits(reinvestmentAmount, 6),
        timestamp: parseInt(timestamp) * 1000,
        txHash: event.transactionHash
      };

      setLiveEvents(prev => [withdrawalData, ...prev.slice(0, 49)]);
    });
  };

  const initializeWebSocket = () => {
    const wsUrl = process.env.VITE_WEBSOCKET_URL || 'wss://ws.leadfive.today';
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('🔗 Real-time WebSocket connected');
        
        // Subscribe to user-specific updates
        wsRef.current.send(JSON.stringify({
          type: 'subscribe',
          user: account,
          channels: ['earnings', 'team_updates', 'network_stats']
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected, attempting reconnection...');
        setIsConnected(false);
        
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            initializeWebSocket();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'network_stats':
        setNetworkStats(data.payload);
        break;
      case 'earnings_update':
        updateRealtimeEarnings(data.payload.amount);
        break;
      case 'achievement':
        handleNewAchievement(data.payload);
        break;
      case 'team_update':
        setLiveEvents(prev => [data.payload, ...prev.slice(0, 49)]);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const updateRealtimeEarnings = (amount) => {
    setRealtimeEarnings(prev => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const msSinceToday = now - todayStart;
      const projected24h = prev.totalToday + (amount * (86400000 / msSinceToday));

      return {
        lastUpdate: now,
        increment: amount,
        totalToday: prev.totalToday + amount,
        projected24h: Math.max(projected24h, prev.projected24h)
      };
    });
  };

  const checkForAchievements = (eventData) => {
    const achievements = [];

    // Check earnings milestones
    if (eventData.type === 'earning') {
      const amount = parseFloat(eventData.amount);
      if (amount >= 100) achievements.push('big_earner');
      if (amount >= 500) achievements.push('whale_earner');
    }

    // Check referral milestones
    if (eventData.type === 'new_referral') {
      achievements.push('team_builder');
      if (eventData.packageTier >= 3) achievements.push('premium_attractor');
    }

    achievements.forEach(handleNewAchievement);
  };

  const handleNewAchievement = (achievementType) => {
    const achievementConfig = {
      big_earner: {
        title: '💰 Big Earner',
        description: 'Earned $100+ in a single transaction!',
        icon: FaTrophy,
        color: '#FFD700'
      },
      whale_earner: {
        title: '🐋 Whale Earner', 
        description: 'Earned $500+ in a single transaction!',
        icon: FaCrown,
        color: '#FF6B35'
      },
      team_builder: {
        title: '👥 Team Builder',
        description: 'Added a new member to your team!',
        icon: FaStar,
        color: '#4ECDC4'
      },
      premium_attractor: {
        title: '💎 Premium Attractor',
        description: 'Attracted a premium package member!',
        icon: FaMedal,
        color: '#9C27B0'
      }
    };

    const achievement = achievementConfig[achievementType];
    if (achievement) {
      setAchievements(prev => [{
        ...achievement,
        id: Date.now(),
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);

      if (onNewAchievement) {
        onNewAchievement(achievement);
      }
    }
  };

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (contractRef.current) {
      contractRef.current.removeAllListeners();
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'earning': return <FaBolt className="event-icon earning" />;
      case 'new_referral': return <FaRocket className="event-icon referral" />;
      case 'withdrawal': return <FaChartLine className="event-icon withdrawal" />;
      default: return <FaLightning className="event-icon default" />;
    }
  };

  const formatEventDescription = (event) => {
    switch (event.type) {
      case 'earning':
        return `+$${event.amount} from ${event.poolName} Pool`;
      case 'new_referral':
        return `New ${['', '$30', '$50', '$100', '$200'][event.packageTier]} package referral`;
      case 'withdrawal':
        return `Withdrew $${event.amount} (Reinvested: $${event.reinvestmentAmount})`;
      default:
        return 'Network activity';
    }
  };

  return (
    <div className="realtime-blockchain-monitor">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <FaBolt className="status-icon" />
        <span>{isConnected ? 'Live' : 'Reconnecting...'}</span>
      </div>

      {/* Real-time Earnings Display */}
      <div className="realtime-earnings">
        <div className="earnings-header">
          <FaFire className="fire-icon" />
          <h3>Live Earnings</h3>
        </div>
        <div className="earnings-grid">
          <div className="earning-stat">
            <span className="label">Today</span>
            <span className="value">${realtimeEarnings.totalToday.toFixed(2)}</span>
          </div>
          <div className="earning-stat">
            <span className="label">Projected 24h</span>
            <span className="value">${realtimeEarnings.projected24h.toFixed(2)}</span>
          </div>
          {realtimeEarnings.lastUpdate && (
            <div className="earning-stat">
              <span className="label">Last Update</span>
              <span className="value">
                {realtimeEarnings.lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live Events Feed */}
      <div className="live-events-feed">
        <h3>Live Activity</h3>
        <div className="events-list">
          {liveEvents.slice(0, 10).map((event, index) => (
            <div key={index} className="event-item">
              {getEventIcon(event.type)}
              <div className="event-content">
                <p>{formatEventDescription(event)}</p>
                <span className="event-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.txHash && (
                <a 
                  href={`${window.LEADFIVE_CONTRACT_CONFIG?.blockExplorer}/tx/${event.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="recent-achievements">
          <h3>🏆 Recent Achievements</h3>
          <div className="achievements-list">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <achievement.icon 
                  className="achievement-icon" 
                  style={{ color: achievement.color }}
                />
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Statistics */}
      <div className="network-stats">
        <h3>Network Status</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="label">Gas Price</span>
            <span className="value">{networkStats.gasPrice} Gwei</span>
          </div>
          <div className="stat-item">
            <span className="label">Block</span>
            <span className="value">#{networkStats.blockNumber}</span>
          </div>
          <div className="stat-item">
            <span className="label">Network Load</span>
            <span className={`value ${networkStats.networkLoad}`}>
              {networkStats.networkLoad}
            </span>
          </div>
          <div className="stat-item">
            <span className="label">Avg TX Time</span>
            <span className="value">{networkStats.avgTransactionTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
