// React Hooks for LeadFive Contract Integration
import { useState, useEffect, useCallback } from 'react';
import { ethers, Contract, JsonRpcSigner } from 'ethers';
import { CONTRACT_ABI } from './types';
import { UserInfo, SystemInfo, LeadFiveConfig } from './global';
import config from './config.json';

const typedConfig = config as LeadFiveConfig;

// Custom hook for contract connection
export const useLeadFiveContract = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // Check if we're on BSC Mainnet
      if (Number(network.chainId) !== 56) {
        throw new Error('Please switch to BSC Mainnet (Chain ID: 56)');
      }

      // Create contract instance
      const contractInstance = new ethers.Contract(
        typedConfig.contractAddress,
        CONTRACT_ABI,
        signer
      );

      setAccount(accounts[0]);
      setSigner(signer);
      setContract(contractInstance);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      setError('');

      console.log('✅ Wallet connected:', accounts[0]);
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Wallet connection failed:', err);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setContract(null);
    setSigner(null);
    setAccount('');
    setIsConnected(false);
    setChainId(null);
    setError('');
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload(); // Reload on chain change
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [disconnectWallet]);

  return {
    contract,
    signer,
    account,
    isConnected,
    chainId,
    error,
    connectWallet,
    disconnectWallet
  };
};

// Hook for user information
export const useUserInfo = (contract: Contract | null, account: string) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchUserInfo = useCallback(async () => {
    if (!contract || !account) return;

    setLoading(true);
    try {
      const [basicInfo, earnings, network] = await Promise.all([
        contract.getUserBasicInfo(account),
        contract.getUserEarnings(account),
        contract.getUserNetwork(account)
      ]);

      const userData = {
        isRegistered: basicInfo[0],
        packageLevel: Number(basicInfo[1]),
        balance: ethers.formatUnits(basicInfo[2], 18),
        totalEarnings: ethers.formatUnits(earnings[0], 18),
        earningsCap: ethers.formatUnits(earnings[1], 18),
        directReferrals: Number(earnings[2]),
        referrer: network[0],
        teamSize: Number(network[1]),
        withdrawalRate: await contract.calculateWithdrawalRate(account)
      };

      setUserInfo(userData);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch user info:', err);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return { userInfo, loading, error, refetch: fetchUserInfo };
};

// Hook for system information
export const useSystemInfo = (contract: Contract | null) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSystemInfo = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const [health, totalUsers, usdtBalance] = await Promise.all([
        contract.getSystemHealth(),
        contract.getTotalUsers(),
        contract.getUSDTBalance()
      ]);

      const systemData = {
        isOperational: health[0],
        userCount: Number(health[1]),
        totalFeesCollected: ethers.formatUnits(health[2], 18),
        contractUSDTBalance: ethers.formatUnits(health[3], 18),
        contractBNBBalance: ethers.formatEther(health[4]),
        circuitBreakerStatus: health[5],
        totalUsers: Number(totalUsers),
        contractUSDTBalance2: ethers.formatUnits(usdtBalance, 18)
      };

      setSystemInfo(systemData);
    } catch (err) {
      console.error('Failed to fetch system info:', err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchSystemInfo();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemInfo, 30000);
    return () => clearInterval(interval);
  }, [fetchSystemInfo]);

  return { systemInfo, loading, refetch: fetchSystemInfo };
};

// Hook for package operations
export const usePackageOperations = (contract: Contract | null) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const registerUser = useCallback(async (sponsorAddress, packageLevel, useUSDT = true) => {
    if (!contract) throw new Error('Contract not connected');

    setLoading(true);
    setError('');

    try {
      // Get package price
      const packagePrice = await contract.getPackagePrice(packageLevel);
      
      let tx;
      if (useUSDT) {
        // First approve USDT
        const usdtContract = new ethers.Contract(
          config.tokens.usdt.address,
          [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)"
          ],
          contract.runner
        );

        // Check current allowance
        const currentAllowance = await usdtContract.allowance(
          await contract.runner.getAddress(),
          config.contractAddress
        );

        if (currentAllowance < packagePrice) {
          console.log('Approving USDT...');
          const approveTx = await usdtContract.approve(config.contractAddress, packagePrice);
          await approveTx.wait();
          console.log('✅ USDT approved');
        }

        // Register with USDT
        tx = await contract.register(sponsorAddress, packageLevel, true);
      } else {
        // Register with BNB (would need BNB price calculation)
        tx = await contract.register(sponsorAddress, packageLevel, false, {
          value: ethers.parseEther('0.1') // This would need proper calculation
        });
      }

      console.log('Registration transaction:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Registration successful');
      
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const upgradePackage = useCallback(async (newLevel, useUSDT = true) => {
    if (!contract) throw new Error('Contract not connected');

    setLoading(true);
    setError('');

    try {
      const packagePrice = await contract.getPackagePrice(newLevel);
      
      let tx;
      if (useUSDT) {
        // Approve USDT first
        const usdtContract = new ethers.Contract(
          config.tokens.usdt.address,
          ["function approve(address spender, uint256 amount) returns (bool)"],
          contract.runner
        );

        const approveTx = await usdtContract.approve(config.contractAddress, packagePrice);
        await approveTx.wait();

        tx = await contract.upgradePackage(newLevel, true);
      } else {
        tx = await contract.upgradePackage(newLevel, false, {
          value: ethers.parseEther('0.1') // Would need proper calculation
        });
      }

      const receipt = await tx.wait();
      console.log('✅ Package upgrade successful');
      
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const withdraw = useCallback(async (amount) => {
    if (!contract) throw new Error('Contract not connected');

    setLoading(true);
    setError('');

    try {
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await contract.withdraw(amountWei);
      
      console.log('Withdrawal transaction:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Withdrawal successful');
      
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return {
    registerUser,
    upgradePackage,
    withdraw,
    loading,
    error
  };
};

// Utility functions
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatCurrency = (amount, symbol = 'USDT') => {
  const num = parseFloat(amount || 0);
  return `${num.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 6 
  })} ${symbol}`;
};

export const getPackageInfo = (level) => {
  return config.packages[level.toString()] || null;
};

export const getBSCScanLink = (hash, type = 'tx') => {
  return `${config.network.explorer}/${type}/${hash}`;
};
