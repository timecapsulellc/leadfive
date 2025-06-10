import React, { useState } from 'react';

const QuickActionsPanel = ({ userInfo, onAction }) => {
  const [pendingAction, setPendingAction] = useState(null);

  const actions = [
    {
      id: 'claim',
      title: 'Claim Available Rewards',
      description: 'Claim your pending rewards',
      amount: userInfo?.withdrawable || 245,
      icon: '💰',
      type: 'primary',
      disabled: !userInfo?.withdrawable || userInfo.withdrawable === 0
    },
    {
      id: 'invite',
      title: 'Invite New Members',
      description: 'Share your referral link',
      icon: '👥',
      type: 'secondary',
      disabled: false
    },
    {
      id: 'upgrade',
      title: 'Upgrade Level',
      description: 'View upgrade requirements',
      icon: '⬆️',
      type: 'secondary',
      disabled: false
    },
    {
      id: 'genealogy',
      title: 'View Genealogy',
      description: 'Open your team tree',
      icon: '🌳',
      type: 'secondary',
      disabled: false
    },
    {
      id: 'analytics',
      title: 'Monthly Analytics',
      description: 'View performance report',
      icon: '📊',
      type: 'secondary',
      disabled: false
    },
    {
      id: 'history',
      title: 'Earning History',
      description: 'Download transaction history',
      icon: '📈',
      type: 'secondary',
      disabled: false
    }
  ];

  const handleAction = async (action) => {
    setPendingAction(action.id);
    
    try {
      switch (action.id) {
        case 'claim':
          await simulateClaimRewards(action.amount);
          onAction?.('claim', { amount: action.amount });
          break;
        case 'invite':
          await simulateShareReferral();
          onAction?.('invite');
          break;
        case 'upgrade':
          await simulateUpgradeView();
          onAction?.('upgrade');
          break;
        case 'genealogy':
          onAction?.('genealogy');
          break;
        case 'analytics':
          onAction?.('analytics');
          break;
        case 'history':
          await simulateDownloadHistory();
          onAction?.('history');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setPendingAction(null);
    }
  };

  const simulateClaimRewards = (amount) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(`💰 Reward Claim\n\nProcessing your reward claim of $${amount}...\nFunds will be transferred to your wallet shortly.`);
        resolve();
      }, 1500);
    });
  };

  const simulateShareReferral = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const referralLink = `https://orphicrowdfund.com/ref/${userInfo?.id || 'demo123'}`;
        if (navigator.share) {
          navigator.share({
            title: 'Join OrphiCrowdFund',
            text: 'Join my team on OrphiCrowdFund!',
            url: referralLink
          });
        } else {
          navigator.clipboard.writeText(referralLink);
          alert(`🔗 Referral Link Copied!\n\n${referralLink}\n\nShare this link to invite new members!`);
        }
        resolve();
      }, 500);
    });
  };

  const simulateUpgradeView = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(`⬆️ Level Upgrade Requirements\n\nCurrent: ${userInfo?.level || 'Bronze'}\nNext: Platinum\n\nRequirements:\n• 500+ team members\n• $50K total volume\n• 90% activity rate`);
        resolve();
      }, 500);
    });
  };

  const simulateDownloadHistory = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate download
        const csvContent = "Date,Type,Amount,Status\n2024-01-15,Commission,$125,Complete\n2024-01-10,Bonus,$75,Complete";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'earning_history.csv';
        a.click();
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="quick-actions-panel">
      <div className="actions-header">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-count">{actions.filter(a => !a.disabled).length} Available</div>
      </div>

      <div className="actions-grid">
        {actions.map((action) => (
          <div 
            key={action.id}
            className={`action-card ${action.type} ${action.disabled ? 'disabled' : ''}`}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-content">
              <h4>{action.title}</h4>
              <p>{action.description}</p>
              {action.amount && (
                <div className="action-amount">${action.amount}</div>
              )}
            </div>
            <button 
              className={`action-btn ${action.type}`}
              onClick={() => handleAction(action)}
              disabled={action.disabled || pendingAction === action.id}
            >
              {pendingAction === action.id ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                action.amount ? `Claim $${action.amount}` : 'Execute'
              )}
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .quick-actions-panel {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #00D4FF;
          border-radius: 15px;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        .actions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .actions-header h3 {
          color: #00D4FF;
          margin: 0;
          font-size: 1.3rem;
        }

        .actions-count {
          background: rgba(0, 212, 255, 0.2);
          color: #00D4FF;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.2s ease;
          position: relative;
        }

        .action-card:not(.disabled):hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #00D4FF;
          transform: translateY(-2px);
        }

        .action-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          background: rgba(0, 212, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
        }

        .action-content h4 {
          margin: 0 0 5px 0;
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .action-content p {
          margin: 0;
          color: #ccc;
          font-size: 12px;
        }

        .action-amount {
          color: #00FF88;
          font-weight: bold;
          font-size: 14px;
          margin-top: 5px;
        }

        .action-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .action-btn.primary {
          background: linear-gradient(45deg, #00D4FF, #0099CC);
          color: white;
        }

        .action-btn.secondary {
          background: transparent;
          color: #00D4FF;
          border: 1px solid #00D4FF;
        }

        .action-btn:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .action-btn.primary:hover {
          background: linear-gradient(45deg, #00b8e6, #0088bb);
        }

        .action-btn.secondary:hover {
          background: rgba(0, 212, 255, 0.1);
        }

        .action-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .actions-grid {
            grid-template-columns: 1fr;
          }
          
          .action-card {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
          
          .actions-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default QuickActionsPanel;
