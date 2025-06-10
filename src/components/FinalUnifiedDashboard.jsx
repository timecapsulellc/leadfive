import React, { useState, useEffect, Suspense } from 'react';
import DashboardController from './DashboardController';
import ErrorBoundary from '../ErrorBoundary';
import '../styles/dashboard.css';

/**
 * FinalUnifiedDashboard - Production-Ready Unified Dashboard System
 * 
 * This is the final production version that combines:
 * - Enhanced CompensationDashboard (v2 with UI/UX improvements) 
 * - MatrixDashboard (v1 matrix visualization)
 * - OrphiDashboard (v1 system overview)
 * - TeamAnalyticsDashboard (v1 team analytics)
 * 
 * Features:
 * - Seamless integration without breaking existing code
 * - Consistent data flow between all dashboard types
 * - Responsive design that works on all devices
 * - Error boundaries for resilient component loading
 * - Progressive enhancement and fallback states
 * - Enhanced debugging and monitoring
 */

const FinalUnifiedDashboard = ({ 
  contractAddress,
  provider,
  userAddress,
  demoMode = false,
  theme = 'dark',
  initialView = 'compensation'
}) => {
  console.log('🎯 FinalUnifiedDashboard rendering with props:', { demoMode, theme, initialView });
  
  // App-level state
  const [isReady, setIsReady] = useState(false);
  const [appError, setAppError] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchEnabled: false
  });

  // Device detection for responsive behavior
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const newDeviceInfo = {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        touchEnabled,
        width,
        height
      };
      
      console.log('📱 Device detected:', newDeviceInfo);
      setDeviceInfo(newDeviceInfo);
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing FinalUnifiedDashboard...');
        
        // Simulate initialization process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsReady(true);
        console.log('✅ FinalUnifiedDashboard initialization complete');
      } catch (error) {
        console.error('❌ FinalUnifiedDashboard initialization failed:', error);
        setAppError(error);
      }
    };

    initializeApp();
  }, []);

  // Loading state
  if (!isReady && !appError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00D4FF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h2>OrphiChain Dashboard Loading...</h2>
          <div style={{ 
            marginTop: '20px',
            padding: '10px 20px',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '20px',
            border: '1px solid #00D4FF'
          }}>
            Initializing Enhanced Multi-Level Dashboard System
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (appError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FF6B35'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2>Dashboard Initialization Error</h2>
          <div style={{ 
            marginTop: '20px',
            padding: '20px',
            background: 'rgba(255, 107, 53, 0.1)',
            borderRadius: '10px',
            border: '1px solid #FF6B35',
            textAlign: 'left'
          }}>
            <strong>Error:</strong> {appError.message || 'Unknown error occurred'}
            <br /><br />
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 Reload Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="unified-dashboard-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      color: '#ffffff'
    }}>
      <ErrorBoundary>
        <Suspense fallback={
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#00D4FF'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <h3>Loading Dashboard Components...</h3>
          </div>
        }>
          <DashboardController 
            contractAddress={contractAddress}
            provider={provider}
            userAddress={userAddress}
            demoMode={demoMode}
            theme={theme}
            initialTab={initialView}
            deviceInfo={deviceInfo}
          />
        </Suspense>
      </ErrorBoundary>
      
      {/* Debug info for development */}
      {demoMode && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '5px',
          fontSize: '0.8rem',
          color: '#888',
          zIndex: 1000
        }}>
          <div>🔧 Debug Mode</div>
          <div>Device: {deviceInfo.isMobile ? '📱' : deviceInfo.isTablet ? '📱' : '💻'}</div>
          <div>Screen: {deviceInfo.width}x{deviceInfo.height}</div>
          <div>Touch: {deviceInfo.touchEnabled ? '✅' : '❌'}</div>
        </div>
      )}
    </div>
  );
};

export default FinalUnifiedDashboard;
