import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import './PerformanceMetrics.css';

export default function PerformanceMetrics({ detailed = false }) {
  const metrics = [
    {
      label: 'Monthly Growth',
      value: '24.5%',
      trend: 'up',
      description: 'Network expansion rate'
    },
    {
      label: 'Conversion Rate',
      value: '18.2%',
      trend: 'up',
      description: 'Referral to active ratio'
    },
    {
      label: 'Avg. Daily Earnings',
      value: '$123.45',
      trend: 'up',
      description: 'Rolling 30-day average'
    },
    {
      label: 'Team Activity',
      value: '89%',
      trend: 'down',
      description: 'Active members percentage'
    }
  ];

  const detailedMetrics = [
    {
      category: 'Network Performance',
      items: [
        { label: 'Total Network Size', value: '892 members', change: '+45' },
        { label: 'Direct Referrals', value: '156', change: '+8' },
        { label: 'Active This Month', value: '89%', change: '-2%' },
        { label: 'Retention Rate', value: '94.2%', change: '+1.2%' }
      ]
    },
    {
      category: 'Earnings Metrics',
      items: [
        { label: 'Total Earned', value: '$4,567.89', change: '+$234.56' },
        { label: 'Avg. Commission', value: '$28.45', change: '+$3.20' },
        { label: 'Best Month', value: '$856.34', change: 'October' },
        { label: 'Growth Rate', value: '24.5%', change: '+2.1%' }
      ]
    },
    {
      category: 'Goal Progress',
      items: [
        { label: 'Next Level Target', value: '78%', progress: 78 },
        { label: 'Monthly Goal', value: '65%', progress: 65 },
        { label: 'Annual Target', value: '42%', progress: 42 },
        { label: 'Team Building', value: '91%', progress: 91 }
      ]
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="trend-icon up" />;
      case 'down':
        return <FaArrowDown className="trend-icon down" />;
      default:
        return <FaMinus className="trend-icon neutral" />;
    }
  };

  const getTrendClass = (trend) => {
    return `metric-trend ${trend}`;
  };

  if (detailed) {
    return (
      <div className="performance-metrics detailed">
        {detailedMetrics.map((category, index) => (
          <div key={index} className="metric-category">
            <h4 className="category-title">{category.category}</h4>
            <div className="category-items">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="detailed-metric-item">
                  <div className="metric-info">
                    <span className="metric-label">{item.label}</span>
                    <span className="metric-value">{item.value}</span>
                  </div>
                  {item.progress !== undefined ? (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{item.progress}%</span>
                    </div>
                  ) : (
                    <span className="metric-change">{item.change}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="performance-metrics">
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <span className="metric-label">{metric.label}</span>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="metric-body">
              <h3 className="metric-value">{metric.value}</h3>
              <p className="metric-description">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
