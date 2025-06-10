import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('compensation');
  const [dashboardData, setDashboardData] = useState({
    globalStats: {
      totalUsers: '0',
      totalValueLockedUSDT: '0',
      totalRewardsDistributedUSDT: '0',
      activePools: '0'
    },
    userInfo: {
      id: '0',
      referrer: '0x0000000000000000000000000000000000000000',
      totalDepositsUSDT: '0',
      totalRewardsEarnedUSDT: '0',
      teamSize: '0',
      lastActivityTimestamp: new Date(0).toISOString(),
      isActive: false
    },
    poolBalances: [],
    lastUpdate: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const updateDashboardData = (newData) => {
    setDashboardData(prev => ({
      ...prev,
      ...newData,
      lastUpdate: new Date().toISOString()
    }));
  };

  const value = {
    activeView,
    setActiveView,
    dashboardData,
    setDashboardData,
    updateDashboardData,
    isLoading,
    setIsLoading,
    notifications,
    addNotification
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
