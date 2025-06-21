import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-advance slides
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      title: "Build Your Legacy",
      subtitle: "Create a network that generates passive income",
      icon: "🏆"
    },
    {
      title: "Earn Together",
      subtitle: "Matrix compensation system with multiple income streams",
      icon: "💰"
    },
    {
      title: "Lead the Future",
      subtitle: "Blockchain-powered MLM platform built for success",
      icon: "🚀"
    }
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-background">
        <div className="particle-animation"></div>
        <div className="gradient-overlay"></div>
      </div>
      
      <div className={`welcome-content ${isVisible ? 'fade-in' : ''}`}>
        <div className="logo-section">
          <div className="logo-animation">
            <img src="/leadfive-logo.svg" alt="LeadFive" className="welcome-logo" />
          </div>
          <h1 className="welcome-title">LeadFive</h1>
          <p className="welcome-tagline">Your Path to Financial Freedom</p>
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
