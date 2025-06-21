import React, { useState } from 'react';

export default function Register({ account, provider, signer, onConnect, onDisconnect }) {
  const [level, setLevel] = useState(4);
  const [useUSDT, setUseUSDT] = useState(true);
  
  const packages = [
    { level: 1, price: "$30", name: "Entry Level", subtitle: "Web3 Starter", features: ["Smart contract-executed rewards", "Community governance access", "Decentralized ecosystem entry"] },
    { level: 2, price: "$50", name: "Standard", subtitle: "Community Builder", features: ["Enhanced reward distribution", "Advanced governance rights", "Premium community features"] },
    { level: 3, price: "$100", name: "Advanced", subtitle: "DAO Contributor", features: ["Maximum earning potential", "DAO voting privileges", "Exclusive ecosystem benefits"] },
    { level: 4, price: "$200", name: "Premium", subtitle: "Ecosystem Pioneer", features: ["Elite ecosystem access", "Pioneer governance rights", "Maximum reward multipliers"] }
  ];

  const handleRegister = () => {
    console.log(`Registering with level ${level}, pay with ${useUSDT ? 'USDT' : 'BNB'}`);
  };

  return (
    <main className="register-page">
      <div className="register-hero">
        <div className="hero-icon">
          <svg width="80" height="80" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="registerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="50%" stopColor="#7b2cbf" />
                <stop offset="100%" stopColor="#ff6b35" />
              </linearGradient>
            </defs>
            <g transform="translate(200, 200)">
              <path d="M -60,-15 L -30,-60 L 0,-45 Z" fill="url(#registerGradient)" />
              <path d="M 30,-60 L 60,-15 L 45,0 Z" fill="url(#registerGradient)" />
              <path d="M 60,15 L 30,60 L 0,45 Z" fill="url(#registerGradient)" />
              <path d="M -30,60 L -60,15 L -45,0 Z" fill="url(#registerGradient)" />
              <path d="M -22,-7 L 0,-45 L 22,7 L 0,45 Z" fill="#16213e" />
            </g>
          </svg>
        </div>
        <h1>Register as Root User</h1>
        <p>Connect your business wallet and become User ID #1</p>
        <div className="root-user-badge">
          <span className="badge-icon">👑</span>
          <span>Exclusive Root User Position</span>
        </div>
      </div>

      <div className="register-content">
        <div className="package-selection">
          <h2>Choose Your Package Level</h2>
          <div className="packages-grid">
            {packages.map((pkg) => (
              <div 
                key={pkg.level}
                className={`package-card ${level === pkg.level ? 'selected' : ''}`}
                onClick={() => setLevel(pkg.level)}
              >
                <div className="package-header">
                  <h3>{pkg.name}</h3>
                  <p className="package-subtitle">{pkg.subtitle}</p>
                  <div className="package-price">{pkg.price}</div>
                </div>
                <div className="package-features">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-check">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
                {level === pkg.level && (
                  <div className="selected-indicator">
                    <span>Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="payment-selection">
          <h3>Payment Token</h3>
          <div className="payment-toggle">
            <button
              className={`payment-btn ${useUSDT ? 'active' : ''}`}
              onClick={() => setUseUSDT(true)}
            >
              <span className="token-icon">💰</span>
              USDT
              <span className="recommended">Recommended</span>
            </button>
            <button
              className={`payment-btn ${!useUSDT ? 'active' : ''}`}
              onClick={() => setUseUSDT(false)}
            >
              <span className="token-icon">🔶</span>
              BNB
            </button>
          </div>
        </div>

        <div className="register-summary">
          <div className="summary-card">
            <h3>Registration Summary</h3>
            <div className="summary-item">
              <span>Package:</span>
              <span>Level {level} ({packages.find(p => p.level === level)?.price})</span>
            </div>
            <div className="summary-item">
              <span>Payment:</span>
              <span>{useUSDT ? 'USDT' : 'BNB'}</span>
            </div>
            <div className="summary-item">
              <span>Position:</span>
              <span className="root-position">Root User (ID #1)</span>
            </div>
          </div>
        </div>

        <div className="register-actions">
          <button className="btn-register" onClick={handleRegister}>
            <span className="btn-icon">🚀</span>
            Register Now
          </button>
          <p className="register-note">
            By registering, you become the foundation of your decentralized network with exclusive benefits and highest earning potential.
          </p>
        </div>
      </div>
    </main>
  );
}
