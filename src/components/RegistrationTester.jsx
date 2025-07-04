import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FaDollarSign, FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { CONTRACT_ADDRESS, USDT_ADDRESS, CONTRACT_ABI } from '../config/contracts.js';
import './RegistrationTester.css';

const RegistrationTester = ({ account, provider, signer }) => {
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [currentAllowance, setCurrentAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [testAmount, setTestAmount] = useState('10'); // 10 USDT for testing
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState('unknown');

  // USDT ABI
  const USDT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
  ];

  useEffect(() => {
    if (provider && signer && account) {
      initializeContracts();
    }
  }, [provider, signer, account]);

  const initializeContracts = async () => {
    try {
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const usdtInstance = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      
      setContract(contractInstance);
      setUsdtContract(usdtInstance);
      
      await Promise.all([
        loadUSDTBalance(usdtInstance),
        loadAllowance(usdtInstance),
        checkRegistrationStatus(contractInstance)
      ]);
    } catch (error) {
      console.error('Error initializing contracts:', error);
      setError(`Failed to initialize contracts: ${error.message}`);
    }
  };

  const loadUSDTBalance = async (usdtInstance) => {
    try {
      const balance = await usdtInstance.balanceOf(account);
      const decimals = await usdtInstance.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      setUsdtBalance(formattedBalance);
    } catch (error) {
      console.error('Error loading USDT balance:', error);
    }
  };

  const loadAllowance = async (usdtInstance) => {
    try {
      const allowance = await usdtInstance.allowance(account, CONTRACT_ADDRESS);
      const decimals = await usdtInstance.decimals();
      const formattedAllowance = ethers.formatUnits(allowance, decimals);
      setCurrentAllowance(formattedAllowance);
    } catch (error) {
      console.error('Error loading allowance:', error);
    }
  };

  const checkRegistrationStatus = async (contractInstance) => {
    try {
      const userInfo = await contractInstance.getUserInfo(account);
      setRegistrationStatus(userInfo && userInfo.length > 0 ? 'registered' : 'not_registered');
    } catch (error) {
      console.log('User not registered yet (expected for new users)');
      setRegistrationStatus('not_registered');
    }
  };

  const handleApproveUSDT = async () => {
    if (!usdtContract) return;

    setIsApproving(true);
    setError('');
    setSuccess('');
    setTransactionHash('');

    try {
      const decimals = await usdtContract.decimals();
      const amountInWei = ethers.parseUnits(testAmount, decimals);
      
      const tx = await usdtContract.approve(CONTRACT_ADDRESS, amountInWei);
      setTransactionHash(tx.hash);
      setSuccess(`Approval transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      setSuccess(`✅ USDT approval confirmed in block ${receipt.blockNumber}`);
      
      // Reload allowance
      await loadAllowance(usdtContract);
    } catch (error) {
      console.error('Approval error:', error);
      setError(`Approval failed: ${error.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleTestRegistration = async () => {
    if (!contract) return;

    setIsRegistering(true);
    setError('');
    setSuccess('');
    setTransactionHash('');

    try {
      // Use the sponsor address from the task - the owner of referral code K9NBHT
      const sponsorAddress = '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335';
      const packageId = 1; // Package level 1 for testing
      
      // Call register function with sponsor address and package ID
      const tx = await contract.register(sponsorAddress, packageId);
      setTransactionHash(tx.hash);
      setSuccess(`Registration transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      setSuccess(`✅ Registration confirmed in block ${receipt.blockNumber}`);
      
      // Check registration status again
      await checkRegistrationStatus(contract);
    } catch (error) {
      console.error('Registration error:', error);
      setError(`Registration failed: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'registered':
        return <FaCheckCircle className="status-success" />;
      case 'not_registered':
        return <FaExclamationTriangle className="status-warning" />;
      default:
        return <FaSpinner className="spinner" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'registered':
        return 'User is registered';
      case 'not_registered':
        return 'User is not registered';
      default:
        return 'Checking registration status...';
    }
  };

  if (!account) {
    return (
      <div className="registration-tester">
        <h3>Registration & USDT Testing</h3>
        <p>Please connect your wallet to test registration functionality</p>
      </div>
    );
  }

  return (
    <div className="registration-tester">
      <div className="tester-header">
        <FaDollarSign />
        <h3>Registration & USDT Testing</h3>
      </div>

      <div className="balance-info">
        <div className="balance-item">
          <strong>USDT Balance:</strong>
          <span>{parseFloat(usdtBalance).toFixed(2)} USDT</span>
        </div>
        <div className="balance-item">
          <strong>Current Allowance:</strong>
          <span>{parseFloat(currentAllowance).toFixed(2)} USDT</span>
        </div>
        <div className="balance-item">
          <strong>Registration Status:</strong>
          <div className="status-display">
            {getStatusIcon(registrationStatus)}
            <span>{getStatusText(registrationStatus)}</span>
          </div>
        </div>
      </div>

      <div className="testing-section">
        <h4>Step 1: Approve USDT</h4>
        <div className="input-group">
          <label>Test Amount (USDT):</label>
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            min="1"
            max="100"
            step="0.01"
          />
        </div>
        <button
          onClick={handleApproveUSDT}
          disabled={isApproving || parseFloat(usdtBalance) < parseFloat(testAmount)}
          className="action-button approve-button"
        >
          {isApproving ? <FaSpinner className="spinner" /> : <FaDollarSign />}
          {isApproving ? 'Approving...' : `Approve ${testAmount} USDT`}
        </button>
        <p className="helper-text">
          This will approve the smart contract to spend {testAmount} USDT on your behalf
        </p>
      </div>

      <div className="testing-section">
        <h4>Step 2: Test Registration</h4>
        <button
          onClick={handleTestRegistration}
          disabled={isRegistering || registrationStatus === 'registered' || parseFloat(currentAllowance) < parseFloat(testAmount)}
          className="action-button register-button"
        >
          {isRegistering ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
          {isRegistering ? 'Registering...' : 'Test Registration'}
        </button>
        <p className="helper-text">
          This will attempt to register you with the default sponsor and package
        </p>
      </div>

      {transactionHash && (
        <div className="transaction-info">
          <strong>Transaction Hash:</strong>
          <a
            href={`https://bscscan.com/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            {transactionHash}
          </a>
        </div>
      )}

      {error && (
        <div className="error-message">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      <div className="contract-info">
        <h4>Contract Information</h4>
        <div className="info-item">
          <strong>LeadFive Contract:</strong>
          <code>{CONTRACT_ADDRESS}</code>
        </div>
        <div className="info-item">
          <strong>USDT Contract:</strong>
          <code>{USDT_ADDRESS}</code>
        </div>
        <div className="info-item">
          <strong>Sponsor Address:</strong>
          <code>0xCeaEfDaDE5a0D574bFd5577665dC58d132995335</code>
        </div>
      </div>
    </div>
  );
};

export default RegistrationTester;
