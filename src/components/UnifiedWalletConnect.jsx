import React, { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

// BSC Mainnet configuration
const BSC_MAINNET_CONFIG = {
  chainId: '0x38', // 56 in decimal
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

// Wallet configurations
const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular crypto wallet',
    downloadUrl: 'https://metamask.io/',
    check: () => typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
    color: '#f6851b'
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Mobile-first crypto wallet',
    downloadUrl: 'https://trustwallet.com/',
    check: () => typeof window.ethereum !== 'undefined' && window.ethereum.isTrust,
    color: '#3375bb'
  },
  {
    id: 'binancewallet',
    name: 'Binance Wallet',
    icon: '🟨',
    description: 'Official Binance Chain Wallet',
    downloadUrl: 'https://www.binance.org/wallet',
    check: () => typeof window.BinanceChain !== 'undefined',
    color: '#f3ba2f'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Self-custody wallet by Coinbase',
    downloadUrl: 'https://wallet.coinbase.com/',
    check: () => typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet,
    color: '#0052ff'
  },
  {
    id: 'injected',
    name: 'Injected Wallet',
    icon: '💼',
    description: 'Any other Web3 wallet',
    downloadUrl: null,
    check: () => typeof window.ethereum !== 'undefined',
    color: '#6366f1'
  }
];

const UnifiedWalletConnect = ({ 
  onConnect, 
  onDisconnect, 
  onError,
  buttonText = "Connect Wallet",
  showModal = false,
  onCloseModal,
  compact = false
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(showModal);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [networkError, setNetworkError] = useState(null);

  // Check for available wallets on component mount
  useEffect(() => {
    const checkWallets = () => {
      const available = SUPPORTED_WALLETS.filter(wallet => wallet.check());
      setAvailableWallets(available);
    };

    checkWallets();
    
    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      handleAccountsChanged([window.ethereum.selectedAddress]);
    }

    // Set up event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== connectedAccount) {
      setConnectedAccount(accounts[0]);
      if (onConnect && provider && signer) {
        onConnect(accounts[0], provider, signer);
      }
    }
  }, [connectedAccount, provider, signer, onConnect]);

  // Handle chain changes
  const handleChainChanged = useCallback((chainId) => {
    // Reload the page when chain changes for safety
    window.location.reload();
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    disconnectWallet();
  }, []);

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Switch or add BSC network
  const switchToBSCNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_MAINNET_CONFIG.chainId }],
      });
      setNetworkError(null);
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_MAINNET_CONFIG],
          });
          setNetworkError(null);
          return true;
        } catch (addError) {
          console.error('Failed to add BSC network:', addError);
          setNetworkError('Failed to add BSC network');
          return false;
        }
      } else {
        console.error('Failed to switch to BSC network:', switchError);
        setNetworkError('Failed to switch to BSC network');
        return false;
      }
    }
  };

  // Connect to specific wallet
  const connectWallet = async (walletId) => {
    const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId);
    if (!wallet) {
      onError?.('Unsupported wallet');
      return;
    }

    // Check if wallet is available
    if (!wallet.check()) {
      if (wallet.downloadUrl) {
        window.open(wallet.downloadUrl, '_blank');
        return;
      } else {
        onError?.('Wallet not available');
        return;
      }
    }

    setIsConnecting(true);
    setNetworkError(null);

    try {
      let ethProvider = window.ethereum;

      // For specific wallets, try to use their provider
      if (walletId === 'binancewallet' && window.BinanceChain) {
        ethProvider = window.BinanceChain;
      }

      if (!ethProvider) {
        throw new Error('No Web3 provider found');
      }

      // Request account access
      const accounts = await ethProvider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      // Check and switch to BSC network
      const chainId = await ethProvider.request({ method: 'eth_chainId' });
      if (chainId !== BSC_MAINNET_CONFIG.chainId) {
        const switched = await switchToBSCNetwork();
        if (!switched) {
          throw new Error('Failed to switch to BSC network');
        }
      }

      // Create provider and signer
      const web3Provider = new BrowserProvider(ethProvider);
      const web3Signer = await web3Provider.getSigner();

      // Update state
      setConnectedAccount(accounts[0]);
      setConnectedWallet(wallet);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setIsModalOpen(false);

      // Notify parent component
      if (onConnect) {
        onConnect(accounts[0], web3Provider, web3Signer);
      }

    } catch (error) {
      console.error('Wallet connection failed:', error);
      const errorMessage = error.message || 'Failed to connect wallet';
      onError?.(errorMessage);
      setNetworkError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setConnectedAccount(null);
    setConnectedWallet(null);
    setProvider(null);
    setSigner(null);
    setNetworkError(null);
    setIsModalOpen(false);

    if (onDisconnect) {
      onDisconnect();
    }
  };

  // Open wallet selection modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    if (onCloseModal) {
      onCloseModal();
    }
  };

  return (
    <>
      {/* Main Connect Button */}
      <div className="unified-wallet-connect">
        {connectedAccount ? (
          <div className="connected-wallet">
            <div className="wallet-info">
              <span className="wallet-icon">{connectedWallet?.icon || '👛'}</span>
              <div className="wallet-details">
                <span className="wallet-name">{connectedWallet?.name || 'Connected'}</span>
                <span className="wallet-address">{formatAddress(connectedAccount)}</span>
              </div>
            </div>
            <button 
              className="disconnect-btn"
              onClick={disconnectWallet}
              title="Disconnect wallet"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className={`connect-btn ${compact ? 'compact' : ''}`}
            onClick={openModal}
            disabled={isConnecting}
          >
            <span className="btn-icon">👛</span>
            {isConnecting ? 'Connecting...' : buttonText}
          </button>
        )}

        {networkError && (
          <div className="network-error">
            <span>⚠️ {networkError}</span>
            <button onClick={() => setNetworkError(null)}>✕</button>
          </div>
        )}
      </div>

      {/* Wallet Selection Modal */}
      {isModalOpen && (
        <div className="wallet-modal-overlay" onClick={closeModal}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Connect Your Wallet</h3>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-content">
              <p className="modal-description">
                Choose your preferred wallet to connect to LeadFive on BSC Mainnet
              </p>

              <div className="wallets-grid">
                {availableWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    className="wallet-option"
                    onClick={() => connectWallet(wallet.id)}
                    disabled={isConnecting}
                    style={{ borderColor: wallet.color }}
                  >
                    <div className="wallet-option-content">
                      <span className="wallet-option-icon">{wallet.icon}</span>
                      <div className="wallet-option-info">
                        <span className="wallet-option-name">{wallet.name}</span>
                        <span className="wallet-option-desc">{wallet.description}</span>
                      </div>
                    </div>
                    {wallet.check() ? (
                      <span className="wallet-status available">✓</span>
                    ) : (
                      <span className="wallet-status install">↗</span>
                    )}
                  </button>
                ))}
              </div>

              {availableWallets.length === 0 && (
                <div className="no-wallets">
                  <p>No Web3 wallets detected</p>
                  <div className="install-suggestions">
                    {SUPPORTED_WALLETS.slice(0, 2).map((wallet) => (
                      <a
                        key={wallet.id}
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="install-link"
                      >
                        {wallet.icon} Install {wallet.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .unified-wallet-connect {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .connected-wallet {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 69, 0, 0.1));
          border: 2px solid #FF6B35;
          border-radius: 16px;
          padding: 12px 16px;
          min-width: 200px;
          max-width: 300px;
        }

        .wallet-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .wallet-icon {
          font-size: 20px;
        }

        .wallet-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .wallet-name {
          font-size: 14px;
          font-weight: 600;
          color: #FF6B35;
        }

        .wallet-address {
          font-size: 12px;
          color: #666;
          font-family: 'Courier New', monospace;
        }

        .disconnect-btn {
          background: none;
          border: none;
          color: #ff4444;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .disconnect-btn:hover {
          background: rgba(255, 68, 68, 0.1);
        }

        .connect-btn {
          background: linear-gradient(135deg, #FF6B35, #FF4500);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          min-width: 180px;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .connect-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #e55a2b, #e53e00);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
        }

        .connect-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .connect-btn.compact {
          padding: 0.7rem 1.5rem;
          border-radius: 12px;
          font-size: 1rem;
          min-width: auto;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
          background: linear-gradient(45deg, #00D4FF, #7B2CBF);
        }

        .connect-btn.compact:hover:not(:disabled) {
          background: linear-gradient(45deg, #7B2CBF, #00D4FF);
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
        }

        .btn-icon {
          font-size: 18px;
        }

        .network-error {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #ff4444;
          color: #ff4444;
          padding: 8px 12px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          max-width: 350px;
        }

        .network-error button {
          background: none;
          border: none;
          color: #ff4444;
          cursor: pointer;
          font-size: 14px;
        }

        .wallet-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .wallet-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
          font-size: 20px;
          font-weight: 700;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #666;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f5f5f5;
          color: #333;
        }

        .modal-content {
          padding: 24px;
        }

        .modal-description {
          margin: 0 0 24px 0;
          color: #666;
          text-align: center;
          font-size: 14px;
        }

        .wallets-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wallet-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 2px solid #eee;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .wallet-option:hover:not(:disabled) {
          border-color: #FF6B35;
          background: rgba(255, 107, 53, 0.05);
          transform: translateY(-1px);
        }

        .wallet-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wallet-option-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wallet-option-icon {
          font-size: 24px;
        }

        .wallet-option-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .wallet-option-name {
          font-weight: 600;
          color: #333;
          font-size: 16px;
        }

        .wallet-option-desc {
          font-size: 12px;
          color: #666;
        }

        .wallet-status {
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .wallet-status.available {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .wallet-status.install {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .no-wallets {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .install-suggestions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }

        .install-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #FF6B35, #FF4500);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .install-link:hover {
          background: linear-gradient(135deg, #e55a2b, #e53e00);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .wallet-modal {
            margin: 10px;
            max-width: none;
          }

          .modal-header,
          .modal-content {
            padding: 20px;
          }

          .connect-btn {
            min-width: 160px;
            padding: 12px 24px;
            font-size: 14px;
          }

          .wallet-option {
            padding: 14px;
          }

          .wallet-option-name {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default UnifiedWalletConnect;
