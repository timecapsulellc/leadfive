
import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../../utils/constants';
import OrphiChainLogo from '../OrphiChainLogo';
import '../../styles/animations.css';

const WelcomeAnimation = ({ onComplete, duration = 3000 }) => {
  const [currentPhase, setCurrentPhase] = useState('logo'); // logo -> title -> subtitle -> complete

  useEffect(() => {
    const timeline = [
      { phase: 'logo', delay: 0 },
      { phase: 'title', delay: 800 },
      { phase: 'subtitle', delay: 1600 },
      { phase: 'complete', delay: duration }
    ];

    timeline.forEach(({ phase, delay }) => {
      setTimeout(() => {
        setCurrentPhase(phase);
        if (phase === 'complete' && onComplete) {
          onComplete();
        }
      }, delay);
    });
  }, [duration, onComplete]);

  return (
    <div className="welcome-animation">
      <div className="logo-container">
        <OrphiChainLogo 
          size="large" 
          autoRotate={true}
          backgroundColor="transparent"
          className="welcome-logo"
        />
      </div>
      
      <h1 className={`fade-in-title ${currentPhase === 'title' || currentPhase === 'subtitle' || currentPhase === 'complete' ? 'visible' : ''}`}>
        {APP_CONFIG.NAME}
      </h1>
      
      <p className={`fade-in-subtitle ${currentPhase === 'subtitle' || currentPhase === 'complete' ? 'visible' : ''}`}>
        {APP_CONFIG.TAGLINE}
      </p>

      <div className={`loading-indicator ${currentPhase === 'complete' ? 'complete' : ''}`}>
        <div className="loading-bar"></div>
        <span className="loading-text">
          {currentPhase === 'complete' ? 'Ready!' : 'Loading...'}
        </span>
      </div>
    </div>
  );
};

export default WelcomeAnimation;
