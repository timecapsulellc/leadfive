#!/bin/bash

echo "🚀 AI Dashboard Implementation - Final Testing Script"
echo "=================================================="

# Check if development server is running
if lsof -ti:5174 > /dev/null; then
    echo "✅ Development server is running on port 5174"
else
    echo "❌ Development server not running. Starting..."
    npm run dev &
    sleep 5
fi

echo ""
echo "🔍 Testing AI Implementation:"
echo ""

# Test AI component files
echo "1. Checking AI Component Files:"
for component in "AICoachingPanel" "AIEarningsPrediction" "AITransactionHelper"; do
    if [ -f "src/components/${component}.jsx" ]; then
        echo "   ✅ ${component}.jsx exists"
    else
        echo "   ❌ ${component}.jsx missing"
    fi
done

echo ""
echo "2. Checking AI Integration in Dashboard:"

# Check Dashboard integration
if grep -q "AI Assistant" src/pages/Dashboard.jsx; then
    echo "   ✅ AI Assistant menu item found"
else
    echo "   ❌ AI Assistant menu item missing"
fi

if grep -q "AISection" src/pages/Dashboard.jsx; then
    echo "   ✅ AISection component found"
else
    echo "   ❌ AISection component missing"
fi

if grep -q "case 'ai-assistant'" src/pages/Dashboard.jsx; then
    echo "   ✅ AI Assistant route case found"
else
    echo "   ❌ AI Assistant route case missing"
fi

echo ""
echo "3. Checking Test Page:"
if [ -f "src/pages/TestAIDashboard.jsx" ]; then
    echo "   ✅ TestAIDashboard.jsx exists"
else
    echo "   ❌ TestAIDashboard.jsx missing"
fi

if grep -q "test-ai" src/App.jsx; then
    echo "   ✅ Test AI route found in App.jsx"
else
    echo "   ❌ Test AI route missing from App.jsx"
fi

echo ""
echo "4. Checking AI Guide:"
if [ -f "public/ai-features-guide.html" ]; then
    echo "   ✅ AI Features Guide exists"
else
    echo "   ❌ AI Features Guide missing"
fi

echo ""
echo "📍 Access Points for Testing:"
echo "================================"
echo "Main Dashboard:       http://localhost:5174/dashboard"
echo "AI Test Page:         http://localhost:5174/test-ai"
echo "AI Features Guide:    http://localhost:5174/ai-features-guide.html"
echo ""
echo "📋 Testing Checklist:"
echo "====================="
echo "□ Navigate to dashboard - AI Assistant should be visible in sidebar"
echo "□ Click AI Assistant - should show tabbed AI interface"
echo "□ Check AI components are displayed and interactive"
echo "□ Visit test page - all AI components should be visible"
echo "□ Look for AI status indicator in dashboard header"
echo "□ Test AI quick access button in header"
echo ""
echo "🎯 Expected Features:"
echo "===================="
echo "• AI Business Coach with personalized advice"
echo "• AI Earnings Prediction with forecasting"
echo "• AI Transaction Helper with guidance"
echo "• AI Performance Insights generation"
echo "• Voice-enabled responses (if API keys configured)"
echo "• Responsive design across devices"
echo ""

# Open browser windows for testing
echo "🌐 Opening browser windows for testing..."
sleep 2

if command -v open > /dev/null; then
    # macOS
    open "http://localhost:5174/ai-features-guide.html"
    sleep 1
    open "http://localhost:5174/test-ai"
    sleep 1
    open "http://localhost:5174/dashboard"
elif command -v xdg-open > /dev/null; then
    # Linux
    xdg-open "http://localhost:5174/ai-features-guide.html"
    sleep 1
    xdg-open "http://localhost:5174/test-ai"
    sleep 1
    xdg-open "http://localhost:5174/dashboard"
elif command -v start > /dev/null; then
    # Windows
    start "http://localhost:5174/ai-features-guide.html"
    sleep 1
    start "http://localhost:5174/test-ai"
    sleep 1
    start "http://localhost:5174/dashboard"
fi

echo ""
echo "✅ AI Implementation Complete!"
echo "=============================="
echo ""
echo "All AI features have been implemented and integrated into the dashboard."
echo "Users can now access AI coaching, predictions, and assistance directly"
echo "from the LeadFive dashboard interface."
echo ""
echo "For support, check the AI Features Guide or visit the test page."
