import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SuperWalletConnect from './unified/SuperWalletConnect';
import './Header.css';

export default function Header({ account, onConnect, onDisconnect }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo-section">
        <svg
          width="40"
          height="40"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="headerGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#7b2cbf" />
              <stop offset="100%" stopColor="#ff6b35" />
            </linearGradient>
          </defs>
          <g transform="translate(200, 200) scale(0.7)">
            <path
              d="M -80,-20 L -40,-80 L 0,-60 Z"
              fill="url(#headerGradient)"
            />
            <path d="M 40,-80 L 80,-20 L 60,0 Z" fill="url(#headerGradient)" />
            <path d="M 80,20 L 40,80 L 0,60 Z" fill="url(#headerGradient)" />
            <path d="M -40,80 L -80,20 L -60,0 Z" fill="url(#headerGradient)" />
            <path d="M -30,-10 L 0,-60 L 30,10 L 0,60 Z" fill="#16213e" />
          </g>
        </svg>
        <span className="logo-text">LeadFive</span>
      </div>
      
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>
      
      <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/" className={isActive('/')}>Home</Link>
        <Link to="/register" className={isActive('/register')}>Register</Link>
        <Link to="/packages" className={isActive('/packages')}>Packages</Link>
        <Link to="/referrals" className={isActive('/referrals')}>Referrals</Link>
        <Link to="/genealogy" className={isActive('/genealogy')}>Genealogy</Link>
        <Link to="/withdrawals" className={isActive('/withdrawals')}>Withdrawals</Link>
        <Link to="/security" className={isActive('/security')}>Security</Link>
        <Link to="/about" className={isActive('/about')}>About</Link>
        {account && <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>}
      </nav>
      
      <div className="wallet-section">
        <SuperWalletConnect 
          account={account}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          mode="auto"
          compact={true}
          buttonText="Connect"
          showNetworkStatus={true}
        />
      </div>
    </header>
  );
}
