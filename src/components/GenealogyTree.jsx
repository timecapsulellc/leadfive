import React, { useState, useEffect } from 'react';
import './GenealogyTree.css';

const GenealogyTree = ({ account, contract }) => {
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account && contract) {
      fetchTreeData();
    }
  }, [account, contract]);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration (replace with actual contract calls)
      const mockTreeData = {
        id: account,
        name: `${account.slice(0, 6)}...${account.slice(-4)}`,
        isActive: true,
        package: 'Premium',
        earnings: '1,250.00',
        children: [
          {
            id: '0x1234...5678',
            name: '0x1234...5678',
            isActive: true,
            package: 'Advanced',
            earnings: '875.50',
            children: [
              {
                id: '0x2345...6789',
                name: '0x2345...6789',
                isActive: true,
                package: 'Standard',
                earnings: '450.25',
                children: []
              },
              {
                id: '0x3456...7890',
                name: '0x3456...7890',
                isActive: false,
                package: 'Entry',
                earnings: '125.00',
                children: []
              }
            ]
          },
          {
            id: '0x4567...8901',
            name: '0x4567...8901',
            isActive: true,
            package: 'Premium',
            earnings: '1,100.75',
            children: [
              {
                id: '0x5678...9012',
                name: '0x5678...9012',
                isActive: true,
                package: 'Advanced',
                earnings: '675.50',
                children: []
              }
            ]
          },
          {
            id: '0x6789...0123',
            name: '0x6789...0123',
            isActive: true,
            package: 'Standard',
            earnings: '320.25',
            children: []
          }
        ]
      };
      
      setTreeData(mockTreeData);
      
    } catch (error) {
      console.error('Error fetching tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  const TreeNode = ({ node, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

    const getPackageColor = (packageType) => {
      switch (packageType) {
        case 'Premium': return '#FFD700';
        case 'Advanced': return '#FF6B35';
        case 'Standard': return '#7B2CBF';
        case 'Entry': return '#00D4FF';
        default: return '#B8C5D1';
      }
    };

    return (
      <div className="tree-node-wrapper">
        <div 
          className={`tree-node ${node.isActive ? 'active' : 'inactive'} ${selectedNode?.id === node.id ? 'selected' : ''}`}
          onClick={() => setSelectedNode(node)}
          style={{ borderColor: `${getPackageColor(node.package)}50` }}
        >
          <div className="node-avatar" style={{ background: getPackageColor(node.package) }}>
            <span>{node.name.charAt(2)}</span>
          </div>
          <div className="node-info">
            <div className="node-name">{node.name}</div>
            <div className="node-package" style={{ color: getPackageColor(node.package) }}>{node.package}</div>
            <div className="node-earnings">${node.earnings}</div>
          </div>
          {node.children && node.children.length > 0 && (
            <button 
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
        
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="tree-children">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="tree-loading">Loading genealogy tree...</div>;
  }

  const totalMembers = 12;
  const activeMembers = 10;
  const totalVolume = '$45,230';

  return (
    <div className="genealogy-tree">
      <div className="tree-header">
        <h2>Network Genealogy Tree</h2>
        <div className="tree-stats">
          <div className="stat-item">
            <span className="stat-label">Total Members</span>
            <span className="stat-value">{totalMembers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Members</span>
            <span className="stat-value">{activeMembers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Volume</span>
            <span className="stat-value">{totalVolume}</span>
          </div>
        </div>
      </div>

      <div className="tree-container">
        {treeData && <TreeNode node={treeData} />}
      </div>

      {selectedNode && (
        <div className="node-details-panel">
          <h3>Member Details</h3>
          <div className="detail-item">
            <span>Address:</span>
            <span>{selectedNode.id}</span>
          </div>
          <div className="detail-item">
            <span>Package:</span>
            <span>{selectedNode.package}</span>
          </div>
          <div className="detail-item">
            <span>Status:</span>
            <span className={selectedNode.isActive ? 'status-active' : 'status-inactive'}>
              {selectedNode.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="detail-item">
            <span>Earnings:</span>
            <span>${selectedNode.earnings}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenealogyTree;
