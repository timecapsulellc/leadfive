// PWA Install Prompt Component - Cinematic Style
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
      className="pwa-install-prompt cinematic-pwa"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Animated Background */}
      <div className="pwa-background-animation">
        <div className="pwa-particle-1" />
        <div className="pwa-particle-2" />
        <div className="pwa-particle-3" />
      </div>
      
      <div className="pwa-install-content">
        <motion.div 
          className="pwa-logo-container"
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="pwa-logo-ring">
            <span className="pwa-logo">🚀</span>
          </div>
        </motion.div>
        
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Install LeadFive App
        </motion.h3>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Get the best experience with our community-driven platform on your device.
        </motion.p>
        
        <motion.div 
          className="pwa-install-features"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {[
            { icon: "⚡", text: "Fast loading" },
            { icon: "📴", text: "Works offline" },
            { icon: "🔔", text: "Push notifications" },
            { icon: "🎯", text: "4X Rewards" }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="feature"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -2 }}
            >
              <span className="feature-icon">{feature.icon}</span>
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="pwa-install-buttons"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <motion.button
            className="install-button cinematic-button primary"
            onClick={handleInstall}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 212, 255, 0.6)" }}
            whileTap={{ scale: 0.95 }}
          >
            Install Now
          </motion.button>
          <motion.button
            className="dismiss-button cinematic-button secondary"
            onClick={onDismiss}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(123, 44, 191, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            Not Now
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PWAInstallPrompt;
