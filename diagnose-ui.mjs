import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 UI Rendering Diagnostic Tool\n');

// 1. Check App.jsx export
console.log('1️⃣ Checking App.jsx export...');
const appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
const hasDefaultExport = appContent.includes('export default') || appContent.includes('export { default }');
const hasNamedExportAsDefault = appContent.match(/export\s*{\s*App\s*as\s*default\s*}/);

if (hasDefaultExport) {
  console.log('✅ App.jsx has default export');
} else if (hasNamedExportAsDefault) {
  console.log('✅ App.jsx exports App as default');
} else {
  console.log('❌ App.jsx missing default export!');
  console.log('   Found exports:', appContent.match(/export\s+(default\s+)?(?:function|const|class)\s+\w+/g));
}

// 2. Check main.jsx import
console.log('\n2️⃣ Checking main.jsx import...');
const mainContent = fs.readFileSync(path.join(__dirname, 'src/main.jsx'), 'utf8');
const appImport = mainContent.match(/import\s+(\w+)\s+from\s+['"]\.\/App(?:\.jsx)?['"]/);
if (appImport) {
  console.log('✅ main.jsx imports:', appImport[0]);
} else {
  console.log('❌ main.jsx has incorrect App import');
}

// 3. Check for React errors
console.log('\n3️⃣ Checking React setup...');
const hasReactImport = mainContent.includes('import React from');
const hasReactDOM = mainContent.includes('ReactDOM');
console.log(hasReactImport ? '✅ React imported' : '❌ React not imported');
console.log(hasReactDOM ? '✅ ReactDOM found' : '❌ ReactDOM missing');

// 4. Check index.html
console.log('\n4️⃣ Checking index.html...');
const indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const hasRoot = indexContent.includes('id="root"');
const hasMainScript = indexContent.includes('src="/src/main.jsx"');
console.log(hasRoot ? '✅ Root element found' : '❌ Root element missing');
console.log(hasMainScript ? '✅ Main script linked' : '❌ Main script not linked');

// 5. Check for service worker interference
console.log('\n5️⃣ Checking for service worker files...');
const swFiles = ['public/sw.js', 'dist/sw.js', 'public/service-worker.js'];
swFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`⚠️  Found: ${file} - This may cause issues!`);
  }
});

// 6. Check Vite config
console.log('\n6️⃣ Checking Vite configuration...');
const viteConfig = fs.readFileSync(path.join(__dirname, 'vite.config.js'), 'utf8');
const hasPort5175 = viteConfig.includes('5175');
console.log(hasPort5175 ? '✅ Vite configured for port 5175' : '❌ Port configuration issue');

console.log('\n📊 Diagnostic Summary:');
console.log('Run this to see specific issues with your UI rendering.');
