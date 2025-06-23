import React, { useState, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { FaMicrophone, FaMicrophoneSlash, FaRobot, FaPhone } from 'react-icons/fa';

// Request audio permission for AI interaction
async function requestAudioPermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error("Microphone permission denied:", error);
    return false;
  }
}

const LeadFiveConversationalAI = ({ userStats, account, className = '' }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  const conversation = useConversation({
    overrides: {
      tts: {
        voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || '9PVP7ENhDskL0KYHAKtD',
      },
      agent: {
        language: "en",
        firstMessage: "Hello, how can I help you with LeadFive today?",
        prompt: {
          prompt: `You are the LeadFive AI Assistant, a helpful and intelligent guide with a deep understanding of blockchain technology and business strategy.

Your approach is professional, clear, and direct. You are here to answer questions and provide information when requested.

You are an expert on the LeadFive platform.

# CRITICAL INSTRUCTIONS
- You MUST NOT read any text content from the webpage or dashboard
- You MUST NOT describe what you see on the page
- You MUST ONLY respond to direct user voice input
- You MUST NOT narrate or read UI elements, buttons, or any visual content

# Environment
You have expert-level familiarity with the entire LeadFive platform, including:
- The compensation plan and earning levels.
- How the team genealogy and network structure works.
- All features within the user dashboard.
- Wallet integration and transaction processes on the BSC network.

# Goal
Your first and most important action is to greet the user by saying: "Hello, how can I help you with LeadFive today?"

After you have delivered this greeting, your goal is to accurately answer the user's questions. You must remain silent and wait for the user to speak to you first.

# Guardrails
- After your initial greeting, wait for the user to speak. Do not "check in" or ask if they are still there. Only respond to direct questions or commands.
- Keep responses strictly focused on the LeadFive platform and its features.
- Crucially, do not provide financial advice or speculate on the future value of earnings or cryptocurrencies.
- Do not mention you're an AI unless explicitly asked.
- NEVER read or describe dashboard content, UI elements, or page text
- If a user asks about a technical bug or an issue requiring administrative help, politely clarify: "I can help with questions about how the platform works, but for account-specific issues like that, it's best to contact our official support team through the 'Help' section on the website. This is to ensure your privacy and security."`
        }
      }
    },
    onConnect: () => {
      console.log('🤖 LeadFive AI connected');
      setError(null);
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Connected to AI assistant',
        timestamp: new Date()
      }]);
    },
    onDisconnect: () => {
      console.log('🤖 LeadFive AI disconnected');
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Disconnected from AI assistant',
        timestamp: new Date()
      }]);
    },
    onError: (error) => {
      console.error('🤖 LeadFive AI error:', error);
      setError(error.message || 'An error occurred during the conversation');
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.message || 'Unknown error'}`,
        timestamp: new Date()
      }]);
    },
    onMessage: (message) => {
      console.log('🤖 LeadFive AI message received:', message);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: message.message || 'AI response received',
        timestamp: new Date()
      }]);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      
      // Check audio permission
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        setError('Microphone permission is required for AI conversation');
        return;
      }
      
      setIsPermissionGranted(true);
      
      // Check if we have the required ElevenLabs configuration
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!agentId || agentId === 'your-agent-id-here' || agentId === 'test-agent-id-placeholder' || agentId.includes('placeholder')) {
        setError('ElevenLabs Agent ID not configured. Please follow the setup guide in ELEVENLABS_SETUP_GUIDE.md to create an agent and add the ID to your .env file.');
        console.error('VITE_ELEVENLABS_AGENT_ID is not set or using placeholder value');
        return;
      }
      
      if (!apiKey || apiKey.includes('your-api-key')) {
        setError('ElevenLabs API key not configured properly. Please check your .env file.');
        console.error('VITE_ELEVENLABS_API_KEY is not properly configured');
        return;
      }
      
      // Start AI conversation with agent ID
      const conversationId = await conversation.startSession({ 
        agentId: agentId
      });
      
      console.log('🤖 AI conversation started with ID:', conversationId);
      
      setMessages(prev => [...prev, {
        type: 'user',
        content: 'Started AI conversation',
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError(`Failed to start conversation: ${error.message || 'Unknown error'}`);
    }
  }, [conversation, account, userStats]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setMessages(prev => [...prev, {
        type: 'user',
        content: 'Ended AI conversation',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      setError(`Failed to stop conversation: ${error.message}`);
    }
  }, [conversation]);

  const getStatusText = () => {
    if (conversation.status === "connected") {
      return conversation.isSpeaking ? "AI is speaking..." : "AI is listening...";
    }
    return "Disconnected";
  };

  const getStatusColor = () => {
    if (conversation.status === "connected") {
      return conversation.isSpeaking ? "#00D4FF" : "#BA55D3";
    }
    return "#666";
  };

  return (
    <div className={`leadfive-ai-assistant ${className}`}>
      <style>{`
        .leadfive-ai-assistant {
          background: rgba(26, 26, 46, 0.9);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 15px;
          padding: 2rem;
          color: white;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          width: 100%;
        }

        .ai-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #00D4FF;
        }

        .ai-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: currentColor;
        }

        .ai-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .voice-chat-wrapper {
          display: flex;
          align-items: center;
          background-color: #fff;
          border-radius: 50px;
          padding: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .voice-chat-icon-animated {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00D4FF, #BA55D3);
          margin-right: 8px;
        }

        .voice-chat-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 10px 24px;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #000;
          color: #fff;
          letter-spacing: 1px;
        }

        .voice-chat-button:hover {
          opacity: 0.85;
        }
        
        .voice-chat-button.active {
          background-color: #ff4757;
        }

        .language-selector-mock {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 16px;
          font-size: 1.5rem;
          color: #000;
        }
        
        .language-selector-mock svg {
            width: 16px;
            height: 16px;
            stroke: #333;
            stroke-width: 2;
        }

        .error-message {
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: #ff6b7a;
          font-size: 0.875rem;
          width: 100%;
        }

        .messages-container {
          max-height: 300px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          width: 100%;
        }

        .message {
          margin-bottom: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .message.system {
          background: rgba(0, 212, 255, 0.1);
          border-left: 3px solid #00D4FF;
          color: #00D4FF;
        }

        .message.user {
          background: rgba(186, 85, 211, 0.1);
          border-left: 3px solid #BA55D3;
          color: #BA55D3;
        }

        .message.ai {
          background: rgba(255, 255, 255, 0.05);
          border-left: 3px solid #fff;
          color: #fff;
        }

        .message.error {
          background: rgba(255, 71, 87, 0.1);
          border-left: 3px solid #ff4757;
          color: #ff6b7a;
        }

        .message-timestamp {
          font-size: 0.75rem;
          opacity: 0.6;
          margin-top: 0.25rem;
        }

        .user-context {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          width: 100%;
        }

        .user-context h4 {
          color: #00D4FF;
          margin-bottom: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .user-context p {
          margin: 0.25rem 0;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .messages-container::-webkit-scrollbar {
          width: 4px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.5);
          border-radius: 2px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.7);
        }

        .powered-by-text {
          text-align: center;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 1.5rem;
        }
      `}</style>

      <div className="ai-header">
        <div className="ai-title">
          <FaRobot />
          LeadFive AI Assistant
        </div>
        <div className="ai-status" style={{ color: getStatusColor() }}>
          <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
          {getStatusText()}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="ai-controls">
        <div className="voice-chat-wrapper">
          <div className="voice-chat-icon-animated"></div>
          
          {conversation.status !== "connected" ? (
            <button 
              className="voice-chat-button" 
              onClick={startConversation}
              disabled={conversation.status === "connecting"}
            >
              <FaPhone />
              VOICE CHAT
            </button>
          ) : (
            <button 
              className="voice-chat-button active" 
              onClick={stopConversation}
            >
              <FaMicrophoneSlash />
              END CHAT
            </button>
          )}

          <div className="language-selector-mock">
            🇺🇸
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div>{message.content}</div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {account && userStats && (
        <div className="user-context">
          <h4>Your LeadFive Context</h4>
          <p>💰 Total Earnings: ${userStats.totalEarnings || 0}</p>
          <p>👥 Team Size: {userStats.teamSize || 0}</p>
          <p>📈 Current Level: {userStats.currentLevel || 1}</p>
          <p>🔗 Account: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}</p>
        </div>
      )}
      <p className="powered-by-text">Powered by ElevenLabs Conversational AI</p>
    </div>
  );
};

export default LeadFiveConversationalAI;
