/**
 * NetworkTreeVisualization Usage Examples
 *
 * This file demonstrates various ways to use the NetworkTreeVisualization component
 * in different scenarios within the OrphiChain platform.
 *
 * @author OrphiChain Development Team
 * @version 2.0.0
 * @since 2025-06-14
 */

import React, { useState, useEffect } from 'react';
import NetworkTreeVisualization from './NetworkTreeVisualization';

// ============================================================================
// EXAMPLE 1: Basic Usage with Demo Data
// ============================================================================

export const BasicNetworkTreeExample = () => {
  return (
    <div style={{ height: '800px', padding: '20px' }}>
      <h2>Basic Network Tree - Demo Mode</h2>
      <NetworkTreeVisualization
        demoMode={true}
        showControls={true}
        showSearch={true}
        showLegend={true}
        showStats={true}
        theme="dark"
        onNodeClick={node => {
          console.log('Node clicked:', node);
        }}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Real Data Integration with Smart Contract
// ============================================================================

export const SmartContractNetworkTree = () => {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        // Example: Fetch from your Web3Service or smart contract
        // const data = await Web3Service.buildGenealogyTree(userAddress);

        // For demo purposes, using sample data
        const sampleData = {
          name: 'Current User',
          attributes: {
            address: '0x742D35Cc6634C0532925a3b8D0C6964C0f03824E',
            packageTier: 4,
            volume: 25000,
            registrationDate: new Date().toISOString(),
            downlineCount: 15,
          },
          children: [
            {
              name: 'Referral #1',
              attributes: {
                address: '0x1234567890ABCDEF1234567890ABCDEF12345678',
                packageTier: 3,
                volume: 12000,
                registrationDate: new Date(
                  Date.now() - 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
                downlineCount: 8,
              },
            },
            {
              name: 'Referral #2',
              attributes: {
                address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
                packageTier: 2,
                volume: 8500,
                registrationDate: new Date(
                  Date.now() - 14 * 24 * 60 * 60 * 1000
                ).toISOString(),
                downlineCount: 5,
              },
            },
          ],
        };

        setNetworkData(sampleData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch network data:', error);
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, []);

  if (loading) {
    return <div>Loading network data...</div>;
  }

  return (
    <div style={{ height: '800px', padding: '20px' }}>
      <h2>Live Smart Contract Network Tree</h2>
      <NetworkTreeVisualization
        data={networkData}
        orientation="vertical"
        showControls={true}
        showSearch={true}
        showLegend={true}
        showStats={true}
        showNodeDetails={true}
        theme="dark"
        onNodeClick={node => {
          console.log('Live node clicked:', node);
          // Handle real node interactions here
        }}
        onTreeLoad={(data, stats) => {
          console.log('Tree loaded with stats:', stats);
        }}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Minimal Tree for Embedded Use
// ============================================================================

export const MinimalNetworkTree = ({ userData }) => {
  return (
    <NetworkTreeVisualization
      data={userData}
      orientation="horizontal"
      showControls={false}
      showSearch={false}
      showLegend={false}
      showStats={false}
      showNodeDetails={false}
      theme="light"
      initialZoom={0.6}
      nodeSize={{ x: 150, y: 100 }}
    />
  );
};

// ============================================================================
// EXAMPLE 4: Custom Node Renderer
// ============================================================================

export const CustomStyledNetworkTree = () => {
  const customNodeRenderer = rd3tProps => {
    const { nodeDatum } = rd3tProps;
    const radius = 20;

    return (
      <g>
        {/* Custom circle with company branding */}
        <circle
          r={radius}
          fill="url(#orphiGradient)"
          stroke="#ffffff"
          strokeWidth="2"
          style={{ cursor: 'pointer' }}
        />

        {/* Custom text with different styling */}
        <text
          fill="#ffffff"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          y="4"
        >
          {nodeDatum.name.split(' ')[0]}
        </text>

        {/* Volume indicator */}
        {nodeDatum.attributes?.volume && (
          <text
            fill="#00FF88"
            fontSize="10"
            textAnchor="middle"
            y={radius + 15}
          >
            ${(nodeDatum.attributes.volume / 1000).toFixed(1)}K
          </text>
        )}

        {/* Define gradient */}
        <defs>
          <linearGradient
            id="orphiGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7B2CBF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </g>
    );
  };

  return (
    <div style={{ height: '600px', padding: '20px' }}>
      <h2>Custom Styled Network Tree</h2>
      <NetworkTreeVisualization
        demoMode={true}
        renderCustomNodeElement={customNodeRenderer}
        showControls={true}
        showLegend={false}
        theme="dark"
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Dashboard Integration
// ============================================================================

export const DashboardNetworkTreeWidget = ({
  userAddress,
  onUserSelect,
  selectedTheme = 'dark',
}) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleNodeClick = node => {
    setSelectedUser(node);
    if (onUserSelect) {
      onUserSelect(node);
    }
  };

  return (
    <div className="dashboard-widget">
      <div className="widget-header">
        <h3>Network Genealogy</h3>
        {selectedUser && (
          <span className="selected-user">Selected: {selectedUser.name}</span>
        )}
      </div>

      <div className="widget-content" style={{ height: '500px' }}>
        <NetworkTreeVisualization
          data={null} // Replace with real data from Web3Service
          demoMode={true} // Remove when integrating real data
          orientation="vertical"
          initialZoom={0.7}
          showControls={true}
          showSearch={true}
          showLegend={true}
          showStats={true}
          showNodeDetails={true}
          theme={selectedTheme}
          onNodeClick={handleNodeClick}
          nodeSize={{ x: 180, y: 120 }}
          scaleExtent={{ min: 0.2, max: 2 }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Export Functionality Integration
// ============================================================================

export const ExportableNetworkTree = () => {
  const [treeData, setTreeData] = useState(null);

  const handleExportTree = () => {
    if (treeData) {
      // Convert tree data to exportable format
      const exportData = {
        timestamp: new Date().toISOString(),
        network: flattenTreeData(treeData),
        summary: {
          totalUsers: countNodes(treeData),
          maxDepth: calculateDepth(treeData),
          totalVolume: calculateVolume(treeData),
        },
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orphichain-network-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Helper functions for export
  const flattenTreeData = (node, level = 0) => {
    const result = [
      {
        name: node.name,
        level,
        ...node.attributes,
      },
    ];

    if (node.children) {
      node.children.forEach(child => {
        result.push(...flattenTreeData(child, level + 1));
      });
    }

    return result;
  };

  const countNodes = node => {
    let count = 1;
    if (node.children) {
      node.children.forEach(child => {
        count += countNodes(child);
      });
    }
    return count;
  };

  const calculateDepth = (node, depth = 0) => {
    if (!node.children || node.children.length === 0) {
      return depth;
    }
    return Math.max(
      ...node.children.map(child => calculateDepth(child, depth + 1))
    );
  };

  const calculateVolume = node => {
    let total = node.attributes?.volume || 0;
    if (node.children) {
      node.children.forEach(child => {
        total += calculateVolume(child);
      });
    }
    return total;
  };

  return (
    <div style={{ height: '800px', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleExportTree}
          style={{
            padding: '10px 20px',
            backgroundColor: '#00D4FF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Export Network Data
        </button>
      </div>

      <NetworkTreeVisualization
        demoMode={true}
        showControls={true}
        showExport={true}
        onTreeLoad={data => setTreeData(data)}
      />
    </div>
  );
};

export default {
  BasicNetworkTreeExample,
  SmartContractNetworkTree,
  MinimalNetworkTree,
  CustomStyledNetworkTree,
  DashboardNetworkTreeWidget,
  ExportableNetworkTree,
};
