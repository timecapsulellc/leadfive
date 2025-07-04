import React from 'react';
import './UnifiedWalletConnect.css';

const UnifiedWalletConnect = ({ 
  account, 
  onConnect, 
  onDisconnect, 
  buttonText = "Connect Wallet",
  compact = false 
}) => {
  return (
    <div className="unified-wallet-connect">
      {account ? (
        <div className="wallet-connected">
          <span className="wallet-address">
            {account.substring(0, 6)}...{account.slice(-4)}
          </span>
          <button className="disconnect-btn" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <button className="connect-btn" onClick={onConnect}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default UnifiedWalletConnect;