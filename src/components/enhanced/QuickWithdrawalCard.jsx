import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import {
  FaWallet,
  FaDollarSign,
  FaRocket,
  FaChartLine,
  FaArrowRight,
  FaSync,
} from 'react-icons/fa';
import './QuickWithdrawalCard.css';

const QuickWithdrawalCard = ({ account, provider, balances, onWithdraw }) => {
  const navigate = useNavigate();
  const [quickAmount, setQuickAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalSuggestions, setWithdrawalSuggestions] = useState([]);

  // Generate smart withdrawal suggestions
  useEffect(() => {
    if (balances?.available) {
      const available = parseFloat(balances.available);
      const suggestions = [];

      if (available >= 10) suggestions.push({ amount: 10, label: 'Quick $10' });
      if (available >= 25) suggestions.push({ amount: 25, label: 'Quick $25' });
      if (available >= 50) suggestions.push({ amount: 50, label: 'Quick $50' });
      if (available >= 100)
        suggestions.push({ amount: 100, label: 'Quick $100' });

      // Add percentage-based suggestions
      if (available >= 20) {
        suggestions.push({
          amount: Math.floor(available * 0.25),
          label: '25% Available',
        });
        suggestions.push({
          amount: Math.floor(available * 0.5),
          label: '50% Available',
        });
      }

      const newSuggestions = suggestions.slice(0, 4); // Limit to 4 suggestions

      // Only update if suggestions have actually changed
      setWithdrawalSuggestions(prevSuggestions => {
        if (
          JSON.stringify(prevSuggestions) !== JSON.stringify(newSuggestions)
        ) {
          return newSuggestions;
        }
        return prevSuggestions;
      });
    } else {
      setWithdrawalSuggestions([]);
    }
  }, [balances?.available]); // Only depend on the specific value that changes

  const handleQuickWithdraw = async amount => {
    if (!account || !provider) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (amount > parseFloat(balances?.available || 0)) {
      toast.error('Insufficient balance for withdrawal');
      return;
    }

    setIsProcessing(true);
    try {
      // This would integrate with your withdrawal contract logic
      toast.success(`Quick withdrawal of ${amount} USDT initiated!`);

      // Call parent callback if provided
      if (onWithdraw) {
        onWithdraw(amount);
      }

      // For demo purposes, show success
      setTimeout(() => {
        setIsProcessing(false);
        toast.success('Quick withdrawal completed!');
      }, 2000);
    } catch (error) {
      console.error('Quick withdrawal error:', error);
      toast.error('Quick withdrawal failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleAdvancedWithdraw = () => {
    navigate('/withdrawals');
  };

  return (
    <div className="quick-withdrawal-card">
      <div className="quick-withdrawal-header">
        <div className="header-info">
          <h3>💰 Quick Withdrawal</h3>
          <p>Fast access to your earnings</p>
        </div>
        <div className="balance-summary">
          <div className="available-balance">
            <span className="balance-label">Available</span>
            <span className="balance-amount">
              {parseFloat(balances?.available || 0).toFixed(2)} USDT
            </span>
          </div>
        </div>
      </div>

      {parseFloat(balances?.available || 0) > 0 ? (
        <>
          {/* Quick Amount Suggestions */}
          <div className="quick-suggestions">
            <div className="suggestions-label">Quick Amounts:</div>
            <div className="suggestion-buttons">
              {withdrawalSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleQuickWithdraw(suggestion.amount)}
                  disabled={isProcessing}
                >
                  {suggestion.label}
                  <span className="suggestion-amount">
                    {suggestion.amount} USDT
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="custom-amount-section">
            <div className="custom-input-wrapper">
              <input
                type="number"
                placeholder="Enter custom amount"
                value={quickAmount}
                onChange={e => setQuickAmount(e.target.value)}
                max={balances?.available}
                step="0.01"
                className="custom-amount-input"
                disabled={isProcessing}
              />
              <button
                className="quick-withdraw-btn"
                onClick={() => handleQuickWithdraw(parseFloat(quickAmount))}
                disabled={
                  isProcessing ||
                  !quickAmount ||
                  parseFloat(quickAmount) <= 0 ||
                  parseFloat(quickAmount) > parseFloat(balances?.available || 0)
                }
              >
                {isProcessing ? (
                  <>
                    <FaSync className="spinning" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaRocket />
                    Quick Withdraw
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="advanced-options">
            <button className="advanced-btn" onClick={handleAdvancedWithdraw}>
              <FaChartLine />
              Advanced Withdrawal Options
              <FaArrowRight />
            </button>
          </div>
        </>
      ) : (
        <div className="no-balance-state">
          <div className="no-balance-icon">💳</div>
          <p>No funds available for withdrawal</p>
          <button
            className="earn-more-btn"
            onClick={() => navigate('/referrals')}
          >
            <FaDollarSign />
            Start Earning Now
          </button>
        </div>
      )}

      {/* Status Bar */}
      <div className="withdrawal-status-bar">
        <div className="status-item">
          <FaWallet />
          <span>Instant Processing</span>
        </div>
        <div className="status-item">
          <span>Min: 1 USDT</span>
        </div>
        <div className="status-item">
          <span>Fee: ~0.001 BNB</span>
        </div>
      </div>
    </div>
  );
};

export default QuickWithdrawalCard;
