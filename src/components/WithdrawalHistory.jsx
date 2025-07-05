import React, { useState } from 'react';
import { FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './WithdrawalHistory.css';

export default function WithdrawalHistory({ account }) {
  const [history] = useState([]);

  const getStatusIcon = status => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'failed':
        return <FaExclamationCircle className="status-icon failed" />;
      default:
        return null;
    }
  };

  const getStatusClass = status => {
    return `status-badge ${status}`;
  };

  return (
    <div className="withdrawal-history">
      <h3>Withdrawal History</h3>

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>
                  <span className="amount">
                    {item.amount} {item.currency}
                  </span>
                </td>
                <td>
                  <div className={getStatusClass(item.status)}>
                    {getStatusIcon(item.status)}
                    <span>{item.status}</span>
                  </div>
                </td>
                <td>
                  <a
                    href={`https://bscscan.com/tx/${item.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tx-link"
                  >
                    {item.txHash}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
        <div className="no-history">
          <p>No withdrawal history yet</p>
        </div>
      )}
    </div>
  );
}
