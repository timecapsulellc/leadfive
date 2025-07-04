import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCrown, 
  FaGem, 
  FaMedal, 
  FaTrophy,
  FaRocket,
  FaCheckCircle,
  FaCalculator,
  FaChartLine,
  FaUsers,
  FaDollarSign
} from 'react-icons/fa';
import './PackageShowcase.css';

const PackageShowcase = ({ onSelectPackage, userAccount }) => {
  const [selectedPackage, setSelectedPackage] = useState(2); // Default to Premium
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStats, setCurrentStats] = useState({
    totalMembers: 12847,
    totalEarnings: 2456789,
    activeMatrices: 8432,
    avgMonthlyGrowth: 23.7
  });

  // Real-time stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStats(prev => ({
        totalMembers: prev.totalMembers + Math.floor(Math.random() * 3),
        totalEarnings: prev.totalEarnings + Math.floor(Math.random() * 1000),
        activeMatrices: prev.activeMatrices + Math.floor(Math.random() * 2),
        avgMonthlyGrowth: prev.avgMonthlyGrowth + (Math.random() - 0.5) * 0.1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const packages = [
    {
      id: 1,
      name: "STARTER",
      icon: FaMedal,
      price: 30,
      popular: false,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      features: {
        directBonus: 20,
        levelBonus: 5,
        uplineBonus: 10,
        leaderPool: 10,
        helpPool: 20,
        clubPool: 5,
        maxEarnings: 120,
        matrixPositions: 2,
        reinvestmentRate: 30
      },
      benefits: [
        "Entry-level network participation",
        "Basic spillover benefits",
        "Community support access",
        "Educational resources",
        "Mobile app access"
      ],
      idealFor: "Beginners exploring MLM",
      roi: "4x return potential"
    },
    {
      id: 2,
      name: "PREMIUM",
      icon: FaGem,
      price: 100,
      popular: true,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      features: {
        directBonus: 25,
        levelBonus: 7,
        uplineBonus: 15,
        leaderPool: 15,
        helpPool: 25,
        clubPool: 7,
        maxEarnings: 400,
        matrixPositions: 6,
        reinvestmentRate: 35
      },
      benefits: [
        "Enhanced earning potential",
        "Priority matrix placement",
        "Advanced analytics dashboard",
        "Personal success coach",
        "Exclusive webinar access",
        "Higher pool distributions"
      ],
      idealFor: "Serious network builders",
      roi: "4x return with bonuses"
    },
    {
      id: 3,
      name: "ELITE",
      icon: FaCrown,
      price: 200,
      popular: false,
      gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      features: {
        directBonus: 30,
        levelBonus: 8,
        uplineBonus: 20,
        leaderPool: 20,
        helpPool: 30,
        clubPool: 8,
        maxEarnings: 800,
        matrixPositions: 14,
        reinvestmentRate: 40
      },
      benefits: [
        "Maximum earning potential",
        "VIP support priority",
        "Custom landing pages",
        "Advanced team tools",
        "Monthly leader calls",
        "Cryptocurrency bonuses",
        "Global recognition program"
      ],
      idealFor: "Professional marketers",
      roi: "4x+ with elite bonuses"
    }
  ];

  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData.id);
    setIsCalculating(true);
    
    setTimeout(() => {
      setIsCalculating(false);
      if (onSelectPackage) {
        onSelectPackage(packageData);
      }
    }, 1500);
  };

  const calculateROI = (packageData, timeframe = 90) => {
    const base = packageData.price;
    const maxReturn = packageData.features.maxEarnings;
    const avgDailyReturn = maxReturn / timeframe;
    
    return {
      daily: avgDailyReturn.toFixed(2),
      monthly: (avgDailyReturn * 30).toFixed(2),
      total: maxReturn,
      breakeven: Math.ceil(base / avgDailyReturn)
    };
  };

  return (
    <section className="package-showcase">
      <div className="container">
        {/* Section Header */}
        <motion.div 
          className="showcase-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Choose Your Success Path</h2>
          <p>Select the perfect package to match your ambition and maximize your earning potential</p>
          
          {/* Live Stats Bar */}
          <div className="live-stats">
            <div className="stat">
              <FaUsers />
              <span>{currentStats.totalMembers.toLocaleString()}</span>
              <label>Active Members</label>
            </div>
            <div className="stat">
              <FaDollarSign />
              <span>${(currentStats.totalEarnings / 1000000).toFixed(1)}M</span>
              <label>Total Earnings</label>
            </div>
            <div className="stat">
              <FaChartLine />
              <span>{currentStats.avgMonthlyGrowth.toFixed(1)}%</span>
              <label>Monthly Growth</label>
            </div>
            <div className="stat">
              <FaRocket />
              <span>{currentStats.activeMatrices.toLocaleString()}</span>
              <label>Active Matrices</label>
            </div>
          </div>
        </motion.div>

        {/* Package Cards */}
        <div className="packages-grid">
          {packages.map((pkg, index) => {
            const roi = calculateROI(pkg);
            const isSelected = selectedPackage === pkg.id;
            
            return (
              <motion.div
                key={pkg.id}
                className={`package-card ${isSelected ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -10 }}
                onClick={() => handlePackageSelect(pkg)}
                viewport={{ once: true }}
              >
                {pkg.popular && (
                  <div className="popular-badge">
                    <FaTrophy /> Most Popular
                  </div>
                )}

                <div className="card-header" style={{ background: pkg.gradient }}>
                  <div className="package-icon">
                    <pkg.icon />
                  </div>
                  <h3>{pkg.name}</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">{pkg.price}</span>
                    <span className="unit">USDT</span>
                  </div>
                  <div className="roi-preview">
                    <span>Max Return: ${pkg.features.maxEarnings}</span>
                  </div>
                </div>

                <div className="card-body">
                  {/* Commission Breakdown */}
                  <div className="commission-breakdown">
                    <h4>Commission Structure</h4>
                    <div className="commission-grid">
                      <div className="commission-item">
                        <span className="label">Direct Bonus</span>
                        <span className="value">{pkg.features.directBonus}%</span>
                      </div>
                      <div className="commission-item">
                        <span className="label">Level Bonus</span>
                        <span className="value">{pkg.features.levelBonus}%</span>
                      </div>
                      <div className="commission-item">
                        <span className="label">Leader Pool</span>
                        <span className="value">{pkg.features.leaderPool}%</span>
                      </div>
                      <div className="commission-item">
                        <span className="label">Help Pool</span>
                        <span className="value">{pkg.features.helpPool}%</span>
                      </div>
                    </div>
                  </div>

                  {/* ROI Calculator */}
                  <div className="roi-calculator">
                    <h4>
                      <FaCalculator /> Earnings Projection
                    </h4>
                    <div className="roi-grid">
                      <div className="roi-item">
                        <span className="period">Daily</span>
                        <span className="amount">${roi.daily}</span>
                      </div>
                      <div className="roi-item">
                        <span className="period">Monthly</span>
                        <span className="amount">${roi.monthly}</span>
                      </div>
                      <div className="roi-item">
                        <span className="period">Breakeven</span>
                        <span className="amount">{roi.breakeven} days</span>
                      </div>
                      <div className="roi-item highlight">
                        <span className="period">Total Max</span>
                        <span className="amount">${roi.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Benefits */}
                  <div className="benefits-list">
                    <h4>Key Benefits</h4>
                    <ul>
                      {pkg.benefits.slice(0, 4).map((benefit, idx) => (
                        <li key={idx}>
                          <FaCheckCircle />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    {pkg.benefits.length > 4 && (
                      <div className="more-benefits">
                        +{pkg.benefits.length - 4} more benefits
                      </div>
                    )}
                  </div>

                  {/* Package Stats */}
                  <div className="package-stats">
                    <div className="stat-row">
                      <span>Matrix Positions</span>
                      <span>{pkg.features.matrixPositions}</span>
                    </div>
                    <div className="stat-row">
                      <span>Reinvestment Rate</span>
                      <span>{pkg.features.reinvestmentRate}%</span>
                    </div>
                    <div className="stat-row">
                      <span>Ideal For</span>
                      <span>{pkg.idealFor}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className={`select-button ${isSelected ? 'selected' : ''}`}
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <div className="spinner"></div>
                        Calculating...
                      </>
                    ) : isSelected ? (
                      <>
                        <FaCheckCircle />
                        Selected
                      </>
                    ) : (
                      <>
                        <FaRocket />
                        Select Package
                      </>
                    )}
                  </button>
                  
                  <div className="package-guarantee">
                    <small>
                      <FaCheckCircle /> {pkg.roi} guaranteed or money back*
                    </small>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <motion.div 
          className="comparison-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3>Package Comparison</h3>
          <div className="comparison-table">
            <div className="table-header">
              <div className="feature-column">Features</div>
              {packages.map(pkg => (
                <div key={pkg.id} className="package-column">
                  <pkg.icon />
                  {pkg.name}
                </div>
              ))}
            </div>
            
            {[
              { label: 'Investment', key: 'price', format: '$' },
              { label: 'Max Return', key: 'maxEarnings', format: '$', path: 'features' },
              { label: 'Direct Bonus', key: 'directBonus', format: '%', path: 'features' },
              { label: 'Level Bonus', key: 'levelBonus', format: '%', path: 'features' },
              { label: 'Leader Pool', key: 'leaderPool', format: '%', path: 'features' },
              { label: 'Help Pool', key: 'helpPool', format: '%', path: 'features' },
              { label: 'Matrix Positions', key: 'matrixPositions', format: '', path: 'features' }
            ].map((feature, idx) => (
              <div key={idx} className="table-row">
                <div className="feature-label">{feature.label}</div>
                {packages.map(pkg => (
                  <div key={pkg.id} className="feature-value">
                    {feature.format}
                    {feature.path ? pkg[feature.path][feature.key] : pkg[feature.key]}
                    {feature.format === '%' ? '%' : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="cta-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3>Ready to Start Your Journey?</h3>
          <p>Join thousands of successful members building generational wealth</p>
          
          <div className="cta-buttons">
            <button className="primary-cta">
              <FaRocket />
              Get Started Now
            </button>
            <button className="secondary-cta">
              <FaCalculator />
              Calculate My Earnings
            </button>
          </div>

          <div className="guarantee-text">
            <FaCheckCircle />
            <span>30-Day Money Back Guarantee • Smart Contract Protected • BSC Verified</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PackageShowcase;