import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaApple, FaAndroid, FaChrome } from 'react-icons/fa';
import '../styles/next-gen-mobile-optimization.css';

const MobilePWAPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect device and browser
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const android = /android/i.test(userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone === true;

    setIsIOS(iOS);
    setIsAndroid(android);
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt only if not already installed and on mobile
      if (!standalone && (iOS || android)) {
        // Delay showing prompt to avoid overwhelming user immediately
        setTimeout(() => {
          const hasSeenPrompt = localStorage.getItem('leadfive-pwa-prompt-seen');
          if (!hasSeenPrompt) {
            setShowPrompt(true);
          }
        }, 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    }
    
    setShowPrompt(false);
    localStorage.setItem('leadfive-pwa-prompt-seen', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('leadfive-pwa-prompt-seen', 'true');
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        icon: FaApple,
        title: 'Install LeadFive App',
        instructions: [
          '1. Tap the Share button in Safari',
          '2. Scroll down and tap "Add to Home Screen"',
          '3. Tap "Add" to install the app'
        ]
      };
    } else if (isAndroid) {
      return {
        icon: FaAndroid,
        title: 'Install LeadFive App',
        instructions: [
          '1. Tap "Install" below',
          '2. Confirm installation',
          '3. Find LeadFive on your home screen'
        ]
      };
    } else {
      return {
        icon: FaChrome,
        title: 'Install LeadFive App',
        instructions: [
          '1. Click the install button in your browser',
          '2. Follow the installation prompts',
          '3. Access LeadFive from your desktop'
        ]
      };
    }
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  const installInfo = getInstallInstructions();
  const IconComponent = installInfo.icon;

  return (
    <div className="mobile-modal">
      <div className="mobile-modal-content">
        <div className="pwa-prompt-header">
          <div className="pwa-prompt-icon">
            <IconComponent />
          </div>
          <h3 className="mobile-text-xl">{installInfo.title}</h3>
          <button 
            className="pwa-prompt-close"
            onClick={handleDismiss}
            aria-label="Close installation prompt"
          >
            <FaTimes />
          </button>
        </div>

        <div className="pwa-prompt-content">
          <div className="pwa-benefits">
            <h4 className="mobile-text-lg">Why install the LeadFive app?</h4>
            <ul className="pwa-benefits-list">
              <li>⚡ Faster loading and better performance</li>
              <li>📱 Native app-like experience</li>
              <li>🚀 Quick access from your home screen</li>
              <li>💾 Works offline when needed</li>
              <li>🔔 Get important notifications</li>
            </ul>
          </div>

          <div className="pwa-instructions">
            <h4 className="mobile-text-lg">How to install:</h4>
            <ol className="pwa-instructions-list">
              {installInfo.instructions.map((instruction, index) => (
                <li key={index} className="mobile-text-base">{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="pwa-prompt-actions">
            {deferredPrompt && !isIOS ? (
              <button 
                className="mobile-submit-button"
                onClick={handleInstallClick}
              >
                <FaDownload />
                Install App
              </button>
            ) : (
              <button 
                className="mobile-submit-button"
                onClick={handleDismiss}
              >
                Got it!
              </button>
            )}
            
            <button 
              className="pwa-prompt-later"
              onClick={handleDismiss}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePWAPrompt;
