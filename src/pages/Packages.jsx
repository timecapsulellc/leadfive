import React, { useState } from 'react';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';
import PageWrapper from '../components/PageWrapper';

const packages = [
  { 
    id: 1, 
    name: 'Entry Level', 
    price: 30, 
    color: '#00D4FF', 
    icon: '🚀', 
    subtitle: 'Web3 Starter',
    badge: 'BSC Powered',
    benefits: [
      'Smart contract-executed rewards',
      'Community governance access',
      'Decentralized ecosystem entry',
      'Blockchain transparency',
      'Instant USDT withdrawals'
    ]
  },
  { 
    id: 2, 
    name: 'Standard', 
    price: 50, 
    color: '#7B2CBF', 
    icon: '�', 
    subtitle: 'Community Builder',
    badge: 'BSC Powered',
    benefits: [
      'Enhanced reward distribution',
      'Advanced governance rights',
      'Premium community features',
      'Decentralized earning potential',
      'Priority transaction processing'
    ]
  },
  { 
    id: 3, 
    name: 'Advanced', 
    price: 100, 
    color: '#FF6B35', 
    icon: '🔥', 
    subtitle: 'DAO Contributor',
    badge: 'BSC Powered',
    benefits: [
      'Maximum earning potential',
      'DAO voting privileges',
      'Exclusive ecosystem benefits',
      'Advanced analytics access',
      'VIP support channels'
    ]
  },
  { 
    id: 4, 
    name: 'Premium', 
    price: 200, 
    color: '#FFD700', 
    icon: '👑', 
    subtitle: 'Ecosystem Pioneer',
    badge: 'BSC Powered',
    benefits: [
      'Elite ecosystem access',
      'Pioneer governance rights',
      'Maximum reward multipliers',
      'Exclusive partnership benefits',
      'Direct development team access'
    ]
  }
];

export default function Packages({ account, provider, signer, onConnect, onDisconnect }) {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePurchase = () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    if (!selectedPackage) {
      alert('Please select a package');
      return;
    }
    console.log('Purchasing package:', selectedPackage);
  };

  return (
    <PageWrapper className="packages-page">
      <div className="page-header">
        <h1 className="page-title">LEAD FIVE PARTICIPATION LEVELS</h1>
          <div className="title-underline"></div>
          <p className="page-subtitle">
            Choose your blockchain participation level powered by Binance Smart Chain. All tiers access 
            our decentralized ecosystem with smart contract-executed rewards and community governance.
          </p>
        </div>

        {!account && (
          <div className="page-wallet-connect">
            <UnifiedWalletConnect
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              buttonText="Connect Wallet to Purchase"
            />
          </div>
        )}

        <div className="packages-grid">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
              onClick={() => handlePackageSelect(pkg)}
              style={{ '--package-color': pkg.color }}
            >
              <div className="package-header">
                <div className="package-icon">{pkg.icon}</div>
                <div className="package-price">
                  <span className="currency">$</span>
                  <span className="amount">{pkg.price.toLocaleString()}</span>
                </div>
                <h3 className="package-name">{pkg.name}</h3>
                <p className="package-subtitle">{pkg.subtitle}</p>
                <div className="package-badge">
                  <span className="bsc-icon">⚡</span>
                  <span>{pkg.badge}</span>
                </div>
              </div>
              
              <div className="package-benefits">
                {pkg.benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <span className="benefit-icon">✓</span>
                    <span className="benefit-text">{benefit}</span>
                  </div>
                ))}
              </div>

              <button className="select-package-btn">
                {selectedPackage?.id === pkg.id ? 'Selected' : 'Select Package'}
              </button>
            </div>
          ))}
        </div>

        {selectedPackage && account && (
          <div className="purchase-section">
            <button className="purchase-btn" onClick={handlePurchase}>
              Purchase {selectedPackage.name} Package - ${selectedPackage.price}
            </button>
          </div>
        )}

        <div className="packages-footer">
          <p className="footer-notice">
            All participation levels utilize identical smart contract distribution systems with unstoppable blockchain execution.
          </p>
        </div>
    </PageWrapper>
  );
}
