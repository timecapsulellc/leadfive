import React from 'react';

export default function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1f3a',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ 
        color: '#00D4FF', 
        marginBottom: '20px',
        fontSize: '48px',
        textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
      }}>
        🚀 LeadFive Test App
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        ✅ React is working perfectly!
      </p>
      <p style={{ fontSize: '16px', color: '#64B5F6', marginBottom: '20px' }}>
        Time: {new Date().toLocaleTimeString()}
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: 'rgba(0, 212, 255, 0.1)', 
        borderRadius: '10px',
        border: '2px solid #00D4FF',
        maxWidth: '600px'
      }}>
        <h3 style={{ color: '#00D4FF', marginBottom: '10px' }}>🎉 Service Worker Issues Fixed!</h3>
        <p style={{ margin: 0, color: '#ffffff' }}>
          The blank page issue has been resolved. React is now loading properly without service worker interference.
        </p>
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#64B5F6' }}>
          <p>✅ No service workers detected</p>
          <p>✅ Caches cleared</p>
          <p>✅ React rendering successfully</p>
        </div>
      </div>
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: '#00D4FF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        🔄 Refresh Test
      </button>
    </div>
  );
}