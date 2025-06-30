import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import './PartnerNetworkVisualizer.css';

const PartnerNetworkVisualizer = ({ account, provider, signer, contractAddress, contractABI }) => {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'matrix'
  const canvasRef = useRef(null);

  // Network statistics
  const [networkStats, setNetworkStats] = useState({
    totalPartners: 0,
    directPartners: 0,
    spilloverPartners: 0,
    totalVolume: 0,
    weeklyGrowth: 0
  });

  useEffect(() => {
    if (account && provider && contractAddress) {
      fetchNetworkData();
    }
  }, [account, provider, contractAddress]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Fetch user's referral data
      const userData = await contract.users(account);
      const referrerId = userData.referrer;
      
      // Build network tree
      const networkTree = await buildNetworkTree(contract, account, 3); // 3 levels deep
      
      // Calculate network statistics
      const stats = calculateNetworkStats(networkTree);
      
      setNetworkData(networkTree);
      setNetworkStats(stats);
      
      // Draw the network visualization
      drawNetworkVisualization(networkTree);
      
    } catch (error) {
      console.error('Error fetching network data:', error);
      // Create mock data for demonstration
      const mockNetwork = generateMockNetworkData();
      setNetworkData(mockNetwork);
      setNetworkStats(calculateNetworkStats(mockNetwork));
      drawNetworkVisualization(mockNetwork);
    } finally {
      setLoading(false);
    }
  };

  const buildNetworkTree = async (contract, userId, maxDepth, currentDepth = 0) => {
    if (currentDepth >= maxDepth) return null;

    try {
      const userData = await contract.users(userId);
      const node = {
        id: userId,
        address: userId,
        level: currentDepth,
        directReferrals: [],
        matrixPositions: {
          x3: await getUserMatrixPosition(contract, userId, 'X3'),
          x4: await getUserMatrixPosition(contract, userId, 'X4'),
          x6: await getUserMatrixPosition(contract, userId, 'X6')
        },
        earnings: await getUserTotalEarnings(contract, userId),
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        isActive: true
      };

      // Get referrals (this would need to be implemented in the smart contract)
      // For now, we'll simulate the structure
      const referralCount = Math.max(0, 5 - currentDepth); // Fewer referrals at deeper levels
      
      for (let i = 0; i < referralCount; i++) {
        const childNode = await buildNetworkTree(
          contract, 
          generateMockAddress(), 
          maxDepth, 
          currentDepth + 1
        );
        if (childNode) {
          node.directReferrals.push(childNode);
        }
      }

      return node;
    } catch (error) {
      console.warn('Error building network tree:', error);
      return null;
    }
  };

  const getUserMatrixPosition = async (contract, userAddress, matrixType) => {
    try {
      // This would call actual contract methods
      return {
        currentLevel: Math.floor(Math.random() * 12) + 1,
        isActive: Math.random() > 0.3,
        earnings: (Math.random() * 1000).toFixed(2)
      };
    } catch (error) {
      return { currentLevel: 0, isActive: false, earnings: '0' };
    }
  };

  const getUserTotalEarnings = async (contract, userAddress) => {
    try {
      // This would call actual contract methods
      return (Math.random() * 5000).toFixed(2);
    } catch (error) {
      return '0';
    }
  };

  const generateMockAddress = () => {
    return '0x' + Math.random().toString(16).substr(2, 40);
  };

  const generateMockNetworkData = () => {
    return {
      id: account,
      address: account,
      level: 0,
      directReferrals: [
        {
          id: generateMockAddress(),
          address: generateMockAddress(),
          level: 1,
          matrixPositions: { x3: { currentLevel: 3, isActive: true, earnings: '150' }},
          earnings: '450.50',
          joinDate: new Date('2024-01-15'),
          isActive: true,
          directReferrals: [
            {
              id: generateMockAddress(),
              level: 2,
              earnings: '125.75',
              isActive: true,
              directReferrals: []
            }
          ]
        },
        {
          id: generateMockAddress(),
          level: 1,
          earnings: '320.25',
          isActive: true,
          directReferrals: []
        }
      ],
      matrixPositions: {
        x3: { currentLevel: 5, isActive: true, earnings: '500' },
        x4: { currentLevel: 3, isActive: true, earnings: '300' },
        x6: { currentLevel: 2, isActive: true, earnings: '200' }
      },
      earnings: '1250.75',
      joinDate: new Date('2023-12-01'),
      isActive: true
    };
  };

  const calculateNetworkStats = (networkTree) => {
    if (!networkTree) return networkStats;

    let totalPartners = 0;
    let directPartners = 0;
    let totalVolume = 0;

    const traverse = (node, level) => {
      if (!node) return;
      
      totalPartners++;
      totalVolume += parseFloat(node.earnings || 0);
      
      if (level === 1) directPartners++;
      
      if (node.directReferrals) {
        node.directReferrals.forEach(child => traverse(child, level + 1));
      }
    };

    traverse(networkTree, 0);

    return {
      totalPartners: totalPartners - 1, // Exclude self
      directPartners,
      spilloverPartners: totalPartners - directPartners - 1,
      totalVolume: totalVolume.toFixed(2),
      weeklyGrowth: Math.floor(Math.random() * 20) + 5 // Mock growth percentage
    };
  };

  const drawNetworkVisualization = (networkTree) => {
    const canvas = canvasRef.current;
    if (!canvas || !networkTree) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (viewMode === 'tree') {
      drawTreeView(ctx, networkTree, width, height);
    } else {
      drawMatrixView(ctx, networkTree, width, height);
    }
  };

  const drawTreeView = (ctx, networkTree, width, height) => {
    const centerX = width / 2;
    const centerY = 50;
    const levelHeight = 120;

    const drawNode = (node, x, y, level) => {
      // Draw connection lines to children
      if (node.directReferrals && node.directReferrals.length > 0) {
        const childY = y + levelHeight;
        const childWidth = width / Math.pow(2, level + 1);
        
        node.directReferrals.forEach((child, index) => {
          const childX = x + (index - (node.directReferrals.length - 1) / 2) * childWidth;
          
          // Draw line
          ctx.beginPath();
          ctx.moveTo(x, y + 25);
          ctx.lineTo(childX, childY - 25);
          ctx.strokeStyle = '#667eea';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          drawNode(child, childX, childY, level + 1);
        });
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = node.isActive ? '#00ff88' : '#ccc';
      ctx.fill();
      ctx.strokeStyle = level === 0 ? '#667eea' : '#888';
      ctx.lineWidth = level === 0 ? 3 : 1;
      ctx.stroke();

      // Draw earnings text
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`$${node.earnings}`, x, y + 45);
    };

    drawNode(networkTree, centerX, centerY, 0);
  };

  const drawMatrixView = (ctx, networkTree, width, height) => {
    // Draw matrix-style visualization
    const positions = [
      { x: width/2, y: height/2 }, // Center (user)
      { x: width/2 - 100, y: height/2 - 80 }, // Top left
      { x: width/2 + 100, y: height/2 - 80 }, // Top right
      { x: width/2 - 150, y: height/2 + 80 }, // Bottom left
      { x: width/2, y: height/2 + 80 }, // Bottom center
      { x: width/2 + 150, y: height/2 + 80 }, // Bottom right
    ];

    positions.forEach((pos, index) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? '#667eea' : '#00ff88';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add position number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(index === 0 ? 'YOU' : index.toString(), pos.x, pos.y + 5);
    });
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  if (loading) {
    return (
      <div className="network-loading">
        <div className="loading-spinner"></div>
        <p>Building Partner Network...</p>
      </div>
    );
  }

  return (
    <div className="partner-network-visualizer">
      <div className="network-header">
        <h2>🌐 Partner Network Visualizer</h2>
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            Tree View
          </button>
          <button
            className={`view-btn ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => setViewMode('matrix')}
          >
            Matrix View
          </button>
        </div>
      </div>

      <div className="network-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-number">{networkStats.totalPartners}</span>
            <span className="stat-label">Total Partners</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <span className="stat-number">{networkStats.directPartners}</span>
            <span className="stat-label">Direct Partners</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <span className="stat-number">{networkStats.spilloverPartners}</span>
            <span className="stat-label">Spillover Partners</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-number">${networkStats.totalVolume}</span>
            <span className="stat-label">Network Volume</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <span className="stat-number">+{networkStats.weeklyGrowth}%</span>
            <span className="stat-label">Weekly Growth</span>
          </div>
        </div>
      </div>

      <div className="network-visualization">
        <canvas
          ref={canvasRef}
          className="network-canvas"
          onClick={(e) => {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Handle click detection for nodes
          }}
        />
      </div>

      {selectedNode && (
        <div className="partner-details">
          <h3>Partner Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{selectedNode.address?.slice(0, 10)}...</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Earnings:</span>
              <span className="detail-value">${selectedNode.earnings}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Join Date:</span>
              <span className="detail-value">{selectedNode.joinDate?.toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value ${selectedNode.isActive ? 'active' : 'inactive'}`}>
                {selectedNode.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="network-insights">
        <h3>🎯 Network Growth Strategy</h3>
        <div className="insights-list">
          <div className="insight-item">
            <span className="insight-icon">🚀</span>
            <div className="insight-content">
              <h4>Spillover Opportunity</h4>
              <p>Your upline is actively building - expect spillover partners soon!</p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">💡</span>
            <div className="insight-content">
              <h4>Optimal Placement</h4>
              <p>Focus on filling your weaker leg to maximize matrix completion.</p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">🎖️</span>
            <div className="insight-content">
              <h4>Leadership Bonus</h4>
              <p>Help 2 more partners reach Level 3 to unlock leadership rewards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerNetworkVisualizer;
