import React, { useState } from 'react';
import './App.css';

// Test components one by one
import ErrorBoundary from './components/ErrorBoundary';

function MinimalApp() {
  console.log('🟢 MinimalApp rendering');
  const [step, setStep] = useState(1);
  
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            <h1>Step 1: Basic App Structure ✅</h1>
            <p>App is rendering successfully</p>
            <button 
              onClick={() => setStep(2)}
              style={{ padding: '10px 20px', margin: '10px' }}
            >
              Next: Test ErrorBoundary
            </button>
          </div>
        );
      
      case 2:
        return (
          <ErrorBoundary>
            <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
              <h1>Step 2: ErrorBoundary ✅</h1>
              <p>ErrorBoundary is working</p>
              <button 
                onClick={() => setStep(3)}
                style={{ padding: '10px 20px', margin: '10px' }}
              >
                Next: Test LandingPage Import
              </button>
            </div>
          </ErrorBoundary>
        );
      
      case 3:
        // Test if LandingPage import causes issues
        try {
          const LandingPage = React.lazy(() => import('./components/LandingPage'));
          return (
            <ErrorBoundary>
              <React.Suspense fallback={<div>Loading LandingPage...</div>}>
                <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
                  <h1>Step 3: LandingPage Import Test</h1>
                  <p>LandingPage imported successfully (but not rendered yet)</p>
                  <button 
                    onClick={() => setStep(4)}
                    style={{ padding: '10px 20px', margin: '10px' }}
                  >
                    Next: Render LandingPage
                  </button>
                </div>
              </React.Suspense>
            </ErrorBoundary>
          );
        } catch (error) {
          console.error('❌ LandingPage import failed:', error);
          return (
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
              <h1>❌ LandingPage Import Failed</h1>
              <p>Error: {error.message}</p>
            </div>
          );
        }
      
      case 4:
        const LandingPage = React.lazy(() => import('./components/LandingPage'));
        return (
          <ErrorBoundary>
            <React.Suspense fallback={<div>Loading LandingPage...</div>}>
              <LandingPage 
                onConnectWallet={() => alert('Wallet test')}
                stats={{
                  totalUsers: '1000+',
                  totalInvested: '$1M+',
                  activeProjects: '50+',
                  networkNodes: '100+'
                }}
              />
            </React.Suspense>
          </ErrorBoundary>
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="app">
      {renderStep()}
    </div>
  );
}

export default MinimalApp;
