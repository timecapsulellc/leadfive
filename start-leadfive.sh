#!/bin/bash

echo "🚀 Starting LeadFive on port 5175..."
echo "🧹 Clearing any existing processes..."

# Kill any existing processes on port 5175
lsof -ti:5175 | xargs kill -9 2>/dev/null || echo "Port 5175 was already free"

# Wait a moment
sleep 2

echo "📦 Building LeadFive..."
npm run build

echo "🌐 Starting server on port 5175..."
npm run serve &

# Wait for server to start
sleep 3

echo "✅ LeadFive should now be running at:"
echo "   🔗 http://localhost:5175"
echo "   🔗 http://127.0.0.1:5175"
echo ""
echo "🔍 Checking server status..."
if curl -s http://localhost:5175 > /dev/null; then
    echo "✅ Server is responding!"
else
    echo "❌ Server is not responding. Checking processes..."
    ps aux | grep -E "(serve|vite|node)" | grep -v grep
fi
