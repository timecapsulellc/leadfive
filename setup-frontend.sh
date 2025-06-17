#!/bin/bash

# OrphiCrowdFund Frontend Development Setup
# Run this script to set up the frontend development environment

echo "🚀 SETTING UP ORPHI CROWDFUND FRONTEND DEVELOPMENT"
echo "=================================================="

# Create frontend project structure
echo "📁 Creating frontend project structure..."
mkdir -p frontend-app/{src,public,components,utils,hooks,styles}

# Copy integration files
echo "📄 Copying contract integration files..."
cp frontend/* frontend-app/src/ 2>/dev/null || echo "Note: Run the prepare-frontend-integration script first"

# Create package.json for React project
echo "📦 Creating package.json..."
cat > frontend-app/package.json << 'EOF'
{
  "name": "orphi-crowdfund-frontend",
  "version": "1.0.0",
  "description": "OrphiCrowdFund MLM Platform Frontend",
  "main": "index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "ethers": "^6.14.3",
    "web3modal": "^1.9.12",
    "@web3modal/ethereum": "^2.7.1",
    "@web3modal/react": "^2.7.1",
    "react-router-dom": "^6.8.1",
    "react-toastify": "^9.1.1",
    "tailwindcss": "^3.2.7",
    "@headlessui/react": "^1.7.13",
    "@heroicons/react": "^2.0.16"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# Create basic React app structure
echo "⚛️ Creating React components..."

# Main App.js
cat > frontend-app/src/App.js << 'EOF'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import Withdrawal from './components/Withdrawal';
import Analytics from './components/Analytics';
import { Web3Provider } from './context/Web3Context';

import './styles/App.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="App">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/register" element={<Register />} />
              <Route path="/withdraw" element={<Withdrawal />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
          <ToastContainer position="top-right" />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
EOF

echo "✅ Frontend setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. cd frontend-app"
echo "   2. npm install"
echo "   3. npm start"
echo ""
echo "🔧 Development tasks:"
echo "   • Connect wallet functionality"
echo "   • User registration interface"
echo "   • Dashboard with user stats"
echo "   • Withdrawal interface"
echo "   • Sponsor/referral system"
echo ""
echo "📱 Features to implement:"
echo "   • MetaMask integration"
echo "   • BSC Testnet configuration"
echo "   • Real-time contract interaction"
echo "   • User-friendly error handling"
EOF
