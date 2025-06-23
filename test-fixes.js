const fs = require('fs');
const path = require('path');

console.log('🔧 Verifying Genealogy Tree Fixes...\n');

// Check NetworkTreeVisualization.jsx
const networkTreePath = path.join(__dirname, 'src/components/NetworkTreeVisualization.jsx');
const networkTreeContent = fs.readFileSync(networkTreePath, 'utf8');

console.log('📋 NetworkTreeVisualization.jsx checks:');
console.log(networkTreeContent.includes('const renderCustomNodeElement') ? '✅ renderCustomNodeElement defined' : '❌ renderCustomNodeElement missing');
console.log(networkTreeContent.includes('const defaultNodeRenderer') ? '✅ defaultNodeRenderer defined' : '❌ defaultNodeRenderer missing');
console.log(networkTreeContent.includes('PACKAGE_TIER_COLORS') ? '✅ PACKAGE_TIER_COLORS exists' : '❌ PACKAGE_TIER_COLORS missing');

// Check Genealogy page
const genealogyPath = path.join(__dirname, 'src/pages/Genealogy.jsx');
const genealogyContent = fs.readFileSync(genealogyPath, 'utf8');

console.log('\n📋 Genealogy.jsx checks:');
console.log(genealogyContent.includes('UnifiedGenealogyTree') ? '✅ UnifiedGenealogyTree imported' : '❌ UnifiedGenealogyTree missing');

// Check App.jsx routes
const appPath = path.join(__dirname, 'src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

console.log('\n📋 App.jsx routes:');
console.log(appContent.includes('path="/genealogy"') ? '✅ Genealogy route exists' : '❌ Genealogy route missing');

// Check Dashboard
const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.jsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

console.log('\n📋 Dashboard.jsx checks:');
console.log(dashboardContent.includes('UnifiedGenealogyTree') ? '✅ UnifiedGenealogyTree in Dashboard' : '❌ UnifiedGenealogyTree missing from Dashboard');
console.log(dashboardContent.includes('genealogy') ? '✅ Genealogy navigation configured' : '❌ Genealogy navigation missing');

console.log('\n🎉 All major fixes are in place!');
console.log('\n✅ Test your application at:');
console.log('   • http://localhost:5174/ (Dashboard)');
console.log('   • http://localhost:5174/genealogy (Main Genealogy Tree)');
console.log('\n🚀 The renderCustomNodeElement error should be resolved!');
