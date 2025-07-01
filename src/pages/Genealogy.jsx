import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import NetworkTreeVisualization from '../components/NetworkTreeVisualization';
import PerformanceMetrics from '../components/PerformanceMetrics';
import { FaArrowLeft, FaNetworkWired } from 'react-icons/fa';
import './Genealogy.css';
import '../styles/genealogy-layout-fixes.css';

const Genealogy = ({ account, provider, signer, onConnect, onDisconnect }) => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="genealogy-page">
        {/* Header with back button */}
        <div className="genealogy-header">
          <button 
            className="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
          <h1>My Team Network</h1>
          <p>Complete genealogy view of your team structure</p>
        </div>

        {/* Same content as dashboard TeamStructureSection but full-featured */}
        <div className="team-structure-section">
          <div className="team-overview">
            <h3>My Team Structure</h3>
            <p>Visualize your network and team growth - Full Interactive View</p>
          </div>

          <div className="team-visualization">
            <NetworkTreeVisualization 
              account={account} 
              showControls={true}
              showStats={true}
              showSearch={true}
              showFilters={true}
              collapsible={true}
              zoomable={true}
              enableExport={true}
              orientation="vertical"
            />
          </div>

          <div className="team-stats">
            <h3>Team Statistics</h3>
            <PerformanceMetrics account={account} detailed={true} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Genealogy;
