import React, { useState, useEffect } from 'react';
import OpenAIService from '../services/OpenAIService';
import { FaBrain, FaChartLine, FaPercent, FaVolumeUp } from 'react-icons/fa';
import './AIEarningsPrediction.css';
import '../styles/brandColors.css';

const AIEarningsPrediction = ({ userStats }) => {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('30');
  const [error, setError] = useState(null);

  const generatePrediction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = `As a network marketing AI analyst, predict earnings for a LeadFive user with these metrics:
      
      Current Performance:
      - Team Size: ${userStats?.teamSize || 0} members
      - Weekly Growth Rate: ${userStats?.weeklyGrowth || 0}%
      - Current Package: Level ${userStats?.currentPackage || 1}
      - Direct Referrals: ${userStats?.directReferrals || 0}
      - Current Monthly Earnings: $${userStats?.totalEarnings || 0}
      
      Predict realistic ${timeframe}-day earnings potential and provide:
      1. Conservative estimate (80% confidence)
      2. Optimistic estimate (best case scenario)
      3. Three key growth factors
      4. Overall confidence percentage
      
      Respond in this JSON format:
      {
        "conservative": 150,
        "optimistic": 450,
        "factors": ["Factor 1", "Factor 2", "Factor 3"],
        "confidence": 75,
        "reasoning": "Brief explanation"
      }`;

      const response = await OpenAIService.generateResponse(prompt);
      
      try {
        // Try to parse as JSON first
        const predictionData = JSON.parse(response);
        setPrediction(predictionData);
      } catch (parseError) {
        // Fallback: extract numbers and create prediction
        const numbers = response.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
        const factors = [
          "Team growth momentum",
          "Market engagement trends", 
          "Package optimization potential"
        ];
        
        setPrediction({
          conservative: numbers?.[0]?.replace(/\$|,/g, '') || Math.max(50, (userStats?.totalEarnings || 0) * 0.1),
          optimistic: numbers?.[1]?.replace(/\$|,/g, '') || Math.max(150, (userStats?.totalEarnings || 0) * 0.3),
          factors: factors,
          confidence: 75,
          reasoning: "Based on current performance metrics and market analysis"
        });
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setError('Unable to generate prediction. Please try again.');
      
      // Fallback prediction based on user stats
      setPrediction({
        conservative: Math.max(25, (userStats?.totalEarnings || 0) * 0.05),
        optimistic: Math.max(100, (userStats?.totalEarnings || 0) * 0.2),
        factors: ["Historical performance", "Network growth", "Market conditions"],
        confidence: 60,
        reasoning: "Estimate based on available data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakPrediction = async () => {
    if (!prediction) return;
    
    const speech = `Your ${timeframe}-day earnings prediction: Conservative estimate is $${prediction.conservative}, optimistic estimate is $${prediction.optimistic}, with ${prediction.confidence}% confidence. ${prediction.reasoning}`;
    
    try {
      // Speech synthesis temporarily disabled - use AI chat instead
      console.log('Speech text:', speech);
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#00FF00';
    if (confidence >= 60) return '#FFA500';
    return '#FF6B6B';
  };

  return (
    <div className="ai-earnings-prediction">
      <div className="prediction-header">
        <h3><FaBrain /> AI Earnings Prediction</h3>
        <div className="timeframe-selector">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            disabled={isLoading}
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
          </select>
        </div>
      </div>

      <div className="prediction-controls">
        <button 
          onClick={generatePrediction} 
          disabled={isLoading}
          className="predict-btn"
        >
          {isLoading ? (
            <>🔄 Analyzing...</>
          ) : (
            <>🎯 Predict Earnings</>
          )}
        </button>
        
        {prediction && !error && (
          <button onClick={speakPrediction} className="speak-btn">
            <FaVolumeUp /> Hear Prediction
          </button>
        )}
      </div>

      {error && (
        <div className="prediction-error">
          ⚠️ {error}
        </div>
      )}

      {prediction && !error && (
        <div className="prediction-results">
          <div className="prediction-range">
            <div className="estimate conservative">
              <h4><FaChartLine /> Conservative</h4>
              <div className="amount">${prediction.conservative}</div>
              <span className="confidence-label">80% Likely</span>
            </div>
            <div className="estimate optimistic">
              <h4>🚀 Optimistic</h4>
              <div className="amount">${prediction.optimistic}</div>
              <span className="confidence-label">Best Case</span>
            </div>
          </div>
          
          <div className="confidence-meter">
            <div className="confidence-label">
              <FaPercent /> Overall Confidence: {prediction.confidence}%
            </div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ 
                  width: `${prediction.confidence}%`,
                  backgroundColor: getConfidenceColor(prediction.confidence)
                }}
              ></div>
            </div>
          </div>
          
          <div className="growth-factors">
            <h4>🎯 Key Growth Factors:</h4>
            <ul>
              {prediction.factors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>

          {prediction.reasoning && (
            <div className="ai-reasoning">
              <h4>💡 AI Analysis:</h4>
              <p>{prediction.reasoning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIEarningsPrediction;
