import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner, 
  FaCopy, 
  FaRocket,
  FaWallet,
  FaDollarSign,
  FaUsers,
  FaNetworkWired,
  FaShieldAlt
} from 'react-icons/fa';
import { CONTRACT_ADDRESS, USDT_ADDRESS, CONTRACT_ABI } from '../config/contracts.js';
import './SmartContractTester.css';

const SmartContractTester = ({ account, provider, signer }) => {
  const [testResults, setTestResults] = useState({});
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [testLogs, setTestLogs] = useState([]);

  // USDT ABI (minimal for testing)
  const USDT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
  ];

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, { message, type, timestamp }]);
  };

  useEffect(() => {
    if (provider && signer) {
      initializeContracts();
    }
  }, [provider, signer]);

  const initializeContracts = async () => {
    try {
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const usdtInstance = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
      
      setContract(contractInstance);
      setUsdtContract(usdtInstance);
      
      addLog('✅ Smart contracts initialized successfully', 'success');
    } catch (error) {
      addLog(`❌ Failed to initialize contracts: ${error.message}`, 'error');
    }
  };

  const runAllTests = async () => {
    if (!contract || !usdtContract || !account) {
      addLog('❌ Prerequisites not met for testing', 'error');
      return;
    }

    setIsTestingInProgress(true);
    setTestResults({});
    setTestLogs([]);
    
    addLog('🚀 Starting comprehensive smart contract testing...', 'info');

    const tests = [
      { name: 'Network Connection', test: testNetworkConnection },
      { name: 'Contract Deployment', test: testContractDeployment },
      { name: 'Wallet Connection', test: testWalletConnection },
      { name: 'USDT Balance', test: testUSDTBalance },
      { name: 'USDT Allowance', test: testUSDTAllowance },
      { name: 'User Registration Status', test: testUserRegistration },
      { name: 'User Information', test: testUserInformation },
      { name: 'Contract Statistics', test: testContractStats },
      { name: 'Referral System', test: testReferralSystem }
    ];

    for (const testCase of tests) {
      try {
        addLog(`🧪 Testing ${testCase.name}...`, 'info');
        const result = await testCase.test();
        setTestResults(prev => ({ ...prev, [testCase.name]: result }));
        addLog(`✅ ${testCase.name}: ${result.success ? 'PASSED' : 'FAILED'}`, result.success ? 'success' : 'error');
        if (result.details) {
          addLog(`   📄 ${result.details}`, 'info');
        }
      } catch (error) {
        const failResult = { success: false, details: error.message };
        setTestResults(prev => ({ ...prev, [testCase.name]: failResult }));
        addLog(`❌ ${testCase.name}: FAILED - ${error.message}`, 'error');
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTestingInProgress(false);
    addLog('🎉 Testing completed!', 'success');
  };

  const testNetworkConnection = async () => {
    const network = await provider.getNetwork();
    const isCorrectNetwork = network.chainId === 56n; // BSC Mainnet
    
    return {
      success: isCorrectNetwork,
      details: `Connected to ${network.name} (Chain ID: ${network.chainId}). ${isCorrectNetwork ? 'Correct network!' : 'Please switch to BSC Mainnet'}`
    };
  };

  const testContractDeployment = async () => {
    const code = await provider.getCode(CONTRACT_ADDRESS);
    const isDeployed = code !== '0x';
    
    return {
      success: isDeployed,
      details: isDeployed ? `Contract deployed at ${CONTRACT_ADDRESS}` : 'Contract not found at specified address'
    };
  };

  const testWalletConnection = async () => {
    const balance = await provider.getBalance(account);
    const bnbBalance = ethers.formatEther(balance);
    
    return {
      success: true,
      details: `Wallet: ${account}, BNB Balance: ${parseFloat(bnbBalance).toFixed(4)} BNB`
    };
  };

  const testUSDTBalance = async () => {
    const balance = await usdtContract.balanceOf(account);
    const decimals = await usdtContract.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    return {
      success: true,
      details: `USDT Balance: ${parseFloat(formattedBalance).toFixed(2)} USDT`
    };
  };

  const testUSDTAllowance = async () => {
    const allowance = await usdtContract.allowance(account, CONTRACT_ADDRESS);
    const decimals = await usdtContract.decimals();
    const formattedAllowance = ethers.formatUnits(allowance, decimals);
    
    return {
      success: true,
      details: `USDT Allowance: ${parseFloat(formattedAllowance).toFixed(2)} USDT`
    };
  };

  const testUserRegistration = async () => {
    try {
      const userInfo = await contract.getUserInfo(account);
      const isRegistered = userInfo.isRegistered;
      
      return {
        success: true,
        details: isRegistered ? 'User is registered' : 'User is not registered'
      };
    } catch (error) {
      return {
        success: true,
        details: 'User is not registered (expected for new users)'
      };
    }
  };

  const testUserInformation = async () => {
    try {
      const userInfo = await contract.getUserInfo(account);
      console.log('User info raw:', userInfo);
      
      // Handle the correct user info structure from ABI
      const isRegistered = userInfo.isRegistered;
      const isBlacklisted = userInfo.isBlacklisted;
      const referrer = userInfo.referrer;
      const balance = ethers.formatUnits(userInfo.balance, 18);
      const totalInvestment = ethers.formatUnits(userInfo.totalInvestment, 18);
      const totalEarnings = ethers.formatUnits(userInfo.totalEarnings, 18);
      const directReferrals = userInfo.directReferrals.toString();
      const teamSize = userInfo.teamSize.toString();
      const packageLevel = userInfo.packageLevel.toString();
      const rank = userInfo.rank.toString();
      
      return {
        success: true,
        details: `Registered: ${isRegistered}, Level: ${packageLevel}, Balance: ${parseFloat(balance).toFixed(4)} USDT, Referrals: ${directReferrals}, Team: ${teamSize}, Rank: ${rank}`
      };
    } catch (error) {
      return {
        success: false,
        details: `Cannot fetch user info: ${error.message}`
      };
    }
  };

  const testContractStats = async () => {
    try {
      const stats = await contract.getContractStats();
      console.log('Contract stats raw:', stats);
      
      const totalUsers = stats.totalUsers.toString();
      const totalFees = ethers.formatUnits(stats.totalFeesCollected, 18);
      const isPaused = stats.isPaused;
      const circuitBreaker = stats.circuitBreaker;
      
      return {
        success: true,
        details: `Total Users: ${totalUsers}, Total Fees: ${parseFloat(totalFees).toFixed(2)} USDT, Paused: ${isPaused}, Circuit Breaker: ${circuitBreaker}`
      };
    } catch (error) {
      return {
        success: false,
        details: `Cannot fetch contract stats: ${error.message}`
      };
    }
  };

  const testReferralSystem = async () => {
    try {
      // Test getting user's referral code
      let userReferralCode = '';
      try {
        userReferralCode = await contract.getUserReferralCode(account);
      } catch (e) {
        userReferralCode = 'Not set or not registered';
      }
      
      // Test referral code lookup for K9NBHT
      let sponsorAddress = '';
      try {
        sponsorAddress = await contract.getAddressByReferralCode('K9NBHT');
      } catch (e) {
        sponsorAddress = 'Lookup failed';
      }
      
      return {
        success: true,
        details: `User referral code: "${userReferralCode}", K9NBHT belongs to: ${sponsorAddress}`
      };
    } catch (error) {
      return {
        success: false,
        details: `Cannot fetch referral info: ${error.message}`
      };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addLog('📋 Copied to clipboard', 'success');
  };

  const getTestIcon = (testName) => {
    const result = testResults[testName];
    if (!result) return <FaSpinner className="spinner" />;
    return result.success ? <FaCheckCircle className="success" /> : <FaExclamationTriangle className="error" />;
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  if (!account) {
    return (
      <div className="contract-tester">
        <div className="tester-header">
          <FaWallet />
          <h2>Smart Contract Integration Tester</h2>
        </div>
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet to start testing smart contract integration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contract-tester">
      <div className="tester-header">
        <FaRocket />
        <h2>Smart Contract Integration Tester</h2>
        <button 
          onClick={runAllTests} 
          disabled={isTestingInProgress}
          className="run-tests-btn"
        >
          {isTestingInProgress ? <FaSpinner className="spinner" /> : <FaRocket />}
          {isTestingInProgress ? 'Testing...' : 'Run All Tests'}
        </button>
      </div>

      <div className="test-info">
        <div className="test-config">
          <h3>Test Configuration</h3>
          <div className="config-item">
            <strong>Contract Address:</strong> 
            <span>{CONTRACT_ADDRESS}</span>
            <button onClick={() => copyToClipboard(CONTRACT_ADDRESS)}>
              <FaCopy />
            </button>
          </div>
          <div className="config-item">
            <strong>USDT Address:</strong> 
            <span>{USDT_ADDRESS}</span>
            <button onClick={() => copyToClipboard(USDT_ADDRESS)}>
              <FaCopy />
            </button>
          </div>
          <div className="config-item">
            <strong>Your Wallet:</strong> 
            <span>{account}</span>
            <button onClick={() => copyToClipboard(account)}>
              <FaCopy />
            </button>
          </div>
          <div className="config-item">
            <strong>Referral Code:</strong> 
            <span>K9NBHT</span>
            <button onClick={() => copyToClipboard('K9NBHT')}>
              <FaCopy />
            </button>
          </div>
          <div className="config-item">
            <strong>Sponsor Address:</strong> 
            <span>0xCeaEfDaDE5a0D574bFd5577665dC58d132995335</span>
            <button onClick={() => copyToClipboard('0xCeaEfDaDE5a0D574bFd5577665dC58d132995335')}>
              <FaCopy />
            </button>
          </div>
        </div>
      </div>

      <div className="test-results">
        <h3>Test Results</h3>
        <div className="results-grid">
          {[
            { name: 'Network Connection', icon: FaNetworkWired },
            { name: 'Contract Deployment', icon: FaShieldAlt },
            { name: 'Wallet Connection', icon: FaWallet },
            { name: 'USDT Balance', icon: FaDollarSign },
            { name: 'USDT Allowance', icon: FaDollarSign },
            { name: 'User Registration Status', icon: FaUsers },
            { name: 'User Information', icon: FaUsers },
            { name: 'Contract Statistics', icon: FaNetworkWired },
            { name: 'Referral System', icon: FaUsers }
          ].map(test => (
            <div key={test.name} className="test-result-card">
              <div className="test-icon">
                <test.icon />
              </div>
              <div className="test-content">
                <h4>{test.name}</h4>
                <div className="test-status">
                  {getTestIcon(test.name)}
                  <span>{testResults[test.name]?.details || 'Not tested yet'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="test-logs">
        <h3>Test Logs</h3>
        <div className="logs-container">
          {testLogs.length === 0 ? (
            <p>No logs yet. Click "Run All Tests" to start testing.</p>
          ) : (
            testLogs.map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <span className="log-time">{log.timestamp}</span>
                <span className="log-icon">{getLogIcon(log.type)}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartContractTester;
