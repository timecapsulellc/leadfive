import React from 'react';

function DebugApp() {
  console.log('DebugApp: Component rendering');
  
  return (
    <div style={{ 
      padding: '40px', 
      color: 'white', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #1a1f3a 0%, #0d1117 100%)',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ color: '#00D4FF', fontSize: '3rem', marginBottom: '20px' }}>
        🚀 LeadFive Debug Mode
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
        If you see this, React is working! ✅
      </p>
      
      <div style={{
        background: 'rgba(0, 212, 255, 0.1)',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px 0',
        border: '1px solid rgba(0, 212, 255, 0.3)'
      }}>
        <h3>Checking Dashboard Import...</h3>
        <DashboardImportTest />
      </div>
      
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'left'
      }}>
        <h3>Debug Info:</h3>
        <p>Time: {new Date().toLocaleTimeString()}</p>
        <p>React Version: {React.version}</p>
        <p>Environment: {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
}

function DashboardImportTest() {
  const [dashboardLoaded, setDashboardLoaded] = React.useState(false);
  const [dashboardError, setDashboardError] = React.useState(null);
  const [Dashboard, setDashboard] = React.useState(null);

  React.useEffect(() => {
    console.log('DebugApp: Attempting to import Dashboard...');
    
    import('./pages/Dashboard_AIRA_Advanced')
      .then((module) => {
        console.log('DebugApp: Dashboard import successful');
        setDashboard(() => module.default);
        setDashboardLoaded(true);
      })
      .catch((error) => {
        console.error('DebugApp: Dashboard import error:', error);
        setDashboardError(error.message);
      });
  }, []);

  if (dashboardError) {
    return (
      <div>
        <p style={{color: '#ff6b6b'}}>✗ Dashboard import error:</p>
        <pre style={{
          background: 'rgba(255, 107, 107, 0.1)',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '0.8rem',
          textAlign: 'left'
        }}>
          {dashboardError}
        </pre>
      </div>
    );
  }

  if (!dashboardLoaded) {
    return <p style={{color: '#ffeb3b'}}>⏳ Loading Dashboard...</p>;
  }

  return (
    <div>
      <p style={{color: '#51cf66'}}>✓ Dashboard module loaded successfully!</p>
      <button 
        style={{
          background: '#00D4FF',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
        onClick={() => {
          // Navigate to dashboard test
          window.location.href = '/dashboard-test';
        }}
      >
        Test Dashboard Render
      </button>
    </div>
  );
}

export default DebugApp;
