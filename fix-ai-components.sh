#!/bin/bash

echo "🔧 AI COMPONENTS FIX SCRIPT"
echo "================================"

# Step 1: Clear all caches
echo "🧹 Clearing caches..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf dist

# Step 2: Check if AI components exist
echo "📁 Checking AI components..."
components=("AICoachingPanel.jsx" "AIEarningsPrediction.jsx" "AITransactionHelper.jsx")
for comp in "${components[@]}"; do
    if [ -f "src/components/$comp" ]; then
        echo "✅ $comp exists"
    else
        echo "❌ $comp missing"
    fi
done

# Step 3: Check Dashboard integration
echo "📄 Checking Dashboard integration..."
if grep -q "AICoachingPanel" src/pages/Dashboard.jsx; then
    echo "✅ AI components imported in Dashboard"
else
    echo "❌ AI components NOT imported in Dashboard"
fi

if grep -q "ai-assistant" src/pages/Dashboard.jsx; then
    echo "✅ AI Assistant menu item exists"
else
    echo "❌ AI Assistant menu item missing"
fi

# Step 4: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 5: Build and start
echo "🚀 Starting development server..."
npm run dev &
DEV_PID=$!

# Step 6: Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

echo ""
echo "🎯 AI COMPONENTS FIX COMPLETE!"
echo "================================"
echo ""
echo "🌐 Your application should now be running at:"
echo "   👉 http://localhost:5173 (or next available port)"
echo ""
echo "🔍 To verify AI components are working:"
echo "   1. Open the dashboard in your browser"
echo "   2. Look for 'AI Assistant 🤖' in the left sidebar"
echo "   3. Click on it to see the AI features"
echo "   4. Check the overview section for AI cards"
echo ""
echo "🐛 If AI components are still not visible:"
echo "   1. Hard refresh browser (Ctrl+Shift+R)"
echo "   2. Check browser console for errors (F12)"
echo "   3. Open: http://localhost:5173/ai-integration-test.html"
echo ""
echo "Process ID: $DEV_PID"
echo "To stop server: kill $DEV_PID"
