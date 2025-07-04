#!/bin/bash

echo "🔍 LeadFive Dashboard Diagnostic Report"
echo "======================================"

echo ""
echo "📁 Project Structure:"
echo "- App.jsx exists: $(test -f src/App.jsx && echo "✅ YES" || echo "❌ NO")"
echo "- main.jsx exists: $(test -f src/main.jsx && echo "✅ YES" || echo "❌ NO")"
echo "- Dashboard exists: $(test -f src/pages/Dashboard_AIRA_Advanced.jsx && echo "✅ YES" || echo "❌ NO")"

echo ""
echo "📦 Dependencies:"
echo "- Node version: $(node --version)"
echo "- NPM version: $(npm --version)"

echo ""
echo "🔧 Configuration:"
echo "- vite.config.js exists: $(test -f vite.config.js && echo "✅ YES" || echo "❌ NO")"
echo "- package.json exists: $(test -f package.json && echo "✅ YES" || echo "❌ NO")"

echo ""
echo "🌐 Network Status:"
echo "- Port 5175 in use: $(lsof -ti:5175 && echo "✅ YES" || echo "❌ NO")"

echo ""
echo "📱 PWA Files:"
echo "- Service Worker: $(test -f public/sw.js && echo "✅ YES" || echo "❌ NO")"
echo "- Manifest: $(test -f public/manifest.json && echo "✅ YES" || echo "❌ NO")"
echo "- PWA Manager: $(test -f src/PWAManager.js && echo "✅ YES" || echo "❌ NO")"

echo ""
echo "🔍 Recent App.jsx syntax check:"
node -c src/App.jsx 2>/dev/null && echo "✅ App.jsx syntax OK" || echo "❌ App.jsx has syntax errors"

echo ""
echo "======================================"
echo "🚀 Diagnostic complete!"
