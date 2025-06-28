/**
 * AI COACHING PANEL COMPONENT
 * Displays personalized coaching advice and earnings predictions
 */

import React, { useState, useEffect } from 'react';
import { FaRobot, FaBrain, FaLightbulb, FaChartLine, FaVolumeUp, FaSync } from 'react-icons/fa';
import { AICoachingExamples, AIEarningsExamples, AIIntegrationUtils } from '../hooks/useAIIntegration.js';
import './AICoachingPanel.css';

const AICoachingPanel = ({ userStats, account }) => {
  console.log('🔧 AICoachingPanel rendering with props:', { userStats, account });
  
  // Add debug div to the DOM to visually confirm mounting
  useEffect(() => {
    console.log('🔍 DEBUG: AICoachingPanel mounted and visible in DOM');
    
    // Create debug element
    const debugElement = document.createElement('div');
    debugElement.style.position = 'fixed';
    debugElement.style.top = '10px';
    debugElement.style.right = '10px';
    debugElement.style.background = 'rgba(255, 0, 0, 0.7)';
    debugElement.style.color = 'white';
    debugElement.style.padding = '5px 10px';
    debugElement.style.borderRadius = '5px';
    debugElement.style.zIndex = '9999';
    debugElement.style.fontSize = '12px';
    debugElement.textContent = 'AI Coaching Panel Mounted';
    
    // Add to DOM
    document.body.appendChild(debugElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(debugElement)) {
        document.body.removeChild(debugElement);
      }
    }, 5000);
    
    return () => {
      // Clean up if component unmounts before timeout
      if (document.body.contains(debugElement)) {
        document.body.removeChild(debugElement);
      }
      console.log('🔍 DEBUG: AICoachingPanel unmounted');
    };
  }, []);
  
  const [coaching, setCoaching] = useState(null);
  const [earningsPrediction, setEarningsPrediction] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fallback styles in case CSS doesn't load
  const fallbackStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minHeight: '200px',
    display: 'block',
    visibility: 'visible',
    opacity: 1
  };

  // Initialize AI features
  useEffect(() => {
    const initializeAI = async () => {
      try {
        const status = AIIntegrationUtils.getAIStatus();
        setAiStatus(status);
        
        if (userStats && account) {
          await loadAIInsights();
        }
      } catch (error) {
        console.error('AI initialization error:', error);
      }
    };

    initializeAI();
  }, [userStats, account]);

  const loadAIInsights = async () => {
    if (!userStats || isLoading) return;
    
    setIsLoading(true);
    try {
      // Load coaching advice
      const userActivity = {
        daysSinceLastLogin: userStats.daysSinceLastLogin || 0,
        teamGrowthRate: userStats.teamGrowthRate || 0,
        totalEarnings: userStats.totalEarnings || 0,
        loginStreak: userStats.loginStreak || 1,
        monthlyGoal: userStats.monthlyGoal || 1000,
        packageLevel: userStats.packageLevel || 30,
        daysSinceLastReferral: userStats.daysSinceLastReferral || 0,
        voiceEnabled: userStats.voiceEnabled || false
      };

      const coachingAdvice = await AICoachingExamples.getDailyCoaching(userActivity);
      setCoaching(coachingAdvice);

      // Load earnings prediction
      const earningsReport = await AIEarningsExamples.generateEarningsReport(userStats);
      setEarningsPrediction(earningsReport);

    } catch (error) {
      console.error('Error loading AI insights:', error);
      setCoaching({
        message: "Keep building your LeadFive network!",
        action: "Focus on referring new members today.",
        motivation: "Every successful leader started with their first referral.",
        priority: 'medium'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInsights = () => {
    loadAIInsights();
  };

  if (!aiStatus) {
    return (
      <div className="ai-coaching-panel loading">
        <div className="ai-header">
          <FaRobot className="ai-icon" />
          <h3>AI Assistant</h3>
        </div>
        <p>Initializing AI features...</p>
      </div>
    );
  }

  return (
    <div className="ai-coaching-panel" style={fallbackStyle}>
      <div className="ai-header">
        <FaRobot className="ai-icon rotating" />
        <h3>AI Success Coach</h3>
        <div className="ai-status">
          <span className={`status-indicator ${aiStatus.openai ? 'active' : 'inactive'}`}>
            <FaBrain /> AI Chat
          </span>
          <span className={`status-indicator ${aiStatus.aiChat ? 'active' : 'inactive'}`}>
            <FaRobot /> Assistant
          </span>
          <button 
            className="refresh-btn" 
            onClick={refreshInsights}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="ai-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing your performance...</p>
        </div>
      ) : (
        <div className="ai-content">
          {/* Coaching Section */}
          {coaching && (
            <div className="coaching-section">
              <div className="section-header">
                <FaLightbulb className="section-icon" />
                <h4>Daily Coaching</h4>
                <span className={`priority-badge ${coaching.priority}`}>
                  {coaching.priority}
                </span>
              </div>
              
              <div className="coaching-content">
                <div className="coaching-message">
                  <p>{coaching.message}</p>
                </div>
                
                <div className="action-item">
                  <strong>Action Step:</strong>
                  <p>{coaching.action}</p>
                </div>
                
                <div className="motivation">
                  <em>💪 {coaching.motivation}</em>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Prediction Section */}
          {earningsPrediction && earningsPrediction.predictions && (
            <div className="earnings-prediction">
              <div className="section-header">
                <FaChartLine className="section-icon" />
                <h4>Earnings Forecast</h4>
                <span className="model-badge">
                  {earningsPrediction.model === 'ai-enhanced' ? '🤖 AI' : '📊 Math'}
                </span>
              </div>
              
              <div className="predictions-grid">
                <div className="prediction-card">
                  <div className="period">30 Days</div>
                  <div className="amount">
                    ${earningsPrediction.predictions['30days']?.likely || 0}
                  </div>
                  <div className="confidence">
                    {earningsPrediction.predictions['30days']?.confidence || 'N/A'}
                  </div>
                </div>
                
                <div className="prediction-card">
                  <div className="period">90 Days</div>
                  <div className="amount">
                    ${earningsPrediction.predictions['90days']?.likely || 0}
                  </div>
                  <div className="confidence">
                    {earningsPrediction.predictions['90days']?.confidence || 'N/A'}
                  </div>
                </div>
                
                <div className="prediction-card">
                  <div className="period">12 Months</div>
                  <div className="amount">
                    ${earningsPrediction.predictions['12months']?.likely || 0}
                  </div>
                  <div className="confidence">
                    {earningsPrediction.predictions['12months']?.confidence || 'N/A'}
                  </div>
                </div>
              </div>

              {earningsPrediction.factors && earningsPrediction.factors.length > 0 && (
                <div className="growth-factors">
                  <h5>Growth Factors:</h5>
                  <ul>
                    {earningsPrediction.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {earningsPrediction.disclaimer && (
                <div className="disclaimer">
                  <small>{earningsPrediction.disclaimer}</small>
                </div>
              )}
            </div>
          )}

          {/* AI Features Status */}
          <div className="ai-features-status">
            <h5>Available AI Features:</h5>
            <div className="features-list">
              <span className={`feature ${aiStatus.features.transactionExplanation ? 'enabled' : 'disabled'}`}>
                Transaction Help
              </span>
              <span className={`feature ${aiStatus.features.networkAnalysis ? 'enabled' : 'disabled'}`}>
                Network Analysis
              </span>
              <span className={`feature ${aiStatus.features.personalizedCoaching ? 'enabled' : 'disabled'}`}>
                Personal Coaching
              </span>
              <span className={`feature ${aiStatus.features.voiceSynthesis ? 'enabled' : 'disabled'}`}>
                Voice Assistant
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoachingPanel;
