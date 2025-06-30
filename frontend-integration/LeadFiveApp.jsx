// LeadFive React Component Example
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract configuration
const CONTRACT_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const SPONSOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'; // TREZOR WALLET (CONTRACT OWNER)

// Minimal ABI - only functions we need
const CONTRACT_ABI = [
  "function register(address sponsor, uint8 packageLevel, bool useUSDT) payable",
  "function getUserBasicInfo(address user) view returns (bool, uint8, uint256)",
  "function getUserEarnings(address user) view returns (uint256, uint256, uint32)",
  "function getPackagePrice(uint8 packageLevel) view returns (uint256)",
  "function withdraw(uint256 amount)",
  "function getTotalUsers() view returns (uint32)",
  "function calculateWithdrawalRate(address user) view returns (uint8)",
  "function dailyWithdrawalLimit() view returns (uint256)",
  "function paused() view returns (bool)",
  
  // Events
  "event UserRegistered(address indexed user, address indexed sponsor, uint8 packageLevel, uint256 amount)",
  "event UserWithdrawal(address indexed user, uint256 amount)"
];

const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const LeadFiveApp = () => {
  // State management
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usdtBalance, setUsdtBalance] = useState('0');

  // Package prices
  const packages = {
    1: { name: 'Starter', price: '30' },
    2: { name: 'Basic', price: '50' },
    3: { name: 'Premium', price: '100' },
    4: { name: 'VIP', price: '200' }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found!');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== 56) {
        throw new Error('Please switch to BSC Mainnet');
      }

      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const usdtInstance = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

      setAccount(accounts[0]);
      setContract(contractInstance);
      setUsdtContract(usdtInstance);
      setError('');

    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch user data
  const fetchUserInfo = async () => {
    if (!contract || !account) return;

    try {
      const [basicInfo, earnings] = await Promise.all([
        contract.getUserBasicInfo(account),
        contract.getUserEarnings(account)
      ]);

      const withdrawalRate = basicInfo[0] ? await contract.calculateWithdrawalRate(account) : 0;

      setUserInfo({
        isRegistered: basicInfo[0],
        packageLevel: Number(basicInfo[1]),
        balance: ethers.formatUnits(basicInfo[2], 18),
        totalEarnings: ethers.formatUnits(earnings[0], 18),
        earningsCap: ethers.formatUnits(earnings[1], 18),
        directReferrals: Number(earnings[2]),
        withdrawalRate: Number(withdrawalRate)
      });

    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  // Fetch USDT balance
  const fetchUsdtBalance = async () => {
    if (!usdtContract || !account) return;

    try {
      const balance = await usdtContract.balanceOf(account);
      setUsdtBalance(ethers.formatUnits(balance, 18));
    } catch (err) {
      console.error('Failed to fetch USDT balance:', err);
    }
  };

  // Register user
  const registerUser = async (packageLevel) => {
    if (!contract || !usdtContract) return;

    setLoading(true);
    setError('');

    try {
      // Get package price
      const packagePrice = await contract.getPackagePrice(packageLevel);
      
      // Check USDT balance
      const balance = await usdtContract.balanceOf(account);
      if (balance < packagePrice) {
        throw new Error(`Insufficient USDT balance. Need ${ethers.formatUnits(packagePrice, 18)} USDT`);
      }

      // Check allowance
      const allowance = await usdtContract.allowance(account, CONTRACT_ADDRESS);
      
      if (allowance < packagePrice) {
        console.log('Approving USDT...');
        const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, packagePrice);
        await approveTx.wait();
        console.log('✅ USDT approved');
      }

      // Register
      console.log('Registering user...');
      const tx = await contract.register(SPONSOR_ADDRESS, packageLevel, true);
      await tx.wait();
      
      console.log('✅ Registration successful!');
      fetchUserInfo();
      fetchUsdtBalance();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Withdraw funds
  const withdrawFunds = async (amount) => {
    if (!contract) return;

    setLoading(true);
    setError('');

    try {
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await contract.withdraw(amountWei);
      await tx.wait();
      
      console.log('✅ Withdrawal successful!');
      fetchUserInfo();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (contract && account) {
      fetchUserInfo();
    }
  }, [contract, account]);

  useEffect(() => {
    if (usdtContract && account) {
      fetchUsdtBalance();
    }
  }, [usdtContract, account]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 LeadFive Platform</h1>
      
      {/* Connection Status */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        {account ? (
          <div>
            <p><strong>Connected:</strong> {account}</p>
            <p><strong>USDT Balance:</strong> {parseFloat(usdtBalance).toFixed(2)} USDT</p>
          </div>
        ) : (
          <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Connect Wallet
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee' }}>
          {error}
        </div>
      )}

      {/* User Info */}
      {userInfo && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <h3>👤 User Information</h3>
          <p><strong>Registered:</strong> {userInfo.isRegistered ? 'Yes' : 'No'}</p>
          {userInfo.isRegistered && (
            <>
              <p><strong>Package Level:</strong> {userInfo.packageLevel} ({packages[userInfo.packageLevel]?.name})</p>
              <p><strong>Balance:</strong> {parseFloat(userInfo.balance).toFixed(6)} USDT</p>
              <p><strong>Total Earnings:</strong> {parseFloat(userInfo.totalEarnings).toFixed(6)} USDT</p>
              <p><strong>Earnings Cap:</strong> {parseFloat(userInfo.earningsCap).toFixed(6)} USDT</p>
              <p><strong>Direct Referrals:</strong> {userInfo.directReferrals}</p>
              <p><strong>Withdrawal Rate:</strong> {userInfo.withdrawalRate}%</p>
            </>
          )}
        </div>
      )}

      {/* Registration */}
      {account && userInfo && !userInfo.isRegistered && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #4caf50' }}>
          <h3>📝 Register Now</h3>
          <p>Choose a package to get started:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {Object.entries(packages).map(([level, pkg]) => (
              <div key={level} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                <h4>{pkg.name}</h4>
                <p><strong>{pkg.price} USDT</strong></p>
                <button 
                  onClick={() => registerUser(parseInt(level))}
                  disabled={loading || parseFloat(usdtBalance) < parseFloat(pkg.price)}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#4caf50', 
                    color: 'white', 
                    border: 'none',
                    cursor: parseFloat(usdtBalance) >= parseFloat(pkg.price) ? 'pointer' : 'not-allowed',
                    opacity: parseFloat(usdtBalance) >= parseFloat(pkg.price) ? 1 : 0.5
                  }}
                >
                  {loading ? 'Processing...' : 'Register'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal */}
      {account && userInfo && userInfo.isRegistered && parseFloat(userInfo.balance) > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #2196f3' }}>
          <h3>💰 Withdraw Funds</h3>
          <p>Available Balance: {parseFloat(userInfo.balance).toFixed(6)} USDT</p>
          <p>Withdrawal Rate: {userInfo.withdrawalRate}%</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="number" 
              placeholder="Amount to withdraw"
              step="0.01"
              max={userInfo.balance}
              style={{ padding: '8px', flex: 1 }}
              id="withdrawAmount"
            />
            <button 
              onClick={() => {
                const amount = document.getElementById('withdrawAmount').value;
                if (amount && parseFloat(amount) > 0) {
                  withdrawFunds(amount);
                }
              }}
              disabled={loading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#2196f3', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', fontSize: '12px' }}>
        <p><strong>Contract:</strong> {CONTRACT_ADDRESS}</p>
        <p><strong>USDT:</strong> {USDT_ADDRESS}</p>
        <p><strong>Default Sponsor:</strong> {SPONSOR_ADDRESS}</p>
        <p><strong>Network:</strong> BSC Mainnet (Chain ID: 56)</p>
      </div>
    </div>
  );
};

export default LeadFiveApp;
