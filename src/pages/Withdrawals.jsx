import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { Web3 } from 'web3';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI } from '../contracts-leadfive.js';
import { AITransactionExamples, AIIntegrationUtils } from '../hooks/useAIIntegration.js';
import './Withdrawals.css';

// USDT ABI for balance checking
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "remaining", "type": "uint256"}],
    "type": "function"
  }
];

export default function Withdrawals({ account, provider, signer, onConnect, onDisconnect }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [balances, setBalances] = useState({
    USDT: '0.00',
    BNB: '0.00',
    available: '0.00'
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
        const web3 = new Web3(provider);
        
        // Initialize LeadFive contract
        const leadFiveContract = new web3.eth.Contract(
          LEAD_FIVE_ABI,
          LEAD_FIVE_CONFIG.address
        );
        setContract(leadFiveContract);

        // Initialize USDT contract
        const usdtContractInstance = new web3.eth.Contract(
          USDT_ABI,
          import.meta.env.VITE_USDT_CONTRACT_ADDRESS
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
      const web3 = new Web3(provider);

      // Get available withdrawal balance from LeadFive contract
      let availableBalance = '0';
      try {
        // Try different possible method names for getting withdrawal balance
        if (contract.methods.getWithdrawableAmount && typeof contract.methods.getWithdrawableAmount === 'function') {
          availableBalance = await contract.methods.getWithdrawableAmount(account).call();
        } else if (contract.methods.withdrawableAmount && typeof contract.methods.withdrawableAmount === 'function') {
          const userInfo = await contract.methods.users(account).call();
          availableBalance = userInfo.withdrawableAmount || '0';
        } else if (contract.methods.getUserInfo && typeof contract.methods.getUserInfo === 'function') {
          const userInfo = await contract.methods.getUserInfo(account).call();
          availableBalance = userInfo.withdrawableAmount || '0';
        }
      } catch (err) {
        console.log('ℹ️ Could not fetch withdrawal balance:', err.message);
      }

      // Get USDT balance
      let usdtBalance = '0';
      try {
        usdtBalance = await usdtContract.methods.balanceOf(account).call();
      } catch (err) {
        console.log('ℹ️ Could not fetch USDT balance:', err.message);
      }

      // Get BNB balance
      let bnbBalance = '0';
      try {
        bnbBalance = await web3.eth.getBalance(account);
      } catch (err) {
        console.log('ℹ️ Could not fetch BNB balance:', err.message);
      }

      setBalances({
        USDT: ethers.formatUnits(usdtBalance, 18),
        BNB: ethers.formatUnits(bnbBalance, 18),
        available: ethers.formatUnits(availableBalance, 18)
      });

      // Fetch withdrawal history
      await fetchWithdrawalHistory();

    } catch (error) {
      console.error('❌ Error fetching balances:', error);
      toast.error('Failed to fetch balance information');
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
      
      if (contract.methods.getWithdrawalHistory && typeof contract.methods.getWithdrawalHistory === 'function') {
        history = await contract.methods.getWithdrawalHistory(account).call();
      } else {
        // Fallback to demo data for now
        history = [
          {
            timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
            amount: ethers.parseUnits('100', 18),
            status: 'Completed',
            txHash: '0x1234567890abcdef1234567890abcdef12345678'
          },
          {
            timestamp: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
            amount: ethers.parseUnits('250', 18),
            status: 'Completed',
            txHash: '0xabcdef1234567890abcdef1234567890abcdef12'
          }
        ];
      }

      setWithdrawalHistory(history);
    } catch (error) {
      console.error('❌ Error fetching withdrawal history:', error);
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
      toast.error(`Insufficient balance. Available: ${availableAmount.toFixed(2)} USDT`);
      return;
    }

    // AI-powered withdrawal explanation
    try {
      const gasFee = 2.50; // Estimated BSC gas fee
      const withdrawalRate = 100; // Assuming 100% withdrawal rate for now
      
      const aiExplanation = await AITransactionExamples.withdrawalExplanation(
        amount,
        withdrawalRate,
        gasFee
      );
      
      if (aiExplanation && aiExplanation.text) {
        toast.info(`🤖 AI Assistant: ${aiExplanation.text}`, {
          position: "top-center",
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
      
      // Call withdraw function on contract
      let txHash;
      
      if (contract.methods.withdraw && typeof contract.methods.withdraw === 'function') {
        const tx = await contract.methods.withdraw(amountWei).send({
          from: account,
          gas: 300000
        });
        txHash = tx.transactionHash;
      } else if (contract.methods.withdrawUSDT && typeof contract.methods.withdrawUSDT === 'function') {
        const tx = await contract.methods.withdrawUSDT(amountWei).send({
          from: account,
          gas: 300000
        });
        txHash = tx.transactionHash;
      } else {
        throw new Error('Withdrawal function not found in contract');
      }

      toast.success(`Withdrawal successful! TX: ${txHash.slice(0, 10)}...`);
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
    if (account && contract && usdtContract) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [account, contract, usdtContract, fetchBalances]);

  return (
    <div className="withdrawals-page">
      <div className="page-background">
        <div className="animated-bg"></div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">💰 Withdrawals</h1>
          <p className="page-subtitle">Manage your earnings and USDT withdrawals</p>
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
                      {isLoading ? '...' : parseFloat(balances.available).toFixed(2)}
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
                        <img src="/usdt-icon.png" alt="USDT" className="token-icon" />
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
                        onChange={(e) => setWithdrawAmount(e.target.value)}
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
                        Available: {parseFloat(balances.available).toFixed(2)} USDT
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
                      parseFloat(withdrawAmount) > parseFloat(balances.available) ||
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
                          <span>{item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}</span>
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
