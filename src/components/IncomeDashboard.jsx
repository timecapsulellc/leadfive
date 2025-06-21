import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './IncomeDashboard.css';

const IncomeDashboard = ({ account, contract, signer }) => {
  const [incomeStats, setIncomeStats] = useState({
    directIncome: '0',
    levelIncome: '0',
    matrixIncome: '0',
    matchingBonus: '0',
    leadershipBonus: '0',
    totalEarned: '0',
    totalWithdrawn: '0',
    availableBalance: '0'
  });

  const [levelBreakdown, setLevelBreakdown] = useState({
    uplineIncome: [],
    downlineIncome: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account && contract) {
      fetchIncomeData();
    }
  }, [account, contract]);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration (replace with actual contract calls)
      const mockStats = {
        directIncome: '1250.50',
        levelIncome: '875.25',
        matrixIncome: '450.75',
        matchingBonus: '320.00',
        leadershipBonus: '180.50',
        totalEarned: '3076.00',
        totalWithdrawn: '1200.00',
        availableBalance: '1876.00'
      };

      const mockLevelData = {
        uplineIncome: [
          { level: 1, amount: '125.50' },
          { level: 2, amount: '89.75' },
          { level: 3, amount: '67.25' },
          { level: 4, amount: '45.00' },
          { level: 5, amount: '32.50' }
        ],
        downlineIncome: [
          { level: 1, amount: '215.50' },
          { level: 2, amount: '189.75' },
          { level: 3, amount: '167.25' },
          { level: 4, amount: '145.00' },
          { level: 5, amount: '132.50' }
        ]
      };

      setIncomeStats(mockStats);
      setLevelBreakdown(mockLevelData);

    } catch (error) {
      console.error('Error fetching income data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      // Mock withdrawal (replace with actual contract call)
      console.log('Initiating withdrawal...');
      // const tx = await contract.withdraw();
      // await tx.wait();
      fetchIncomeData(); // Refresh data
    } catch (error) {
      console.error('Withdrawal error:', error);
    }
  };

  if (loading) {
    return <div className="income-loading">Loading income data...</div>;
  }

  return (
    <div className="income-dashboard">
      <h2 className="income-title">Income & Compensation Overview</h2>

      {/* Summary Cards */}
      <div className="income-summary-grid">
        <div className="income-card total-earned">
          <div className="income-icon">💰</div>
          <div className="income-details">
            <h3>Total Earned</h3>
            <p className="income-amount">{incomeStats.totalEarned} USDT</p>
          </div>
        </div>

        <div className="income-card available">
          <div className="income-icon">💵</div>
          <div className="income-details">
            <h3>Available Balance</h3>
            <p className="income-amount">{incomeStats.availableBalance} USDT</p>
          </div>
        </div>

        <div className="income-card withdrawn">
          <div className="income-icon">📤</div>
          <div className="income-details">
            <h3>Total Withdrawn</h3>
            <p className="income-amount">{incomeStats.totalWithdrawn} USDT</p>
          </div>
        </div>
      </div>

      {/* Income Types Breakdown */}
      <div className="income-types-section">
        <h3>Income Breakdown by Type</h3>
        <div className="income-types-grid">
          <div className="income-type-card">
            <span className="type-label">Direct Referral</span>
            <span className="type-amount">{incomeStats.directIncome} USDT</span>
            <div className="income-bar">
              <div className="income-fill direct" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div className="income-type-card">
            <span className="type-label">Level Income</span>
            <span className="type-amount">{incomeStats.levelIncome} USDT</span>
            <div className="income-bar">
              <div className="income-fill level" style={{ width: '50%' }}></div>
            </div>
          </div>

          <div className="income-type-card">
            <span className="type-label">Matrix Bonus</span>
            <span className="type-amount">{incomeStats.matrixIncome} USDT</span>
            <div className="income-bar">
              <div className="income-fill matrix" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="income-type-card">
            <span className="type-label">Matching Bonus</span>
            <span className="type-amount">{incomeStats.matchingBonus} USDT</span>
            <div className="income-bar">
              <div className="income-fill matching" style={{ width: '40%' }}></div>
            </div>
          </div>

          <div className="income-type-card">
            <span className="type-label">Leadership Pool</span>
            <span className="type-amount">{incomeStats.leadershipBonus} USDT</span>
            <div className="income-bar">
              <div className="income-fill leadership" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Income Breakdown */}
      <div className="level-income-section">
        <h3>Level-wise Income Distribution</h3>
        
        <div className="level-income-container">
          <div className="upline-income">
            <h4>Upline Income</h4>
            <div className="level-list">
              {levelBreakdown.uplineIncome.map((level) => (
                <div key={level.level} className="level-item">
                  <span className="level-name">Level {level.level}</span>
                  <span className="level-amount">{level.amount} USDT</span>
                </div>
              ))}
            </div>
          </div>

          <div className="downline-income">
            <h4>Downline Income</h4>
            <div className="level-list">
              {levelBreakdown.downlineIncome.map((level) => (
                <div key={level.level} className="level-item">
                  <span className="level-name">Level {level.level}</span>
                  <span className="level-amount">{level.amount} USDT</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      {parseFloat(incomeStats.availableBalance) > 0 && (
        <div className="withdraw-section">
          <button className="withdraw-btn" onClick={handleWithdraw}>
            Withdraw Available Balance
          </button>
        </div>
      )}
    </div>
  );
};

export default IncomeDashboard;
