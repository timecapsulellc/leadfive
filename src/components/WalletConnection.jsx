import React, { useState, useEffect, useCallback } from 'react';
import OrphiChainLogo from '../OrphiChainLogo';

const WalletConnection = ({ 
  onWalletConnected, 
  onBack, 
  isConnecting = false, 
  error = null,
  onClearError = () => {}
}) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using browser extension',
      isPopular: true,
      check: () => typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Mobile and desktop wallet',
      isPopular: true,
      check: () => typeof window.ethereum !== 'undefined' && window.ethereum.isTrust
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect via QR code',
      isPopular: false,
      check: () => false // Would implement WalletConnect
    },
    {
      id: 'binancechain',
      name: 'Binance Chain',
      icon: '💛',
      description: 'Official Binance wallet',
      isPopular: false,
      check: () => typeof window.BinanceChain !== 'undefined'
    }
  ];

  useEffect(() => {
    checkWalletAvailability();
    checkNetwork();
  }, []);

  const checkWalletAvailability = () => {
    const available = wallets.filter(wallet => wallet.check());
    setHasMetaMask(wallets[0].check());
    
    if (available.length === 0) {
      // No wallets detected
      console.log('No Web3 wallets detected');
    }
  };

  const checkNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      setNetworkStatus('no-ethereum');
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      setAccounts(accounts);
      
      if (chainId === '0x61') { // BSC Testnet
        setNetworkStatus('correct');
      } else {
        setNetworkStatus('wrong-network');
      }
    } catch (error) {
      console.error('Error checking network:', error);
      setNetworkStatus('error');
    }
  };

  const switchToBSCTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }],
      });
      setNetworkStatus('correct');
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x61',
              chainName: 'BSC Testnet',
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              blockExplorerUrls: ['https://testnet.bscscan.com']
            }]
          });
          setNetworkStatus('correct');
        } catch (addError) {
          console.error('Failed to add BSC Testnet:', addError);
        }
      } else {
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  const connectWallet = async (walletId) => {
    if (!hasMetaMask && walletId === 'metamask') {
      window.open('https://metamask.io/', '_blank');
      return;
    }

    setSelectedWallet(walletId);
    onClearError();

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        // Check if we're on BSC Testnet
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (chainId !== '0x61') {
          // Switch to BSC Testnet
          await switchToBSCTestnet();
        }

        // Set up event listeners
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            onBack(); // Disconnected
          } else {
            onWalletConnected(accounts[0], walletId);
          }
        });

        window.ethereum.on('chainChanged', (chainId) => {
          window.location.reload();
        });

        onWalletConnected(accounts[0], walletId);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setSelectedWallet(null);
    }
  };

  const getNetworkStatusDisplay = () => {
    switch (networkStatus) {
      case 'checking':
        return { text: 'Checking network...', color: '#ffa500', icon: '⏳' };
      case 'correct':
        return { text: 'BSC Testnet Connected', color: '#4CAF50', icon: '✅' };
      case 'wrong-network':
        return { text: 'Wrong network detected', color: '#f44336', icon: '⚠️' };
      case 'no-ethereum':
        return { text: 'No Web3 wallet detected', color: '#f44336', icon: '❌' };
      case 'error':
        return { text: 'Network check failed', color: '#f44336', icon: '❌' };
      default:
        return { text: 'Unknown status', color: '#666', icon: '❓' };
    }
  };

  const networkDisplay = getNetworkStatusDisplay();

  return (
    <div className="wallet-connection">
      <div className="connection-container">
        {/* Header */}
        <div className="connection-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          
          <div className="logo-section">
            <OrphiChainLogo size="medium" variant="symbol" />
            <h1>Connect Your Wallet</h1>
            <p>Choose your preferred wallet to access the OrphiChain ecosystem</p>
          </div>
        </div>

        {/* Network Status */}
        <div className={`network-status ${networkStatus}`}>
          <div className="status-content">
            <span className="status-icon">{networkDisplay.icon}</span>
            <span className="status-text">{networkDisplay.text}</span>
            {networkStatus === 'wrong-network' && (
              <button className="switch-network-btn" onClick={switchToBSCTestnet}>
                Switch to BSC Testnet
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={onClearError}>×</button>
          </div>
        )}

        {/* Already Connected */}
        {accounts.length > 0 && networkStatus === 'correct' && (
          <div className="already-connected">
            <div className="connected-info">
              <span className="connected-icon">✅</span>
              <div>
                <div className="connected-title">Wallet Already Connected</div>
                <div className="connected-address">
                  {accounts[0].substring(0, 6)}...{accounts[0].substring(accounts[0].length - 4)}
                </div>
              </div>
            </div>
            <button 
              className="continue-btn"
              onClick={() => onWalletConnected(accounts[0], 'existing')}
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {/* Wallet Options */}
        <div className="wallets-grid">
          {wallets.map((wallet) => {
            const isAvailable = wallet.check();
            const isSelected = selectedWallet === wallet.id;
            const isWalletConnecting = isSelected && isConnecting;

            return (
              <div
                key={wallet.id}
                className={`wallet-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                onClick={() => !isWalletConnecting && connectWallet(wallet.id)}
              >
                {wallet.isPopular && <div className="popular-badge">Popular</div>}
                
                <div className="wallet-icon">{wallet.icon}</div>
                <div className="wallet-info">
                  <h3 className="wallet-name">{wallet.name}</h3>
                  <p className="wallet-description">{wallet.description}</p>
                </div>

                <div className="wallet-status">
                  {isWalletConnecting ? (
                    <div className="connecting-spinner">
                      <div className="spinner"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : !isAvailable ? (
                    <span className="install-text">Install</span>
                  ) : (
                    <span className="connect-text">Connect</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="help-section">
          <h3>Need Help?</h3>
          <div className="help-links">
            <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
              📥 Install MetaMask
            </a>
            <a href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain" target="_blank" rel="noopener noreferrer">
              🔧 Configure BSC Network
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Support coming soon!'); }}>
              🆘 Contact Support
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="notice-icon">🔒</div>
          <div className="notice-content">
            <h4>Your Security Matters</h4>
            <p>
              OrphiChain will never ask for your private keys or seed phrases. 
              Only connect to the official OrphiChain application.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .wallet-connection {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
          color: white;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .connection-container {
          max-width: 600px;
          width: 100%;
          animation: fadeInUp 0.6s ease-out;
        }

        /* Header */
        .connection-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .back-button {
          position: absolute;
          top: 2rem;
          left: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .logo-section h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem 0;
          color: white;
        }

        .logo-section p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          margin-bottom: 0;
        }

        /* Network Status */
        .network-status {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .network-status.correct {
          border-color: rgba(76, 175, 80, 0.3);
          background: rgba(76, 175, 80, 0.1);
        }

        .network-status.wrong-network,
        .network-status.error,
        .network-status.no-ethereum {
          border-color: rgba(244, 67, 54, 0.3);
          background: rgba(244, 67, 54, 0.1);
        }

        .status-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .status-icon {
          font-size: 1.2rem;
        }

        .status-text {
          flex: 1;
          font-weight: 500;
        }

        .switch-network-btn {
          background: linear-gradient(135deg, #00D4FF 0%, #7B2CBF 100%);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: transform 0.2s ease;
        }

        .switch-network-btn:hover {
          transform: translateY(-1px);
        }

        /* Error Message */
        .error-message {
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ff6b6b;
        }

        .error-message button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1.2rem;
          margin-left: auto;
        }

        /* Already Connected */
        .already-connected {
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .connected-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .connected-icon {
          font-size: 1.5rem;
        }

        .connected-title {
          font-weight: 600;
          color: #4CAF50;
        }

        .connected-address {
          font-family: monospace;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .continue-btn {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s ease;
        }

        .continue-btn:hover {
          transform: translateY(-1px);
        }

        /* Wallets Grid */
        .wallets-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .wallet-option {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }

        .wallet-option:hover:not(.unavailable) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.3);
          transform: translateY(-2px);
        }

        .wallet-option.selected {
          border-color: rgba(0, 212, 255, 0.5);
          background: rgba(0, 212, 255, 0.1);
        }

        .wallet-option.unavailable {
          opacity: 0.6;
          cursor: pointer;
        }

        .popular-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: linear-gradient(135deg, #FF6B35 0%, #F44336 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .wallet-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .wallet-info {
          flex: 1;
        }

        .wallet-name {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .wallet-description {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .wallet-status {
          flex-shrink: 0;
        }

        .connecting-spinner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #00D4FF;
          font-size: 0.9rem;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-radius: 50%;
          border-top-color: #00D4FF;
          animation: spin 1s ease-in-out infinite;
        }

        .install-text {
          color: #ffa500;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .connect-text {
          color: #4CAF50;
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Help Section */
        .help-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .help-section h3 {
          margin: 0 0 1rem 0;
          color: white;
          font-size: 1.1rem;
        }

        .help-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .help-links a {
          color: #00D4FF;
          text-decoration: none;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s ease;
        }

        .help-links a:hover {
          color: #7B2CBF;
        }

        /* Security Notice */
        .security-notice {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
        }

        .notice-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .notice-content h4 {
          margin: 0 0 0.5rem 0;
          color: #FFC107;
          font-size: 1rem;
        }

        .notice-content p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .wallet-connection {
            padding: 1rem;
          }

          .back-button {
            position: static;
            margin-bottom: 1rem;
          }

          .logo-section h1 {
            font-size: 2rem;
          }

          .already-connected {
            flex-direction: column;
            text-align: center;
          }

          .help-links {
            flex-direction: column;
          }

          .security-notice {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletConnection;
