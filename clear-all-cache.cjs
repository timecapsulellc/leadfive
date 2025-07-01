#!/usr/bin/env node

/**
 * Complete cache clearing script for LeadFive
 * This will clear all possible cached content
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting complete cache cleanup...');

// Update service worker version to force cache refresh
const swPath = path.join(__dirname, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  const newVersion = `leadfive-v${Date.now()}`;
  swContent = swContent.replace(/leadfive-v[\d\.]+/g, newVersion);
  fs.writeFileSync(swPath, swContent);
  console.log('✅ Service worker version updated:', newVersion);
}

// Create cache clear instructions
const instructions = `
🔧 COMPLETE CACHE CLEARING INSTRUCTIONS:

1. **Close ALL browser tabs/windows for localhost**
2. **Clear browser cache completely:**
   - Chrome: DevTools → Application → Storage → Clear Site Data
   - Firefox: DevTools → Storage → Clear All
   - Safari: Develop → Empty Caches

3. **Clear service worker:**
   - Chrome: DevTools → Application → Service Workers → Unregister
   - Firefox: DevTools → Application → Service Workers → Unregister

4. **Hard refresh:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

5. **Access the NEW server URL:**
   - ❌ OLD: http://localhost:5179 
   - ✅ NEW: http://localhost:5180

6. **If still seeing OrphiChain:**
   - Open Developer Tools
   - Go to Network tab
   - Check "Disable cache"
   - Refresh page
`;

console.log(instructions);

// Write instructions to file
fs.writeFileSync(path.join(__dirname, 'CACHE_CLEAR_INSTRUCTIONS.txt'), instructions);
console.log('📝 Instructions saved to CACHE_CLEAR_INSTRUCTIONS.txt');
