
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import WhitepaperUpload from './WhitepaperUpload';
import Web3Service from '../../services/Web3Service';
import { toast } from 'react-toastify';

const AdminDashboard = ({ wallet }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    globalHelpPoolBalance: 0,
    leaderBonusPoolBalance: 0
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (wallet?.account) {
        try {
          const adminStatus = await Web3Service.isAdmin(wallet.account);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    checkAdminStatus();
  }, [wallet?.account]);

  const adminFunctions = {
    distributeGlobalHelpPool: async () => {
      if (!isAdmin) {
        toast.error('Admin access required');
        return;
      }

      setLoading(true);
      try {
        const result = await Web3Service.distributeGlobalHelpPool();
        toast.success(`Global Help Pool distributed! Tx: ${result.hash}`);
        console.log('Distribution result:', result);
      } catch (error) {
        console.error('Error distributing global help pool:', error);
        toast.error(`Distribution failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    
    distributeLeaderBonus: async () => {
      if (!isAdmin) {
        toast.error('Admin access required');
        return;
      }

      setLoading(true);
      try {
        const result = await Web3Service.distributeLeaderBonus();
        toast.success(`Leader Bonus distributed! Tx: ${result.hash}`);
        console.log('Distribution result:', result);
      } catch (error) {
        console.error('Error distributing leader bonus:', error);
        toast.error(`Distribution failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    
    pauseContract: async () => {
      if (!isAdmin) {
        toast.error('Admin access required');
        return;
      }

      if (!window.confirm('Are you sure you want to pause the contract? This is an emergency action.')) {
        return;
      }

      setLoading(true);
      try {
        const result = await Web3Service.pauseContract();
        toast.success(`Contract paused! Tx: ${result.hash}`);
        console.log('Pause result:', result);
      } catch (error) {
        console.error('Error pausing contract:', error);
        toast.error(`Pause failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!wallet?.account) {
    return (
      <div className="admin-dashboard card">
        <h2>🔧 Admin Dashboard</h2>
        <p>Please connect your wallet to access admin features.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard card">
        <h2>🔧 Admin Dashboard</h2>
        <div className="access-denied">
          <p>❌ Access Denied</p>
          <p>This section is restricted to contract administrators.</p>
          <p>Connected Address: {Web3Service.formatAddress(wallet.account)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard card">
      <h2>🔧 Admin Dashboard</h2>
      <p className="admin-welcome">Welcome, Administrator! 👑</p>
      
      {loading && <LoadingSpinner size={32} />}
      
      <div className="admin-sections">
        <div className="admin-section">
          <h3>💰 Pool Distribution</h3>
          <div className="admin-buttons">
            <Button 
              onClick={adminFunctions.distributeGlobalHelpPool}
              disabled={loading}
              className="btn-primary"
            >
              Distribute Global Help Pool
            </Button>
            <Button 
              onClick={adminFunctions.distributeLeaderBonus}
              disabled={loading}
              className="btn-primary"
            >
              Distribute Leader Bonus
            </Button>
          </div>
        </div>

        <div className="admin-section">
          <h3>⚠️ System Management</h3>
          <div className="admin-buttons">
            <Button 
              onClick={adminFunctions.pauseContract}
              disabled={loading}
              className="btn-danger"
            >
              🚨 Emergency Pause
            </Button>
          </div>
          <p className="warning-text">
            ⚠️ Emergency pause should only be used in critical situations
          </p>
        </div>

        <div className="admin-section">
          <h3>📊 System Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{systemStats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Deposited</div>
              <div className="stat-value">${systemStats.totalDeposited.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Withdrawn</div>
              <div className="stat-value">${systemStats.totalWithdrawn.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Global Help Pool</div>
              <div className="stat-value">${systemStats.globalHelpPoolBalance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <WhitepaperUpload isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default AdminDashboard;
