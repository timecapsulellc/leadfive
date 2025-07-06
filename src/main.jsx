import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/mobile-optimizations.css';

// Initialize Sentry for error tracking
import SentryService from './services/SentryService';
SentryService.init();

// Initialize Production Reset Utility (makes global functions available)
import './utils/ProductionReset.js';

// Initialize PWA functionality
import PWAManager from './services/PWAManager';
PWAManager.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
