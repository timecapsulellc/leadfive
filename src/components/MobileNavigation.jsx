import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaRobot,
  FaNetworkWired,
  FaDollarSign,
  FaUsers,
  FaWallet,
  FaHistory,
  FaTrophy,
  FaCog,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import './MobileNavigation.css';

const MobileNavigation = ({
  activeSection,
  onSectionChange,
  isOpen,
  onToggle,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'ai-insights', label: 'AI', icon: FaRobot },
    { id: 'network', label: 'Network', icon: FaNetworkWired },
    { id: 'earnings', label: 'Earnings', icon: FaDollarSign },
    { id: 'referrals', label: 'Team', icon: FaUsers },
  ];

  const secondaryItems = [
    { id: 'withdrawals', label: 'Withdraw', icon: FaWallet },
    { id: 'activity', label: 'Activity', icon: FaHistory },
    { id: 'performance', label: 'Stats', icon: FaTrophy },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  useEffect(() => {
    // Show mobile nav after component mounts
    setIsVisible(true);
  }, []);

  const handleItemClick = sectionId => {
    onSectionChange(sectionId);
    if (isOpen) {
      onToggle(); // Close expanded menu
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className={`mobile-nav-bar ${isVisible ? 'visible' : ''}`}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            <item.icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        {/* More Menu Button */}
        <button
          className={`mobile-nav-item more-menu ${isOpen ? 'active' : ''}`}
          onClick={onToggle}
        >
          {isOpen ? (
            <FaTimes className="nav-icon" />
          ) : (
            <FaBars className="nav-icon" />
          )}
          <span className="nav-label">More</span>
        </button>
      </div>

      {/* Expanded Menu Overlay */}
      {isOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={onToggle} />
          <div className="mobile-menu-expanded">
            <div className="menu-header">
              <h3>More Options</h3>
              <button className="close-btn" onClick={onToggle}>
                <FaTimes />
              </button>
            </div>

            <div className="menu-items">
              {secondaryItems.map(item => (
                <button
                  key={item.id}
                  className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <item.icon className="item-icon" />
                  <span className="item-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileNavigation;
