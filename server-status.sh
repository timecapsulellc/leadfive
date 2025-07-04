#!/bin/bash

echo "🚀 LeadFive Server Status Check"
echo "==============================="

# Check if port 5175 is active
if lsof -i :5175 > /dev/null 2>&1; then
    echo "✅ Port 5175: ACTIVE"
    
    # Test HTTP response
    if curl -s http://localhost:5175 > /dev/null; then
        echo "✅ HTTP Response: SUCCESS"
        echo "🌐 LeadFive is LIVE at: http://localhost:5175"
    else
        echo "❌ HTTP Response: FAILED"
    fi
else
    echo "❌ Port 5175: NOT ACTIVE"
    echo "🔧 Starting server..."
    npm run dev &
    sleep 3
    echo "🔄 Retrying..."
fi

echo ""
echo "📊 Server Details:"
lsof -i :5175 2>/dev/null || echo "No process details available"

echo ""
echo "🎯 Quick Actions:"
echo "• Browser: http://localhost:5175"
echo "• Dev Tools: http://localhost:5175 + F12"
echo "• Hard Refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)"
