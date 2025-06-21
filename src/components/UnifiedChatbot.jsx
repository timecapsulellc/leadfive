import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaPaperPlane, FaVolumeUp, FaTimes, FaRobot } from 'react-icons/fa';
import UnifiedChatbotService from '../services/UnifiedChatbotService';
import './UnifiedChatbot.css';

const UnifiedChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Welcome to LeadFive! How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await UnifiedChatbotService.generateResponse(inputText);
      const botMessage = {
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    try {
      const transcript = await UnifiedChatbotService.speechToText();
      setInputText(transcript);
      setIsListening(false);
      
      // Auto-send after voice input
      if (transcript) {
        setTimeout(() => {
          handleSendMessage();
        }, 100);
      }
    } catch (error) {
      console.error('Error with voice input:', error);
      setIsListening(false);
      alert('Voice input not available. Please type your message.');
    }
  };

  const handleTextToSpeech = async (text) => {
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const audioUrl = await UnifiedChatbotService.textToSpeech(text);
      if (audioUrl) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsSpeaking(false);
        await audioRef.current.play();
      } else {
        // Fallback to browser's speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error with text to speech:', error);
      setIsSpeaking(false);
    }
  };

  const quickActions = [
    'What is LeadFive?',
    'Show me the packages',
    'How do I get started?',
    'What are the benefits?'
  ];

  if (!isOpen) return null;

  return (
    <div className="unified-chatbot">
      <div className="chatbot-header">
        <div className="header-left">
          <FaRobot className="bot-icon" />
          <h3>LeadFive Assistant</h3>
        </div>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              <p>{message.text}</p>
              {message.type === 'bot' && (
                <button 
                  className="speak-btn"
                  onClick={() => handleTextToSpeech(message.text)}
                  title="Listen to response"
                >
                  <FaVolumeUp className={isSpeaking ? 'speaking' : ''} />
                </button>
              )}
            </div>
            <span className="timestamp">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="quick-action-btn"
            onClick={() => {
              setInputText(action);
              setTimeout(() => {
                handleSendMessage();
              }, 100);
            }}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          disabled={isLoading || isListening}
        />
        <button
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          disabled={isLoading}
          title="Voice input"
        >
          <FaMicrophone />
        </button>
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default UnifiedChatbot;
