import React, { useState, useEffect, Suspense } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import ErrorBoundary from '../ErrorBoundary';
import '../styles/dashboard.css';

/**
 * UnifiedDashboard - Main Dashboard Component
 * 
 * This component provides a unified interface for all dashboard features
 * with progressive loading and error handling.
 */

const LoadingFallback = ({ componentName }) => (
  <div style={{ 
    padding: '20px', 
    background: 'rgba(0, 212, 255, 0.1)', 
    borderRadius: '10px',
    border: '2px solid #00D4FF',
    textAlign: 'center',
    color: '#00D4FF'
  }}>
    <div>🔄 Loading {componentName}...</div>
  </div>
);

const ErrorFallback = ({ componentName, error }) => (
  <div style={{ 
    padding: '20px', 
    background: 'rgba(255, 107, 53, 0.1)', 
    borderRadius: '10px',
    border: '2px solid #FF6B35',
    textAlign: 'center',
    color: '#FF6B35'
  }}>
    <div>⚠️ Error loading {componentName}</div>
    <div style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.8 }}>
      {error?.message || 'Unknown error'}
    </div>
  </div>
);

const SafeComponentWrapper = ({ children, componentName }) => (
  <ErrorBoundary
    fallback={<ErrorFallback componentName={componentName} />}
  >
    <Suspense fallback={<LoadingFallback componentName={componentName} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const UnifiedDashboard = ({ 
  contractAddress,
  provider,
  userAddress,
  demoMode = true,
  theme = 'dark',
  initialView = 'overview'
}) => {
  console.log('🚀 UnifiedDashboard rendering...');
  
  const { isLoading, globalStats, userInfo } = useDashboard();
  const [activeTab, setActiveTab] = useState(initialView);

  const handleTabChange = (tab) => {
    console.log(`🔄 Switching to tab: ${tab}`);
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    const componentProps = {
      contractAddress,
      provider,
      userAddress,
      demoMode,
      theme
    };

    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '10px',
            color: '#00D4FF'
          }}>
            <h2>🚀 OrphiChain Dashboard Overview</h2>
            <div style={{ marginTop: '20px' }}>
              <p>Total Users: {globalStats?.totalUsers || 'Loading...'}</p>
              <p>Your Level: {userInfo?.level || 'N/A'}</p>
              <p>Demo Mode: {demoMode ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        );

      case 'compensation':
        try {
          const CompensationDashboard = React.lazy(() => import('./compensation/CompensationDashboard'));
          return (
            <SafeComponentWrapper componentName="Compensation Dashboard">
              <CompensationDashboard {...componentProps} />
            </SafeComponentWrapper>
          );
        } catch (error) {
          return <ErrorFallback componentName="Compensation Dashboard" error={error} />;
        }

      case 'analytics':
        return (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '10px',
            color: '#00D4FF'
          }}>
            <h2>📊 Analytics Dashboard</h2>
            <p>Analytics features coming soon...</p>
          </div>
        );

      default:
        return (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '10px',
            color: '#00D4FF'
          }}>
            <h2>🚀 OrphiChain Dashboard</h2>
            <p>Select a dashboard type from the tabs above</p>
          </div>
        );
    }
  };

  const getTabStyle = (tab) => ({
    padding: '12px 24px',
    background: activeTab === tab ? '#00D4FF' : 'transparent',
    color: activeTab === tab ? '#1a1a2e' : '#00D4FF',
    border: '2px solid #00D4FF',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '0 8px',
    fontWeight: 'bold'
  });

  if (isLoading) {
    return <LoadingFallback componentName="Dashboard" />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      color: '#ffffff',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            background: 'linear-gradient(45deg, #00D4FF, #00FF88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            🚀 OrphiChain Dashboard
          </h1>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>
            Comprehensive Multi-Level System Management
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            style={getTabStyle('overview')}
            onClick={() => handleTabChange('overview')}
          >
            📊 Overview
          </button>
          <button
            style={getTabStyle('compensation')}
            onClick={() => handleTabChange('compensation')}
          >
            💰 Compensation
          </button>
          <button
            style={getTabStyle('analytics')}
            onClick={() => handleTabChange('analytics')}
          >
            📈 Analytics
          </button>
        </div>

        {/* Dashboard Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          {renderTabContent()}
        </div>

        {/* Status Footer */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '0.9rem',
          opacity: 0.7
        }}>
          <div>
            Demo Mode: {demoMode ? '✅ Enabled' : '❌ Disabled'} | 
            Theme: {theme} | 
            Active Tab: {activeTab}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;