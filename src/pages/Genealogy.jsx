import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Tree from 'react-d3-tree';
import PageWrapper from '../components/PageWrapper';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';
import UserProfileModal from '../components/UserProfileModal';
import TreeSearch from '../components/TreeSearch';
import ExportModal from '../components/ExportModal';
import RealtimeStatus from '../components/RealtimeStatus';
import GenealogyAnalytics from '../components/GenealogyAnalytics';
import SimpleNetworkTree from '../components/SimpleNetworkTree';
import Web3Service from '../services/Web3Service';
import './Genealogy.css';

const Genealogy = ({ account, provider, signer, onConnect, onDisconnect }) => {
  const [treeData, setTreeData] = useState(null);
  const [viewMode, setViewMode] = useState('d3tree'); // 'd3tree', 'horizontal', 'vertical'
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeOrientation, setTreeOrientation] = useState('vertical');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [treeTranslate, setTreeTranslate] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(true); // Start with mock data by default
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [useSimpleTree, setUseSimpleTree] = useState(false); // Fallback for complex tree
  const treeContainerRef = useRef(null);
  const navigate = useNavigate();

  // Error boundary for tree rendering
  useEffect(() => {
    const handleError = (event) => {
      console.error('Tree rendering error:', event.error);
      setError('Tree visualization temporarily unavailable');
      setUseSimpleTree(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Transform data for react-d3-tree format
  const transformToD3TreeData = (data) => {
    if (!data) return null;
    
    return {
      name: data.name,
      attributes: {
        id: data.attributes?.address || data.id,
        address: data.attributes?.address || data.id,
        level: data.attributes?.level || data.level,
        package: data.attributes?.package || data.package,
        earnings: data.attributes?.earnings || data.earnings,
        withdrawable: data.attributes?.withdrawable || '$0.00',
        directReferrals: data.attributes?.directReferrals || data.directReferrals,
        totalNetwork: data.attributes?.teamSize || data.totalNetwork,
        position: data.attributes?.position || 0,
        isCapped: data.attributes?.isCapped || false,
        isUser: data.attributes?.isUser || false
      },
      children: data.children ? data.children.map(child => transformToD3TreeData(child)) : []
    };
  };

  // Mock data for demonstration - replace with actual smart contract data
  const getMockTreeData = useCallback(() => ({
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
  }), [account]);

  // Check if user is registered in the contract
  const checkUserRegistration = async () => {
    if (!account || useMockData) return true;
    
    try {
      const userInfo = await Web3Service.contract.getUserInfo(account);
      return userInfo && userInfo.totalInvested > 0;
    } catch (error) {
      return false;
    }
  };

  const loadGenealogyData = useCallback(async () => {
    if (!account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Use mock data for testing/demo
        setTimeout(() => {
          setTreeData(getMockTreeData());
          setLoading(false);
        }, 1000);
      } else {
        // Load real data from smart contract
        const contractTreeData = await Web3Service.buildGenealogyTree(account, 5);
        
        if (contractTreeData) {
          // Add additional formatting for display
          const formattedTreeData = {
            ...contractTreeData,
            name: 'YOU',
            id: account,
            level: 0,
            package: '$100', // This would come from contract if available
            totalNetwork: contractTreeData.attributes?.teamSize || 0
          };
          
          setTreeData(formattedTreeData);
        } else {
          // Fallback to mock data if no contract data
          setTreeData(getMockTreeData());
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading genealogy data:', error);
      setError('Failed to load genealogy data. Using demo data.');
      // Fallback to mock data on error
      setTreeData(getMockTreeData());
      setLoading(false);
    }
  }, [account, useMockData, getMockTreeData]);

  useEffect(() => {
    const checkRegistration = async () => {
      const registered = await checkUserRegistration();
      setIsUserRegistered(registered);
    };
    
    if (account && !useMockData) {
      checkRegistration();
    }
  }, [account, useMockData]);

  useEffect(() => {
    if (account) {
      loadGenealogyData();
    }
  }, [account, loadGenealogyData]);

  // Load initial data immediately when component mounts
  useEffect(() => {
    if (!account) {
      // Load demo data even without wallet connection
      setTreeData(getMockTreeData());
    }
  }, [getMockTreeData]);

  useEffect(() => {
    // Center the tree when container dimensions change
    if (treeContainerRef.current && treeData) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTreeTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 4
      });
    }
  }, [treeData, viewMode]);

  // Custom node component for react-d3-tree
  const renderCustomNodeElement = useCallback(({ nodeDatum, toggleNode }) => {
    const handleNodeClick = () => {
      const nodeData = {
        name: nodeDatum.name,
        id: nodeDatum.attributes.address || nodeDatum.attributes.id,
        address: nodeDatum.attributes.address,
        level: nodeDatum.attributes.level,
        package: nodeDatum.attributes.package || 'N/A',
        earnings: nodeDatum.attributes.earnings,
        withdrawable: nodeDatum.attributes.withdrawable || '$0.00',
        directReferrals: nodeDatum.attributes.directReferrals,
        totalNetwork: nodeDatum.attributes.totalNetwork,
        position: nodeDatum.attributes.position,
        isCapped: nodeDatum.attributes.isCapped,
        isUser: nodeDatum.attributes.isUser
      };
      
      setProfileUser(nodeData);
      setShowUserProfile(true);
    };

    const isUser = nodeDatum.attributes.isUser;
    const isCapped = nodeDatum.attributes.isCapped;

    return (
      <g className="custom-node" onClick={handleNodeClick}>
        {/* Define gradients */}
        <defs>
          <linearGradient id={`avatarGradient-${nodeDatum.attributes.address || nodeDatum.attributes.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isUser ? "#FFD700" : isCapped ? "#FF6B35" : "#7B2CBF"} />
            <stop offset="100%" stopColor={isUser ? "#FFA500" : isCapped ? "#FF4500" : "#00D4FF"} />
          </linearGradient>
        </defs>
        
        {/* Node background circle */}
        <circle
          r={30}
          fill={`rgba(${isUser ? '255, 215, 0' : isCapped ? '255, 107, 53' : '123, 44, 191'}, 0.2)`}
          stroke={isUser ? "#FFD700" : isCapped ? "#FF6B35" : "#7B2CBF"}
          strokeWidth="2"
          className="node-circle"
        />
        
        {/* Avatar circle */}
        <circle
          r={20}
          fill={`url(#avatarGradient-${nodeDatum.attributes.address || nodeDatum.attributes.id})`}
          className="avatar-circle"
        />
        
        {/* Initials */}
        <text
          fill="white"
          fontSize="10"
          textAnchor="middle"
          dy="3"
          className="node-initials"
        >
          {nodeDatum.name === 'YOU' ? 'YOU' : nodeDatum.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </text>
        
        {/* Name label */}
        <text
          fill="white"
          fontSize="12"
          textAnchor="middle"
          dy="50"
          className="node-name"
        >
          {nodeDatum.name.length > 15 ? nodeDatum.name.substring(0, 12) + '...' : nodeDatum.name}
        </text>
        
        {/* Earnings label */}
        <text
          fill="#00FF88"
          fontSize="10"
          textAnchor="middle"
          dy="65"
          className="node-earnings"
        >
          {nodeDatum.attributes.earnings}
        </text>
        
        {/* Status indicator */}
        <circle
          r={4}
          fill={isCapped ? "#FF6B35" : "#00FF88"}
          cx={20}
          cy={-20}
          className="status-dot"
        />
        
        {/* Expand/Collapse button */}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <circle
            r={8}
            fill="#FF6B35"
            cx={25}
            cy={-25}
            onClick={toggleNode}
            className="expand-button"
          />
        )}
      </g>
    );
  }, []);

  const renderNode = (node, isRoot = false, nodeKey = null) => {
    const uniqueKey = nodeKey || node.attributes?.address || node.id;
    
    const handleNodeClick = () => {
      // Handle both old mock data format and new contract data format
      const nodeData = {
        id: node.attributes?.address || node.id,
        name: node.name,
        address: node.attributes?.address || node.id,
        package: node.attributes?.package || node.package || 'N/A',
        earnings: node.attributes?.earnings || node.earnings,
        withdrawable: node.attributes?.withdrawable || '$0.00',
        directReferrals: node.attributes?.directReferrals || node.directReferrals || 0,
        totalNetwork: node.attributes?.totalNetwork || node.totalNetwork || 0,
        isCapped: node.attributes?.isCapped || false,
        isUser: node.attributes?.isUser || isRoot
      };
      
      setProfileUser(nodeData);
      setShowUserProfile(true);
    };

    // Handle both old mock data format and new contract data format
    const nodeData = {
      id: node.attributes?.address || node.id,
      name: node.name,
      package: node.attributes?.package || node.package || 'N/A',
      earnings: node.attributes?.earnings || node.earnings,
      withdrawable: node.attributes?.withdrawable || '$0.00',
      directReferrals: node.attributes?.directReferrals || node.directReferrals || 0,
      totalNetwork: node.attributes?.totalNetwork || node.totalNetwork || 0,
      isCapped: node.attributes?.isCapped || false,
      isUser: node.attributes?.isUser || isRoot
    };

    return (
      <div key={uniqueKey} className={`tree-node ${isRoot ? 'root-node' : ''} ${viewMode}`}>
        <div 
          className={`node-card ${selectedNode?.id === nodeData.id ? 'selected' : ''} ${nodeData.isCapped ? 'capped' : ''} ${nodeData.isUser ? 'user-node' : ''}`}
          onClick={handleNodeClick}
        >
          <div className="node-avatar">
            <div className={`avatar-circle ${nodeData.isUser ? 'user' : nodeData.isCapped ? 'capped' : ''}`}>
              {nodeData.name === 'YOU' ? 'YOU' : nodeData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="node-status">
              <span className={`status-dot ${nodeData.isCapped ? 'capped' : 'active'}`}></span>
            </div>
          </div>
          <div className="node-info">
            <h4 className="node-name">{nodeData.name}</h4>
            <p className="node-id">
              {nodeData.id.length > 42 ? 
                `${nodeData.id.substring(0, 8)}...${nodeData.id.slice(-4)}` : 
                nodeData.id
              }
            </p>
            <div className="node-stats">
              <span className="stat">
                <span className="stat-label">Package:</span>
                <span className="stat-value">{nodeData.package}</span>
              </span>
              <span className="stat">
                <span className="stat-label">Earnings:</span>
                <span className="stat-value earnings">{nodeData.earnings}</span>
              </span>
              {nodeData.withdrawable !== '$0.00' && (
                <span className="stat">
                  <span className="stat-label">Withdrawable:</span>
                  <span className="stat-value withdrawable">{nodeData.withdrawable}</span>
                </span>
              )}
              <span className="stat">
                <span className="stat-label">Direct:</span>
                <span className="stat-value">{nodeData.directReferrals}</span>
              </span>
              <span className="stat">
                <span className="stat-label">Network:</span>
                <span className="stat-value">{nodeData.totalNetwork}</span>
              </span>
              {nodeData.isCapped && (
                <span className="stat capped-indicator">
                  <span className="stat-label">Status:</span>
                  <span className="stat-value">CAPPED</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className={`children-container ${viewMode}`}>
            {viewMode === 'horizontal' && <div className="connection-line horizontal"></div>}
            {viewMode === 'vertical' && <div className="connection-line vertical"></div>}
            <div className={`children-grid ${viewMode}`}>
              {node.children.map(child => renderNode(child, false, child.attributes?.address || child.id))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((eventType, data) => {
    if (!realtimeEnabled) return;

    switch (eventType) {
      case 'earnings_updated':
        if (data.address === account) {
          // Refresh tree data when user's earnings are updated
          loadGenealogyData();
        }
        break;
        
      case 'tree_updated':
        // Refresh tree when network structure changes
        loadGenealogyData();
        break;
        
      case 'new_referral':
        if (data.sponsor === account) {
          // Refresh tree when user gets a new referral
          loadGenealogyData();
        }
        break;
        
      default:
        break;
    }
  }, [account, realtimeEnabled, loadGenealogyData]);

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

        {/* Fallback for complex tree issues */}
        {(error || useSimpleTree) && (
          <div>
            <SimpleNetworkTree account={account} />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  setError(null);
                  setUseSimpleTree(false);
                  window.location.reload();
                }}
                style={{
                  background: 'linear-gradient(135deg, #7B2CBF, #00D4FF)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔄 Try Advanced Tree View
              </button>
            </div>
          </div>
        )}

        {/* Regular tree view */}
        {!error && !useSimpleTree && (
          <>
            <div className="genealogy-controls">
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'd3tree' ? 'active' : ''}`}
              onClick={() => setViewMode('d3tree')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22,7L20.5,6.5L19,7L17.5,6.5L16,7V4A1,1 0 0,0 15,3H9A1,1 0 0,0 8,4V7L6.5,6.5L5,7L3.5,6.5L2,7V9L3.5,9.5L5,9L6.5,9.5L8,9V12L6.5,12.5L5,12L3.5,12.5L2,12V14L3.5,14.5L5,14L6.5,14.5L8,14V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14L17.5,14.5L19,14L20.5,14.5L22,14V12L20.5,11.5L19,12L17.5,11.5L16,12V9L17.5,9.5L19,9L20.5,9.5L22,9V7M10,5H14V7H10V5M10,9H14V11H10V9M10,13H14V15H10V13Z"/>
              </svg>
              Interactive Tree
            </button>
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
            <button 
              className={`view-btn ${viewMode === 'analytics' ? 'active' : ''}`}
              onClick={() => setViewMode('analytics')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7,2V13H10V22L17,10H13L17,2H7Z"/>
              </svg>
              Analytics
            </button>
          </div>
          
          {/* Real-time Status */}
          <RealtimeStatus onUpdate={handleRealtimeUpdate} />
          
          {/* Search Component */}
          <TreeSearch
            treeData={treeData}
            onNodeSelect={(node) => {
              setProfileUser({
                name: node.name,
                id: node.attributes?.address || node.id,
                address: node.attributes?.address || node.id,
                package: node.attributes?.package || node.package || 'N/A',
                earnings: node.attributes?.earnings || node.earnings,
                withdrawable: node.attributes?.withdrawable || '$0.00',
                directReferrals: node.attributes?.directReferrals || node.directReferrals || 0,
                totalNetwork: node.attributes?.totalNetwork || node.totalNetwork || 0,
                isCapped: node.attributes?.isCapped || false,
                isUser: node.attributes?.isUser || false
              });
              setShowUserProfile(true);
            }}
          />
          
          {viewMode === 'd3tree' && (
            <div className="tree-orientation-controls">
              <button 
                className={`orientation-btn ${treeOrientation === 'vertical' ? 'active' : ''}`}
                onClick={() => setTreeOrientation('vertical')}
              >
                Top to Bottom
              </button>
              <button 
                className={`orientation-btn ${treeOrientation === 'horizontal' ? 'active' : ''}`}
                onClick={() => setTreeOrientation('horizontal')}
              >
                Left to Right
              </button>
            </div>
          )}
          
          <div className="data-source-controls">
            <label className="data-toggle">
              <input
                type="checkbox"
                checked={useMockData}
                onChange={(e) => {
                  setUseMockData(e.target.checked);
                  // Reload data with new source
                  setTimeout(() => loadGenealogyData(), 100);
                }}
              />
              <span className="toggle-text">
                {useMockData ? 'Using Demo Data' : 'Using Live Contract Data'}
              </span>
            </label>
          </div>
          
          {error && (
            <div className="error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              {error}
            </div>
          )}

          {!useMockData && account && !isUserRegistered && (
            <div className="info-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              You haven't joined the LeadFive network yet. Register to see your genealogy tree or toggle demo data to explore the features.
            </div>
          )}
          
          <div className="tree-controls">
            <button className="control-btn" onClick={loadGenealogyData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
              </svg>
              Refresh
            </button>
            <button 
              className="control-btn"
              onClick={() => setShowExportModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              Export
            </button>
            {viewMode === 'd3tree' && (
              <>
                <button 
                  className="control-btn"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5,14H20.5L16,9.5L13.5,12L10.5,9L4.5,15H15.5M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
                  </svg>
                  Zoom In
                </button>
                <button 
                  className="control-btn"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.3))}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M15.5,14H4.5L10.5,9L13.5,12L16,9.5L20.5,15H15.5Z"/>
                  </svg>
                  Zoom Out
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your network genealogy...</p>
          </div>
        ) : viewMode === 'analytics' ? (
          <GenealogyAnalytics 
            treeData={treeData}
            account={account}
            provider={provider}
            onExport={(data) => {
              // Handle analytics export
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `genealogy-analytics-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          />
        ) : (
          <div id="genealogy-tree" className={`genealogy-tree ${viewMode}`}>
            {treeData && viewMode === 'd3tree' ? (
              <div 
                ref={treeContainerRef}
                className="d3-tree-container"
                style={{ height: '600px', width: '100%' }}
              >
                <Tree
                  data={transformToD3TreeData(treeData)}
                  orientation={treeOrientation}
                  translate={treeTranslate}
                  zoom={zoomLevel}
                  scaleExtent={{ min: 0.1, max: 3 }}
                  separation={{ siblings: 2, nonSiblings: 2 }}
                  nodeSize={{ x: 200, y: 200 }}
                  renderCustomNodeElement={renderCustomNodeElement}
                  pathFunc="diagonal"
                  transitionDuration={500}
                  depthFactor={200}
                  initialDepth={2}
                  collapsible={true}
                  enableLegacyTransitions={true}
                  svgClassName="genealogy-d3-tree"
                  pathClassFunc={() => "tree-link"}
                />
              </div>
            ) : treeData ? (
              renderNode(treeData, true)
            ) : null}
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

        {!isUserRegistered && !useMockData && (
          <div className="registration-banner">
            <p>
              Your wallet is not registered in the contract. Please make sure you have joined the network and your data is available on the blockchain.
            </p>
            <button 
              className="register-btn"
              onClick={async () => {
                setLoading(true);
                try {
                  // Attempt to register the user (this function should be implemented in your Web3Service)
                  await Web3Service.registerUser(account);
                  // Refresh the genealogy data after registration
                  loadGenealogyData();
                } catch (error) {
                  setError('Registration failed. Please try again.');
                }
                setLoading(false);
              }}
            >
              {loading ? 'Registering...' : 'Register Now'}
            </button>
          </div>
        )}
      </div>
      
      {/* User Profile Modal */}
      <UserProfileModal
        user={profileUser}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setProfileUser(null);
        }}
      />
      
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        treeData={treeData}
        elementId="genealogy-tree"
      />
      
      {/* Close the conditional block */}
      </>
      )}
    </PageWrapper>
  );
};

export default Genealogy;
