import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';
import './Genealogy.css';

const Genealogy = ({ account, provider, signer, onConnect, onDisconnect }) => {
  const [treeData, setTreeData] = useState(null);
  const [viewMode, setViewMode] = useState('horizontal'); // 'horizontal' or 'vertical'
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const navigate = useNavigate();

  // Mock data for demonstration - replace with actual smart contract data
  const mockTreeData = {
    id: account || '0x1234...5678',
    name: 'You',
    level: 0,
    package: '$100',
    earnings: '$2,450',
    directReferrals: 6,
    totalNetwork: 45,
    children: [
      {
        id: '0x2345...6789',
        name: 'John Doe',
        level: 1,
        package: '$50',
        earnings: '$1,200',
        directReferrals: 3,
        totalNetwork: 12,
        children: [
          {
            id: '0x3456...7890',
            name: 'Alice Smith',
            level: 2,
            package: '$30',
            earnings: '$450',
            directReferrals: 2,
            totalNetwork: 5,
            children: []
          },
          {
            id: '0x4567...8901',
            name: 'Bob Johnson',
            level: 2,
            package: '$100',
            earnings: '$890',
            directReferrals: 1,
            totalNetwork: 3,
            children: []
          }
        ]
      },
      {
        id: '0x5678...9012',
        name: 'Sarah Wilson',
        level: 1,
        package: '$200',
        earnings: '$3,200',
        directReferrals: 8,
        totalNetwork: 25,
        children: [
          {
            id: '0x6789...0123',
            name: 'Mike Davis',
            level: 2,
            package: '$100',
            earnings: '$1,100',
            directReferrals: 4,
            totalNetwork: 8,
            children: []
          }
        ]
      }
    ]
  };

  useEffect(() => {
    if (account) {
      loadGenealogyData();
    }
  }, [account]);

  const loadGenealogyData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual smart contract call
      setTimeout(() => {
        setTreeData(mockTreeData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading genealogy data:', error);
      setLoading(false);
    }
  };

  const renderNode = (node, isRoot = false) => {
    const handleNodeClick = () => {
      setSelectedNode(node);
    };

    return (
      <div key={node.id} className={`tree-node ${isRoot ? 'root-node' : ''} ${viewMode}`}>
        <div 
          className={`node-card ${selectedNode?.id === node.id ? 'selected' : ''}`}
          onClick={handleNodeClick}
        >
          <div className="node-avatar">
            <div className="avatar-circle">
              {node.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="node-status">
              <span className="status-dot active"></span>
            </div>
          </div>
          <div className="node-info">
            <h4 className="node-name">{node.name}</h4>
            <p className="node-id">{node.id.substring(0, 8)}...{node.id.slice(-4)}</p>
            <div className="node-stats">
              <span className="stat">
                <span className="stat-label">Package:</span>
                <span className="stat-value">{node.package}</span>
              </span>
              <span className="stat">
                <span className="stat-label">Earnings:</span>
                <span className="stat-value earnings">{node.earnings}</span>
              </span>
              <span className="stat">
                <span className="stat-label">Direct:</span>
                <span className="stat-value">{node.directReferrals}</span>
              </span>
              <span className="stat">
                <span className="stat-label">Network:</span>
                <span className="stat-value">{node.totalNetwork}</span>
              </span>
            </div>
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className={`children-container ${viewMode}`}>
            {viewMode === 'horizontal' && <div className="connection-line horizontal"></div>}
            {viewMode === 'vertical' && <div className="connection-line vertical"></div>}
            <div className={`children-grid ${viewMode}`}>
              {node.children.map(child => renderNode(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!account) {
    return (
      <PageWrapper>
        <div className="genealogy-page">
          <div className="page-header">
            <h1 className="page-title">Network Genealogy</h1>
            <p className="page-subtitle">Visualize your entire network structure and track team performance</p>
          </div>
          
          <div className="page-wallet-connect">
            <div className="wallet-connect-card">
              <h3>Connect Your Wallet</h3>
              <p>Connect your wallet to view your network genealogy tree</p>
              <UnifiedWalletConnect
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                buttonText="Connect Wallet"
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="genealogy-page">
        <div className="page-header">
          <h1 className="page-title">Network Genealogy</h1>
          <p className="page-subtitle">Your complete network structure and team performance</p>
        </div>

        <div className="genealogy-controls">
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'horizontal' ? 'active' : ''}`}
              onClick={() => setViewMode('horizontal')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v2H3V3zm0 8h18v2H3v-2zm0 8h18v2H3v-2z"/>
              </svg>
              Horizontal View
            </button>
            <button 
              className={`view-btn ${viewMode === 'vertical' ? 'active' : ''}`}
              onClick={() => setViewMode('vertical')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3v18h2V3H3zm8 0v18h2V3h-2zm8 0v18h2V3h-2z"/>
              </svg>
              Vertical View
            </button>
          </div>
          
          <div className="tree-controls">
            <button className="control-btn" onClick={loadGenealogyData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l1.41 1.41L11 7.83V20H9V7.83L6.59 5.41 5.18 6.82l-1.41-1.41L12 1.18 20.23 5.41l-1.41 1.41L17.41 5.41 16 7.83V20h-2V7.83l-2.41 2.42L12 4z"/>
              </svg>
              Refresh
            </button>
            <button className="control-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your network genealogy...</p>
          </div>
        ) : (
          <div className={`genealogy-tree ${viewMode}`}>
            {treeData && renderNode(treeData, true)}
          </div>
        )}

        {selectedNode && (
          <div className="node-details-panel">
            <div className="panel-header">
              <h3>Network Member Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedNode(null)}
              >
                ×
              </button>
            </div>
            <div className="panel-content">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedNode.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedNode.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Level:</span>
                <span className="detail-value">Level {selectedNode.level}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Package:</span>
                <span className="detail-value">{selectedNode.package}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Earnings:</span>
                <span className="detail-value earnings">{selectedNode.earnings}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Direct Referrals:</span>
                <span className="detail-value">{selectedNode.directReferrals}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Network:</span>
                <span className="detail-value">{selectedNode.totalNetwork}</span>
              </div>
            </div>
          </div>
        )}

        <div className="genealogy-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.47 2.47 0 0 0 17.5 7h-3c-.9 0-1.74.54-2.09 1.37L10 16v6h2v-6h2v6h4z"/>
              </svg>
            </div>
            <div className="stat-info">
              <h4>Total Network</h4>
              <p className="stat-number">{treeData?.totalNetwork || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div className="stat-info">
              <h4>Direct Referrals</h4>
              <p className="stat-number">{treeData?.directReferrals || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div className="stat-info">
              <h4>Total Earnings</h4>
              <p className="stat-number earnings">{treeData?.earnings || '$0'}</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Genealogy;
