import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI } from '../contracts-leadfive.js';
import '../styles/ContractIntegration.css';

export default function Register({ account, provider, signer, onConnect, onDisconnect }) {
  const [level, setLevel] = useState(4);
  const [useUSDT, setUseUSDT] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState({ usdt: '0', bnb: '0' });
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  
  const packages = [
    { level: 1, price: 30, priceStr: "$30", name: "Entry Level", subtitle: "Web3 Starter", features: ["Smart contract-executed rewards", "Community governance access", "Decentralized ecosystem entry"] },
    { level: 2, price: 50, priceStr: "$50", name: "Standard", subtitle: "Community Builder", features: ["Enhanced reward distribution", "Advanced governance rights", "Premium community features"] },
    { level: 3, price: 100, priceStr: "$100", name: "Advanced", subtitle: "DAO Contributor", features: ["Maximum earning potential", "DAO voting privileges", "Exclusive ecosystem benefits"] },
    { level: 4, price: 200, priceStr: "$200", name: "Premium", subtitle: "Ecosystem Pioneer", features: ["Elite ecosystem access", "Pioneer governance rights", "Maximum reward multipliers"] }
  ];

  // USDT ABI for token operations
  const USDT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
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
  const loadBalances = async (usdtContract) => {
    if (!account) return;

    try {
      // Get BNB balance
      const bnbBalance = await provider.getBalance(account);
      const bnbFormatted = parseFloat(ethers.formatEther(bnbBalance)).toFixed(4);

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
        bnb: bnbFormatted
      });
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  const handleRegister = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!contract || !usdtContract) {
      alert('Contracts not initialized. Please refresh and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const selectedPackage = packages.find(p => p.level === level);
      console.log(`🚀 Registering with level ${level} (${selectedPackage.priceStr}), pay with ${useUSDT ? 'USDT' : 'BNB'}`);

      let tx;

      if (useUSDT) {
        // USDT payment flow
        const packagePrice = ethers.parseEther(selectedPackage.price.toString());
        
        // Check USDT balance
        const userBalance = await usdtContract.balanceOf(account);
        if (userBalance < packagePrice) {
          alert(`Insufficient USDT balance. Required: ${selectedPackage.price} USDT, Available: ${ethers.formatEther(userBalance)} USDT`);
          return;
        }

        // Check and approve USDT spending
        const allowance = await usdtContract.allowance(account, LEAD_FIVE_CONFIG.address);
        if (allowance < packagePrice) {
          console.log('Approving USDT spending...');
          const approveTx = await usdtContract.approve(LEAD_FIVE_CONFIG.address, packagePrice);
          await approveTx.wait();
          console.log('USDT approval successful');
        }

        // Register with USDT
        console.log('Executing registration with USDT...');
        tx = await contract.register(
          ethers.ZeroAddress, // No referrer for root user
          level,
          true // Use USDT
        );
      } else {
        // BNB payment flow
        // Calculate BNB required (~$300 per BNB as fallback)
        const bnbRequired = ethers.parseEther((selectedPackage.price / 300).toString());
        
        // Check BNB balance
        const userBalance = await provider.getBalance(account);
        if (userBalance < bnbRequired) {
          alert(`Insufficient BNB balance. Required: ${ethers.formatEther(bnbRequired)} BNB, Available: ${ethers.formatEther(userBalance)} BNB`);
          return;
        }

        // Register with BNB
        console.log('Executing registration with BNB...');
        tx = await contract.register(
          ethers.ZeroAddress, // No referrer for root user
          level,
          false, // Use BNB
          { value: bnbRequired }
        );
      }

      console.log('Transaction submitted:', tx.hash);
      console.log('Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('✅ Registration successful!', receipt.hash);
      
      alert(`Registration successful! Transaction: ${receipt.hash}`);
      
      // Reload balances
      await loadBalances(usdtContract);
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed: ';
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
        
        {/* Balance Display */}
        {account && (
          <div className="balance-display">
            <div className="balance-item">
              <span className="balance-label">USDT:</span>
              <span className="balance-value">{balances.usdt}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">BNB:</span>
              <span className="balance-value">{balances.bnb}</span>
            </div>
          </div>
        )}
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
                  <div className="package-price">{pkg.priceStr}</div>
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
              <span>Level {level} ({packages.find(p => p.level === level)?.priceStr})</span>
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
          <button 
            className="btn-register" 
            onClick={handleRegister}
            disabled={isLoading || !account}
          >
            <span className="btn-icon">🚀</span>
            {isLoading ? 'Processing...' : 'Register Now'}
          </button>
          <p className="register-note">
            By registering, you become the foundation of your decentralized network with exclusive benefits and highest earning potential.
          </p>
          
          {!account && (
            <p className="wallet-required">
              Please connect your wallet to continue registration.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
