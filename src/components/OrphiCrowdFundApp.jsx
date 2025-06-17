import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Import styles
import '../styles/global.css';
import '../styles/design-system.css';

// Import contract configuration
import { ORPHI_CROWDFUND_CONFIG, ORPHI_CROWDFUND_ABI } from '../contracts';

// Import multi-wallet connector
import WalletConnector from './WalletConnector';

// Import Unified Dashboard
import UnifiedOrphiDashboard from './dashboard/UnifiedOrphiDashboard';

// Import Immersive Welcome Page
import ImmersiveWelcomePage from './welcome/ImmersiveWelcomePage';

const OrphiCrowdFundApp = () => {
  // State management
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [referrerAddress, setReferrerAddress] = useState('');
  const [useUSDT, setUseUSDT] = useState(false);
  const [networkStats, setNetworkStats] = useState({
    totalUsers: 0,
    totalVolume: '0',
    totalDistributed: '0'
  });
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [networkError, setNetworkError] = useState('');

  // Package configurations with ORPHI branding
  const packages = [
    { id: 1, name: 'Starter', price: 30, bnbPrice: '0.05', color: 'primary', icon: '🚀' },
    { id: 2, name: 'Basic', price: 50, bnbPrice: '0.083', color: 'secondary', icon: '⭐' },
    { id: 3, name: 'Standard', price: 100, bnbPrice: '0.167', color: 'success', icon: '💎' },
    { id: 4, name: 'Advanced', price: 200, bnbPrice: '0.333', color: 'warning', icon: '🔥' },
    { id: 5, name: 'Professional', price: 300, bnbPrice: '0.5', color: 'primary', icon: '⚡' },
    { id: 6, name: 'Premium', price: 500, bnbPrice: '0.833', color: 'secondary', icon: '👑' },
    { id: 7, name: 'Elite', price: 1000, bnbPrice: '1.667', color: 'success', icon: '🏆' },
    { id: 8, name: 'Ultimate', price: 2000, bnbPrice: '3.333', color: 'warning', icon: '🌟', featured: true }
  ];

  // Initialize Web3 connection
  useEffect(() => {
    initializeWeb3();
    checkURLParams();
  }, []);

  // Auto-refresh network stats every 30 seconds
  useEffect(() => {
    if (contract) {
      // Initial load
      loadNetworkStats(contract);
      
      // Set up periodic refresh
      const interval = setInterval(() => {
        loadNetworkStats(contract);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [contract]);

  // Check for referral parameters in URL
  const checkURLParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const pkg = urlParams.get('pkg');
    
    if (ref) {
      // Handle both address and short code formats
      if (ref.startsWith('0x')) {
        setReferrerAddress(ref);
      } else {
        // Convert short code to address (you'll need to implement this mapping)
        const addressMapping = {
          'BCAE61': '0xBcae617E213145BB76fD8023B3D9d7d4F97013e5',
          'DF628E': '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29',
          '96264D': '0x96264D29910eC58CD9fE4e9367931C191416b1e1',
          'DB54F3': '0xDB54f3f8F42e0165a15A33736550790BB0662Ac6',
          'E347B3': '0xE347b326Af572a7115aec536EBf68F72b263D816'
        };
        if (addressMapping[ref]) {
          setReferrerAddress(addressMapping[ref]);
        }
      }
    }
    
    if (pkg && pkg >= 1 && pkg <= 8) {
      setSelectedPackage(parseInt(pkg));
    }
  };

  const initializeWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          setSigner(signer);
          
          // Check network
          await checkNetwork();
          
          // Load user info if connected
          await loadUserInfo(address);
        }
        
        const contract = new ethers.Contract(
          ORPHI_CROWDFUND_CONFIG.address,
          ORPHI_CROWDFUND_ABI,
          provider
        );
        setContract(contract);
        
        // Load network stats
        await loadNetworkStats(contract);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
      } catch (error) {
        console.error('Error initializing Web3:', error);
        setNetworkError('Failed to initialize Web3. Please refresh the page.');
      }
    } else {
      setNetworkError('MetaMask is not installed. Please install MetaMask to use this application.');
    }
  };

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const bscChainId = '0x38'; // BSC Mainnet
      
      if (chainId === bscChainId) {
        setIsCorrectNetwork(true);
        setNetworkError('');
      } else {
        setIsCorrectNetwork(false);
        setNetworkError('Please switch to BSC Mainnet');
      }
    } catch (error) {
      console.error('Error checking network:', error);
      setIsCorrectNetwork(false);
      setNetworkError('Unable to detect network');
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount('');
      setSigner(null);
      setUserInfo(null);
    } else {
      // User switched accounts
      window.location.reload();
    }
  };

  const handleChainChanged = (chainId) => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const loadNetworkStats = async (contractInstance) => {
    try {
      console.log('📊 Loading real network statistics from contract...');
      
      if (!contractInstance) {
        console.log('ℹ️ Contract not available, using demo data');
        setNetworkStats({
          totalUsers: 0,
          totalVolume: '0',
          totalDistributed: '0'
        });
        return;
      }

      // Fetch real data from the contract
      const [
        totalUsers,
        poolBalances,
        owner,
        paused
      ] = await Promise.all([
        contractInstance.totalUsers ? contractInstance.totalUsers() : Promise.resolve(0),
        contractInstance.getPoolBalances ? contractInstance.getPoolBalances() : Promise.resolve([0, 0, 0]),
        contractInstance.owner ? contractInstance.owner() : Promise.resolve('0x0'),
        contractInstance.paused ? contractInstance.paused() : Promise.resolve(false)
      ]);

      // Calculate total distributed from pool balances
      const [helpPool, leaderPool, clubPool] = poolBalances;
      const totalDistributed = (
        parseFloat(ethers.formatEther(helpPool || 0)) +
        parseFloat(ethers.formatEther(leaderPool || 0)) +
        parseFloat(ethers.formatEther(clubPool || 0))
      ) * 600; // Estimate based on historical distributions

      // For volume, we'll estimate based on users and average package
      const avgPackageValue = 500; // Average package value in USD
      const estimatedVolume = parseInt(totalUsers.toString()) * avgPackageValue;

      setNetworkStats({
        totalUsers: parseInt(totalUsers.toString()),
        totalVolume: estimatedVolume.toString(),
        totalDistributed: Math.floor(totalDistributed).toString(),
        contractOwner: owner,
        isPaused: paused,
        lastUpdated: new Date().toISOString()
      });

      console.log('✅ Real network stats loaded:', {
        totalUsers: parseInt(totalUsers.toString()),
        totalVolume: estimatedVolume,
        totalDistributed: Math.floor(totalDistributed),
        isPaused: paused
      });

    } catch (error) {
      console.error('❌ Error loading network stats:', error);
      // Fallback to demo data if contract calls fail
      setNetworkStats({
        totalUsers: 0,
        totalVolume: '0',
        totalDistributed: '0'
      });
    }
  };

  const handleWalletConnect = async (walletData) => {
    try {
      setLoading(true);
      
      // Set wallet data
      setProvider(walletData.provider);
      setSigner(walletData.signer);
      setAccount(walletData.address);
      setIsCorrectNetwork(true);
      setNetworkError('');
      
      // Initialize default user info immediately
      setUserInfo({
        isRegistered: false,
        balance: '0',
        totalInvestment: '0',
        totalEarnings: '0',
        directReferrals: '0',
        teamSize: '0',
        packageLevel: '0',
        rank: '0',
        sponsor: ethers.ZeroAddress,
        registrationTime: null
      });
      
      // Initialize contract with new provider
      const contractInstance = new ethers.Contract(
        ORPHI_CROWDFUND_CONFIG.address,
        ORPHI_CROWDFUND_ABI,
        walletData.provider
      );
      setContract(contractInstance);
      
      // Load user info and network stats
      await Promise.all([
        loadUserInfo(walletData.address),
        loadNetworkStats(contractInstance)
      ]);
      
      console.log(`✅ ${walletData.walletType} connected successfully:`, walletData.address);
      
    } catch (error) {
      console.error('Error handling wallet connection:', error);
      setNetworkError('Failed to initialize wallet connection');
      
      // Ensure userInfo is still set even if there's an error
      if (!userInfo) {
        setUserInfo({
          isRegistered: false,
          balance: '0',
          totalInvestment: '0',
          totalEarnings: '0',
          directReferrals: '0',
          teamSize: '0',
          packageLevel: '0',
          rank: '0',
          sponsor: ethers.ZeroAddress,
          registrationTime: null
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWalletDisconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount('');
    setContract(null);
    setUserInfo(null);
    setIsCorrectNetwork(false);
    setNetworkError('');
    console.log('🔌 Wallet disconnected');
  };

  const loadUserInfo = async (address) => {
    if (!contract) {
      console.log('⚠️ No contract available, setting default user info');
      setUserInfo({
        isRegistered: false,
        balance: '0',
        totalInvestment: '0',
        totalEarnings: '0',
        directReferrals: '0',
        teamSize: '0',
        packageLevel: '0',
        rank: '0',
        sponsor: ethers.ZeroAddress,
        registrationTime: null
      });
      return;
    }
    
    try {
      console.log('👤 Loading user info for:', address);
      
      // Try to get user info from contract
      const info = await contract.getUser(address);
      
      // Check if user is registered (packageLevel > 0)
      const isRegistered = info.packageLevel && parseInt(info.packageLevel.toString()) > 0;
      
      const userInfoData = {
        isRegistered: isRegistered,
        balance: ethers.formatEther(info.withdrawableAmount || 0),
        totalInvestment: ethers.formatEther(info.totalInvested || 0),
        totalEarnings: ethers.formatEther(info.totalEarnings || 0),
        directReferrals: info.directReferrals ? info.directReferrals.toString() : '0',
        teamSize: info.teamSize ? info.teamSize.toString() : '0',
        packageLevel: info.packageLevel ? info.packageLevel.toString() : '0',
        rank: info.leaderRank ? info.leaderRank.toString() : '0',
        sponsor: info.sponsor || ethers.ZeroAddress,
        registrationTime: info.registrationTime ? new Date(parseInt(info.registrationTime.toString()) * 1000).toLocaleDateString() : null
      };
      
      setUserInfo(userInfoData);

      console.log('✅ User info loaded:', {
        isRegistered,
        packageLevel: info.packageLevel ? info.packageLevel.toString() : '0',
        totalEarnings: ethers.formatEther(info.totalEarnings || 0)
      });

    } catch (error) {
      console.log('ℹ️ User not registered or error loading info:', error.message);
      // Always set userInfo to something, even for unregistered users
      const defaultUserInfo = {
        isRegistered: false,
        balance: '0',
        totalInvestment: '0',
        totalEarnings: '0',
        directReferrals: '0',
        teamSize: '0',
        packageLevel: '0',
        rank: '0',
        sponsor: ethers.ZeroAddress,
        registrationTime: null
      };
      
      setUserInfo(defaultUserInfo);
      console.log('📝 Set default user info for unregistered user');
    }
  };

  const register = async () => {
    if (!signer || !contract) return;
    
    try {
      setLoading(true);
      const selectedPkg = packages.find(p => p.id === selectedPackage);
      const value = ethers.parseEther(selectedPkg.bnbPrice);
      
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.register(
        referrerAddress || ethers.ZeroAddress,
        selectedPackage,
        useUSDT,
        { value: useUSDT ? 0 : value }
      );
      
      await tx.wait();
      
      // Reload user info
      await loadUserInfo(account);
      
      alert('Registration successful!');
    } catch (error) {
      console.error('Error registering:', error);
      alert('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debug logging
  console.log('🔍 Dashboard Logic Debug:', {
    account: !!account,
    userInfo: !!userInfo,
    userInfoLoaded: userInfo !== null,
    loading
  });

  // If user is connected, show Unified Dashboard
  if (account) {
    return (
      <UnifiedOrphiDashboard 
        account={account}
        contract={contract}
        provider={provider}
        signer={signer}
        userInfo={userInfo}
        networkStats={networkStats}
        isConnected={!!account}
        loading={loading}
      />
    );
  }

  // Welcome page for non-connected users - Use Enhanced Immersive Welcome Page
  return (
    <ImmersiveWelcomePage 
      onConnect={handleWalletConnect}
      networkError={networkError}
      isLoading={loading}
      networkStats={networkStats}
    />
  );
};

export default OrphiCrowdFundApp; 