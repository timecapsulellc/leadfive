import React, { useEffect } from 'react';
import { FaBrain, FaSync, FaChartLine, FaArrowUp } from 'react-icons/fa';

const AIMarketInsights = ({ aiInsights, isAiLoading, generateAIInsights }) => {
  // Add debug logging to verify component is mounting
  useEffect(() => {
    console.log('🔍 DEBUG: AIMarketInsights mounted and visible in DOM');
    
    // Create debug element
    const debugElement = document.createElement('div');
    debugElement.style.position = 'fixed';
    debugElement.style.top = '40px';
    debugElement.style.right = '10px';
    debugElement.style.background = 'rgba(0, 128, 255, 0.7)';
    debugElement.style.color = 'white';
    debugElement.style.padding = '5px 10px';
    debugElement.style.borderRadius = '5px';
    debugElement.style.zIndex = '9999';
    debugElement.style.fontSize = '12px';
    debugElement.textContent = 'AI Market Insights Mounted';
    
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
      console.log('🔍 DEBUG: AIMarketInsights unmounted');
    };
  }, []);

  return (
    <div className="overview-card ai-insights-card">
      <h3><FaBrain /> AI Market Insights</h3>
      <div className="ai-insights-content">
        {isAiLoading ? (
          <div className="ai-loading">
            <FaSync className="spinning" />
            <p>Generating insights...</p>
          </div>
        ) : aiInsights ? (
          <div className="ai-insights-text">
            <p>{aiInsights}</p>
            <button
              className="regenerate-btn"
              onClick={generateAIInsights}
              title="Generate new insights"
            >
              <FaSync /> Refresh Insights
            </button>
          </div>
        ) : (
          <div className="ai-insights-placeholder">
            <p>Get personalized AI insights about your performance</p>
            <button
              className="generate-insights-btn"
              onClick={generateAIInsights}
            >
              <FaBrain /> Generate AI Insights
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4 mt-4">
        <div className="insight-item hot-opportunity">
          <div className="insight-header">
            <FaChartLine className="insight-icon" />
            <span className="insight-title">Hot Opportunity</span>
          </div>
          <p className="insight-text">Top 10% earn $15,000/month. Join the elite tier now - only 23 spots left!</p>
        </div>
        <div className="insight-item trending-now">
          <div className="insight-header">
            <FaArrowUp className="insight-icon" />
            <span className="insight-title">Trending Now</span>
          </div>
          <p className="insight-text">AI-powered projects are 340% more successful. Don't miss the revolution!</p>
        </div>
      </div>
    </div>
  );
};

export default AIMarketInsights;
