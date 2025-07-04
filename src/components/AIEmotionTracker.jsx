import React from 'react';
import { FaRobot, FaSmile, FaMeh, FaFrown } from 'react-icons/fa';

const AIEmotionTracker = ({ account }) => {
  // Mock data for emotion tracking
  const emotionData = {
    currentEmotion: 'positive',
    historicalEmotions: [
      { date: '2023-06-01', emotion: 'positive' },
      { date: '2023-05-25', emotion: 'neutral' },
      { date: '2023-05-18', emotion: 'positive' },
      { date: '2023-05-11', emotion: 'negative' },
      { date: '2023-05-04', emotion: 'positive' },
    ],
    recommendations: [
      'Your positive engagement helps your team grow faster',
      'Consider sharing your success stories with your downline',
      'Regular community engagement correlates with higher earnings'
    ]
  };
  
  // Emotion icon mapping
  const getEmotionIcon = (emotion) => {
    switch(emotion) {
      case 'positive':
        return <FaSmile className="emotion-icon positive" />;
      case 'neutral':
        return <FaMeh className="emotion-icon neutral" />;
      case 'negative':
        return <FaFrown className="emotion-icon negative" />;
      default:
        return <FaSmile className="emotion-icon positive" />;
    }
  };
  
  return (
    <div className="ai-emotion-tracker">
      <div className="emotion-tracker-header">
        <h3 className="section-title">
          <FaRobot /> Community Engagement Monitor
        </h3>
      </div>
      
      <div className="current-emotion">
        <div className="emotion-visualization">
          {getEmotionIcon(emotionData.currentEmotion)}
          <span className="emotion-label">
            {emotionData.currentEmotion === 'positive' && 'Positive Engagement'}
            {emotionData.currentEmotion === 'neutral' && 'Neutral Engagement'}
            {emotionData.currentEmotion === 'negative' && 'Disengaged'}
          </span>
        </div>
      </div>
      
      <div className="emotion-history">
        <h4>Engagement History</h4>
        <div className="emotion-timeline">
          {emotionData.historicalEmotions.map((entry, index) => (
            <div key={index} className="emotion-entry">
              <div className="emotion-date">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <div className="emotion-indicator">{getEmotionIcon(entry.emotion)}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="emotion-recommendations">
        <h4>AI Recommendations</h4>
        <ul className="recommendations-list">
          {emotionData.recommendations.map((recommendation, index) => (
            <li key={index} className="recommendation-item">{recommendation}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AIEmotionTracker;
