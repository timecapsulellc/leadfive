// LeadFive Withdrawal Panel Component
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './WithdrawalPanel.css';

const WithdrawalPanel = ({ 
    contract, 
    account, 
    userInfo, 
    dashboardData, 
    onRefresh 
}) => {
    const [withdrawalData, setWithdrawalData] = useState({
        availableBalance: '0',
        pendingWithdrawals: '0',
        totalWithdrawn: '0',
        minimumWithdrawal: '0.1',
        withdrawalFee: '0',
        canWithdraw: false
    });
    const [loading, setLoading] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (contract && account && userInfo) {
            fetchWithdrawalData();
        }
    }, [contract, account, userInfo]);

    const fetchWithdrawalData = async () => {
        if (!contract || !account) return;

        try {
            setLoading(true);
            setError('');
            
            // Get user's withdrawal information
            const user = await contract.users(account);
            const availableBalance = user.totalRewards || '0';
            const totalWithdrawn = user.totalWithdrawn || '0';
            
            // Get withdrawal settings
            let minimumWithdrawal = '0.1';
            let withdrawalFee = '0';
            
            try {
                minimumWithdrawal = await contract.minimumWithdrawal();
                minimumWithdrawal = ethers.formatEther(minimumWithdrawal);
            } catch (err) {
                console.log('Could not fetch minimum withdrawal:', err);
            }

            try {
                withdrawalFee = await contract.withdrawalFeePercent();
                withdrawalFee = withdrawalFee.toString();
            } catch (err) {
                console.log('Could not fetch withdrawal fee:', err);
            }

            const available = parseFloat(ethers.formatEther(availableBalance));
            const minimum = parseFloat(minimumWithdrawal);
            const canWithdraw = available >= minimum && user.isActive;

            setWithdrawalData({
                availableBalance: ethers.formatEther(availableBalance),
                pendingWithdrawals: '0', // This would need to be implemented in contract
                totalWithdrawn: ethers.formatEther(totalWithdrawn),
                minimumWithdrawal: minimumWithdrawal,
                withdrawalFee: withdrawalFee,
                canWithdraw: canWithdraw
            });

        } catch (err) {
            console.error('Failed to fetch withdrawal data:', err);
            setError('Failed to load withdrawal data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!contract || !withdrawAmount) return;

        try {
            setWithdrawing(true);
            setError('');
            setSuccess('');

            const amount = parseFloat(withdrawAmount);
            const available = parseFloat(withdrawalData.availableBalance);
            const minimum = parseFloat(withdrawalData.minimumWithdrawal);

            // Validation
            if (amount <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            if (amount < minimum) {
                throw new Error(`Minimum withdrawal is ${minimum} MATIC`);
            }
            if (amount > available) {
                throw new Error('Insufficient balance');
            }

            // Call withdraw function
            const amountWei = ethers.parseEther(withdrawAmount);
            const tx = await contract.withdraw(amountWei);
            
            setSuccess('Withdrawal request submitted! Transaction hash: ' + tx.hash);
            
            // Wait for transaction to complete
            await tx.wait();
            
            setSuccess('Withdrawal completed successfully!');
            setWithdrawAmount('');
            
            // Refresh data
            setTimeout(() => {
                fetchWithdrawalData();
                if (onRefresh) onRefresh();
            }, 2000);

        } catch (err) {
            console.error('Withdrawal failed:', err);
            setError('Withdrawal failed: ' + err.message);
        } finally {
            setWithdrawing(false);
        }
    };

    const handleMaxAmount = () => {
        setWithdrawAmount(withdrawalData.availableBalance);
    };

    const calculateFee = () => {
        if (!withdrawAmount || withdrawAmount === '') return '0';
        const amount = parseFloat(withdrawAmount);
        const feePercent = parseFloat(withdrawalData.withdrawalFee);
        return ((amount * feePercent) / 100).toFixed(4);
    };

    const calculateNetAmount = () => {
        if (!withdrawAmount || withdrawAmount === '') return '0';
        const amount = parseFloat(withdrawAmount);
        const fee = parseFloat(calculateFee());
        return (amount - fee).toFixed(4);
    };

    return (
        <div className="withdrawal-panel">
            <div className="withdrawal-header">
                <h2>💰 Withdrawal Panel</h2>
                <button 
                    onClick={fetchWithdrawalData} 
                    disabled={loading}
                    className="refresh-btn"
                >
                    {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
            </div>

            <div className="withdrawal-stats">
                <div className="stat-card available">
                    <div className="stat-icon">💳</div>
                    <div className="stat-info">
                        <h3>Available Balance</h3>
                        <div className="stat-value">${parseFloat(withdrawalData.availableBalance).toFixed(4)}</div>
                        <div className="stat-label">Ready for withdrawal</div>
                    </div>
                </div>

                <div className="stat-card withdrawn">
                    <div className="stat-icon">📤</div>
                    <div className="stat-info">
                        <h3>Total Withdrawn</h3>
                        <div className="stat-value">${parseFloat(withdrawalData.totalWithdrawn).toFixed(4)}</div>
                        <div className="stat-label">Lifetime withdrawals</div>
                    </div>
                </div>

                <div className="stat-card minimum">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-info">
                        <h3>Minimum Amount</h3>
                        <div className="stat-value">${parseFloat(withdrawalData.minimumWithdrawal).toFixed(2)}</div>
                        <div className="stat-label">Minimum per withdrawal</div>
                    </div>
                </div>

                <div className="stat-card fee">
                    <div className="stat-icon">💸</div>
                    <div className="stat-info">
                        <h3>Withdrawal Fee</h3>
                        <div className="stat-value">{withdrawalData.withdrawalFee}%</div>
                        <div className="stat-label">Platform fee</div>
                    </div>
                </div>
            </div>

            <div className="withdrawal-form">
                <h3>Request Withdrawal</h3>
                
                {error && (
                    <div className="error-message">
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        ✅ {success}
                    </div>
                )}

                <div className="form-group">
                    <label>Withdrawal Amount (MATIC)</label>
                    <div className="amount-input">
                        <input 
                            type="number" 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Enter amount to withdraw"
                            min={withdrawalData.minimumWithdrawal}
                            max={withdrawalData.availableBalance}
                            step="0.0001"
                            disabled={withdrawing || !withdrawalData.canWithdraw}
                        />
                        <button 
                            onClick={handleMaxAmount}
                            className="max-btn"
                            disabled={withdrawing || !withdrawalData.canWithdraw}
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {withdrawAmount && (
                    <div className="withdrawal-summary">
                        <div className="summary-item">
                            <span>Amount:</span>
                            <span>${parseFloat(withdrawAmount).toFixed(4)}</span>
                        </div>
                        <div className="summary-item">
                            <span>Fee ({withdrawalData.withdrawalFee}%):</span>
                            <span>${calculateFee()}</span>
                        </div>
                        <div className="summary-item total">
                            <span>Net Amount:</span>
                            <span>${calculateNetAmount()}</span>
                        </div>
                    </div>
                )}

                <div className="withdrawal-actions">
                    <button 
                        onClick={handleWithdraw}
                        disabled={
                            withdrawing || 
                            !withdrawAmount || 
                            parseFloat(withdrawAmount) <= 0 ||
                            parseFloat(withdrawAmount) < parseFloat(withdrawalData.minimumWithdrawal) ||
                            parseFloat(withdrawAmount) > parseFloat(withdrawalData.availableBalance) ||
                            !withdrawalData.canWithdraw
                        }
                        className="withdraw-btn"
                    >
                        {withdrawing ? '⏳ Processing...' : '💰 Withdraw'}
                    </button>
                </div>

                {!withdrawalData.canWithdraw && (
                    <div className="withdrawal-notice">
                        <h4>⚠️ Withdrawal Requirements</h4>
                        <ul>
                            <li>Minimum balance: ${withdrawalData.minimumWithdrawal}</li>
                            <li>Account must be active</li>
                            <li>Must have available rewards to withdraw</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="withdrawal-info">
                <h3>Withdrawal Information</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <h4>Processing Time</h4>
                        <p>Withdrawals are processed instantly on the blockchain. You will receive funds in your wallet immediately after transaction confirmation.</p>
                    </div>
                    <div className="info-item">
                        <h4>Gas Fees</h4>
                        <p>You will pay standard BSC gas fees for the withdrawal transaction. Platform fees are separate and deducted from your withdrawal amount.</p>
                    </div>
                    <div className="info-item">
                        <h4>Security</h4>
                        <p>All withdrawals are processed through smart contracts with no human intervention. Your funds are secure and transparent.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WithdrawalPanel;
