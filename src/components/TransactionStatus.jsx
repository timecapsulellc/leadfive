import React, { useState, useEffect } from 'react';
import {
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
} from 'react-icons/fa';
import './TransactionStatus.css';

const TransactionStatus = ({
  isVisible,
  onClose,
  transactionHash,
  status, // 'pending', 'success', 'error'
  message,
  explorerUrl = 'https://bscscan.com',
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <FaSpinner className="spin" />;
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      default:
        return <FaSpinner className="spin" />;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'success':
        return 'status-success';
      case 'error':
        return 'status-error';
      default:
        return 'status-pending';
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="transaction-status-overlay">
      <div className={`transaction-status-modal ${getStatusClass()}`}>
        <div className="status-header">
          <div className="status-icon">{getStatusIcon()}</div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="status-content">
          <h3>
            {status === 'pending' && 'Transaction Processing...'}
            {status === 'success' && 'Transaction Successful!'}
            {status === 'error' && 'Transaction Failed'}
          </h3>

          <p className="status-message">{message}</p>

          {status === 'pending' && (
            <div className="pending-info">
              <p>Time elapsed: {formatTime(timeElapsed)}</p>
              <p>Please wait while your transaction is being processed...</p>
            </div>
          )}

          {transactionHash && (
            <div className="transaction-details">
              <p>Transaction Hash:</p>
              <a
                href={`${explorerUrl}/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-hash-link"
              >
                {transactionHash.slice(0, 10)}...{transactionHash.slice(-10)}
              </a>
            </div>
          )}

          {status === 'success' && (
            <div className="success-actions">
              <button onClick={onClose} className="btn-primary">
                Continue
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="error-actions">
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
