/**
 * Animated Welcome Component - Cinematic Experience
 * Features: Particle system, animated logo, security badges, and smooth transitions
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './AnimatedWelcome.css';

const AnimatedWelcome = ({ account, onConnect }) => {
  const [particlesGenerated, setParticlesGenerated] = useState(false);

  useEffect(() => {
    // Generate particles after component mount
    setTimeout(() => {
      setParticlesGenerated(true);
    }, 500);
  }, []);

  const generateParticles = () => {
    return Array.from({ length: 50 }, (_, i) => (
      <motion.div
        key={i}
        className="particle"
        initial={{ 
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 10,
          scale: 0
        }}
        animate={{ 
          y: -100,
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 8 + Math.random() * 4,
          delay: Math.random() * 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ));
  };

  return (
    <div className="cinematic-container">
      {/* Animated Background Grid */}
      <div className="grid-background" />
      
      {/* Particle System */}
      <div className="particle-system">
        {particlesGenerated && generateParticles()}
      </div>

      {/* Security Fortress Animation */}
      <motion.div 
        className="security-fortress"
        initial={{ scale: 0, rotate: 180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
      >
        {[1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className={`fortress-ring ring-${i}`}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.7, 0.3],
              borderColor: [
                'rgba(0, 212, 255, 0.3)',
                'rgba(0, 212, 255, 0.7)',
                'rgba(0, 212, 255, 0.3)'
              ]
            }}
            transition={{
              duration: 4,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="hero-content">
        {/* Central Logo Animation */}
        <motion.div 
          className="central-logo"
          initial={{ scale: 0, rotateY: 180, opacity: 0, filter: 'blur(20px)' }}
          animate={{ scale: 1, rotateY: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 4, ease: "easeOut" }}
        >
          <motion.svg 
            className="main-logo" 
            width="280" 
            height="280" 
            viewBox="0 0 400 400"
            animate={{
              y: [0, -15, 0],
              rotateZ: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <defs>
              <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="50%" stopColor="#7b2cbf" />
                <stop offset="100%" stopColor="#ff6b35" />
              </linearGradient>
              <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#16213e" />
              </linearGradient>
            </defs>
            <g transform="translate(200, 200)">
              {/* Animated logo paths */}
              {[
                "M -80,-20 L -40,-80 L 0,-60 Z",
                "M -80,-20 L 0,-60 L -30,-10 Z",
                "M 40,-80 L 80,-20 L 60,0 Z",
                "M 40,-80 L 60,0 L 0,-60 Z",
                "M 80,20 L 40,80 L 0,60 Z",
                "M 80,20 L 0,60 L 30,10 Z",
                "M -40,80 L -80,20 L -60,0 Z",
                "M -40,80 L -60,0 L 0,60 Z",
                "M -30,-10 L 0,-60 L 30,10 L 0,60 Z"
              ].map((path, index) => (
                <motion.path
                  key={index}
                  d={path}
                  fill={index % 2 === 0 ? "url(#mainGradient)" : "url(#darkGradient)"}
                  className="logo-path"
                  initial={{ fillOpacity: 0, scale: 0, rotate: 0 }}
                  animate={{ 
                    fillOpacity: [1, 0.8, 1, 0.9, 1],
                    scale: [1, 1.05, 1.02, 1.03, 1],
                    rotate: [0, 2, -1, 1, 0]
                  }}
                  transition={{
                    duration: 4,
                    delay: index * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </g>
          </motion.svg>

          {/* Security Badges */}
          <motion.div 
            className="security-badges"
            initial={{ scale: 0, rotate: 180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 2, delay: 1, ease: "easeOut" }}
          >
            <motion.div 
              className="security-badge badge-audit"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.2 }}
            >
              PhD
            </motion.div>
            <motion.div 
              className="security-badge badge-trezor"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.2 }}
            >
              🔒
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Brand Title */}
        <motion.h1 
          className="brand-title"
          initial={{ y: 50, opacity: 0, filter: 'blur(10px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
        >
          LEAD FIVE
        </motion.h1>

        {/* Subtitle */}
        <motion.h2 
          className="brand-subtitle"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 2, ease: "easeOut" }}
        >
          Community-Driven Platform
        </motion.h2>

        {/* Description */}
        <motion.p 
          className="brand-description"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 2.5, ease: "easeOut" }}
        >
          Experience the future of decentralized community building with our revolutionary 4X reward system. 
          Built on BSC with complete transparency, security, and automated smart contracts.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          className="action-buttons"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 3, ease: "easeOut" }}
        >
          {!account ? (
            <motion.button 
              className="cta-button primary"
              onClick={onConnect}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 212, 255, 0.6)" }}
              whileTap={{ scale: 0.95 }}
            >
              Connect Wallet
            </motion.button>
          ) : (
            <motion.div className="connected-actions">
              <Link to="/dashboard">
                <motion.button 
                  className="cta-button primary"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 212, 255, 0.6)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enter Dashboard
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button 
                  className="cta-button secondary"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(123, 44, 191, 0.6)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Community
                </motion.button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          className="feature-highlights"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 3.5, ease: "easeOut" }}
        >
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <span>Trezor Secured</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <span>MEV Protected</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <span>4X Rewards</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <span>100% Transparent</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedWelcome;