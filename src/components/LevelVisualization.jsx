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
      </div>
    </div>
  );
};

export default LevelVisualization;
