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
      if (!wallet?.account || !contract) return;
      setLoading(true);
      setError(null);
      try {
        const info = await contract.getUserInfo(wallet.account);
        setWithdrawable(Number(info.withdrawableAmount) / 1e18);
        setReferrals(Number(info.directReferrals));
      } catch (err) {
        setError('Failed to fetch withdrawable amount');
      }
      setLoading(false);
    };
    fetchWithdrawable();
  }, [wallet?.account, contract]);

  const rate = getRate(referrals);
  const withdrawableDisplay = Math.min(amount, withdrawable);
  const reinvest = (withdrawableDisplay * rate.reinvest) / 100;

  const handleWithdraw = async () => {
    if (!wallet?.account || !contract) return;
    setLoading(true);
    setTxStatus('');
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
      <h2>Withdrawal Interface</h2>
      {loading ? (
        <LoadingSpinner size={32} />
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <label>Direct Referrals: </label>
            <input type="number" value={referrals} min={0} readOnly style={{ width: 60 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Amount: </label>
            <input type="number" value={amount} min={0} max={withdrawable} onChange={e => setAmount(Number(e.target.value))} style={{ width: 100 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Withdrawal Rate:</b> {rate.withdraw}% &nbsp; <b>Reinvest:</b> {rate.reinvest}%
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Withdrawable:</b> ${withdrawableDisplay.toFixed(2)} &nbsp; <b>Reinvested:</b> ${reinvest.toFixed(2)}
          </div>
          <Button onClick={handleWithdraw} disabled={amount <= 0 || loading || amount > withdrawable} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Processing...' : 'Withdraw'}
          </Button>
          {txStatus && <div style={{ marginTop: 8, color: txStatus.includes('failed') ? 'red' : '#00D4FF' }}>{txStatus}</div>}
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default WithdrawalPanel;
