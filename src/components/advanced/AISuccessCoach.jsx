import React, { useState, useEffect } from 'react';
import { 
  FaRobot, 
  FaLightbulb, 
  FaStar, 
  FaRedo, 
  FaChartLine,
  FaBolt,
  FaTrophy,
  FaBullseye
} from 'react-icons/fa';

const AISuccessCoach = ({ userStats, dashboardData, className = '' }) => {
  const [currentCoaching, setCurrentCoaching] = useState({
    type: 'leadfive-optimization',
    title: 'LeadFive Network Growth Strategy',
    message: "Welcome to your AI Success Coach! Based on your current position, I recommend focusing on team building and package upgrades to maximize your earning potential.",
    actionStep: "Connect with 3 new prospects this week and help them choose the right package level.",
    insight: "Top LeadFive leaders who focus on team growth achieve 45% higher monthly earnings!",
    riskLevel: 'Low',
    expectedGrowth: '25-40%'
  });

  const [earningsForecast] = useState({
    days30: Math.round((dashboardData?.totalEarnings || 0) * 1.3 + 500),
    days90: Math.round((dashboardData?.totalEarnings || 0) * 2.1 + 1800),
    months12: Math.round((dashboardData?.totalEarnings || 0) * 8.5 + 12000),
    growthRate: '32%',
    marketCondition: 'Growing'
  });

  const [coachingTips] = useState([
    {
      category: 'Team Building',
      tip: 'Focus on quality relationships over quantity. Help each team member succeed.',
      impact: 'High'
    },
    {
      category: 'Package Strategy',
      tip: 'Consider upgrading your package level to increase commission rates.',
      impact: 'Medium'
    },
    {
      category: 'Network Health',
      tip: 'Maintain balanced team structure for optimal binary commission earnings.',
      impact: 'High'
    }
  ]);

  // Update coaching advice based on user performance
  useEffect(() => {
    const updateCoaching = () => {
      const totalEarnings = dashboardData?.totalEarnings || 0;
      const teamSize = dashboardData?.daoParticipants || 0;
      const level = dashboardData?.currentLevel || 1;

      if (totalEarnings === 0 && teamSize === 0) {
        setCurrentCoaching({
          type: 'getting-started',
          title: 'Getting Started with LeadFive',
          message: "Perfect timing to start your LeadFive journey! Your AI coach recommends beginning with a solid foundation by choosing the right package and identifying your first prospects.",
          actionStep: "Choose your initial package level and create your first referral strategy.",
          insight: "New LeadFive members who start with a clear plan are 3x more likely to reach their first milestone!",
          riskLevel: 'Low',
          expectedGrowth: 'High Potential'
        });
      } else if (level < 3) {
        setCurrentCoaching({
          type: 'early-growth',
          title: 'Early Growth Phase Strategy',
          message: "You're building momentum! Focus on consistent team building and helping your referrals get started with their own packages.",
          actionStep: "Aim to help 2-3 new team members get their first referral this month.",
          insight: "Members who achieve consistent growth in their first 90 days typically 5x their earnings!",
          riskLevel: 'Low',
          expectedGrowth: '40-60%'
        });
      } else {
        setCurrentCoaching({
          type: 'scaling-success',
          title: 'Scaling Your Success',
          message: "Excellent progress! You're ready to scale your network. Focus on leadership development and advanced compensation plan optimization.",
          actionStep: "Develop 2-3 key leaders in your organization and explore higher package levels.",
          insight: "Top 10% of LeadFive leaders focus on developing other leaders, not just recruiting!",
          riskLevel: 'Low',
          expectedGrowth: '50-80%'
        });
      }
    };

    updateCoaching();
  }, [dashboardData]);

  const refreshCoaching = () => {
    // Simulate new coaching advice
    const tips = [
      {
        title: 'Binary Balance Strategy',
        message: 'Balance your left and right team legs for optimal binary commissions.',
        action: 'Review your team structure and identify which leg needs attention.'
      },
      {
        title: 'Package Upgrade Analysis',
        message: 'Higher package levels unlock increased commission rates and bonuses.',
        action: 'Calculate the ROI of upgrading to the next package level.'
      },
      {
        title: 'Leadership Development',
        message: 'Developing leaders in your team creates residual income growth.',
        action: 'Identify your top 3 performers and provide them with additional training.'
      }
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentCoaching(prev => ({
      ...prev,
      title: randomTip.title,
      message: randomTip.message,
      actionStep: randomTip.action
    }));
  };

  return (
    <div className={`ai-success-coach ${className}`}>
      <div className="coach-header">
        <div className="coach-icon">
          <FaRobot />
        </div>
        <div className="coach-title">
          <h3>AI Success Coach</h3>
          <span className="coaching-badge">LEADFIVE OPTIMIZED</span>
        </div>
        <button className="coach-refresh" onClick={refreshCoaching}>
          <FaRedo />
        </button>
      </div>

      <div className="coaching-content">
        <div className="current-coaching">
          <div className="coaching-type">
            <FaLightbulb />
            <span>{currentCoaching.title}</span>
            <span className={`risk-level ${currentCoaching.riskLevel.toLowerCase()}`}>
              {currentCoaching.riskLevel} Risk
            </span>
          </div>
          
          <p className="coaching-message">{currentCoaching.message}</p>
          
          <div className="action-step">
            <strong>📈 Action Step:</strong>
            <p>{currentCoaching.actionStep}</p>
          </div>
          
          <div className="coach-insight">
            <FaStar className="insight-icon" />
            <span>{currentCoaching.insight}</span>
          </div>
        </div>

        <div className="earnings-forecast">
          <div className="forecast-header">
            <FaChartLine />
            <span>Earnings Projections</span>
            <span className="forecast-badge">AI POWERED</span>
          </div>
          
          <div className="forecast-grid">
            <div className="forecast-item">
              <span className="forecast-period">30 DAYS</span>
              <span className="forecast-amount">${earningsForecast.days30}</span>
              <span className="forecast-growth">Growth: {earningsForecast.growthRate}</span>
            </div>
            <div className="forecast-item">
              <span className="forecast-period">90 DAYS</span>
              <span className="forecast-amount">${earningsForecast.days90}</span>
              <span className="forecast-growth">+{Math.round((earningsForecast.days90 / earningsForecast.days30 - 1) * 100)}%</span>
            </div>
            <div className="forecast-item">
              <span className="forecast-period">12 MONTHS</span>
              <span className="forecast-amount">${earningsForecast.months12}</span>
              <span className="forecast-growth">Target Growth</span>
            </div>
          </div>
          
          <div className="market-indicator">
            <span className="market-label">Market Condition:</span>
            <span className={`market-status ${earningsForecast.marketCondition.toLowerCase()}`}>
              {earningsForecast.marketCondition}
            </span>
          </div>
        </div>

        <div className="coaching-tips">
          <div className="tips-header">
            <FaTrophy />
            <span>Success Tips</span>
          </div>
          <div className="tips-grid">
            {(coachingTips || []).map((tip, index) => (
              <div key={index} className="tip-item">
                <div className="tip-category">
                  <FaBullseye />
                  <span>{tip.category}</span>
                  <span className={`impact-level ${tip.impact.toLowerCase()}`}>
                    {tip.impact} Impact
                  </span>
                </div>
                <p className="tip-content">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-features">
          <span className="ai-feature-label">AI Coach Features:</span>
          <div className="ai-feature-tags">
            <span className="ai-tag active">TEAM ANALYSIS</span>
            <span className="ai-tag active">GROWTH PLANNING</span>
            <span className="ai-tag active">EARNINGS FORECAST</span>
            <span className="ai-tag active">SUCCESS TRACKING</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuccessCoach;
