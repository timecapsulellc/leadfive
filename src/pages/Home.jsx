import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SecurityBadges from '../components/SecurityBadges';

export default function Home({ account, provider, signer, onConnect, onDisconnect }) {
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleSkipIntro = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  // Auto-hide intro after 5 seconds
  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        handleSkipIntro();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);
  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              color: 'white'
            }}
          >
            <div className="intro-content" style={{ textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: '20px' }}
              >
                <svg width="120" height="120" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="50%" stopColor="#7b2cbf" />
                      <stop offset="100%" stopColor="#ff6b35" />
                    </linearGradient>
                    <linearGradient id="heroDarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a1a2e" />
                      <stop offset="100%" stopColor="#16213e" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(200, 200)">
                    <path d="M -80,-20 L -40,-80 L 0,-60 Z" fill="url(#heroGradient)" />
                    <path d="M -80,-20 L 0,-60 L -30,-10 Z" fill="url(#heroDarkGradient)" opacity="0.7" />
                    <path d="M 40,-80 L 80,-20 L 60,0 Z" fill="url(#heroGradient)" />
                    <path d="M 40,-80 L 60,0 L 0,-60 Z" fill="url(#heroDarkGradient)" opacity="0.7" />
                    <path d="M 80,20 L 40,80 L 0,60 Z" fill="url(#heroGradient)" />
                    <path d="M 80,20 L 0,60 L 30,10 Z" fill="url(#heroDarkGradient)" opacity="0.7" />
                    <path d="M -40,80 L -80,20 L -60,0 Z" fill="url(#heroGradient)" />
                    <path d="M -40,80 L -60,0 L 0,60 Z" fill="url(#heroDarkGradient)" opacity="0.7" />
                    <path d="M -30,-10 L 0,-60 L 30,10 L 0,60 Z" fill="#16213e" />
                  </g>
                </svg>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: '3rem', margin: '20px 0', background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                LeadFive
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.8 }}
              >
                BLOCKCHAIN PLATFORM
              </motion.p>
              <motion.button
                className="skip-intro-btn"
                onClick={handleSkipIntro}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Skip Intro →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-hero">
            <svg width="120" height="120" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7b2cbf" />
                  <stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
                <linearGradient id="heroDarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#16213e" />
                </linearGradient>
              </defs>
              <g transform="translate(200, 200)">
                <path d="M -80,-20 L -40,-80 L 0,-60 Z" fill="url(#heroGradient)" />
                <path d="M -80,-20 L 0,-60 L -30,-10 Z" fill="url(#heroDarkGradient)" opacity="0.7" />
                <path d="M 40,-80 L 80,-20 L 60,0 Z" fill="url(#heroGradient)" />
                <path d="M 40,-80 L 60,0 L 0,-60 Z" fill="url(#heroDarkGradient)" opacity="0.7" />
                <path d="M 80,20 L 40,80 L 0,60 Z" fill="url(#heroGradient)" />
                <path d="M 80,20 L 0,60 L 30,10 Z" fill="url(#heroDarkGradient)" opacity="0.7" />
                <path d="M -40,80 L -80,20 L -60,0 Z" fill="url(#heroGradient)" />
                <path d="M -40,80 L -60,0 L 0,60 Z" fill="url(#heroDarkGradient)" opacity="0.7" />
                <path d="M -30,-10 L 0,-60 L 30,10 L 0,60 Z" fill="#16213e" />
              </g>
            </svg>
          </div>
          <h1 className="hero-title">Welcome to LeadFive</h1>
          <p className="hero-subtitle">The Decentralized Incentive Platform</p>
          <p className="hero-description">
            Experience the future of decentralized networking with our revolutionary incentive system. 
            Built on BSC with complete transparency, security, and automated smart contracts.
          </p>
          
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/brand-guide" className="btn-secondary">Learn More</Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose LeadFive?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Trezor Secured</h3>
            <p>Hardware wallet control for maximum security and user protection</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>MEV Protected</h3>
            <p>Anti-bot transaction security prevents manipulation and ensures fairness</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>PhD Audited</h3>
            <p>Expert security verification ensures code integrity and reliability</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>DoS Resistant</h3>
            <p>Spam & attack protection maintains platform stability and performance</p>
          </div>
        </div>
      </div>

      <SecurityBadges />
      
      <div className="stats-section">
        <h2>Platform Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">3,905</div>
            <div className="stat-label">Max USDT per Cycle</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">Network</div>
            <div className="stat-label">Incentive System</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-label">Transparent</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
