import React from 'react';

const SimpleDebugApp = () => {
  console.log('🟢 SimpleDebugApp is rendering...');
  
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>🚀 OrphiChain Debug Test</h1>
      <p>✅ React is working perfectly!</p>
      <p>📅 {new Date().toLocaleDateString()}</p>
      <p>⏰ {new Date().toLocaleTimeString()}</p>
      
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h3>🔍 Debug Information</h3>
        <p>✅ Component rendered successfully</p>
        <p>✅ No React Router dependencies</p>
        <p>✅ No useNavigate() calls</p>
      </div>
      
      <button 
        onClick={() => console.log('Button clicked!')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#00D4FF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Click
      </button>
    </div>
  );
};

export default SimpleDebugApp;
