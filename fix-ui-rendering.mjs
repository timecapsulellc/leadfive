import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Fixing UI Rendering Issues...\n');

// 1. Remove all service worker files
console.log('🗑️  Removing service worker files...');
const swFiles = [
  'public/sw.js',
  'public/service-worker.js', 
  'dist/sw.js',
  'dist/service-worker.js'
];

swFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Deleted: ${file}`);
  }
});

// 2. Clean up index.html from service worker registrations
console.log('\n🔧 Cleaning index.html...');
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Remove all service worker registrations
const originalContent = indexContent;
indexContent = indexContent.replace(/<script[^>]*>[\s\S]*?if\s*\(['"]serviceWorker['"]\s*in\s*navigator\)[\s\S]*?<\/script>/g, '');
indexContent = indexContent.replace(/navigator\.serviceWorker\.register[\s\S]*?;/g, '');

if (originalContent !== indexContent) {
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Removed service worker registration from index.html');
} else {
  console.log('✅ index.html already clean');
}

// 3. Clean up public/index.html too if it exists
const publicIndexPath = path.join(__dirname, 'public/index.html');
if (fs.existsSync(publicIndexPath)) {
  console.log('\n🔧 Cleaning public/index.html...');
  let publicIndexContent = fs.readFileSync(publicIndexPath, 'utf8');
  
  const originalPublicContent = publicIndexContent;
  publicIndexContent = publicIndexContent.replace(/<script[^>]*>[\s\S]*?if\s*\(['"]serviceWorker['"]\s*in\s*navigator\)[\s\S]*?<\/script>/g, '');
  publicIndexContent = publicIndexContent.replace(/navigator\.serviceWorker\.register[\s\S]*?;/g, '');
  
  if (originalPublicContent !== publicIndexContent) {
    fs.writeFileSync(publicIndexPath, publicIndexContent);
    console.log('✅ Removed service worker registration from public/index.html');
  } else {
    console.log('✅ public/index.html already clean');
  }
}

// 4. Create cache clear script
console.log('\n📝 Creating cache clear script...');
const cacheClearScript = `// Clear all caches and service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
    console.log('✅ Service workers unregistered');
  });
}

if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
    console.log('✅ Cache storage cleared');
  });
}

localStorage.clear();
sessionStorage.clear();
console.log('✅ All browser storage cleared!');
console.log('🔄 Refreshing page...');
setTimeout(() => location.reload(true), 1000);
`;

fs.writeFileSync(path.join(__dirname, 'public/clear-cache.js'), cacheClearScript);
console.log('✅ Cache clear script created at public/clear-cache.js');

// 5. Create a simple test component
console.log('\n📝 Creating test component...');
const testAppContent = `import React from 'react';

export default function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#1976d2', marginBottom: '20px' }}>
        🚀 LeadFive Test App
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        ✅ If you see this, React is working perfectly!
      </p>
      <p style={{ fontSize: '16px', color: '#666' }}>
        Time: {new Date().toLocaleTimeString()}
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e8f5e8', 
        borderRadius: '5px',
        border: '1px solid #4caf50'
      }}>
        <p style={{ margin: 0, color: '#2e7d32' }}>
          🎉 UI Rendering Issues Fixed!
        </p>
      </div>
    </div>
  );
}`;

fs.writeFileSync(path.join(__dirname, 'src/TestApp.jsx'), testAppContent);
console.log('✅ Test component created at src/TestApp.jsx');

console.log('\n✅ All fixes applied! Next steps:');
console.log('1. Stop the dev server (Ctrl+C if running)');
console.log('2. Clear Vite cache: rm -rf node_modules/.vite');
console.log('3. Clear dist folder: rm -rf dist');
console.log('4. Start server: npm run dev');
console.log('5. Open browser: http://localhost:5175');
console.log('6. If issues persist, run in browser console:');
console.log('   await import("/clear-cache.js")');
console.log('\n🧪 To test with minimal component:');
console.log('   Temporarily replace App import in main.jsx with TestApp');
