import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ErrorBoundary from './components/ErrorBoundary';
import { UserRoute } from './components/ProtectedRoute';
import { LoadingSpinner, preloadComponents } from './components/LazyLoader';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config/contracts';
import { contractService } from './services/ContractService';

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

// Section components for direct routing
const EarningsSection = React.lazy(() => import('./components/sections/EarningsSection'));
const ReferralsSection = React.lazy(() => import('./components/sections/ReferralsSection'));
const WithdrawalsSection = React.lazy(() => import('./components/sections/WithdrawalsSection'));
// BinaryTreeSection removed - redirecting to /genealogy instead
import {
  storeWalletConnection,
  autoReconnectWallet,
  clearWalletConnection,
  extendSession,
} from './utils/walletPersistence';
import { initializeMobileSecurity } from './utils/securityHeaders';
import './App.css';
import './styles/mobile-responsive.css';
import './styles/MobileNav.css';
import './styles/ProtectedRoute.css';

// Route wrapper component to eliminate duplicate code
const RouteWrapper = ({
  children,
  account,
  onConnect,
  onDisconnect,
  isFullscreen = false,
}) => {
  if (isFullscreen) {
    // Full-screen layout for dashboard and special pages
    return <div className="App fullscreen-app">{children}</div>;
  }

  // Standard layout with header and footer
  return (
    <>
      <Header
        account={account}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />
      <div className="App">{children}</div>
      <Footer />
    </>
  );
};

// Protected route wrapper for user routes
const ProtectedRouteWrapper = ({
  children,
  account,
  onConnect,
  onDisconnect,
  isFullscreen = false,
}) => (
  <UserRoute
    account={account}
    // isConnecting and userRoles removed for production
  >
    <RouteWrapper
      account={account}
      // isConnecting and userRoles removed for production
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      isFullscreen={isFullscreen}
    >
      {children}
    </RouteWrapper>
  </UserRoute>
);

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userRoles, setUserRoles] = useState({});

  // Initialize contract instance when provider and signer are available
  useEffect(() => {
    const initializeContract = async () => {
      if (provider && signer) {
        try {
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );
          setContractInstance(contract);
          
          // Initialize contract service
          await contractService.initialize(provider, account);
          
          // Contract instance initialized - console.log removed for production
        } catch (error) {
          console.error('Error initializing contract:', error);
          setContractInstance(null);
        }
      } else {
        setContractInstance(null);
      }
    };

    initializeContract();
  }, [provider, signer]);

  // Initialize mobile security on app load
  useEffect(() => {
    initializeMobileSecurity();
  }, []);

  // Consolidated wallet connection logic
  const connectWallet = async (connectedAccount, web3Provider, web3Signer) => {
    try {
      let finalProvider = web3Provider;
      let finalSigner = web3Signer;

      // If provider/signer not provided, create them
      if (!finalProvider && window.ethereum) {
        finalProvider = new ethers.BrowserProvider(window.ethereum);
        finalSigner = await finalProvider.getSigner();
      }

      if (finalProvider && finalSigner) {
        setAccount(connectedAccount);
        setProvider(finalProvider);
        setSigner(finalSigner);
        setUserRoles({ user: true, admin: false }); // TODO: Fetch actual roles

        // Store connection for persistence
        const network = await finalProvider.getNetwork();
        storeWalletConnection(
          connectedAccount,
          network.chainId.toString(),
          'metamask'
        );
      }
    } catch (error) {
      console.error('Error in wallet connect:', error);
    }
  };

  const handleWalletConnect = async (
    connectedAccount,
    web3Provider,
    web3Signer
  ) => {
    setIsConnecting(true);
    await connectWallet(connectedAccount, web3Provider, web3Signer);
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContractInstance(null);
    setUserRoles({});
    setIsConnecting(false);
    clearWalletConnection();
  };

  // Auto-reconnect wallet on app load
  useEffect(() => {
    const initializeWalletConnection = async () => {
      setIsConnecting(true);

      try {
        const reconnectionSuccess = await autoReconnectWallet(
          async (
            reconnectedAccount,
            reconnectedProvider,
            reconnectedSigner
          ) => {
            await connectWallet(
              reconnectedAccount,
              reconnectedProvider,
              reconnectedSigner
            );
            // Wallet auto-reconnected - console.log removed for production
          },
          error => {
            console.error('Auto-reconnection failed:', error);
            clearWalletConnection();
          }
        );

        if (!reconnectionSuccess && window.ethereum) {
          // Check for existing connection
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            await connectWallet(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Error during wallet initialization:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeWalletConnection();

    // Set up event listeners
    if (window.ethereum) {
      const handleAccountsChanged = accounts => {
        if (accounts.length === 0) {
          handleDisconnect();
        } else {
          handleWalletConnect(accounts[0]);
        }
      };

      const handleChainChanged = chainId => {
        // Network changed - console.log removed for production
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Extend session on user activity
  useEffect(() => {
    if (!account) return;

    const handleUserActivity = () => extendSession();
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
        const componentsToPreload = account
          ? [
              () => import('./pages/Dashboard'),
              () => import('./pages/Packages'),
              () => import('./pages/Referrals'),
              () => import('./components/sections/EarningsSection'),
              () => import('./components/sections/ReferralsSection'),
              () => import('./components/sections/WithdrawalsSection'),
              () => import('./components/sections/BinaryTreeSection'),
            ]
          : [
              () => import('./pages/Home'),
              () => import('./pages/Register'),
              () => import('./pages/About'),
            ];

        await preloadComponents(componentsToPreload);
      } catch (error) {
        // Component preloading failed - warning removed for production
      }
    };

    const timer = setTimeout(preloadCriticalComponents, 1000);
    return () => clearTimeout(timer);
  }, [account]);

  // Common props for all components
  const commonProps = {
    account,
    provider,
    signer,
    contractInstance,
    onConnect: handleWalletConnect,
    onDisconnect: handleDisconnect,
  };

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MobileNav account={account} onDisconnect={handleDisconnect} />
        <Suspense
          fallback={<LoadingSpinner message="Loading application..." />}
        >
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <RouteWrapper {...commonProps}>
                  <Home {...commonProps} />
                </RouteWrapper>
              }
            />

            <Route
              path="/home"
              element={
                <RouteWrapper {...commonProps}>
                  <Home {...commonProps} />
                </RouteWrapper>
              }
            />

            <Route
              path="/about"
              element={
                <RouteWrapper {...commonProps}>
                  <About {...commonProps} />
                </RouteWrapper>
              }
            />

            {/* Protected routes */}
            <Route
              path="/register"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                >
                  <Register {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/packages"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                >
                  <Packages {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                  isFullscreen={true}
                >
                  <Dashboard {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/withdrawals"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                  isFullscreen={true}
                >
                  <Withdrawals {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/referrals"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                  isFullscreen={true}
                >
                  <Referrals {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/genealogy"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                  isFullscreen={true}
                >
                  <Genealogy {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/security"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                >
                  <Security {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            {/* Section Routes - Direct access to dashboard sections */}
            <Route
              path="/dashboard/earnings"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                  isFullscreen={true}
                >
                  <EarningsSection {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/dashboard/referrals"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                  isFullscreen={true}
                >
                  <ReferralsSection {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/dashboard/withdrawals"
              element={
                <ProtectedRouteWrapper
                  account={account}
                  isConnecting={isConnecting}
                  userRoles={userRoles}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                  isFullscreen={true}
                >
                  <WithdrawalsSection {...commonProps} />
                </ProtectedRouteWrapper>
              }
            />

            <Route
              path="/dashboard/tree"
              element={
                <Navigate to="/genealogy" replace />
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
