import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaDollarSign, 
  FaUsers, 
  FaChartLine, 
  FaTrophy,
  FaRocket,
  FaBell,
  FaGift,
  FaCalendarAlt,
  FaEye,
  FaShareAlt,
  FaCopy,
  FaDownload,
  FaPlay,
  FaPause,
  FaExpand
} from 'react-icons/fa';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import './EnhancedDashboardOverview.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const EnhancedDashboardOverview = ({ userData, onActionClick }) => {
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [notifications, setNotifications] = useState([]);
  const [currentStats, setCurrentStats] = useState({
    totalEarnings: 1247.65,
    teamSize: 142,
    growthRate: 23.5,
    progressTo4x: 73.2,
    weeklyGrowth: 12.8,
    monthlyProjection: 2456.80
  });

  // Real-time updates simulation
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setCurrentStats(prev => ({
        ...prev,
        totalEarnings: prev.totalEarnings + (Math.random() * 10),
        teamSize: prev.teamSize + (Math.random() > 0.8 ? 1 : 0),
        growthRate: prev.growthRate + (Math.random() - 0.5) * 2,
        progressTo4x: Math.min(100, prev.progressTo4x + Math.random() * 0.5)
      }));

      // Add random notifications
      if (Math.random() > 0.7) {
        const newNotification = {
          id: Date.now(),
          type: Math.random() > 0.5 ? 'earning' : 'referral',
          message: Math.random() > 0.5 
            ? `New referral joined: +$${(Math.random() * 50).toFixed(2)}` 
            : `Matrix spillover: +$${(Math.random() * 25).toFixed(2)}`,
          timestamp: new Date(),
          amount: Math.random() * 50
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  // Chart data
  const earningsChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Earnings',
        data: [45, 67, 89, 56, 78, 92, 134],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Team Earnings',
        data: [23, 34, 45, 28, 39, 46, 67],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const commissionBreakdownData = {
    labels: ['Direct Referrals', 'Level Bonuses', 'Matrix Spillover', 'Leader Pool', 'Help Pool'],
    datasets: [{
      data: [40, 15, 20, 15, 10],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      }
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://leadfive.today/ref/${userData?.referralCode || 'ABC123'}`);
    // Add toast notification
  };

  return (
    <div className="enhanced-dashboard-overview">
      {/* Header Controls */}
      <div className="dashboard-controls">
        <div className="view-controls">
          <button 
            className={`control-btn ${isLiveMode ? 'active' : ''}`}
            onClick={() => setIsLiveMode(!isLiveMode)}
          >
            {isLiveMode ? <FaPause /> : <FaPlay />}
            {isLiveMode ? 'Live' : 'Paused'}
          </button>
          
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        <div className="action-controls">
          <button className="control-btn" onClick={() => window.print()}>
            <FaDownload /> Export
          </button>
          <button className="control-btn">
            <FaExpand /> Fullscreen
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="kpi-grid">
        <motion.div 
          className="kpi-card earnings"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="kpi-header">
            <div className="kpi-icon">
              <FaDollarSign />
            </div>
            <div className="kpi-trend positive">
              +{currentStats.weeklyGrowth.toFixed(1)}%
            </div>
          </div>
          <div className="kpi-value">
            ${currentStats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="kpi-label">Total Earnings</div>
          <div className="kpi-subtitle">
            vs Last Week: +${((currentStats.totalEarnings * currentStats.weeklyGrowth) / 100).toFixed(2)}
          </div>
          <div className="kpi-chart">
            <div className="mini-chart earnings-chart"></div>
          </div>
        </motion.div>

        <motion.div 
          className="kpi-card team"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="kpi-header">
            <div className="kpi-icon">
              <FaUsers />
            </div>
            <div className="kpi-trend positive">
              +{Math.floor(currentStats.teamSize * 0.08)}
            </div>
          </div>
          <div className="kpi-value">{currentStats.teamSize}</div>
          <div className="kpi-label">Team Size</div>
          <div className="kpi-subtitle">
            Direct: {Math.floor(currentStats.teamSize * 0.15)} • Active: {Math.floor(currentStats.teamSize * 0.78)}
          </div>
          <div className="kpi-chart">
            <div className="mini-chart team-chart"></div>
          </div>
        </motion.div>

        <motion.div 
          className="kpi-card growth"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="kpi-header">
            <div className="kpi-icon">
              <FaChartLine />
            </div>
            <div className="kpi-trend positive">
              +{currentStats.growthRate.toFixed(1)}%
            </div>
          </div>
          <div className="kpi-value">{currentStats.growthRate.toFixed(1)}%</div>
          <div className="kpi-label">Growth Rate</div>
          <div className="kpi-subtitle">
            Monthly: +{(currentStats.growthRate * 4).toFixed(1)}% • Projected: ${currentStats.monthlyProjection.toFixed(0)}
          </div>
          <div className="kpi-chart">
            <div className="mini-chart growth-chart"></div>
          </div>
        </motion.div>

        <motion.div 
          className="kpi-card progress"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="kpi-header">
            <div className="kpi-icon">
              <FaTrophy />
            </div>
            <div className="kpi-trend">
              ${(currentStats.totalEarnings * 4 - currentStats.totalEarnings).toFixed(0)} left
            </div>
          </div>
          <div className="kpi-value">{currentStats.progressTo4x.toFixed(1)}%</div>
          <div className="kpi-label">Progress to 4x</div>
          <div className="kpi-subtitle">
            Target: ${(currentStats.totalEarnings * 4).toFixed(0)} • ETA: {Math.ceil((100 - currentStats.progressTo4x) * 2)} days
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${currentStats.progressTo4x}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Earnings Chart */}
        <motion.div 
          className="chart-card earnings-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-header">
            <h3>
              <FaChartLine />
              Earnings Performance
            </h3>
            <div className="chart-controls">
              <button className="chart-btn active">Weekly</button>
              <button className="chart-btn">Monthly</button>
              <button className="chart-btn">Yearly</button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={earningsChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Commission Breakdown */}
        <motion.div 
          className="chart-card commission-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card-header">
            <h3>
              <FaGift />
              Commission Breakdown
            </h3>
            <div className="total-commission">
              ${currentStats.totalEarnings.toFixed(2)}
            </div>
          </div>
          <div className="chart-container">
            <Doughnut 
              data={commissionBreakdownData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'right',
                    labels: {
                      color: '#ffffff',
                      usePointStyle: true,
                      padding: 15,
                      font: {
                        size: 11
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Live Notifications */}
        <motion.div 
          className="notifications-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="card-header">
            <h3>
              <FaBell />
              Live Activity
              {isLiveMode && <span className="live-indicator">🔴 LIVE</span>}
            </h3>
            <button className="clear-btn">Clear All</button>
          </div>
          <div className="notifications-list">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  className={`notification-item ${notification.type}`}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="notification-icon">
                    {notification.type === 'earning' ? <FaDollarSign /> : <FaUsers />}
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {notification.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="notification-amount">
                    +${notification.amount.toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="quick-actions-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="card-header">
            <h3>
              <FaRocket />
              Quick Actions
            </h3>
          </div>
          <div className="actions-grid">
            <button className="action-btn primary" onClick={() => onActionClick?.('withdraw')}>
              <FaDollarSign />
              <span>Withdraw Funds</span>
              <small>${currentStats.totalEarnings.toFixed(2)} available</small>
            </button>
            
            <button className="action-btn secondary" onClick={copyReferralLink}>
              <FaShareAlt />
              <span>Share Referral</span>
              <small>Earn 25% commission</small>
            </button>
            
            <button className="action-btn tertiary" onClick={() => onActionClick?.('upgrade')}>
              <FaRocket />
              <span>Upgrade Package</span>
              <small>Unlock higher earnings</small>
            </button>
            
            <button className="action-btn info" onClick={() => onActionClick?.('team')}>
              <FaUsers />
              <span>View Team</span>
              <small>{currentStats.teamSize} members</small>
            </button>
          </div>
        </motion.div>

        {/* Referral Link Card */}
        <motion.div 
          className="referral-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="card-header">
            <h3>
              <FaShareAlt />
              Your Referral Link
            </h3>
            <div className="referral-stats">
              <span>Views: 247</span>
              <span>Clicks: 89</span>
              <span>Conversions: 12</span>
            </div>
          </div>
          <div className="referral-link-container">
            <div className="referral-link">
              https://leadfive.today/ref/{userData?.referralCode || 'ABC123'}
            </div>
            <button className="copy-btn" onClick={copyReferralLink}>
              <FaCopy />
            </button>
          </div>
          <div className="referral-tools">
            <button className="tool-btn">
              <FaEye />
              Preview
            </button>
            <button className="tool-btn">
              <FaShareAlt />
              Social Share
            </button>
            <button className="tool-btn">
              <FaDownload />
              QR Code
            </button>
          </div>
        </motion.div>

        {/* Achievement Progress */}
        <motion.div 
          className="achievement-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="card-header">
            <h3>
              <FaTrophy />
              Achievement Progress
            </h3>
            <div className="achievement-level">Level 7</div>
          </div>
          <div className="achievements-list">
            {[
              { name: 'First Referral', progress: 100, reward: '$10 Bonus' },
              { name: 'Team Builder', progress: 85, reward: '5% Extra Commission' },
              { name: 'Network Leader', progress: 45, reward: 'Leadership Pool Access' },
              { name: 'Elite Performer', progress: 12, reward: 'VIP Support' }
            ].map((achievement, idx) => (
              <div key={idx} className="achievement-item">
                <div className="achievement-info">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-reward">{achievement.reward}</span>
                </div>
                <div className="achievement-progress">
                  <div className="progress-bar small">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{achievement.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedDashboardOverview;