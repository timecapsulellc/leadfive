import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';

const WalletConnect = ({ onConnect, onDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    if (!window.ethereum) {
      setError('Web3 wallet not detected. Please install MetaMask or another Web3 wallet.');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const selectedAccount = accounts[0];
      
      // Check if we're on BSC network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const bscChainId = '0x38'; // BSC Mainnet
      
      if (chainId !== bscChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: bscChainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Network not added, add BSC network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: bscChainId,
                chainName: 'Binance Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Create provider and signer
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setAccount(selectedAccount);
      onConnect?.(selectedAccount, provider, signer);

    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setError(null);
    onDisconnect?.();
  };

  return (
    <div className="wallet-connect">
      {error && (
        <div className="wallet-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <button
        className={`wallet-btn ${account ? 'connected' : 'disconnected'}`}
        onClick={account ? disconnectWallet : connectWallet}
        disabled={isConnecting}
      >
        <span className="wallet-icon">👛</span>
        {isConnecting
          ? 'Connecting...'
          : account
          ? formatAddress(account)
          : 'Connect Wallet'}
      </button>

      <style jsx>{`
        .wallet-connect {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin: 20px 0;
        }

        .wallet-error {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #ff4444;
          color: #ff4444;
          padding: 10px 15px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          max-width: 400px;
          width: 100%;
        }

        .wallet-error button {
          background: none;
          border: none;
          color: #ff4444;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wallet-btn {
          background: linear-gradient(45deg, #FF6B35, #FF4500);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          min-width: 180px;
          justify-content: center;
        }

        .wallet-btn:hover:not(:disabled) {
          background: linear-gradient(45deg, #e55a2b, #e53e00);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .wallet-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .wallet-btn.connected {
          background: linear-gradient(45deg, #00FF88, #00CC6A);
        }

        .wallet-btn.connected:hover:not(:disabled) {
          background: linear-gradient(45deg, #00e577, #00b35f);
        }

        .wallet-icon {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .wallet-btn {
            min-width: 160px;
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletConnect;
