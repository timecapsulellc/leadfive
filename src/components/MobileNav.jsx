import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaChartLine, 
  FaNetworkWired, 
  FaUsers, 
  FaWallet,
  FaBars,
  FaTimes,
  FaCog,
  FaShoppingBag,
  FaSignOutAlt
} from 'react-icons/fa';
import '../styles/MobileNav.css';
import '../styles/advanced-mobile-optimization.css';
import '../styles/next-gen-mobile-optimization.css';

const MobileNav = ({ account, onDisconnect }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Fix mobile viewport height issues
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--mobile-vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Memoize navigation items for better performance
  const navItems = useMemo(() => [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/dashboard', label: 'Dashboard', icon: FaChartLine, requiresAuth: true },
    { path: '/genealogy', label: 'Network', icon: FaNetworkWired, requiresAuth: true },
    { path: '/packages', label: 'Packages', icon: FaShoppingBag },
    { path: '/referrals', label: 'Team', icon: FaUsers, requiresAuth: true }
  ], []);

  // Optimize navigation handler with useCallback
  const handleNavClick = useCallback((path, requiresAuth) => {
    if (requiresAuth && !account) {
      navigate('/register');
    } else {
      navigate(path);
    }
    setIsOpen(false);
  }, [account, navigate]);

  // Optimize active state check
  const isActive = useCallback((path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  }, [location.pathname]);

  // Close menu when clicking outside
  const handleOverlayClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Prevent event bubbling on menu content
  const handleMenuClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const displayAddress = typeof account === 'string'
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';

  return (
    <>
      {/* Mobile Menu Toggle with enhanced accessibility */}
      <button 
        className="mobile-menu-toggle gpu-accelerate touch-haptic mobile-touch-target"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Navigation Overlay with backdrop blur */}
      {isOpen && (
        <div 
          className="mobile-nav-overlay gpu-accelerate" 
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        />
      )}

      {/* Enhanced Mobile Navigation Panel */}
      <nav 
        className={`mobile-nav ${isOpen ? 'active' : ''} gpu-accelerate smooth-scroll`}
        role="navigation"
        aria-label="Mobile navigation"
        onClick={handleMenuClick}
      >
        {/* Navigation Header with better branding */}
        <div className="mobile-nav-header">
          <h2 id="mobile-menu-title" className="mobile-text-xl">LeadFive</h2>
          <button 
            className="nav-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            tabIndex={0}
          >
            <FaTimes />
          </button>
        </div>

<<<<<<< HEAD
        {/* Account Status with enhanced UI */}
        {account && (
          <div className="mobile-account-status mobile-p-4">
            <div className="account-info">
              <div className="account-avatar">
                <FaWallet />
              </div>
              <div className="account-details">
                <span className="account-label mobile-text-sm">Connected</span>
                <span className="account-address mobile-text-xs">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
=======
        <div className="mobile-nav-content">
          {account && (
            <div className="mobile-user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <p className="user-address">{displayAddress}</p>
                <span className="user-status">Connected</span>
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation Links with better semantics */}
        <div className="mobile-nav-links" role="menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const disabled = item.requiresAuth && !account;
            
            return (
              <button
                key={item.path}
                className={`mobile-nav-link touch-haptic mobile-touch-target ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => handleNavClick(item.path, item.requiresAuth)}
                disabled={disabled}
                role="menuitem"
                tabIndex={0}
                aria-current={active ? 'page' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNavClick(item.path, item.requiresAuth);
                  }
                }}
              >
                <Icon className="nav-icon" />
                <span className="nav-label mobile-text-base">{item.label}</span>
                {item.requiresAuth && !account && (
                  <span className="auth-required mobile-text-xs">Login Required</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Actions with improved UX */}
        <div className="mobile-nav-actions">
          {account ? (
            <>
              <Link to="/withdrawals" className="nav-action-btn" onClick={() => setIsOpen(false)}>
                <FaWallet />
                <span>Withdrawals</span>
              </Link>
              <Link to="/security" className="nav-action-btn" onClick={() => setIsOpen(false)}>
                <FaCog />
                <span>Settings</span>
              </Link>
              <button 
                className="nav-action-btn disconnect-btn" 
                onClick={() => {
                  onDisconnect();
                  setIsOpen(false);
                }}
                role="button"
                tabIndex={0}
              >
                <FaSignOutAlt />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <Link to="/register" className="nav-action-btn primary" onClick={() => setIsOpen(false)}>
              <FaWallet />
              <span>Connect Wallet</span>
            </Link>
          )}
        </div>

        {/* App Version and Copyright */}
        <div className="mobile-nav-footer mobile-text-center mobile-p-4">
          <div className="app-version mobile-text-xs">
            LeadFive v1.10 • Mobile Optimized
          </div>
          <div className="copyright mobile-text-xs">
            © 2025 LeadFive. All rights reserved.
          </div>
        </div>
      </nav>

      {/* Enhanced Bottom Navigation for Better UX */}
      <div className="mobile-bottom-nav gpu-accelerate">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const disabled = item.requiresAuth && !account;
          
          return (
            <button
              key={item.path}
              className={`bottom-nav-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleNavClick(item.path, item.requiresAuth)}
              disabled={disabled}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="bottom-nav-icon" />
              <span className="bottom-nav-label mobile-text-xs">{item.label}</span>
              {item.requiresAuth && !account && (
                <span className="auth-indicator">🔒</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default MobileNav;
