import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/landing.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { account, connectWallet } = useWeb3();

  const handleGetStarted = () => {
    if (!account) {
      connectWallet();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="landing-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      color: '#ffffff',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h1 style={{
            fontSize: '3rem',
            background: 'linear-gradient(45deg, #00D4FF, #00FF88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '20px'
          }}>
            Welcome to OrphiChain
          </h1>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#888',
            marginBottom: '40px'
          }}>
            Decentralized Crowdfunding Platform
          </h2>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(45deg, #00D4FF, #00FF88)',
                color: '#1a1a2e',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
            >
              {account ? 'Go to Dashboard' : 'Connect Wallet'}
            </button>
            <button
              onClick={() => navigate('/demo')}
              style={{
                padding: '15px 30px',
                background: 'transparent',
                color: '#00D4FF',
                border: '2px solid #00D4FF',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Try Demo Dashboard
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px',
          marginBottom: '60px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '30px',
            borderRadius: '15px',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#00D4FF', marginBottom: '15px' }}>🌐 Decentralized</h3>
            <p>Built on blockchain technology for transparency and security</p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '30px',
            borderRadius: '15px',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#00D4FF', marginBottom: '15px' }}>💰 Smart Contracts</h3>
            <p>Automated and secure transactions through smart contracts</p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '30px',
            borderRadius: '15px',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#00D4FF', marginBottom: '15px' }}>📊 Matrix System</h3>
            <p>Advanced matrix-based compensation system</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            color: '#00D4FF',
            marginBottom: '40px'
          }}>
            How It Works
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '30px'
          }}>
            {[
              { step: '1', title: 'Connect Wallet', desc: 'Connect your Web3 wallet to get started' },
              { step: '2', title: 'Join Network', desc: 'Become part of our growing community' },
              { step: '3', title: 'Start Earning', desc: 'Participate in the matrix system' },
              { step: '4', title: 'Track Progress', desc: 'Monitor your earnings and network growth' }
            ].map((item, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '30px',
                borderRadius: '15px',
                border: '1px solid rgba(0, 212, 255, 0.1)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  color: '#00D4FF',
                  fontWeight: 'bold',
                  marginBottom: '15px'
                }}>
                  {item.step}
                </div>
                <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ color: '#888' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
