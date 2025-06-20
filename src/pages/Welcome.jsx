import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Shield, Users, TrendingUp, ChevronRight, Globe } from 'lucide-react';
import WalletConnect from '../components/WalletConnect';
import '../styles/Welcome.css';

const Welcome = ({ onConnect }) => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Transparent",
      description: "Built on BSC blockchain with verified smart contracts"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "5x5 Matrix System",
      description: "Advanced MLM structure with automatic positioning"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Instant Earnings",
      description: "Direct wallet-to-wallet transactions"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Opportunity",
      description: "Join from anywhere, earn in USDT"
    }
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="welcome-header"
        >
          <div className="logo-section">
            <Rocket className="logo-icon" />
            <h1 className="logo-text">LeadFive</h1>
          </div>
          <p className="tagline">Advanced MLM Platform on BSC</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-section"
        >
          <h2 className="hero-title">
            Build Your Financial Future with <span className="highlight">LeadFive</span>
          </h2>
          <p className="hero-description">
            Join the revolutionary 5x5 matrix system powered by smart contracts.
            Earn up to 3,905 USDT per matrix cycle with complete transparency.
          </p>
          
          <div className="cta-section">
            <WalletConnect onConnect={onConnect} />
            <a 
              href="https://bscscan.com/address/0x7FEEA22942407407801cCDA55a4392f25975D998"
              target="_blank"
              rel="noopener noreferrer"
              className="contract-link"
            >
              View Contract <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="features-grid"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="feature-card"
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="footer-info"
        >
          <p className="contract-info">
            Contract: <code>0x7FEEA22942407407801cCDA55a4392f25975D998</code>
          </p>
          <p className="network-info">Network: BSC Mainnet</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
