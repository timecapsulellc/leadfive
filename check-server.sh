#!/bin/bash

echo "🔍 LeadFive Server Status Check"
echo "================================"

# Check if port 5175 is responding
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5175 | grep -q "200"; then
    echo "✅ Port 5175: LeadFive is RUNNING"
    echo "🌐 Access URLs:"
    echo "   • http://localhost:5175"
    echo "   • http://127.0.0.1:5175"
    echo "   • http://0.0.0.0:5175"
else
    echo "❌ Port 5175: Not responding"
    echo "🔧 Checking processes..."
    ps aux | grep -E "(vite|serve|node)" | grep -v grep | head -5
fi

echo ""
echo "📊 Port Status:"
netstat -an | grep 5175 || echo "No processes found on port 5175"

echo ""
echo "🎯 If the server isn't running, try:"
echo "   npm run dev"
echo "   or"
echo "   npm run serve"
