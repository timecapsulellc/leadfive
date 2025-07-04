<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import './LevelVisualization.css';

const LevelVisualization = ({ userAddress }) => {
  const [levelData, setLevelData] = useState({
    currentLevel: 1,
    totalEarnings: 0,
    referrals: [],
    levelProgress: [
      { level: 1, earnings: 0, active: true, referrals: 0 },
      { level: 2, earnings: 0, active: false, referrals: 0 },
      { level: 3, earnings: 0, active: false, referrals: 0 },
      { level: 4, earnings: 0, active: false, referrals: 0 },
      { level: 5, earnings: 0, active: false, referrals: 0 },
      { level: 6, earnings: 0, active: false, referrals: 0 },
      { level: 7, earnings: 0, active: false, referrals: 0 },
      { level: 8, earnings: 0, active: false, referrals: 0 },
      { level: 9, earnings: 0, active: false, referrals: 0 },
      { level: 10, earnings: 0, active: false, referrals: 0 }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevelData();
  }, [userAddress]);

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      // Simulate fetching level data
      setTimeout(() => {
        const simulatedData = {
          currentLevel: 3,
          totalEarnings: 150,
          referrals: ['0x123...abc', '0x456...def', '0x789...ghi'],
          levelProgress: [
            { level: 1, earnings: 25, active: true, referrals: 5 },
            { level: 2, earnings: 45, active: true, referrals: 9 },
            { level: 3, earnings: 80, active: true, referrals: 16 },
            { level: 4, earnings: 0, active: false, referrals: 0 },
            { level: 5, earnings: 0, active: false, referrals: 0 },
            { level: 6, earnings: 0, active: false, referrals: 0 },
            { level: 7, earnings: 0, active: false, referrals: 0 },
            { level: 8, earnings: 0, active: false, referrals: 0 },
            { level: 9, earnings: 0, active: false, referrals: 0 },
            { level: 10, earnings: 0, active: false, referrals: 0 }
          ]
        };
        setLevelData(simulatedData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching level data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="level-visualization loading">
        <div className="loading-spinner">Loading Level Data...</div>
      </div>
    );
  }

  return (
    <div className="level-visualization">
      <div className="level-header">
        <h3>Level Income Visualization</h3>
        <div className="level-stats">
          <div className="stat-item">
            <span className="label">Current Level:</span>
            <span className="value">Level {levelData.currentLevel}</span>
          </div>
          <div className="stat-item">
            <span className="label">Total Earnings:</span>
            <span className="value">${levelData.totalEarnings} USDT</span>
          </div>
        </div>
      </div>

      <div className="levels-grid">
        {levelData.levelProgress.map((level) => (
          <div 
            key={level.level} 
            className={`level-card ${level.active ? 'active' : 'inactive'}`}
          >
            <div className="level-number">
              Level {level.level}
            </div>
            <div className="level-status">
              {level.active ? (
                <span className="status-active">✅ Active</span>
              ) : (
                <span className="status-inactive">🔒 Locked</span>
              )}
            </div>
            <div className="level-earnings">
              ${level.earnings} USDT
            </div>
            <div className="level-referrals">
              {level.referrals} referrals
            </div>
            <div className="level-info">
              <small>$5 per registration</small>
            </div>
          </div>
        ))}
      </div>

      <div className="level-explanation">
        <h4>How Level Income Works</h4>
        <ul>
          <li>Earn $5 for each registration on every level (1-10)</li>
          <li>Direct referrals go to Level 1</li>
          <li>Their referrals go to your Level 2, and so on</li>
          <li>Maximum earnings potential: $153,600</li>
          <li>Joining amount: $50 USDT</li>
        </ul>
=======
import React from 'react';
import { FaTrophy, FaChartLine, FaUsers } from 'react-icons/fa';

const LevelVisualization = ({ data, account }) => {
  const { currentLevel, currentTier } = data || { currentLevel: 1, currentTier: 1 };
  
  // Define levels and their requirements
  const levels = [
    { level: 1, referrals: 0, reward: '0%' },
    { level: 2, referrals: 3, reward: '2%' },
    { level: 3, referrals: 6, reward: '3%' },
    { level: 4, referrals: 9, reward: '4%' },
    { level: 5, referrals: 12, reward: '5%' }
  ];

  return (
    <div className="level-visualization-container">
      <h3 className="section-title">
        <FaChartLine /> Community Levels
      </h3>
      
      <div className="level-progress">
        <div className="current-level">
          <span className="level-badge">Level {currentLevel}</span>
          <span className="tier-badge">Tier {currentTier}</span>
        </div>
        
        <div className="level-track">
          {levels.map((level, index) => (
            <div 
              key={`level-${level.level}`}
              className={`level-marker ${currentLevel >= level.level ? 'active' : ''}`}
            >
              <div className="level-marker-inner">
                {currentLevel === level.level && (
                  <div className="current-marker"></div>
                )}
              </div>
              <div className="level-info">
                <span className="level-number">{level.level}</span>
                <div className="level-tooltip">
                  <strong>Level {level.level}</strong>
                  <p>Required Referrals: {level.referrals}</p>
                  <p>Level Bonus: {level.reward}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="level-details">
        <div className="level-requirements">
          <h4>Current Level Requirements</h4>
          <p>Direct Referrals: {levels[currentLevel - 1]?.referrals || 0}</p>
          <p>Level Bonus: {levels[currentLevel - 1]?.reward || '0%'}</p>
        </div>
        
        <div className="next-level">
          <h4>Next Level</h4>
          {currentLevel < 5 ? (
            <>
              <p>Direct Referrals Needed: {levels[currentLevel]?.referrals || 0}</p>
              <p>Level Bonus: {levels[currentLevel]?.reward || '0%'}</p>
            </>
          ) : (
            <p>Maximum level reached! <FaTrophy className="trophy-icon" /></p>
          )}
        </div>
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
      </div>
    </div>
  );
};

export default LevelVisualization;
