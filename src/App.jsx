import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute, { UserRoute, AdminRoute } from './components/ProtectedRoute';
import { withLazyLoading, LoadingSpinner, preloadComponents } from './components/LazyLoader';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import MobilePWAPrompt from './components/MobilePWAPrompt';
import MobilePerformanceMonitor from './components/MobilePerformanceMonitor';
import { storeWalletConnection, clearWalletConnection, extendSession } from './utils/walletPersistence';
import { runWalletDiagnostics } from './utils/walletDebug';

<<<<<<< HEAD
// Lazy load components for better performance with enhanced error handling
const createLazyComponent = (importFunc, componentName) => {
  return React.lazy(() => 
    importFunc().catch(error => {
      console.error(`Failed to load ${componentName}:`, error);
      return import('./components/ErrorFallback');
    })
  );
};

const Home = createLazyComponent(() => import('./pages/Home'), 'Home');
const Register = createLazyComponent(() => import('./pages/Register'), 'Register');
const Packages = createLazyComponent(() => import('./pages/Packages'), 'Packages');
const Referrals = createLazyComponent(() => import('./pages/Referrals'), 'Referrals');
const Withdrawals = createLazyComponent(() => import('./pages/Withdrawals'), 'Withdrawals');
const Security = createLazyComponent(() => import('./pages/Security'), 'Security');
const About = createLazyComponent(() => import('./pages/About'), 'About');
const Dashboard = createLazyComponent(() => import('./pages/Dashboard'), 'Dashboard');
const Welcome = createLazyComponent(() => import('./pages/Welcome'), 'Welcome');
const BrandGuide = createLazyComponent(() => import('./pages/BrandGuide'), 'BrandGuide');
const Genealogy = createLazyComponent(() => import('./pages/Genealogy'), 'Genealogy');
const TestAIDashboard = createLazyComponent(() => import('./pages/TestAIDashboard'), 'TestAIDashboard');
const BusinessPresentation = createLazyComponent(() => import('./pages/BusinessPresentation'), 'BusinessPresentation');
const BusinessPresentationSlides = createLazyComponent(() => import('./pages/BusinessPresentationSlides'), 'BusinessPresentationSlides');
=======
// Lazy load components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Register = React.lazy(() => import('./pages/Register'));
const Packages = React.lazy(() => import('./pages/Packages'));
const Referrals = React.lazy(() => import('./pages/Referrals'));
const Withdrawals = React.lazy(() => import('./pages/Withdrawals'));
const Security = React.lazy(() => import('./pages/Security'));
const About = React.lazy(() => import('./pages/About'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Genealogy = React.lazy(() => import('./pages/Genealogy'));
const TestnetWithdrawalTester = React.lazy(() => import('./components/TestnetWithdrawalTester'));
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
import { 
  autoReconnectWallet
} from './utils/walletPersistence';
import { initializeMobileSecurity } from './utils/securityHeaders';
import './App.css';
import './styles/mobile-responsive.css';
import './styles/MobileNav.css';
import './styles/ProtectedRoute.css';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userRoles, setUserRoles] = useState({}); // For role-based access control

  // Initialize mobile security on app load
  useEffect(() => {
    initializeMobileSecurity();
  }, []);

<<<<<<< HEAD
  // Check if user should see welcome page
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedWelcome');
    const welcomeShown = sessionStorage.getItem('welcomeShown');
    
    // CRITICAL FIX: Always allow dashboard access
    // Welcome page should never block user navigation
    setShouldShowWelcome(false);
    
    // Mark as visited to prevent future blocking
    if (!hasVisited) {
      localStorage.setItem('hasVisitedWelcome', 'true');
    }
    
    // Clear any blocking session storage
    if (welcomeShown) {
      sessionStorage.removeItem('welcomeShown');
    }
  }, []);

=======
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
  // Auto-reconnect wallet on app load
  useEffect(() => {
    const initializeWalletConnection = async () => {
      setIsConnecting(true);
      
      try {
        const reconnectionSuccess = await autoReconnectWallet(
          async (reconnectedAccount, reconnectedProvider, reconnectedSigner) => {
            setAccount(reconnectedAccount);
            setProvider(reconnectedProvider);
            setSigner(reconnectedSigner);
            
            // TODO: Fetch user roles from smart contract or API
            // For now, basic role assignment based on account
            setUserRoles({ user: true, admin: false });
            
            console.log('Wallet auto-reconnected successfully');
          },
          (error) => {
            console.error('Auto-reconnection failed:', error);
            clearWalletConnection();
          }
        );

        if (!reconnectionSuccess) {
          // Check for manual connection
          await checkExistingConnection();
        }
      } catch (error) {
        console.error('Error during wallet initialization:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          handleDisconnect();
        } else {
          handleWalletConnect(accounts[0]);
        }
      });
      
      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Network changed to:', chainId);
        // Optionally refresh provider/signer or show network change notification
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Extend session on user activity
  useEffect(() => {
    const handleUserActivity = () => {
      if (account) {
        extendSession();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [account]);

  // Preload critical components based on user state
  useEffect(() => {
    const preloadCriticalComponents = async () => {
      try {
        if (account) {
          // Preload user-specific components
          await preloadComponents([
            () => import('./pages/Dashboard'),
            () => import('./pages/Packages'),
            () => import('./pages/Referrals')
          ]);
        } else {
          // Preload public components
          await preloadComponents([
            () => import('./pages/Home'),
            () => import('./pages/Register'),
            () => import('./pages/About')
          ]);
        }
      } catch (error) {
        console.warn('Component preloading failed:', error);
      }
    };

    // Delay preloading to not interfere with initial load
    const timer = setTimeout(preloadCriticalComponents, 1000);
    return () => clearTimeout(timer);
  }, [account]);

  const checkExistingConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setAccount(accounts[0]);
          setProvider(provider);
          setSigner(signer);
          setUserRoles({ user: true, admin: false }); // TODO: Fetch actual roles
          
          // Store connection for persistence
          storeWalletConnection(accounts[0], network.chainId.toString(), 'metamask');
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    }
  };

  const handleWalletConnect = async (connectionData) => {
    setIsConnecting(true);
    try {
      // Handle both old format (separate params) and new format (object)
      let connectedAccount, web3Provider, web3Signer, walletType, chainId;
      
      if (typeof connectionData === 'object' && connectionData.address) {
        // New format from UnifiedWalletConnect and WalletConnector
        connectedAccount = connectionData.address;
        web3Provider = connectionData.provider;
        web3Signer = connectionData.signer;
        walletType = connectionData.walletType || 'unknown';
        chainId = connectionData.chainId;
      } else if (typeof connectionData === 'string') {
        // Old format from account change events
        connectedAccount = connectionData;
        web3Provider = arguments[1];
        web3Signer = arguments[2];
        walletType = 'metamask'; // Assume MetaMask for legacy calls
      } else {
        // Fallback for direct parameters
        connectedAccount = arguments[0];
        web3Provider = arguments[1];
        web3Signer = arguments[2];
        walletType = 'unknown';
      }

      // Validate account format - ensure it's a string
      if (!connectedAccount || typeof connectedAccount !== 'string') {
        throw new Error('Invalid account address provided');
      }

      if (connectedAccount && web3Provider && web3Signer) {
        // Direct connection with provided parameters
        setAccount(connectedAccount);
        setProvider(web3Provider);
        setSigner(web3Signer);
        setUserRoles({ user: true, admin: false }); // TODO: Fetch actual roles
        
        // Store connection for persistence
        if (!chainId) {
          const network = await web3Provider.getNetwork();
          chainId = network.chainId.toString();
        }
        storeWalletConnection(connectedAccount, chainId, walletType);
        
        console.log('✅ Wallet connected successfully:', {
          account: connectedAccount,
          walletType: walletType,
          chainId: chainId
        });
      } else if (connectedAccount && !web3Provider) {
        // Account changed event - recreate provider and signer
        if (!window.ethereum) {
          throw new Error('No Ethereum provider available');
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setAccount(connectedAccount);
        setProvider(provider);
        setSigner(signer);
        setUserRoles({ user: true, admin: false }); // TODO: Fetch actual roles
        
        // Store connection for persistence
        storeWalletConnection(connectedAccount, network.chainId.toString(), walletType);
        
        console.log('✅ Wallet reconnected successfully:', connectedAccount);
      }
    } catch (error) {
      console.error('Error in wallet connect:', error);
      // Show user-friendly error message
      if (error.message.includes('User rejected')) {
        console.log('User rejected wallet connection');
      } else {
        alert(`Wallet connection failed: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setUserRoles({});
    setIsConnecting(false);
    clearWalletConnection();
  };

  // Debug function for development
  const debugWalletConnection = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Running wallet diagnostics...');
      const results = await runWalletDiagnostics();
      console.log('📊 Diagnostic results:', results);
      return results;
    }
  };

  // Add debug tools to global scope in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.leadfiveDebug = {
        debugWallet: debugWalletConnection,
        currentState: {
          account,
          isConnecting,
          userRoles,
          hasProvider: !!provider,
          hasSigner: !!signer
        }
      };
    }
  }, [account, isConnecting, userRoles, provider, signer]);

  return (
    <>
    <ErrorBoundary>
      {/* Mobile Performance Monitoring */}
      <MobilePerformanceMonitor />
      
      <Router>
        <MobileNav 
          account={account} 
          onDisconnect={handleDisconnect}
        />
<<<<<<< HEAD
        
        {/* PWA Install Prompt for Mobile */}
        <MobilePWAPrompt />
        
        {shouldShowWelcome ? (
          <Suspense fallback={<LoadingSpinner message="Loading Welcome..." />}>
            <Routes>
              <Route path="*" element={<Welcome />} />
            </Routes>
          </Suspense>
        ) : (
          <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
            <Routes>
              <Route path="/" element={
                <>
                  <Header 
                    account={account} 
=======
        <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
          <Routes>
            <Route path="/" element={
              <>
                <Header 
                  account={account} 
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect} 
                />
                <div className="App">
                  <Home 
                    account={account}
                    provider={provider}
                    signer={signer}
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect}
                  />
                </div>
                <Footer />
              </>
            } />
            <Route path="/home" element={
                <>
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <Home 
                      account={account}
                      provider={provider}
                      signer={signer}
                      onConnect={handleWalletConnect}
                      onDisconnect={handleDisconnect}
                    />
                  </div>
                  <Footer />
                </>
              } />
              <Route path="/register" element={
                <UserRoute 
                  account={account} 
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                >
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <Register 
                      account={account}
                      provider={provider}
                      signer={signer}
                      onConnect={handleWalletConnect}
                      onDisconnect={handleDisconnect}
                    />
                  </div>
                  <Footer />
                </UserRoute>
              } />
              <Route path="/packages" element={
                <UserRoute 
                  account={account} 
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                >
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <Packages 
                      account={account}
                      provider={provider}
                      signer={signer}
                      onConnect={handleWalletConnect}
                      onDisconnect={handleDisconnect}
                    />
                  </div>
                  <Footer />
                </UserRoute>
              } />
              <Route path="/referrals" element={
                <UserRoute 
                  account={account} 
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                >
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <Referrals 
                      account={account}
                      provider={provider}
                      signer={signer}
                      onConnect={handleWalletConnect}
                      onDisconnect={handleDisconnect}
                    />
                  </div>
                  <Footer />
                </UserRoute>
              } />
              <Route path="/genealogy" element={
                <UserRoute 
                  account={account} 
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                >
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <Genealogy 
                      account={account}
                      provider={provider}
                      signer={signer}
                      onConnect={handleWalletConnect}
                      onDisconnect={handleDisconnect}
                    />
                  </div>
                  <Footer />
                </UserRoute>
              } />
              <Route path="/withdrawals" element={
                <UserRoute 
                  account={account} 
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                >
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <Withdrawals 
                      account={account}
                      provider={provider}
                      signer={signer}
                      onConnect={handleWalletConnect}
                      onDisconnect={handleDisconnect}
                    />
                  </div>
                  <Footer />
                </UserRoute>
              } />
              <Route path="/security" element={
                <UserRoute 
                  account={account} 
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                >
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <Security 
                      account={account}
                      provider={provider}
                      signer={signer}
                      onConnect={handleWalletConnect}
                      onDisconnect={handleDisconnect}
                    />
                  </div>
                  <Footer />
                </UserRoute>
              } />
              <Route path="/about" element={
                <>
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <About 
                      account={account}
                      provider={provider}
                      signer={signer}
                      onConnect={handleWalletConnect}
                      onDisconnect={handleDisconnect}
                    />
                  </div>
                  <Footer />
                </>
              } />
              <Route path="/dashboard" element={
                <UserRoute 
                  account={account} 
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                >
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <Dashboard 
                      account={account} 
                      provider={provider} 
                      signer={signer} 
                    />
                  </div>
                  <Footer />
                </UserRoute>
              } />
              <Route path="/testnet-withdrawal" element={
                <>
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <TestnetWithdrawalTester />
                  </div>
                  <Footer />
                </>
              } />
              <Route path="/business-presentation" element={
                <>
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <BusinessPresentation />
                  </div>
                  <Footer />
                </>
              } />
              <Route path="/business-slides" element={
                <BusinessPresentationSlides />
              } />
            </Routes>
          </Suspense>
    </Router>
    </ErrorBoundary>
    </>
  );
}

export default App;
