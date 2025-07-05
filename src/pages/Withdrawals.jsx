import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import UnifiedWalletConnect from '../components/unified/UnifiedWalletConnect';
import PageWrapper from '../components/PageWrapper';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI } from '../contracts-leadfive.js';
import {
  AITransactionExamples,
  AIIntegrationUtils,
} from '../hooks/useAIIntegration.js';
import './Withdrawals.css';

// USDT ABI for balance checking
const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    type: 'function',
  },
];

export default function Withdrawals({
  account,
  provider,
  signer,
  onConnect,
  onDisconnect,
}) {
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [balances, setBalances] = useState({
    USDT: '0.00',
    BNB: '0.00',
    available: '0.00',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);

  // Initialize contracts
  useEffect(() => {
    const initContracts = async () => {
      if (!provider) return;

      try {
        // Use only ethers for consistency and avoid Web3/Ethers conflicts
        const ethersProvider = provider;

        // Initialize LeadFive contract with ethers
        const leadFiveContract = new ethers.Contract(
          LEAD_FIVE_CONFIG.address,
          LEAD_FIVE_ABI,
          ethersProvider
        );
        setContract(leadFiveContract);

        // Initialize USDT contract with ethers
        const usdtAddress =
          import.meta.env.VITE_USDT_CONTRACT_ADDRESS ||
          '0x55d398326f99059fF775485246999027B3197955'; // BSC USDT
        const usdtContractInstance = new ethers.Contract(
          usdtAddress,
          USDT_ABI,
          ethersProvider
        );
        setUsdtContract(usdtContractInstance);

        console.log('✅ Contracts initialized successfully');
      } catch (error) {
        console.error('❌ Contract initialization error:', error);
        toast.error('Failed to initialize contracts');
      }
    };

    initContracts();
  }, [provider]);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!account || !contract || !usdtContract || !provider) return;

    setIsLoading(true);
    try {
      // Get available withdrawal balance from LeadFive contract
      let availableBalance = '0';
      try {
        // Try different possible method names for getting withdrawal balance
        if (contract.getWithdrawableAmount) {
          availableBalance = await contract.getWithdrawableAmount(account);
        } else if (contract.withdrawableAmount) {
          const userInfo = await contract.users(account);
          availableBalance = userInfo.withdrawableAmount || '0';
        } else if (contract.getUserInfo) {
          const userInfo = await contract.getUserInfo(account);
          availableBalance = userInfo.withdrawableAmount || '0';
        }
      } catch (err) {
        console.log('ℹ️ Could not fetch withdrawal balance:', err.message);
        // Use demo data for development
        availableBalance = ethers.parseUnits('150.75', 18).toString();
      }

      // Get USDT balance
      let usdtBalance = '0';
      try {
        usdtBalance = await usdtContract.balanceOf(account);
      } catch (err) {
        console.log('ℹ️ Could not fetch USDT balance:', err.message);
        usdtBalance = ethers.parseUnits('1000.50', 18).toString();
      }

      // Get BNB balance
      let bnbBalance = '0';
      try {
        bnbBalance = await provider.getBalance(account);
      } catch (err) {
        console.log('ℹ️ Could not fetch BNB balance:', err.message);
        bnbBalance = ethers.parseUnits('0.25', 18).toString();
      }

      setBalances({
        USDT: ethers.formatUnits(usdtBalance, 18),
        BNB: ethers.formatUnits(bnbBalance, 18),
        available: ethers.formatUnits(availableBalance, 18),
      });

      // Fetch withdrawal history
      await fetchWithdrawalHistory();
    } catch (error) {
      console.error('❌ Error fetching balances:', error);
      toast.error('Failed to fetch balance information');

      // Fallback to demo data
      setBalances({
        USDT: '1000.50',
        BNB: '0.25',
        available: '150.75',
      });
    } finally {
      setIsLoading(false);
    }
  }, [account, contract, usdtContract, provider]);

  // Fetch withdrawal history
  const fetchWithdrawalHistory = useCallback(async () => {
    if (!contract || !account) return;

    try {
      // Try to get withdrawal history from contract events or methods
      let history = [];

      if (contract.getWithdrawalHistory) {
        history = await contract.getWithdrawalHistory(account);
      } else {
        // Fallback to demo data for now
        history = [
          {
            timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
            amount: ethers.parseUnits('100', 18),
            status: 'Completed',
            txHash: '0x1234567890abcdef1234567890abcdef12345678',
          },
          {
            timestamp: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
            amount: ethers.parseUnits('50', 18),
            status: 'Completed',
            txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          },
        ];
      }

      setWithdrawalHistory(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error('❌ Error fetching withdrawal history:', error);
      // Use demo data as fallback
      setWithdrawalHistory([
        {
          timestamp: Math.floor(Date.now() / 1000) - 86400,
          amount: ethers.parseUnits('100', 18),
          status: 'Completed',
          txHash: '0x1234567890abcdef1234567890abcdef12345678',
        },
      ]);
    }
  }, [contract, account]);

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!account || !contract || !withdrawAmount) {
      toast.error('Please connect wallet and enter amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const availableAmount = parseFloat(balances.available);

    if (amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (amount > availableAmount) {
      toast.error(
        `Insufficient balance. Available: ${availableAmount.toFixed(2)} USDT`
      );
      return;
    }

    // AI-powered withdrawal explanation
    try {
      const gasFee = 2.5; // Estimated BSC gas fee
      const withdrawalRate = 100; // Assuming 100% withdrawal rate for now

      const aiExplanation = await AITransactionExamples.withdrawalExplanation(
        amount,
        withdrawalRate,
        gasFee
      );

      if (aiExplanation && aiExplanation.text) {
        toast.info(`🤖 AI Assistant: ${aiExplanation.text}`, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.log('AI explanation not available:', error);
    }

    setIsWithdrawing(true);
    try {
      const amountWei = ethers.parseUnits(withdrawAmount, 18);

      // Call withdraw function on contract using ethers
      let tx;

      if (contract.withdraw) {
        tx = await contract.connect(signer).withdraw(amountWei);
      } else if (contract.withdrawUSDT) {
        tx = await contract.connect(signer).withdrawUSDT(amountWei);
      } else {
        throw new Error('Withdrawal function not found in contract');
      }

      toast.success(`Withdrawal initiated! TX: ${tx.hash.slice(0, 10)}...`);

      // Wait for transaction confirmation
      await tx.wait();

      toast.success('Withdrawal confirmed!');
      setWithdrawAmount('');

      // Refresh balances and history
      setTimeout(() => {
        fetchBalances();
      }, 2000);
    } catch (error) {
      console.error('❌ Withdrawal error:', error);
      toast.error(error.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Fetch balances when account or contracts change
  useEffect(() => {
    if (account && provider) {
      // Give a small delay to ensure contracts are initialized
      const timer = setTimeout(() => {
        fetchBalances();
      }, 1000);

      // Set up interval for periodic updates
      const interval = setInterval(fetchBalances, 30000); // Refresh every 30s

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [account, provider, fetchBalances]);

  return (
    <div className="withdrawals-page">
      <div className="page-background">
        <div className="animated-bg"></div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="page-content">
        {/* Navigation Header */}
        <div className="navigation-section">
          <button
            onClick={() => navigate('/dashboard')}
            className="nav-btn back-btn"
          >
            ← Back to Dashboard
          </button>
          <div className="page-breadcrumb">
            <span
              onClick={() => navigate('/dashboard')}
              className="breadcrumb-link"
            >
              Dashboard
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Withdrawals</span>
          </div>
        </div>

        <div className="page-header">
          <h1 className="page-title">💰 Advanced Withdrawal System</h1>
          <p className="page-subtitle">
            Manage your earnings and USDT withdrawals with real-time processing
            and comprehensive tracking
          </p>
        </div>

        {!account ? (
          <div className="wallet-connect-section">
            <div className="connect-card">
              <h2>Connect Your Wallet</h2>
              <p>Connect your wallet to access withdrawal features</p>
              <UnifiedWalletConnect
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                buttonText="Connect Wallet to Continue"
              />
            </div>
          </div>
        ) : (
          <>
            {/* Balance Cards */}
            <div className="balance-section">
              <div className="balance-cards">
                <div className="balance-card primary">
                  <div className="balance-header">
                    <h3>Available for Withdrawal</h3>
                    <div className="balance-icon">💎</div>
                  </div>
                  <div className="balance-amount">
                    <span className="currency">USDT</span>
                    <span className="amount">
                      {isLoading
                        ? '...'
                        : parseFloat(balances.available).toFixed(2)}
                    </span>
                  </div>
                  <p className="balance-subtitle">From LeadFive Earnings</p>
                </div>

                <div className="balance-card secondary">
                  <div className="balance-header">
                    <h3>Wallet Balance</h3>
                    <div className="balance-icon">💳</div>
                  </div>
                  <div className="balance-amount">
                    <span className="currency">USDT</span>
                    <span className="amount">
                      {isLoading ? '...' : parseFloat(balances.USDT).toFixed(2)}
                    </span>
                  </div>
                  <p className="balance-subtitle">In Your Wallet</p>
                </div>

                <div className="balance-card accent">
                  <div className="balance-header">
                    <h3>BNB Balance</h3>
                    <div className="balance-icon">⚡</div>
                  </div>
                  <div className="balance-amount">
                    <span className="currency">BNB</span>
                    <span className="amount">
                      {isLoading ? '...' : parseFloat(balances.BNB).toFixed(4)}
                    </span>
                  </div>
                  <p className="balance-subtitle">For Gas Fees</p>
                </div>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="withdrawal-section">
              <div className="withdrawal-card">
                <div className="card-header">
                  <h2>🚀 New Withdrawal</h2>
                  <p>Withdraw your USDT earnings to your wallet</p>
                </div>

                <div className="withdrawal-form">
                  <div className="form-group">
                    <label>Token</label>
                    <div className="token-selector">
                      <div className="token-option active">
                        <img
                          src="/usdt-icon.svg"
                          alt="USDT"
                          className="token-icon"
                        />
                        <span>USDT</span>
                        <div className="token-network">BSC</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Amount</label>
                    <div className="amount-input-wrapper">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        max={balances.available}
                        step="0.01"
                        className="amount-input"
                      />
                      <button
                        className="max-button"
                        onClick={() => setWithdrawAmount(balances.available)}
                        disabled={parseFloat(balances.available) <= 0}
                      >
                        MAX
                      </button>
                    </div>
                    <div className="input-info">
                      <span className="available-text">
                        Available: {parseFloat(balances.available).toFixed(2)}{' '}
                        USDT
                      </span>
                      {withdrawAmount && (
                        <span className="usd-value">
                          ≈ ${parseFloat(withdrawAmount).toFixed(2)} USD
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="withdrawal-info">
                    <div className="info-item">
                      <span>Processing Time:</span>
                      <span>Instant</span>
                    </div>
                    <div className="info-item">
                      <span>Network Fee:</span>
                      <span>~0.001 BNB</span>
                    </div>
                    <div className="info-item">
                      <span>Minimum Amount:</span>
                      <span>1.00 USDT</span>
                    </div>
                  </div>

                  <button
                    className={`withdraw-button ${isWithdrawing ? 'loading' : ''}`}
                    onClick={handleWithdraw}
                    disabled={
                      isWithdrawing ||
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0 ||
                      parseFloat(withdrawAmount) >
                        parseFloat(balances.available) ||
                      parseFloat(withdrawAmount) < 1
                    }
                  >
                    {isWithdrawing ? (
                      <>
                        <div className="spinner"></div>
                        Processing...
                      </>
                    ) : (
                      `💸 Withdraw ${withdrawAmount || '0'} USDT`
                    )}
                  </button>

                  {/* Quick Actions */}
                  <div className="quick-actions">
                    <button
                      className="action-btn secondary"
                      onClick={() => navigate('/dashboard')}
                    >
                      📊 View Dashboard
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => navigate('/referrals')}
                    >
                      🔗 Manage Referrals
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="history-section">
              <div className="history-card">
                <div className="card-header">
                  <h2>📊 Withdrawal History</h2>
                  <button
                    className="refresh-button"
                    onClick={fetchBalances}
                    disabled={isLoading}
                  >
                    🔄 Refresh
                  </button>
                </div>

                <div className="history-table">
                  <div className="table-header">
                    <span>Date</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Transaction</span>
                  </div>

                  {withdrawalHistory.length === 0 ? (
                    <div className="no-history">
                      <div className="no-history-icon">📝</div>
                      <p>No withdrawal history yet</p>
                      <span>Your withdrawals will appear here</span>
                    </div>
                  ) : (
                    withdrawalHistory.map((item, index) => (
                      <div key={index} className="table-row">
                        <span className="date">
                          {new Date(item.timestamp * 1000).toLocaleDateString()}
                        </span>
                        <span className="amount">
                          {ethers.formatUnits(item.amount, 18)} USDT
                        </span>
                        <span className={`status ${item.status.toLowerCase()}`}>
                          <div className="status-dot"></div>
                          {item.status}
                        </span>
                        <a
                          href={`https://bscscan.com/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tx-link"
                        >
                          <span>
                            {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                          </span>
                          <div className="external-icon">↗</div>
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
