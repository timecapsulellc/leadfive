#!/bin/bash

echo "🔍 QUICK AI COMPONENTS VERIFICATION"
echo "=================================="

# Check if components exist and have content
echo "📁 Component Files:"
for comp in "AICoachingPanel.jsx" "AIEarningsPrediction.jsx" "AITransactionHelper.jsx"; do
    if [ -f "src/components/$comp" ]; then
        size=$(wc -l < "src/components/$comp")
        echo "✅ $comp ($size lines)"
    else
        echo "❌ $comp MISSING"
    fi
done

# Check Dashboard imports
echo ""
echo "📄 Dashboard Integration:"
if grep -q "from '../components/AICoachingPanel'" src/pages/Dashboard.jsx; then
    echo "✅ AICoachingPanel imported"
else
    echo "❌ AICoachingPanel NOT imported"
fi

if grep -q "from '../components/AIEarningsPrediction'" src/pages/Dashboard.jsx; then
    echo "✅ AIEarningsPrediction imported"
else
    echo "❌ AIEarningsPrediction NOT imported"
fi

if grep -q "from '../components/AITransactionHelper'" src/pages/Dashboard.jsx; then
    echo "✅ AITransactionHelper imported"
else
    echo "❌ AITransactionHelper NOT imported"
fi

# Check AI menu item
if grep -q "ai-assistant" src/pages/Dashboard.jsx; then
    echo "✅ AI Assistant menu item exists"
else
    echo "❌ AI Assistant menu item missing"
fi

# Check AI components rendering
if grep -q "<AICoachingPanel" src/pages/Dashboard.jsx; then
    echo "✅ AI components rendered in Dashboard"
else
    echo "❌ AI components NOT rendered in Dashboard"
fi

echo ""
echo "🎯 VERIFICATION COMPLETE!"
echo ""
echo "If all items show ✅ but AI is still not visible:"
echo "1. Run: ./fix-ai-components.sh"
echo "2. Hard refresh browser (Ctrl+Shift+R)"
echo "3. Check browser console for errors"
echo "4. Visit: http://localhost:5173/ai-integration-test.html"
