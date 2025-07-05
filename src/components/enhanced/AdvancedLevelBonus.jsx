/**
 * Advanced Level Bonus Section - PhD-Level Enhancement
 * Features: Binary tree visualization, level distribution analysis,
 * team building strategies, and performance optimization
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaNetworkWired,
  FaDollarSign,
  FaChartPie,
  FaUsers,
  FaLayerGroup,
  FaTrophy,
  FaArrowUp,
  FaDownload,
  FaExpand,
  FaCompress,
  FaEye,
  FaCalculator,
  FaBullseye,
  FaChartBar,
  FaGlobe,
} from 'react-icons/fa';
import './AdvancedLevelBonus.css';

const AdvancedLevelBonus = ({ data, account }) => {
  const [activeView, setActiveView] = useState('distribution');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [treeExpanded, setTreeExpanded] = useState(false);

  const levelStructure = [
    {
      level: 1,
      percentage: 3.0,
      members: 2,
      volume: 300,
      earnings: 9.0,
      color: '#4facfe',
    },
    {
      level: 2,
      percentage: 2.0,
      members: 4,
      volume: 600,
      earnings: 12.0,
      color: '#00c9ff',
    },
    {
      level: 3,
      percentage: 1.5,
      members: 8,
      volume: 1200,
      earnings: 18.0,
      color: '#667eea',
    },
    {
      level: 4,
      percentage: 1.0,
      members: 6,
      volume: 900,
      earnings: 9.0,
      color: '#764ba2',
    },
    {
      level: 5,
      percentage: 0.8,
      members: 3,
      volume: 450,
      earnings: 3.6,
      color: '#a8edea',
    },
    {
      level: 6,
      percentage: 0.5,
      members: 1,
      volume: 150,
      earnings: 0.75,
      color: '#d299c2',
    },
    {
      level: 7,
      percentage: 0.3,
      members: 1,
      volume: 100,
      earnings: 0.3,
      color: '#ffecd2',
    },
    {
      level: 8,
      percentage: 0.2,
      members: 0,
      volume: 0,
      earnings: 0.0,
      color: '#fcb69f',
    },
    {
      level: 9,
      percentage: 0.1,
      members: 0,
      volume: 0,
      earnings: 0.0,
      color: '#ff9a9e',
    },
    {
      level: 10,
      percentage: 0.1,
      members: 0,
      volume: 0,
      earnings: 0.0,
      color: '#fecfef',
    },
  ];

  const totalLevelEarnings = levelStructure.reduce(
    (sum, level) => sum + level.earnings,
    0
  );
  const totalTeamMembers = levelStructure.reduce(
    (sum, level) => sum + level.members,
    0
  );
  const totalTeamVolume = levelStructure.reduce(
    (sum, level) => sum + level.volume,
    0
  );

  const binaryTreeData = {
    you: {
      name: 'You',
      package: 100,
      volume: 100,
      position: 'root',
    },
    level1: [
      {
        name: 'Alice Chen',
        package: 200,
        volume: 200,
        position: 'left',
        active: true,
      },
      {
        name: 'Bob Wilson',
        package: 100,
        volume: 100,
        position: 'right',
        active: true,
      },
    ],
    level2: [
      {
        name: 'Carol Davis',
        package: 100,
        volume: 100,
        position: 'left-left',
        active: true,
      },
      {
        name: 'David Kim',
        package: 50,
        volume: 50,
        position: 'left-right',
        active: false,
      },
      {
        name: 'Emma Lopez',
        package: 200,
        volume: 200,
        position: 'right-left',
        active: true,
      },
      {
        name: 'Frank Chen',
        package: 100,
        volume: 100,
        position: 'right-right',
        active: true,
      },
    ],
  };

  const calculateLevelPotential = level => {
    const maxPossibleMembers = Math.pow(2, level);
    const currentMembers = levelStructure[level - 1]?.members || 0;
    const fillRate = currentMembers / maxPossibleMembers;
    const potentialEarnings =
      (maxPossibleMembers * 100 * levelStructure[level - 1]?.percentage) / 100;

    return {
      maxPossibleMembers,
      currentMembers,
      fillRate: fillRate * 100,
      potentialEarnings,
      currentEarnings: levelStructure[level - 1]?.earnings || 0,
    };
  };

  const renderDistributionView = () => (
    <div className="level-distribution">
      {/* Overview Cards */}
      <div className="distribution-overview">
        <motion.div
          className="overview-card primary"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="card-icon">
            <FaDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Level Earnings</h3>
            <div className="card-value">${totalLevelEarnings.toFixed(2)}</div>
            <div className="card-meta">From 10 levels (10% pool)</div>
          </div>
        </motion.div>

        <motion.div
          className="overview-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="card-icon">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Team Members</h3>
            <div className="card-value">{totalTeamMembers}</div>
            <div className="card-meta">Across all levels</div>
          </div>
        </motion.div>

        <motion.div
          className="overview-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="card-icon">
            <FaChartBar />
          </div>
          <div className="card-content">
            <h3>Team Volume</h3>
            <div className="card-value">${totalTeamVolume}</div>
            <div className="card-meta">Total investment volume</div>
          </div>
        </motion.div>

        <motion.div
          className="overview-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="card-icon">
            <FaBullseye />
          </div>
          <div className="card-content">
            <h3>Efficiency</h3>
            <div className="card-value">8.5/10</div>
            <div className="card-meta">Level optimization score</div>
          </div>
        </motion.div>
      </div>

      {/* Level Breakdown */}
      <div className="levels-breakdown">
        <h3>📊 Level-by-Level Distribution</h3>
        <div className="levels-grid">
          {levelStructure.map((level, index) => {
            const potential = calculateLevelPotential(level.level);

            return (
              <motion.div
                key={level.level}
                className={`level-card ${selectedLevel === level.level ? 'selected' : ''}`}
                style={{ '--level-color': level.color }}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={() => setSelectedLevel(level.level)}
              >
                <div className="level-header">
                  <span className="level-number">Level {level.level}</span>
                  <span className="level-percentage">{level.percentage}%</span>
                </div>

                <div className="level-metrics">
                  <div className="metric">
                    <span className="metric-label">Members</span>
                    <span className="metric-value">
                      {level.members}/{potential.maxPossibleMembers}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Volume</span>
                    <span className="metric-value">${level.volume}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Earnings</span>
                    <span className="metric-value">
                      ${level.earnings.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="level-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${potential.fillRate}%` }}
                    />
                  </div>
                  <span className="progress-label">
                    {potential.fillRate.toFixed(1)}% filled
                  </span>
                </div>

                <div className="level-potential">
                  <span className="potential-label">
                    Potential: ${potential.potentialEarnings.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Level Details */}
      <div className="level-details">
        <h3>🔍 Level {selectedLevel} Analysis</h3>
        <div className="details-content">
          {(() => {
            const levelData = levelStructure[selectedLevel - 1];
            const potential = calculateLevelPotential(selectedLevel);

            return (
              <div className="analysis-grid">
                <div className="analysis-card">
                  <h4>Current Performance</h4>
                  <div className="performance-metrics">
                    <div className="perf-metric">
                      <span>Active Members</span>
                      <span>{levelData.members}</span>
                    </div>
                    <div className="perf-metric">
                      <span>Total Volume</span>
                      <span>${levelData.volume}</span>
                    </div>
                    <div className="perf-metric">
                      <span>Your Earnings</span>
                      <span>${levelData.earnings.toFixed(2)}</span>
                    </div>
                    <div className="perf-metric">
                      <span>Commission Rate</span>
                      <span>{levelData.percentage}%</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h4>Growth Potential</h4>
                  <div className="potential-metrics">
                    <div className="pot-metric">
                      <span>Max Possible Members</span>
                      <span>{potential.maxPossibleMembers}</span>
                    </div>
                    <div className="pot-metric">
                      <span>Fill Rate</span>
                      <span>{potential.fillRate.toFixed(1)}%</span>
                    </div>
                    <div className="pot-metric">
                      <span>Max Potential Earnings</span>
                      <span>${potential.potentialEarnings.toFixed(2)}</span>
                    </div>
                    <div className="pot-metric">
                      <span>Growth Opportunity</span>
                      <span>
                        $
                        {(
                          potential.potentialEarnings -
                          potential.currentEarnings
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="analysis-card strategy">
                  <h4>Optimization Strategy</h4>
                  <div className="strategy-tips">
                    {selectedLevel <= 3 && (
                      <div className="tip">
                        <FaBullseye />
                        <span>
                          Focus on direct referral quality to strengthen this
                          level
                        </span>
                      </div>
                    )}
                    {selectedLevel > 3 && selectedLevel <= 6 && (
                      <div className="tip">
                        <FaBullseye />
                        <span>
                          Encourage team building activities to fill these
                          levels
                        </span>
                      </div>
                    )}
                    {selectedLevel > 6 && (
                      <div className="tip">
                        <FaGlobe />
                        <span>
                          Long-term network expansion will unlock these levels
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );

  const renderBinaryTreeView = () => (
    <div className="binary-tree-view">
      <div className="tree-controls">
        <h3>🌳 Binary Tree Structure</h3>
        <div className="controls">
          <button
            className={`control-btn ${!treeExpanded ? 'active' : ''}`}
            onClick={() => setTreeExpanded(false)}
          >
            <FaCompress /> Compact View
          </button>
          <button
            className={`control-btn ${treeExpanded ? 'active' : ''}`}
            onClick={() => setTreeExpanded(true)}
          >
            <FaExpand /> Expanded View
          </button>
        </div>
      </div>

      <div className={`tree-container ${treeExpanded ? 'expanded' : ''}`}>
        {/* Root Node (You) */}
        <div className="tree-level root-level">
          <div className="tree-node root">
            <div className="node-avatar">YOU</div>
            <div className="node-info">
              <div className="node-name">Your Position</div>
              <div className="node-package">${binaryTreeData.you.package}</div>
              <div className="node-volume">
                ${binaryTreeData.you.volume} volume
              </div>
            </div>
          </div>
        </div>

        {/* Level 1 */}
        <div className="tree-level level-1">
          <div className="tree-connections">
            <div className="connection left"></div>
            <div className="connection right"></div>
          </div>

          <div className="tree-nodes">
            {binaryTreeData.level1.map((member, index) => (
              <motion.div
                key={index}
                className={`tree-node ${member.position} ${member.active ? 'active' : 'inactive'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="node-avatar">{member.name.charAt(0)}</div>
                <div className="node-info">
                  <div className="node-name">{member.name}</div>
                  <div className="node-package">${member.package}</div>
                  <div className="node-volume">${member.volume} volume</div>
                </div>
                <div
                  className={`node-status ${member.active ? 'active' : 'inactive'}`}
                >
                  {member.active ? 'Active' : 'Inactive'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Level 2 */}
        {treeExpanded && (
          <div className="tree-level level-2">
            <div className="tree-connections">
              <div className="connection ll"></div>
              <div className="connection lr"></div>
              <div className="connection rl"></div>
              <div className="connection rr"></div>
            </div>

            <div className="tree-nodes">
              {binaryTreeData.level2.map((member, index) => (
                <motion.div
                  key={index}
                  className={`tree-node ${member.position} ${member.active ? 'active' : 'inactive'}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="node-avatar">{member.name.charAt(0)}</div>
                  <div className="node-info">
                    <div className="node-name">{member.name}</div>
                    <div className="node-package">${member.package}</div>
                    <div className="node-volume">${member.volume} volume</div>
                  </div>
                  <div
                    className={`node-status ${member.active ? 'active' : 'inactive'}`}
                  >
                    {member.active ? 'Active' : 'Inactive'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Binary Tree Insights */}
      <div className="tree-insights">
        <h4>🧠 Binary Tree Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <h5>Balance Analysis</h5>
            <p>
              Your left leg has stronger volume but right leg shows better
              growth potential.
            </p>
            <div className="insight-action">
              <button className="insight-btn">Focus on Right Leg</button>
            </div>
          </div>

          <div className="insight-card">
            <h5>Growth Strategy</h5>
            <p>
              Adding 2 more active members in Level 2 could increase your
              earnings by $18/month.
            </p>
            <div className="insight-action">
              <button className="insight-btn">View Strategy</button>
            </div>
          </div>

          <div className="insight-card">
            <h5>Performance Score</h5>
            <p>
              Your binary tree efficiency is 75%. Focus on team activation for
              better results.
            </p>
            <div className="insight-action">
              <button className="insight-btn">Optimization Tips</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOptimizationView = () => (
    <div className="optimization-view">
      <h3>🎯 Level Bonus Optimization</h3>

      <div className="optimization-sections">
        {/* Performance Dashboard */}
        <div className="performance-dashboard">
          <h4>Performance Dashboard</h4>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-header">
                <FaChartPie />
                <span>Level Efficiency</span>
              </div>
              <div className="efficiency-chart">
                {levelStructure.slice(0, 6).map((level, index) => {
                  const potential = calculateLevelPotential(level.level);
                  return (
                    <div key={level.level} className="efficiency-bar">
                      <span className="bar-label">L{level.level}</span>
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${potential.fillRate}%`,
                            background: level.color,
                          }}
                        />
                      </div>
                      <span className="bar-value">
                        {potential.fillRate.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <FaCalculator />
                <span>Earnings Potential</span>
              </div>
              <div className="potential-breakdown">
                <div className="potential-item">
                  <span>Current Monthly</span>
                  <span className="value">
                    ${totalLevelEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="potential-item">
                  <span>If 100% Filled</span>
                  <span className="value potential">
                    ${(totalLevelEarnings * 3.2).toFixed(2)}
                  </span>
                </div>
                <div className="potential-item">
                  <span>Growth Opportunity</span>
                  <span className="value opportunity">
                    ${(totalLevelEarnings * 2.2).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Strategies */}
        <div className="optimization-strategies">
          <h4>🚀 Optimization Strategies</h4>
          <div className="strategies-grid">
            <div className="strategy-card high-priority">
              <div className="strategy-header">
                <FaTrophy />
                <span className="priority-badge high">High Priority</span>
              </div>
              <h5>Focus on Levels 1-3</h5>
              <p>
                These levels have the highest commission rates and immediate
                impact on earnings.
              </p>
              <div className="strategy-metrics">
                <span>Potential Increase: +$25/month</span>
                <span>Effort Level: Medium</span>
              </div>
              <button className="strategy-action">Implement Strategy</button>
            </div>

            <div className="strategy-card medium-priority">
              <div className="strategy-header">
                <FaUsers />
                <span className="priority-badge medium">Medium Priority</span>
              </div>
              <h5>Team Building Program</h5>
              <p>
                Encourage existing members to build their own teams for deeper
                level fills.
              </p>
              <div className="strategy-metrics">
                <span>Potential Increase: +$40/month</span>
                <span>Effort Level: High</span>
              </div>
              <button className="strategy-action">Start Program</button>
            </div>

            <div className="strategy-card low-priority">
              <div className="strategy-header">
                <FaNetworkWired />
                <span className="priority-badge low">Future Focus</span>
              </div>
              <h5>Deep Level Expansion</h5>
              <p>
                Long-term strategy for filling levels 7-10 through organic
                network growth.
              </p>
              <div className="strategy-metrics">
                <span>Potential Increase: +$15/month</span>
                <span>Effort Level: Low</span>
              </div>
              <button className="strategy-action">Plan Strategy</button>
            </div>
          </div>
        </div>

        {/* Action Plan */}
        <div className="action-plan">
          <h4>📋 30-Day Action Plan</h4>
          <div className="action-timeline">
            <div className="timeline-item">
              <div className="timeline-marker week1">Week 1</div>
              <div className="timeline-content">
                <h5>Strengthen Level 1 & 2</h5>
                <p>
                  Focus on activating existing members and adding 1-2 new
                  quality referrals.
                </p>
                <div className="timeline-goals">
                  <span>Goal: +2 active members</span>
                  <span>Expected: +$12/month</span>
                </div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker week2">Week 2-3</div>
              <div className="timeline-content">
                <h5>Binary Tree Balancing</h5>
                <p>
                  Work on balancing left and right legs for optimal binary
                  performance.
                </p>
                <div className="timeline-goals">
                  <span>Goal: Balance tree structure</span>
                  <span>Expected: +15% efficiency</span>
                </div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker week4">Week 4</div>
              <div className="timeline-content">
                <h5>Performance Review</h5>
                <p>
                  Analyze results and plan next month's optimization strategy.
                </p>
                <div className="timeline-goals">
                  <span>Goal: Strategy refinement</span>
                  <span>Expected: Data-driven insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-level-bonus">
      <div className="section-header">
        <h2>🏗️ Level Bonus System - 10% Pool Distribution</h2>
        <p>
          Maximize your binary tree potential with intelligent level
          optimization
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeView === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveView('distribution')}
        >
          <FaChartPie /> Distribution
        </button>
        <button
          className={`tab ${activeView === 'tree' ? 'active' : ''}`}
          onClick={() => setActiveView('tree')}
        >
          <FaNetworkWired /> Binary Tree
        </button>
        <button
          className={`tab ${activeView === 'optimization' ? 'active' : ''}`}
          onClick={() => setActiveView('optimization')}
        >
          <FaBullseye /> Optimization
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="tab-content"
        >
          {activeView === 'distribution' && renderDistributionView()}
          {activeView === 'tree' && renderBinaryTreeView()}
          {activeView === 'optimization' && renderOptimizationView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedLevelBonus;
