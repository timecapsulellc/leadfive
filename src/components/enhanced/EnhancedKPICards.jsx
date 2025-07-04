import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDollarSign, 
  FaUsers, 
  FaChartLine, 
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaInfoCircle
} from 'react-icons/fa';
import './EnhancedKPICards.css';

const EnhancedKPICards = ({ data }) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalEarnings: 0,
    teamSize: 0,
    growthRate: 0,
    progressTo4x: 0
  });

  // Animate numbers on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValues(prev => ({
        totalEarnings: Math.min(prev.totalEarnings + (data.totalEarnings / 50), data.totalEarnings),
        teamSize: Math.min(prev.teamSize + Math.ceil(data.teamSize / 50), data.teamSize),
        growthRate: Math.min(prev.growthRate + 0.5, 23.5),
        progressTo4x: Math.min(prev.progressTo4x + 1.5, 73.2)
      }));
    }, 50);

    const timeout = setTimeout(() => clearInterval(interval), 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [data]);

  const kpiCards = [
    {
      id: 'earnings',
      title: 'Total Earnings',
      value: `$${animatedValues.totalEarnings.toFixed(2)}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: FaDollarSign,
      subtitle: 'vs Last Week',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Total commissions earned across all streams'
    },
    {
      id: 'team',
      title: 'Team Size',
      value: Math.floor(animatedValues.teamSize),
      change: '+8',
      changeType: 'positive',
      icon: FaUsers,
      subtitle: 'New Members',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Direct referrals and team network size'
    },
    {
      id: 'growth',
      title: 'Growth Rate',
      value: `${animatedValues.growthRate.toFixed(1)}%`,
      change: '+3.2%',
      changeType: 'positive',
      icon: FaChartLine,
      subtitle: 'This Week',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Weekly network and earnings growth'
    },
    {
      id: 'progress',
      title: 'Progress to 4x',
      value: `${animatedValues.progressTo4x.toFixed(1)}%`,
      change: `$${(data.maxEarnings - data.totalEarnings).toFixed(0)} left`,
      changeType: 'neutral',
      icon: FaTrophy,
      subtitle: 'Target Achievement',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: 'Progress towards 4x earnings cap'
    }
  ];

  return (
    <div className="enhanced-kpi-cards">
      {kpiCards.map((card, index) => (
        <motion.div
          key={card.id}
          className="kpi-card-enhanced"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }}
          style={{ background: card.color }}
        >
          <div className="kpi-card-header">
            <div className="kpi-icon">
              <card.icon />
            </div>
            <div className="kpi-info">
              <FaInfoCircle />
            </div>
          </div>

          <div className="kpi-content">
            <h3 className="kpi-title">{card.title}</h3>
            <div className="kpi-value">{card.value}</div>
            
            <div className="kpi-change">
              <span className={`change-indicator ${card.changeType}`}>
                {card.changeType === 'positive' ? <FaArrowUp /> : card.changeType === 'negative' ? <FaArrowDown /> : null}
                {card.change}
              </span>
              <span className="change-subtitle">{card.subtitle}</span>
            </div>
          </div>

          <div className="kpi-description">
            {card.description}
          </div>

          {/* Progress bar for progress card */}
          {card.id === 'progress' && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${animatedValues.progressTo4x}%` }}
              ></div>
            </div>
          )}

          {/* Sparkline for other cards */}
          {card.id !== 'progress' && (
            <div className="sparkline">
              <svg width="100" height="30" viewBox="0 0 100 30">
                <path
                  d="M0,20 Q25,15 50,18 T100,12"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          )}

          {/* Animated background pattern */}
          <div className="card-background-pattern">
            <div className="pattern-circle"></div>
            <div className="pattern-circle"></div>
            <div className="pattern-circle"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default EnhancedKPICards;