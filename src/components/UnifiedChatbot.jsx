/**
 * AIRA - Advanced Revenue Intelligence Assistant
 * PhD-Level Enhanced AI system with comprehensive business knowledge
 * Motivational training & complete LeadFive expertise
 */

<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaMicrophone, FaTimes, FaMinus, FaExpand } from 'react-icons/fa';
import './UnifiedChatbot.css';
=======
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import '../styles/UnifiedChatbot.css';
import useMemoryMonitor from '../hooks/useMemoryMonitor';
import EnhancedKnowledgeBase from '../services/EnhancedKnowledgeBase';
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)

// FIXED IMPORTS - NO MORE FaMinimize ANYWHERE
import { 
  FaRobot, 
  FaPaperPlane, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaTimes, 
  FaMinus,
  FaExpand,
  FaBrain,
  FaChartBar,
  FaBullseye,
  FaChess,
  FaSync,
  FaMicrophone
} from 'react-icons/fa';

const UnifiedChatbot = React.memo(({ userStats, account, userInfo, mode = 'floating', position = 'bottom-right' }) => {
  console.log('[AIRA DEBUG] Enhanced chatbot with PhD-level knowledge initialized');
  
  // Initialize enhanced knowledge base
  const knowledgeBase = useMemo(() => new EnhancedKnowledgeBase(), []);
  const { getMemoryStats } = useMemoryMonitor('UnifiedChatbot');
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState('advisor');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationContext, setConversationContext] = useState({});
  const messagesEndRef = useRef(null);

  // Enhanced AI Personalities with Motivational Training
  const personalities = {
    advisor: {
      name: 'Revenue Advisor',
      icon: FaBrain,
      color: '#00D4FF',
      description: 'PhD-level strategic wealth building guidance',
      greeting: '🌟 Welcome to your financial transformation! I\'m your Revenue Advisor with 20+ years experience helping people build generational wealth. Ready to unlock your earning potential with our proven 4X system?',
      focus: 'earnings, strategy, optimization, revenue, wealth building',
      specialty: 'financial_strategy'
    },
    analyzer: {
      name: 'Network Analyzer', 
      icon: FaChartBar,
      color: '#1e3a8a',
      description: 'Advanced analytics & performance insights',
      greeting: '📊 Data reveals everything! I\'m your Network Analyzer, powered by Harvard-level analytical frameworks. Let me show you the hidden patterns in your network that lead to exponential growth!',
      focus: 'analytics, data, network, performance, optimization',
      specialty: 'network_analysis'
    },
    mentor: {
      name: 'Success Mentor',
      icon: FaBullseye,
      color: '#7c3aed',
      description: 'Motivational coaching & mindset transformation',
      greeting: '🚀 Every millionaire started with a single decision! I\'m your Success Mentor, trained by top performance coaches. Together, we\'ll transform your mindset and accelerate your journey to financial freedom!',
      focus: 'motivation, coaching, success, goals, mindset',
      specialty: 'motivation_coaching'
    },
    strategist: {
      name: 'Binary Strategist',
      icon: FaChess,
      color: '#059669',
      description: 'Long-term wealth architecture planning',
      greeting: '💎 Strategic thinking creates generational wealth! I\'m your Binary Strategist, combining German precision with IIT-level optimization. Let\'s architect your path to financial independence!',
      focus: 'binary, placement, strategy, long-term, architecture',
      specialty: 'strategic_planning'
    }
  };

  useEffect(() => {
    console.log('[ARIA DEBUG] UnifiedChatbot component mounted successfully');
    console.log('[ARIA DEBUG] Props received:', { userStats, account, userInfo, mode, position });
    if (messages.length === 0) {
      initializeChat();
    }
  }, [currentPersonality]);

  useEffect(() => {
    console.log('[ARIA DEBUG] Component fully initialized, current state:', { 
      isOpen, 
      currentPersonality, 
      messagesCount: messages.length 
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    const personality = personalities[currentPersonality];
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: personality.greeting,
        personality: currentPersonality,
        timestamp: new Date(),
        features: [
          '📊 Smart Analytics',
          '💰 Revenue Optimization', 
          '🌳 Network Strategies',
          '🎯 Goal Setting'
        ]
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enhanced response processing based on personality
  const enhanceResponseByPersonality = (baseResponse, personalityType, userMessage) => {
    const personality = personalities[personalityType];
    let actionItems = [];
    let predictions = null;
    
    // Add personality-specific enhancements
    switch (personalityType) {
      case 'advisor':
        actionItems = [
          'Review current earnings strategy',
          'Optimize withdrawal ratios',
          'Plan next package upgrade'
        ];
        predictions = {
          earningsIncrease: `${Math.floor(Math.random() * 30 + 20)}%`,
          timeframe: '30-60 days'
        };
        break;
        
      case 'analyzer':
        actionItems = [
          'Analyze network performance',
          'Identify growth opportunities', 
          'Monitor team metrics'
        ];
        predictions = {
          networkGrowth: `+${Math.floor(Math.random() * 50 + 25)} members`,
          timeframe: '30 days'
        };
        break;
        
      case 'mentor':
        actionItems = [
          'Set daily success goals',
          'Practice positive visualization',
          'Connect with team members'
        ];
        break;
        
      case 'strategist':
        actionItems = [
          'Plan binary tree expansion',
          'Optimize member placement',
          'Strategize long-term growth'
        ];
        predictions = {
          binaryBalance: 'Improved 15-25%',
          cycles: '+3-5 weekly cycles'
        };
        break;
    }
    
    // Add user context to response
    const enhancedContent = baseResponse + `\n\n💼 **Personalized for your ${userInfo?.packageLevel ? `Level ${userInfo.packageLevel}` : 'Bronze'} tier with ${userInfo?.teamSize || 0} team members**`;
    
    return {
      content: enhancedContent,
      actionItems,
      predictions
    };
  };

  // Fallback response system
  const generateFallbackResponse = (personalityType, userMessage) => {
    const personality = personalities[personalityType];
    
    return `🤖 I'm your ${personality.name}! 

I'm here to help you with ${personality.focus}. While I process your question about "${userMessage}", here are some ways I can assist:

• **${personalityType === 'advisor' ? 'Revenue optimization strategies' : 
      personalityType === 'analyzer' ? 'Network performance analysis' :
      personalityType === 'mentor' ? 'Success coaching and motivation' :
      'Strategic planning and matrix optimization'}**

• **Real-time guidance** based on your current progress
• **Personalized recommendations** for your tier level  
• **Action plans** for achieving your goals

What specific aspect would you like to explore first? 🚀`;
  };

  const generateAdvancedAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate AI processing time for realistic interaction
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const personality = personalities[currentPersonality];
    
    // Update conversation context
    const updatedContext = {
      ...conversationContext,
      lastQuery: userMessage,
      personality: currentPersonality,
      userInfo: userInfo,
      timestamp: new Date().toISOString()
    };
    setConversationContext(updatedContext);

    // Generate response using enhanced knowledge base
    let response = '';
    let actionItems = [];
    let predictions = null;

    try {
      // Use enhanced knowledge base for intelligent responses
      response = knowledgeBase.generateResponse(userMessage, updatedContext);
      
      // Add personality-specific enhancements
      const enhancedResponse = enhanceResponseByPersonality(response, currentPersonality, userMessage);
      response = enhancedResponse.content;
      actionItems = enhancedResponse.actionItems;
      predictions = enhancedResponse.predictions;
      
    } catch (error) {
      console.error('[AIRA] Error generating response:', error);
      response = generateFallbackResponse(currentPersonality, userMessage);
    }

    setIsTyping(false);
    return { response, actionItems, predictions };
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

    // Generate AI response with advanced features
    const aiResponse = await generateAdvancedAIResponse(inputMessage);
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse.response,
      personality: currentPersonality,
      timestamp: new Date(),
      actionItems: aiResponse.actionItems,
      predictions: aiResponse.predictions
    };

    setMessages(prev => [...prev, aiMessage]);

    // Play voice response if enabled
    if (voiceEnabled && aiResponse.response) {
      playVoiceResponse(aiResponse.response);
    }
  };

  const playVoiceResponse = (text) => {
    // Browser speech synthesis for voice responses
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const switchPersonality = () => {
    const personalityKeys = Object.keys(personalities);
    const currentIndex = personalityKeys.indexOf(currentPersonality);
    const nextIndex = (currentIndex + 1) % personalityKeys.length;
    setCurrentPersonality(personalityKeys[nextIndex]);
  };

  const currentPersonalityData = personalities[currentPersonality];
  const PersonalityIcon = currentPersonalityData.icon;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  console.log('[ARIA DEBUG] About to render ARIA chatbot with personality:', currentPersonalityData.name);

  return (
    <div className={`aria-chatbot ${mode} ${position}`} style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Chat Toggle Button */}
      <button 
        className="aria-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with ARIA"
        style={{ 
          background: `linear-gradient(135deg, ${currentPersonalityData.color}, #1e3a8a)`,
          border: 'none',
          borderRadius: '50px',
          padding: '15px 20px',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}
      >
        <PersonalityIcon style={{ fontSize: '20px' }} />
        <span className="aria-badge">ARIA</span>
        <span className="personality-indicator" style={{ fontSize: '12px', opacity: 0.9 }}>
          {currentPersonalityData.name}
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`aria-chat-window ${isMinimized ? 'minimized' : ''}`}
          style={{
            position: 'absolute',
            bottom: '70px',
            right: '0',
            width: '400px',
            height: isMinimized ? '60px' : '600px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Header */}
          <div 
            className="aria-chat-header" 
            style={{ 
              background: `linear-gradient(135deg, ${currentPersonalityData.color}, #1e3a8a)`,
              color: 'white',
              padding: '15px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div className="aria-header-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <PersonalityIcon className="aria-icon" style={{ fontSize: '24px' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                  ARIA - {currentPersonalityData.name}
                </h3>
                <span className="aria-status" style={{ fontSize: '12px', opacity: 0.9 }}>
                  {currentPersonalityData.description}
                </span>
              </div>
            </div>
            <div className="aria-header-controls" style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={switchPersonality}
                title="Switch AI Personality"
                className="personality-switch"
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaSync />
              </button>
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? "Disable Voice" : "Enable Voice"}
                className={`voice-toggle ${voiceEnabled ? 'active' : ''}`}
                style={{ 
                  background: voiceEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isMinimized ? <FaExpand /> : <FaMinus />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages and Input - Only show when not minimized */}
          {!isMinimized && (
            <>
              <div 
                className="aria-messages" 
                style={{
                  height: '400px',
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}
              >
                {messages.map((message) => {
                  const MessagePersonalityIcon = message.personality ? personalities[message.personality].icon : FaRobot;
                  return (
                    <div 
                      key={message.id} 
                      className={`aria-message ${message.type}`}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                      }}
                    >
                      {message.type === 'ai' && (
                        <MessagePersonalityIcon 
                          className="aria-message-icon" 
                          style={{ 
                            fontSize: '20px', 
                            color: currentPersonalityData.color,
                            marginTop: '5px'
                          }} 
                        />
                      )}
                      <div 
                        className="aria-message-content" 
                        style={{
                          background: message.type === 'user' ? currentPersonalityData.color : '#f1f5f9',
                          color: message.type === 'user' ? 'white' : '#1e293b',
                          padding: '15px',
                          borderRadius: '15px',
                          maxWidth: '80%',
                          wordWrap: 'break-word',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                      >
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
                        
                        {/* Action Items */}
                        {message.actionItems && message.actionItems.length > 0 && (
                          <div className="aria-action-items" style={{ marginTop: '15px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600' }}>🎯 Action Items:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                              {message.actionItems.map((item, index) => (
                                <li key={index} style={{ marginBottom: '4px' }}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Predictions */}
                        {message.predictions && (
                          <div className="aria-predictions" style={{ marginTop: '15px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600' }}>🔮 Predictions:</h4>
                            <p style={{ margin: 0, fontSize: '12px' }}>
                              Expected increase: {message.predictions.earningsIncrease} in {message.predictions.timeframe}
                            </p>
                          </div>
                        )}
                        
                        {/* Features */}
                        {message.features && (
                          <div className="aria-features" style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {message.features.map((feature, index) => (
                              <span 
                                key={index} 
                                className="aria-feature-tag"
                                style={{
                                  background: 'rgba(255,255,255,0.2)',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '500'
                                }}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <span 
                          className="aria-timestamp" 
                          style={{ 
                            display: 'block', 
                            marginTop: '8px', 
                            fontSize: '11px', 
                            opacity: 0.7,
                            textAlign: message.type === 'user' ? 'right' : 'left'
                          }}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && (
                  <div className="aria-message ai" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <PersonalityIcon 
                      className="aria-message-icon" 
                      style={{ 
                        fontSize: '20px', 
                        color: currentPersonalityData.color,
                        marginTop: '5px'
                      }} 
                    />
                    <div 
                      className="aria-message-content" 
                      style={{
                        background: '#f1f5f9',
                        padding: '15px',
                        borderRadius: '15px',
                        maxWidth: '80%'
                      }}
                    >
                      <div className="aria-typing" style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          background: currentPersonalityData.color, 
                          borderRadius: '50%',
                          animation: 'typing 1.4s infinite ease-in-out',
                          animationDelay: '0ms'
                        }}></span>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          background: currentPersonalityData.color, 
                          borderRadius: '50%',
                          animation: 'typing 1.4s infinite ease-in-out',
                          animationDelay: '200ms'
                        }}></span>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          background: currentPersonalityData.color, 
                          borderRadius: '50%',
                          animation: 'typing 1.4s infinite ease-in-out',
                          animationDelay: '400ms'
                        }}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div 
                className="aria-input-area" 
                style={{
                  padding: '20px',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc'
                }}
              >
                <div className="aria-input-container" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask ${currentPersonalityData.name} about earnings, network building, or platform features...`}
                    rows="1"
                    className="aria-input"
                    style={{
                      flex: 1,
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '14px',
                      resize: 'none',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button 
                    onClick={handleVoiceInput}
                    title="Voice Input"
                    className={`aria-voice-button ${isListening ? 'listening' : ''}`}
                    disabled={isListening}
                    style={{
                      background: isListening ? currentPersonalityData.color : '#e2e8f0',
                      border: 'none',
                      color: isListening ? 'white' : '#64748b',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaMicrophone />
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="aria-send-button"
                    title="Send message"
                    style={{
                      background: inputMessage.trim() ? currentPersonalityData.color : '#e2e8f0',
                      border: 'none',
                      color: inputMessage.trim() ? 'white' : '#94a3b8',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
                
                {/* Personality-specific quick actions */}
                <div className="aria-quick-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentPersonality === 'advisor' && (
                    <>
                      <button 
                        onClick={() => setInputMessage('How can I increase my earnings?')}
                        style={{
                          background: 'white',
                          border: `1px solid ${currentPersonalityData.color}`,
                          color: currentPersonalityData.color,
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        💰 Earnings Strategy
                      </button>
                      <button 
                        onClick={() => setInputMessage('Show me revenue optimization plan')}
                        style={{
                          background: 'white',
                          border: `1px solid ${currentPersonalityData.color}`,
                          color: currentPersonalityData.color,
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        📈 Revenue Plan
                      </button>
                    </>
                  )}
                  {currentPersonality === 'analyzer' && (
                    <>
                      <button 
                        onClick={() => setInputMessage('Analyze my network performance')}
                        style={{
                          background: 'white',
                          border: `1px solid ${currentPersonalityData.color}`,
                          color: currentPersonalityData.color,
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        📊 Network Analysis
                      </button>
                      <button 
                        onClick={() => setInputMessage('Show team statistics')}
                        style={{
                          background: 'white',
                          border: `1px solid ${currentPersonalityData.color}`,
                          color: currentPersonalityData.color,
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        📋 Team Stats
                      </button>
                    </>
                  )}
                  {currentPersonality === 'mentor' && (
                    <>
                      <button 
                        onClick={() => setInputMessage('I need motivation')}
                        style={{
                          background: 'white',
                          border: `1px solid ${currentPersonalityData.color}`,
                          color: currentPersonalityData.color,
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        💪 Motivation
                      </button>
                      <button 
                        onClick={() => setInputMessage('Help me overcome challenges')}
                        style={{
                          background: 'white',
                          border: `1px solid ${currentPersonalityData.color}`,
                          color: currentPersonalityData.color,
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🎯 Challenge Help
                      </button>
                    </>
                  )}
                  {currentPersonality === 'strategist' && (
                    <>
                      <button 
                        onClick={() => setInputMessage('Binary tree strategy advice')}
                        style={{
                          background: 'white',
                          border: `1px solid ${currentPersonalityData.color}`,
                          color: currentPersonalityData.color,
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ♟️ Binary Strategy
                      </button>
                      <button 
                        onClick={() => setInputMessage('Long-term empire building plan')}
                        style={{
                          background: 'white',
                          border: `1px solid ${currentPersonalityData.color}`,
                          color: currentPersonalityData.color,
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🏰 Empire Plan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
});

export default UnifiedChatbot;
