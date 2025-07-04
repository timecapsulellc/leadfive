import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaBrain, FaChartLine } from 'react-icons/fa';
import '../styles/brandColors.css';

const AICoachingPanel = ({ account, data }) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [isLoading, setIsLoading] = useState(false);
  // Mock coaching suggestions if none provided
  const mockSuggestions = [
    {
      id: 1,
      title: 'Increase Direct Referrals',
      description: 'Focus on bringing in 3 more direct referrals to qualify for the next level.',
      actionable: true,
      priority: 'high',
      category: 'growth'
    },
    {
      id: 2,
      title: 'Optimize Your Team Structure',
      description: 'Your Level 2 referrals can help you grow faster. Engage with them to activate more downline.',
      actionable: true,
      priority: 'medium',
      category: 'strategy'
    },
    {
      id: 3,
      title: 'Help Pool Optimization',
      description: 'You\'re eligible for Help Pool rewards. Make sure your account is properly configured.',
      actionable: true,
      priority: 'medium',
      category: 'earnings'
    }
  ];
  
  // Use mock data if none provided
  const coachingSuggestions = data?.coachingSuggestions || mockSuggestions;
  
  return (
    <div className="ai-coaching-panel">
      <div className="ai-panel-header">
        <h3 className="section-title">
          <FaRobot /> AI Coaching Insights
        </h3>
      </div>
      
      <div className="ai-suggestions-container">
        {coachingSuggestions.map(suggestion => (
          <div key={suggestion.id} className={`ai-suggestion-card ${suggestion.priority}`}>
            <div className="suggestion-icon">
              {suggestion.category === 'growth' && <FaChartLine />}
              {suggestion.category === 'strategy' && <FaBrain />}
              {suggestion.category === 'earnings' && <FaLightbulb />}
            </div>
            <div className="suggestion-content">
              <h4 className="suggestion-title">{suggestion.title}</h4>
              <p className="suggestion-description">{suggestion.description}</p>
              {suggestion.actionable && (
                <button className="suggestion-action-btn">Take Action</button>
              )}
            </div>
            <div className={`priority-indicator ${suggestion.priority}`}></div>
          </div>
        ))}
      </div>
      
      <div className="ai-coaching-footer">
        <button className="ai-coaching-action">Get Personalized Strategy</button>
      </div>
    </div>
  );
};

export default AICoachingPanel;
