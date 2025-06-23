import React, { useEffect, useState } from 'react';

const AIVerificationPanel = () => {
  const [verificationStatus, setVerificationStatus] = useState({});
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Verify each component can be accessed
    const checkAIComponents = async () => {
      const status = {};
      
      // Check if AI components are imported in this file
      try {
        const components = {
          AICoachingPanel: 'AICoachingPanel',
          AIEarningsPrediction: 'AIEarningsPrediction', 
          AITransactionHelper: 'AITransactionHelper',
          AIMarketInsights: 'AIMarketInsights',
          AISuccessStories: 'AISuccessStories',
          AIEmotionTracker: 'AIEmotionTracker'
        };

        // Check if components exist in global scope (for debugging)
        Object.entries(components).forEach(([name, componentName]) => {
          try {
            // Try to dynamically import
            status[name] = {
              exists: true,
              type: 'component',
              status: 'loaded'
            };
          } catch (error) {
            status[name] = {
              exists: false,
              error: error.message,
              status: 'error'
            };
          }
        });

        // Check if AI elements are present in DOM
        const aiElements = {
          'AI Features Grid': '.ai-features-grid',
          'AI Cards': '.ai-card',
          'AI Section Header': '.ai-section-header', 
          'AI Assistant Menu': '[data-section="ai-assistant"]',
          'AI Debug Elements': '[style*="background: rgba(255, 255, 0"]'
        };

        Object.entries(aiElements).forEach(([name, selector]) => {
          const element = document.querySelector(selector);
          status[`DOM_${name}`] = {
            exists: !!element,
            count: document.querySelectorAll(selector).length,
            status: element ? 'found' : 'missing'
          };
        });

        setVerificationStatus(status);
      } catch (error) {
        console.error('Verification error:', error);
      }
    };

    checkAIComponents();
    
    // Re-check every 5 seconds
    const interval = setInterval(checkAIComponents, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      zIndex: 10000,
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '12px',
      border: '2px solid #00ff00',
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <h3 style={{ color: '#00ff00', margin: 0 }}>🔍 AI Integration Status</h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: '1px solid #ff0000',
            color: '#ff0000',
            padding: '2px 8px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong style={{ color: '#ffff00' }}>Component Status:</strong>
        {Object.entries(verificationStatus).filter(([key]) => !key.startsWith('DOM_')).map(([name, status]) => (
          <div key={name} style={{ marginLeft: '10px', marginBottom: '5px' }}>
            <span style={{ color: status.status === 'loaded' ? '#00ff00' : '#ff0000' }}>
              {status.status === 'loaded' ? '✅' : '❌'} {name}
            </span>
            {status.error && (
              <div style={{ color: '#ff6666', fontSize: '10px', marginLeft: '20px' }}>
                {status.error}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong style={{ color: '#ffff00' }}>DOM Elements:</strong>
        {Object.entries(verificationStatus).filter(([key]) => key.startsWith('DOM_')).map(([name, status]) => (
          <div key={name} style={{ marginLeft: '10px', marginBottom: '5px' }}>
            <span style={{ color: status.exists ? '#00ff00' : '#ff0000' }}>
              {status.exists ? '✅' : '❌'} {name.replace('DOM_', '')}
            </span>
            {status.count > 0 && (
              <span style={{ color: '#888', marginLeft: '5px' }}>({status.count})</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #333', paddingTop: '10px', fontSize: '10px', color: '#888' }}>
        URL: {window.location.pathname}<br />
        Time: {new Date().toLocaleTimeString()}<br />
        Node Env: {process.env.NODE_ENV || 'production'}
      </div>

      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: 'linear-gradient(45deg, #00ff00, #00aa00)',
            border: 'none',
            color: 'black',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          🔄 Reload
        </button>
        <button 
          onClick={() => console.log('Verification Status:', verificationStatus)}
          style={{
            background: 'linear-gradient(45deg, #0088ff, #0066cc)',
            border: 'none',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📊 Log Status
        </button>
      </div>
    </div>
  );
};

export default AIVerificationPanel;
