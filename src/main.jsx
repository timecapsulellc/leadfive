import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

console.log('🚀 OrphiChain PWA System initializing...');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
  console.error('🚨 Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

// Create root and render app
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('🎯 ReactDOM root created, rendering App...');
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('✅ OrphiChain PWA App rendered successfully');
} catch (error) {
  console.error('🚨 Failed to render app:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; color: #ff6b6b;">
      <h1>🚨 Application Failed to Load</h1>
      <p>Error: ${error.message}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
        🔄 Reload Page
      </button>
    </div>
  `;
}
