import React, { useState, useEffect } from 'react';
import './EarningsAnalytics.css';

const EarningsAnalytics = ({ wallet, contract }) => {
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    directSales: 0,
    levelEarnings: 0,
    recyclingBonus: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    projectedAnnual: 0,
    recyclingCount: 0,
    currentLevel: 1,
    completedCycles: 0,
    activeLevels: []
  });

  const [analyticsMode, setAnalyticsMode] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet?.account && contract) {
      fetchEarningsData();
    }
  }, [wallet?.account, contract, timeRange]);

  const fetchEarningsData = async () => {
    setLoading(true);
    try {
      // Simulate API calls to smart contract
      const mockData = {
        totalEarnings: 2850.75,
        directSales: 1200.00,
        levelEarnings: 1350.75,
        recyclingBonus: 300.00,
        weeklyGrowth: 12.5,
        monthlyGrowth: 48.2,
        projectedAnnual: 15420.00,
        recyclingCount: 3,
        currentLevel: 4,
        completedCycles: 7,
        activeLevels: [1, 2, 3, 4]
      };
      
      setEarningsData(mockData);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➡️';
  };

  const renderOverview = () => (
    <div className="analytics-overview">
      <div className="earnings-cards">
        <div className="earning-card total">
          <div className="card-header">
            <h3>💰 Total Earnings</h3>
            <span className="growth-indicator positive">
              {getGrowthIcon(earningsData.weeklyGrowth)} +{earningsData.weeklyGrowth}%
            </span>
          </div>
          <div className="card-value">{formatCurrency(earningsData.totalEarnings)}</div>
          <div className="card-subtitle">All-time earnings</div>
        </div>

        <div className="earning-card direct">
          <div className="card-header">
            <h3>🎯 Direct Sales</h3>
          </div>
          <div className="card-value">{formatCurrency(earningsData.directSales)}</div>
          <div className="card-subtitle">From direct referrals</div>
        </div>

        <div className="earning-card level">
          <div className="card-header">
            <h3>🌳 Level Earnings</h3>
          </div>
          <div className="card-value">{formatCurrency(earningsData.levelEarnings)}</div>
          <div className="card-subtitle">Level {earningsData.currentLevel}</div>
        </div>

        <div className="earning-card help-pool">
          <div className="card-header">
            <h3>🎁 Help Pool Bonus</h3>
          </div>
          <div className="card-value">{formatCurrency(earningsData.recyclingBonus)}</div>
          <div className="card-subtitle">{earningsData.recyclingCount} cycles completed</div>
        </div>
      </div>

      <div className="growth-metrics">
        <div className="metric">
          <span className="metric-label">Weekly Growth</span>
          <span className="metric-value positive">+{earningsData.weeklyGrowth}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Monthly Growth</span>
          <span className="metric-value positive">+{earningsData.monthlyGrowth}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Projected Annual</span>
          <span className="metric-value">{formatCurrency(earningsData.projectedAnnual)}</span>
        </div>
      </div>
    </div>
  );

  const renderLevelProgress = () => (
    <div className="level-progress">
      <h3>🌳 Level Progress</h3>
      <div className="levels-grid">
        {[1, 2, 3, 4, 5, 6].map(level => (
          <div 
            key={level} 
            className={`level-card ${earningsData.activeLevels.includes(level) ? 'active' : 'inactive'}`}
          >
            <div className="level-number">Level {level}</div>
            <div className="level-status">
              {earningsData.activeLevels.includes(level) ? '✅ Active' : '🔒 Locked'}
            </div>
            <div className="level-reward">
              ${(100 * Math.pow(2, level - 1)).toFixed(0)} USDT
            </div>
          </div>
        ))}
      </div>
      
      <div className="recycling-tracker">
        <h4>🎁 Help Pool Tracker</h4>
        <div className="help-pool-stats">
          <div className="stat">
            <span>Pool Qualifications</span>
            <span>{earningsData.completedCycles}</span>
          </div>
          <div className="stat">
            <span>Current Level</span>
            <span>Level {earningsData.currentLevel}</span>
          </div>
          <div className="stat">
            <span>Next Qualification</span>
            <span>2 referrals remaining</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPredictiveAnalytics = () => (
    <div className="predictive-analytics">
      <h3>🔮 Predictive Analytics</h3>
      <div className="predictions">
        <div className="prediction-card">
          <h4>Next 30 Days</h4>
          <div className="prediction-value">{formatCurrency(earningsData.totalEarnings * 0.15)}</div>
          <div className="confidence">85% confidence</div>
        </div>
        <div className="prediction-card">
          <h4>Next 90 Days</h4>
          <div className="prediction-value">{formatCurrency(earningsData.totalEarnings * 0.45)}</div>
          <div className="confidence">78% confidence</div>
        </div>
        <div className="prediction-card">
          <h4>Year End</h4>
          <div className="prediction-value">{formatCurrency(earningsData.projectedAnnual)}</div>
          <div className="confidence">65% confidence</div>
        </div>
      </div>
      
      <div className="growth-factors">
        <h4>Growth Factors</h4>
        <div className="factors-list">
          <div className="factor">
            <span>🎯 Referral Activity</span>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '75%' }}></div>
            </div>
            <span>75%</span>
          </div>
          <div className="factor">
            <span>🌳 Level Position</span>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '60%' }}></div>
            </div>
            <span>60%</span>
          </div>
          <div className="factor">
            <span>🎁 Help Pool Rate</span>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '85%' }}></div>
            </div>
            <span>85%</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="earnings-analytics card">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading earnings analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="earnings-analytics card">
      <div className="analytics-header">
        <h2>📊 Comprehensive Earnings Analytics</h2>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="mode-tabs">
            <button 
              className={analyticsMode === 'overview' ? 'active' : ''}
              onClick={() => setAnalyticsMode('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={analyticsMode === 'level' ? 'active' : ''}
              onClick={() => setAnalyticsMode('level')}
            >
              🌳 Level
            </button>
            <button 
              className={analyticsMode === 'predictions' ? 'active' : ''}
              onClick={() => setAnalyticsMode('predictions')}
            >
              🔮 Predictions
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        {analyticsMode === 'overview' && renderOverview()}
        {analyticsMode === 'level' && renderLevelProgress()}
        {analyticsMode === 'predictions' && renderPredictiveAnalytics()}
      </div>
    </div>
  );
};

export default EarningsAnalytics;
