import React, { useState, useEffect, useRef } from 'react';
import './AdvancedAIBusinessCoach.css';

const AdvancedAIBusinessCoach = ({ wallet, contract, userStats }) => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coachMode, setCoachMode] = useState('strategic');
  const [personalizedInsights, setPersonalizedInsights] = useState([]);
  const messagesEndRef = useRef(null);

  const coachModes = {
    strategic: {
      name: '🎯 Strategic Planning',
      description: 'Long-term business growth strategies',
      icon: '🎯'
    },
    motivation: {
      name: '💪 Motivation & Mindset',
      description: 'Personal development and motivation',
      icon: '💪'
    },
    technical: {
      name: '⚙️ Technical Guidance',
      description: 'Platform usage and optimization',
      icon: '⚙️'
    },
    market: {
      name: '📈 Market Analysis',
      description: 'Market trends and opportunities',
      icon: '📈'
    }
  };

  useEffect(() => {
    initializeCoach();
    generatePersonalizedInsights();
  }, [wallet?.account, userStats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeCoach = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `🤖 Welcome to your AI Business Coach! I'm here to help you maximize your LeadFive success.

Based on your current performance, I can provide:
• Personalized growth strategies
• Market opportunity analysis  
• Technical optimization tips
• Motivational guidance

What would you like to focus on today?`,
      timestamp: new Date(),
      mood: 'welcoming'
    };
    
    setMessages([welcomeMessage]);
  };

  const generatePersonalizedInsights = () => {
    if (!userStats) return;

    const insights = [
      {
        id: 1,
        type: 'opportunity',
        title: 'Matrix Position Optimization',
        description: 'You have 2 matrix positions ready for recycling. This could generate $300 in additional earnings.',
        action: 'Optimize Now',
        urgency: 'high'
      },
      {
        id: 2,
        type: 'growth',
        title: 'Referral Acceleration',
        description: 'Your referral rate is 15% below your potential. Focus on social media outreach.',
        action: 'Get Strategy',
        urgency: 'medium'
      },
      {
        id: 3,
        type: 'education',
        title: 'Market Trend Alert',
        description: 'Current market conditions favor digital business platforms. Perfect timing for expansion.',
        action: 'Learn More',
        urgency: 'low'
      }
    ];

    setPersonalizedInsights(insights);
  };

  const getAIResponse = async (userMessage, mode) => {
    // Simulate AI processing with contextual responses
    const responses = {
      strategic: [
        "🎯 Based on your current level, I recommend focusing on building your direct referral network. Here's a 30-day action plan:\n\n1. Contact 5 new prospects daily\n2. Leverage social proof from your earnings\n3. Focus on warm market first\n4. Use the level income momentum to your advantage",
        "🎯 Your growth trajectory shows strong potential. Consider these strategic moves:\n\n• Diversify your referral sources\n• Create educational content about LeadFive\n• Build a personal brand in digital business\n• Focus on relationship building over selling"
      ],
      motivation: [
        "💪 Remember, every successful leader started where you are now! Your current earnings show you're on the right track. \n\nKey mindset shifts:\n• Focus on serving others, not just earning\n• Celebrate small wins daily\n• Visualize your financial freedom\n• Stay consistent even when results aren't immediate",
        "💪 Success in digital business is 80% mindset, 20% strategy. You've got the strategy down with LeadFive's system.\n\nDaily practices:\n• Morning visualization (5 min)\n• Gratitude journaling\n• Skill development (15 min)\n• Connect with 3 new people"
      ],
      technical: [
        "⚙️ To maximize your LeadFive dashboard:\n\n1. Check your level income daily for new registrations\n2. Use the genealogy tree to identify active partners\n3. Monitor your earnings analytics for growth patterns\n4. Set up withdrawal schedules for consistent cash flow",
        "⚙️ Pro tips for platform optimization:\n\n• Enable notifications for level upgrades\n• Use the referral tracker to identify top performers\n• Leverage the team overview for mentoring opportunities\n• Export earnings data for tax planning"
      ],
      market: [
        "📈 Current market analysis shows:\n\n• Digital business industry growing 6.2% annually\n• Blockchain platforms seeing 40% increase in adoption\n• Cryptocurrency integration driving new demographics\n• LeadFive positioned well in the automated level income space",
        "📈 Market opportunities for you:\n\n• Crypto-curious demographics (25-40 age group)\n• Remote workers seeking passive income\n• Traditional business users looking for transparency\n• Tech-savvy entrepreneurs wanting automation"
      ]
    };

    return responses[mode]?.[Math.floor(Math.random() * responses[mode].length)] || 
           "I'm processing your request. Let me analyze your specific situation and provide personalized guidance.";
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(async () => {
      const aiResponse = await getAIResponse(currentInput, coachMode);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        mode: coachMode,
        mood: 'helpful'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsightAction = (insight) => {
    const insightMessage = {
      id: Date.now(),
      type: 'user',
      content: `Tell me more about: ${insight.title}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, insightMessage]);
    setCurrentInput('');
    setIsLoading(true);

    setTimeout(() => {
      const responses = {
        'Level Position Optimization': "🌳 Level income optimization strategy:\n\n1. Your current positions are at levels 3 and 4\n2. Building now will trigger higher level earnings\n3. This creates compound earnings through the level system\n4. Best time to expand is during high-activity periods\n\nWould you like me to guide you through the optimization process?",
        'Referral Acceleration': "🚀 Referral acceleration plan:\n\n1. Audit your current outreach methods\n2. Create a compelling personal story\n3. Use the 3-foot rule consistently\n4. Leverage LeadFive's success stories\n5. Follow up systematically\n\nI can help you create scripts and track your progress.",
        'Market Trend Alert': "📊 Market trends working in your favor:\n\n• Increased interest in passive income (↑ 45%)\n• Crypto adoption mainstream (↑ 67%)\n• Digital business legitimacy growing\n• Automated systems preferred by new generation\n\nThis is an optimal time to scale your efforts."
      };

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: responses[insight.title] || "Let me provide detailed guidance on this opportunity.",
        timestamp: new Date(),
        mode: 'strategic',
        mood: 'analytical'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const quickActions = [
    { text: "📊 Analyze my performance", category: "strategic" },
    { text: "💡 Give me growth ideas", category: "strategic" },
    { text: "🎯 Create action plan", category: "strategic" },
    { text: "💪 I need motivation", category: "motivation" },
    { text: "⚙️ Optimize my dashboard", category: "technical" },
    { text: "📈 Market opportunities", category: "market" }
  ];

  return (
    <div className="ai-business-coach card">
      <div className="coach-header">
        <h2>🤖 Advanced AI Business Coach</h2>
        <div className="coach-modes">
          {Object.entries(coachModes).map(([key, mode]) => (
            <button
              key={key}
              className={`mode-button ${coachMode === key ? 'active' : ''}`}
              onClick={() => setCoachMode(key)}
              title={mode.description}
            >
              <span className="mode-icon">{mode.icon}</span>
              <span className="mode-name">{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="coach-content">
        {personalizedInsights.length > 0 && (
          <div className="insights-panel">
            <h3>🎯 Personalized Insights</h3>
            <div className="insights-grid">
              {personalizedInsights.map(insight => (
                <div key={insight.id} className={`insight-card ${insight.urgency}`}>
                  <div className="insight-header">
                    <h4>{insight.title}</h4>
                    <span className={`urgency-badge ${insight.urgency}`}>
                      {insight.urgency === 'high' ? '🔥' : insight.urgency === 'medium' ? '⚡' : '💡'}
                    </span>
                  </div>
                  <p>{insight.description}</p>
                  <button 
                    className="insight-action"
                    onClick={() => handleInsightAction(insight)}
                  >
                    {insight.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="chat-container">
          <div className="messages-area">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-content">
                  <div className="message-text">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <div className="message-meta">
                    <span className="timestamp">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.mode && (
                      <span className="message-mode">{coachModes[message.mode]?.icon} {coachModes[message.mode]?.name}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message ai">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="message-meta">
                    <span className="timestamp">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-actions">
            <div className="quick-actions-label">Quick Actions:</div>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action"
                  onClick={() => setCurrentInput(action.text)}
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          <div className="input-area">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask your AI coach anything about ${coachModes[coachMode]?.description.toLowerCase()}...`}
              className="message-input"
              rows="3"
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              className="send-button"
              disabled={!currentInput.trim() || isLoading}
            >
              {isLoading ? '🤔' : '🚀'} Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAIBusinessCoach;
