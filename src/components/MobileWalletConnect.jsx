/**
 * Mobile-Optimized Wallet Connection Component
 * Handles mobile wallet connections with proper deep linking and UX
 */

import React, { useState, useEffect } from 'react';
import useMobileWallet from '../hooks/useMobileWallet';
import './MobileWalletConnect.css';

const MobileWalletConnect = ({ onConnect, onDisconnect, account: externalAccount }) => {
  const {
    isConnecting,
    account,
    provider,
    signer,
    error,
    isMobile,
    walletType,
    connect,
    disconnect,
    generateDeepLink,
    canConnect
  } = useMobileWallet();

  const [showInstructions, setShowInstructions] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Sync with parent component
  useEffect(() => {
    if (account && provider && signer && onConnect) {
      onConnect(account, provider, signer);
    }
  }, [account, provider, signer, onConnect]);

  useEffect(() => {
    if (!account && onDisconnect) {
      onDisconnect();
    }
  }, [account, onDisconnect]);

  // Handle connection with retry logic
  const handleConnect = async () => {
    try {
      setRetryCount(0);
      if (isMobile) {
        await connect();
      } else {
        // Desktop connection - use parent onConnect
        if (onConnect) {
          onConnect();
        }
      }
    } catch (error) {
      console.error('Connection failed:', error);
      
      // Show instructions for mobile users
      if (isMobile && !window.ethereum) {
        setShowInstructions(true);
      } else if (retryCount < 3 && isMobile) {
        // Auto-retry for mobile errors only
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleConnect();
        }, 2000);
      }
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    setShowInstructions(false);
    setRetryCount(0);
  };

  // Mobile wallet installation instructions
  const WalletInstructions = () => (
    <div className="wallet-instructions">
      <div className="instructions-content">
        <h3>🔗 Connect Your Mobile Wallet</h3>
        <p>To access LeadFive, you need a mobile crypto wallet:</p>
        
        <div className="wallet-options">
          <div className="wallet-option" onClick={() => {
            const link = generateDeepLink('metamask');
            if (link) window.location.href = link;
          }}>
            <div className="wallet-icon">🦊</div>
            <div className="wallet-info">
              <h4>MetaMask</h4>
              <p>Most popular Web3 wallet</p>
            </div>
            <button className="wallet-button">Open MetaMask</button>
          </div>

          <div className="wallet-option" onClick={() => {
            const link = generateDeepLink('trust');
            if (link) window.location.href = link;
          }}>
            <div className="wallet-icon">🛡️</div>
            <div className="wallet-info">
              <h4>Trust Wallet</h4>
              <p>Secure mobile wallet</p>
            </div>
            <button className="wallet-button">Open Trust Wallet</button>
          </div>
        </div>

        <div className="manual-instructions">
          <h4>📱 Manual Steps:</h4>
          <ol>
            <li>Download MetaMask or Trust Wallet from your app store</li>
            <li>Create or import your wallet</li>
            <li>Open the wallet app</li>
            <li>Navigate to Browser/DApps section</li>
            <li>Visit: <code>{window.location.host}</code></li>
          </ol>
        </div>

        <button 
          className="close-instructions"
          onClick={() => setShowInstructions(false)}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Loading state
  if (isConnecting) {
    return (
      <div className="mobile-wallet-connect connecting">
        <div className="loading-spinner"></div>
        <p>Connecting to your wallet...</p>
        {retryCount > 0 && <p className="retry-info">Retry attempt {retryCount}/3</p>}
      </div>
    );
  }

  // Connected state
  if (account || externalAccount) {
    const displayAccount = account || externalAccount;
    return (
      <div className="mobile-wallet-connect connected">
        <div className="wallet-info">
          <div className="wallet-avatar">
            {walletType === 'metamask' ? '🦊' : 
             walletType === 'trust' ? '🛡️' : '💼'}
          </div>
          <div className="wallet-details">
            <p className="wallet-type">
              {walletType === 'metamask' ? 'MetaMask' :
               walletType === 'trust' ? 'Trust Wallet' :
               isMobile ? 'Mobile Wallet' : 'Connected Wallet'}
            </p>
            <p className="wallet-address">
              {typeof displayAccount === 'string' && displayAccount.length > 10
                ? `${displayAccount.substring(0, 6)}...${displayAccount.slice(-4)}`
                : displayAccount || 'Connected'}
            </p>
          </div>
        </div>
        <button 
          className="disconnect-button"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Connection error state
  if (error && !isConnecting) {
    return (
      <div className="mobile-wallet-connect error">
        <div className="error-content">
          <h4>⚠️ Connection Failed</h4>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              className="retry-button"
              onClick={handleConnect}
            >
              Try Again
            </button>
            {isMobile && (
              <button 
                className="help-button"
                onClick={() => setShowInstructions(true)}
              >
                Get Help
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default connection state
  return (
    <div className="mobile-wallet-connect">
      {isMobile ? (
        <div className="mobile-connect">
          <h3>🔗 Connect Your Wallet</h3>
          <p>Access your LeadFive account securely</p>
          
          {canConnect ? (
            <button 
              className="connect-button mobile"
              onClick={handleConnect}
            >
              <span className="button-icon">🔗</span>
              Connect Wallet
            </button>
          ) : (
            <div className="no-wallet">
              <p>No wallet detected</p>
              <button 
                className="install-button"
                onClick={() => setShowInstructions(true)}
              >
                Install Wallet
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="desktop-connect">
          <button 
            className="connect-button desktop"
            onClick={handleConnect}
          >
            Connect Wallet
          </button>
        </div>
      )}

      {showInstructions && <WalletInstructions />}
    </div>
  );
};

export default MobileWalletConnect;