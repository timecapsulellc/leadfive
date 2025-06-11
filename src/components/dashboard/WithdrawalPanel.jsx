import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../common/LoadingSpinner';

const withdrawalRates = {
  '0-4': { withdraw: 70, reinvest: 30 },
  '5-19': { withdraw: 75, reinvest: 25 },
  '20+': { withdraw: 80, reinvest: 20 }
};

function getRate(referrals) {
  if (referrals >= 20) return withdrawalRates['20+'];
  if (referrals >= 5) return withdrawalRates['5-19'];
  return withdrawalRates['0-4'];
}

const WithdrawalPanel = ({ wallet, contract }) => {
  const [referrals, setReferrals] = useState(0);
  const [amount, setAmount] = useState(0);
  const [withdrawable, setWithdrawable] = useState(0);
  const [txStatus, setTxStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWithdrawable = async () => {
      if (!wallet?.account || !contract) {
        // Set demo data when wallet is not connected
        setWithdrawable(0);
        setReferrals(0);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const info = await contract.getUserInfo(wallet.account);
        setWithdrawable(Number(info.withdrawableAmount) / 1e18);
        setReferrals(Number(info.directReferrals));
      } catch (err) {
        console.error('Error fetching withdrawal info:', err);
        setError('Failed to fetch withdrawable amount');
        // Set demo data on error
        setWithdrawable(0);
        setReferrals(0);
      }
      setLoading(false);
    };
    fetchWithdrawable();
  }, [wallet?.account, contract]);

  const rate = getRate(referrals);
  const withdrawableDisplay = Math.min(amount || 0, withdrawable);
  const reinvestAmount = (withdrawableDisplay * rate.reinvest) / 100;
  const withdrawAmount = (withdrawableDisplay * rate.withdraw) / 100;

  const handleWithdraw = async () => {
    if (!wallet?.account || !contract) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > withdrawable) {
      toast.error('Amount exceeds withdrawable balance');
      return;
    }

    setLoading(true);
    setTxStatus('Processing withdrawal...');
    try {
      const tx = await contract.withdraw(withdrawableDisplay * 1e18);
      setTxStatus('Transaction sent. Waiting for confirmation...');
      await tx.wait();
      setTxStatus('Withdrawal successful!');
      toast.success('Withdrawal successful!');
    } catch (err) {
      setTxStatus('Withdrawal failed.');
      toast.error('Withdrawal failed.');
    }
    setLoading(false);
  };

  return (
    <div className="withdrawal-panel card">
      <h2>💳 Withdrawal Interface</h2>
      {loading && <LoadingSpinner size={32} />}
      
      {error && (
        <div className="error-message" style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--accent-bg)', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      
      <div className="withdrawal-section">
        <div className="withdrawal-amounts">
          <div className="amount-display">
            <div className="label">Available Balance</div>
            <div className="value">${withdrawable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="amount-display">
            <div className="label">Direct Referrals</div>
            <div className="value">{referrals}</div>
          </div>
        </div>

        <div className="withdrawal-rates">
          <h3>Current Withdrawal Rate</h3>
          <div className="rate-info">
            <div className="rate-item">
              <span className="rate-label">Withdrawal:</span>
              <span className="rate-value">{rate.withdraw}%</span>
            </div>
            <div className="rate-item">
              <span className="rate-label">Auto-Reinvest:</span>
              <span className="rate-value">{rate.reinvest}%</span>
            </div>
          </div>
        </div>

        <div className="withdrawal-input">
          <label htmlFor="withdraw-amount">Withdrawal Amount (USDT)</label>
          <input 
            id="withdraw-amount"
            type="number" 
            value={amount || ''} 
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount to withdraw"
            min="0"
            max={withdrawable}
            step="0.01"
            className="withdrawal-input-field"
          />
        </div>

        {amount > 0 && (
          <div className="withdrawal-breakdown">
            <div className="breakdown-item">
              <span>You will receive:</span>
              <span className="breakdown-value">${withdrawAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="breakdown-item">
              <span>Auto-reinvested:</span>
              <span className="breakdown-value">${reinvestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        <Button 
          onClick={handleWithdraw}
          disabled={loading || !amount || amount <= 0 || amount > withdrawable}
          className="btn-primary withdrawal-btn"
        >
          {loading ? 'Processing...' : 'Withdraw'}
        </Button>

        {txStatus && (
          <div className="tx-status" style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: 'var(--accent-bg)', 
            borderRadius: '8px',
            color: txStatus.includes('successful') ? 'var(--success-color)' : 'var(--text-secondary)'
          }}>
            {txStatus}
          </div>
        )}
      </div>
      
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default WithdrawalPanel;
