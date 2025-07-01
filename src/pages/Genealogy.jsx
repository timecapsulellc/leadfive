import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';
import NetworkTreeVisualization from '../components/NetworkTreeVisualization';
import GenealogyAnalytics from '../components/GenealogyAnalytics';
import UserProfileModal from '../components/UserProfileModal';
import ExportModal from '../components/ExportModal';
import RealtimeStatus from '../components/RealtimeStatus';
import './Genealogy.css';

const Genealogy = ({ account, provider, signer, onConnect, onDisconnect }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [viewMode, setViewMode] = useState('advanced');
  const navigate = useNavigate();

  // Handle node selection and interaction
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setProfileUser({
      address: node.attributes?.address || node.id,
      name: node.name,
      ...node.attributes
    });
  }, []);

  const handleNodeHover = useCallback((node) => {
    // Optional: implement hover effects or tooltips
    console.log('Node hovered:', node.name);
  }, []);

  // Modal handlers
  const handleShowProfile = useCallback(() => {
    if (profileUser) {
      setShowUserProfile(true);
    }
  }, [profileUser]);

  const handleExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleToggleAnalytics = useCallback(() => {
    setShowAnalytics(prev => !prev);
  }, []);

  // Page header with controls
  const renderHeader = () => (
    <div className="genealogy-header">
      <div className="header-content">
        <div className="title-section">
          <h1>Network Genealogy</h1>
          <p>Visualize and analyze your team structure and performance</p>
        </div>
        
        <div className="header-controls">
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={useMockData}
                onChange={(e) => setUseMockData(e.target.checked)}
              />
              Use Demo Data
            </label>
          </div>
          
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={realtimeEnabled}
                onChange={(e) => setRealtimeEnabled(e.target.checked)}
              />
              Real-time Updates
            </label>
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={handleToggleAnalytics}
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          
          {selectedNode && (
            <button 
              className="btn btn-primary"
              onClick={handleShowProfile}
            >
              View Profile
            </button>
          )}
          
          <button 
            className="btn btn-outline"
            onClick={handleExport}
          >
            Export Data
          </button>
        </div>
      </div>
      
      {realtimeEnabled && (
        <RealtimeStatus 
          account={account}
          isConnected={!!account}
          lastUpdate={new Date()}
        />
      )}
    </div>
  );

  // Analytics panel
  const renderAnalytics = () => {
    if (!showAnalytics) return null;
    
    return (
      <div className="analytics-panel">
        <GenealogyAnalytics 
          account={account}
          selectedNode={selectedNode}
          useMockData={useMockData}
        />
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="genealogy-page">
        {/* Header */}
        {renderHeader()}
        
        {/* Wallet Connection */}
        {!account && (
          <div className="wallet-connection-section">
            <UnifiedWalletConnect
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              showBalance={true}
              compact={false}
            />
          </div>
        )}
        
        {/* Analytics Panel */}
        {renderAnalytics()}
        
        {/* Main Tree Visualization */}
        <div className="tree-section">
          <NetworkTreeVisualization
            account={account}
            orientation="vertical"
            enableExport={true}
            showControls={true}
            showStats={true}
            showSearch={true}
            showFilters={true}
            collapsible={true}
            zoomable={true}
            className="main-genealogy-tree"
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            style={{ minHeight: '600px', width: '100%' }}
          />
        </div>
        
        {/* Modals */}
        {showUserProfile && profileUser && (
          <UserProfileModal
            user={profileUser}
            isOpen={showUserProfile}
            onClose={() => setShowUserProfile(false)}
            account={account}
          />
        )}
        
        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            data={selectedNode}
            account={account}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default Genealogy;
