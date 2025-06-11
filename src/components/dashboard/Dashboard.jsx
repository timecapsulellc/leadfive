import React from 'react';
import EarningsOverview from './EarningsOverview';
import MatrixVisualization from './MatrixVisualization';
import WithdrawalPanel from './WithdrawalPanel';
import ReferralManager from './ReferralManager';
import TeamOverview from './TeamOverview';
import WalletConnection from '../web3/WalletConnection';
import useWallet from '../../hooks/useWallet';
import useContract from '../../hooks/useContract';
import OrphiChainLogo from '../OrphiChainLogo';
import '../../styles/dashboard.css';
import '../../styles/dashboard-components.css';
import '../../styles/global.css';

const Dashboard = () => {
  // Web3 wallet and contract hooks
  const wallet = useWallet();
  const contract = useContract();

  return (
    <div className="unified-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <OrphiChainLogo size="medium" autoRotate backgroundColor="transparent" />
        </div>
        <h1 className="dashboard-title">OrphiChain Ultimate Dashboard</h1>
      </header>

      {/* Wallet Connection Section */}
      <section className="wallet-section">
        <WalletConnection />
      </section>

      {/* Main Dashboard Grid */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-column-left">
            <EarningsOverview wallet={wallet} contract={contract} />
            <WithdrawalPanel wallet={wallet} contract={contract} />
          </div>
          <div className="dashboard-column-right">
            <MatrixVisualization wallet={wallet} contract={contract} />
            <ReferralManager wallet={wallet} contract={contract} />
            <TeamOverview wallet={wallet} contract={contract} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
