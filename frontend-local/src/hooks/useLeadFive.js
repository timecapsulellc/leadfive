// Custom hooks for LeadFive contract interaction
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from '../config/contractConfig.js';
import { LEADFIVE_ABI, USDT_ABI } from '../config/contractABI.js';

// Hook for wallet connection
export const useWallet = () => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      if (!window.ethereum) {
        throw new Error('MetaMask not found! Please install MetaMask.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      setIsCorrectNetwork(Number(network.chainId) === CONTRACT_CONFIG.CHAIN_ID);

      return { success: true, account: accounts[0] };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const switchToCorrectNetwork = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CONTRACT_CONFIG.CHAIN_ID.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${CONTRACT_CONFIG.CHAIN_ID.toString(16)}`,
              chainName: 'Binance Smart Chain Mainnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add BSC network:', addError);
        }
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount('');
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(Number(chainId));
        setIsCorrectNetwork(Number(chainId) === CONTRACT_CONFIG.CHAIN_ID);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [disconnect]);

  return {
    account,
    provider,
    signer,
    chainId,
    isConnected,
    isCorrectNetwork,
    loading,
    connectWallet,
    switchToCorrectNetwork,
    disconnect
  };
};

// Hook for LeadFive contract interaction
export const useLeadFiveContract = (signer) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const contractInstance = new ethers.Contract(
        CONTRACT_CONFIG.LEADFIVE_ADDRESS,
        LEADFIVE_ABI,
        signer
      );
      setContract(contractInstance);
    } else {
      setContract(null);
    }
  }, [signer]);

  return contract;
};

// Hook for USDT contract interaction
export const useUSDTContract = (signer) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const contractInstance = new ethers.Contract(
        CONTRACT_CONFIG.USDT_ADDRESS,
        USDT_ABI,
        signer
      );
      setContract(contractInstance);
    } else {
      setContract(null);
    }
  }, [signer]);

  const getBalance = useCallback(async (address) => {
    if (!contract) return '0';
    try {
      const balance = await contract.balanceOf(address);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Failed to get USDT balance:', error);
      return '0';
    }
  }, [contract]);

  const approve = useCallback(async (spender, amount) => {
    if (!contract) throw new Error('USDT contract not initialized');
    
    const amountWei = ethers.parseUnits(amount.toString(), 18);
    const tx = await contract.approve(spender, amountWei);
    return await tx.wait();
  }, [contract]);

  const getAllowance = useCallback(async (owner, spender) => {
    if (!contract) return '0';
    try {
      const allowance = await contract.allowance(owner, spender);
      return ethers.formatUnits(allowance, 18);
    } catch (error) {
      console.error('Failed to get allowance:', error);
      return '0';
    }
  }, [contract]);

  return {
    contract,
    getBalance,
    approve,
    getAllowance
  };
};

// Hook for user data
export const useUserData = (contract, account) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!contract || !account) return;

    setLoading(true);
    try {
      const [basicInfo, earnings, network] = await Promise.all([
        contract.getUserBasicInfo(account),
        contract.getUserEarnings(account),
        contract.getUserNetwork(account).catch(() => [ethers.ZeroAddress, 0])
      ]);

      let withdrawalRate = 0;
      if (basicInfo[0]) {
        try {
          withdrawalRate = await contract.calculateWithdrawalRate(account);
        } catch (error) {
          console.log('Could not fetch withdrawal rate:', error);
        }
      }

      setUserInfo({
        isRegistered: basicInfo[0],
        packageLevel: Number(basicInfo[1]),
        balance: ethers.formatUnits(basicInfo[2], 18),
        totalEarnings: ethers.formatUnits(earnings[0], 18),
        earningsCap: ethers.formatUnits(earnings[1], 18),
        directReferrals: Number(earnings[2]),
        referrer: network[0],
        teamSize: Number(network[1]),
        withdrawalRate: Number(withdrawalRate)
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUserInfo({
        isRegistered: false,
        packageLevel: 0,
        balance: '0',
        totalEarnings: '0',
        earningsCap: '0',
        directReferrals: 0,
        referrer: ethers.ZeroAddress,
        teamSize: 0,
        withdrawalRate: 0
      });
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userInfo,
    loading,
    refetch: fetchUserData
  };
};
