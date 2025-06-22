import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute, { UserRoute, AdminRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Register from './pages/Register';
import Packages from './pages/Packages';
import Referrals from './pages/Referrals';
import Withdrawals from './pages/Withdrawals';
import Security from './pages/Security';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import BrandGuide from './pages/BrandGuide';
import Genealogy from './pages/Genealogy';
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
    if (!hasVisited) {
      setShouldShowWelcome(true);
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

  const checkExistingConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const { ethers } = await import('ethers');
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
        const { ethers } = await import('ethers');
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
    <ErrorBoundary>
      <Router>
        <MobileNav 
          account={account} 
          onDisconnect={handleDisconnect}
        />
        {shouldShowWelcome ? (
          <Routes>
            <Route path="*" element={<Welcome />} />
          </Routes>
        ) : (
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
      </Routes>
      )}
    </Router>
    </ErrorBoundary>
  );
}

export default App;
