import React, { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import './UnifiedWalletConnect.css';

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
    check: () =>
      typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
    color: '#f6851b',
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Mobile-first crypto wallet',
    downloadUrl: 'https://trustwallet.com/',
    check: () =>
      typeof window.ethereum !== 'undefined' && window.ethereum.isTrust,
    color: '#3375bb',
  },
  {
    id: 'binancewallet',
    name: 'Binance Wallet',
    icon: '🟨',
    description: 'Official Binance Chain Wallet',
    downloadUrl: 'https://www.binance.org/wallet',
    check: () => typeof window.BinanceChain !== 'undefined',
    color: '#f3ba2f',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Self-custody wallet by Coinbase',
    downloadUrl: 'https://wallet.coinbase.com/',
    check: () =>
      typeof window.ethereum !== 'undefined' &&
      window.ethereum.isCoinbaseWallet,
    color: '#0052ff',
  },
  {
    id: 'injected',
    name: 'Injected Wallet',
    icon: '💼',
    description: 'Any other Web3 wallet',
    downloadUrl: null,
    check: () => typeof window.ethereum !== 'undefined',
    color: '#6366f1',
  },
];

const UnifiedWalletConnect = ({
  onConnect,
  onDisconnect,
  onError,
  buttonText = 'Connect Wallet',
  showModal = false,
  onCloseModal,
  compact = false,
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
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback(
    accounts => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== connectedAccount) {
        setConnectedAccount(accounts[0]);
        if (onConnect && provider && signer) {
          onConnect(accounts[0], provider, signer);
        }
      }
    },
    [connectedAccount, provider, signer, onConnect]
  );

  // Handle chain changes
  const handleChainChanged = useCallback(chainId => {
    // Reload the page when chain changes for safety
    window.location.reload();
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    disconnectWallet();
  }, []);

  // Format address for display
  const formatAddress = address => {
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
  const connectWallet = async walletId => {
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
      <div className={`unified-wallet-connect ${compact ? 'compact' : ''}`}>
        {connectedAccount ? (
          <div className="connected-wallet">
            <div className="wallet-info">
              <span className="wallet-icon">
                {connectedWallet?.icon || '👛'}
              </span>
              <div className="wallet-details">
                <span className="wallet-name">
                  {connectedWallet?.name || 'Connected'}
                </span>
                <span className="wallet-address">
                  {formatAddress(connectedAccount)}
                </span>
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
            className="connect-btn"
            onClick={openModal}
            disabled={isConnecting}
          >
            {isConnecting && <span className="connecting-spinner" />}
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
        <div className="wallet-modal" onClick={closeModal}>
          <div
            className="wallet-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Connect Your Wallet</h3>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="wallet-options">
              {availableWallets.map(wallet => (
                <div
                  key={wallet.id}
                  className="wallet-option"
                  onClick={() => connectWallet(wallet.id)}
                >
                  <div className="wallet-option-icon">{wallet.icon}</div>
                  <div className="wallet-option-info">
                    <h4 className="wallet-option-name">{wallet.name}</h4>
                    <p className="wallet-option-description">
                      {wallet.description}
                    </p>
                  </div>
                  <div
                    className={`wallet-option-status ${!wallet.check() ? 'not-installed' : ''}`}
                  >
                    {wallet.check() ? 'Available' : 'Install'}
                  </div>
                </div>
              ))}

              {availableWallets.length === 0 && (
                <div className="no-wallets">
                  <p>No Web3 wallets detected</p>
                  <div className="install-suggestions">
                    {SUPPORTED_WALLETS.slice(0, 2).map(wallet => (
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
    </>
  );
};

export default UnifiedWalletConnect;
