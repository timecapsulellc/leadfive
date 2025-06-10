import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import ErrorBoundary from './components/ErrorBoundary'

// Import Web3 Context and Contract Configuration
import { Web3Provider, useWeb3 } from './contexts/Web3Context'
import { ORPHI_CROWDFUND_CONFIG } from './contracts'

// Import the new modular Dashboard
import Dashboard from './components/dashboard/Dashboard'

// Import Logo Test Component
import LogoTest from './LogoTest'

// Simple Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate()
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #00D4FF, #FF6B6B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚀 OrphiChain CrowdFund
        </h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>
          Welcome to the next generation decentralized crowdfunding platform
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/wallet')}
            style={{
              padding: '15px 30px',
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #00D4FF, #0099CC)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔗 Connect Wallet
          </button>
          
          <button 
            onClick={() => navigate('/demo')}
            style={{
              padding: '15px 30px',
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #FF6B6B, #CC5555)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🎮 Try Demo
          </button>
        </div>
        
        <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
          <h3>✨ Features</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <div>💰 Smart Compensation</div>
            <div>🌐 Matrix System</div>
            <div>📊 Real-time Analytics</div>
            <div>🔒 Secure & Transparent</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Wallet Connection Component
const WalletConnection = () => {
  const navigate = useNavigate()
  const { connectWallet, account, isConnecting, networkStatus } = useWeb3()
  
  const handleConnect = async () => {
    try {
      await connectWallet()
      toast.success('Wallet connected successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to connect wallet')
    }
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '40px', 
        borderRadius: '15px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ marginBottom: '30px' }}>🔗 Connect Your Wallet</h2>
        
        {account ? (
          <div>
            <p style={{ color: '#00D4FF', marginBottom: '20px' }}>
              ✅ Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <p style={{ marginBottom: '20px' }}>
              Network: {networkStatus === 'connected' ? '✅ BSC Mainnet' : '⚠️ Wrong Network'}
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '15px 30px',
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #00D4FF, #0099CC)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🚀 Go to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '30px', opacity: 0.9 }}>
              Connect your MetaMask wallet to access the OrphiChain platform
            </p>
            
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              style={{
                padding: '15px 30px',
                fontSize: '1.1rem',
                background: isConnecting ? '#666' : 'linear-gradient(45deg, #00D4FF, #0099CC)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                width: '100%',
                marginBottom: '20px'
              }}
            >
              {isConnecting ? '🔄 Connecting...' : '🦊 Connect MetaMask'}
            </button>
            
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                fontSize: '1rem',
                background: 'transparent',
                border: '1px solid #666',
                borderRadius: '8px',
                color: '#ccc',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              ← Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading Component
const LoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1a2e',
    color: '#00D4FF'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>🔄</div>
      <p style={{ fontSize: '1.2rem' }}>Loading OrphiChain...</p>
    </div>
  </div>
)

function App() {
  console.log('🚀 OrphiChain App rendering...')
  
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingFallback />
  }

  return (
    <Web3Provider>
      <ErrorBoundary>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/wallet" element={<WalletConnection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/demo" element={<Dashboard />} />
            <Route path="/logo-test" element={<LogoTest />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </ErrorBoundary>
    </Web3Provider>
  )
}

export default App
