import React from 'react';
import { Link } from 'react-router-dom';
import SecurityBadges from '../components/SecurityBadges';

export default function Home({ account, provider, signer, onConnect, onDisconnect }) {
  return (
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
  );
}
