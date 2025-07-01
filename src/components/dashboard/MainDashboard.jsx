import React from 'react';
import ErrorBoundary from '../../ErrorBoundary';
import TeamLevelView from '../team/TeamLevelView';
import CompensationDashboard from '../compensation/CompensationDashboard';
import LiveStatsWidget from '../analytics/LiveStatsWidget';
import TransactionStatus from '../analytics/TransactionStatus';
import NetworkActivity from '../common/NetworkActivity';
import PerformanceMetrics from '../analytics/PerformanceMetrics';
import ExportControls from '../analytics/ExportControls';
import { useTeamData } from '../../hooks/useTeamData';
import { useCompensationData } from '../../hooks/useCompensationData';
import { useDeviceInfo } from '../../hooks/useDeviceInfo';
import { useLiveStats } from '../../hooks/useLiveStats';
import { useAnalytics } from '../../hooks/useAnalytics';
import Web3Service from '../../web3';
import GlobalStatsPanel from './GlobalStatsPanel';
import DistributionStatusPanel from './DistributionStatusPanel';
import '../../styles/dashboard.css';

/**
 * Main Dashboard Component - Orchestrates all dashboard features
 * Replaced the large SimpleOrphiDashboard function with modular architecture
 */
function MainDashboard() {
  // Custom hooks for state management
  const { teamData, teamLevelView, toggleInfiniteView, expandToLevel } = useTeamData();
  const { compensationData } = useCompensationData(teamData);
  const { deviceInfo } = useDeviceInfo();
  const { liveStats, transactions, wsConnected } = useLiveStats();
  const { analyticsData, chartData, exportTeamData } = useAnalytics(teamData, compensationData);
  
  // Contract instance for real-time stats
  const contract = Web3Service.contract;

  // Local state for UI controls
  const [showStats, setShowStats] = React.useState(true);
  const [selectedPackage, setSelectedPackage] = React.useState('$100');
  const [showPerformanceMetrics, setShowPerformanceMetrics] = React.useState(true);

  return (
    <ErrorBoundary>
      <div className={`dashboard-container ${deviceInfo.isMobile ? 'mobile' : ''} ${deviceInfo.isTablet ? 'tablet' : ''}`}>
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              Lead Five Dashboard
              <span className="version-badge">v2.1.0</span>
            </h1>
            
            <div className="header-controls">
              <div className="package-selector">
                <label>Package: </label>
                <select 
                  value={selectedPackage} 
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="package-select"
                >
                  <option value="$50">$50 Package</option>
                  <option value="$100">$100 Package</option>
                  <option value="$200">$200 Package</option>
                  <option value="$500">$500 Package</option>
                </select>
              </div>
              
              <button 
                onClick={() => setShowStats(!showStats)}
                className={`stats-toggle ${showStats ? 'active' : ''}`}
              >
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
              
              <button 
                onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                className={`metrics-toggle ${showPerformanceMetrics ? 'active' : ''}`}
              >
                {showPerformanceMetrics ? 'Hide Metrics' : 'Show Metrics'}
              </button>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="connection-status">
            <div className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span>{wsConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          
          {/* Left Column - Team and Compensation */}
          <div className="left-column">
            
            {/* Team Level View */}
            <div className="dashboard-section">
              <TeamLevelView 
                teamData={teamData}
                teamLevelView={teamLevelView}
                deviceInfo={deviceInfo}
                onToggleInfiniteView={toggleInfiniteView}
                onExpandToLevel={expandToLevel}
              />
            </div>

            {/* Compensation Dashboard */}
            <div className="dashboard-section">
              <CompensationDashboard 
                compensationData={compensationData}
                teamData={teamData}
                deviceInfo={deviceInfo}
                selectedPackage={selectedPackage}
              />
            </div>
          </div>

          {/* Center Column - Live Stats and Activity */}
          <div className="center-column">
            
            {/* Live Stats Widget */}
            {showStats && (
              <div className="dashboard-section">
                <LiveStatsWidget 
                  liveStats={liveStats}
                  wsConnected={wsConnected}
                  deviceInfo={deviceInfo}
                />
              </div>
            )}

            {/* Transaction Status */}
            <div className="dashboard-section">
              <TransactionStatus 
                transactions={transactions}
                deviceInfo={deviceInfo}
              />
            </div>

            {/* Network Activity */}
            <div className="dashboard-section">
              <NetworkActivity 
                teamData={teamData}
                deviceInfo={deviceInfo}
              />
            </div>
          </div>

          {/* Right Column - Analytics and Controls */}
          <div className="right-column">

            {/* Global Contract Stats */}
            <div className="dashboard-section">
              <GlobalStatsPanel contract={contract} />
            </div>

            {/* Distribution Status */}
            <div className="dashboard-section">
              <DistributionStatusPanel contract={contract} />
            </div>

            {/* Performance Metrics */}
            {showPerformanceMetrics && (
              <div className="dashboard-section">
                <PerformanceMetrics 
                  teamData={teamData}
                  compensationData={compensationData}
                  analyticsData={analyticsData}
                  chartData={chartData}
                  deviceInfo={deviceInfo}
                />
              </div>
            )}

            {/* Export Controls */}
            <div className="dashboard-section">
              <ExportControls 
                onExport={exportTeamData}
                analyticsData={analyticsData}
                deviceInfo={deviceInfo}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default MainDashboard;
