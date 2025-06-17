import React, { useState, useEffect, useContext, createContext } from 'react';
import { ethers } from 'ethers';
import mainnetConfig from './mainnet-config.json';

// Web3 Context
const Web3Context = createContext();

// Contract ABI (simplified for key functions)
const CONTRACT_ABI = [
  "function getUserInfo(address user) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate))",
  "function getPoolBalances() view returns (uint96, uint96, uint96)",
  "function packages(uint8) view returns (tuple(uint96 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus))",
  "function register(address referrer, uint8 packageLevel, bool useUSDT) payable",
  "function upgradePackage(uint8 newLevel, bool useUSDT) payable",
  "function withdraw(uint96 amount)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)"
];

// Web3 Provider Component
const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        // Check if on BSC Mainnet
        if (Number(network.chainId) !== mainnetConfig.network.chainId) {
          await switchToBSC();
          return;
        }
        
        const contract = new ethers.Contract(
          mainnetConfig.contracts.OrphiCrowdFund.address,
          CONTRACT_ABI,
          signer
        );
        
        setProvider(provider);
        setAccount(address);
        setContract(contract);
        setChainId(Number(network.chainId));
        setIsConnected(true);
        
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet');
    }
  };

  const switchToBSC = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${mainnetConfig.network.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${mainnetConfig.network.chainId.toString(16)}`,
              chainName: mainnetConfig.network.name,
              rpcUrls: [mainnetConfig.network.rpcUrl],
              blockExplorerUrls: [mainnetConfig.network.blockExplorer],
              nativeCurrency: mainnetConfig.network.currency
            }],
          });
        } catch (addError) {
          console.error('Failed to add BSC network:', addError);
        }
      }
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setChainId(null);
    setIsConnected(false);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{
      account,
      provider,
      contract,
      chainId,
      isConnected,
      isLoading,
      connectWallet,
      disconnect,
      switchToBSC
    }}>
      {children}
    </Web3Context.Provider>
  );
};

// Header Component
const Header = () => {
  const { account, isConnected, connectWallet, disconnect, isLoading } = useContext(Web3Context);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">OrphiCrowdFund</h1>
          <span className="bg-green-500 text-xs px-2 py-1 rounded-full">LIVE</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { contract, account, isConnected } = useContext(Web3Context);
  const [userInfo, setUserInfo] = useState(null);
  const [poolBalances, setPoolBalances] = useState([0, 0, 0]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && contract && account) {
      loadUserData();
      loadPoolData();
      loadPackages();
    }
  }, [isConnected, contract, account]);

  const loadUserData = async () => {
    try {
      const info = await contract.getUserInfo(account);
      setUserInfo(info);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadPoolData = async () => {
    try {
      const balances = await contract.getPoolBalances();
      setPoolBalances(balances);
    } catch (error) {
      console.error('Failed to load pool data:', error);
    }
  };

  const loadPackages = async () => {
    try {
      const packageData = [];
      for (let i = 1; i <= 8; i++) {
        const pkg = await contract.packages(i);
        packageData.push({
          id: i,
          ...pkg,
          ...mainnetConfig.packages[i - 1]
        });
      }
      setPackages(packageData);
    } catch (error) {
      console.error('Failed to load packages:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to OrphiCrowdFund</h2>
        <p className="text-gray-600 mb-8">Connect your wallet to get started</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">🎯 40% Direct Bonus</h3>
            <p>Earn 40% commission on direct referrals</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">📈 10-Level System</h3>
            <p>Earn from 10 levels of your network</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">💰 Global Pools</h3>
            <p>Participate in global reward pools</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Stats */}
      {userInfo && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Status</h3>
            <p className="text-2xl font-bold text-green-600">
              {userInfo.isRegistered ? 'Registered' : 'Not Registered'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Package Level</h3>
            <p className="text-2xl font-bold text-blue-600">{userInfo.packageLevel}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Balance</h3>
            <p className="text-2xl font-bold text-purple-600">
              {ethers.formatEther(userInfo.balance)} ETH
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Total Earnings</h3>
            <p className="text-2xl font-bold text-green-600">
              {ethers.formatEther(userInfo.totalEarnings)} ETH
            </p>
          </div>
        </div>
      )}

      {/* Pool Balances */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700">Leader Pool</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {ethers.formatEther(poolBalances[0])} ETH
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700">Help Pool</h3>
          <p className="text-2xl font-bold text-blue-600">
            {ethers.formatEther(poolBalances[1])} ETH
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700">Club Pool</h3>
          <p className="text-2xl font-bold text-purple-600">
            {ethers.formatEther(poolBalances[2])} ETH
          </p>
        </div>
      </div>

      {/* Packages */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Available Packages</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} userInfo={userInfo} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Package Card Component
const PackageCard = ({ package: pkg, userInfo }) => {
  const { contract } = useContext(Web3Context);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      if (!userInfo.isRegistered) {
        // Registration
        const referrer = new URLSearchParams(window.location.search).get('ref') || 
                        ethers.ZeroAddress;
        
        const tx = await contract.register(referrer, pkg.id, false, {
          value: ethers.parseEther((pkg.priceUSD / 300).toString()) // Assuming 1 BNB = $300
        });
        
        await tx.wait();
        alert('Registration successful!');
      } else if (pkg.id > userInfo.packageLevel) {
        // Package upgrade
        const tx = await contract.upgradePackage(pkg.id, false, {
          value: ethers.parseEther((pkg.priceUSD / 300).toString())
        });
        
        await tx.wait();
        alert('Package upgraded successfully!');
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canPurchase = !userInfo?.isRegistered || 
                     (userInfo?.isRegistered && pkg.id > userInfo.packageLevel);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-colors">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
        <p className="text-3xl font-bold text-blue-600">${pkg.priceUSD}</p>
        <p className="text-sm text-gray-600">{pkg.description}</p>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Direct Bonus:</span>
          <span className="font-semibold">{pkg.directBonus}%</span>
        </div>
        <div className="flex justify-between">
          <span>Level Bonus:</span>
          <span className="font-semibold">{pkg.levelBonus}%</span>
        </div>
      </div>
      
      {canPurchase && (
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 
           !userInfo?.isRegistered ? 'Register' : 'Upgrade'}
        </button>
      )}
      
      {userInfo?.packageLevel === pkg.id && (
        <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-center">
          Current Package
        </div>
      )}
    </div>
  );
};

// Main App Component
const OrphiCrowdFundApp = () => {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Dashboard />
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="mb-4">OrphiCrowdFund - Decentralized MLM Platform</p>
            <div className="flex justify-center space-x-4">
              <a href={mainnetConfig.contracts.OrphiCrowdFund.bscscanUrl} 
                 target="_blank" rel="noopener noreferrer"
                 className="text-blue-400 hover:text-blue-300">
                View Contract
              </a>
              <span>|</span>
              <span>Contract: {mainnetConfig.contracts.OrphiCrowdFund.address}</span>
            </div>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
};

export default OrphiCrowdFundApp; 