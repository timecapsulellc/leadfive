import React, { useState } from 'react';
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
  FaShoppingBag
} from 'react-icons/fa';
import '../styles/MobileNav.css';

const MobileNav = ({ account, onDisconnect }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/dashboard', label: 'Dashboard', icon: FaChartLine, requiresAuth: true },
    { path: '/genealogy', label: 'Network', icon: FaNetworkWired, requiresAuth: true },
    { path: '/packages', label: 'Packages', icon: FaShoppingBag },
    { path: '/referrals', label: 'Team', icon: FaUsers, requiresAuth: true }
  ];

  const handleNavClick = (path, requiresAuth) => {
    if (requiresAuth && !account) {
      navigate('/register');
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <h2>LeadFive</h2>
          <button 
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mobile-nav-content">
          {account && (
            <div className="mobile-user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <p className="user-address">
                  {String(account).slice(0, 6)}...{String(account).slice(-4)}
                </p>
                <span className="user-status">Connected</span>
              </div>
            </div>
          )}

          <ul className="mobile-nav-items">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <button
                    className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.path, item.requiresAuth)}
                  >
                    <IconComponent className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.requiresAuth && !account && (
                      <span className="auth-required">🔒</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mobile-nav-actions">
            {account ? (
              <>
                <Link 
                  to="/settings" 
                  className="nav-action-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCog /> Settings
                </Link>
                <button 
                  className="nav-action-btn disconnect"
                  onClick={() => {
                    onDisconnect();
                    setIsOpen(false);
                  }}
                >
                  Disconnect Wallet
                </button>
              </>
            ) : (
              <Link 
                to="/register" 
                className="nav-action-btn primary"
                onClick={() => setIsOpen(false)}
              >
                <FaWallet /> Connect Wallet
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Tab Navigation for Mobile */}
      <div className="mobile-bottom-nav">
        {navItems.slice(0, 5).map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.path}
              className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path, item.requiresAuth)}
              disabled={item.requiresAuth && !account}
            >
              <IconComponent className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
              {item.requiresAuth && !account && (
                <div className="auth-indicator">🔒</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default MobileNav;
