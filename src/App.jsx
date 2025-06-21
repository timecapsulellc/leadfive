import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
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
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);

  // Check if user should see welcome page
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedWelcome');
    if (!hasVisited) {
      setShouldShowWelcome(true);
    }
  }, []);

  // Check for existing wallet connection on app load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Restore connection if wallet was previously connected
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      }
    };

    checkExistingConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          handleDisconnect();
        } else {
          // Auto-reconnect if account changed
          handleWalletConnect(accounts[0]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const handleWalletConnect = async (connectedAccount, web3Provider, web3Signer) => {
    setIsConnecting(true);
    try {
      if (connectedAccount && web3Provider && web3Signer) {
        // Direct connection with provided parameters
        setAccount(connectedAccount);
        setProvider(web3Provider);
        setSigner(web3Signer);
      } else if (connectedAccount && !web3Provider) {
        // Account changed event - recreate provider and signer
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setAccount(connectedAccount);
        setProvider(provider);
        setSigner(signer);
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
    setIsConnecting(false);
  };

  return (
    <ErrorBoundary>
      <Router>
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
          <>
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
          </>
        } />
        <Route path="/packages" element={
          <>
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
          </>
        } />
        <Route path="/referrals" element={
          <>
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
          </>
        } />
        <Route path="/genealogy" element={
          <>
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
          </>
        } />
        <Route path="/withdrawals" element={
          <>
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
          </>
        } />
        <Route path="/security" element={
          <>
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
          </>
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
          <>
            <Header 
              account={account} 
              onConnect={handleWalletConnect}
              onDisconnect={handleDisconnect} 
            />
            <div className="App">
              {account ? (
                <Dashboard 
                  account={account} 
                  provider={provider} 
                  signer={signer} 
                />
              ) : (
                <Home 
                  account={account}
                  provider={provider}
                  signer={signer}
                  onConnect={handleWalletConnect}
                  onDisconnect={handleDisconnect}
                />
              )}
            </div>
            <Footer />
          </>
        } />
      </Routes>
      )}
    </Router>
    </ErrorBoundary>
  );
}

export default App;
