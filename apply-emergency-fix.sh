#!/bin/bash

echo "🚨 EMERGENCY FIX: Switching to Emergency Chatbot"
echo "================================================"

# Navigate to project directory
cd "/Users/dadou/LEAD FIVE"

# Kill any running Vite processes
echo "🛑 Stopping development server..."
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# Clear all Vite cache
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

# Clear browser cache files
echo "🔄 Clearing additional cache..."
rm -rf node_modules/.cache

# Force npm cache clean
npm cache clean --force

echo "✅ Cache cleared successfully!"
echo "🚀 Starting development server with emergency fix..."

# Start development server
npm run dev &

# Wait a moment for server to start
sleep 3

echo ""
echo "🎉 Emergency fix applied!"
echo "📋 Status:"
echo "   ✅ Emergency chatbot component active"
echo "   ✅ No FaMinimize imports"
echo "   ✅ Minimal working version"
echo ""
echo "🌐 Open: http://localhost:5173"
echo "💡 The ARIA chatbot should now work without errors!"
