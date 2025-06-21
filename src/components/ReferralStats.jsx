import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserPlus, FaChartLine, FaCopy, FaCheckCircle, FaUserCircle } from 'react-icons/fa';
import './ReferralStats.css';

export default function ReferralStats({ account }) {
  const [stats, setStats] = useState({
    totalReferrals: 156,
    activeReferrals: 89,
    pendingReferrals: 12,
    referralEarnings: 2345.67,
    referralLink: ''
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (account) {
      const baseUrl = window.location.origin;
      setStats(prev => ({
        ...prev,
        referralLink: `${baseUrl}/register?ref=${account.slice(0, 8)}`
      }));
    }
  }, [account]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralData = [
    {
      icon: FaUsers,
      label: 'Total Referrals',
      value: stats.totalReferrals,
      color: '#00D4FF'
    },
    {
      icon: FaUserPlus,
      label: 'Active Referrals',
      value: stats.activeReferrals,
      color: '#7B2CBF'
    },
    {
      icon: FaChartLine,
      label: 'Pending',
      value: stats.pendingReferrals,
      color: '#FF6B35'
    },
    {
      icon: () => '$',
      label: 'Earnings',
      value: `$${stats.referralEarnings}`,
      color: '#00D4FF'
    }
  ];

  return (
    <div className="referral-stats">
      <div className="referral-header">
        <h2>Referral Network</h2>
        <p>Build your team and earn commissions</p>
      </div>

      <div className="referral-stats-grid">
        {referralData.map((item, index) => (
          <div key={index} className="referral-stat-card">
            <div 
              className="stat-icon" 
              style={{ background: `linear-gradient(45deg, ${item.color}22, ${item.color}44)` }}
            >
              <item.icon style={{ color: item.color }} />
            </div>
            <div className="stat-details">
              <p className="stat-label">{item.label}</p>
              <h3 className="stat-value">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="referral-link-section">
        <h3>Your Referral Link</h3>
        <p>Share this link to earn 10% direct referral bonus on every registration!</p>
        <div className="referral-link-box">
          <input 
            type="text" 
            value={stats.referralLink} 
            readOnly 
            className="referral-input"
          />
          <button 
            onClick={copyReferralLink} 
            className="copy-btn"
          >
            {copied ? <FaCheckCircle /> : <FaCopy />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="referral-tree">
        <h3>Recent Referrals</h3>
        <div className="referral-list">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="referral-item">
              <div className="referral-avatar">
                <FaUserCircle />
              </div>
              <div className="referral-info">
                <p className="referral-name">User {index + 1}</p>
                <span className="referral-date">Joined 2 days ago</span>
              </div>
              <div className="referral-status active">
                Active
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
