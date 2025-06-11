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
import '../../styles/global.css';

const Dashboard = () => {
  // Web3 wallet and contract hooks
  const wallet = useWallet();
  const contract = useContract();

  // You can pass wallet/contract state as props to children as needed
  return (
    <div className="unified-dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <OrphiChainLogo size="medium" autoRotate backgroundColor="transparent" />
      </div>
      <h1 className="dashboard-title">OrphiChain Ultimate Dashboard</h1>
      <WalletConnection />
      <div className="dashboard-grid">
        <div>
          <EarningsOverview wallet={wallet} contract={contract} />
          <WithdrawalPanel wallet={wallet} contract={contract} />
        </div>
        <div>
          <MatrixVisualization wallet={wallet} contract={contract} />
          <ReferralManager wallet={wallet} contract={contract} />
          <TeamOverview wallet={wallet} contract={contract} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
