// Browser Testing Script for LeadFive Dashboard Issues
// Run this in the browser console to check for specific problems

console.log('🔍 LeadFive Dashboard Health Check Starting...');
console.log('================================================');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function logResult(test, result, message) {
  if (result) {
    console.log(`✅ ${test}: ${message}`);
    results.passed++;
  } else {
    console.log(`❌ ${test}: ${message}`);
    results.failed++;
  }
}

function logWarning(test, message) {
  console.log(`⚠️ ${test}: ${message}`);
  results.warnings++;
}

// Test 1: React is available
try {
  logResult('React Detection', !!window.React || !!document.querySelector('[data-reactroot]') || !!document.getElementById('root'), 
    window.React ? 'React is available globally' : 'React app detected in DOM');
} catch (e) {
  logResult('React Detection', false, 'React not detected: ' + e.message);
}

// Test 2: Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    logResult('Service Worker', registrations.length > 0, 
      registrations.length > 0 ? `${registrations.length} service worker(s) registered` : 'No service workers registered');
    
    if (registrations.length > 0) {
      registrations.forEach((registration, index) => {
        console.log(`   SW ${index + 1}: ${registration.scope}`);
      });
    }
  });
} else {
  logResult('Service Worker', false, 'Service Worker not supported');
}

// Test 3: Check for React Hook Errors
const originalError = console.error;
let hookErrors = [];
console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('Invalid hook call') || message.includes('Hooks can only be called')) {
    hookErrors.push(message);
  }
  originalError.apply(console, args);
};

setTimeout(() => {
  logResult('React Hooks', hookErrors.length === 0, 
    hookErrors.length === 0 ? 'No hook errors detected' : `${hookErrors.length} hook errors found`);
  
  if (hookErrors.length > 0) {
    console.log('Hook errors:', hookErrors);
  }
}, 2000);

// Test 4: Check for Dynamic Import Errors
let importErrors = [];
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  if (message.includes('Failed to fetch dynamically imported module') || message.includes('Loading chunk')) {
    importErrors.push(message);
  }
  originalLog.apply(console, args);
};

setTimeout(() => {
  logResult('Dynamic Imports', importErrors.length === 0,
    importErrors.length === 0 ? 'No dynamic import errors' : `${importErrors.length} import errors found`);
}, 3000);

// Test 5: Check Vite HMR
if (window.__vite_plugin_react_preamble_installed__) {
  logResult('Vite HMR', true, 'HMR preamble installed');
} else {
  logResult('Vite HMR', false, 'HMR preamble not found');
}

// Test 6: Check for 504 errors
let networkErrors = [];
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args).catch(error => {
    if (error.message.includes('504') || error.message.includes('Failed to fetch')) {
      networkErrors.push(error.message);
    }
    throw error;
  });
};

setTimeout(() => {
  logResult('Network Requests', networkErrors.length === 0,
    networkErrors.length === 0 ? 'No 504 errors detected' : `${networkErrors.length} network errors found`);
}, 4000);

// Test 7: PWA Manifest
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => {
    logResult('PWA Manifest', !!manifest.name, `Manifest loaded: ${manifest.name}`);
  })
  .catch(error => {
    logResult('PWA Manifest', false, 'Failed to load manifest: ' + error.message);
  });

// Test 8: Critical CSS loaded
const hasAppCSS = document.querySelector('link[href*="App"]') || document.querySelector('style');
logResult('CSS Loading', !!hasAppCSS, hasAppCSS ? 'CSS detected in DOM' : 'No CSS found');

// Test 9: Check for duplicate React instances
setTimeout(() => {
  const reactInstances = [];
  if (window.React) reactInstances.push('window.React');
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) reactInstances.push('DevTools Hook');
  
  logResult('React Instances', reactInstances.length <= 2, 
    `React instances found: ${reactInstances.join(', ')}`);
}, 1000);

// Test 10: Check DOM structure
setTimeout(() => {
  const rootElement = document.getElementById('root');
  const hasContent = rootElement && rootElement.children.length > 0;
  logResult('DOM Rendering', hasContent, 
    hasContent ? `Root element has ${rootElement.children.length} children` : 'Root element empty or missing');
}, 5000);

// Final report
setTimeout(() => {
  console.log('');
  console.log('📊 Browser Test Results Summary');
  console.log('===============================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️ Warnings: ${results.warnings}`);
  
  const total = results.passed + results.failed;
  const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (passRate >= 80) {
    console.log('🎉 Application is working well!');
  } else if (passRate >= 60) {
    console.log('⚠️ Application has some issues to address.');
  } else {
    console.log('❌ Application needs significant fixes.');
  }
}, 6000);

console.log('');
console.log('🔄 Running tests... please wait 6 seconds for complete results.');
