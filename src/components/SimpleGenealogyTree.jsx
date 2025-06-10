import React, { useState } from 'react';
import './OrphiChain.css';

/**
 * Simplified Genealogy Tree Component
 * A basic tree visualization without external dependencies
 */
const SimpleGenealogyTree = () => {
  const [selectedNode, setSelectedNode] = useState(null);

  // Sample network data
  const networkData = {
    user: 'You',
    package: '$100',
    earnings: '$1,247.32',
    children: [
      {
        user: 'User #1',
        package: '$200',
        earnings: '$847.50',
        children: [
          { user: 'User #3', package: '$50', earnings: '$125.00', children: [] },
          { user: 'User #4', package: '$100', earnings: '$340.25', children: [] }
        ]
      },
      {
        user: 'User #2',
        package: '$100',
        earnings: '$420.75',
        children: [
          { user: 'User #5', package: '$30', earnings: '$87.50', children: [] },
          { user: 'User #6', package: '$200', earnings: '$650.00', children: [] }
        ]
      }
    ]
  };

  const getPackageColor = (packageStr) => {
    if (packageStr.includes('200')) return 'var(--orphi-success-green)';
    if (packageStr.includes('100')) return 'var(--orphi-royal-purple)';
    if (packageStr.includes('50')) return 'var(--orphi-cyber-blue)';
    if (packageStr.includes('30')) return 'var(--orphi-energy-orange)';
    return 'var(--orphi-silver-mist)';
  };

  const TreeNode = ({ node, level = 0 }) => (
    <div className="tree-node-container" style={{ marginLeft: level * 40 }}>
      <div 
        className={`tree-node ${selectedNode === node.user ? 'selected' : ''}`}
        onClick={() => setSelectedNode(node.user)}
        style={{ borderColor: getPackageColor(node.package) }}
      >
        <div className="node-header">
          <div className="node-avatar" style={{ backgroundColor: getPackageColor(node.package) }}>
            {node.user.charAt(0)}
          </div>
          <div className="node-info">
            <div className="node-name">{node.user}</div>
            <div className="node-package">{node.package}</div>
          </div>
        </div>
        <div className="node-earnings">{node.earnings}</div>
        {node.children && node.children.length > 0 && (
          <div className="node-children-count">
            👥 {node.children.length} direct
          </div>
        )}
      </div>
      
      {node.children && node.children.map((child, index) => (
        <TreeNode key={index} node={child} level={level + 1} />
      ))}
    </div>
  );

  const calculateTotalUsers = (node) => {
    let count = 1;
    if (node.children) {
      node.children.forEach(child => {
        count += calculateTotalUsers(child);
      });
    }
    return count;
  };

  const calculateTotalEarnings = (node) => {
    let total = parseFloat(node.earnings.replace('$', '').replace(',', ''));
    if (node.children) {
      node.children.forEach(child => {
        total += calculateTotalEarnings(child);
      });
    }
    return total;
  };

  return (
    <div className="simple-genealogy-tree">
      <div className="tree-header">
        <h3>🌐 Network Genealogy Tree</h3>
        <p>Click on any node to view details</p>
      </div>

      <div className="tree-stats">
        <div className="stat-card">
          <div className="stat-value">{calculateTotalUsers(networkData)}</div>
          <div className="stat-label">Total Network</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${calculateTotalEarnings(networkData).toLocaleString()}</div>
          <div className="stat-label">Network Earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{networkData.children?.length || 0}</div>
          <div className="stat-label">Direct Referrals</div>
        </div>
      </div>

      <div className="tree-container">
        <TreeNode node={networkData} />
      </div>

      {selectedNode && (
        <div className="node-details">
          <h4>📊 Node Details</h4>
          <p><strong>Selected:</strong> {selectedNode}</p>
          <p>Click on different nodes to explore your network structure</p>
        </div>
      )}

      <div className="tree-legend">
        <h4>Package Tiers</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--orphi-energy-orange)' }}></div>
            <span>$30 Package</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--orphi-cyber-blue)' }}></div>
            <span>$50 Package</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--orphi-royal-purple)' }}></div>
            <span>$100 Package</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--orphi-success-green)' }}></div>
            <span>$200 Package</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGenealogyTree;
