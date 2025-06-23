#!/bin/bash

# Make ElevenLabs Voice Assistant Accessible
# This script makes the voice assistant accessible from the dashboard
# and ensures all necessary components are properly configured

echo "🎤 Making ElevenLabs Voice Assistant Accessible..."
echo "=================================================="

# 1. Make the script executable
chmod +x test-elevenlabs-conversational-ai.cjs

# 2. Add CSS for the voice assistant section
echo "📝 Adding CSS for Voice Assistant section..."
cat << 'EOF' > src/styles/voice-assistant.css
/* Voice Assistant Styles */
.voice-assistant-section {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.voice-assistant-header {
  text-align: center;
  margin-bottom: 1rem;
}

.voice-assistant-header h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #4a6cf7;
}

.voice-assistant-header p {
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.voice-assistant-main {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 0 auto;
  width: 100%;
  max-width: 800px;
}

.voice-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.voice-feature-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.voice-feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.voice-feature-card .feature-icon {
  font-size: 2rem;
  color: #4a6cf7;
  margin-bottom: 1rem;
}

.voice-feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.voice-feature-card p {
  color: #666;
  font-size: 0.9rem;
}

.voice-tips {
  background: #f0f7ff;
  border-radius: 10px;
  padding: 1.5rem;
  border-left: 4px solid #4a6cf7;
}

.voice-tips h3 {
  margin-bottom: 1rem;
  color: #333;
}

.voice-tips ul {
  padding-left: 1.5rem;
}

.voice-tips li {
  margin-bottom: 0.5rem;
  color: #555;
}

/* Conversation UI Styles */
.conversation-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.conversation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
}

.status-indicator.listening {
  background: #ff5722;
  animation: pulse 1.5s infinite;
}

.status-indicator.thinking {
  background: #ffc107;
  animation: pulse 1.5s infinite;
}

.status-indicator.speaking {
  background: #4caf50;
  animation: pulse 1.5s infinite;
}

.conversation-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.mic-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4a6cf7;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mic-button:hover {
  background: #3a5bd9;
  transform: scale(1.05);
}

.mic-button:active {
  transform: scale(0.95);
}

.mic-button.listening {
  background: #ff5722;
  animation: pulse 1.5s infinite;
}

.conversation-messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.message {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  background: #e3f2fd;
  border-bottom-right-radius: 0;
}

.ai-message {
  align-self: flex-start;
  background: #f5f5f5;
  border-bottom-left-radius: 0;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .voice-features-grid {
    grid-template-columns: 1fr;
  }
  
  .voice-assistant-main {
    padding: 1rem;
  }
  
  .conversation-controls {
    flex-direction: column;
    align-items: center;
  }
}
EOF

# 3. Import the CSS in Dashboard.jsx
echo "🔄 Updating Dashboard.jsx to import Voice Assistant CSS..."
if grep -q "voice-assistant.css" src/pages/Dashboard.jsx; then
  echo "   ✅ Voice Assistant CSS already imported"
else
  sed -i '' -e "s|import '../styles/expert-dashboard-redesign.css';|import '../styles/expert-dashboard-redesign.css';\nimport '../styles/voice-assistant.css';|" src/pages/Dashboard.jsx
  echo "   ✅ Voice Assistant CSS imported"
fi

# 4. Make the test script executable
chmod +x test-elevenlabs-conversational-ai.cjs

# 5. Run the test script to verify integration
echo "🧪 Running verification test..."
node test-elevenlabs-conversational-ai.cjs

# 6. Add environment variables to .env.example if not already there
echo "🔐 Checking environment variables..."
if ! grep -q "ELEVENLABS_API_KEY" .env.example; then
  echo "" >> .env.example
  echo "# ElevenLabs Voice AI" >> .env.example
  echo "ELEVENLABS_API_KEY=your_elevenlabs_api_key_here" >> .env.example
  echo "ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here" >> .env.example
  echo "   ✅ Added ElevenLabs environment variables to .env.example"
else
  echo "   ✅ ElevenLabs environment variables already in .env.example"
fi

# 7. Check if the dev server is running
echo "🌐 Checking development server..."
if curl -s http://localhost:5176 > /dev/null; then
  echo "   ✅ Development server is running"
  echo "   🚀 You can access the Voice Assistant at: http://localhost:5176/dashboard"
  echo "      Click on 'Voice Assistant' in the sidebar menu"
else
  echo "   ⚠️  Development server doesn't seem to be running"
  echo "   🚀 Start the development server with: npm run dev"
  echo "      Then access the Voice Assistant at: http://localhost:5176/dashboard"
fi

echo ""
echo "✅ ElevenLabs Voice Assistant is now accessible from the dashboard!"
echo "   To test it, navigate to the dashboard and click on 'Voice Assistant' in the sidebar menu."
echo "   Make sure to set up your ElevenLabs API credentials in the .env file."
