import React from 'react';

/**
 * Custom hook for managing live stats and real-time data
 * Handles WebSocket connections and real-time updates
 */
export function useLiveStats() {
  const [liveStats, setLiveStats] = React.useState({
    tvl: 2847392.45,
    userCount: 1247,
    avgDeposit: 156.78,
    lastUpdated: new Date().toISOString()
  });

  const [transactions, setTransactions] = React.useState([
    { id: 'tx_001', type: 'deposit', amount: 100, status: 'confirmed', user: 'User_0x1a2b', timestamp: Date.now() - 300000 },
    { id: 'tx_002', type: 'withdrawal', amount: 50, status: 'pending', user: 'User_0x3c4d', timestamp: Date.now() - 120000 },
    { id: 'tx_003', type: 'commission', amount: 25, status: 'confirmed', user: 'User_0x5e6f', timestamp: Date.now() - 60000 },
    { id: 'tx_004', type: 'upgrade', amount: 200, status: 'processing', user: 'User_0x7g8h', timestamp: Date.now() - 30000 }
  ]);

  const [networkActivity, setNetworkActivity] = React.useState([
    { user: 'User_0x1a2b', action: 'joined with $100 package', time: '2 min ago', color: '#7B2CBF' },
    { user: 'User_0x3c4d', action: 'upgraded to $200 package', time: '5 min ago', color: '#00FF88' },
    { user: 'User_0x5e6f', action: 'earned $25 commission', time: '8 min ago', color: '#FF6B35' },
    { user: 'User_0x7g8h', action: 'joined with $50 package', time: '12 min ago', color: '#00D4FF' }
  ]);

  const [wsConnected, setWsConnected] = React.useState(false);
  const [connectionRetries, setConnectionRetries] = React.useState(0);
  const wsRef = React.useRef(null);

  // Initialize WebSocket connection
  const initWebSocket = React.useCallback(() => {
    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate the connection
      setWsConnected(true);
      setConnectionRetries(0);
      
      // Simulate periodic updates
      const interval = setInterval(() => {
        setLiveStats(prev => ({
          ...prev,
          tvl: prev.tvl + (Math.random() - 0.5) * 10000,
          userCount: prev.userCount + Math.floor(Math.random() * 3),
          avgDeposit: prev.avgDeposit + (Math.random() - 0.5) * 10,
          lastUpdated: new Date().toISOString()
        }));

        // Add new transaction occasionally
        if (Math.random() < 0.3) {
          const newTransaction = {
            id: `tx_${Date.now()}`,
            type: ['deposit', 'withdrawal', 'commission', 'upgrade'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 500) + 25,
            status: ['confirmed', 'pending', 'processing'][Math.floor(Math.random() * 3)],
            user: `User_0x${Math.random().toString(16).substr(2, 4)}`,
            timestamp: Date.now()
          };
          
          setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]); // Keep only 10 most recent
        }

        // Add new network activity
        if (Math.random() < 0.4) {
          const actions = [
            'joined with $100 package',
            'upgraded to $200 package',
            'earned commission',
            'completed level bonus',
            'achieved new rank'
          ];
          const colors = ['#7B2CBF', '#00FF88', '#FF6B35', '#00D4FF'];
          
          const newActivity = {
            user: `User_0x${Math.random().toString(16).substr(2, 4)}`,
            action: actions[Math.floor(Math.random() * actions.length)],
            time: 'Just now',
            color: colors[Math.floor(Math.random() * colors.length)]
          };
          
          setNetworkActivity(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 most recent
        }
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setWsConnected(false);
      setConnectionRetries(prev => prev + 1);
    }
  }, []);

  // Reconnect WebSocket with exponential backoff
  const reconnectWebSocket = React.useCallback(() => {
    if (connectionRetries < 5) {
      const delay = Math.pow(2, connectionRetries) * 1000; // Exponential backoff
      setTimeout(() => {
        initWebSocket();
      }, delay);
    }
  }, [connectionRetries, initWebSocket]);

  // Initialize connection on mount
  React.useEffect(() => {
    const cleanup = initWebSocket();
    
    return () => {
      if (cleanup) cleanup();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [initWebSocket]);

  // Auto-reconnect on disconnect
  React.useEffect(() => {
    if (!wsConnected && connectionRetries < 5) {
      reconnectWebSocket();
    }
  }, [wsConnected, reconnectWebSocket, connectionRetries]);

  // Format transaction status
  const getTransactionStatusColor = React.useCallback((status) => {
    switch (status) {
      case 'confirmed': return '#00FF88';
      case 'pending': return '#FFD700';
      case 'processing': return '#00D4FF';
      case 'failed': return '#FF6B35';
      default: return '#B0B0B0';
    }
  }, []);

  // Format time ago
  const formatTimeAgo = React.useCallback((timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }, []);

  return {
    liveStats,
    transactions,
    networkActivity,
    wsConnected,
    connectionRetries,
    getTransactionStatusColor,
    formatTimeAgo,
    reconnectWebSocket
  };
}
