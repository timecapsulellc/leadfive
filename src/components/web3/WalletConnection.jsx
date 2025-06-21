import React from 'react';
import UnifiedWalletConnect from '../UnifiedWalletConnect';
import useWallet from '../../hooks/useWallet';

const WalletConnection = () => {
  const { 
    account, 
    isConnecting, 
    isConnected,
    provider,
    signer,
    error,
    handleConnect, 
    handleDisconnect, 
    handleError,
    getNetworkName,
    isCorrectNetwork
  } = useWallet();

  return (
    <div className="wallet-connection">
      <h2>Wallet Connection</h2>
      
      <UnifiedWalletConnect
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onError={handleError}
        buttonText="Connect Your Wallet"
      />

      {error && (
        <div className="error-message" style={{ 
          color: '#ff4444', 
          background: 'rgba(255, 68, 68, 0.1)', 
          padding: '10px', 
          borderRadius: '8px', 
          margin: '10px 0',
          border: '1px solid #ff4444'
        }}>
          ⚠️ {error}
        </div>
      )}

      {isConnected && (
        <div className="connection-details" style={{ margin: '20px 0' }}>
          <div className="detail-item" style={{ margin: '8px 0' }}>
            <strong>Account:</strong> {account}
          </div>
          <div className="detail-item" style={{ margin: '8px 0' }}>
            <strong>Network:</strong> {getNetworkName() || 'Unknown'}
            {!isCorrectNetwork() && (
              <span style={{ color: '#ff4444', marginLeft: '10px' }}>
                ⚠️ Please switch to BSC Mainnet
              </span>
            )}
          </div>
          <div className="detail-item" style={{ margin: '8px 0' }}>
            <strong>Status:</strong> 
            <span style={{ color: isCorrectNetwork() ? '#00ff88' : '#ff4444', marginLeft: '8px' }}>
              {isCorrectNetwork() ? '✓ Connected' : '⚠️ Wrong Network'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
