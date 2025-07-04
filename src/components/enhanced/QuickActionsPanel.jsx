import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDollarSign, 
  FaUsers, 
  FaRocket, 
  FaShare,
  FaCopy,
  FaDownload,
  FaEye,
  FaChartLine,
  FaGift,
  FaWallet,
  FaQrcode,
  FaTwitter,
  FaFacebook,
  FaTelegram,
  FaWhatsapp,
  FaTrophy
} from 'react-icons/fa';
import './QuickActionsPanel.css';

const QuickActionsPanel = ({ data }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [showReferralTools, setShowReferralTools] = useState(false);
  const [copied, setCopied] = useState(false);

  const quickActions = [
    {
      id: 'withdraw',
      title: 'Withdraw Funds',
      subtitle: `$${data?.totalEarnings?.toFixed(2) || '0.00'} available`,
      icon: FaDollarSign,
      color: '#22c55e',
      action: 'primary',
      disabled: (data?.totalEarnings || 0) < 10
    },
    {
      id: 'refer',
      title: 'Share Referral',
      subtitle: 'Earn 25% commission',
      icon: FaShare,
      color: '#3b82f6',
      action: 'secondary',
      disabled: false
    },
    {
      id: 'upgrade',
      title: 'Upgrade Package',
      subtitle: 'Unlock higher earnings',
      icon: FaRocket,
      color: '#f59e0b',
      action: 'tertiary',
      disabled: (data?.currentPackage || 0) >= 200
    },
    {
      id: 'team',
      title: 'View Team',
      subtitle: `${data?.teamSize || 0} members`,
      icon: FaUsers,
      color: '#8b5cf6',
      action: 'info',
      disabled: false
    }
  ];

  const referralTools = [
    {
      id: 'copy-link',
      title: 'Copy Link',
      icon: FaCopy,
      action: () => copyReferralLink()
    },
    {
      id: 'qr-code',
      title: 'QR Code',
      icon: FaQrcode,
      action: () => generateQRCode()
    },
    {
      id: 'preview',
      title: 'Preview',
      icon: FaEye,
      action: () => previewLanding()
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: FaChartLine,
      action: () => viewAnalytics()
    }
  ];

  const socialShare = [
    {
      platform: 'twitter',
      icon: FaTwitter,
      color: '#1da1f2',
      text: 'Join me on LeadFive and start building your financial future! 🚀'
    },
    {
      platform: 'facebook',
      icon: FaFacebook,
      color: '#4267b2',
      text: 'Discover LeadFive - The future of decentralized network marketing!'
    },
    {
      platform: 'telegram',
      icon: FaTelegram,
      color: '#0088cc',
      text: 'LeadFive is revolutionizing MLM with blockchain technology!'
    },
    {
      platform: 'whatsapp',
      icon: FaWhatsapp,
      color: '#25d366',
      text: 'Check out LeadFive - earn 4x returns with smart contracts!'
    }
  ];

  const copyReferralLink = () => {
    const referralLink = `https://leadfive.today/ref/${data?.referralCode || 'ABC123'}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateQRCode = () => {
    // Implementation for QR code generation
    console.log('Generate QR code for referral link');
  };

  const previewLanding = () => {
    // Implementation for landing page preview
    window.open(`https://leadfive.today/ref/${data?.referralCode || 'ABC123'}`, '_blank');
  };

  const viewAnalytics = () => {
    // Implementation for referral analytics
    console.log('View referral analytics');
  };

  const handleActionClick = (actionId) => {
    setActiveAction(actionId);
    
    switch (actionId) {
      case 'withdraw':
        // Handle withdraw action
        console.log('Withdraw funds');
        break;
      case 'refer':
        setShowReferralTools(true);
        break;
      case 'upgrade':
        // Handle upgrade action
        console.log('Upgrade package');
        break;
      case 'team':
        // Handle team view action
        console.log('View team');
        break;
      default:
        break;
    }
  };

  const shareToSocial = (platform, text) => {
    const referralLink = `https://leadfive.today/ref/${data?.referralCode || 'ABC123'}`;
    const shareText = `${text} ${referralLink}`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="quick-actions-panel">
      <div className="panel-header">
        <h3>
          <FaRocket />
          Quick Actions
        </h3>
        <div className="header-stats">
          <span className="stat">
            <FaWallet />
            ${data?.totalEarnings?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {!showReferralTools ? (
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.id}
              className={`action-btn ${action.action} ${action.disabled ? 'disabled' : ''}`}
              onClick={() => !action.disabled && handleActionClick(action.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!action.disabled ? { 
                scale: 1.05,
                boxShadow: `0 10px 25px ${action.color}30`
              } : {}}
              whileTap={!action.disabled ? { scale: 0.95 } : {}}
              disabled={action.disabled}
            >
              <div 
                className="action-icon"
                style={{ backgroundColor: action.color }}
              >
                <action.icon />
              </div>
              <div className="action-content">
                <span className="action-title">{action.title}</span>
                <small className="action-subtitle">{action.subtitle}</small>
              </div>
              {action.disabled && (
                <div className="disabled-overlay">
                  <small>
                    {action.id === 'withdraw' ? 'Min $10' : 
                     action.id === 'upgrade' ? 'Max Level' : 'N/A'}
                  </small>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="referral-tools-section">
          <div className="section-header">
            <button 
              className="back-btn"
              onClick={() => setShowReferralTools(false)}
            >
              ← Back
            </button>
            <h4>Referral Tools</h4>
          </div>

          {/* Referral Link Display */}
          <div className="referral-link-section">
            <label>Your Referral Link</label>
            <div className="link-container">
              <input 
                type="text" 
                value={`https://leadfive.today/ref/${data?.referralCode || 'ABC123'}`}
                readOnly
                className="referral-input"
              />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyReferralLink}
              >
                {copied ? '✓' : <FaCopy />}
              </button>
            </div>
            {copied && <small className="copy-success">Link copied to clipboard!</small>}
          </div>

          {/* Referral Tools Grid */}
          <div className="tools-grid">
            {referralTools.map((tool, index) => (
              <motion.button
                key={tool.id}
                className="tool-btn"
                onClick={tool.action}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <tool.icon />
                <span>{tool.title}</span>
              </motion.button>
            ))}
          </div>

          {/* Social Sharing */}
          <div className="social-sharing">
            <h5>Share on Social Media</h5>
            <div className="social-grid">
              {socialShare.map((social, index) => (
                <motion.button
                  key={social.platform}
                  className="social-btn"
                  style={{ backgroundColor: social.color }}
                  onClick={() => shareToSocial(social.platform, social.text)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Referral Stats */}
          <div className="referral-stats">
            <h5>Referral Performance</h5>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-value">247</span>
                <span className="stat-label">Views</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">89</span>
                <span className="stat-label">Clicks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">12</span>
                <span className="stat-label">Conversions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">13.5%</span>
                <span className="stat-label">Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="panel-footer">
        <div className="quick-stats">
          <div className="quick-stat">
            <FaGift />
            <span>Next Pool: 2 days</span>
          </div>
          <div className="quick-stat">
            <FaTrophy />
            <span>Rank: Level {data?.currentLevel || 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;