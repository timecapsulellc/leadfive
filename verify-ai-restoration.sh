#!/bin/bash

echo "🔍 COMPREHENSIVE AI INTEGRATION VERIFICATION"
echo "=============================================="

echo ""
echo "📄 1. Dashboard File Analysis:"
echo "   📁 Dashboard exists: $([ -f src/pages/Dashboard.jsx ] && echo '✅' || echo '❌')"
echo "   📏 Lines: $(wc -l < src/pages/Dashboard.jsx)"

echo ""
echo "🧩 2. AI Component Files:"
for component in AICoachingPanel AIEarningsPrediction AITransactionHelper; do
    if [ -f "src/components/${component}.jsx" ]; then
        echo "   ✅ ${component}.jsx exists ($(wc -l < src/components/${component}.jsx) lines)"
    else
        echo "   ❌ ${component}.jsx missing"
    fi
done

echo ""
echo "🔗 3. AI Service Files:"
for service in OpenAIService ElevenLabsService; do
    if [ -f "src/services/${service}.js" ]; then
        echo "   ✅ ${service}.js exists"
    else
        echo "   ❌ ${service}.js missing"
    fi
done

echo ""
echo "📦 4. AI Imports in Dashboard:"
for import in "AICoachingPanel" "AIEarningsPrediction" "AITransactionHelper" "OpenAIService" "ElevenLabsService"; do
    if grep -q "import.*${import}" src/pages/Dashboard.jsx; then
        echo "   ✅ ${import} imported"
    else
        echo "   ❌ ${import} not imported"
    fi
done

echo ""
echo "🎨 5. AI Menu and Components:"
if grep -q "'ai-assistant'" src/pages/Dashboard.jsx; then
    echo "   ✅ AI Assistant menu item present"
else
    echo "   ❌ AI Assistant menu item missing"
fi

if grep -q "case 'ai-assistant':" src/pages/Dashboard.jsx; then
    echo "   ✅ AI Assistant case in switch"
else
    echo "   ❌ AI Assistant case missing"
fi

if grep -q "function AISection" src/pages/Dashboard.jsx; then
    echo "   ✅ AISection component defined"
else
    echo "   ❌ AISection component missing"
fi

echo ""
echo "🔧 6. AI Component Usage:"
for component in "AICoachingPanel" "AIEarningsPrediction" "AITransactionHelper"; do
    count=$(grep -c "<${component}" src/pages/Dashboard.jsx || echo "0")
    if [ "$count" -gt 0 ]; then
        echo "   ✅ ${component} used ${count} times"
    else
        echo "   ❌ ${component} not used"
    fi
done

echo ""
echo "🎯 7. AI States and Functions:"
for state in "aiInsights" "isAiLoading" "showAIWelcome"; do
    if grep -q "${state}" src/pages/Dashboard.jsx; then
        echo "   ✅ ${state} state present"
    else
        echo "   ❌ ${state} state missing"
    fi
done

echo ""
echo "🎨 8. CSS Styling:"
if grep -q "ai-card" src/pages/Dashboard.css; then
    echo "   ✅ AI CSS styles present"
else
    echo "   ❌ AI CSS styles missing"
fi

echo ""
echo "📊 SUMMARY:"
echo "==========="
errors=0

# Count missing components
for component in AICoachingPanel AIEarningsPrediction AITransactionHelper; do
    [ ! -f "src/components/${component}.jsx" ] && errors=$((errors + 1))
done

# Count missing imports
for import in "AICoachingPanel" "AIEarningsPrediction" "AITransactionHelper"; do
    grep -q "import.*${import}" src/pages/Dashboard.jsx || errors=$((errors + 1))
done

if [ $errors -eq 0 ]; then
    echo "🎉 ALL AI COMPONENTS PROPERLY INTEGRATED!"
    echo "   The AI features should now be visible in the dashboard."
else
    echo "⚠️  Found $errors issues that need to be addressed."
fi

echo ""
echo "🌐 Next steps:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Navigate to the dashboard"
echo "   3. Click on 'AI Assistant' in the sidebar"
echo "   4. Check browser console for any errors"
echo ""
