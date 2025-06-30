import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute, { UserRoute, AdminRoute } from './components/ProtectedRoute';
import { withLazyLoading, LoadingSpinner, preloadComponents } from './components/LazyLoader';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';

// Lazy load components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Register = React.lazy(() => import('./pages/Register'));
const Packages = React.lazy(() => import('./pages/Packages'));
const Referrals = React.lazy(() => import('./pages/Referrals'));
const Withdrawals = React.lazy(() => import('./pages/Withdrawals'));
const Security = React.lazy(() => import('./pages/Security'));
const About = React.lazy(() => import('./pages/About'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Welcome = React.lazy(() => import('./pages/Welcome'));
const BrandGuide = React.lazy(() => import('./pages/BrandGuide'));
const Genealogy = React.lazy(() => import('./pages/Genealogy'));
const TestAIDashboard = React.lazy(() => import('./pages/TestAIDashboard'));
import { 
  storeWalletConnection, 
  autoReconnectWallet, 
  clearWalletConnection, 
  extendSession 
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
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
  const [userRoles, setUserRoles] = useState({}); // For role-based access control

  // Initialize mobile security on app load
  useEffect(() => {
    initializeMobileSecurity();
  }, []);

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

  const handleWalletConnect = async (connectedAccount, web3Provider, web3Signer) => {
    setIsConnecting(true);
    try {
      if (connectedAccount && web3Provider && web3Signer) {
        // Direct connection with provided parameters
        setAccount(connectedAccount);
        setProvider(web3Provider);
        setSigner(web3Signer);
        setUserRoles({ user: true, admin: false }); // TODO: Fetch actual roles
        
        // Store connection for persistence
        const network = await web3Provider.getNetwork();
        storeWalletConnection(connectedAccount, network.chainId.toString(), 'metamask');
      } else if (connectedAccount && !web3Provider) {
        // Account changed event - recreate provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setAccount(connectedAccount);
        setProvider(provider);
        setSigner(signer);
        setUserRoles({ user: true, admin: false }); // TODO: Fetch actual roles
        
        // Store connection for persistence
        storeWalletConnection(connectedAccount, network.chainId.toString(), 'metamask');
      }
    } catch (error) {
      console.error('Error in wallet connect:', error);
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

  return (
    <>
    <ErrorBoundary>
      <Router>
        <MobileNav 
          account={account} 
          onDisconnect={handleDisconnect}
        />
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
              <Route path="/welcome" element={<Welcome />} />
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
              <Route path="/brand-guide" element={
                <>
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <BrandGuide 
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
              <Route path="/test-ai" element={
                <>
                  <Header 
                    account={account} 
                    onConnect={handleWalletConnect}
                    onDisconnect={handleDisconnect} 
                  />
                  <div className="App">
                    <TestAIDashboard />
                  </div>
                  <Footer />
                </>
              } />
            </Routes>
          </Suspense>
        )}
    </Router>
    </ErrorBoundary>
    </>
  );
}

export default App;
