import React from 'react';

const TestWelcome = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>LEAD FIVE TODAY</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>The Decentralized Incentive Network</p>
      <button 
        onClick={() => window.location.href = '/home'}
        style={{
          background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '25px',
          fontSize: '1.2rem',
          cursor: 'pointer'
        }}
      >
        Enter DApp
      </button>
    </div>
  );
};

export default TestWelcome;
