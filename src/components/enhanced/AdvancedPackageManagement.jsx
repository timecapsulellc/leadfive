/**
 * Advanced Package Management - PhD-Level Enhancement
 * Features: Package comparison, earnings projection, upgrade paths,
 * ROI calculator, and investment strategy recommendations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRocket,
  FaDollarSign,
  FaTrophy,
  FaChartLine,
  FaCalculator,
  FaGift,
  FaCrown,
  FaStar,
  FaArrowUp,
  FaCheckCircle,
  FaLock,
  FaInfoCircle,
  FaLightbulb,
  FaBullseye,
  FaCalendarAlt,
  FaShieldAlt,
  FaUsers,
} from 'react-icons/fa';
import './AdvancedPackageManagement.css';

const AdvancedPackageManagement = ({ data, account }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(100);
  const [projectionPeriod, setProjectionPeriod] = useState(12);

  const packages = [
    {
      id: 'starter',
      name: 'Starter',
      price: 30,
      maxEarnings: 120,
      multiplier: 4,
      features: [
        'Basic referral commissions',
        'Level 1-3 bonuses',
        'Help pool access',
      ],
      color: '#4facfe',
      popular: false,
      recommended: false,
      minReferrals: 0,
      monthlyROI: 15,
      status: 'available',
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 50,
      maxEarnings: 200,
      multiplier: 4,
      features: [
        'Enhanced commissions',
        'Level 1-5 bonuses',
        'Priority help pool',
        'Monthly rewards',
      ],
      color: '#00c9ff',
      popular: true,
      recommended: false,
      minReferrals: 1,
      monthlyROI: 18,
      status: 'available',
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 100,
      maxEarnings: 400,
      multiplier: 4,
      features: [
        'Premium commissions',
        'All level bonuses',
        'VIP help pool',
        'Weekly rewards',
        'Leader pool access',
      ],
      color: '#667eea',
      popular: false,
      recommended: true,
      minReferrals: 2,
      monthlyROI: 22,
      status: 'current',
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 200,
      maxEarnings: 800,
      multiplier: 4,
      features: [
        'Maximum commissions',
        'Unlimited levels',
        'Elite help pool',
        'Daily rewards',
        'Leader status',
        'Exclusive benefits',
      ],
      color: '#764ba2',
      popular: false,
      recommended: false,
      minReferrals: 5,
      monthlyROI: 28,
      status: 'locked',
    },
  ];

  const currentPackage =
    packages.find(p => p.status === 'current') || packages[2];
  const currentEarnings = data?.totalEarnings || 456.78;
  const earningsProgress = (currentEarnings / currentPackage.maxEarnings) * 100;

  const calculateProjections = (packageData, period = 12) => {
    const monthlyEarnings = (packageData.price * packageData.monthlyROI) / 100;
    const totalProjected = monthlyEarnings * period;
    const roi =
      ((totalProjected - packageData.price) / packageData.price) * 100;

    return {
      monthlyEarnings,
      totalProjected,
      roi,
      breakEvenMonths: Math.ceil(packageData.price / monthlyEarnings),
    };
  };

  const renderOverviewTab = () => (
    <div className="package-overview">
      {/* Current Package Status */}
      <div className="current-package-status">
        <motion.div
          className="status-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="status-header">
            <h3>Current Package</h3>
            <div className={`package-badge ${currentPackage.id}`}>
              {currentPackage.name}
            </div>
          </div>

          <div className="status-metrics">
            <div className="metric">
              <div className="metric-value">${currentPackage.price}</div>
              <div className="metric-label">Investment</div>
            </div>
            <div className="metric">
              <div className="metric-value">${currentEarnings.toFixed(2)}</div>
              <div className="metric-label">Earned</div>
            </div>
            <div className="metric">
              <div className="metric-value">${currentPackage.maxEarnings}</div>
              <div className="metric-label">Max Potential</div>
            </div>
            <div className="metric">
              <div className="metric-value">{earningsProgress.toFixed(1)}%</div>
              <div className="metric-label">Progress</div>
            </div>
          </div>

          <div className="earnings-progress">
            <div className="progress-header">
              <span>Earnings Progress</span>
              <span>
                ${(currentPackage.maxEarnings - currentEarnings).toFixed(2)}{' '}
                remaining
              </span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${earningsProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          <div className="package-features">
            <h4>Current Benefits</h4>
            <div className="features-list">
              {currentPackage.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <FaCheckCircle />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Package Comparison Grid */}
      <div className="packages-grid">
        <h3>📦 Available Packages</h3>
        <div className="packages-container">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              className={`package-card ${pkg.id} ${pkg.status}`}
              style={{ '--package-color': pkg.color }}
              whileHover={{ y: pkg.status !== 'locked' ? -5 : 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {pkg.popular && <div className="popular-badge">Most Popular</div>}
              {pkg.recommended && (
                <div className="recommended-badge">Recommended</div>
              )}

              <div className="package-header">
                <h4>{pkg.name}</h4>
                <div className="package-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">{pkg.price}</span>
                </div>
                <div className="package-subtitle">
                  Max Earnings: ${pkg.maxEarnings}
                </div>
              </div>

              <div className="package-roi">
                <div className="roi-item">
                  <FaBullseye />
                  <span>{pkg.monthlyROI}% Monthly ROI</span>
                </div>
                <div className="roi-item">
                  <FaTrophy />
                  <span>{pkg.multiplier}x Multiplier</span>
                </div>
              </div>

              <div className="package-features">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="feature">
                    <FaCheckCircle />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="package-requirements">
                {pkg.minReferrals > 0 && (
                  <div className="requirement">
                    <FaUsers />
                    <span>Min {pkg.minReferrals} referrals</span>
                  </div>
                )}
              </div>

              <div className="package-action">
                {pkg.status === 'current' && (
                  <button className="action-btn current" disabled>
                    <FaCheckCircle /> Current Package
                  </button>
                )}
                {pkg.status === 'available' && (
                  <button
                    className="action-btn upgrade"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <FaArrowUp /> Upgrade Now
                  </button>
                )}
                {pkg.status === 'locked' && (
                  <button className="action-btn locked" disabled>
                    <FaLock /> Requirements Not Met
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upgrade Benefits */}
      <div className="upgrade-benefits">
        <h3>🚀 Why Upgrade?</h3>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaDollarSign />
            </div>
            <h4>Higher Earnings</h4>
            <p>
              Unlock higher commission rates and bonus pools with premium
              packages.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaShieldAlt />
            </div>
            <h4>Exclusive Access</h4>
            <p>Get priority access to special features and premium support.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaCrown />
            </div>
            <h4>Status & Recognition</h4>
            <p>
              Build your reputation with higher tier status and leadership
              opportunities.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaGift />
            </div>
            <h4>Bonus Rewards</h4>
            <p>
              Receive exclusive rewards, bonuses, and early access to new
              features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalculatorTab = () => (
    <div className="roi-calculator">
      <h3>🧮 ROI Calculator & Projections</h3>

      <div className="calculator-grid">
        <div className="calculator-inputs">
          <h4>Investment Parameters</h4>

          <div className="input-group">
            <label>Investment Amount</label>
            <div className="input-with-buttons">
              <button
                onClick={() => setInvestmentAmount(30)}
                className={investmentAmount === 30 ? 'active' : ''}
              >
                $30
              </button>
              <button
                onClick={() => setInvestmentAmount(50)}
                className={investmentAmount === 50 ? 'active' : ''}
              >
                $50
              </button>
              <button
                onClick={() => setInvestmentAmount(100)}
                className={investmentAmount === 100 ? 'active' : ''}
              >
                $100
              </button>
              <button
                onClick={() => setInvestmentAmount(200)}
                className={investmentAmount === 200 ? 'active' : ''}
              >
                $200
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Projection Period (Months)</label>
            <input
              type="range"
              min="1"
              max="24"
              value={projectionPeriod}
              onChange={e => setProjectionPeriod(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-value">{projectionPeriod} months</div>
          </div>
        </div>

        <div className="calculator-results">
          <h4>Projected Returns</h4>
          {packages.map(pkg => {
            if (pkg.price !== investmentAmount) return null;

            const projections = calculateProjections(pkg, projectionPeriod);

            return (
              <div key={pkg.id} className="projection-card">
                <div className="projection-header">
                  <h5>{pkg.name} Package</h5>
                  <div className="package-price">${pkg.price}</div>
                </div>

                <div className="projection-metrics">
                  <div className="projection-metric">
                    <span className="metric-label">Monthly Earnings</span>
                    <span className="metric-value">
                      ${projections.monthlyEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="projection-metric">
                    <span className="metric-label">Total Projected</span>
                    <span className="metric-value">
                      ${projections.totalProjected.toFixed(2)}
                    </span>
                  </div>
                  <div className="projection-metric">
                    <span className="metric-label">ROI</span>
                    <span className="metric-value positive">
                      {projections.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="projection-metric">
                    <span className="metric-label">Break Even</span>
                    <span className="metric-value">
                      {projections.breakEvenMonths} months
                    </span>
                  </div>
                </div>

                <div className="projection-chart">
                  <div className="chart-header">Earnings Timeline</div>
                  <div className="timeline-chart">
                    {Array.from(
                      { length: Math.min(projectionPeriod, 12) },
                      (_, i) => (
                        <div key={i} className="timeline-bar">
                          <div
                            className="bar-fill"
                            style={{
                              height: `${(((i + 1) * projections.monthlyEarnings) / projections.totalProjected) * 100}%`,
                            }}
                          />
                          <span className="bar-label">M{i + 1}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment Strategy */}
      <div className="investment-strategy">
        <h4>💡 Investment Strategy Recommendations</h4>
        <div className="strategy-cards">
          <div className="strategy-card conservative">
            <h5>Conservative Strategy</h5>
            <p>
              Start with the Starter package to minimize risk while learning the
              platform.
            </p>
            <div className="strategy-metrics">
              <span>Risk Level: Low</span>
              <span>Expected ROI: 15-18%</span>
            </div>
          </div>
          <div className="strategy-card balanced">
            <h5>Balanced Strategy</h5>
            <p>
              Professional package offers the best balance of investment and
              returns.
            </p>
            <div className="strategy-metrics">
              <span>Risk Level: Medium</span>
              <span>Expected ROI: 20-25%</span>
            </div>
          </div>
          <div className="strategy-card aggressive">
            <h5>Aggressive Strategy</h5>
            <p>
              Elite package maximizes earning potential for experienced
              investors.
            </p>
            <div className="strategy-metrics">
              <span>Risk Level: High</span>
              <span>Expected ROI: 25-35%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpgradeTab = () => (
    <div className="upgrade-path">
      <h3>📈 Your Upgrade Journey</h3>

      <div className="upgrade-timeline">
        {packages.map((pkg, index) => (
          <div key={pkg.id} className={`timeline-item ${pkg.status}`}>
            <div className="timeline-marker">
              {pkg.status === 'current' && <FaCheckCircle />}
              {pkg.status === 'available' && <FaArrowUp />}
              {pkg.status === 'locked' && <FaLock />}
            </div>
            <div className="timeline-content">
              <h4>{pkg.name} Package</h4>
              <div className="timeline-price">${pkg.price}</div>
              <div className="timeline-benefits">
                <div className="benefit">Max Earnings: ${pkg.maxEarnings}</div>
                <div className="benefit">Monthly ROI: {pkg.monthlyROI}%</div>
              </div>
              {pkg.status === 'locked' && (
                <div className="unlock-requirements">
                  <FaInfoCircle />
                  <span>Requires {pkg.minReferrals} referrals to unlock</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="upgrade-recommendations">
        <h4>🎯 Personalized Recommendations</h4>
        <div className="recommendation-card">
          <div className="recommendation-header">
            <FaLightbulb />
            <h5>Next Step Recommendation</h5>
          </div>
          <p>
            Based on your current performance and earnings of $
            {currentEarnings.toFixed(2)}, we recommend staying with the
            Professional package to maximize your 4x return potential.
          </p>
          <div className="recommendation-action">
            <button className="recommendation-btn">
              Continue with Professional
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-package-management">
      <div className="section-header">
        <h2>📦 Advanced Package Management</h2>
        <p>
          Optimize your investment strategy with intelligent package selection
          and ROI projections
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaRocket /> Overview
        </button>
        <button
          className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <FaCalculator /> ROI Calculator
        </button>
        <button
          className={`tab ${activeTab === 'upgrade' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrade')}
        >
          <FaChartLine /> Upgrade Path
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
          {activeTab === 'calculator' && renderCalculatorTab()}
          {activeTab === 'upgrade' && renderUpgradeTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedPackageManagement;
