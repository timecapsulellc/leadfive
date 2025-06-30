import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 COMPREHENSIVE AI INTEGRATION VERIFICATION');
console.log('===========================================\n');

let totalIssues = 0;
let totalSuccess = 0;

// Create results object for enhanced reporting
const results = {
  timestamp: new Date().toISOString(),
  fileChecks: [],
  importChecks: [],
  componentUsageChecks: [],
  stateChecks: [],
  functionChecks: [],
  styleChecks: [],
  orphiChainChecks: [],
  recommendations: []
};

// 1. Check Dashboard File
console.log('📄 1. CHECKING DASHBOARD FILE:');
const dashboardPath = 'src/pages/Dashboard.jsx';
const dashboardContent = fs.existsSync(dashboardPath) ? fs.readFileSync(dashboardPath, 'utf8') : '';
const dashboardCssPath = 'src/pages/Dashboard.css';
const dashboardCssContent = fs.existsSync(dashboardCssPath) ? fs.readFileSync(dashboardCssPath, 'utf8') : '';

// Function to check if the content contains a string
function contentIncludes(content, searchString) {
  return content.indexOf(searchString) !== -1;
}

// Check for AI imports
const aiImports = [
  'AICoachingPanel',
  'AIEarningsPrediction',
  'AITransactionHelper',
  'AIMarketInsights',
  'AISuccessStories',
  'AIEmotionTracker',
  'OpenAIService',
  'ElevenLabsService'
];

console.log('\n✓ AI Component Imports:');
aiImports.forEach(imp => {
  const pattern1 = `import ${imp} from`;
  const pattern2 = `import { ${imp}`;
  const pattern3 = `import {${imp}`;
  
  const found = contentIncludes(dashboardContent, pattern1) || 
                contentIncludes(dashboardContent, pattern2) || 
                contentIncludes(dashboardContent, pattern3);
  
  if (found) {
    console.log(`  ✅ ${imp} is imported`);
    totalSuccess++;
  } else {
    console.log(`  ❌ ${imp} is NOT imported`);
    totalIssues++;
  }
  
  results.importChecks.push({
    description: `${imp} import`,
    found: found,
    status: found ? 'success' : 'error'
  });
});

// Check for AI menu item
console.log('\n✓ AI Menu Item:');
const menuPatterns = [
  "label: 'AI Assistant'",
  'label: "AI Assistant"',
  "id: 'ai-assistant'",
  'id: "ai-assistant"',
  "AI Assistant",
];

const hasAiMenuItem = menuPatterns.some(pattern => contentIncludes(dashboardContent, pattern));

if (hasAiMenuItem) {
  console.log('  ✅ AI Assistant menu item exists');
  totalSuccess++;
} else {
  console.log('  ❌ AI Assistant menu item NOT found');
  totalIssues++;
}

results.componentUsageChecks.push({
  description: 'AI Assistant menu item',
  found: hasAiMenuItem,
  status: hasAiMenuItem ? 'success' : 'error'
});

// Check for AI rendering in overview
console.log('\n✓ AI Components in Overview:');
const overviewComponents = [
  'AICoachingPanel',
  'AIEarningsPrediction', 
  'AITransactionHelper', 
  'AIMarketInsights', 
  'AISuccessStories', 
  'AIEmotionTracker'
];

overviewComponents.forEach(comp => {
  const componentPatterns = [
    `<${comp}`,
    `<${comp} `,
  ];
  
  const found = componentPatterns.some(pattern => contentIncludes(dashboardContent, pattern));
  
  if (found) {
    console.log(`  ✅ ${comp} is rendered in the dashboard`);
    totalSuccess++;
  } else {
    console.log(`  ❌ ${comp} is NOT rendered in the dashboard`);
    totalIssues++;
  }
  
  results.componentUsageChecks.push({
    description: `${comp} component usage`,
    found: found,
    status: found ? 'success' : 'error'
  });
});

// 2. Check AI Component Files
console.log('\n📂 2. CHECKING AI COMPONENT FILES:');
const aiComponentFiles = [
  'src/components/AICoachingPanel.jsx',
  'src/components/AIEarningsPrediction.jsx',
  'src/components/AITransactionHelper.jsx',
  'src/components/AIMarketInsights.jsx',
  'src/components/AISuccessStories.jsx',
  'src/components/AIEmotionTracker.jsx'
];

aiComponentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasExport = content.includes('export default');
    const hasReturn = content.includes('return');
    const status = hasExport && hasReturn ? 'success' : 'warning';
    
    if (hasExport && hasReturn) {
      console.log(`  ✅ ${path.basename(file)} exists and is properly structured`);
      totalSuccess++;
    } else {
      console.log(`  ⚠️  ${path.basename(file)} exists but may have issues`);
      totalIssues++;
    }
    
    results.fileChecks.push({
      path: file,
      name: path.basename(file),
      category: 'AI Component',
      exists: true,
      status: status
    });
  } else {
    console.log(`  ❌ ${path.basename(file)} does NOT exist`);
    totalIssues++;
    
    results.fileChecks.push({
      path: file,
      name: path.basename(file),
      category: 'AI Component',
      exists: false,
      status: 'error'
    });
  }
});

// 3. Check CSS Files
console.log('\n🎨 3. CHECKING CSS FILES:');
const cssFiles = [
  'src/components/AICoachingPanel.css',
  'src/components/AIEarningsPrediction.css',
  'src/components/AITransactionHelper.css',
  'src/components/AIMarketInsights.css',
  'src/components/AISuccessStories.css',
  'src/components/AIEmotionTracker.css'
];

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${path.basename(file)} exists`);
    totalSuccess++;
    
    results.fileChecks.push({
      path: file,
      name: path.basename(file),
      category: 'CSS',
      exists: true,
      status: 'success'
    });
  } else {
    console.log(`  ❌ ${path.basename(file)} does NOT exist`);
    totalIssues++;
    
    results.fileChecks.push({
      path: file,
      name: path.basename(file),
      category: 'CSS',
      exists: false,
      status: 'warning' // Warning since CSS might be in Dashboard.css
    });
  }
});

// 4. Check Services
console.log('\n⚙️  4. CHECKING AI SERVICES:');
const services = [
  'src/services/OpenAIService.js',
  'src/services/ElevenLabsService.js',
  'src/services/AIEnhancedFeatures.js'
];

services.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${path.basename(file)} exists`);
    totalSuccess++;
    
    results.fileChecks.push({
      path: file,
      name: path.basename(file),
      category: 'AI Service',
      exists: true,
      status: 'success'
    });
  } else {
    console.log(`  ❌ ${path.basename(file)} does NOT exist`);
    totalIssues++;
    
    results.fileChecks.push({
      path: file,
      name: path.basename(file),
      category: 'AI Service',
      exists: false,
      status: 'error'
    });
  }
});

// 5. Check Hooks
console.log('\n🔗 5. CHECKING HOOKS:');
const hookPath = 'src/hooks/useAIIntegration.js';
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  const hasUseOpenAI = hookContent.includes('export const useOpenAI');
  const hasUseElevenLabs = hookContent.includes('export const useElevenLabs');
  const status = hasUseOpenAI && hasUseElevenLabs ? 'success' : 'warning';
  
  if (hasUseOpenAI && hasUseElevenLabs) {
    console.log('  ✅ useAIIntegration.js exists with required exports');
    totalSuccess++;
  } else {
    console.log('  ⚠️  useAIIntegration.js exists but missing exports');
    totalIssues++;
  }
  
  results.fileChecks.push({
    path: hookPath,
    name: path.basename(hookPath),
    category: 'Hook',
    exists: true,
    status: status
  });
} else {
  console.log('  ❌ useAIIntegration.js does NOT exist');
  totalIssues++;
  
  results.fileChecks.push({
    path: hookPath,
    name: path.basename(hookPath),
    category: 'Hook',
    exists: false,
    status: 'warning' // Warning since hooks might be integrated directly
  });
}

// 6. Check Dashboard.css for AI styles
console.log('\n🎨 6. CHECKING DASHBOARD.CSS FOR AI STYLES:');
if (fs.existsSync(dashboardCssPath)) {
  const aiStyles = ['.ai-chat-widget', '.ai-features-grid', '.ai-card', '.ai-chat', '.ai-assistant-container', '.ai-tab-content'];
  
  aiStyles.forEach(style => {
    const found = dashboardCssContent.includes(style);
    if (found) {
      console.log(`  ✅ ${style} styles exist`);
      totalSuccess++;
    } else {
      console.log(`  ❌ ${style} styles NOT found`);
      totalIssues++;
    }
    
    results.styleChecks.push({
      description: `${style} styles`,
      found: found,
      status: found ? 'success' : 'warning'
    });
  });
}

// 7. Check for ORPHI references in all key files
console.log('\n🔎 7. CHECKING FOR ORPHI REFERENCES:');
const orphiPatterns = [
  { pattern: 'Orphi', description: 'Direct Orphi mention' },
  { pattern: 'OrphiChain', description: 'OrphiChain mention' },
  { pattern: 'ORPHI', description: 'ORPHI in all caps' },
];

// Check in key files
const filesToCheckForOrphi = [
  dashboardPath,
  'src/pages/Home.jsx',
  'index.html',
  ...aiComponentFiles.filter(file => fs.existsSync(file))
];

let orphiRefsFound = 0;

filesToCheckForOrphi.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  const fileName = path.basename(file);
  let fileHasOrphi = false;
  
  orphiPatterns.forEach(pattern => {
    if (content.includes(pattern.pattern)) {
      console.log(`  ⚠️ Found ${pattern.pattern} in ${fileName}`);
      orphiRefsFound++;
      fileHasOrphi = true;
      
      results.orphiChainChecks.push({
        file: fileName,
        description: pattern.description,
        found: true,
        status: 'error'
      });
    }
  });
  
  if (!fileHasOrphi) {
    console.log(`  ✅ No ORPHI references in ${fileName}`);
  }
});

if (orphiRefsFound === 0) {
  console.log('  ✅ No ORPHI references found in any files');
  totalSuccess++;
} else {
  console.log(`  ⚠️ Found ${orphiRefsFound} ORPHI references that need to be updated`);
  totalIssues += orphiRefsFound;
}

// Generate recommendations based on results
console.log('\n💡 Generating recommendations...');

// Missing files
const missingFiles = results.fileChecks.filter(check => !check.exists);
if (missingFiles.length > 0) {
  results.recommendations.push({
    type: 'error',
    message: 'Missing required files',
    details: `The following files are missing: ${missingFiles.map(f => f.name).join(', ')}`
  });
}

// Missing imports
const missingImports = results.importChecks.filter(check => !check.found);
if (missingImports.length > 0) {
  results.recommendations.push({
    type: 'error',
    message: 'Missing imports in Dashboard.jsx',
    details: `The following imports are missing: ${missingImports.map(i => i.description).join(', ')}`
  });
}

// Missing component usage
const missingComponents = results.componentUsageChecks.filter(check => !check.found);
if (missingComponents.length > 0) {
  results.recommendations.push({
    type: 'error',
    message: 'Missing component usage in Dashboard.jsx',
    details: `The following components are not used: ${missingComponents.map(c => c.description).join(', ')}`
  });
}

// OrphiChain references
if (results.orphiChainChecks.length > 0) {
  results.recommendations.push({
    type: 'error',
    message: 'OrphiChain references found',
    details: `Found ${results.orphiChainChecks.length} references to OrphiChain that need to be updated to LEAD FIVE`
  });
}

// Add general troubleshooting recommendations
results.recommendations.push({
  type: 'info',
  message: 'Check browser console',
  details: 'Open browser developer tools (F12) and check the console for any errors related to AI components'
});

results.recommendations.push({
  type: 'info',
  message: 'Verify API keys and limits',
  details: 'Ensure OpenAI and ElevenLabs API keys are properly configured and usage limits have not been exceeded'
});

results.recommendations.push({
  type: 'info',
  message: 'Test with debug mode',
  details: 'Add the debug script tag to enable visual debugging of AI components'
});

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('📊 FINAL SUMMARY:');
console.log('='.repeat(50));
console.log(`✅ Successful checks: ${totalSuccess}`);
console.log(`❌ Issues found: ${totalIssues}`);
console.log(`📈 Success rate: ${Math.round((totalSuccess / (totalSuccess + totalIssues)) * 100)}%`);

if (totalIssues === 0) {
  console.log('\n🎉 ALL AI FEATURES ARE PROPERLY INTEGRATED!');
  console.log('If they\'re still not visible, the issue might be:');
  console.log('  1. Browser cache (try hard refresh)');
  console.log('  2. Need to connect wallet first');
  console.log('  3. Need to navigate to /dashboard route');
  console.log('  4. API usage limits or authentication issues');
} else {
  console.log('\n⚠️  THERE ARE ISSUES THAT NEED TO BE FIXED!');
  console.log('Check the report for details on what needs to be fixed.');
}

// Generate enhanced HTML report
console.log('\n📊 Generating enhanced HTML report...');

function getStatusBadge(status) {
  if (status === 'success') return '<span class="badge success">✓</span>';
  if (status === 'warning') return '<span class="badge warning">⚠️</span>';
  if (status === 'error') return '<span class="badge error">✗</span>';
  return '';
}

function getStatusClass(status) {
  if (status === 'success') return 'success';
  if (status === 'warning') return 'warning';
  if (status === 'error') return 'error';
  return '';
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LEAD FIVE - AI Integration Verification Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #1a1b3a;
            color: white;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
        h1 {
            color: #00D4FF;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-top: 0;
        }
        h2 {
            color: #BD00FF;
            margin-top: 30px;
            border-left: 4px solid #BD00FF;
            padding-left: 10px;
        }
        .summary {
            background-color: rgba(255,255,255,0.05);
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: rgba(0,0,0,0.2);
            border-radius: 4px;
            overflow: hidden;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        th {
            background-color: rgba(0,0,0,0.3);
            font-weight: bold;
        }
        tr:hover {
            background-color: rgba(255,255,255,0.05);
        }
        .badge {
            display: inline-block;
            padding: 3px 7px;
            border-radius: 50%;
            font-size: 12px;
            width: 16px;
            height: 16px;
            text-align: center;
            line-height: 16px;
        }
        .success {
            background-color: rgba(0,255,0,0.2);
            color: #00ff00;
        }
        .warning {
            background-color: rgba(255,255,0,0.2);
            color: #ffff00;
        }
        .error {
            background-color: rgba(255,0,0,0.2);
            color: #ff0000;
        }
        .recommendation {
            padding: 10px 15px;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        .recommendation.info {
            background-color: rgba(0,191,255,0.2);
            border-left: 4px solid #00bfff;
        }
        .recommendation.error {
            background-color: rgba(255,0,0,0.2);
            border-left: 4px solid #ff0000;
        }
        .recommendation.warning {
            background-color: rgba(255,255,0,0.2);
            border-left: 4px solid #ffff00;
        }
        .recommendation h3 {
            margin-top: 0;
            font-size: 16px;
        }
        .checklist {
            list-style-type: none;
            padding-left: 0;
        }
        .checklist li {
            margin-bottom: 10px;
            padding-left: 25px;
            position: relative;
        }
        .checklist li:before {
            content: "☐";
            position: absolute;
            left: 0;
            color: #3498db;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .orphi-reference {
            background-color: rgba(255,0,0,0.2);
            color: #ff0000;
            padding: 2px 5px;
            border-radius: 3px;
        }
        .actions {
            margin-top: 30px;
            padding: 15px;
            background-color: rgba(0,0,0,0.2);
            border-radius: 5px;
        }
        .debug-instructions {
            background-color: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            font-family: monospace;
        }
        .code {
            background-color: rgba(0,0,0,0.5);
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 LEAD FIVE - AI Integration Verification Report</h1>
        <p>Report generated: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
            <h2>Summary</h2>
            <p>
                Files Checked: ${results.fileChecks.length}<br>
                Files Found: ${results.fileChecks.filter(f => f.exists).length}<br>
                Files Missing: ${results.fileChecks.filter(f => !f.exists).length}<br>
                Import Issues: ${results.importChecks.filter(i => !i.found).length}<br>
                Component Usage Issues: ${results.componentUsageChecks.filter(c => !c.found).length}<br>
                OrphiChain References: ${results.orphiChainChecks.length}<br>
                Success Rate: ${Math.round((totalSuccess / (totalSuccess + totalIssues)) * 100)}%
            </p>
        </div>

        <h2>File Checks</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>File</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                ${results.fileChecks.map(file => `
                <tr class="${getStatusClass(file.status)}">
                    <td>${getStatusBadge(file.status)}</td>
                    <td>${file.name}</td>
                    <td>${file.category}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <h2>Import Checks</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${results.importChecks.map(check => `
                <tr class="${getStatusClass(check.status)}">
                    <td>${getStatusBadge(check.status)}</td>
                    <td>${check.description}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <h2>Component Usage Checks</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${results.componentUsageChecks.map(check => `
                <tr class="${getStatusClass(check.status)}">
                    <td>${getStatusBadge(check.status)}</td>
                    <td>${check.description}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <h2>Style Checks</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${results.styleChecks.map(check => `
                <tr class="${getStatusClass(check.status)}">
                    <td>${getStatusBadge(check.status)}</td>
                    <td>${check.description}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        ${results.orphiChainChecks.length > 0 ? `
        <h2>OrphiChain References</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>File</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${results.orphiChainChecks.map(check => `
                <tr class="${getStatusClass(check.status)}">
                    <td>${getStatusBadge(check.status)}</td>
                    <td>${check.file}</td>
                    <td>${check.description}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        <h2>Recommendations</h2>
        ${results.recommendations.map(rec => `
        <div class="recommendation ${rec.type}">
            <h3>${rec.message}</h3>
            <p>${rec.details}</p>
        </div>
        `).join('')}

        <div class="actions">
            <h2>Next Steps Checklist</h2>
            <ul class="checklist">
                <li>Check if the server is running correctly (npm run dev)</li>
                <li>Clear browser cache and reload the page</li>
                <li>Check browser console for any JavaScript errors</li>
                <li>Verify that API keys are correctly set in environment variables</li>
                <li>Test AI chat functionality with a simple prompt</li>
                <li>Enable debug mode to visualize AI components (see instructions below)</li>
            </ul>
        </div>

        <div class="debug-instructions">
            <h2>Debug Mode Instructions</h2>
            <p>To enable visual debugging of AI components, add this script to your HTML or console:</p>
            <div class="code">
                // Create a debug script element<br>
                const script = document.createElement('script');<br>
                script.src = '/ai-debug.js';<br>
                document.body.appendChild(script);
            </div>
            <p>This will add a debug toggle button to your page that will:</p>
            <ul>
                <li>Add bright borders around AI components</li>
                <li>Force-display hidden components</li>
                <li>Log AI component information to the console</li>
            </ul>
        </div>

        <div class="footer">
            <p>LEAD FIVE AI Integration Verification Tool v1.0</p>
        </div>
    </div>
</body>
</html>`;

// Write the HTML report
fs.writeFileSync('public/ai-verification-report.html', htmlContent);

// Add a debug.css file to help with debugging AI components
const debugCss = `/* Debug styles for AI components */
.debug-box {
  border: 3px solid red !important;
  padding: 10px !important;
  margin: 10px 0 !important;
  background-color: rgba(255, 0, 0, 0.1) !important;
  color: #ff0000 !important;
  font-weight: bold !important;
}

.ai-component-debug {
  position: relative !important;
  border: 2px solid red !important;
  min-height: 30px !important;
  min-width: 30px !important;
}

.ai-component-debug::before {
  content: attr(data-component-name) !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  background-color: red !important;
  color: white !important;
  padding: 2px 5px !important;
  font-size: 10px !important;
  z-index: 9999 !important;
}

/* Force display of potentially hidden elements */
.force-display {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
}
`;

fs.writeFileSync('public/debug.css', debugCss);

// Create a debug mode toggle script
const debugToggleScript = `// Debug toggle script for AI components
console.log('🔍 LEAD FIVE AI Debug Mode');

function toggleDebugMode() {
  const debugLink = document.getElementById('ai-debug-css');
  if (debugLink) {
    document.head.removeChild(debugLink);
    console.log('❌ AI Debug Mode Disabled');
    
    // Remove debug classes
    document.querySelectorAll('.ai-component-debug').forEach(el => {
      el.classList.remove('ai-component-debug');
      el.classList.remove('force-display');
      delete el.dataset.componentName;
    });
  } else {
    const link = document.createElement('link');
    link.id = 'ai-debug-css';
    link.rel = 'stylesheet';
    link.href = '/debug.css';
    document.head.appendChild(link);
    
    // Add debug classes to AI components
    const aiComponents = document.querySelectorAll('[class*="ai-"], [id*="ai-"], [class*="AI"], [id*="AI"]');
    aiComponents.forEach(comp => {
      comp.classList.add('ai-component-debug');
      comp.dataset.componentName = comp.tagName.toLowerCase();
      comp.classList.add('force-display');
    });
    
    // Also check for components by their potential names
    const potentialAIComponents = [
      'AICoachingPanel', 'AIEarningsPrediction', 'AITransactionHelper', 
      'AIMarketInsights', 'AISuccessStories', 'AIEmotionTracker'
    ];
    
    potentialAIComponents.forEach(name => {
      const elements = document.getElementsByTagName(name);
      if (elements.length > 0) {
        Array.from(elements).forEach(el => {
          el.classList.add('ai-component-debug');
          el.dataset.componentName = name;
          el.classList.add('force-display');
        });
      }
    });
    
    // Check for elements with ai-related data attributes
    document.querySelectorAll('[data-ai], [data-ai-component]').forEach(el => {
      el.classList.add('ai-component-debug');
      el.dataset.componentName = el.dataset.aiComponent || 'ai-element';
      el.classList.add('force-display');
    });
    
    console.log('✅ AI Debug Mode Enabled');
  }
}

// Create debug toggle button
const button = document.createElement('button');
button.textContent = 'Toggle AI Debug Mode';
button.style.position = 'fixed';
button.style.bottom = '10px';
button.style.right = '10px';
button.style.zIndex = '9999';
button.style.backgroundColor = '#3498db';
button.style.color = 'white';
button.style.border = 'none';
button.style.padding = '8px 15px';
button.style.borderRadius = '4px';
button.style.cursor = 'pointer';
button.onclick = toggleDebugMode;

document.body.appendChild(button);

// Log AI components found
console.log('Searching for AI components...');
setTimeout(() => {
  const aiComponents = document.querySelectorAll('[class*="ai-"], [id*="ai-"], [class*="AI"], [id*="AI"]');
  console.log(\`Found \${aiComponents.length} potential AI-related elements\`);
  
  if (aiComponents.length > 0) {
    console.log('AI Components found:');
    aiComponents.forEach(comp => {
      console.log(\`- \${comp.tagName.toLowerCase()}\${comp.id ? ' #' + comp.id : ''} \${Array.from(comp.classList).join('.')}\`);
    });
  } else {
    console.warn('No AI components found in the DOM');
  }

  // Add a test AI component to confirm the debug script works
  console.log('Adding a test AI component to verify debugging...');
  const testDiv = document.createElement('div');
  testDiv.className = 'ai-test-component';
  testDiv.textContent = 'AI Debug Test Component';
  testDiv.style.position = 'fixed';
  testDiv.style.top = '10px';
  testDiv.style.right = '10px';
  testDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
  testDiv.style.color = 'white';
  testDiv.style.padding = '10px';
  testDiv.style.borderRadius = '4px';
  testDiv.style.zIndex = '9998';
  document.body.appendChild(testDiv);
}, 2000);
`;

fs.writeFileSync('public/ai-debug.js', debugToggleScript);

console.log('\n✅ Verification complete!');
console.log('📊 HTML report generated at: public/ai-verification-report.html');
console.log('🔍 Debug CSS generated at: public/debug.css');
console.log('🔧 Debug toggle script generated at: public/ai-debug.js');

console.log('\n📋 To view the report:');
console.log('1. Make sure your development server is running (npm run dev)');
console.log('2. Open http://localhost:5173/ai-verification-report.html in your browser');
console.log('3. To enable debug mode, open browser console and run:');
console.log('   const script = document.createElement("script"); script.src = "/ai-debug.js"; document.body.appendChild(script);');
