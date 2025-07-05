import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg
              width="30"
              height="30"
              viewBox="0 0 400 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="footerGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7b2cbf" />
                  <stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
              </defs>
              <g transform="translate(200, 200) scale(0.8)">
                <path
                  d="M -60,-15 L -30,-60 L 0,-45 Z"
                  fill="url(#footerGradient)"
                />
                <path
                  d="M 30,-60 L 60,-15 L 45,0 Z"
                  fill="url(#footerGradient)"
                />
                <path
                  d="M 60,15 L 30,60 L 0,45 Z"
                  fill="url(#footerGradient)"
                />
                <path
                  d="M -30,60 L -60,15 L -45,0 Z"
                  fill="url(#footerGradient)"
                />
                <path d="M -22,-7 L 0,-45 L 22,7 L 0,45 Z" fill="#16213e" />
              </g>
            </svg>
          </div>
          <span className="footer-brand-name">LeadFive</span>
        </div>

        <div className="footer-info">
          <div className="footer-section">
            <h4>Platform</h4>
            <p>BSC Mainnet</p>
            <p>Smart Contracts</p>
            <p>5x5 Matrix System</p>
          </div>

          <div className="footer-section">
            <h4>Security</h4>
            <p>Hardware Wallet</p>
            <p>PhD Audited</p>
            <p>MEV Protected</p>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>support@leadfive.today</p>
            <p>Telegram Community</p>
            <p>Discord Server</p>
          </div>
        </div>

        <div className="footer-contract">
          <div className="contract-badge">
            <span className="contract-label">Contract:</span>
            <code className="contract-address">0x423f...569</code>
          </div>
          <div className="network-badge">
            <span className="network-indicator">🟢</span>
            <span>BSC Mainnet Active</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LeadFive. All rights reserved.</p>
        <p className="footer-tagline">The Decentralized Incentive Network</p>
      </div>
    </footer>
  );
}
