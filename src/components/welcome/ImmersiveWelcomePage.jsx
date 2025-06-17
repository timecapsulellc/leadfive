/**
 * Enhanced Immersive Welcome Page for ORPHI CrowdFund Platform
 * Complete HTML Design Implementation with GSAP Animations
 * Features: "Welcome to Orphi" + "Growing Together, Earning Together"
 * Developed by LEAD 5 - Young Blockchain Engineers
 */

import React, { useState, useEffect, useRef } from 'react';
import WalletConnector from '../WalletConnector';
import '../../styles/immersive-welcome.css';

const ImmersiveWelcomePage = ({ onConnect, networkError, isLoading, networkStats }) => {
  const [isGSAPLoaded, setIsGSAPLoaded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const canvasRef = useRef(null);
  const timelineRef = useRef(null);

  // Debug logging
  console.log('🎬 ImmersiveWelcomePage rendered:', {
    onConnect: !!onConnect,
    networkError,
    isLoading,
    networkStats
  });

  // GSAP Loading Check
  useEffect(() => {
    if (window.gsap) {
      console.log('✅ GSAP found and loaded');
      setIsGSAPLoaded(true);
    } else {
      console.log('⏳ Waiting for GSAP to load...');
      const checkGSAP = setInterval(() => {
        if (window.gsap) {
          console.log('✅ GSAP loaded after wait');
          setIsGSAPLoaded(true);
          clearInterval(checkGSAP);
        }
      }, 100);
      
      // Fallback after 5 seconds
      setTimeout(() => {
        if (!window.gsap) {
          console.log('⚠️ GSAP failed to load, using fallback');
          setIsGSAPLoaded(true); // Allow rendering without GSAP
        }
      }, 5000);
      
      return () => clearInterval(checkGSAP);
    }
  }, []);

  // Enhanced Particle System - Matching HTML Design
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 50 : 100;

    // Initialize particles with ORPHI brand colors
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: i % 3 === 0 ? '0, 212, 255' : i % 3 === 1 ? '123, 44, 191' : '255, 107, 53' // ORPHI colors
      });
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.y < 0) {
          particle.y = canvas.height;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Complete GSAP Animation Timeline - Matching HTML Design
  useEffect(() => {
    if (!isGSAPLoaded) return;

    const { gsap } = window;
    const tl = gsap.timeline({
      onComplete: () => {
        setAnimationComplete(true);
      }
    });

    timelineRef.current = tl;

    // Phase 1: Background fade-in (0-1s)
    tl.fromTo('.animated-background', 
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.inOut" },
      0
    );

    // Phase 2: Logo Animation (1-2s)
    tl.fromTo('.logo-container', 
      { opacity: 0, scale: 0.7, rotation: 45 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" },
      1
    );

    tl.fromTo('.logo-path',
      { opacity: 0, scale: 0.7, rotation: 45 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)", stagger: 0.2 },
      1.2
    );

    // Phase 3: Welcome Text Animation (1.5-2.5s)
    tl.fromTo('.welcome-text .word',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.2 },
      1.5
    );

    // Phase 4: Tagline Animation (2.5-3.5s)
    tl.fromTo('.tagline .word',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.15 },
      2.5
    );

    // Phase 5: Stats Animation (3-4s)
    tl.fromTo('.stats-container',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      3
    );

    // Phase 6: Feature Icons Animation (3.5-5s)
    tl.fromTo('.feature-icon',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.3 },
      3.5
    );

    // Phase 7: CTA Button Animation (4-5s)
    tl.fromTo('.wallet-connector',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      4
    );

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isGSAPLoaded]);

  return (
    <div className="immersive-welcome" style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
      color: '#FFFFFF',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <div className="animated-background" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
        zIndex: 1
      }}></div>
      
      {/* Particles Canvas */}
      <canvas 
        ref={canvasRef}
        id="particles-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          opacity: 0,
          animation: 'particlesFadeIn 1s ease-in-out 0.5s forwards'
        }}
      />
      
      {/* Header with Logo and Wallet Connection */}
      <header className="immersive-header">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-icon">O</div>
            <div className="logo-text">
              <h1>ORPHI</h1>
              <p>CrowdFund Platform</p>
            </div>
          </div>
          
          <div className="header-actions">
            {networkError && (
              <div className="network-error">
                <i className="fas fa-exclamation-triangle"></i>
                {networkError}
              </div>
            )}
            
            <div className="wallet-connector">
              <WalletConnector
                onConnect={onConnect}
                onDisconnect={() => {}}
                currentAccount=""
                isConnected={false}
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Welcome Container */}
      <div className="welcome-container">
        {/* Logo */}
        <div className="logo-container">
          <svg width="150" height="150" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
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
              <path className="logo-path" d="M -80,-20 L -40,-80 L 0,-60 Z" fill="url(#mainGradient)" />
              <path className="logo-path" d="M -80,-20 L 0,-60 L -30,-10 Z" fill="url(#darkGradient)" opacity="0.7" />
              <path className="logo-path" d="M 40,-80 L 80,-20 L 60,0 Z" fill="url(#mainGradient)" />
              <path className="logo-path" d="M 40,-80 L 60,0 L 0,-60 Z" fill="url(#darkGradient)" opacity="0.7" />
              <path className="logo-path" d="M 80,20 L 40,80 L 0,60 Z" fill="url(#mainGradient)" />
              <path className="logo-path" d="M 80,20 L 0,60 L 30,10 Z" fill="url(#darkGradient)" opacity="0.7" />
              <path className="logo-path" d="M -40,80 L -80,20 L -60,0 Z" fill="url(#mainGradient)" />
              <path className="logo-path" d="M -40,80 L -60,0 L 0,60 Z" fill="url(#darkGradient)" opacity="0.7" />
              <path className="logo-path" d="M -30,-10 L 0,-60 L 30,10 L 0,60 Z" fill="#16213e" />
            </g>
          </svg>
        </div>

        {/* Welcome Text */}
        <h1 className="welcome-text">
          <span className="word">Welcome</span>
          <span className="word">to</span>
          <span className="word">Orphi</span>
        </h1>

        {/* Tagline */}
        <h2 className="tagline">
          <span className="word">Growing</span>
          <span className="word">Together,</span>
          <span className="word">Earning</span>
          <span className="word">Together</span>
        </h2>

        {/* Live Network Stats */}
        {networkStats && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-title">Active Users</div>
                <div className="stat-value">{networkStats.totalUsers || 0}</div>
                <div className="stat-change">↗️ +12.4%</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-title">Total Volume</div>
                <div className="stat-value">${parseInt(networkStats.totalVolume || 0).toLocaleString()}</div>
                <div className="stat-change">↗️ +23.7%</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-title">Distributed</div>
                <div className="stat-value">${parseInt(networkStats.totalDistributed || 0).toLocaleString()}</div>
                <div className="stat-change">↗️ +18.9%</div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Icons */}
        <div className="features-container">
          <div className="feature-icon">
            <i className="fas fa-shield-alt"></i>
            <h3>Secure &<br/>Transparent</h3>
          </div>
          <div className="feature-icon">
            <i className="fas fa-bolt"></i>
            <h3>Instant<br/>Rewards</h3>
          </div>
          <div className="feature-icon">
            <i className="fas fa-globe"></i>
            <h3>Global<br/>Community</h3>
          </div>
          <div className="feature-icon">
            <i className="fas fa-chart-line"></i>
            <h3>Progressive<br/>Growth</h3>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="developer-credit">
          <p>Developed by <span className="highlight">LEAD 5</span> - A group of young, freshly graduated blockchain engineers</p>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveWelcomePage; 