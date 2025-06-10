import React, { useState, Suspense, memo, useCallback, useEffect } from 'react'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary'
import FallbackComponent from './FallbackComponent'

// Main User Journey Components
import LandingPage from './components/LandingPage'
import WalletConnection from './components/WalletConnection'
import OrphiDashboard from './OrphiDashboard'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import MobileNavigation from './components/MobileNavigation'

// PWA and Notification Services
import './services/NotificationService.js'

function App() {
  // User Journey States
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'wallet', 'dashboard'
  const [walletConnected, setWalletConnected] = useState(false)
  const [userAccount, setUserAccount] = useState(null)
  const [networkId, setNetworkId] = useState(null)
  const [walletProvider, setWalletProvider] = useState(null)
  
  // PWA and notification state
  const [isPWAInstallable, setIsPWAInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [notificationStatus, setNotificationStatus] = useState('default')
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing wallet connection on app load
  useEffect(() => {
    checkExistingConnection()
  }, [])

  // Check if wallet is already connected (but stay on landing page)
  const checkExistingConnection = async () => {
    setIsLoading(true)
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        })
        
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ 
            method: 'eth_chainId' 
          })
          
          setUserAccount(accounts[0])
          setNetworkId(parseInt(chainId, 16))
          setWalletConnected(true) // Mark as connected but stay on landing
        }
      }
    } catch (error) {
      console.error('Error checking existing connection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation Functions
  const navigateToLanding = useCallback(() => {
    setCurrentView('landing')
  }, [])

  const navigateToWallet = useCallback(() => {
    setCurrentView('wallet')
  }, [])

  const navigateToDashboard = useCallback(() => {
    if (walletConnected) {
      setCurrentView('dashboard')
    } else {
      navigateToWallet()
    }
  }, [walletConnected])

  // Wallet Connection Handlers
  const handleWalletConnected = useCallback((account, network, provider) => {
    setUserAccount(account)
    setNetworkId(network)
    setWalletProvider(provider)
    setWalletConnected(true)
    
    // Show success and navigate to dashboard
    showAlert('🎉 Wallet connected successfully!', 'success')
    setTimeout(() => {
      navigateToDashboard()
    }, 1500)
  }, [navigateToDashboard])

  const handleWalletDisconnected = useCallback(() => {
    setUserAccount(null)
    setNetworkId(null)
    setWalletProvider(null)
    setWalletConnected(false)
    
    showAlert('👋 Wallet disconnected', 'info')
    navigateToLanding()
  }, [navigateToLanding])

  // PWA beforeinstallprompt event listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsPWAInstallable(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsPWAInstallable(false)
      showAlert('🎉 OrphiChain PWA installed successfully!', 'success')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Alert System
  const showAlert = useCallback((message, type = 'info', duration = 5000) => {
    const alert = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }
    
    setAlerts(prev => [alert, ...prev.slice(0, 4)]) // Keep last 5 alerts
    
    if (duration > 0) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id))
      }, duration)
    }
    
    return alert.id
  }, [])

  // PWA install handler
  const handlePWAInstall = useCallback(async () => {
    if (!deferredPrompt) return false

    try {
      const result = await deferredPrompt.prompt()
      if (result.outcome === 'accepted') {
        showAlert('🎉 Installing OrphiChain PWA...', 'success')
      }
      setDeferredPrompt(null)
      setIsPWAInstallable(false)
      return result.outcome === 'accepted'
    } catch (error) {
      console.error('PWA install failed:', error)
      showAlert('❌ PWA installation failed', 'error')
      return false
    }
  }, [deferredPrompt, showAlert])

  // Notification permission handler
  const handleNotificationPermission = useCallback(async () => {
    if (!window.OrphiNotifications) {
      showAlert('❌ Notifications not supported', 'error')
      return false
    }

    try {
      await window.OrphiNotifications.requestPermission()
      
      // Register with push server if we have user info
      const userId = 'demo-user-' + Date.now() // In real app, get from wallet/auth
      const walletAddress = '0x' + Math.random().toString(16).substring(2, 42) // Demo address
      
      await window.OrphiNotifications.subscribeWithServer(null, userId, walletAddress)
      
      setNotificationStatus('granted')
      showAlert('🔔 Push notifications enabled for OrphiChain', 'success')
      return true
    } catch (error) {
      console.error('Notification permission failed:', error)
      showAlert('❌ Notification permission denied', 'error')
      return false
    }
  }, [showAlert])

  // Optimize navigation handler with useCallback
  const handleNavigation = useCallback((view) => {
    switch(view) {
      case 'landing':
        navigateToLanding()
        break
      case 'wallet':
        navigateToWallet()
        break
      case 'dashboard':
        navigateToDashboard()
        break
      default:
        navigateToLanding()
    }
  }, [navigateToLanding, navigateToWallet, navigateToDashboard])

  // Render function for current view
  const renderCurrentView = () => {
    const LoadingFallback = () => (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading OrphiChain...</p>
      </div>
    )

    switch(currentView) {
      case 'landing':
        return (
          <div className="view-transition">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <LandingPage 
                  onConnectWallet={navigateToWallet}
                  onLearnMore={() => {
                    showAlert('📚 Learn more section coming soon!', 'info')
                  }}
                  stats={{
                    totalUsers: '10,000+',
                    totalInvested: '$2.5M+',
                    activeProjects: '150+',
                    networkNodes: '500+'
                  }}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        )

      case 'wallet':
        return (
          <div className="view-transition">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <WalletConnection 
                  onWalletConnected={handleWalletConnected}
                  onGoBack={navigateToLanding}
                  isConnected={walletConnected}
                  currentAccount={userAccount}
                  currentNetwork={networkId}
                  onAlert={showAlert}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        )

      case 'dashboard':
        return (
          <div className="view-transition">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <OrphiDashboard 
                  demoMode={false}
                  userAccount={userAccount}
                  networkId={networkId}
                  walletProvider={walletProvider}
                  onDisconnect={handleWalletDisconnected}
                  onAlert={showAlert}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        )

      default:
        return (
          <div className="view-transition">
            <ErrorBoundary>
              <LandingPage onConnectWallet={navigateToWallet} />
            </ErrorBoundary>
          </div>
        )
    }
  }

  return (
    <div className="app">
      {/* Global Loading State */}
      {isLoading && (
        <div className="global-loading-overlay">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Initializing OrphiChain...</p>
          </div>
        </div>
      )}
      
      <ErrorBoundary fallback={<FallbackComponent />}>
        {/* Dynamic Header based on current view */}
        {currentView !== 'landing' && (
          <header className="app-header">
            <div className="header-content">
              <div className="header-left">
                <button 
                  className="logo-button"
                  onClick={navigateToLanding}
                  title="Return to Home"
                >
                  <span className="logo-text">OrphiChain</span>
                </button>
              </div>
              <div className="header-center">
                <nav className="breadcrumb-nav">
                  <span 
                    className={`breadcrumb-item ${currentView === 'landing' ? 'active' : ''}`}
                    onClick={navigateToLanding}
                  >
                    Home
                  </span>
                  {currentView !== 'landing' && (
                    <>
                      <span className="breadcrumb-separator">→</span>
                      <span 
                        className={`breadcrumb-item ${currentView === 'wallet' ? 'active' : ''}`}
                        onClick={currentView === 'dashboard' ? navigateToWallet : undefined}
                      >
                        {currentView === 'wallet' ? 'Connect Wallet' : 'Wallet'}
                      </span>
                    </>
                  )}
                  {currentView === 'dashboard' && (
                    <>
                      <span className="breadcrumb-separator">→</span>
                      <span className="breadcrumb-item active">
                        Dashboard
                      </span>
                    </>
                  )}
                </nav>
              </div>
              <div className="header-right">
                {walletConnected && userAccount && (
                  <div className="wallet-info">
                    <span className="wallet-address">
                      {userAccount.slice(0, 6)}...{userAccount.slice(-4)}
                    </span>
                    <button 
                      className="disconnect-button"
                      onClick={handleWalletDisconnected}
                      title="Disconnect Wallet"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="main-content">
          <div className={`content-container ${currentView}`}>
            {isLoading ? (
              <div className="global-loading">
                <div className="loading-spinner large"></div>
                <p>Loading OrphiChain...</p>
              </div>
            ) : (
              renderCurrentView()
            )}
          </div>
        </main>

        {/* Footer - only show on landing page */}
        {currentView === 'landing' && (
          <footer className="app-footer">
            <div className="footer-content">
              <div className="footer-links">
                <a href="#privacy" onClick={(e) => { e.preventDefault(); showAlert('📋 Privacy Policy coming soon!', 'info') }}>Privacy</a>
                <a href="#terms" onClick={(e) => { e.preventDefault(); showAlert('📄 Terms of Service coming soon!', 'info') }}>Terms</a>
                <a href="#docs" onClick={(e) => { e.preventDefault(); showAlert('📚 Documentation coming soon!', 'info') }}>Docs</a>
              </div>
              <span>&copy; 2025 OrphiChain - Decentralized Crowdfunding Platform</span>
            </div>
          </footer>
        )}

        {/* PWA Install Prompt */}
        <PWAInstallPrompt 
          isInstallable={isPWAInstallable}
          onInstall={handlePWAInstall}
          onNotificationRequest={handleNotificationPermission}
        />

        {/* Mobile Navigation - Updated for new flow */}
        <MobileNavigation 
          currentView={currentView}
          walletConnected={walletConnected}
          onNavigate={handleNavigation}
          alerts={alerts}
          onClearAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
        />

        {/* Alert System */}
        {alerts.length > 0 && (
          <div className="alert-container">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert alert-${alert.type}`}>
                <span className="alert-message">{alert.message}</span>
                <button 
                  className="alert-close"
                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}

export default memo(App)
