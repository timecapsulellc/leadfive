import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import UnifiedWalletConnect from '../components/unified/UnifiedWalletConnect';
import CommunityLevelsVisualization from '../components/CommunityLevelsVisualization';
import { motion } from 'framer-motion';
import './Genealogy.css';

const Genealogy = ({ account, provider, signer, onConnect, onDisconnect }) => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="genealogy-page">
        {/* Page Header */}
        <motion.div 
          className="page-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1>🌳 Community Levels</h1>
          <p>Visualize and analyze your community structure with advanced insights and real-time analytics.</p>
        </motion.div>

        {/* Wallet Connection */}
        {!account ? (
          <motion.div 
            className="wallet-connect-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="connection-prompt">
              <h3>Connect Your Wallet</h3>
              <p>Connect your wallet to view your community levels and structure.</p>
              <UnifiedWalletConnect 
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                account={account}
                showBalance={true}
              />
            </div>
          </motion.div>
        ) : (
          <>
            {/* Connected User Info */}
            <motion.div 
              className="connected-user-info"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="user-card">
                <div className="user-details">
                  <div className="user-address">
                    <strong>Connected Wallet:</strong>
                    <span className="address-display">
                      {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                    </span>
                  </div>
                  <button onClick={onDisconnect} className="disconnect-btn">
                    Disconnect Wallet
                  </button>
                </div>
                <div className="quick-actions">
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="action-btn primary"
                  >
                    Go to Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/referrals')} 
                    className="action-btn secondary"
                  >
                    View Introductions
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Network Levels Visualization */}
            <motion.div 
              className="community-visualization-section"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <CommunityLevelsVisualization 
                userAddress={account}
                contractInstance={null} // Will be passed from context/provider
                mode="enhanced"
                showControls={true}
                initialDepth={4}
              />
            </motion.div>

            {/* Business Plan Information */}
            <motion.div 
              className="business-info-section"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="info-grid">
                <div className="info-card">
                  <h4>🎯 4X Reward System</h4>
                  <p>Each member can earn up to 4 times their initial membership investment through our comprehensive reward structure.</p>
                  <div className="reward-breakdown">
                    <div className="reward-item">
                      <span className="reward-percentage">40%</span>
                      <span className="reward-name">Direct Community Bonus</span>
                    </div>
                    <div className="reward-item">
                      <span className="reward-percentage">10%</span>
                      <span className="reward-name">Network Level Rewards</span>
                    </div>
                    <div className="reward-item">
                      <span className="reward-percentage">10%</span>
                      <span className="reward-name">Global Network Rewards</span>
                    </div>
                    <div className="reward-item">
                      <span className="reward-percentage">10%</span>
                      <span className="reward-name">Leadership Rewards</span>
                    </div>
                    <div className="reward-item">
                      <span className="reward-percentage">30%</span>
                      <span className="reward-name">Community Growth Pool</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h4>💎 Membership Tiers</h4>
                  <p>Choose the membership level that best fits your goals and unlock increasing earning potential.</p>
                  <div className="tier-list">
                    <div className="tier-item bronze">
                      <span className="tier-name">Bronze</span>
                      <span className="tier-price">$30</span>
                      <span className="tier-max">Max: $120</span>
                    </div>
                    <div className="tier-item silver">
                      <span className="tier-name">Silver</span>
                      <span className="tier-price">$50</span>
                      <span className="tier-max">Max: $200</span>
                    </div>
                    <div className="tier-item gold">
                      <span className="tier-name">Gold</span>
                      <span className="tier-price">$100</span>
                      <span className="tier-max">Max: $400</span>
                    </div>
                    <div className="tier-item diamond">
                      <span className="tier-name">Diamond</span>
                      <span className="tier-price">$200</span>
                      <span className="tier-max">Max: $800</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h4>📊 Collection Rates</h4>
                  <p>Your collection rate improves as you build your community through direct introductions.</p>
                  <div className="collection-rates">
                    <div className="rate-item">
                      <span className="rate-condition">0 Introductions</span>
                      <span className="rate-split">70% Collection / 30% Reinvestment</span>
                    </div>
                    <div className="rate-item">
                      <span className="rate-condition">5+ Introductions</span>
                      <span className="rate-split">80% Collection / 20% Reinvestment</span>
                    </div>
                    <div className="rate-item highlighted">
                      <span className="rate-condition">20+ Introductions</span>
                      <span className="rate-split">90% Collection / 10% Reinvestment</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h4>🏆 Leadership Qualification</h4>
                  <p>Qualify for leadership rewards by building an active community and meeting our qualification criteria.</p>
                  <div className="leadership-requirements">
                    <div className="requirement-item">
                      <span className="requirement-icon">✅</span>
                      <span>Minimum 5 direct introductions</span>
                    </div>
                    <div className="requirement-item">
                      <span className="requirement-icon">✅</span>
                      <span>Minimum community size of 20 members</span>
                    </div>
                    <div className="requirement-item">
                      <span className="requirement-icon">✅</span>
                      <span>Maintain active status</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default Genealogy;