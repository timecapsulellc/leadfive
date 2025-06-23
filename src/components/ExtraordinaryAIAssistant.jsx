/**
 * Extraordinary AI Assistant - PhD Level UX/UI Design
 * Revolutionary chat interface with perfect positioning and premium aesthetics
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaRobot, 
  FaTimes, 
  FaMicrophone, 
  FaComments, 
  FaLightbulb,
  FaChartLine,
  FaDollarSign,
  FaUsers,
  FaQuestionCircle,
  FaPaperPlane,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { elevenLabsService } from '../services/ElevenLabsOnlyService';

const ExtraordinaryAIAssistant = ({ userStats, account }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTab, setCurrentTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: `Hello! I'm your LeadFive AI Assistant. I can help you with earnings optimization, team building strategies, and answer any questions about your dashboard. How can I assist you today?`,
          timestamp: new Date(),
          avatar: '🤖'
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      avatar: '👤'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, userStats);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        avatar: '🤖'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Read AI response with ElevenLabs
      if (elevenLabsService) {
        elevenLabsService.readText(aiResponse);
      }
    }, 1500);
  };

  const generateAIResponse = (message, stats) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('earning') || lowerMessage.includes('income')) {
      return `Based on your current earnings of $${stats?.totalEarnings || '0'}, I recommend focusing on team expansion. With your team of ${stats?.teamSize || '0'} members, you could potentially increase earnings by 25-40% by adding 5-10 more active referrals this month.`;
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('referral')) {
      return `Your team of ${stats?.teamSize || '0'} members is performing well! To optimize growth, focus on supporting your direct referrals. Active team members typically generate 3x more than inactive ones. Consider hosting weekly team calls or sharing success strategies.`;
    }
    
    if (lowerMessage.includes('strategy') || lowerMessage.includes('help')) {
      return `Here's a personalized strategy for you: 1) Focus on quality referrals over quantity, 2) Engage with your team weekly, 3) Share your success story to inspire others, 4) Reinvest 20% of earnings for faster growth. Your current level ${stats?.currentLevel || '1'} shows great potential!`;
    }
    
    if (lowerMessage.includes('withdraw') || lowerMessage.includes('payout')) {
      return `For withdrawals, ensure you meet the minimum threshold. Based on your earnings pattern, I recommend withdrawing 70% and reinvesting 30% for compound growth. This strategy typically yields 40% better long-term results.`;
    }
    
    return `I understand you're asking about "${message}". As your AI assistant, I'm here to help optimize your LeadFive experience. Would you like specific advice about earnings, team building, or platform features? I can provide personalized recommendations based on your current performance.`;
  };

  const quickActions = [
    {
      icon: FaChartLine,
      label: 'Earnings Analysis',
      action: () => handleQuickAction('earnings')
    },
    {
      icon: FaUsers,
      label: 'Team Strategy',
      action: () => handleQuickAction('team')
    },
    {
      icon: FaDollarSign,
      label: 'Withdrawal Guide',
      action: () => handleQuickAction('withdrawal')
    },
    {
      icon: FaLightbulb,
      label: 'Growth Tips',
      action: () => handleQuickAction('growth')
    }
  ];

  const handleQuickAction = (type) => {
    const actions = {
      earnings: `Analyze my current earnings of $${userStats?.totalEarnings || '0'} and suggest improvements`,
      team: `Help me optimize my team of ${userStats?.teamSize || '0'} members`,
      withdrawal: 'What\'s the best withdrawal strategy for my current level?',
      growth: 'Give me personalized growth tips for LeadFive success'
    };
    
    setInputMessage(actions[type]);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* AI Assistant Toggle Button */}
      <div className="ai-assistant-container">
        <button
          className="ai-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="AI Assistant"
        >
          <FaRobot />
        </button>

        {/* AI Chat Panel */}
        <div className={`ai-chat-panel ${isOpen ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}>
          {/* Chat Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <FaRobot />
              <span>AI Assistant</span>
              <div className="ai-status-indicator"></div>
            </div>
            <div className="ai-header-actions">
              <button
                className="ai-expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <FaCompress /> : <FaExpand />}
              </button>
              <button
                className="ai-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Chat Tabs */}
          <div className="ai-chat-tabs">
            <button
              className={`ai-tab ${currentTab === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentTab('chat')}
            >
              <FaComments />
              Chat
            </button>
            <button
              className={`ai-tab ${currentTab === 'quick' ? 'active' : ''}`}
              onClick={() => setCurrentTab('quick')}
            >
              <FaLightbulb />
              Quick Help
            </button>
          </div>

          {/* Chat Content */}
          <div className="ai-chat-content">
            {currentTab === 'chat' ? (
              <>
                {/* Messages */}
                <div className="ai-messages">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`ai-message ${message.type}`}
                    >
                      <div className="ai-message-avatar">
                        {message.avatar}
                      </div>
                      <div className="ai-message-content">
                        <div className="ai-message-text">
                          {message.content}
                        </div>
                        <div className="ai-message-time">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="ai-message ai">
                      <div className="ai-message-avatar">🤖</div>
                      <div className="ai-message-content">
                        <div className="ai-typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="ai-message-input">
                  <div className="ai-input-container">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about LeadFive..."
                      rows="1"
                      className="ai-input"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="ai-send-btn"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Quick Actions Tab */
              <div className="ai-quick-actions-tab">
                <div className="ai-quick-intro">
                  <h3>Quick Assistance</h3>
                  <p>Get instant help with common questions and tasks</p>
                </div>
                
                <div className="ai-quick-grid">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="ai-quick-action-btn"
                      onClick={action.action}
                    >
                      <action.icon />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>

                <div className="ai-user-stats">
                  <h4>Your Current Stats</h4>
                  <div className="ai-stats-grid">
                    <div className="ai-stat">
                      <FaDollarSign />
                      <span>Earnings: ${userStats?.totalEarnings || '0'}</span>
                    </div>
                    <div className="ai-stat">
                      <FaUsers />
                      <span>Team: {userStats?.teamSize || '0'} members</span>
                    </div>
                    <div className="ai-stat">
                      <FaChartLine />
                      <span>Level: {userStats?.currentLevel || '1'}</span>
                    </div>
                  </div>
                </div>

                <div className="ai-tips">
                  <h4>💡 Today's Tip</h4>
                  <p>Focus on quality over quantity when building your team. One active referral is worth more than five inactive ones!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Styles */}
      <style>{`
        .ai-assistant-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 20px;
        }

        .ai-toggle-btn {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 1.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 12px 40px rgba(102, 126, 234, 0.4),
            0 0 0 3px rgba(255, 255, 255, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .ai-toggle-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: rotate 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .ai-toggle-btn:hover::before {
          opacity: 1;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .ai-toggle-btn:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 
            0 16px 50px rgba(102, 126, 234, 0.6),
            0 0 0 4px rgba(255, 255, 255, 0.2);
        }

        .ai-chat-panel {
          width: 420px;
          height: 600px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(102, 126, 234, 0.2);
          transform: translateY(20px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .ai-chat-panel.active {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .ai-chat-panel.expanded {
          width: 500px;
          height: 700px;
        }

        .ai-chat-header {
          padding: 24px 28px 20px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .ai-chat-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .ai-status-indicator {
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .ai-header-actions {
          display: flex;
          gap: 8px;
        }

        .ai-expand-btn,
        .ai-close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .ai-expand-btn:hover,
        .ai-close-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .ai-chat-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .ai-tab {
          flex: 1;
          padding: 16px 20px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ai-tab.active {
          color: white;
          background: rgba(102, 126, 234, 0.2);
          border-bottom: 2px solid #667eea;
        }

        .ai-tab:hover:not(.active) {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .ai-chat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .ai-messages {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
        }

        .ai-messages::-webkit-scrollbar {
          width: 6px;
        }

        .ai-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .ai-messages::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.3);
          border-radius: 3px;
        }

        .ai-message {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .ai-message.user {
          flex-direction: row-reverse;
        }

        .ai-message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .ai-message.user .ai-message-avatar {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        }

        .ai-message-content {
          max-width: 70%;
        }

        .ai-message.user .ai-message-content {
          text-align: right;
        }

        .ai-message-text {
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          border-radius: 16px;
          color: white;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        .ai-message.user .ai-message-text {
          background: rgba(102, 126, 234, 0.3);
          border-bottom-right-radius: 4px;
        }

        .ai-message.ai .ai-message-text {
          border-bottom-left-radius: 4px;
        }

        .ai-message-time {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 4px;
        }

        .ai-typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          border-bottom-left-radius: 4px;
        }

        .ai-typing-indicator span {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .ai-typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .ai-typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .ai-message-input {
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .ai-input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .ai-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 0.9rem;
          resize: none;
          max-height: 100px;
          min-height: 44px;
          transition: all 0.3s ease;
        }

        .ai-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
        }

        .ai-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .ai-send-btn {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .ai-send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .ai-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ai-quick-actions-tab {
          padding: 24px;
          height: 100%;
          overflow-y: auto;
        }

        .ai-quick-intro {
          text-align: center;
          margin-bottom: 24px;
        }

        .ai-quick-intro h3 {
          color: white;
          font-size: 1.2rem;
          margin: 0 0 8px;
        }

        .ai-quick-intro p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin: 0;
        }

        .ai-quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .ai-quick-action-btn {
          padding: 16px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .ai-quick-action-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }

        .ai-quick-action-btn svg {
          font-size: 1.5rem;
        }

        .ai-quick-action-btn span {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .ai-user-stats {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .ai-user-stats h4 {
          color: white;
          font-size: 1rem;
          margin: 0 0 12px;
        }

        .ai-stats-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ai-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
        }

        .ai-stat svg {
          color: #667eea;
        }

        .ai-tips {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .ai-tips h4 {
          color: white;
          font-size: 1rem;
          margin: 0 0 8px;
        }

        .ai-tips p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
          line-height: 1.4;
          margin: 0;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .ai-assistant-container {
            bottom: 20px;
            right: 20px;
          }

          .ai-chat-panel {
            width: calc(100vw - 40px);
            max-width: 380px;
            height: 500px;
          }

          .ai-chat-panel.expanded {
            width: calc(100vw - 40px);
            max-width: 400px;
            height: 600px;
          }

          .ai-toggle-btn {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }

          .ai-quick-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default ExtraordinaryAIAssistant;
