import React from 'react';
import { Link } from 'react-router-dom';
import UnifiedWalletConnect from './UnifiedWalletConnect';

export default function Header({ account, onConnect, onDisconnect }) {
  return (
    <header className="header">
      <div className="logo-section">
        <svg width="40" height="40" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#7b2cbf" />
              <stop offset="100%" stopColor="#ff6b35" />
            </linearGradient>
          </defs>
          <g transform="translate(200, 200) scale(0.7)">
            <path d="M -80,-20 L -40,-80 L 0,-60 Z" fill="url(#headerGradient)" />
            <path d="M 40,-80 L 80,-20 L 60,0 Z" fill="url(#headerGradient)" />
            <path d="M 80,20 L 40,80 L 0,60 Z" fill="url(#headerGradient)" />
            <path d="M -40,80 L -80,20 L -60,0 Z" fill="url(#headerGradient)" />
            <path d="M -30,-10 L 0,-60 L 30,10 L 0,60 Z" fill="#16213e" />
          </g>
        </svg>
        <span className="logo-text">LeadFive</span>
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/referrals">Referrals</Link>
        <Link to="/genealogy">Genealogy</Link>
        <Link to="/withdrawals">Withdrawals</Link>
        <Link to="/security">Security</Link>
        <Link to="/brand-guide">Brand Guide</Link>
        <Link to="/about">About</Link>
        {account && <Link to="/dashboard">Dashboard</Link>}
      </nav>
      <div className="wallet-section">
        {account ? (
          <div className="wallet-info">
            <span className="wallet-address">{account.substring(0, 6)}...{account.slice(-4)}</span>
            <button className="disconnect-btn" onClick={onDisconnect}>Disconnect</button>
          </div>
        ) : (
          <UnifiedWalletConnect
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            buttonText="Connect Wallet"
            compact={true}
          />
        )}
      </div>
    </header>
  );
}
