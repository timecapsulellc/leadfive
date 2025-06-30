#!/bin/bash

# ElevenLabs Setup Script for LeadFive
echo "🤖 ElevenLabs Conversational AI Setup for LeadFive"
echo "================================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please make sure you're in the project root directory."
    exit 1
fi

echo "📋 Current ElevenLabs configuration:"
echo ""

# Show current config
if grep -q "VITE_ELEVENLABS_AGENT_ID" .env; then
    CURRENT_AGENT_ID=$(grep "VITE_ELEVENLABS_AGENT_ID" .env | cut -d'=' -f2)
    echo "Agent ID: $CURRENT_AGENT_ID"
else
    echo "❌ Agent ID not found in .env"
fi

if grep -q "VITE_ELEVENLABS_API_KEY" .env; then
    CURRENT_API_KEY=$(grep "VITE_ELEVENLABS_API_KEY" .env | cut -d'=' -f2)
    # Show only first few characters for security
    MASKED_KEY="${CURRENT_API_KEY:0:8}..."
    echo "API Key: $MASKED_KEY"
else
    echo "❌ API Key not found in .env"
fi

echo ""
echo "🔧 What would you like to do?"
echo "1. Update Agent ID"
echo "2. Update API Key"
echo "3. Test current configuration"
echo "4. Show setup instructions"
echo "5. Exit"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📝 To get your Agent ID:"
        echo "1. Go to https://elevenlabs.io/app/conversational-ai"
        echo "2. Create or select your agent"
        echo "3. Copy the Agent ID from the settings"
        echo ""
        read -p "Enter your Agent ID: " new_agent_id
        
        if [ ! -z "$new_agent_id" ]; then
            # Update agent ID in .env
            if grep -q "VITE_ELEVENLABS_AGENT_ID" .env; then
                sed -i '' "s/VITE_ELEVENLABS_AGENT_ID=.*/VITE_ELEVENLABS_AGENT_ID=$new_agent_id/" .env
            else
                echo "VITE_ELEVENLABS_AGENT_ID=$new_agent_id" >> .env
            fi
            echo "✅ Agent ID updated!"
        else
            echo "❌ No Agent ID provided"
        fi
        ;;
    2)
        echo ""
        echo "📝 To get your API Key:"
        echo "1. Go to https://elevenlabs.io/app/settings"
        echo "2. Navigate to API Keys section"
        echo "3. Copy your API key"
        echo ""
        read -p "Enter your API Key: " new_api_key
        
        if [ ! -z "$new_api_key" ]; then
            # Update API key in .env
            if grep -q "VITE_ELEVENLABS_API_KEY" .env; then
                sed -i '' "s/VITE_ELEVENLABS_API_KEY=.*/VITE_ELEVENLABS_API_KEY=$new_api_key/" .env
            else
                echo "VITE_ELEVENLABS_API_KEY=$new_api_key" >> .env
            fi
            echo "✅ API Key updated!"
        else
            echo "❌ No API Key provided"
        fi
        ;;
    3)
        echo ""
        echo "🧪 Testing configuration..."
        
        # Check if required variables are set
        if grep -q "VITE_ELEVENLABS_AGENT_ID=your-agent-id-here" .env; then
            echo "❌ Agent ID is still using placeholder value"
            echo "   Please run option 1 to update it"
        elif grep -q "VITE_ELEVENLABS_AGENT_ID=" .env; then
            echo "✅ Agent ID is configured"
        else
            echo "❌ Agent ID not found"
        fi
        
        if grep -q "VITE_ELEVENLABS_API_KEY=" .env; then
            echo "✅ API Key is configured"
        else
            echo "❌ API Key not found"
        fi
        
        echo ""
        echo "🚀 To test the AI integration:"
        echo "1. Start the dev server: npm run dev"
        echo "2. Connect your wallet"
        echo "3. Go to the Dashboard"
        echo "4. Look for the AI Assistant section"
        echo "5. Click 'Start AI Conversation'"
        ;;
    4)
        echo ""
        cat ELEVENLABS_SETUP_GUIDE.md
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🔄 Remember to restart your development server after making changes!"
echo "Run: npm run dev"
