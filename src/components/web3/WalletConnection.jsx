import React from 'react';
import useWallet from '../../hooks/useWallet';
import Button from '../common/Button';

const WalletConnection = () => {
  const { account, isConnecting, connectWallet, disconnectWallet, network, isConnected } = useWallet();

  return (
    <div className="wallet-connection">
      <h2>Wallet Connection</h2>
      {isConnected ? (
        <div style={{ color: '#00D4FF' }}>
          Connected: {account}
          <Button onClick={disconnectWallet} className="btn-secondary" style={{ marginLeft: 16 }}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={connectWallet} disabled={isConnecting} className="btn-primary" style={{ marginTop: 16 }}>
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
      )}
      {network && (
        <div style={{ color: '#aaa', fontSize: 12 }}>Network: {network}</div>
      )}
    </div>
  );
};

export default WalletConnection;
