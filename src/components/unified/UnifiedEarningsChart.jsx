import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

const UnifiedEarningsChart = ({ account, provider, signer, data }) => {
  const [earnings, setEarnings] = useState({
    total: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
    trend: 'up',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarningsData();
  }, [account, provider]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);

      // TODO: Replace with actual smart contract calls
      // For now, using mock data
      const mockEarnings = {
        total: data?.totalEarnings || 1234.56,
        daily: 45.32,
        weekly: 312.87,
        monthly: 1234.56,
        trend: 'up',
      };

      setEarnings(mockEarnings);
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="earnings-chart-container">
        <div className="chart-loading">
          <FaChartLine className="loading-icon" />
          <p>Loading earnings chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="earnings-chart-container">
      <div className="chart-header">
        <h3>
          <FaChartLine />
          Earnings Overview
        </h3>
        <div className="trend-indicator">
          {earnings.trend === 'up' ? (
            <FaArrowUp className="trend-up" />
          ) : (
            <FaArrowDown className="trend-down" />
          )}
        </div>
      </div>

      <div className="earnings-stats">
        <div className="stat-card">
          <div className="stat-label">Total Earnings</div>
          <div className="stat-value">
            <FaDollarSign />${earnings.total.toFixed(2)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Daily</div>
          <div className="stat-value">
            <FaDollarSign />${earnings.daily.toFixed(2)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Weekly</div>
          <div className="stat-value">
            <FaDollarSign />${earnings.weekly.toFixed(2)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Monthly</div>
          <div className="stat-value">
            <FaDollarSign />${earnings.monthly.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="chart-placeholder">
        <FaChartLine className="chart-icon" />
        <p>Detailed chart visualization coming soon...</p>
      </div>
    </div>
  );
};

export default UnifiedEarningsChart;
