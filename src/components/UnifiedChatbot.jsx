/**
 * AIRA CHATBOT COMPONENT
 * Advanced AI chat interface for LeadFive platform
 */

import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaMicrophone, FaTimes, FaMinimize, FaExpand } from 'react-icons/fa';
import './UnifiedChatbot.css';

const UnifiedChatbot = ({ userStats, account, userInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m AIRA, your LeadFive AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage) => {
    // Simulate AI thinking
    setIsTyping(true);
    
    // Mock AI responses based on keywords
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('earnings') || lowerMessage.includes('income')) {
      response = `Based on your current network of ${userInfo?.directCount || 0} direct referrals and ${userInfo?.teamSize || 0} total team members, your earning potential is strong! Focus on helping your team members activate their accounts to increase your passive income.`;
    } else if (lowerMessage.includes('network') || lowerMessage.includes('referral')) {
      response = `Your network is growing well! To expand further, consider: 1) Sharing your referral link on social media, 2) Helping existing referrals understand the platform, 3) Following up with inactive members. Would you like specific strategies for any of these?`;
    } else if (lowerMessage.includes('withdraw') || lowerMessage.includes('payment')) {
      response = `For withdrawals, ensure you have: 1) A minimum balance of 0.1 BNB, 2) An active account status, 3) Valid wallet connection. Current balance: ${userStats?.earnings || '0'} BNB. Need help with the withdrawal process?`;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      response = 'I can help you with earnings optimization, network building strategies, withdrawal processes, and platform navigation. What specific area would you like assistance with?';
    } else {
      response = 'Thank you for your question! I\'m here to help with platform guidance, earning strategies, and network growth. Could you be more specific about what you\'d like to know?';
    }
    
    setIsTyping(false);
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Generate AI response
    const aiResponse = await generateAIResponse(inputMessage);
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="aira-chatbot">
      {/* Chat Button */}
      <button 
        className="aira-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with AIRA"
      >
        <FaRobot />
        <span className="aira-badge">AIRA</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`aira-chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="aira-chat-header">
            <div className="aira-header-info">
              <FaRobot className="aira-icon" />
              <div>
                <h3>AIRA Assistant</h3>
                <span className="aira-status">Online • AI-Powered</span>
              </div>
            </div>
            <div className="aira-header-controls">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <FaExpand /> : <FaMinimize />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="aira-messages">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`aira-message ${message.type}`}
                  >
                    {message.type === 'ai' && <FaRobot className="aira-message-icon" />}
                    <div className="aira-message-content">
                      <p>{message.content}</p>
                      <span className="aira-timestamp">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="aira-message ai">
                    <FaRobot className="aira-message-icon" />
                    <div className="aira-message-content">
                      <div className="aira-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="aira-input-area">
                <div className="aira-input-container">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask AIRA about earnings, network building, or platform features..."
                    rows="1"
                    className="aira-input"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="aira-send-button"
                    title="Send message"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
                <div className="aira-quick-actions">
                  <button onClick={() => setInputMessage('How can I increase my earnings?')}>
                    💰 Earnings Help
                  </button>
                  <button onClick={() => setInputMessage('How do I build my network?')}>
                    🌐 Network Tips
                  </button>
                  <button onClick={() => setInputMessage('How do withdrawals work?')}>
                    💳 Withdrawal Guide
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedChatbot;
