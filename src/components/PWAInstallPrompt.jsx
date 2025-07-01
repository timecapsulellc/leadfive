// PWA Install Prompt Component
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/pwa.css';

const PWAInstallPrompt = ({ onInstall, onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstallable(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <motion.div
      className="pwa-install-prompt"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <div className="pwa-install-content">
        <h3>Install Lead Five App</h3>
        <p>Get the best experience by installing our app on your device.</p>
        <div className="pwa-install-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Fast loading</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📴</span>
            <span>Works offline</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔔</span>
            <span>Push notifications</span>
          </div>
        </div>
        <div className="pwa-install-buttons">
          <button
            className="install-button"
            onClick={handleInstall}
          >
            Install
          </button>
          <button
            className="dismiss-button"
            onClick={onDismiss}
          >
            Not Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PWAInstallPrompt;
