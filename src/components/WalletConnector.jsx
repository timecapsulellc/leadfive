import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Wallet connector icons
const WalletIcons = {
  MetaMask: '🦊',
  TrustWallet: '🛡️',
  WalletConnect: '🔗',
  CoinbaseWallet: '🔵',
  BinanceWallet: '🟡',
  SafePal: '🔐',
  TokenPocket: '💼',
  MathWallet: '🧮'
};

// BSC Mainnet configuration
const BSC_CONFIG = {
  chainId: '0x38',
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

const WalletConnector = ({ onConnect, onDisconnect, currentAccount, isConnected }) => {
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [error, setError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);

  // Enhanced wallet detection
  const detectWallets = useCallback(() => {
    console.log('🔍 Starting wallet detection...');
    setIsDetecting(true);
    
    const wallets = [];

    // Check for MetaMask
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log('✅ MetaMask detected');
      wallets.push({
        name: 'MetaMask',
        id: 'metamask',
        icon: WalletIcons.MetaMask,
        installed: true,
        downloadUrl: 'https://metamask.io/download/',
        provider: window.ethereum
      });
    }

    // Check for Trust Wallet
    if (window.ethereum && window.ethereum.isTrust) {
      console.log('✅ Trust Wallet detected');
      wallets.push({
        name: 'Trust Wallet',
        id: 'trust',
        icon: WalletIcons.TrustWallet,
        installed: true,
        downloadUrl: 'https://trustwallet.com/download',
        provider: window.ethereum
      });
    }

    // Check for Coinbase Wallet
    if (window.ethereum && (window.ethereum.isCoinbaseWallet || window.ethereum.selectedProvider?.isCoinbaseWallet)) {
      console.log('✅ Coinbase Wallet detected');
      wallets.push({
        name: 'Coinbase Wallet',
        id: 'coinbase',
        icon: WalletIcons.CoinbaseWallet,
        installed: true,
        downloadUrl: 'https://wallet.coinbase.com/',
        provider: window.ethereum
      });
    }

    // Check for Binance Wallet
    if (window.BinanceChain) {
      console.log('✅ Binance Wallet detected');
      wallets.push({
        name: 'Binance Wallet',
        id: 'binance',
        icon: WalletIcons.BinanceWallet,
        installed: true,
        downloadUrl: 'https://www.binance.org/en/smartChain',
        provider: window.BinanceChain
      });
    }

    // Generic ethereum provider (if no specific wallet detected)
    if (window.ethereum && wallets.length === 0) {
      console.log('✅ Generic Ethereum provider detected');
      wallets.push({
        name: 'Ethereum Wallet',
        id: 'ethereum',
        icon: WalletIcons.MetaMask,
        installed: true,
        downloadUrl: 'https://metamask.io/download/',
        provider: window.ethereum
      });
    }

    // Always add popular wallets for download if not installed
    const popularWallets = [
      { name: 'MetaMask', id: 'metamask', icon: WalletIcons.MetaMask, downloadUrl: 'https://metamask.io/download/' },
      { name: 'Trust Wallet', id: 'trust', icon: WalletIcons.TrustWallet, downloadUrl: 'https://trustwallet.com/download' },
      { name: 'Coinbase Wallet', id: 'coinbase', icon: WalletIcons.CoinbaseWallet, downloadUrl: 'https://wallet.coinbase.com/' }
    ];

    popularWallets.forEach(wallet => {
      if (!wallets.find(w => w.id === wallet.id)) {
        wallets.push({ ...wallet, installed: false });
      }
    });

    console.log('✅ Final detected wallets:', wallets);
    setAvailableWallets(wallets);
    setIsDetecting(false);
  }, []);

  // Enhanced detection with multiple attempts
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 3;
    const detectInterval = 1000;

    const attemptDetection = () => {
      attempts++;
      console.log(`🔄 Wallet detection attempt ${attempts}/${maxAttempts}`);
      
      detectWallets();
      
      if (attempts < maxAttempts && (!window.ethereum || availableWallets.length === 0)) {
        setTimeout(attemptDetection, detectInterval);
      }
    };

    attemptDetection();

    // Listen for ethereum object injection
    const handleEthereumAvailable = () => {
      console.log('🔔 Ethereum became available, re-detecting...');
      setTimeout(detectWallets, 100);
    };

    window.addEventListener('ethereum#initialized', handleEthereumAvailable);
    window.addEventListener('eip6963:announceProvider', handleEthereumAvailable);
    
    return () => {
      window.removeEventListener('ethereum#initialized', handleEthereumAvailable);
      window.removeEventListener('eip6963:announceProvider', handleEthereumAvailable);
    };
  }, [detectWallets]);

  const switchToBSC = async (provider) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_CONFIG.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_CONFIG],
          });
        } catch (addError) {
          throw new Error('Please add BSC Mainnet to your wallet manually');
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async (walletId) => {
    setConnecting(true);
    setSelectedWallet(walletId);
    setError(null);

    try {
      const walletInfo = availableWallets.find(w => w.id === walletId);
      
      if (!walletInfo) {
        throw new Error(`Wallet ${walletId} not found`);
      }

      if (!walletInfo.installed) {
        window.open(walletInfo.downloadUrl, '_blank');
        throw new Error(`${walletInfo.name} is not installed. Please install it first.`);
      }

      const provider = walletInfo.provider;
      if (!provider) {
        throw new Error(`${walletInfo.name} provider not available`);
      }

      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to BSC Mainnet
      await switchToBSC(provider);

      // Create ethers provider
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      // Store wallet info
      localStorage.setItem('orphi_wallet', JSON.stringify({
        type: walletId,
        address: address,
        connected: true,
        timestamp: Date.now()
      }));

      // Call parent callback
      if (onConnect) {
        onConnect({
          address,
          provider: ethersProvider,
          signer,
          walletType: walletId
        });
      }

      setShowModal(false);

    } catch (error) {
      console.error(`❌ Error connecting ${walletId}:`, error);
      
      let errorMessage = error.message;
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending';
      }
      
      setError(errorMessage);
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('orphi_wallet');
    if (onDisconnect) {
      onDisconnect();
    }
  };

  // Connected state display
  if (isConnected && currentAccount) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="wallet-status">
            <span className="status-text">Connected</span>
            <span className="wallet-address">
              {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
            </span>
            <span className="network-status">BSC Mainnet ✅</span>
          </div>
          <div className="connection-indicator"></div>
        </div>
        <button 
          onClick={disconnectWallet}
          className="disconnect-btn"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="connect-wallet-btn"
      >
        {isDetecting ? 'Detecting...' : 'Connect Wallet'}
      </button>

      {/* Mobile-Optimized Modal */}
      {showModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <h3 className="modal-title">Connect Wallet</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="modal-description">
              Choose your preferred wallet to connect to ORPHI CrowdFund
            </p>

            {/* Detection Status */}
            {isDetecting && (
              <div className="detection-status">
                <div className="loading-spinner"></div>
                <span>Detecting wallets...</span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Wallet List */}
            <div className="wallet-list">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => wallet.installed ? connectWallet(wallet.id) : window.open(wallet.downloadUrl, '_blank')}
                  disabled={connecting && selectedWallet === wallet.id}
                  className={`wallet-option ${!wallet.installed ? 'not-installed' : ''} ${connecting && selectedWallet === wallet.id ? 'connecting' : ''}`}
                >
                  <div className="wallet-info-left">
                    <span className="wallet-icon">{wallet.icon}</span>
                    <div className="wallet-details">
                      <span className="wallet-name">{wallet.name}</span>
                      <span className="wallet-status">
                        {wallet.installed ? 'Ready' : 'Install required'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="wallet-action">
                    {connecting && selectedWallet === wallet.id ? (
                      <div className="connecting-spinner"></div>
                    ) : wallet.installed ? (
                      <span className="connect-text">Connect</span>
                    ) : (
                      <span className="install-text">Install</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Help Section */}
            <div className="help-section">
              <div className="tip-box">
                <span className="tip-icon">💡</span>
                <span>Make sure your wallet is unlocked and on BSC Mainnet</span>
              </div>
              
              <details className="troubleshooting">
                <summary>Having trouble? Click for help</summary>
                <ul className="help-list">
                  <li>Ensure your wallet is unlocked</li>
                  <li>Check for browser popup blockers</li>
                  <li>Try refreshing the page</li>
                  <li>Make sure you approve the connection</li>
                  <li>Switch to BSC Mainnet manually if needed</li>
                </ul>
              </details>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <a 
                href="https://academy.binance.com/en/articles/how-to-use-metamask" 
                target="_blank" 
                rel="noopener noreferrer"
                className="help-link"
              >
                New to wallets? Learn how to get started →
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Connected Wallet Styles */
        .wallet-connected {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .wallet-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .status-text {
          font-size: 12px;
          color: #B8BCC8;
        }

        .wallet-address {
          font-size: 11px;
          font-family: 'Courier New', monospace;
          color: #00D4FF;
          font-weight: 600;
        }

        .network-status {
          font-size: 10px;
          color: #00FF88;
        }

        .connection-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00FF88;
          animation: pulse 2s infinite;
        }

        .disconnect-btn {
          font-size: 11px;
          color: #B8BCC8;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .disconnect-btn:hover {
          color: #fff;
        }

        /* Connect Button */
        .connect-wallet-btn {
          background: linear-gradient(135deg, #00D4FF 0%, #7B2CBF 100%);
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
          white-space: nowrap;
        }

        .connect-wallet-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
        }

        /* Modal Overlay */
        .wallet-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: fadeIn 0.2s ease-out;
        }

        /* Modal Container */
        .wallet-modal {
          background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        /* Modal Header */
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: #B8BCC8;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Modal Description */
        .modal-description {
          color: #B8BCC8;
          font-size: 14px;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        /* Detection Status */
        .detection-status {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 12px;
          margin-bottom: 20px;
          color: #00D4FF;
          font-size: 14px;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-top: 2px solid #00D4FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Error Message */
        .error-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 12px;
          margin-bottom: 20px;
          color: #FF6B6B;
          font-size: 14px;
        }

        .error-icon {
          font-size: 16px;
        }

        /* Wallet List */
        .wallet-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .wallet-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .wallet-option:hover {
          background: rgba(0, 212, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.3);
          transform: translateY(-1px);
        }

        .wallet-option.not-installed {
          border-color: rgba(255, 165, 0, 0.3);
        }

        .wallet-option.not-installed:hover {
          background: rgba(255, 165, 0, 0.1);
          border-color: rgba(255, 165, 0, 0.5);
        }

        .wallet-option.connecting {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .wallet-option:disabled {
          cursor: not-allowed;
        }

        .wallet-info-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .wallet-icon {
          font-size: 32px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wallet-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wallet-name {
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .wallet-status {
          color: #B8BCC8;
          font-size: 12px;
        }

        .wallet-action {
          display: flex;
          align-items: center;
        }

        .connect-text {
          color: #00D4FF;
          font-weight: 600;
          font-size: 14px;
        }

        .install-text {
          color: #FFA500;
          font-weight: 600;
          font-size: 14px;
        }

        .connecting-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-top: 2px solid #00D4FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Help Section */
        .help-section {
          margin-bottom: 20px;
        }

        .tip-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(123, 44, 191, 0.1);
          border: 1px solid rgba(123, 44, 191, 0.3);
          border-radius: 12px;
          margin-bottom: 16px;
          color: #B8BCC8;
          font-size: 13px;
        }

        .tip-icon {
          font-size: 16px;
        }

        .troubleshooting {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
        }

        .troubleshooting summary {
          color: #00D4FF;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .help-list {
          margin: 12px 0 0 0;
          padding: 0 0 0 16px;
          color: #B8BCC8;
          font-size: 13px;
          line-height: 1.6;
        }

        .help-list li {
          margin-bottom: 6px;
        }

        /* Modal Footer */
        .modal-footer {
          text-align: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .help-link {
          color: #00D4FF;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s ease;
        }

        .help-link:hover {
          color: #7B2CBF;
          text-decoration: underline;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
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
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .wallet-modal {
            margin: 8px;
            padding: 20px;
            max-height: 95vh;
            border-radius: 16px;
          }

          .modal-title {
            font-size: 20px;
          }

          .wallet-option {
            padding: 14px;
          }

          .wallet-icon {
            font-size: 28px;
            width: 36px;
            height: 36px;
          }

          .wallet-name {
            font-size: 15px;
          }

          .connect-wallet-btn {
            padding: 10px 20px;
            font-size: 14px;
          }

          .wallet-connected {
            padding: 6px 12px;
          }

          .wallet-address {
            font-size: 10px;
          }

          .status-text {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .wallet-modal-overlay {
            padding: 12px;
          }

          .wallet-modal {
            padding: 16px;
            border-radius: 12px;
          }

          .modal-title {
            font-size: 18px;
          }

          .wallet-option {
            padding: 12px;
          }

          .wallet-info-left {
            gap: 12px;
          }

          .wallet-icon {
            font-size: 24px;
            width: 32px;
            height: 32px;
          }

          .wallet-name {
            font-size: 14px;
          }

          .wallet-status {
            font-size: 11px;
          }

          .connect-text, .install-text {
            font-size: 13px;
          }

          .tip-box {
            padding: 10px 12px;
            font-size: 12px;
          }

          .help-list {
            font-size: 12px;
          }

          .connect-wallet-btn {
            padding: 8px 16px;
            font-size: 13px;
          }

          .wallet-connected {
            gap: 8px;
            padding: 4px 8px;
          }

          .wallet-address {
            font-size: 9px;
          }

          .disconnect-btn {
            font-size: 10px;
          }
        }

        /* Extra small screens */
        @media (max-width: 360px) {
          .modal-title {
            font-size: 16px;
          }

          .wallet-name {
            font-size: 13px;
          }

          .modal-description {
            font-size: 13px;
          }

          .tip-box {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
};

export default WalletConnector; 