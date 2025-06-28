import React, { useState } from 'react';
import OpenAIService from '../services/OpenAIService';
import { FaRobot, FaQuestionCircle, FaPaperPlane } from 'react-icons/fa';
import './AITransactionHelper.css';

const AITransactionHelper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your LeadFive AI assistant. I can help you understand transactions, optimize your earnings, and answer any questions about the platform. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "How do I withdraw my earnings?",
    "What are the different package levels?",
    "How does the referral system work?",
    "How can I increase my team growth?"
  ];

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const prompt = `You are a helpful AI assistant for LeadFive, a blockchain-based network marketing platform. 
      
      User question: "${message}"
      
      Provide a helpful, accurate response about:
      - LeadFive platform features
      - Network marketing strategies
      - Blockchain/crypto transactions
      - Earnings optimization
      - Team building tips
      
      Keep responses concise (under 150 words) and actionable. Use a friendly, professional tone.`;

      const response = await OpenAIService.generateResponse(prompt);
      
      const aiMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speech synthesis temporarily disabled - using AI chat instead
      console.log('AI response available for text-to-speech:', response);

    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try asking your question again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const speakMessage = async (content) => {
    try {
      // Speech synthesis temporarily disabled - using AI chat instead
      console.log('Speech text:', content);
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <>
      {/* AI Assistant Toggle Button */}
      <button 
        className="ai-assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        <FaRobot />
        <span>AI Assistant</span>
        {!isOpen && messages.length > 1 && (
          <div className="notification-badge">{messages.length - 1}</div>
        )}
      </button>

      {/* AI Chat Panel */}
      {isOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="header-info">
              <FaRobot />
              <div>
                <h3>AI Assistant</h3>
                <span className="status">Online & Ready</span>
              </div>
            </div>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="quick-questions">
            <p>Quick questions:</p>
            <div className="quick-question-buttons">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isLoading}
                >
                  <FaQuestionCircle />
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  <p>{message.content}</p>
                  <div className="message-footer">
                    <span className="timestamp">{formatTime(message.timestamp)}</span>
                    {message.role === 'assistant' && (
                      <button 
                        className="speak-btn"
                        onClick={() => speakMessage(message.content)}
                        title="Hear this message"
                      >
                        <FaVolumeUp />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant loading">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about LeadFive..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="send-btn"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AITransactionHelper;
