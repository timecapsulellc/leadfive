import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaCheckCircle, 
  FaUniversity, 
  FaRocket,
  FaCertificate,
  FaLock,
  FaEye,
  FaHandshake
} from 'react-icons/fa';
import './TrustBadgesSection.css';

const TrustBadgesSection = () => {
  const badges = [
    {
      icon: FaShieldAlt,
      title: "Smart Contract Audited",
      description: "PhD-level security analysis completed",
      status: "verified",
      link: "/audit-report"
    },
    {
      icon: FaCheckCircle,
      title: "BSC Mainnet Verified",
      description: "Contract verified on BSCScan",
      status: "verified",
      link: "https://bscscan.com/address/0x29dcCb502D10C042BcC6a02a7762C49595A9E498"
    },
    {
      icon: FaUniversity,
      title: "Regulatory Compliant",
      description: "Legal framework compliance verified",
      status: "verified",
      link: "/compliance"
    },
    {
      icon: FaLock,
      title: "Funds Protected",
      description: "Multi-signature security protocols",
      status: "verified",
      link: "/security"
    },
    {
      icon: FaEye,
      title: "100% Transparent",
      description: "All transactions publicly verifiable",
      status: "verified",
      link: "/transparency"
    },
    {
      icon: FaRocket,
      title: "Production Ready",
      description: "Battle-tested and optimized",
      status: "verified",
      link: "/performance"
    }
  ];

  const stats = [
    {
      icon: FaCertificate,
      value: "$2.5M+",
      label: "Total Value Secured",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      icon: FaHandshake,
      value: "10,000+",
      label: "Active Members",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      icon: FaShieldAlt,
      value: "99.9%",
      label: "Uptime Guarantee",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      icon: FaCheckCircle,
      value: "24/7",
      label: "Security Monitoring",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    }
  ];

  return (
    <section className="trust-badges-section">
      <div className="container">
        {/* Section Header */}
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Built on Trust & Security</h2>
          <p>Enterprise-grade security with complete transparency and regulatory compliance</p>
        </motion.div>

        {/* Trust Badges Grid */}
        <motion.div 
          className="badges-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              className="trust-badge"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              viewport={{ once: true }}
            >
              <div className="badge-icon">
                <badge.icon />
                <div className="verification-check">
                  <FaCheckCircle />
                </div>
              </div>
              <div className="badge-content">
                <h3>{badge.title}</h3>
                <p>{badge.description}</p>
                <a href={badge.link} className="badge-link">
                  Verify <span>→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Security Stats */}
        <motion.div 
          className="security-stats"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3>Security by the Numbers</h3>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                style={{ background: stat.gradient }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                viewport={{ once: true }}
              >
                <div className="stat-icon">
                  <stat.icon />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security Certifications */}
        <motion.div 
          className="certifications"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="cert-logos">
            <div className="cert-logo">
              <img src="/api/placeholder/120/60" alt="BSCScan Verified" />
              <span>BSCScan Verified</span>
            </div>
            <div className="cert-logo">
              <img src="/api/placeholder/120/60" alt="OpenZeppelin Audited" />
              <span>OpenZeppelin Standards</span>
            </div>
            <div className="cert-logo">
              <img src="/api/placeholder/120/60" alt="CertiK Audit" />
              <span>Security Audited</span>
            </div>
            <div className="cert-logo">
              <img src="/api/placeholder/120/60" alt="DeFi Pulse Listed" />
              <span>DeFi Listed</span>
            </div>
          </div>
        </motion.div>

        {/* Real-time Security Status */}
        <motion.div 
          className="security-status"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="status-header">
            <h4>
              <span className="status-indicator active"></span>
              Real-time Security Status
            </h4>
            <span className="last-updated">Last updated: 2 minutes ago</span>
          </div>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Smart Contract</span>
              <span className="status-value operational">Operational</span>
            </div>
            <div className="status-item">
              <span className="status-label">Funds Security</span>
              <span className="status-value operational">Protected</span>
            </div>
            <div className="status-item">
              <span className="status-label">Oracle Feeds</span>
              <span className="status-value operational">Active</span>
            </div>
            <div className="status-item">
              <span className="status-label">Emergency Systems</span>
              <span className="status-value operational">Ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;