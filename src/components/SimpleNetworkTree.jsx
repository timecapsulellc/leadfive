import React from 'react';

const SimpleNetworkTree = ({ account }) => {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      background: 'rgba(255,255,255,0.05)', 
      borderRadius: '15px',
      margin: '2rem',
      color: 'white'
    }}>
      <h2>🌐 Your Network Tree</h2>
      <p>Connected Account: {account && typeof account === 'string' ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Not Connected'}</p>
      
      <div style={{ 
        marginTop: '2rem',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* User Node */}
        <div style={{ 
          background: 'linear-gradient(135deg, #7B2CBF, #00D4FF)', 
          padding: '1.5rem', 
          borderRadius: '15px', 
          color: 'white', 
          margin: '1rem',
          minWidth: '200px',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)'
        }}>
          <strong style={{ fontSize: '1.2rem' }}>YOU</strong><br/>
          <span style={{ color: '#FFD700' }}>Level 7</span><br/>
          <span style={{ color: '#00FF88' }}>Premium Package</span><br/>
          <small style={{ opacity: 0.8 }}>Network Leader</small>
        </div>

        {/* Network Stats */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ 
            background: 'rgba(0, 212, 255, 0.1)', 
            padding: '1rem', 
            borderRadius: '10px',
            border: '1px solid rgba(0, 212, 255, 0.3)'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00D4FF' }}>12</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Direct Referrals</div>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 255, 136, 0.1)', 
            padding: '1rem', 
            borderRadius: '10px',
            border: '1px solid rgba(0, 255, 136, 0.3)'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00FF88' }}>45</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Network</div>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 215, 0, 0.1)', 
            padding: '1rem', 
            borderRadius: '10px',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>$2,450</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Earnings</div>
          </div>
        </div>

        <div style={{ 
          marginTop: '3rem', 
          padding: '1rem',
          background: 'rgba(123, 44, 191, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(123, 44, 191, 0.3)'
        }}>
          <p style={{ margin: 0, color: '#7B2CBF', fontWeight: 'bold' }}>
            🚀 Advanced Interactive Tree View Coming Soon!
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
            Your network visualization is being enhanced with real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleNetworkTree;
