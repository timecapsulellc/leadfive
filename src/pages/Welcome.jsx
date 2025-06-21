import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Create animated particles
    const createParticles = () => {
      const particlesContainer = document.getElementById('particles');
      if (!particlesContainer) return;
      
      // Clear existing particles
      particlesContainer.innerHTML = '';
      
      const particleCount = window.innerWidth < 768 ? 30 : 50;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        particlesContainer.appendChild(particle);
      }
    };

    createParticles();

    // Add interactive hover effects to logo
    const logo = document.querySelector('.animated-logo');
    if (logo) {
      const handleMouseEnter = function() {
        this.style.transform = 'scale(1.1) rotate(5deg)';
        this.style.transition = 'transform 0.3s ease';
      };

      const handleMouseLeave = function() {
        this.style.transform = 'scale(1) rotate(0deg)';
      };

      logo.addEventListener('mouseenter', handleMouseEnter);
      logo.addEventListener('mouseleave', handleMouseLeave);

      // Cleanup listeners
      return () => {
        if (logo) {
          logo.removeEventListener('mouseenter', handleMouseEnter);
          logo.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }

    // Responsive particle management
    const handleResize = () => {
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleEnterDApp = (e) => {
    setIsLoading(true);
    // Add click animation
    e.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
      e.target.style.transform = 'scale(1)';
      navigate('/home');
    }, 300);
  };

  return (
    <div className="welcome-page">
      <div className="bg-particles" id="particles"></div>
      
      <div className="welcome-container">
        <div className="logo-container">
          <div className="logo-glow"></div>
          <div className="animated-logo">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        <h1 className="welcome-title">LEAD FIVE TODAY</h1>
        <p className="welcome-tagline">The Decentralized Incentive Network</p>
        <p className="welcome-subtitle">Smart Rewards, Powered by Blockchain</p>
        <p className="welcome-motto">Autonomous. Transparent. Unstoppable.</p>

        <div className="features">
          <div className="feature-pill">⚡ Autonomous</div>
          <div className="feature-pill">🔍 Transparent</div>
          <div className="feature-pill">🚀 Unstoppable</div>
          <div className="feature-pill">🏆 Smart Rewards</div>
        </div>

        <button 
          className={`cta-button ${isLoading ? 'loading' : ''}`} 
          onClick={handleEnterDApp}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Enter DApp'}
        </button>
      </div>

      <div className="developer-credit">
        Developed by: A group of young, freshly graduated blockchain engineers
      </div>
    </div>
  );
};

export default Welcome;
