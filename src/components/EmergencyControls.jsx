import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatUnits, parseUnits } from 'ethers';
import { toast } from 'react-toastify';

const EmergencyControls = () => {
  const { web3, contract, account, isAdmin } = useWeb3();
  const [emergencyStatus, setEmergencyStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newFee, setNewFee] = useState('');
  const [newLimit, setNewLimit] = useState('');

  useEffect(() => {
    if (contract && account) {
      fetchEmergencyStatus();
    }
  }, [contract, account]);

  const fetchEmergencyStatus = async () => {
    try {
      const [mode, fee, limit] = await Promise.all([
        contract.methods.emergencyMode().call(),
        contract.methods.emergencyFee().call(),
        contract.methods.withdrawalLimit().call()
      ]);

      setEmergencyStatus({
        isActive: mode,
        fee: fee / 100, // Convert from basis points to percentage
        withdrawalLimit: formatUnits(limit, 6)
      });
    } catch (error) {
      console.error('Error fetching emergency status:', error);
      toast.error('Failed to fetch emergency status');
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!contract || !account) return;
    
    setLoading(true);
    try {
      const tx = await contract.methods.emergencyWithdraw().send({ from: account });
      toast.success('Emergency withdrawal successful!');
    } catch (error) {
      console.error('Error during emergency withdrawal:', error);
      toast.error('Failed to perform emergency withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmergencyMode = async () => {
    if (!contract || !account || !isAdmin) return;
    
    setLoading(true);
    try {
      const tx = await contract.methods.toggleEmergencyMode().send({ from: account });
      toast.success('Emergency mode toggled successfully!');
      await fetchEmergencyStatus();
    } catch (error) {
      console.error('Error toggling emergency mode:', error);
      toast.error('Failed to toggle emergency mode');
    } finally {
      setLoading(false);
    }
  };

  const handleSetEmergencyFee = async () => {
    if (!contract || !account || !isAdmin || !newFee) return;
    
    const fee = parseFloat(newFee);
    if (isNaN(fee) || fee < 0 || fee > 10) {
      toast.error('Fee must be between 0 and 10');
      return;
    }

    setLoading(true);
    try {
      const feeBasisPoints = Math.floor(fee * 100);
      const tx = await contract.methods.setEmergencyFee(feeBasisPoints).send({ from: account });
      toast.success('Emergency fee updated successfully!');
      setNewFee('');
      await fetchEmergencyStatus();
    } catch (error) {
      console.error('Error setting emergency fee:', error);
      toast.error('Failed to update emergency fee');
    } finally {
      setLoading(false);
    }
  };

  const handleSetWithdrawalLimit = async () => {
    if (!contract || !account || !isAdmin || !newLimit) return;
    
    setLoading(true);
    try {
      const limitWei = parseUnits(newLimit, 6);
      const tx = await contract.methods.setWithdrawalLimit(limitWei).send({ from: account });
      toast.success('Withdrawal limit updated successfully!');
      setNewLimit('');
      await fetchEmergencyStatus();
    } catch (error) {
      console.error('Error setting withdrawal limit:', error);
      toast.error('Failed to update withdrawal limit');
    } finally {
      setLoading(false);
    }
  };

  if (!emergencyStatus) {
    return <div className="loading">Loading emergency controls...</div>;
  }

  return (
    <div className="emergency-controls-container">
      <h2>Emergency Controls</h2>
      
      <div className="emergency-status">
        <div className="status-card">
          <h3>Emergency Mode</h3>
          <p className={emergencyStatus.isActive ? 'active' : 'inactive'}>
            {emergencyStatus.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        
        <div className="status-card">
          <h3>Emergency Fee</h3>
          <p>{emergencyStatus.fee}%</p>
        </div>
        
        <div className="status-card">
          <h3>Withdrawal Limit</h3>
          <p>{emergencyStatus.withdrawalLimit} USDT</p>
        </div>
      </div>

      <button 
        className="emergency-withdraw-button"
        onClick={handleEmergencyWithdraw}
        disabled={loading || !emergencyStatus.isActive}
      >
        {loading ? 'Processing...' : 'Emergency Withdraw'}
      </button>

      {isAdmin && (
        <div className="admin-controls">
          <button 
            className="toggle-emergency-button"
            onClick={handleToggleEmergencyMode}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Turn ${emergencyStatus.isActive ? 'Off' : 'On'} Emergency Mode`}
          </button>

          <div className="fee-control">
            <input
              type="number"
              placeholder="New emergency fee (0-10)"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              min="0"
              max="10"
              step="0.1"
            />
            <button
              onClick={handleSetEmergencyFee}
              disabled={loading || !newFee}
            >
              {loading ? 'Updating...' : 'Update Fee'}
            </button>
          </div>

          <div className="limit-control">
            <input
              type="number"
              placeholder="New withdrawal limit"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              min="0"
              step="0.01"
            />
            <button
              onClick={handleSetWithdrawalLimit}
              disabled={loading || !newLimit}
            >
              {loading ? 'Updating...' : 'Update Limit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyControls; 