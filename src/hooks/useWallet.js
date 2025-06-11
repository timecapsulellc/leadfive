import React from 'react';

// TODO: Implement wallet connection logic (MetaMask, etc.)
const useWallet = () => {
  const [account, setAccount] = React.useState(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [network, setNetwork] = React.useState(null);
  const [provider, setProvider] = React.useState(null);

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      setIsConnecting(true);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setProvider(window.ethereum);
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setNetwork(chainId);
      } catch (err) {
        setAccount(null);
      }
      setIsConnecting(false);
    } else {
      alert('MetaMask not found');
    }
  };

  // Disconnect wallet (reset state)
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setNetwork(null);
  };

  React.useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
      setProvider(window.ethereum);
    }
  }, []);

  return {
    account,
    isConnecting,
    network,
    provider,
    connectWallet,
    disconnectWallet,
    isConnected: !!account
  };
};
export default useWallet;
