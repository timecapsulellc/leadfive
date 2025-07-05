import React, { useState, useEffect } from 'react';

const AdminControlPanel = ({ onSystemAction, userInfo }) => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 12458,
    totalVolume: 2400000,
    systemUptime: 98.5,
    activeNodes: 42,
    pendingWithdrawals: 15,
    kycPending: 8,
    suspendedAccounts: 3
  });

  const [activeSection, setActiveSection] = useState('system');
  const [pendingAction, setPendingAction] = useState(null);

  const systemControls = [
    { id: 'contract_status', label: 'Contract Status', status: 'active', action: 'toggle' },
    { id: 'network_health', label: 'Network Health', status: 'active', action: 'monitor' },
    { id: 'pending_rewards', label: 'Pending Rewards', status: 'warning', action: 'process' },
    { id: 'user_registrations', label: 'User Registrations', status: 'active', action: 'manage' }
  ];

  const analyticsControls = [
    { id: 'performance_monitor', label: 'Performance Monitoring', action: 'view' },
    { id: 'transaction_analytics', label: 'Transaction Analytics', action: 'export' },
    { id: 'user_activity', label: 'User Activity Reports', action: 'generate' },
    { id: 'financial_audit', label: 'Financial Auditing', action: 'audit' }
  ];

  const userManagementControls = [
    { id: 'kyc_approvals', label: 'KYC Approvals', count: systemStats.kycPending, action: 'review' },
    { id: 'account_verification', label: 'Account Verification', action: 'process' },
    { id: 'suspended_accounts', label: 'Suspended Accounts', count: systemStats.suspendedAccounts, action: 'manage' },
    { id: 'bulk_operations', label: 'Bulk Operations', action: 'execute' }
  ];

  const securityControls = [
    { id: 'security_monitoring', label: 'Security Monitoring', status: 'active', action: 'view' },
    { id: 'audit_logs', label: 'Audit Logs', action: 'view' },
    { id: 'compliance_reports', label: 'Compliance Reports', action: 'generate' },
    { id: 'risk_assessment', label: 'Risk Assessment', action: 'run' }
  ];

  const adminToolControls = [
    { id: 'matrix_audit', label: 'Audit Matrix', action: 'audit' },
    { id: 'matrix_repair', label: 'Repair Matrix', action: 'repair' },
    { id: 'auto_ghp_distribution', label: 'Auto GHP Distribution', action: 'distribute' },
    { id: 'auto_leader_distribution', label: 'Auto Leader Distribution', action: 'distribute' },
    { id: 'auto_club_distribution', label: 'Auto Club Distribution', action: 'distribute' }
  ];

  const handleAdminAction = async (controlId, action) => {
    setPendingAction(controlId);
    
    try {
      await simulateAdminAction(controlId, action);
      onSystemAction?.(controlId, action);
    } catch (error) {
      console.error('Admin action failed:', error);
    } finally {
      setPendingAction(null);
    }
  };

  const simulateAdminAction = (controlId, action) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const actionMessages = {
          contract_status: 'Contract status updated successfully',
          network_health: 'Network health check initiated',
          pending_rewards: 'Processing pending rewards...',
          kyc_approvals: 'KYC review panel opened',
          security_monitoring: 'Security dashboard accessed',
          bulk_operations: 'Bulk operation wizard launched'
        };
        
        alert(`Admin Action: ${actionMessages[controlId] || `${action} executed successfully`}`);
        resolve();
      }, 1000);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00FF88';
      case 'warning': return '#FFA500';
      case 'error': return '#FF4444';
      default: return '#888';
    }
  };

  const renderControlSection = (title, controls, icon) => (
    <div className="admin-section">
      <h4>
        <span className="section-icon">{icon}</span>
        {title}
      </h4>
      <div className="controls-list">
        {controls.map((control) => (
          <div key={control.id} className="control-item">
            <div className="control-info">
              {control.status && (
                <span 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(control.status) }}
                />
              )}
              <span className="control-label">{control.label}</span>
              {control.count && (
                <span className="control-count">{control.count}</span>
              )}
            </div>
            <button 
              className="admin-btn"
              onClick={() => handleAdminAction(control.id, control.action)}
              disabled={pendingAction === control.id}
            >
              {pendingAction === control.id ? '⏳' : control.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Update stats periodically (demo simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 1000),
        systemUptime: 98.5 + (Math.random() * 1.5)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-control-panel">
      <div className="admin-header">
        <h3>⚙️ Admin Control Panel</h3>
        <div className="admin-badge">ADMIN ACCESS</div>
      </div>

      {/* System Statistics */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{systemStats.totalUsers.toLocaleString()}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${(systemStats.totalVolume / 1000000).toFixed(1)}M</div>
          <div className="stat-label">Total Volume</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{systemStats.systemUptime.toFixed(1)}%</div>
          <div className="stat-label">System Uptime</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{systemStats.activeNodes}</div>
          <div className="stat-label">Active Nodes</div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="section-nav">
        {[
          { id: 'system', label: 'System', icon: '🔐' },
          { id: 'analytics', label: 'Analytics', icon: '📊' },
          { id: 'users', label: 'Users', icon: '👥' },
          { id: 'security', label: 'Security', icon: '🛡️' },
          { id: 'tools', label: 'Tools', icon: '🛠️' }
        ].map(section => (
          <button
            key={section.id}
            className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </div>

      {/* Control Sections */}
      <div className="admin-controls">
        {activeSection === 'system' && renderControlSection(
          'System Controls', systemControls, '🔐'
        )}
        {activeSection === 'analytics' && renderControlSection(
          'Analytics Control', analyticsControls, '📊'
        )}
        {activeSection === 'users' && renderControlSection(
          'User Management', userManagementControls, '👥'
        )}
        {activeSection === 'security' && renderControlSection(
          'Security & Compliance', securityControls, '🛡️'
        )}
        {activeSection === 'tools' && (
          <div className="admin-section">
            <h4><span className="section-icon">🛠️</span> Admin Tools</h4>
            <div className="controls-list">
              {/* Audit Matrix */}
              <div className="control-item">
                <input
                  type="text"
                  placeholder="User address"
                  id="audit-user-input"
                  className="control-input"
                />
                <button
                  className="admin-btn"
                  onClick={async () => {
                    const user = document.getElementById('audit-user-input').value;
                    try {
                      const result = await Web3Service.contract.methods.auditMatrixPlacement(user).call();
                      console.log('Matrix audit result:', result);
                      alert(`Upline: ${result.sponsor}, Downlines: ${result.downlines.length}`);
                    } catch (e) { console.error(e); alert('Audit failed'); }
                  }}
                >Audit Matrix</button>
              </div>
              {/* Repair Matrix */}
              <div className="control-item">
                <input
                  type="text"
                  placeholder="User address"
                  id="repair-user-input"
                  className="control-input"
                />
                <input
                  type="text"
                  placeholder="New Sponsor"
                  id="repair-sponsor-input"
                  className="control-input"
                />
                <button
                  className="admin-btn"
                  onClick={async () => {
                    const user = document.getElementById('repair-user-input').value;
                    const sponsor = document.getElementById('repair-sponsor-input').value;
                    try {
                      await Web3Service.contract.methods.repairMatrixPlacement(user, sponsor).send({ from: Web3Service.account });
                      alert('Matrix repaired');
                    } catch (e) { console.error(e); alert('Repair failed'); }
                  }}
                >Repair Matrix</button>
              </div>
              {/* Automated Distributions */}
              <div className="control-item">
                <button
                  className="admin-btn"
                  onClick={async () => {
                    try {
                      await Web3Service.contract.methods.distributeGlobalHelpPoolAuto().send({ from: Web3Service.account });
                      alert('GHP distributed');
                    } catch (e) { console.error(e); alert('GHP distribution failed'); }
                  }}
                >Auto GHP Distribution</button>
              </div>
              <div className="control-item">
                <button
                  className="admin-btn"
                  onClick={async () => {
                    try {
                      await Web3Service.contract.methods.distributeLeaderBonusPoolAuto().send({ from: Web3Service.account });
                      alert('Leader bonus distributed');
                    } catch (e) { console.error(e); alert('Leader distribution failed'); }
                  }}
                >Auto Leader Distribution</button>
              </div>
              <div className="control-item">
                <button
                  className="admin-btn"
                  onClick={async () => {
                    try {
                      await Web3Service.contract.methods.distributeClubPoolAuto().send({ from: Web3Service.account });
                      alert('Club pool distributed');
                    } catch (e) { console.error(e); alert('Club distribution failed'); }
                  }}
                >Auto Club Distribution</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-control-panel {
          background: rgba(255, 107, 53, 0.1);
          border: 2px solid #FF6B35;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .admin-header h3 {
          color: #FF6B35;
          margin: 0;
          font-size: 1.4rem;
        }

        .admin-badge {
          background: #FF6B35;
          color: white;
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid #FF6B35;
          border-radius: 10px;
          padding: 15px;
          text-align: center;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: #FF6B35;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #ccc;
        }

        .section-nav {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .section-btn {
          background: transparent;
          border: 1px solid #666;
          color: #ccc;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .section-btn.active,
        .section-btn:hover {
          background: #FF6B35;
          color: white;
          border-color: #FF6B35;
        }

        .admin-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 20px;
        }

        .admin-section h4 {
          color: #FF6B35;
          margin: 0 0 15px 0;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-icon {
          font-size: 1.2rem;
        }

        .controls-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .control-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .control-item:last-child {
          border-bottom: none;
        }

        .control-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .control-label {
          color: white;
          font-size: 14px;
        }

        .control-count {
          background: rgba(255, 107, 53, 0.3);
          color: #FF6B35;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }

        .admin-btn {
          background: linear-gradient(45deg, #FF6B35, #FF4500);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          transition: all 0.2s ease;
          min-width: 60px;
        }

        .admin-btn:hover:not(:disabled) {
          background: linear-gradient(45deg, #e55a2b, #e53e00);
          transform: translateY(-1px);
        }

        .admin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .admin-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .section-nav {
            justify-content: center;
          }
          
          .control-item {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
          
          .control-info {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminControlPanel;
