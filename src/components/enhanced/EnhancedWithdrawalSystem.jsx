/**
 * Enhanced Collections System - Advanced Collections Management
 * Implements 5% treasury fee on collection portion only
 * Introduction-based splits: 70/30, 75/25, 80/20
 * Auto-compound functionality with 5% bonus
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers, parseUnits, formatUnits } from 'ethers';
import {
  FaWallet,
  FaCalculator,
  FaRocket,
  FaCoins,
  FaChartPie,
  FaToggleOn,
  FaToggleOff,
  FaHistory,
  FaInfoCircle,
  FaGem,
  FaPercentage,
  FaDollarSign,
  FaSync,
  FaBolt,
} from 'react-icons/fa';
import '../styles/EnhancedWithdrawal.css';

const EnhancedCollectionsSystem = ({
  userAddress,
  contractInstance,
  userInfo,
  onWithdrawal,
  balance = 0,
}) => {
  // State management
  const [collectionAmount, setCollectionAmount] = useState('');
  const [autoCompoundEnabled, setAutoCompoundEnabled] = useState(false);
  const [collectionSplit, setCollectionSplit] = useState({
    collect: 70,
    reinvest: 30,
  });
  const [introductionCount, setIntroductionCount] = useState(0);
  const [calculations, setCalculations] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [collectionHistory, setCollectionHistory] = useState([]);
  const [treasuryWallet, setTreasuryWallet] = useState('');
  const [totalFeesCollected, setTotalFeesCollected] = useState(0);

  // Load user collection data
  useEffect(() => {
    if (userAddress && contractInstance) {
      loadCollectionData();
    }
  }, [userAddress, contractInstance]);

  const loadCollectionData = async () => {
    try {
      // Fetch user's collection configuration
      const [split] = await contractInstance.getWithdrawalSplit(userAddress);
      const introductions =
        await contractInstance.getUserReferralCount(userAddress);
      const autoCompound =
        await contractInstance.isAutoCompoundEnabled(userAddress);
      const treasury = await contractInstance.getTreasuryWallet();
      const fees = await contractInstance.totalAdminFeesCollected();

      setCollectionSplit({
        collect: split[0].toNumber(),
        reinvest: split[1].toNumber(),
      });
      setIntroductionCount(introductions.toNumber());
      setAutoCompoundEnabled(autoCompound);
      setTreasuryWallet(treasury);
      setTotalFeesCollected(fees);

      // Load withdrawal history
      const history = await loadWithdrawalHistory(userAddress);
      setCollectionHistory(history);
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      // Use demo data for development
      setCollectionSplit({ collect: 70, reinvest: 30 });
      setIntroductionCount(3);
      setAutoCompoundEnabled(false);
    }
  };

  // Calculate withdrawal breakdown in real-time
  const withdrawalBreakdown = useMemo(() => {
    if (!collectionAmount || parseFloat(collectionAmount) <= 0) return null;

    const amount = parseFloat(collectionAmount);
    const { collect: withdrawPercent, reinvest: reinvestPercent } =
      collectionSplit;

    // Calculate amounts based on corrected specification
    const withdrawAmount = (amount * withdrawPercent) / 100;
    const adminFee = (withdrawAmount * 5) / 100; // 5% fee ONLY on withdrawal portion
    const userReceives = withdrawAmount - adminFee;
    const reinvestAmount = (amount * reinvestPercent) / 100;

    // Auto-compound bonus calculation
    const compoundBonus = autoCompoundEnabled ? (reinvestAmount * 5) / 100 : 0;
    const totalReinvest = reinvestAmount + compoundBonus;

    return {
      totalAmount: amount,
      withdrawAmount: withdrawAmount,
      adminFee: adminFee,
      userReceives: userReceives,
      reinvestAmount: reinvestAmount,
      compoundBonus: compoundBonus,
      totalReinvest: totalReinvest,
      feePercentage: (adminFee / amount) * 100,
      split: `${withdrawPercent}/${reinvestPercent}`,
    };
  }, [collectionAmount, collectionSplit, autoCompoundEnabled]);

  // Handle auto-compound toggle
  const handleAutoCompoundToggle = async () => {
    try {
      setIsProcessing(true);
      await contractInstance.toggleAutoCompound(!autoCompoundEnabled);
      setAutoCompoundEnabled(!autoCompoundEnabled);

      // Update split when auto-compound changes
      if (!autoCompoundEnabled) {
        setCollectionSplit({ collect: 0, reinvest: 100 });
      } else {
        // Restore based on referral count
        const newSplit = calculateSplitByReferrals(introductionCount);
        setCollectionSplit(newSplit);
      }
    } catch (error) {
      console.error('Error toggling auto-compound:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute enhanced withdrawal
  const handleWithdrawal = async () => {
    if (!collectionAmount || parseFloat(collectionAmount) <= 0) return;

    try {
      setIsProcessing(true);
      const amount = parseFloat(collectionAmount);

      // Convert to wei for contract interaction
      const amountWei = parseUnits(amount.toString(), 18);

      // Execute enhanced withdrawal
      const tx = await contractInstance.withdrawEnhanced(amountWei);
      await tx.wait();

      // Update history and reset form
      await loadCollectionData();
      setCollectionAmount('');

      if (onWithdrawal) {
        onWithdrawal(withdrawalBreakdown);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate split based on referral count
  const calculateSplitByReferrals = referrals => {
    if (referrals >= 20) return { withdraw: 80, reinvest: 20 };
    if (referrals >= 5) return { withdraw: 75, reinvest: 25 };
    return { withdraw: 70, reinvest: 30 };
  };

  // Withdrawal form component
  const WithdrawalForm = () => (
    <div className="withdrawal-form">
      <div className="form-header">
        <h3>💰 Enhanced Withdrawal</h3>
        <div className="balance-display">
          <span>Available Balance:</span>
          <strong>${balance.toFixed(2)} USDT</strong>
        </div>
      </div>

      <div className="amount-input-section">
        <div className="input-group">
          <label>Withdrawal Amount</label>
          <div className="amount-input-wrapper">
            <FaDollarSign className="currency-icon" />
            <input
              type="number"
              value={collectionAmount}
              onChange={e => setCollectionAmount(e.target.value)}
              placeholder="Enter amount..."
              max={balance}
              step="0.01"
            />
            <span className="currency-label">USDT</span>
          </div>
          <div className="quick-amounts">
            <button
              onClick={() => setCollectionAmount((balance * 0.25).toFixed(2))}
            >
              25%
            </button>
            <button
              onClick={() => setCollectionAmount((balance * 0.5).toFixed(2))}
            >
              50%
            </button>
            <button
              onClick={() => setCollectionAmount((balance * 0.75).toFixed(2))}
            >
              75%
            </button>
            <button onClick={() => setCollectionAmount(balance.toFixed(2))}>
              Max
            </button>
          </div>
        </div>

        <div className="auto-compound-toggle">
          <div className="toggle-header">
            <span>Auto-Compound Mode</span>
            <button
              className={`toggle-btn ${autoCompoundEnabled ? 'active' : ''}`}
              onClick={handleAutoCompoundToggle}
              disabled={isProcessing}
            >
              {autoCompoundEnabled ? <FaToggleOn /> : <FaToggleOff />}
              {autoCompoundEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <p className="toggle-description">
            {autoCompoundEnabled
              ? '🚀 All funds will be reinvested with 5% bonus!'
              : '💰 Funds will be split based on your referral tier'}
          </p>
        </div>
      </div>

      {withdrawalBreakdown && (
        <WithdrawalBreakdown breakdown={withdrawalBreakdown} />
      )}

      <button
        className={`withdrawal-btn ${!collectionAmount || isProcessing ? 'disabled' : ''}`}
        onClick={handleWithdrawal}
        disabled={
          !collectionAmount ||
          isProcessing ||
          parseFloat(collectionAmount) > balance
        }
      >
        {isProcessing ? <FaSync className="spinning" /> : <FaWallet />}
        {isProcessing ? 'Processing...' : 'Execute Withdrawal'}
      </button>
    </div>
  );

  // Withdrawal breakdown display
  const WithdrawalBreakdown = ({ breakdown }) => (
    <div className="withdrawal-breakdown">
      <div className="breakdown-header">
        <FaCalculator className="breakdown-icon" />
        <h4>Withdrawal Breakdown</h4>
      </div>

      <div className="breakdown-grid">
        <div className="breakdown-section">
          <h5>💸 Withdrawal Portion ({breakdown.split.split('/')[0]}%)</h5>
          <div className="breakdown-item">
            <span>Gross Amount:</span>
            <strong>${breakdown.withdrawAmount.toFixed(2)}</strong>
          </div>
          <div className="breakdown-item fee">
            <span>Treasury Fee (5%):</span>
            <strong>-${breakdown.adminFee.toFixed(2)}</strong>
          </div>
          <div className="breakdown-item total">
            <span>You Receive:</span>
            <strong>${breakdown.userReceives.toFixed(2)}</strong>
          </div>
        </div>

        <div className="breakdown-section">
          <h5>🔄 Reinvestment Portion ({breakdown.split.split('/')[1]}%)</h5>
          <div className="breakdown-item">
            <span>Base Reinvestment:</span>
            <strong>${breakdown.reinvestAmount.toFixed(2)}</strong>
          </div>
          {breakdown.compoundBonus > 0 && (
            <div className="breakdown-item bonus">
              <span>Auto-Compound Bonus (5%):</span>
              <strong>+${breakdown.compoundBonus.toFixed(2)}</strong>
            </div>
          )}
          <div className="breakdown-item total">
            <span>Total Reinvested:</span>
            <strong>${breakdown.totalReinvest.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="breakdown-summary">
        <div className="summary-item">
          <span>Total Input:</span>
          <strong>${breakdown.totalAmount.toFixed(2)}</strong>
        </div>
        <div className="summary-item">
          <span>Effective Fee Rate:</span>
          <strong>{breakdown.feePercentage.toFixed(2)}%</strong>
        </div>
        <div className="summary-note">
          <FaInfoCircle />
          <span>Fee applies only to withdrawal portion, not total amount</span>
        </div>
      </div>
    </div>
  );

  // Referral tier display
  const ReferralTierStatus = () => (
    <div className="referral-tier-status">
      <div className="tier-header">
        <FaGem className="tier-icon" />
        <h4>Your Withdrawal Tier</h4>
      </div>

      <div className="tier-progress">
        <div className="tier-levels">
          <div
            className={`tier-level ${introductionCount >= 0 ? 'achieved' : ''}`}
          >
            <span className="tier-name">Starter</span>
            <span className="tier-split">70/30</span>
            <span className="tier-requirement">0+ referrals</span>
          </div>
          <div
            className={`tier-level ${introductionCount >= 5 ? 'achieved' : ''}`}
          >
            <span className="tier-name">Active</span>
            <span className="tier-split">75/25</span>
            <span className="tier-requirement">5+ referrals</span>
          </div>
          <div
            className={`tier-level ${introductionCount >= 20 ? 'achieved' : ''}`}
          >
            <span className="tier-name">Leader</span>
            <span className="tier-split">80/20</span>
            <span className="tier-requirement">20+ referrals</span>
          </div>
        </div>

        <div className="current-status">
          <div className="status-item">
            <span>Current Referrals:</span>
            <strong>{introductionCount}</strong>
          </div>
          <div className="status-item">
            <span>Current Split:</span>
            <strong>
              {collectionSplit.collect}/{collectionSplit.reinvest}
            </strong>
          </div>
          <div className="status-item">
            <span>Next Tier Progress:</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (introductionCount / (introductionCount >= 5 ? 20 : 5)) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Treasury information display
  const TreasuryInfo = () => (
    <div className="treasury-info">
      <div className="treasury-header">
        <FaCoins className="treasury-icon" />
        <h4>Treasury Information</h4>
      </div>

      <div className="treasury-stats">
        <div className="treasury-stat">
          <span>Treasury Wallet:</span>
          <code>{treasuryWallet}</code>
        </div>
        <div className="treasury-stat">
          <span>Total Fees Collected:</span>
          <strong>${totalFeesCollected.toFixed(2)} USDT</strong>
        </div>
        <div className="treasury-note">
          <FaInfoCircle />
          <span>Treasury funds support platform development and security</span>
        </div>
      </div>
    </div>
  );

  // Withdrawal history component
  const WithdrawalHistory = () => (
    <div className="withdrawal-history">
      <div className="history-header">
        <FaHistory className="history-icon" />
        <h4>Recent Withdrawals</h4>
      </div>

      {collectionHistory.length > 0 ? (
        <div className="history-list">
          {collectionHistory.slice(0, 5).map((withdrawal, index) => (
            <div key={index} className="history-item">
              <div className="history-info">
                <span className="history-amount">${withdrawal.amount}</span>
                <span className="history-date">{withdrawal.date}</span>
              </div>
              <div className="history-details">
                <span>Fee: ${withdrawal.fee}</span>
                <span>Split: {withdrawal.split}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-history">
          <p>No withdrawal history yet</p>
          <span>Your first withdrawal will appear here</span>
        </div>
      )}
    </div>
  );

  // Load withdrawal history (mock implementation)
  const loadWithdrawalHistory = async address => {
    // This would fetch actual history from contract events
    return [
      { amount: '150.00', fee: '7.50', split: '70/30', date: '2025-01-01' },
      { amount: '250.00', fee: '12.50', split: '75/25', date: '2024-12-28' },
      { amount: '100.00', fee: '5.00', split: '70/30', date: '2024-12-25' },
    ];
  };

  return (
    <div className="enhanced-withdrawal-system">
      <div className="withdrawal-header">
        <div className="header-info">
          <h2>💎 Enhanced Withdrawal System</h2>
          <p>Smart withdrawals with treasury fees and auto-compound options</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <FaPercentage />
            <span>5% Fee on Withdrawal Only</span>
          </div>
          <div className="stat-badge">
            <FaBolt />
            <span>Auto-Compound +5% Bonus</span>
          </div>
        </div>
      </div>

      <div className="withdrawal-grid">
        <div className="main-section">
          <WithdrawalForm />
          <ReferralTierStatus />
        </div>

        <div className="sidebar-section">
          <TreasuryInfo />
          <WithdrawalHistory />
        </div>
      </div>
    </div>
  );
};

export default EnhancedCollectionsSystem;
