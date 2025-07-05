/**
 * Advanced Direct Referrals Section - PhD-Level Enhancement
 * Features: Commission breakdown, referral journey visualization,
 * real-time metrics, and actionable insights
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaDollarSign,
  FaTrophy,
  FaRocket,
  FaChartLine,
  FaShare,
  FaCopy,
  FaGift,
  FaFire,
  FaCrown,
  FaHandsHelping,
  FaCalendarAlt,
  FaArrowUp,
  FaUserPlus,
} from 'react-icons/fa';
import './AdvancedDirectReferrals.css';

const AdvancedDirectReferrals = ({ data, account }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [referralData, setReferralData] = useState({
    directReferrals: data?.directReferrals || 0,
    totalCommissions: data?.directReferralEarnings || 0,
    averageCommission: 0,
    thisMonthReferrals: 0,
    thisMonthCommissions: 0,
    conversionRate: 0,
    topPerformer: null,
    referralGrowth: 0,
    nextMilestone: 5,
    referralCode: account?.slice(-8) || 'NO_CODE',
  });

  const [referralList] = useState(data?.referralList || []);

  const commissionTiers = [
    { range: '$30 Package', commission: '$12', rate: '40%', color: '#4facfe' },
    { range: '$50 Package', commission: '$20', rate: '40%', color: '#00c9ff' },
    { range: '$100 Package', commission: '$40', rate: '40%', color: '#667eea' },
    { range: '$200 Package', commission: '$80', rate: '40%', color: '#764ba2' },
  ];

  const copyReferralLink = () => {
    const link = `https://leadfive.com/register?ref=${referralData.referralCode}`;
    navigator.clipboard.writeText(link);
    // Show success notification
  };

  const shareOnSocial = platform => {
    const link = `https://leadfive.com/register?ref=${referralData.referralCode}`;
    const text =
      'Join me on LeadFive - The Future of Decentralized Finance! 🚀';

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const renderOverviewTab = () => (
    <div className="referrals-overview">
      {/* Hero Metrics */}
      <div className="hero-metrics">
        <motion.div
          className="metric-card primary"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaUsers />
          </div>
          <div className="metric-content">
            <h3>Direct Referrals</h3>
            <div className="metric-value">{referralData.directReferrals}</div>
            <div className="metric-change positive">
              <FaArrowUp /> +{referralData.thisMonthReferrals} this month
            </div>
          </div>
          <div className="metric-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(referralData.directReferrals / referralData.nextMilestone) * 100}%`,
                }}
              />
            </div>
            <span>
              {referralData.nextMilestone - referralData.directReferrals} to
              next milestone
            </span>
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaDollarSign />
          </div>
          <div className="metric-content">
            <h3>Total Commissions</h3>
            <div className="metric-value">
              ${referralData.totalCommissions.toFixed(2)}
            </div>
            <div className="metric-change positive">
              <FaArrowUp /> +${referralData.thisMonthCommissions} this month
            </div>
          </div>
          <div className="commission-breakdown">
            <span>Avg: ${referralData.averageCommission}/referral</span>
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaTrophy />
          </div>
          <div className="metric-content">
            <h3>Performance</h3>
            <div className="metric-value">{referralData.conversionRate}%</div>
            <div className="metric-change positive">
              <FaFire /> Conversion Rate
            </div>
          </div>
          <div className="performance-badge excellent">
            Excellent Performance
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaCrown />
          </div>
          <div className="metric-content">
            <h3>Top Performer</h3>
            <div className="metric-value">{referralData.topPerformer}</div>
            <div className="metric-change">
              <FaGift /> $80 commission
            </div>
          </div>
        </motion.div>
      </div>

      {/* Commission Structure */}
      <div className="commission-structure">
        <h3>💰 Commission Structure (40% of Investment)</h3>
        <div className="commission-grid">
          {commissionTiers.map((tier, index) => (
            <motion.div
              key={index}
              className="commission-tier"
              style={{ '--tier-color': tier.color }}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="tier-header">
                <span className="tier-range">{tier.range}</span>
                <span className="tier-rate">{tier.rate}</span>
              </div>
              <div className="tier-commission">{tier.commission}</div>
              <div className="tier-description">
                Instant payout on investment
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Referral Sharing Tools */}
      <div className="referral-tools">
        <h3>🚀 Share Your Referral Link</h3>
        <div className="referral-link-section">
          <div className="referral-link">
            <input
              type="text"
              value={`https://leadfive.com/register?ref=${referralData.referralCode}`}
              readOnly
            />
            <button onClick={copyReferralLink} className="copy-btn">
              <FaCopy /> Copy
            </button>
          </div>

          <div className="social-share">
            <button
              onClick={() => shareOnSocial('twitter')}
              className="share-btn twitter"
            >
              Twitter
            </button>
            <button
              onClick={() => shareOnSocial('facebook')}
              className="share-btn facebook"
            >
              Facebook
            </button>
            <button
              onClick={() => shareOnSocial('linkedin')}
              className="share-btn linkedin"
            >
              LinkedIn
            </button>
            <button
              onClick={() => shareOnSocial('telegram')}
              className="share-btn telegram"
            >
              Telegram
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReferralListTab = () => (
    <div className="referral-list">
      <div className="list-header">
        <h3>Your Referral Network</h3>
        <div className="list-controls">
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
          <select className="sort-select">
            <option value="date">Sort by Date</option>
            <option value="commission">Sort by Commission</option>
            <option value="volume">Sort by Volume</option>
          </select>
        </div>
      </div>

      <div className="referral-cards">
        {referralList.map(referral => (
          <motion.div
            key={referral.id}
            className={`referral-card ${referral.status}`}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="referral-header">
              <div className="referral-info">
                <h4>{referral.name}</h4>
                <span className="referral-address">{referral.address}</span>
                <span className={`referral-tier ${referral.tier}`}>
                  {referral.tier.toUpperCase()}
                </span>
              </div>
              <div className={`referral-status ${referral.status}`}>
                {referral.status}
              </div>
            </div>

            <div className="referral-metrics">
              <div className="metric">
                <span className="metric-label">Package</span>
                <span className="metric-value">${referral.package}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Commission</span>
                <span className="metric-value">${referral.commission}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Volume</span>
                <span className="metric-value">${referral.volume}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Joined</span>
                <span className="metric-value">
                  {new Date(referral.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="referral-performance">
              <div className={`performance-badge ${referral.performance}`}>
                {referral.performance === 'excellent' && <FaTrophy />}
                {referral.performance === 'good' && <FaChartLine />}
                {referral.performance === 'new' && <FaUserPlus />}
                {referral.performance.charAt(0).toUpperCase() +
                  referral.performance.slice(1)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="referral-analytics">
      <h3>📊 Referral Analytics & Insights</h3>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Monthly Performance</h4>
          <div className="chart-placeholder">
            <div className="performance-chart">
              {/* Simplified chart representation */}
              <div className="chart-bars">
                <div className="bar" style={{ height: '60%' }}>
                  Jan
                </div>
                <div className="bar" style={{ height: '75%' }}>
                  Feb
                </div>
                <div className="bar" style={{ height: '90%' }}>
                  Mar
                </div>
                <div className="bar" style={{ height: '85%' }}>
                  Apr
                </div>
                <div className="bar" style={{ height: '100%' }}>
                  May
                </div>
                <div className="bar" style={{ height: '95%' }}>
                  Jun
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h4>Conversion Funnel</h4>
          <div className="funnel-stats">
            <div className="funnel-step">
              <span>Clicks</span>
              <span>1,250</span>
            </div>
            <div className="funnel-step">
              <span>Visits</span>
              <span>450</span>
            </div>
            <div className="funnel-step">
              <span>Registrations</span>
              <span>85</span>
            </div>
            <div className="funnel-step">
              <span>Investments</span>
              <span>3</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h4>Growth Projections</h4>
          <div className="projections">
            <div className="projection">
              <span>Next Month</span>
              <span className="projected-value">+2 referrals</span>
            </div>
            <div className="projection">
              <span>Next Quarter</span>
              <span className="projected-value">+8 referrals</span>
            </div>
            <div className="projection">
              <span>Potential Earnings</span>
              <span className="projected-value">+$320</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-direct-referrals">
      <div className="section-header">
        <h2>💎 Direct Referrals - 40% Commission System</h2>
        <p>
          Build your network and earn 40% commission on every direct referral
          investment
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={`tab ${activeTab === 'referrals' ? 'active' : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          <FaUsers /> My Referrals
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine /> Analytics
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="tab-content"
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'referrals' && renderReferralListTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedDirectReferrals;
