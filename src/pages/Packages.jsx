import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI } from '../contracts-leadfive.js';
import UnifiedWalletConnect from '../components/unified/UnifiedWalletConnect';
import PageWrapper from '../components/PageWrapper';
import '../styles/ContractIntegration.css';

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
      'Instant USDT withdrawals',
    ],
  },
  {
    id: 2,
    name: 'Standard',
    price: 50,
    color: '#7B2CBF',
    icon: '💎',
    subtitle: 'Community Builder',
    badge: 'BSC Powered',
    benefits: [
      'Enhanced reward distribution',
      'Advanced governance rights',
      'Premium community features',
      'Multi-level earning potential',
      'Priority transaction processing',
    ],
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
      'VIP support channels',
    ],
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
      'Direct development team access',
    ],
  },
];

export default function Packages({
  account,
  provider,
  signer,
  contractInstance,
  onConnect,
  onDisconnect,
}) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [useUSDT, setUseUSDT] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState({ usdt: '0', bnb: '0' });
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);

  // USDT ABI for token operations
  const USDT_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
  ];

  // Initialize contracts when wallet is connected
  useEffect(() => {
    const initContracts = async () => {
      if (!provider || !account) return;

      try {
        // Initialize LeadFive contract
        const leadFiveContract = new ethers.Contract(
          LEAD_FIVE_CONFIG.address,
          LEAD_FIVE_ABI,
          signer
        );
        setContract(leadFiveContract);

        // Initialize USDT contract
        const usdtContract = new ethers.Contract(
          LEAD_FIVE_CONFIG.usdtAddress,
          USDT_ABI,
          signer
        );
        setUsdtContract(usdtContract);

        // Load balances
        await loadBalances(usdtContract);
      } catch (error) {
        console.error('Contract initialization failed:', error);
      }
    };

    initContracts();
  }, [provider, account, signer]);

  // Load user balances
  const loadBalances = async usdtContract => {
    if (!account) return;

    try {
      // Get BNB balance
      const bnbBalance = await provider.getBalance(account);
      const bnbFormatted = parseFloat(ethers.formatEther(bnbBalance)).toFixed(
        4
      );

      // Get USDT balance
      let usdtBalance = '0';
      try {
        const balance = await usdtContract.balanceOf(account);
        usdtBalance = parseFloat(ethers.formatEther(balance)).toFixed(2);
      } catch (err) {
        console.log('Could not fetch USDT balance:', err.message);
      }

      setBalances({
        usdt: usdtBalance,
        bnb: bnbFormatted,
      });
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  const handlePackageSelect = pkg => {
    setSelectedPackage(pkg);
  };

  const handlePurchase = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    if (!selectedPackage) {
      alert('Please select a package');
      return;
    }

    if (!contract || !usdtContract) {
      alert('Contracts not initialized. Please refresh and try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log(
        `🚀 Purchasing package: ${selectedPackage.name} ($${selectedPackage.price}), pay with ${useUSDT ? 'USDT' : 'BNB'}`
      );

      let tx;

      if (useUSDT) {
        // USDT payment flow
        const packagePrice = ethers.parseEther(
          selectedPackage.price.toString()
        );

        // Check USDT balance
        const userBalance = await usdtContract.balanceOf(account);
        if (userBalance < packagePrice) {
          alert(
            `Insufficient USDT balance. Required: ${selectedPackage.price} USDT, Available: ${ethers.formatEther(userBalance)} USDT`
          );
          return;
        }

        // Check and approve USDT spending
        const allowance = await usdtContract.allowance(
          account,
          LEAD_FIVE_CONFIG.address
        );
        if (allowance < packagePrice) {
          console.log('Approving USDT spending...');
          const approveTx = await usdtContract.approve(
            LEAD_FIVE_CONFIG.address,
            packagePrice
          );
          await approveTx.wait();
          console.log('USDT approval successful');
        }

        // Register/purchase with USDT (using register function for package purchase)
        console.log('Executing package purchase with USDT...');
        tx = await contract.register(
          ethers.ZeroAddress, // No referrer for direct purchase
          selectedPackage.id,
          true // Use USDT
        );
      } else {
        // BNB payment flow
        // Calculate BNB required (~$300 per BNB as fallback)
        const bnbRequired = ethers.parseEther(
          (selectedPackage.price / 300).toString()
        );

        // Check BNB balance
        const userBalance = await provider.getBalance(account);
        if (userBalance < bnbRequired) {
          alert(
            `Insufficient BNB balance. Required: ${ethers.formatEther(bnbRequired)} BNB, Available: ${ethers.formatEther(userBalance)} BNB`
          );
          return;
        }

        // Register/purchase with BNB
        console.log('Executing package purchase with BNB...');
        tx = await contract.register(
          ethers.ZeroAddress, // No referrer for direct purchase
          selectedPackage.id,
          false, // Use BNB
          { value: bnbRequired }
        );
      }

      console.log('Transaction submitted:', tx.hash);
      console.log('Waiting for confirmation...');

      const receipt = await tx.wait();
      console.log('✅ Package purchase successful!', receipt.hash);

      alert(`Package purchase successful! Transaction: ${receipt.hash}`);

      // Reload balances
      await loadBalances(usdtContract);
    } catch (error) {
      console.error('Package purchase failed:', error);

      let errorMessage = 'Package purchase failed: ';
      if (error.message.includes('Already registered')) {
        errorMessage += 'Address is already registered';
      } else if (error.message.includes('Insufficient')) {
        errorMessage += 'Insufficient balance';
      } else if (error.message.includes('User rejected')) {
        errorMessage += 'Transaction rejected by user';
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper className="packages-page">
      <div className="page-header">
        <div className="header-icon">🚀</div>
        <h1 className="page-title">LEAD FIVE PARTICIPATION LEVELS</h1>
        <div className="title-underline"></div>
        <p className="page-subtitle">
          <span className="blockchain-icon">🔗</span>
          Choose your blockchain participation level powered by Binance Smart Chain
          <span className="bsc-badge">🔶 BSC</span>. All tiers access our decentralized ecosystem with smart
          contract-executed rewards and community governance.
          <span className="security-icon">🛡️</span>
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

      {/* Balance Display */}
      {account && (
        <div className="balance-display">
          <div className="balance-item">
            <span className="balance-icon">💵</span>
            <span className="balance-label">USDT:</span>
            <span className="balance-value">{balances.usdt}</span>
          </div>
          <div className="balance-item">
            <span className="balance-icon">🔶</span>
            <span className="balance-label">BNB:</span>
            <span className="balance-value">{balances.bnb}</span>
          </div>
        </div>
      )}

      <div className="packages-grid">
        {packages.map(pkg => (
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
                <span className="bsc-icon">🔶</span>
                <span>{pkg.badge}</span>
              </div>
            </div>

            <div className="package-benefits">
              {pkg.benefits.map((benefit, index) => {
                // Smart icon mapping based on benefit content
                let benefitIcon = '✅';
                if (benefit.includes('Smart contract') || benefit.includes('contract-executed')) benefitIcon = '🔒';
                else if (benefit.includes('governance') || benefit.includes('DAO') || benefit.includes('voting')) benefitIcon = '🗳️';
                else if (benefit.includes('Community') || benefit.includes('ecosystem') || benefit.includes('access')) benefitIcon = '🌐';
                else if (benefit.includes('reward') || benefit.includes('earning') || benefit.includes('USDT')) benefitIcon = '💰';
                else if (benefit.includes('transparency') || benefit.includes('Blockchain')) benefitIcon = '🔍';
                else if (benefit.includes('Premium') || benefit.includes('Advanced') || benefit.includes('VIP')) benefitIcon = '⭐';
                else if (benefit.includes('analytics') || benefit.includes('processing')) benefitIcon = '📊';
                else if (benefit.includes('support') || benefit.includes('development')) benefitIcon = '🛠️';
                else if (benefit.includes('Pioneer') || benefit.includes('Elite') || benefit.includes('Maximum')) benefitIcon = '🏆';
                else if (benefit.includes('partnership') || benefit.includes('multipliers')) benefitIcon = '🤝';
                
                return (
                  <div key={index} className="benefit-item">
                    <span className="benefit-icon">{benefitIcon}</span>
                    <span className="benefit-text">{benefit}</span>
                  </div>
                );
              })}
            </div>

            <button className="select-package-btn">
              {selectedPackage?.id === pkg.id ? 'Selected' : 'Select Package'}
            </button>
          </div>
        ))}
      </div>

      {selectedPackage && account && (
        <div className="purchase-section">
          <div className="payment-selection">
            <h3>Payment Method</h3>
            <div className="payment-toggle">
              <button
                className={`payment-btn ${useUSDT ? 'active' : ''}`}
                onClick={() => setUseUSDT(true)}
              >
                <span className="token-icon">💵</span>
                USDT
                <span className="recommended">✨ Recommended</span>
              </button>
              <button
                className={`payment-btn ${!useUSDT ? 'active' : ''}`}
                onClick={() => setUseUSDT(false)}
              >
                <span className="token-icon">🔶</span>
                BNB
                <span className="alt-payment">💨 Fast</span>
              </button>
            </div>
          </div>

          <button
            className="purchase-btn"
            onClick={handlePurchase}
            disabled={isLoading}
          >
            {isLoading
              ? '⏳ Processing...'
              : `🚀 Purchase ${selectedPackage.name} Package - $${selectedPackage.price}`}
          </button>
        </div>
      )}

      <div className="packages-footer">
        <p className="footer-notice">
          <span className="contract-icon">📋</span>
          All participation levels utilize identical smart contract distribution
          systems with unstoppable blockchain execution.
          <span className="shield-icon">🛡️</span>
        </p>
      </div>
    </PageWrapper>
  );
}
