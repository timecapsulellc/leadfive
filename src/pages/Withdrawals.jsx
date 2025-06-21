import React, { useState } from 'react';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';

export default function Withdrawals({ account, provider, signer, onConnect, onDisconnect }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [balance, setBalance] = useState({
    USDT: 1234.56,
    BNB: 0.45
  });

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }
    if (parseFloat(withdrawAmount) > balance[selectedToken]) {
      alert('Insufficient balance');
      return;
    }
    console.log(`Withdrawing ${withdrawAmount} ${selectedToken}`);
  };

  const withdrawalHistory = [
    { id: 1, date: '2025-06-20', amount: 500, token: 'USDT', status: 'Completed', txHash: '0x123...abc' },
    { id: 2, date: '2025-06-18', amount: 250, token: 'USDT', status: 'Completed', txHash: '0x456...def' },
    { id: 3, date: '2025-06-15', amount: 0.1, token: 'BNB', status: 'Completed', txHash: '0x789...ghi' }
  ];

  return (
    <div className="withdrawals-page">
      <div className="page-background">
        <div className="animated-bg"></div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Withdrawals</h1>
          <p className="page-subtitle">Manage your earnings and withdrawals</p>
        </div>

        {!account ? (
          <div className="wallet-connect-section">
            <UnifiedWalletConnect
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              buttonText="Connect Wallet to Withdraw"
            />
          </div>
        ) : (
          <>
            <div className="balance-cards">
              <div className="balance-card">
                <div className="balance-header">
                  <span className="balance-label">Available Balance</span>
                  <span className="balance-token">USDT</span>
                </div>
                <div className="balance-amount">${balance.USDT.toFixed(2)}</div>
              </div>
              <div className="balance-card">
                <div className="balance-header">
                  <span className="balance-label">Available Balance</span>
                  <span className="balance-token">BNB</span>
                </div>
                <div className="balance-amount">{balance.BNB} BNB</div>
              </div>
            </div>

            <div className="withdrawal-form">
              <h2>New Withdrawal</h2>
              <div className="form-group">
                <label>Select Token</label>
                <div className="token-selector">
                  <button
                    className={`token-btn ${selectedToken === 'USDT' ? 'active' : ''}`}
                    onClick={() => setSelectedToken('USDT')}
                  >
                    USDT
                  </button>
                  <button
                    className={`token-btn ${selectedToken === 'BNB' ? 'active' : ''}`}
                    onClick={() => setSelectedToken('BNB')}
                  >
                    BNB
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="amount-input"
                  />
                  <button
                    onClick={() => setWithdrawAmount(balance[selectedToken].toString())}
                    className="max-btn"
                  >
                    MAX
                  </button>
                </div>
                <div className="available-balance">
                  Available: {balance[selectedToken]} {selectedToken}
                </div>
              </div>

              <button className="withdraw-btn" onClick={handleWithdraw}>
                Withdraw {selectedToken}
              </button>
            </div>

            <div className="withdrawal-history">
              <h2>Withdrawal History</h2>
              <div className="history-table">
                <div className="table-header">
                  <div className="table-cell">Date</div>
                  <div className="table-cell">Amount</div>
                  <div className="table-cell">Status</div>
                  <div className="table-cell">Transaction</div>
                </div>
                {withdrawalHistory.map((tx) => (
                  <div key={tx.id} className="table-row">
                    <div className="table-cell">{tx.date}</div>
                    <div className="table-cell">{tx.amount} {tx.token}</div>
                    <div className="table-cell">
                      <span className="status-badge completed">{tx.status}</span>
                    </div>
                    <div className="table-cell">
                      <a href={`https://bscscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">
                        {tx.txHash}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
