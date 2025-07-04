import React, { useState, useEffect, useRef } from 'react';
import './UnifiedAIAssistant.css';

const UnifiedAIAssistant = ({ features, userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personality, setPersonality] = useState('advisor');
  const messagesEndRef = useRef(null);

  const personalities = {
    advisor: {
      name: 'Revenue Advisor',
      icon: '🧠',
      color: 'from-green-400 to-emerald-600',
      prompt: 'Strategic advice for maximizing earnings in LeadFive'
    },
    analyzer: {
      name: 'Network Analyzer',
      icon: '📊',
      color: 'from-blue-400 to-indigo-600',
      prompt: 'Data insights and network analytics for LeadFive users'
    },
    mentor: {
      name: 'Success Mentor',
      icon: '🎯',
      color: 'from-purple-400 to-pink-600',
      prompt: 'Motivational coaching and success strategies for LeadFive'
    },
    strategist: {
      name: 'Binary Strategist',
      icon: '♟️',
      color: 'from-yellow-400 to-orange-600',
      prompt: 'Binary matrix optimization and long-term planning for LeadFive'
    }
  };

  useEffect(() => {
    // Initialize with welcome message
    if (isOpen && messages.length === 0) {
      const welcomeMsg = {
        id: Date.now(),
        type: 'ai',
        personality,
        message: `Hello! I'm your ${personalities[personality].name}. How can I help you succeed with LeadFive today?`
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, personality]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (replace with actual OpenAI integration)
    setTimeout(() => {
      const responses = {
        advisor: [
          "Based on your current position, I recommend focusing on your weaker leg to maximize binary bonuses.",
          "Consider upgrading to the next package level to increase your earning potential.",
          "Your network shows good growth potential. Focus on quality referrals rather than quantity."
        ],
        analyzer: [
          "Your left leg has 60% of your volume. Try to balance it with more right-side placements.",
          "Your team growth rate is 15% above average for your rank level.",
          "I detect an opportunity for spillover in your network structure."
        ],
        mentor: [
          "Every successful leader started where you are now. Stay consistent and trust the process!",
          "Your dedication to building your LeadFive network will pay off. Keep pushing forward!",
          "Remember: success in network marketing is about helping others succeed first."
        ],
        strategist: [
          "For optimal binary growth, place your next 3 referrals on your weaker leg.",
          "Your long-term strategy should focus on developing leaders, not just adding numbers.",
          "Consider the compound effect: quality placements now mean exponential growth later."
        ]
      };

      const personalityResponses = responses[personality] || responses.advisor;
      const randomResponse = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        personality,
        message: randomResponse
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const switchPersonality = () => {
    const personalityKeys = Object.keys(personalities);
    const currentIndex = personalityKeys.indexOf(personality);
    const nextIndex = (currentIndex + 1) % personalityKeys.length;
    const nextPersonality = personalityKeys[nextIndex];
    
    setPersonality(nextPersonality);
    
    // Add transition message
    const transitionMsg = {
      id: Date.now(),
      type: 'ai',
      personality: nextPersonality,
      message: `Switched to ${personalities[nextPersonality].name}. ${personalities[nextPersonality].icon} How can I assist you?`
    };
    setMessages(prev => [...prev, transitionMsg]);
  };

  const quickPrompts = {
    advisor: ['Optimize my earnings', 'Package recommendations', 'Investment strategy'],
    analyzer: ['Analyze my network', 'Show growth trends', 'Team performance'],
    mentor: ['Motivate me', 'Success tips', 'Overcome challenges'],
    strategist: ['Binary planning', 'Placement strategy', 'Long-term goals']
  };

  return (
    <>
      {/* Floating ARIA Button */}
      <button 
        className="aria-float-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open ARIA AI Assistant"
      >
        <span className="aria-icon">🤖</span>
        <span className="aria-badge">ARIA</span>
      </button>

      {/* ARIA Chat Interface */}
      {isOpen && (
        <div className="aria-chat-container">
          <div className="aria-header">
            <div className="aria-title">
              <span className="aria-personality-icon">
                {personalities[personality].icon}
              </span>
              <h3>ARIA - {personalities[personality].name}</h3>
            </div>
            <div className="aria-controls">
              <button 
                onClick={switchPersonality}
                className="aria-switch-btn"
                title="Switch AI Personality"
              >
                🔄
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="aria-close-btn"
              >
                ✖
              </button>
            </div>
          </div>

          <div className="aria-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`aria-message ${msg.type}`}
              >
                {msg.type === 'ai' && (
                  <span className="message-icon">
                    {personalities[msg.personality]?.icon}
                  </span>
                )}
                <div className="message-content">{msg.message}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="aria-message ai typing">
                <span className="message-icon">
                  {personalities[personality].icon}
                </span>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="quick-prompts">
            {quickPrompts[personality]?.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="quick-prompt"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="aria-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask ARIA anything about LeadFive..."
              className="aria-input"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="aria-send-btn"
            >
              Send
            </button>
          </div>

          <div className="aria-features">
            <p>💡 Ask about: Placement strategies • Earnings optimization • Network growth • Success tips</p>
          </div>
        </div>
      )}
    </>
  );
};

export default UnifiedAIAssistant;