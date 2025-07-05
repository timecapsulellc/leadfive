import React from 'react';

/**
 * TransactionStatus - Shows recent transactions and their status
 * Props: transactions, deviceInfo
 */
function TransactionStatus({ transactions, deviceInfo }) {
  return (
    <div className="transaction-status">
      <h3>Recent Transactions</h3>
      <ul className="transaction-list">
        {transactions.map(tx => (
          <li key={tx.id} className={`transaction-item status-${tx.status}`}>
            <span className="tx-type">{tx.type}</span>
            <span className="tx-user">{tx.user}</span>
            <span className="tx-amount">${tx.amount}</span>
            <span className="tx-status">{tx.status}</span>
            <span className="tx-time">
              {new Date(tx.timestamp).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionStatus;
