import React from 'react';

const TestComponent = () => {
  console.log('🧪 TestComponent is rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      background: '#1a1a1a', 
      color: '#00D4FF', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🚀 OrphiChain Test Component</h1>
      <p>If you can see this, React is working properly!</p>
      <div style={{ 
        padding: '10px', 
        background: '#333', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <strong>Environment Check:</strong>
        <ul>
          <li>React: ✅ Working</li>
          <li>Vite: ✅ Working</li>
          <li>Module Loading: ✅ Working</li>
        </ul>
      </div>
    </div>
  );
};

export default TestComponent;
