// Import polyfills FIRST to ensure global objects are available
import './polyfills.js';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import AI Services Integration
import AIServicesIntegration from './services/AIServicesIntegration.js';

// Initialize AI services when the app starts
console.log('🚀 Initializing LeadFive with AI Services...');

// Make AI services available globally for debugging and testing
window.LeadFiveAI = AIServicesIntegration;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
