// Mobile Navigation Component for PWA
import React, { useState, useEffect } from 'react';
import '../styles/mobile-nav.css';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNavigation = ({ 
  currentView = 'landing',
  walletConnected = false,
  onNavigate = () => {},
  alerts = [],
  onClearAlert = () => {},
  showInstallPrompt = false,
  onInstallClick = () => {}
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Navigation items for the new user journey flow
  const getNavItems = () => {
    const baseItems = [
      {
        id: 'landing',
        label: 'Home',
        icon: '🏠',
        badge: null,
        available: true
      },
      {
        id: 'wallet',
        label: walletConnected ? 'Wallet' : 'Connect',
        icon: walletConnected ? '🔗' : '👛',
        badge: null,
        available: true
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        badge: null,
        available: walletConnected
      }
    ];

    // Add more menu if we have alerts or additional features
    if (alerts.length > 0 || showInstallPrompt) {
      baseItems.push({
        id: 'more',
        label: 'More',
        icon: '⋯',
        badge: alerts.length > 0 ? alerts.length.toString() : null,
        available: true
      });
    }

    return baseItems;
  };

  // Auto-hide navigation on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (item) => {
    if (item.id === 'more') {
      showMoreMenu();
    } else if (item.available) {
      onNavigate(item.id);
    } else {
      // Show message for unavailable options
      if (item.id === 'dashboard' && !walletConnected) {
        showWalletRequiredMessage();
      }
    }
  };

  const showWalletRequiredMessage = () => {
    const message = document.createElement('div');
    message.className = 'wallet-required-message';
    message.innerHTML = `
      <div class="message-overlay" onclick="this.parentElement.remove()"></div>
      <div class="message-content">
        <div class="message-icon">🔗</div>
        <h3>Wallet Required</h3>
        <p>Please connect your wallet to access the dashboard</p>
        <button onclick="window.navToWallet?.(); this.closest('.wallet-required-message').remove();" class="connect-wallet-btn">
          Connect Wallet
        </button>
        <button onclick="this.closest('.wallet-required-message').remove();" class="cancel-btn">
          Cancel
        </button>
      </div>
    `;

    window.navToWallet = () => onNavigate('wallet');
    document.body.appendChild(message);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 5000);
  };

  const showMoreMenu = () => {
    const alertsHtml = alerts.length > 0 ? `
      <div class="more-menu-section">
        <h4>Recent Alerts (${alerts.length})</h4>
        ${alerts.slice(0, 3).map(alert => `
          <div class="alert-item ${alert.type}">
            <span class="alert-message">${alert.message}</span>
            <button onclick="window.clearAlert?.(${alert.id}); this.closest('.alert-item').remove();" class="clear-alert-btn">×</button>
          </div>
        `).join('')}
        ${alerts.length > 3 ? `<div class="alert-more">+${alerts.length - 3} more</div>` : ''}
      </div>
    ` : '';

    const walletSection = walletConnected ? `
      <div class="more-menu-section">
        <h4>Wallet Connected</h4>
        <div class="wallet-status">
          <span class="status-indicator connected">●</span>
          <span>Wallet is connected and ready</span>
        </div>
      </div>
    ` : `
      <div class="more-menu-section">
        <h4>Connect Wallet</h4>
        <button onclick="window.navToWallet?.(); this.closest('.mobile-more-menu').remove();" class="connect-wallet-action">
          <span class="item-icon">🔗</span>
          <div class="item-content">
            <span class="item-label">Connect Your Wallet</span>
            <span class="item-desc">Access OrphiChain features</span>
          </div>
        </button>
      </div>
    `;

    const menu = document.createElement('div');
    menu.className = 'mobile-more-menu';
    menu.innerHTML = `
      <div class="more-menu-overlay" onclick="this.parentElement.remove()"></div>
      <div class="more-menu-content">
        <div class="more-menu-header">
          <h3>OrphiChain Menu</h3>
          <button onclick="this.closest('.mobile-more-menu').remove()" class="close-btn">×</button>
        </div>
        ${walletSection}
        ${alertsHtml}
        <div class="more-menu-items">
          ${showInstallPrompt ? `
            <button onclick="window.pwaInstaller?.(); this.closest('.mobile-more-menu').remove();" class="more-menu-item install-item">
              <span class="item-icon">📱</span>
              <div class="item-content">
                <span class="item-label">Install App</span>
                <span class="item-desc">Add OrphiChain to home screen</span>
              </div>
            </button>
          ` : ''}
          <button onclick="window.navToLanding?.(); this.closest('.mobile-more-menu').remove();" class="more-menu-item">
            <span class="item-icon">ℹ️</span>
            <div class="item-content">
              <span class="item-label">About OrphiChain</span>
              <span class="item-desc">Learn more about our platform</span>
            </div>
          </button>
        </div>
      </div>
    `;

    // Set up window functions for callbacks
    window.clearAlert = onClearAlert;
    window.navToWallet = () => onNavigate('wallet');
    window.navToLanding = () => onNavigate('landing');
    window.pwaInstaller = onInstallClick;

    document.body.appendChild(menu);
  };

  // Touch feedback for nav items
  const handleTouchStart = (e) => {
    e.currentTarget.classList.add('touching');
  };

  const handleTouchEnd = (e) => {
    e.currentTarget.classList.remove('touching');
  };

  return (
    <div className="mobile-nav-container">
      {/* Alerts */}
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            className={`alert ${alert.type}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <span className="alert-icon">
              {alert.type === 'success' ? '✅' : alert.type === 'error' ? '❌' : '⚠️'}
            </span>
            <span className="alert-message">{alert.message}</span>
            <button
              className="alert-close"
              onClick={() => onClearAlert(alert.id)}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <nav className={`mobile-navigation ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="nav-background"></div>
        <div className="nav-content">
          {getNavItems().map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''} ${!item.available ? 'disabled' : ''}`}
              onClick={() => handleNavClick(item)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              aria-label={item.label}
              disabled={!item.available}
            >
              <div className="nav-icon">
                {item.icon}
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {!item.available && (
                  <span className="nav-lock">🔒</span>
                )}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileNavigation;
