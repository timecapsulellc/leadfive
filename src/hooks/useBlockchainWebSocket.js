import { useState, useEffect, useCallback, useRef } from 'react';
import blockchainWsService from '../services/BlockchainWebSocketService';

/**
 * Custom hook for real-time blockchain data updates
 */
export function useBlockchainWebSocket(userAddress, options = {}) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const unsubscribeRefs = useRef(new Set());

  const {
    autoConnect = true,
    reconnectOnError = true,
    enableLogging = false
  } = options;

  // Update connection status
  useEffect(() => {
    const updateStatus = () => {
      const status = blockchainWsService.getConnectionStatus();
      setConnectionStatus(status.status);
      
      if (enableLogging) {
        console.log('WebSocket status:', status);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [enableLogging]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && userAddress) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userAddress, autoConnect]);

  const connect = useCallback(() => {
    try {
      blockchainWsService.initializeConnection();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to connect to blockchain WebSocket:', err);
    }
  }, []);

  const disconnect = useCallback(() => {
    // Unsubscribe from all subscriptions
    unsubscribeRefs.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (err) {
        console.error('Error unsubscribing:', err);
      }
    });
    unsubscribeRefs.current.clear();
  }, []);

  const refresh = useCallback(() => {
    if (userAddress) {
      blockchainWsService.refreshData(userAddress);
    }
  }, [userAddress]);

  return {
    connectionStatus,
    lastUpdate,
    error,
    connect,
    disconnect,
    refresh,
    isConnected: connectionStatus === 'connected'
  };
}

/**
 * Hook for real-time earnings updates
 */
export function useEarningsUpdates(userAddress, options = {}) {
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);

  const {
    onUpdate = null,
    enableNotifications = true
  } = options;

  useEffect(() => {
    if (!userAddress) return;

    setIsLoading(true);

    const handleEarningsUpdate = (data) => {
      setEarnings(data.earnings);
      setLastUpdate(new Date(data.timestamp));
      setIsLoading(false);

      if (onUpdate) {
        onUpdate(data);
      }

      if (enableNotifications && data.changesSince) {
        // Show notification for significant changes
        if (data.changesSince.totalEarnings > 5) {
          console.log(`Earnings updated: +$${data.changesSince.totalEarnings.toFixed(2)}`);
        }
      }
    };

    // Subscribe to earnings updates
    unsubscribeRef.current = blockchainWsService.subscribeToEarningsUpdates(
      userAddress,
      handleEarningsUpdate
    );

    // Initial load timeout (fallback if no real-time data)
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      clearTimeout(timeout);
    };
  }, [userAddress, onUpdate, enableNotifications, isLoading]);

  const refreshEarnings = useCallback(() => {
    if (userAddress) {
      blockchainWsService.refreshData(userAddress);
    }
  }, [userAddress]);

  return {
    earnings,
    isLoading,
    lastUpdate,
    refreshEarnings
  };
}

/**
 * Hook for real-time tree/network updates
 */
export function useTreeUpdates(rootAddress, options = {}) {
  const [treeData, setTreeData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);

  const {
    onUpdate = null,
    maxActivityItems = 10
  } = options;

  useEffect(() => {
    if (!rootAddress) return;

    setIsLoading(true);

    const handleTreeUpdate = (data) => {
      if (data.changes) {
        setTreeData(prev => ({
          ...prev,
          ...data.changes
        }));
      }

      if (data.recentActivity) {
        setRecentActivity(prev => {
          const newActivity = [...data.recentActivity, ...prev];
          return newActivity.slice(0, maxActivityItems);
        });
      }

      setLastUpdate(new Date(data.timestamp));
      setIsLoading(false);

      if (onUpdate) {
        onUpdate(data);
      }
    };

    // Subscribe to tree updates
    unsubscribeRef.current = blockchainWsService.subscribeToTreeUpdates(
      rootAddress,
      handleTreeUpdate
    );

    // Initial load timeout
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      clearTimeout(timeout);
    };
  }, [rootAddress, onUpdate, maxActivityItems, isLoading]);

  const refreshTree = useCallback(() => {
    if (rootAddress) {
      blockchainWsService.refreshData(rootAddress);
    }
  }, [rootAddress]);

  return {
    treeData,
    recentActivity,
    isLoading,
    lastUpdate,
    refreshTree
  };
}

/**
 * Hook for real-time referral updates
 */
export function useReferralUpdates(userAddress, options = {}) {
  const [referrals, setReferrals] = useState([]);
  const [newReferralCount, setNewReferralCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);

  const {
    onNewReferral = null,
    maxReferrals = 50
  } = options;

  useEffect(() => {
    if (!userAddress) return;

    const handleReferralUpdate = (data) => {
      if (data.type === 'new_referral') {
        const newReferral = {
          id: data.data.transactionHash,
          address: data.data.userAddress,
          package: data.data.package,
          position: data.data.position,
          timestamp: data.data.timestamp,
          status: 'active'
        };

        setReferrals(prev => {
          const updated = [newReferral, ...prev];
          return updated.slice(0, maxReferrals);
        });

        setNewReferralCount(prev => prev + 1);
        setLastUpdate(new Date(data.data.timestamp));

        if (onNewReferral) {
          onNewReferral(newReferral);
        }
      }
    };

    // Subscribe to referral updates
    unsubscribeRef.current = blockchainWsService.subscribeToReferralUpdates(
      userAddress,
      handleReferralUpdate
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userAddress, onNewReferral, maxReferrals]);

  const clearNewReferralCount = useCallback(() => {
    setNewReferralCount(0);
  }, []);

  const refreshReferrals = useCallback(() => {
    if (userAddress) {
      blockchainWsService.refreshData(userAddress);
    }
  }, [userAddress]);

  return {
    referrals,
    newReferralCount,
    lastUpdate,
    clearNewReferralCount,
    refreshReferrals
  };
}

/**
 * Hook for real-time withdrawal updates
 */
export function useWithdrawalUpdates(userAddress, options = {}) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);

  const {
    onWithdrawalUpdate = null
  } = options;

  useEffect(() => {
    if (!userAddress) return;

    const handleWithdrawalUpdate = (data) => {
      if (data.type === 'withdrawal_update') {
        const withdrawal = {
          id: data.data.transactionHash,
          amount: data.data.amount,
          type: data.data.withdrawalType,
          status: 'processed',
          timestamp: data.data.timestamp
        };

        setWithdrawals(prev => [withdrawal, ...prev].slice(0, 20));
        setPendingWithdrawals(prev => Math.max(0, prev - 1));
        setLastUpdate(new Date(data.data.timestamp));

        if (onWithdrawalUpdate) {
          onWithdrawalUpdate(withdrawal);
        }
      }
    };

    // Subscribe to withdrawal updates
    unsubscribeRef.current = blockchainWsService.subscribeToWithdrawalUpdates(
      userAddress,
      handleWithdrawalUpdate
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userAddress, onWithdrawalUpdate]);

  const refreshWithdrawals = useCallback(() => {
    if (userAddress) {
      blockchainWsService.refreshData(userAddress);
    }
  }, [userAddress]);

  return {
    withdrawals,
    pendingWithdrawals,
    lastUpdate,
    refreshWithdrawals
  };
}

/**
 * Hook for real-time network statistics
 */
export function useNetworkStats(options = {}) {
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);

  const {
    onUpdate = null,
    updateInterval = 60000 // 1 minute
  } = options;

  useEffect(() => {
    const handleStatsUpdate = (data) => {
      setStats(data);
      setLastUpdate(new Date(data.timestamp));

      if (onUpdate) {
        onUpdate(data);
      }
    };

    // Subscribe to network stats updates
    unsubscribeRef.current = blockchainWsService.subscribeToUserUpdates(
      'network_stats',
      (event) => {
        if (event.type === 'network_stats') {
          handleStatsUpdate(event.data);
        }
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [onUpdate]);

  const refreshStats = useCallback(() => {
    blockchainWsService.refreshData('network_stats');
  }, []);

  return {
    stats,
    lastUpdate,
    refreshStats
  };
}