import React from 'react';

function SimpleAppTest() {
  console.log('🟢 SimpleAppTest rendering...');
  
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: '#1a1a1a',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#00D4FF' }}>🚀 OrphiChain Loading Test</h1>
      <p>✅ Basic React app is working!</p>
      
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid #00D4FF',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h3>Status Check</h3>
        <p>✅ React renders correctly</p>
        <p>✅ No Router dependencies</p>
        <p>✅ Simple component structure</p>
      </div>
    </div>
  );
}

export default SimpleAppTest;
