import React, { useState, useEffect } from 'react';
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaNetworkWired,
} from 'react-icons/fa';
import './NetworkStatus.css';

const NetworkStatus = ({ provider, account }) => {
  const [networkStatus, setNetworkStatus] = useState({
    connected: false,
    networkName: '',
    chainId: '',
    isCorrectNetwork: false,
    contractDeployed: false,
  });

  useEffect(() => {
    checkNetworkStatus();
  }, [provider, account]);

  const checkNetworkStatus = async () => {
    if (!provider) {
      setNetworkStatus({
        connected: false,
        networkName: 'No Provider',
        chainId: '',
        isCorrectNetwork: false,
        contractDeployed: false,
      });
      return;
    }

    try {
      const network = await provider.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;
      const isCorrectNetwork = chainId === '0x38'; // BSC Mainnet

      setNetworkStatus({
        connected: true,
        networkName: network.name || 'Unknown Network',
        chainId: chainId,
        isCorrectNetwork: isCorrectNetwork,
        contractDeployed: isCorrectNetwork, // Assume deployed if correct network
      });
    } catch (error) {
      console.error('Network check failed:', error);
      setNetworkStatus({
        connected: false,
        networkName: 'Connection Error',
        chainId: '',
        isCorrectNetwork: false,
        contractDeployed: false,
      });
    }
  };

  const switchToBSC = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to continue');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x38',
                chainName: 'BNB Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add BSC network:', addError);
        }
      }
    }
  };

  if (!networkStatus.connected) {
    return (
      <div className="network-status error">
        <FaExclamationTriangle />
        <span>No network connection</span>
      </div>
    );
  }

  if (!networkStatus.isCorrectNetwork) {
    return (
      <div className="network-status warning">
        <FaExclamationTriangle />
        <div>
          <p>
            Wrong Network: {networkStatus.networkName} ({networkStatus.chainId})
          </p>
          <button onClick={switchToBSC} className="switch-network-btn">
            Switch to BNB Smart Chain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="network-status success">
      <FaCheckCircle />
      <span>Connected to {networkStatus.networkName}</span>
    </div>
  );
};

export default NetworkStatus;
