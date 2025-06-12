import React, { useState, Suspense, memo, useCallback, useEffect } from 'react';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';

// Test with a simple non-lazy component first
import LandingPage from './components/LandingPage';

function AppTest() {
  const [currentView, setCurrentView] = useState('landing');
  const [isLoading, setIsLoading] = useState(false);

  console.log('🟢 AppTest rendering, currentView:', currentView);

  const navigateToLanding = useCallback(() => {
    console.log('🔄 Navigating to landing');
    setCurrentView('landing');
  }, []);

  const navigateToWallet = useCallback(() => {
    console.log('🔄 Navigating to wallet');
    alert('Wallet connection coming soon!');
  }, []);

  const renderCurrentView = () => {
    console.log('🎯 Rendering view:', currentView);
    
    switch(currentView) {
      case 'landing':
        return (
          <div className="view-transition">
            <ErrorBoundary>
              <LandingPage 
                onConnectWallet={navigateToWallet}
                onLearnMore={() => alert('Learn more coming soon!')}
                stats={{
                  totalUsers: '10,000+',
                  totalInvested: '$2.5M+',
                  activeProjects: '150+',
                  networkNodes: '500+'
                }}
              />
            </ErrorBoundary>
          </div>
        );
      default:
        return <div>Unknown view: {currentView}</div>;
    }
  };

  return (
    <div className="app">
      <ErrorBoundary>
        {isLoading ? (
          <div className="global-loading">
            <div className="loading-spinner large"></div>
            <p>Loading OrphiChain...</p>
          </div>
        ) : (
          <main className="main-content">
            <div className={`content-container ${currentView}`}>
              {renderCurrentView()}
            </div>
          </main>
        )}
      </ErrorBoundary>
    </div>
  );
}

export default memo(AppTest);
