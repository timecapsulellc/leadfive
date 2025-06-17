import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Import styles
import '../styles/global.css';
import '../styles/design-system.css';

// Import contract configuration
import { ORPHI_CROWDFUND_CONFIG, ORPHI_CROWDFUND_ABI } from '../contracts';

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
      // You'll need to implement these functions in your contract
      // For now, using placeholder values
      setNetworkStats({
        totalUsers: 1247,
        totalVolume: '2847392',
        totalDistributed: '156847'
      });
    } catch (error) {
      console.error('Error loading network stats:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed! Please install MetaMask to continue.');
      return;
    }

    if (!provider) {
      alert('Provider not initialized. Please refresh the page.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check if we're on BSC Mainnet
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const bscChainId = '0x38'; // BSC Mainnet chain ID in hex
      
      if (chainId !== bscChainId) {
        try {
          // Try to switch to BSC Mainnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: bscChainId }],
          });
        } catch (switchError) {
          // If BSC is not added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: bscChainId,
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
              console.error('Error adding BSC network:', addError);
              alert('Please manually add BSC Mainnet to MetaMask and try again.');
              return;
            }
          } else {
            console.error('Error switching to BSC network:', switchError);
            alert('Please switch to BSC Mainnet in MetaMask and try again.');
            return;
          }
        }
      }
      
      // Get signer and address
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setSigner(signer);
      setAccount(address);
      
      // Load user info
      await loadUserInfo(address);
      
      console.log('Wallet connected successfully:', address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Please approve the connection request in MetaMask.');
      } else if (error.code === -32002) {
        alert('Please check MetaMask - there may be a pending connection request.');
      } else {
        alert(`Connection failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async (address) => {
    if (!contract) return;
    
    try {
      const info = await contract.getUserInfo(address);
      setUserInfo({
        isRegistered: info.isRegistered,
        balance: ethers.formatEther(info.balance),
        totalInvestment: ethers.formatEther(info.totalInvestment),
        totalEarnings: ethers.formatEther(info.totalEarnings),
        directReferrals: info.directReferrals.toString(),
        teamSize: info.teamSize.toString(),
        packageLevel: info.packageLevel.toString(),
        rank: info.rank.toString()
      });
    } catch (error) {
      console.error('Error loading user info:', error);
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
              
              {account ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-silver-mist">Connected</p>
                    <p className="text-xs font-mono text-cyber-blue">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                    {isCorrectNetwork && (
                      <p className="text-xs text-success-green">BSC Mainnet ✅</p>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    isCorrectNetwork ? 'bg-success-green' : 'bg-alert-red'
                  }`}></div>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
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
          <p className="text-xl text-silver-mist mb-8 max-w-3xl mx-auto slide-in-right">
            The Future of Decentralized Investment. Join the most advanced MLM platform 
            built on blockchain technology with transparent smart contracts.
          </p>
          
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
                <h2 className="card-title text-2xl">Your Dashboard</h2>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  userInfo.isRegistered 
                    ? 'bg-success-green/20 text-success-green' 
                    : 'bg-alert-red/20 text-alert-red'
                }`}>
                  {userInfo.isRegistered ? 'Active Member' : 'Not Registered'}
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
                <h2 className="card-title text-3xl text-center">Choose Your Package</h2>
                <p className="text-silver-mist text-center">Select the investment package that suits your goals</p>
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
                    
                    <ul className="package-features">
                      <li>✅ Sponsor Bonus: {pkg.price * 0.1}%</li>
                      <li>✅ Level Bonus: Up to 10 levels</li>
                      <li>✅ Global Upline Bonus</li>
                      <li>✅ Leader Pool Share</li>
                      {pkg.featured && <li>🌟 Premium Support</li>}
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
                      placeholder="0x... or leave empty"
                      className="input"
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
            <h2 className="text-4xl font-bold text-gradient font-display mb-4">
              Why Choose ORPHI?
            </h2>
            <p className="text-xl text-silver-mist max-w-2xl mx-auto">
              Experience the next generation of decentralized investment with cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure & Transparent</h3>
              <p className="text-silver-mist">
                Built on blockchain with verified smart contracts. Every transaction is transparent and immutable.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Rewards</h3>
              <p className="text-silver-mist">
                Automated smart contract distribution ensures instant commission payments to your wallet.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-white mb-3">Global Network</h3>
              <p className="text-silver-mist">
                Join a worldwide community of investors and build your network across the globe.
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
            
            <p className="text-silver-mist mb-4">
              The Future of Decentralized Investment
            </p>
            
            <div className="flex justify-center space-x-6 text-sm text-silver-mist">
              <span>Contract: {contractConfig.contractAddress.slice(0, 10)}...</span>
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