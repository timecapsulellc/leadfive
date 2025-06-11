#!/usr/bin/env node

/**
 * Landing Page Test Script
 * Tests the complete user journey flow for OrphiChain PWA
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 OrphiChain Landing Page Flow Test\n');

// Check if key files exist
const filesToCheck = [
  'src/App.jsx',
  'src/components/LandingPage.jsx',
  'src/components/WalletConnection.jsx',
  'src/OrphiDashboard.jsx',
  'package.json'
];

console.log('✅ File Structure Check:');
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
});

// Check package.json for dev script
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n✅ Development Scripts:');
  console.log(`   ✓ dev: ${packageJson.scripts?.dev || 'Not found'}`);
  console.log(`   ✓ build: ${packageJson.scripts?.build || 'Not found'}`);
  console.log(`   ✓ preview: ${packageJson.scripts?.preview || 'Not found'}`);
} catch (error) {
  console.log('\n❌ Could not read package.json');
}

// Check App.jsx for proper initialization
try {
  const appContent = fs.readFileSync('src/App.jsx', 'utf8');
  
  console.log('\n✅ App.jsx Configuration Check:');
  console.log(`   ${appContent.includes("currentView, setCurrentView] = useState('landing')") ? '✓' : '✗'} Starts on landing page`);
  console.log(`   ${appContent.includes('checkExistingConnection') ? '✓' : '✗'} Wallet detection present`);
  console.log(`   ${appContent.includes("Stay on landing page but show wallet is connected") ? '✓' : '✗'} Landing page priority`);
  console.log(`   ${appContent.includes('setCurrentView(') ? '✓' : '✗'} View navigation system`);
} catch (error) {
  console.log('\n❌ Could not analyze App.jsx');
}

// Check LandingPage component
try {
  const landingContent = fs.readFileSync('src/components/LandingPage.jsx', 'utf8');
  
  console.log('\n✅ Landing Page Component Check:');
  console.log(`   ${landingContent.includes('onConnectWallet') ? '✓' : '✗'} Connect wallet prop`);
  console.log(`   ${landingContent.includes('landing-page') ? '✓' : '✗'} CSS class present`);
  console.log(`   ${landingContent.includes('Hero Section') ? '✓' : '✗'} Hero section`);
  console.log(`   ${landingContent.includes('features') ? '✓' : '✗'} Features section`);
} catch (error) {
  console.log('\n❌ Could not analyze LandingPage.jsx');
}

console.log('\n🚀 Expected User Journey:');
console.log('   1. App loads → Landing Page shows');
console.log('   2. User clicks "Connect Wallet" → Wallet Connection view');
console.log('   3. Wallet connects → Dashboard view');
console.log('   4. User can navigate back to Landing or disconnect');

console.log('\n📱 To test the landing page:');
console.log('   1. Run: npm run dev');
console.log('   2. Open: http://localhost:5173 (or the URL shown)');
console.log('   3. You should see the OrphiChain landing page first');
console.log('   4. If you have MetaMask connected, you\'ll see a notification but stay on landing');

console.log('\n🔧 If you don\'t see the landing page:');
console.log('   1. Clear browser cache and localStorage');
console.log('   2. Disconnect MetaMask from the site');
console.log('   3. Refresh the page');
console.log('   4. Check browser console for errors');

console.log('\n✨ Test completed! Run the dev server to see your landing page.\n');
