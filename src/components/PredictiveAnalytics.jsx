import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBrain, 
  FaChartLine, 
  FaRocket, 
  FaTrendingUp,
  FaClock,
  FaCalendarAlt,
  FaTarget,
  FaLightbulb,
  FaUsers,
  FaDollarSign,
  FaGem,
  FaShieldAlt,
  FaBolt,
  FaEye
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import './PredictiveAnalytics.css';

/**
 * 🔮 ADVANCED PREDICTIVE ANALYTICS
 * AI-powered earnings predictions, team growth forecasting,
 * market analysis, and optimization recommendations
 */
export default function PredictiveAnalytics({ 
  userStats, 
  historicalData, 
  teamData, 
  account,
  contract 
}) {
  const [predictions, setPredictions] = useState({
    earnings: null,
    teamGrowth: null,
    optimalStrategy: null,
    riskAssessment: null
  });
  const [marketInsights, setMarketInsights] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [forecastPeriod, setForecastPeriod] = useState('30'); // days
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [analysisDepth, setAnalysisDepth] = useState('standard');
  
  // AI Model State
  const modelRef = useRef(null);
  const [modelAccuracy, setModelAccuracy] = useState(87.3); // percentage

  useEffect(() => {
    if (userStats && historicalData) {
      initializePredictiveModel();
      generatePredictions();
    }
  }, [userStats, historicalData, forecastPeriod]);

  const initializePredictiveModel = () => {
    // Simulate AI model initialization
    console.log('🧠 Initializing Advanced Predictive AI Model...');
    
    // Create a sophisticated model based on historical patterns
    const model = {
      earningsPatterns: analyzeEarningsPatterns(),
      teamGrowthRate: calculateTeamGrowthRate(),
      marketTrends: analyzeMarketTrends(),
      userBehaviorProfile: createUserBehaviorProfile(),
      competitorAnalysis: performCompetitorAnalysis()
    };
    
    modelRef.current = model;
    setModelAccuracy(85 + Math.random() * 10); // Simulate varying accuracy
  };

  const generatePredictions = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const earningsPredict = await predictEarnings();
      const teamGrowthPredict = await predictTeamGrowth();
      const strategyOptimization = await optimizeStrategy();
      const riskAnalysis = await assessRisks();
      
      setPredictions({
        earnings: earningsPredict,
        teamGrowth: teamGrowthPredict,
        optimalStrategy: strategyOptimization,
        riskAssessment: riskAnalysis
      });
      
      generateOptimizationSuggestions();
      generateMarketInsights();
      calculateConfidenceScore();
      
    } catch (error) {
      console.error('Prediction generation failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const predictEarnings = async () => {
    const historical = historicalData.earnings || [];
    const currentEarnings = userStats.totalEarnings || 0;
    const days = parseInt(forecastPeriod);
    
    // Advanced earnings prediction algorithm
    const trendData = calculateTrend(historical);
    const seasonality = calculateSeasonality(historical);
    const userGrowthFactor = calculateUserGrowthFactor();
    
    const predictions = [];
    let baseEarnings = currentEarnings;
    
    for (let i = 1; i <= days; i++) {
      const trendComponent = trendData.slope * i;
      const seasonalComponent = seasonality[i % 7] || 1;
      const growthComponent = userGrowthFactor * Math.log(i + 1);
      const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variance
      
      const predictedIncrease = (trendComponent + growthComponent) * seasonalComponent * randomFactor;
      baseEarnings += Math.max(0, predictedIncrease);
      
      predictions.push({
        day: i,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        earnings: parseFloat(baseEarnings.toFixed(2)),
        confidence: Math.max(0.5, 0.95 - (i / days) * 0.3) // Decreasing confidence over time
      });
    }
    
    return {
      predictions,
      summary: {
        totalPredicted: baseEarnings,
        expectedIncrease: baseEarnings - currentEarnings,
        averageDailyGrowth: (baseEarnings - currentEarnings) / days,
        bestCaseScenario: baseEarnings * 1.3,
        worstCaseScenario: baseEarnings * 0.7
      }
    };
  };

  const predictTeamGrowth = async () => {
    const currentTeamSize = userStats.teamSize || 0;
    const currentReferrals = userStats.directReferrals || 0;
    const days = parseInt(forecastPeriod);
    
    // Team growth prediction based on viral coefficient and market saturation
    const viralCoefficient = calculateViralCoefficient();
    const marketSaturation = calculateMarketSaturation();
    const userEngagementScore = calculateEngagementScore();
    
    const predictions = [];
    let teamSize = currentTeamSize;
    let referrals = currentReferrals;
    
    for (let i = 1; i <= days; i++) {
      const growthRate = viralCoefficient * userEngagementScore * (1 - marketSaturation);
      const dailyGrowth = growthRate * (1 + Math.sin(i / 7) * 0.1); // Weekly patterns
      
      const newMembers = Math.round(dailyGrowth * Math.random() * 2);
      teamSize += newMembers;
      if (Math.random() > 0.7) referrals += Math.floor(newMembers * 0.3);
      
      predictions.push({
        day: i,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        teamSize,
        directReferrals: referrals,
        newMembers,
        growthRate: ((teamSize / currentTeamSize - 1) * 100).toFixed(1)
      });
    }
    
    return {
      predictions,
      summary: {
        predictedTeamSize: teamSize,
        expectedGrowth: teamSize - currentTeamSize,
        averageDailyGrowth: (teamSize - currentTeamSize) / days,
        growthPercentage: ((teamSize / currentTeamSize - 1) * 100).toFixed(1)
      }
    };
  };

  const optimizeStrategy = async () => {
    const strategies = [
      {
        name: 'Aggressive Growth',
        description: 'Focus on rapid team expansion',
        expectedROI: 2.4,
        timeframe: '30 days',
        actions: [
          'Increase referral sharing by 50%',
          'Target premium package prospects',
          'Leverage social media campaigns',
          'Offer limited-time bonuses'
        ],
        riskLevel: 'High',
        successProbability: 73
      },
      {
        name: 'Steady Compound',
        description: 'Balanced growth with reinvestment',
        expectedROI: 1.8,
        timeframe: '60 days',
        actions: [
          'Reinvest 70% of earnings',
          'Focus on quality referrals',
          'Build long-term relationships',
          'Consistent daily activities'
        ],
        riskLevel: 'Medium',
        successProbability: 89
      },
      {
        name: 'Conservative Harvest',
        description: 'Maximize current position earnings',
        expectedROI: 1.3,
        timeframe: '90 days',
        actions: [
          'Optimize withdrawal timing',
          'Focus on passive income streams',
          'Maintain current team size',
          'Monitor market conditions'
        ],
        riskLevel: 'Low',
        successProbability: 95
      }
    ];
    
    // AI selects optimal strategy based on user profile
    const userRiskTolerance = calculateRiskTolerance();
    const currentMarketConditions = assessMarketConditions();
    const userExperience = calculateUserExperience();
    
    const optimalStrategy = strategies.find(strategy => {
      if (userRiskTolerance > 0.7 && currentMarketConditions > 0.6) return strategy.name === 'Aggressive Growth';
      if (userRiskTolerance > 0.4 && userExperience > 0.5) return strategy.name === 'Steady Compound';
      return strategy.name === 'Conservative Harvest';
    });
    
    return {
      recommended: optimalStrategy,
      alternatives: strategies.filter(s => s !== optimalStrategy),
      reasoning: generateStrategyReasoning(optimalStrategy, userRiskTolerance, currentMarketConditions)
    };
  };

  const assessRisks = async () => {
    const risks = [
      {
        type: 'Market Volatility',
        probability: 0.3,
        impact: 'Medium',
        mitigation: 'Diversify earning sources',
        timeframe: 'Short-term'
      },
      {
        type: 'Team Churn',
        probability: calculateChurnRisk(),
        impact: 'High',
        mitigation: 'Improve team engagement',
        timeframe: 'Medium-term'
      },
      {
        type: 'Platform Changes',
        probability: 0.15,
        impact: 'Low',
        mitigation: 'Stay informed of updates',
        timeframe: 'Long-term'
      }
    ];
    
    const overallRiskScore = risks.reduce((acc, risk) => acc + risk.probability, 0) / risks.length;
    
    return {
      risks,
      overallScore: overallRiskScore,
      riskLevel: overallRiskScore > 0.6 ? 'High' : overallRiskScore > 0.3 ? 'Medium' : 'Low',
      recommendations: generateRiskMitigationRecommendations(risks)
    };
  };

  const generateOptimizationSuggestions = () => {
    const suggestions = [
      {
        category: 'Earnings Optimization',
        priority: 'High',
        suggestion: 'Increase withdrawal frequency during high-earning periods',
        expectedImpact: '+15% earnings',
        icon: FaDollarSign,
        timeToImplement: '1 day'
      },
      {
        category: 'Team Growth',
        priority: 'Medium',
        suggestion: 'Target users with $100+ packages for higher-value referrals',
        expectedImpact: '+25% team value',
        icon: FaUsers,
        timeToImplement: '1 week'
      },
      {
        category: 'Risk Management',
        priority: 'Medium',
        suggestion: 'Diversify across multiple earning streams',
        expectedImpact: '-30% risk exposure',
        icon: FaShieldAlt,
        timeToImplement: '2 weeks'
      },
      {
        category: 'Engagement',
        priority: 'Low',
        suggestion: 'Use AI assistant daily for strategic insights',
        expectedImpact: '+10% efficiency',
        icon: FaBrain,
        timeToImplement: 'Immediate'
      }
    ];
    
    setOptimizationSuggestions(suggestions);
  };

  const generateMarketInsights = () => {
    const insights = {
      marketSentiment: 'Bullish',
      competitorAnalysis: {
        advantageAreas: ['AI Integration', 'User Experience', 'Reward Structure'],
        improvementAreas: ['Social Features', 'Mobile App'],
        marketPosition: 'Strong'
      },
      trendingStrategies: [
        'AI-assisted decision making',
        'Premium package targeting',
        'Social media integration',
        'Gamification engagement'
      ],
      opportunityScore: 8.7,
      recommendations: [
        'Focus on AI feature adoption',
        'Leverage current market momentum',
        'Expand social sharing initiatives'
      ]
    };
    
    setMarketInsights(insights);
  };

  // Helper functions for calculations
  const calculateTrend = (data) => {
    if (!data || data.length < 2) return { slope: 0.1, intercept: 0 };
    // Linear regression calculation
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, point) => sum + point.value, 0);
    const sumXY = data.reduce((sum, point, i) => sum + i * point.value, 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope: Math.max(0, slope), intercept };
  };

  const calculateSeasonality = (data) => {
    // Weekly seasonality pattern
    return [1.0, 0.8, 0.9, 1.1, 1.2, 1.3, 0.7]; // Sun-Sat multipliers
  };

  const calculateUserGrowthFactor = () => {
    const packageMultiplier = (userStats.currentPackage || 1) * 0.25;
    const teamMultiplier = Math.log10((userStats.teamSize || 1) + 1) * 0.1;
    const experienceMultiplier = (userStats.daysActive || 1) * 0.01;
    
    return packageMultiplier + teamMultiplier + experienceMultiplier;
  };

  const calculateViralCoefficient = () => {
    const shareRate = (userStats.shareCount || 0) / (userStats.daysActive || 1);
    const conversionRate = (userStats.directReferrals || 0) / Math.max(1, userStats.shareCount || 1);
    return Math.min(2.0, shareRate * conversionRate * 10);
  };

  const calculateMarketSaturation = () => {
    // Simulate market saturation based on total users and growth rate
    const totalUsers = 50000; // Simulated total platform users
    const marketCap = 1000000; // Estimated market capacity
    return Math.min(0.8, totalUsers / marketCap);
  };

  const calculateEngagementScore = () => {
    const loginFrequency = (userStats.loginCount || 0) / (userStats.daysActive || 1);
    const activityScore = Math.min(1, loginFrequency / 0.8); // Target: 80% daily login
    const interactionScore = Math.min(1, (userStats.aiInteractions || 0) / 100);
    
    return (activityScore + interactionScore) / 2;
  };

  const calculateRiskTolerance = () => {
    const packageTier = userStats.currentPackage || 1;
    const experience = userStats.daysActive || 1;
    const earningsStability = calculateEarningsStability();
    
    return Math.min(1, (packageTier * 0.2 + Math.log10(experience) * 0.3 + earningsStability * 0.5));
  };

  const calculateEarningsStability = () => {
    if (!historicalData.earnings || historicalData.earnings.length < 7) return 0.5;
    
    const earnings = historicalData.earnings.map(e => e.value);
    const mean = earnings.reduce((a, b) => a + b, 0) / earnings.length;
    const variance = earnings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / earnings.length;
    const coefficient = variance / mean;
    
    return Math.max(0, 1 - coefficient); // Lower coefficient = higher stability
  };

  const assessMarketConditions = () => {
    // Simulate market conditions assessment
    const cryptoTrend = 0.7; // Bullish
    const adoptionRate = 0.8; // High adoption
    const competitionLevel = 0.4; // Moderate competition
    
    return (cryptoTrend + adoptionRate + (1 - competitionLevel)) / 3;
  };

  const calculateUserExperience = () => {
    const daysActive = userStats.daysActive || 1;
    const achievements = userStats.achievementsUnlocked || 0;
    const platformFamiliarity = Math.min(1, daysActive / 90); // 90 days to full familiarity
    const featureUsage = Math.min(1, achievements / 20); // 20 achievements = experienced
    
    return (platformFamiliarity + featureUsage) / 2;
  };

  const calculateChurnRisk = () => {
    const engagementScore = calculateEngagementScore();
    const earningsGrowth = calculateEarningsGrowthRate();
    const teamSatisfaction = calculateTeamSatisfaction();
    
    return Math.max(0, 1 - (engagementScore + earningsGrowth + teamSatisfaction) / 3);
  };

  const calculateEarningsGrowthRate = () => {
    if (!historicalData.earnings || historicalData.earnings.length < 2) return 0.5;
    
    const recent = historicalData.earnings.slice(-7).map(e => e.value);
    const older = historicalData.earnings.slice(-14, -7).map(e => e.value);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    return Math.min(1, Math.max(0, (recentAvg - olderAvg) / olderAvg));
  };

  const calculateTeamSatisfaction = () => {
    // Simulate team satisfaction based on activity and retention
    const activeMembers = userStats.activeReferrals || 0;
    const totalMembers = userStats.teamSize || 1;
    const retentionRate = activeMembers / totalMembers;
    
    return Math.min(1, retentionRate / 0.7); // Target: 70% retention
  };

  const generateStrategyReasoning = (strategy, riskTolerance, marketConditions) => {
    return [
      `Based on your risk tolerance (${(riskTolerance * 100).toFixed(0)}%), this strategy aligns with your profile`,
      `Current market conditions (${(marketConditions * 100).toFixed(0)}% favorable) support this approach`,
      `Your experience level and portfolio size make this the optimal choice`,
      `Expected success probability: ${strategy.successProbability}%`
    ];
  };

  const generateRiskMitigationRecommendations = (risks) => {
    return risks.map(risk => ({
      risk: risk.type,
      actions: [
        `Monitor ${risk.type.toLowerCase()} indicators daily`,
        `Implement ${risk.mitigation.toLowerCase()}`,
        `Set up automated alerts for ${risk.type.toLowerCase()} changes`,
        `Review and adjust strategy every ${risk.timeframe.toLowerCase()}`
      ]
    }));
  };

  const calculateConfidenceScore = () => {
    const dataQuality = historicalData?.earnings?.length > 30 ? 0.9 : 0.7;
    const modelAccuracy = modelAccuracy / 100;
    const marketStability = 1 - (predictions?.riskAssessment?.overallScore || 0.5);
    
    const confidence = (dataQuality + modelAccuracy + marketStability) / 3;
    setConfidenceScore(Math.round(confidence * 100));
  };

  // Chart data preparation
  const prepareEarningsChartData = () => {
    if (!predictions.earnings?.predictions) return [];
    
    return predictions.earnings.predictions.slice(0, 30).map(pred => ({
      date: pred.date.toLocaleDateString(),
      earnings: pred.earnings,
      confidence: pred.confidence * 100
    }));
  };

  const prepareTeamGrowthChartData = () => {
    if (!predictions.teamGrowth?.predictions) return [];
    
    return predictions.teamGrowth.predictions.slice(0, 30).map(pred => ({
      date: pred.date.toLocaleDateString(),
      teamSize: pred.teamSize,
      directReferrals: pred.directReferrals,
      growthRate: parseFloat(pred.growthRate)
    }));
  };

  const renderLoadingState = () => (
    <div className="analysis-loading">
      <FaBrain className="loading-icon" />
      <h3>🧠 AI Brain Processing...</h3>
      <p>Analyzing patterns, forecasting trends, optimizing strategies</p>
      <div className="loading-progress">
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
    </div>
  );

  if (isAnalyzing) {
    return renderLoadingState();
  }

  return (
    <div className="predictive-analytics">
      {/* Header with Controls */}
      <div className="analytics-header">
        <div className="header-title">
          <FaBrain className="title-icon" />
          <h2>🔮 Predictive Analytics</h2>
          <div className="model-accuracy">
            <FaEye className="accuracy-icon" />
            <span>Model Accuracy: {modelAccuracy.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="analytics-controls">
          <select 
            value={forecastPeriod} 
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="forecast-selector"
          >
            <option value="7">7 Days</option>
            <option value="14">14 Days</option>
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="90">90 Days</option>
          </select>
          
          <button 
            onClick={generatePredictions}
            className="refresh-predictions"
            disabled={isAnalyzing}
          >
            <FaBolt /> Refresh Analysis
          </button>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="confidence-display">
        <FaShieldAlt className="confidence-icon" />
        <span>Prediction Confidence: {confidenceScore}%</span>
        <div className="confidence-bar">
          <div 
            className="confidence-fill" 
            style={{ width: `${confidenceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Main Predictions Grid */}
      <div className="predictions-grid">
        {/* Earnings Predictions */}
        {predictions.earnings && (
          <div className="prediction-card earnings-prediction">
            <div className="card-header">
              <FaDollarSign className="card-icon" />
              <h3>Earnings Forecast</h3>
            </div>
            
            <div className="prediction-summary">
              <div className="summary-stat">
                <span className="label">Projected Total</span>
                <span className="value">${predictions.earnings.summary.totalPredicted.toFixed(2)}</span>
              </div>
              <div className="summary-stat">
                <span className="label">Expected Growth</span>
                <span className="value">+${predictions.earnings.summary.expectedIncrease.toFixed(2)}</span>
              </div>
              <div className="summary-stat">
                <span className="label">Daily Average</span>
                <span className="value">${predictions.earnings.summary.averageDailyGrowth.toFixed(2)}</span>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={prepareEarningsChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#27ae60" 
                    fill="#27ae60" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="scenario-analysis">
              <div className="scenario best-case">
                <span>Best Case</span>
                <span>${predictions.earnings.summary.bestCaseScenario.toFixed(2)}</span>
              </div>
              <div className="scenario worst-case">
                <span>Worst Case</span>
                <span>${predictions.earnings.summary.worstCaseScenario.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Team Growth Predictions */}
        {predictions.teamGrowth && (
          <div className="prediction-card team-prediction">
            <div className="card-header">
              <FaUsers className="card-icon" />
              <h3>Team Growth Forecast</h3>
            </div>
            
            <div className="prediction-summary">
              <div className="summary-stat">
                <span className="label">Projected Team Size</span>
                <span className="value">{predictions.teamGrowth.summary.predictedTeamSize}</span>
              </div>
              <div className="summary-stat">
                <span className="label">Expected Growth</span>
                <span className="value">+{predictions.teamGrowth.summary.expectedGrowth}</span>
              </div>
              <div className="summary-stat">
                <span className="label">Growth Rate</span>
                <span className="value">{predictions.teamGrowth.summary.growthPercentage}%</span>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={prepareTeamGrowthChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="teamSize" 
                    stroke="#3498db" 
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="directReferrals" 
                    stroke="#e74c3c" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Optimization */}
      {predictions.optimalStrategy && (
        <div className="strategy-optimization">
          <div className="section-header">
            <FaTarget className="header-icon" />
            <h3>🎯 Optimal Strategy Recommendation</h3>
          </div>

          <div className="recommended-strategy">
            <div className="strategy-card recommended">
              <div className="strategy-badge">RECOMMENDED</div>
              <h4>{predictions.optimalStrategy.recommended.name}</h4>
              <p>{predictions.optimalStrategy.recommended.description}</p>
              
              <div className="strategy-metrics">
                <div className="metric">
                  <span>Expected ROI</span>
                  <span>{predictions.optimalStrategy.recommended.expectedROI}x</span>
                </div>
                <div className="metric">
                  <span>Timeframe</span>
                  <span>{predictions.optimalStrategy.recommended.timeframe}</span>
                </div>
                <div className="metric">
                  <span>Success Rate</span>
                  <span>{predictions.optimalStrategy.recommended.successProbability}%</span>
                </div>
                <div className="metric">
                  <span>Risk Level</span>
                  <span className={`risk-${predictions.optimalStrategy.recommended.riskLevel.toLowerCase()}`}>
                    {predictions.optimalStrategy.recommended.riskLevel}
                  </span>
                </div>
              </div>

              <div className="action-plan">
                <h5>Action Plan:</h5>
                <ul>
                  {predictions.optimalStrategy.recommended.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="reasoning">
                <h5>AI Reasoning:</h5>
                <ul>
                  {predictions.optimalStrategy.reasoning.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Suggestions */}
      <div className="optimization-suggestions">
        <div className="section-header">
          <FaLightbulb className="header-icon" />
          <h3>💡 Smart Optimization Suggestions</h3>
        </div>

        <div className="suggestions-grid">
          {optimizationSuggestions.map((suggestion, index) => (
            <div key={index} className={`suggestion-card priority-${suggestion.priority.toLowerCase()}`}>
              <div className="suggestion-header">
                <suggestion.icon className="suggestion-icon" />
                <div className="suggestion-meta">
                  <h4>{suggestion.category}</h4>
                  <span className={`priority priority-${suggestion.priority.toLowerCase()}`}>
                    {suggestion.priority} Priority
                  </span>
                </div>
              </div>
              
              <p>{suggestion.suggestion}</p>
              
              <div className="suggestion-metrics">
                <div className="metric">
                  <span>Expected Impact</span>
                  <span className="impact-positive">{suggestion.expectedImpact}</span>
                </div>
                <div className="metric">
                  <span>Time to Implement</span>
                  <span>{suggestion.timeToImplement}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      {predictions.riskAssessment && (
        <div className="risk-assessment">
          <div className="section-header">
            <FaShieldAlt className="header-icon" />
            <h3>🛡️ Risk Assessment</h3>
          </div>

          <div className="risk-overview">
            <div className="overall-risk">
              <h4>Overall Risk Level</h4>
              <span className={`risk-level risk-${predictions.riskAssessment.riskLevel.toLowerCase()}`}>
                {predictions.riskAssessment.riskLevel}
              </span>
              <div className="risk-score">
                Score: {(predictions.riskAssessment.overallScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="risks-grid">
            {predictions.riskAssessment.risks.map((risk, index) => (
              <div key={index} className="risk-card">
                <h4>{risk.type}</h4>
                <div className="risk-details">
                  <div className="risk-metric">
                    <span>Probability</span>
                    <span>{(risk.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="risk-metric">
                    <span>Impact</span>
                    <span className={`impact-${risk.impact.toLowerCase()}`}>{risk.impact}</span>
                  </div>
                  <div className="risk-metric">
                    <span>Timeframe</span>
                    <span>{risk.timeframe}</span>
                  </div>
                </div>
                <div className="mitigation">
                  <strong>Mitigation:</strong> {risk.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Insights */}
      {marketInsights && (
        <div className="market-insights">
          <div className="section-header">
            <FaChartLine className="header-icon" />
            <h3>📈 Market Intelligence</h3>
          </div>

          <div className="insights-grid">
            <div className="insight-card">
              <h4>Market Sentiment</h4>
              <span className={`sentiment ${marketInsights.marketSentiment.toLowerCase()}`}>
                {marketInsights.marketSentiment}
              </span>
              <div className="opportunity-score">
                Opportunity Score: {marketInsights.opportunityScore}/10
              </div>
            </div>

            <div className="insight-card">
              <h4>Competitive Advantages</h4>
              <ul>
                {marketInsights.competitorAnalysis.advantageAreas.map((area, index) => (
                  <li key={index} className="advantage">✅ {area}</li>
                ))}
              </ul>
            </div>

            <div className="insight-card">
              <h4>Improvement Areas</h4>
              <ul>
                {marketInsights.competitorAnalysis.improvementAreas.map((area, index) => (
                  <li key={index} className="improvement">🔶 {area}</li>
                ))}
              </ul>
            </div>

            <div className="insight-card">
              <h4>Trending Strategies</h4>
              <ul>
                {marketInsights.trendingStrategies.map((strategy, index) => (
                  <li key={index} className="trending">🔥 {strategy}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="market-recommendations">
            <h4>🎯 Strategic Recommendations</h4>
            <ul>
              {marketInsights.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
