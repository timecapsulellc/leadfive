import React, { useState } from 'react';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';
import SecurityBadges from '../components/SecurityBadges';

const securityFeatures = [
  {
    id: 1,
    icon: '🔐',
    title: 'Multi-Signature Security',
    description: 'Advanced multi-signature wallet protection with hardware key integration',
    details: ['Trezor hardware wallet support', 'Cold storage integration', 'Multi-layer encryption', '24/7 monitoring']
  },
  {
    id: 2,
    icon: '🛡️',
    title: 'MEV Protection',
    description: 'Advanced protection against front-running and sandwich attacks',
    details: ['Anti-bot transaction security', 'Private mempool integration', 'Real-time threat detection', 'Automated protection']
  },
  {
    id: 3,
    icon: '🔍',
    title: 'Smart Contract Audits',
    description: 'PhD-level security audits by leading blockchain security experts',
    details: ['Formal verification methods', 'Comprehensive code review', 'Third-party audits', 'Regular security updates']
  },
  {
    id: 4,
    icon: '🚀',
    title: 'DoS Protection',
    description: 'Enterprise-grade protection against denial-of-service attacks',
    details: ['Rate limiting protocols', 'Traffic analysis', 'Auto-scaling protection', 'Emergency protocols']
  },
  {
    id: 5,
    icon: '💎',
    title: 'Insurance Coverage',
    description: 'Full insurance coverage for smart contract vulnerabilities',
    details: ['Up to $10M coverage', 'Smart contract insurance', 'User fund protection', 'Instant claims processing']
  },
  {
    id: 6,
    icon: '⚡',
    title: 'Real-time Monitoring',
    description: '24/7 security monitoring with instant threat response',
    details: ['Live transaction monitoring', 'Anomaly detection', 'Instant alerts', 'Emergency response team']
  }
];

const certifications = [
  { name: 'SOC 2 Type II', status: 'Certified', icon: '🏆' },
  { name: 'ISO 27001', status: 'Certified', icon: '🛡️' },
  { name: 'CertiK Audit', status: 'AAA Rating', icon: '⭐' },
  { name: 'Quantstamp', status: 'Verified', icon: '✅' }
];

export default function Security({ account, provider, signer, onConnect, onDisconnect }) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className="security-page">
      <div className="page-background">
        <div className="animated-bg"></div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Security & Trust</h1>
          <p className="page-subtitle">Bank-grade security powered by cutting-edge blockchain technology</p>
        </div>

        {!account && (
          <div className="wallet-connect-section">
            <UnifiedWalletConnect
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              buttonText="Connect Wallet for Security Dashboard"
            />
          </div>
        )}

        {account && (
          <div className="security-dashboard">
            <div className="security-status-card">
              <h3>Security Status</h3>
              <div className="status-indicator active">
                <span className="status-icon">🟢</span>
                <span>All Systems Secure</span>
              </div>
              <p>Wallet: {account.slice(0, 6)}...{account.slice(-4)}</p>
            </div>
          </div>
        )}

        <div className="security-badges-section">
          <h2>Core Security Features</h2>
          <SecurityBadges />
        </div>

        <div className="security-features-grid">
          {securityFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`security-feature-card ${selectedFeature?.id === feature.id ? 'selected' : ''}`}
              onClick={() => setSelectedFeature(selectedFeature?.id === feature.id ? null : feature)}
            >
              <div className="feature-header">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
              </div>
              <p className="feature-description">{feature.description}</p>
              
              {selectedFeature?.id === feature.id && (
                <div className="feature-details">
                  <h4>Key Features:</h4>
                  <ul>
                    {feature.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="certifications-section">
          <h2>Security Certifications</h2>
          <div className="certifications-grid">
            {certifications.map((cert, index) => (
              <div key={index} className="certification-card">
                <div className="cert-icon">{cert.icon}</div>
                <h4>{cert.name}</h4>
                <span className="cert-status">{cert.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="security-info-section">
          <div className="info-card">
            <h3>🔒 Your Security is Our Priority</h3>
            <p>LeadFive employs the highest standards of blockchain security, with multiple layers of protection to ensure your investments and personal data remain safe.</p>
          </div>
          
          <div className="info-card">
            <h3>📞 24/7 Security Support</h3>
            <p>Our security team monitors the platform around the clock. If you notice any suspicious activity, contact our security hotline immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
