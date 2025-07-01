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

  // Define detectWallets function outside useEffect to avoid scope issues
  const detectWallets = useCallback(() => {
    const wallets = [];
    
    // MetaMask detection
    if (window.ethereum?.isMetaMask) {
      wallets.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        installed: true,
        provider: window.ethereum
      });
    }
    
    // Trust Wallet detection
    if (window.ethereum?.isTrust) {
      wallets.push({
        id: 'trust',
        name: 'Trust Wallet',
        icon: '🛡️',
        installed: true,
        provider: window.ethereum
      });
    }
    
    // Generic Ethereum provider
    if (window.ethereum && !window.ethereum.isMetaMask && !window.ethereum.isTrust) {
      wallets.push({
        id: 'injected',
        name: 'Injected Wallet',
        icon: '🔗',
        installed: true,
        provider: window.ethereum
      });
    }
    
    // Add not installed wallets
    if (!wallets.some(w => w.id === 'metamask')) {
      wallets.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        installed: false,
        downloadUrl: 'https://metamask.io/download/'
      });
    }
    
    if (!wallets.some(w => w.id === 'trust')) {
      wallets.push({
        id: 'trust',
        name: 'Trust Wallet',
        icon: '🛡️',
        installed: false,
        downloadUrl: 'https://trustwallet.com/download'
      });
    }

    console.log('🔍 Detected wallets:', wallets);
    setAvailableWallets(wallets);
    setIsDetecting(false);
  }, []);

  // Detect available wallets
  useEffect(() => {
    // Initial detection
    detectWallets();
    
    // Re-detect when ethereum becomes available
    if (window.ethereum) {
      window.ethereum.on('connect', detectWallets);
      return () => window.ethereum.removeListener('connect', detectWallets);
    }
  }, [detectWallets]);

  // Enhanced detection with multiple attempts and better timing
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;
    const baseDelay = 500;

    const attemptDetection = () => {
      attempts++;
      console.log(`🔄 Wallet detection attempt ${attempts}/${maxAttempts}`);
      
      detectWallets();
      
      // Continue trying if no wallets found and we haven't reached max attempts
      if (attempts < maxAttempts && availableWallets.filter(w => w.installed).length === 0) {
        const delay = baseDelay * attempts; // Exponential backoff
        setTimeout(attemptDetection, delay);
      }
    };

    // Initial detection
    attemptDetection();

    // Listen for ethereum injection events
    const handleEthereumAvailable = () => {
      console.log('🔔 Ethereum provider became available, re-detecting...');
      setTimeout(detectWallets, 100);
    };

    // Multiple event listeners for different wallet injection patterns
    window.addEventListener('ethereum#initialized', handleEthereumAvailable);
    window.addEventListener('eip6963:announceProvider', handleEthereumAvailable);
    
    // Also listen for load event in case wallets inject after page load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        setTimeout(detectWallets, 1000);
      });
    }
    
    return () => {
      window.removeEventListener('ethereum#initialized', handleEthereumAvailable);
      window.removeEventListener('eip6963:announceProvider', handleEthereumAvailable);
    };
  }, [detectWallets]);

  const switchToBSC = async (provider) => {
    try {
      console.log('🔄 Switching to BSC Mainnet...');
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_CONFIG.chainId }],
      });
      console.log('✅ Successfully switched to BSC');
    } catch (switchError) {
      console.log('⚠️ Network switch failed, attempting to add BSC:', switchError.code);
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_CONFIG],
          });
          console.log('✅ BSC network added successfully');
        } catch (addError) {
          console.error('❌ Failed to add BSC network:', addError);
          throw new Error('Please add BSC Mainnet to your wallet manually');
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async (walletId) => {
    console.log('🚀 ConnectWallet function called with walletId:', walletId);
    console.log('🔍 Current state - connecting:', connecting, 'selectedWallet:', selectedWallet);
    console.log('🔍 Available onConnect callback:', !!onConnect);
    console.log('🔍 Available wallets:', availableWallets.map(w => ({ id: w.id, name: w.name, installed: w.installed })));
    
    setConnecting(true);
    setSelectedWallet(walletId);
    setError(null);

    try {
      console.log(`🔗 Attempting to connect ${walletId}...`);
      
      const walletInfo = availableWallets.find(w => w.id === walletId);
      
      if (!walletInfo) {
        throw new Error(`Wallet ${walletId} not found`);
      }

      if (!walletInfo.installed) {
        console.log(`📱 Opening download page for ${walletInfo.name}`);
        window.open(walletInfo.downloadUrl, '_blank');
        throw new Error(`${walletInfo.name} is not installed. Please install it first.`);
      }

      const provider = walletInfo.provider;
      if (!provider) {
        throw new Error(`${walletInfo.name} provider not available`);
      }

      console.log('📝 Requesting account access...');
      
      // Request account access with timeout
      const accounts = await Promise.race([
        provider.request({ method: 'eth_requestAccounts' }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        )
      ]);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found or access denied');
      }

      console.log('✅ Account access granted:', accounts[0]);

      // Switch to BSC Mainnet
      await switchToBSC(provider);

      // Create ethers provider
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      console.log('🎉 Wallet connected successfully:', address);
      console.log('📞 Calling onConnect callback with data:', { address, walletType: walletId });

      // Store wallet info
      localStorage.setItem('orphi_wallet', JSON.stringify({
        type: walletId,
        address: address,
        connected: true,
        timestamp: Date.now()
      }));

      // Call parent callback
      if (onConnect) {
        console.log('✅ Executing onConnect callback...');
        onConnect({
          address,
          provider: ethersProvider,
          signer,
          walletType: walletId
        });
      } else {
        console.warn('⚠️ No onConnect callback provided!');
      }

      setShowModal(false);

    } catch (error) {
      console.error(`❌ Error connecting ${walletId}:`, error);
      
      let errorMessage = error.message;
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending. Please check your wallet.';
      } else if (error.code === 4902) {
        errorMessage = 'Please add BSC Mainnet to your wallet';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timed out. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  const disconnectWallet = () => {
    console.log('🔌 Disconnecting wallet...');
    localStorage.removeItem('orphi_wallet');
    if (onDisconnect) {
      onDisconnect();
    }
  };

  // Test connection function for debugging
  const testConnection = () => {
    console.log('🧪 Testing connection callback...');
    if (onConnect) {
      console.log('✅ onConnect callback is available');
      // Test with dummy data
      onConnect({
        address: '0x1234567890123456789012345678901234567890',
        provider: null,
        signer: null,
        walletType: 'test'
      });
    } else {
      console.error('❌ onConnect callback is not available!');
    }
  };

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    const checkStoredConnection = async () => {
      try {
        const storedWallet = localStorage.getItem('orphi_wallet');
        if (storedWallet && !isConnected) {
          const walletData = JSON.parse(storedWallet);
          const timeDiff = Date.now() - walletData.timestamp;
          
          // Auto-reconnect if connection is less than 24 hours old
          if (timeDiff < 24 * 60 * 60 * 1000 && window.ethereum) {
            console.log('🔄 Attempting auto-reconnect...');
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0 && accounts[0].toLowerCase() === walletData.address.toLowerCase()) {
              console.log('✅ Auto-reconnect successful');
              // Trigger connection without showing modal
              connectWallet(walletData.type);
            }
          }
        }
      } catch (error) {
        console.error('❌ Auto-reconnect failed:', error);
      }
    };

    // Check after wallets are detected
    if (!isDetecting && availableWallets.length > 0) {
      checkStoredConnection();
    }
  }, [isDetecting, availableWallets, isConnected]);

  // Ensure modal opens on button click
  const handleOpenModal = () => {
    console.log('🖱️ Connect Wallet button clicked - opening modal');
    console.log('🔍 Current onConnect callback status:', !!onConnect);
    console.log('🔍 Available wallets:', availableWallets.length);
    console.log('🔍 Is detecting wallets:', isDetecting);
    setShowModal(true);
    setError(null);
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
        onClick={handleOpenModal}
        className="connect-wallet-btn"
        disabled={isDetecting}
      >
        {isDetecting ? (
          <>
            <div className="btn-spinner"></div>
            Detecting...
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>

      {/* Enhanced Mobile-Optimized Modal */}
      {showModal && (
        <>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              @keyframes slideUp {
                from { 
                  opacity: 0;
                  transform: translateY(30px) scale(0.95);
                }
                to { 
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              
              /* Hide scrollbar but keep functionality */
              .wallet-modal-content::-webkit-scrollbar {
                width: 0px;
                background: transparent;
              }
            `}
          </style>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              padding: '20px',
              animation: 'fadeIn 0.3s ease-out',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div 
              className="wallet-modal-content"
              style={{
                background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                border: '2px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 212, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                color: 'white',
                position: 'relative',
                animation: 'slideUp 0.3s ease-out',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '16px',
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  margin: 0,
                  background: 'linear-gradient(90deg, #00D4FF, #7B2CBF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Connect Wallet
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <p style={{
                color: '#B8BCC8',
                fontSize: '16px',
                marginBottom: '24px',
                lineHeight: '1.5',
                textAlign: 'center',
              }}>
                Choose your preferred wallet to connect to Lead Five on BSC Mainnet
              </p>

              {/* Detection Status */}
              {isDetecting && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(0, 212, 255, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(0, 212, 255, 0.3)',
                    borderTop: '2px solid #00D4FF',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}></div>
                  <span style={{ color: '#00D4FF', fontWeight: '500' }}>
                    Scanning for installed wallets...
                  </span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div style={{
                  color: '#ff006e',
                  background: 'rgba(255,0,110,0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: '1px solid rgba(255,0,110,0.3)',
                  textAlign: 'center',
                }}>
                  {error}
                </div>
              )}

              {/* Wallet List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px',
              }}>
                {availableWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => wallet.installed ? connectWallet(wallet.id) : window.open(wallet.downloadUrl, '_blank')}
                    disabled={connecting && selectedWallet === wallet.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: wallet.installed 
                        ? 'rgba(0, 212, 255, 0.08)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: wallet.installed 
                        ? '1px solid rgba(0, 212, 255, 0.3)' 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '500',
                      opacity: (connecting && selectedWallet === wallet.id) ? 0.7 : 1,
                      transform: (connecting && selectedWallet === wallet.id) ? 'scale(0.98)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!connecting || selectedWallet !== wallet.id) {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.background = wallet.installed 
                          ? 'rgba(0, 212, 255, 0.15)' 
                          : 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!connecting || selectedWallet !== wallet.id) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = wallet.installed 
                          ? 'rgba(0, 212, 255, 0.08)' 
                          : 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: '600', fontSize: '16px' }}>{wallet.name}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          color: wallet.installed ? '#00D4FF' : '#B8BCC8',
                          opacity: 0.8,
                        }}>
                          {wallet.installed ? 'Ready to connect' : 'Click to install'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {connecting && selectedWallet === wallet.id ? (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}></div>
                      ) : wallet.installed ? (
                        <span style={{ 
                          color: '#00D4FF', 
                          fontSize: '14px',
                          fontWeight: '600',
                        }}>Connect</span>
                      ) : (
                        <span style={{ 
                          color: '#B8BCC8', 
                          fontSize: '14px',
                          fontWeight: '600',
                        }}>Install</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Help Section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <span style={{ fontSize: '16px' }}>💡</span>
                  <span style={{ color: '#B8BCC8', fontSize: '14px' }}>
                    Make sure your wallet is unlocked and ready to connect
                  </span>
                </div>
                
                <details style={{ color: '#B8BCC8', fontSize: '13px' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '8px', fontWeight: '500' }}>
                    Having trouble connecting? Click for help
                  </summary>
                  <ul style={{ paddingLeft: '16px', lineHeight: '1.6', margin: '8px 0' }}>
                    <li>🔓 Ensure your wallet is unlocked</li>
                    <li>🔄 Try refreshing the page</li>
                    <li>🚫 Check for browser popup blockers</li>
                    <li>✅ Make sure you approve the connection request</li>
                    <li>🌐 Switch to BSC Mainnet if prompted</li>
                    <li>📱 On mobile, use your wallet's built-in browser</li>
                  </ul>
                </details>
              </div>

              {/* Footer */}
              <div style={{ 
                textAlign: 'center', 
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}>
                <a 
                  href="https://academy.binance.com/en/articles/how-to-use-metamask" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#00D4FF',
                    textDecoration: 'none',
                    fontSize: '13px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#7B2CBF';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#00D4FF';
                  }}
                >
                  New to wallets? Learn how to get started →
                </a>
              </div>
            </div>
          </div>
        </>
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

        .connect-wallet-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
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