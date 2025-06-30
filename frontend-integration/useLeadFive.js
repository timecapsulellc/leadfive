// Custom hooks for LeadFive contract interaction
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from './contractConfig';
import { LEADFIVE_ABI, USDT_ABI } from './contractABI';

// Hook for wallet connection
export const useWallet = () => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found!');
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
    }
  }, []);

  const switchToCorrectNetwork = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CONTRACT_CONFIG.CHAIN_ID.toString(16)}` }],
      });
    } catch (error) {
      console.error('Network switch failed:', error);
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
    connectWallet,
    switchToCorrectNetwork,
    disconnect
  };
};

// Hook for LeadFive contract interaction
export const useLeadFiveContract = (signer) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const executeTransaction = useCallback(async (method, ...args) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError('');
    
    try {
      const tx = await contract[method](...args);
      const receipt = await tx.wait();
      setLoading(false);
      return { success: true, tx, receipt };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [contract]);

  const readContract = useCallback(async (method, ...args) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract[method](...args);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [contract]);

  return {
    contract,
    loading,
    error,
    executeTransaction,
    readContract,
    setError
  };
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
        contract.getUserNetwork(account)
      ]);

      const withdrawalRate = basicInfo[0] ? await contract.calculateWithdrawalRate(account) : 0;

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

// Hook for registration
export const useRegistration = (leadFiveContract, usdtContract, account) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = useCallback(async (packageLevel, sponsor = CONTRACT_CONFIG.DEFAULT_SPONSOR) => {
    if (!leadFiveContract || !usdtContract) {
      throw new Error('Contracts not initialized');
    }

    setLoading(true);
    setError('');

    try {
      // Get package price
      const packagePrice = await leadFiveContract.getPackagePrice(packageLevel);
      const priceInEther = ethers.formatUnits(packagePrice, 18);

      // Check USDT balance
      const balance = await usdtContract.balanceOf(account);
      if (balance < packagePrice) {
        throw new Error(`Insufficient USDT balance. Need ${priceInEther} USDT`);
      }

      // Check and approve USDT if needed
      const allowance = await usdtContract.allowance(account, CONTRACT_CONFIG.LEADFIVE_ADDRESS);
      if (allowance < packagePrice) {
        console.log('Approving USDT...');
        const approveTx = await usdtContract.approve(CONTRACT_CONFIG.LEADFIVE_ADDRESS, packagePrice);
        await approveTx.wait();
        console.log('✅ USDT approved');
      }

      // Register user
      console.log('Registering user...');
      const tx = await leadFiveContract.register(sponsor, packageLevel, true);
      const receipt = await tx.wait();
      
      console.log('✅ Registration successful!');
      return { success: true, tx, receipt };

    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [leadFiveContract, usdtContract, account]);

  return {
    register,
    loading,
    error,
    setError
  };
};

// Hook for withdrawal
export const useWithdrawal = (contract) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const withdraw = useCallback(async (amount) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    setLoading(true);
    setError('');

    try {
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await contract.withdraw(amountWei);
      const receipt = await tx.wait();
      
      console.log('✅ Withdrawal successful!');
      return { success: true, tx, receipt };

    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return {
    withdraw,
    loading,
    error,
    setError
  };
};
