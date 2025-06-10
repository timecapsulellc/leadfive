import React, { useState, useEffect, Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import '../styles/dashboard.css';

/**
 * SafeUnifiedDashboard - Progressive Loading Version
 * 
 * This component loads dashboard components progressively to identify
 * any issues and provide fallbacks for broken components.
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

const SafeUnifiedDashboard = ({ 
  contractAddress,
  provider,
  userAddress,
  demoMode = true,
  theme = 'dark',
  initialView = 'compensation'
}) => {
  console.log('🔒 SafeUnifiedDashboard rendering...');
  
  const [activeTab, setActiveTab] = useState(initialView);
  const [componentStates, setComponentStates] = useState({
    compensation: 'loading',
    orphi: 'loading', 
    matrix: 'loading',
    team: 'loading'
  });

  // Progressive component loading
  useEffect(() => {
    console.log('🔄 Starting progressive component loading...');
    
    // Simulate component readiness check
    const checkComponents = async () => {
      const components = ['compensation', 'orphi', 'matrix', 'team'];
      
      for (const comp of components) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
          setComponentStates(prev => ({ ...prev, [comp]: 'ready' }));
          console.log(`✅ ${comp} component ready`);
        } catch (error) {
          console.error(`❌ ${comp} component failed:`, error);
          setComponentStates(prev => ({ ...prev, [comp]: 'error' }));
        }
      }
    };
    
    checkComponents();
  }, []);

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

      case 'orphi':
        try {
          const OrphiDashboard = React.lazy(() => import('../OrphiDashboard'));
          return (
            <SafeComponentWrapper componentName="OrphiChain Dashboard">
              <OrphiDashboard {...componentProps} />
            </SafeComponentWrapper>
          );
        } catch (error) {
          return <ErrorFallback componentName="OrphiChain Dashboard" error={error} />;
        }

      case 'matrix':
        try {
          const MatrixDashboard = React.lazy(() => import('../MatrixDashboard'));
          return (
            <SafeComponentWrapper componentName="Matrix Dashboard">
              <MatrixDashboard {...componentProps} />
            </SafeComponentWrapper>
          );
        } catch (error) {
          return <ErrorFallback componentName="Matrix Dashboard" error={error} />;
        }

      case 'team':
        try {
          const TeamAnalyticsDashboard = React.lazy(() => import('../TeamAnalyticsDashboard'));
          return (
            <SafeComponentWrapper componentName="Team Analytics Dashboard">
              <TeamAnalyticsDashboard {...componentProps} />
            </SafeComponentWrapper>
          );
        } catch (error) {
          return <ErrorFallback componentName="Team Analytics Dashboard" error={error} />;
        }

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
    fontWeight: 'bold',
    opacity: componentStates[tab] === 'error' ? 0.5 : 1
  });

  const getTabLabel = (tab, label) => {
    const state = componentStates[tab];
    const icon = state === 'loading' ? '🔄' : state === 'error' ? '⚠️' : '✅';
    return `${icon} ${label}`;
  };

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
            🚀 OrphiChain Unified Dashboard
          </h1>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>
            Enhanced Multi-Level Team Visualization & Compensation Analytics
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
            style={getTabStyle('compensation')}
            onClick={() => handleTabChange('compensation')}
          >
            {getTabLabel('compensation', '💰 Compensation')}
          </button>
          <button
            style={getTabStyle('orphi')}
            onClick={() => handleTabChange('orphi')}
          >
            {getTabLabel('orphi', '📊 System Overview')}
          </button>
          <button
            style={getTabStyle('matrix')}
            onClick={() => handleTabChange('matrix')}
          >
            {getTabLabel('matrix', '🌐 Matrix Network')}
          </button>
          <button
            style={getTabStyle('team')}
            onClick={() => handleTabChange('team')}
          >
            {getTabLabel('team', '📈 Team Analytics')}
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
          <div>🔒 Safe Mode: Progressive Loading Enabled</div>
          <div style={{ marginTop: '5px' }}>
            Demo Mode: {demoMode ? '✅ Enabled' : '❌ Disabled'} | 
            Theme: {theme} | 
            Active Tab: {activeTab}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeUnifiedDashboard;
