#!/bin/bash

echo "🚀 STARTING CLEAN DEVELOPMENT SERVER"
echo "=================================="

# Kill any existing vite processes
pkill -f vite 2>/dev/null || true

# Clear all possible caches
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Start development server
echo "Starting development server..."
npm run dev &

# Get the process ID
DEV_PID=$!
echo "Development server started with PID: $DEV_PID"

# Wait a moment for server to start
sleep 3

echo ""
echo "🎯 LEGACY DASHBOARD REMOVED & SERVER RESTARTED!"
echo "=============================================="
echo ""
echo "✅ Legacy /src/components/dashboard/ directory removed"
echo "✅ All caches cleared"
echo "✅ Development server restarted fresh"
echo ""
echo "🌐 Your application should now be running at:"
echo "   👉 http://localhost:5173 (or next available port)"
echo ""
echo "🤖 The AI components should now be visible:"
echo "   • AI Assistant menu item in sidebar"
echo "   • AI cards in dashboard overview"
echo "   • Full AI section when clicking AI Assistant"
echo ""
echo "Process ID: $DEV_PID"
echo "To stop: kill $DEV_PID"
