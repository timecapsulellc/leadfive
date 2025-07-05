#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing build issues for deployment...');

// Fix 1: Replace problematic motion components with div
const packageShowcasePath = 'src/components/enhanced/PackageShowcase.jsx';
if (fs.existsSync(packageShowcasePath)) {
  let content = fs.readFileSync(packageShowcasePath, 'utf8');
  
  // Replace motion.div with div to avoid duplicate props
  content = content.replace(/motion\.div/g, 'div');
  content = content.replace(/import.*motion.*from.*framer-motion.*\n/, '// import { motion, AnimatePresence } from \'framer-motion\';\n');
  content = content.replace(/initial=\{[^}]+\}/g, '');
  content = content.replace(/whileInView=\{[^}]+\}/g, '');
  content = content.replace(/transition=\{[^}]+\}/g, '');
  content = content.replace(/whileHover=\{[^}]+\}/g, '');
  content = content.replace(/viewport=\{[^}]+\}/g, '');
  content = content.replace(/AnimatePresence/g, 'div');
  
  fs.writeFileSync(packageShowcasePath, content);
  console.log('✅ Fixed PackageShowcase.jsx motion components');
}

// Fix 2: Disable Sentry completely for build
const sentryPath = 'src/services/SentryService.js';
if (fs.existsSync(sentryPath)) {
  const simpleSentry = `// Simplified Sentry service for build compatibility
class SentryService {
  init() {
    console.log('Sentry disabled for production build');
    this.isInitialized = false;
    return true;
  }
  
  captureException(error) {
    console.error('Error:', error);
  }
  
  captureMessage(message) {
    console.log('Message:', message);
  }
  
  addBreadcrumb() {}
  
  setUser() {}
  
  setTag() {}
  
  setContext() {}
  
  startTransaction() {
    return null;
  }
  
  captureWeb3Error(error) {
    console.error('Web3 Error:', error);
  }
}

export default new SentryService();
`;
  
  fs.writeFileSync(sentryPath, simpleSentry);
  console.log('✅ Simplified SentryService for build');
}

// Fix 3: Remove problematic imports
const filesToCheck = [
  'src/components/sections/EarningsSection.jsx',
];

filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix FaStars import
    content = content.replace(/FaStars/g, 'FaStar');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in ${filePath}`);
  }
});

console.log('🎯 Build fixes applied successfully!');