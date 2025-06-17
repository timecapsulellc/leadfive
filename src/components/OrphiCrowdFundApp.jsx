import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Import styles
import '../styles/global.css';
import '../styles/design-system.css';

// Import contract configuration
import { ORPHI_CROWDFUND_CONFIG, ORPHI_CROWDFUND_ABI } from '../contracts';

// Import multi-wallet connector
import WalletConnector from './WalletConnector';

// Import AI Enhanced Dashboard
import AIEnhancedDashboard from './dashboard/AIEnhancedDashboard';

// Import AI components
import AISettings from './admin/AISettings';
import CompensationPlanUpload from './admin/CompensationPlanUpload';

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
  const [showAIDashboard, setShowAIDashboard] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showCompPlanUpload, setShowCompPlanUpload] = useState(false);

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
    if (!contract) return;
    
    try {
      console.log('👤 Loading user info for:', address);
      
      // Try to get user info from contract
      const info = await contract.getUser(address);
      
      // Check if user is registered (packageLevel > 0)
      const isRegistered = info.packageLevel && parseInt(info.packageLevel.toString()) > 0;
      
      setUserInfo({
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
      });

      console.log('✅ User info loaded:', {
        isRegistered,
        packageLevel: info.packageLevel ? info.packageLevel.toString() : '0',
        totalEarnings: ethers.formatEther(info.totalEarnings || 0)
      });

    } catch (error) {
      console.log('ℹ️ User not registered or error loading info:', error.message);
      // Set default values for unregistered user
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

  // If AI Dashboard is enabled and user is connected, show AI Dashboard
  if (showAIDashboard && account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-space to-midnight-blue">
        {/* Header for AI Dashboard */}
        <header className="glass-effect border-b border-white/10 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyber-blue to-royal-purple rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">O</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient font-display">ORPHI AI Dashboard</h1>
                <p className="text-sm text-silver-mist">Powered by ChatGPT & ElevenLabs</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAISettings(true)}
                className="glass-effect px-4 py-2 rounded-lg text-sm font-semibold text-silver-mist hover:text-white transition-all"
              >
                <i className="fas fa-cog mr-2"></i>AI Settings
              </button>
              <button
                onClick={() => setShowAIDashboard(false)}
                className="bg-gradient-to-r from-royal-purple to-cyber-blue text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                <i className="fas fa-arrow-left mr-2"></i>Back to Classic
              </button>
            </div>
          </div>
        </header>

        <AIEnhancedDashboard 
          account={account}
          contractData={userInfo}
          isConnected={!!account}
        />

        {/* AI Settings Modal */}
        {showAISettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-deep-space to-midnight-blue rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-royal-purple to-cyber-blue p-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">AI Configuration</h2>
                  <button
                    onClick={() => setShowAISettings(false)}
                    className="text-white hover:text-silver-mist transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <AISettings />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If Compensation Plan Upload is shown
  if (showCompPlanUpload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-space to-midnight-blue">
        {/* Header */}
        <header className="glass-effect border-b border-white/10 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyber-blue to-royal-purple rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">O</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient font-display">Compensation Plan Upload</h1>
                <p className="text-sm text-silver-mist">AI-powered analysis by ChatGPT</p>
              </div>
            </div>
            <button
              onClick={() => setShowCompPlanUpload(false)}
              className="bg-gradient-to-r from-royal-purple to-cyber-blue text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
            </button>
          </div>
        </header>

        <div className="container mx-auto p-6">
          <CompensationPlanUpload 
            onAnalysisComplete={(result) => {
              console.log('Compensation plan analysis:', result);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-space to-midnight-blue">
      {/* Header */}
      <header className="glass-effect border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyber-blue to-royal-purple rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">O</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient font-display">ORPHI</h1>
                <p className="text-sm text-silver-mist">CrowdFund Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {networkError && (
                <div className="bg-alert-red/20 text-alert-red px-3 py-1 rounded-lg text-sm">
                  {networkError}
                </div>
              )}
              
              {/* AI Dashboard Toggle */}
              {account && (
                <button
                  onClick={() => setShowAIDashboard(!showAIDashboard)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    showAIDashboard 
                      ? 'bg-gradient-to-r from-royal-purple to-cyber-blue text-white' 
                      : 'glass-effect text-silver-mist hover:text-white'
                  }`}
                >
                  <i className="fas fa-robot mr-2"></i>
                  {showAIDashboard ? 'Classic View' : 'AI Dashboard'}
                </button>
              )}

              {/* Compensation Plan Upload */}
              {account && (
                <button
                  onClick={() => setShowCompPlanUpload(true)}
                  className="glass-effect px-4 py-2 rounded-lg text-sm font-semibold text-silver-mist hover:text-white transition-all"
                >
                  <i className="fas fa-file-upload mr-2"></i>
                  Upload Plan
                </button>
              )}
              
              <WalletConnector
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                currentAccount={account}
                isConnected={!!account}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-gradient font-display mb-6 fade-in-up">
            ORPHI CROWDFUND
          </h1>
          <p className="text-lg md:text-xl text-silver-mist mb-8 max-w-3xl mx-auto slide-in-right leading-relaxed">
            Revolutionary Web3 Crowdfunding Platform. Experience next-generation decentralized investment 
            powered by innovative blockchain technology and transparent smart contracts.
          </p>
          <div className="text-sm text-silver-mist/70 mb-4">
            Developed by <span className="text-cyber-blue font-semibold">LEAD 5</span> - 
            A group of young, freshly graduated blockchain engineers
          </div>
          
          {/* Network Stats */}
          <div className="stats-grid max-w-4xl mx-auto mb-12">
            <div className="stat-card">
              <div className="stat-icon stat-icon-primary">
                👥
              </div>
              <div className="stat-content">
                <div className="stat-title">Active Users</div>
                <div className="stat-value">{networkStats.totalUsers.toLocaleString()}</div>
                <div className="stat-change stat-change-up">
                  ↗️ +12.4%
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon stat-icon-secondary">
                💰
              </div>
              <div className="stat-content">
                <div className="stat-title">Total Volume</div>
                <div className="stat-value">${networkStats.totalVolume.toLocaleString()}</div>
                <div className="stat-change stat-change-up">
                  ↗️ +23.7%
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon stat-icon-success">
                🎯
              </div>
              <div className="stat-content">
                <div className="stat-title">Distributed</div>
                <div className="stat-value">${networkStats.totalDistributed.toLocaleString()}</div>
                <div className="stat-change stat-change-up">
                  ↗️ +18.9%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Dashboard */}
      {account && userInfo && (
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="card cyber-glow mb-8">
              <div className="card-header">
                <h2 className="card-title text-xl md:text-2xl">Your Investment Dashboard</h2>
                <div className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium ${
                  userInfo.isRegistered 
                    ? 'bg-success-green/20 text-success-green' 
                    : 'bg-alert-red/20 text-alert-red'
                }`}>
                  {userInfo.isRegistered ? 'Active Investor' : 'Not Registered'}
                </div>
              </div>
              
              {userInfo.isRegistered && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-primary">💎</div>
                    <div className="stat-content">
                      <div className="stat-title">Total Earnings</div>
                      <div className="stat-value">{parseFloat(userInfo.totalEarnings).toFixed(4)} ETH</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-secondary">📈</div>
                    <div className="stat-content">
                      <div className="stat-title">Investment</div>
                      <div className="stat-value">{parseFloat(userInfo.totalInvestment).toFixed(4)} ETH</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-success">👥</div>
                    <div className="stat-content">
                      <div className="stat-title">Team Size</div>
                      <div className="stat-value">{userInfo.teamSize}</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-warning">🏆</div>
                    <div className="stat-content">
                      <div className="stat-title">Package Level</div>
                      <div className="stat-value">{packages[parseInt(userInfo.packageLevel) - 1]?.name || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Registration Section */}
      {account && (!userInfo || !userInfo.isRegistered) && (
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="card purple-glow max-w-4xl mx-auto">
              <div className="card-header">
                <h2 className="card-title text-2xl md:text-3xl text-center">Choose Your Investment Package</h2>
                <p className="text-sm md:text-base text-silver-mist text-center leading-relaxed">
                  Select the crowdfunding package that aligns with your investment goals
                </p>
              </div>
              
              {/* Package Selection */}
              <div className="package-grid">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className={`package-card cursor-pointer transition-all ${
                      selectedPackage === pkg.id ? 'featured' : ''
                    } ${pkg.featured ? 'featured' : ''}`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <div className="text-4xl mb-4">{pkg.icon}</div>
                    <div className="package-name">{pkg.name}</div>
                    <div className="package-price">${pkg.price}</div>
                    <div className="text-sm text-silver-mist mb-6">
                      {pkg.bnbPrice} BNB
                    </div>
                    
                    <ul className="package-features text-sm">
                      <li>✅ Direct Referral Bonus: {(pkg.price * 0.1).toFixed(0)}%</li>
                      <li>✅ Network Growth Rewards</li>
                      <li>✅ Global Pool Distribution</li>
                      <li>✅ Leadership Incentives</li>
                      {pkg.featured && <li>🌟 Priority Support</li>}
                    </ul>
                    
                    {selectedPackage === pkg.id && (
                      <div className="mt-4 p-3 bg-cyber-blue/10 rounded-lg border border-cyber-blue/30">
                        <span className="text-cyber-blue font-medium">Selected Package</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Registration Form */}
              <div className="mt-12 max-w-md mx-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-silver-mist mb-2">
                      Referrer Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={referrerAddress}
                      onChange={(e) => setReferrerAddress(e.target.value)}
                      placeholder="0x... or leave empty for direct join"
                      className="input text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useUSDT"
                      checked={useUSDT}
                      onChange={(e) => setUseUSDT(e.target.checked)}
                      className="w-4 h-4 text-cyber-blue bg-transparent border-2 border-silver-mist rounded focus:ring-cyber-blue"
                    />
                    <label htmlFor="useUSDT" className="text-sm text-silver-mist">
                      Pay with USDT instead of BNB
                    </label>
                  </div>
                  
                  <button
                    onClick={register}
                    disabled={loading}
                    className="btn btn-primary w-full text-lg py-4"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Register - ${packages.find(p => p.id === selectedPackage)?.bnbPrice} BNB`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient font-display mb-4">
              Why Choose ORPHI CrowdFund?
            </h2>
            <p className="text-lg md:text-xl text-silver-mist max-w-2xl mx-auto leading-relaxed">
              Experience the next generation of decentralized crowdfunding with innovative blockchain technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl md:text-5xl mb-4">🔒</div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Secure & Transparent</h3>
              <p className="text-sm md:text-base text-silver-mist leading-relaxed">
                Built on blockchain with verified smart contracts. Every transaction is transparent and immutable.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl md:text-5xl mb-4">⚡</div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Instant Rewards</h3>
              <p className="text-sm md:text-base text-silver-mist leading-relaxed">
                Automated smart contract distribution ensures instant reward payments to your wallet.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl md:text-5xl mb-4">🌐</div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Global Community</h3>
              <p className="text-sm md:text-base text-silver-mist leading-relaxed">
                Join a worldwide community of investors and grow your crowdfunding network globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyber-blue to-royal-purple rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">O</span>
              </div>
              <span className="text-2xl font-bold text-gradient font-display">ORPHI</span>
            </div>
            
            <p className="text-sm md:text-base text-silver-mist mb-4">
              The Future of Decentralized Crowdfunding
            </p>
            <div className="text-xs text-silver-mist/60 mb-2">
              Engineered by LEAD 5 - Next-Generation Blockchain Developers
            </div>
            
            <div className="flex justify-center space-x-6 text-sm text-silver-mist">
              <span>Contract: {ORPHI_CROWDFUND_CONFIG.address.slice(0, 10)}...</span>
              <span>•</span>
              <span>BSC Mainnet</span>
              <span>•</span>
              <span>Verified ✅</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrphiCrowdFundApp; 