import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaWallet,
  FaDollarSign,
  FaCoins,
  FaChartLine,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import './BalancePreviewCard.css';

const BalancePreviewCard = ({ account, balances, earnings, onRefresh }) => {
  const navigate = useNavigate();
  const [showBalances, setShowBalances] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatCurrency = (amount, decimals = 2) => {
    return parseFloat(amount || 0).toFixed(decimals);
  };

  const toggleBalanceVisibility = () => {
    setShowBalances(!showBalances);
  };

  const displayValue = value => {
    return showBalances ? value : '••••';
  };

  return (
    <div className="balance-preview-card">
      <div className="balance-header">
        <div className="header-title">
          <h3>💳 Wallet Overview</h3>
          <button
            className="visibility-toggle"
            onClick={toggleBalanceVisibility}
            title={showBalances ? 'Hide balances' : 'Show balances'}
          >
            {showBalances ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        <button
          className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <FaChartLine className={isRefreshing ? 'spinning' : ''} />
          {isRefreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      <div className="balance-grid">
        {/* Available for Withdrawal */}
        <div className="balance-item primary">
          <div className="balance-icon">
            <FaWallet />
          </div>
          <div className="balance-details">
            <div className="balance-label">Available</div>
            <div className="balance-value">
              {displayValue(`${formatCurrency(balances?.available)} USDT`)}
            </div>
            <div className="balance-subtitle">Ready to withdraw</div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="balance-item secondary">
          <div className="balance-icon">
            <FaDollarSign />
          </div>
          <div className="balance-details">
            <div className="balance-label">Total Earnings</div>
            <div className="balance-value">
              {displayValue(`${formatCurrency(earnings?.total)} USDT`)}
            </div>
            <div className="balance-subtitle">Lifetime earnings</div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="balance-item accent">
          <div className="balance-icon">
            <FaCoins />
          </div>
          <div className="balance-details">
            <div className="balance-label">Wallet USDT</div>
            <div className="balance-value">
              {displayValue(`${formatCurrency(balances?.USDT)} USDT`)}
            </div>
            <div className="balance-subtitle">In your wallet</div>
          </div>
        </div>

        {/* BNB Balance */}
        <div className="balance-item bnb">
          <div className="balance-icon">
            <FaCoins />
          </div>
          <div className="balance-details">
            <div className="balance-label">BNB</div>
            <div className="balance-value">
              {displayValue(`${formatCurrency(balances?.BNB, 4)} BNB`)}
            </div>
            <div className="balance-subtitle">For gas fees</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="action-btn primary"
          onClick={() => navigate('/withdrawals')}
          disabled={parseFloat(balances?.available || 0) <= 0}
        >
          <FaWallet />
          Withdraw Funds
        </button>
        <button
          className="action-btn secondary"
          onClick={() => navigate('/referrals')}
        >
          <FaDollarSign />
          Earn More
        </button>
      </div>

      {/* Status Indicators */}
      <div className="status-indicators">
        <div className="status-item">
          <div className="status-dot active"></div>
          <span>Wallet Connected</span>
        </div>
        <div className="status-item">
          <div className="status-dot active"></div>
          <span>BSC Network</span>
        </div>
        <div className="status-item">
          <div
            className={`status-dot ${parseFloat(balances?.available || 0) > 0 ? 'active' : 'inactive'}`}
          ></div>
          <span>Funds Available</span>
        </div>
      </div>
    </div>
  );
};

export default BalancePreviewCard;
