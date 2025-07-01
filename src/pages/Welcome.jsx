import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent multiple renders
    if (isSkipping) return;
    
    // Mark that user has visited the welcome page
    localStorage.setItem('hasVisitedWelcome', 'true');
    
    // Start animations
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Show skip button after 2 seconds
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);
    
    // Auto-advance slides
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 4000);

    // Progress bar animation (8 seconds - more time to enjoy)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Navigate to home after completion
          if (!isSkipping) {
            handleComplete();
          }
          return 100;
        }
        return prev + 1.25; // 100 / 80 = 1.25% every 100ms = 8 seconds total
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(skipTimer);
      clearInterval(slideInterval);
      clearInterval(progressInterval);
    };
  }, [isSkipping]);

  const handleComplete = () => {
    if (isSkipping) return;
    setIsSkipping(true);
    
    // Clear session storage to prevent re-showing
    sessionStorage.removeItem('welcomeShown');
    
    // Navigate to home
    navigate('/home', { replace: true });
  };

  const handleSkip = () => {
    if (isSkipping) return;
    setIsSkipping(true);
    
    // Mark as completed
    localStorage.setItem('hasVisitedWelcome', 'true');
    sessionStorage.removeItem('welcomeShown');
    
    // Navigate to home
    navigate('/home', { replace: true });
  };

  const slides = [
    {
      title: "Revolutionary Platform",
      subtitle: "Smart contract-powered decentralized incentive system on BSC blockchain",
      icon: "🚀"
    },
    {
      title: "Automated Earnings",
      subtitle: "Decentralized commission distribution with genealogy tracking",
      icon: "💰"
    },
    {
      title: "Future of Networking",
      subtitle: "Transparent, trustless incentive platform with verified results",
      icon: "🌟"
    }
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-background">
        <div className="animated-gradient"></div>
        <div className="particle-field"></div>
        <div className="floating-particles">
          {[...Array(50)].map((_, i) => (
            <div key={i} className={`particle particle-${i % 3}`} style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Progress Bar */}
      <div className="welcome-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Skip Button */}
      {showSkip && (
        <button className="skip-button" onClick={handleSkip}>
          Skip Intro
        </button>
      )}
      
      <div className={`welcome-content ${isVisible ? 'fade-in' : ''}`}>
        <div className="logo-section">
          <div className="logo-animation">
            <div className="logo-glow"></div>
            <div className="logo-container">
              <div className="logo-text">LeadFive</div>
              <div className="logo-subtitle">Blockchain Platform</div>
            </div>
          </div>
          <div className="brand-animation">
            <div className="brand-line"></div>
            <p className="welcome-tagline">Revolutionary Digital Business Platform</p>
            <div className="brand-line"></div>
          </div>
        </div>

        <div className="slides-container">
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className={`slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="slide-icon">{slide.icon}</div>
              <h2 className="slide-title">{slide.title}</h2>
              <p className="slide-subtitle">{slide.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <div className="welcome-actions">
          <button 
            className="btn btn-primary welcome-btn"
            onClick={() => navigate('/login')}
          >
            Get Started
          </button>
          <button 
            className="btn btn-secondary welcome-btn"
            onClick={() => navigate('/register')}
          >
            Join Now
          </button>
        </div>

        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span className="feature-text">Real-time Analytics</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌐</span>
            <span className="feature-text">Global Network</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span className="feature-text">Secure Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
