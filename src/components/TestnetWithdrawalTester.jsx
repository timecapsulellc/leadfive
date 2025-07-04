import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import testnetConfig from '../config/testnet-contracts.js';

/**
 * Testnet Withdrawal Tester Component
 * Tests new enhanced withdrawal functions on BSC Testnet
 */
const TestnetWithdrawalTester = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkCorrect, setNetworkCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // User data
  const [userInfo, setUserInfo] = useState(null);
  const [withdrawalSplit, setWithdrawalSplit] = useState([0, 0]);
  const [referralCount, setReferralCount] = useState(0);
  const [autoCompound, setAutoCompound] = useState(false);
  const [treasuryWallet, setTreasuryWallet] = useState('');
  const [poolBalances, setPoolBalances] = useState([0, 0, 0]);
  
  // Test inputs
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [testResults, setTestResults] = useState([]);

  // Connect to wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await checkNetwork();
        await initializeContract();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      addTestResult('❌ Failed to connect wallet: ' + error.message, 'error');
    }
  };

  // Check if on correct network
  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId === testnetConfig.network.chainId) {
        setNetworkCorrect(true);
        addTestResult('✅ Connected to BSC Testnet', 'success');
      } else {
        setNetworkCorrect(false);
        addTestResult('⚠️ Please switch to BSC Testnet', 'warning');
        await switchToTestnet();
      }
    } catch (error) {
      console.error('Failed to check network:', error);
    }
  };

  // Switch to BSC Testnet
  const switchToTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: testnetConfig.network.chainId }]
      });
      setNetworkCorrect(true);
      addTestResult('✅ Switched to BSC Testnet', 'success');
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: testnetConfig.network.chainId,
              chainName: testnetConfig.network.name,
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: [testnetConfig.network.rpcUrl],
              blockExplorerUrls: [testnetConfig.network.blockExplorer]
            }]
          });
          setNetworkCorrect(true);
          addTestResult('✅ Added and switched to BSC Testnet', 'success');
        } catch (addError) {
          addTestResult('❌ Failed to add BSC Testnet: ' + addError.message, 'error');
        }
      } else {
        addTestResult('❌ Failed to switch network: ' + error.message, 'error');
      }
    }
  };

  // Initialize contract
  const initializeContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        testnetConfig.contractAddress,
        testnetConfig.abi,
        signer
      );
      
      setContract(contractInstance);
      addTestResult('✅ Contract initialized: ' + testnetConfig.contractAddress, 'success');
      await loadUserData(contractInstance);
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      addTestResult('❌ Failed to initialize contract: ' + error.message, 'error');
    }
  };

  // Load user data
  const loadUserData = async (contractInstance = contract) => {
    if (!contractInstance || !account) return;

    setLoading(true);
    try {
      // Get user info
      const info = await contractInstance.getUserInfo(account);
      setUserInfo(info);
      
      // Get withdrawal split
      const split = await contractInstance.getWithdrawalSplit(account);
      setWithdrawalSplit([split[0].toString(), split[1].toString()]);
      
      // Get referral count
      const refCount = await contractInstance.getUserReferralCount(account);
      setReferralCount(refCount.toString());
      
      // Get auto-compound status
      const autoStatus = await contractInstance.isAutoCompoundEnabled(account);
      setAutoCompound(autoStatus);
      
      // Get treasury wallet
      const treasury = await contractInstance.getTreasuryWallet();
      setTreasuryWallet(treasury);
      
      // Get pool balances
      const pools = await contractInstance.getPoolBalances();
      setPoolBalances([
        ethers.formatUnits(pools[0], 18),
        ethers.formatUnits(pools[1], 18),
        ethers.formatUnits(pools[2], 18)
      ]);

      addTestResult('✅ User data loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load user data:', error);
      addTestResult('❌ Failed to load user data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test withdrawal split calculation
  const testWithdrawalCalculation = () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      addTestResult('⚠️ Please enter a valid withdrawal amount', 'warning');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const withdrawPercent = parseInt(withdrawalSplit[0]);
    const reinvestPercent = parseInt(withdrawalSplit[1]);
    
    const withdrawableAmount = (amount * withdrawPercent) / 100;
    const adminFee = (withdrawableAmount * 5) / 100; // 5% fee on withdrawal portion only
    const userReceives = withdrawableAmount - adminFee;
    const reinvestAmount = (amount * reinvestPercent) / 100;

    const calculation = {
      totalAmount: amount,
      split: `${withdrawPercent}%/${reinvestPercent}%`,
      withdrawableAmount,
      adminFee,
      userReceives,
      reinvestAmount
    };

    addTestResult(
      `💰 Withdrawal Calculation for ${amount} USDT:\n` +
      `   Split: ${calculation.split}\n` +
      `   Withdrawable: ${withdrawableAmount.toFixed(2)} USDT\n` +
      `   Admin Fee (5%): ${adminFee.toFixed(2)} USDT\n` +
      `   User Receives: ${userReceives.toFixed(2)} USDT\n` +
      `   Reinvestment: ${reinvestAmount.toFixed(2)} USDT`,
      'info'
    );
  };

  // Toggle auto-compound
  const toggleAutoCompound = async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const newStatus = !autoCompound;
      const tx = await contract.toggleAutoCompound(newStatus);
      addTestResult(`🔄 Toggling auto-compound to ${newStatus}...`, 'info');
      
      await tx.wait();
      setAutoCompound(newStatus);
      
      // Reload withdrawal split as it changes with auto-compound
      const split = await contract.getWithdrawalSplit(account);
      setWithdrawalSplit([split[0].toString(), split[1].toString()]);
      
      addTestResult(`✅ Auto-compound ${newStatus ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Failed to toggle auto-compound:', error);
      addTestResult('❌ Failed to toggle auto-compound: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test enhanced withdrawal (requires balance)
  const testEnhancedWithdrawal = async () => {
    if (!contract || !withdrawAmount || withdrawAmount <= 0) {
      addTestResult('⚠️ Please enter a valid withdrawal amount', 'warning');
      return;
    }

    if (!userInfo || parseFloat(ethers.formatUnits(userInfo.balance, 18)) < parseFloat(withdrawAmount)) {
      addTestResult('⚠️ Insufficient balance for withdrawal test', 'warning');
      return;
    }

    setLoading(true);
    try {
      const amount = ethers.parseUnits(withdrawAmount, 18);
      const tx = await contract.withdrawEnhanced(amount);
      addTestResult(`🔄 Testing enhanced withdrawal of ${withdrawAmount} USDT...`, 'info');
      
      const receipt = await tx.wait();
      addTestResult('✅ Enhanced withdrawal completed!', 'success');
      
      // Parse events from receipt
      receipt.logs.forEach(log => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog.name === 'EnhancedWithdrawal') {
            const { user, amount, adminFee, userReceives, reinvestAmount } = parsedLog.args;
            addTestResult(
              `📊 Withdrawal Event:\n` +
              `   Amount: ${ethers.formatUnits(amount, 18)} USDT\n` +
              `   Admin Fee: ${ethers.formatUnits(adminFee, 18)} USDT\n` +
              `   User Received: ${ethers.formatUnits(userReceives, 18)} USDT\n` +
              `   Reinvested: ${ethers.formatUnits(reinvestAmount, 18)} USDT`,
              'success'
            );
          }
        } catch (e) {
          // Log might not be from our contract
        }
      });
      
      // Reload user data
      await loadUserData();
    } catch (error) {
      console.error('Failed to test withdrawal:', error);
      addTestResult('❌ Withdrawal test failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add test result
  const addTestResult = (message, type) => {
    const result = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    // Auto-connect if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      connectWallet();
    }
  }, []);

  return (
    <div className="testnet-withdrawal-tester p-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Testnet Withdrawal Tester</h1>
        <p className="text-blue-100">Test enhanced withdrawal functions on BSC Testnet</p>
        <div className="mt-4 text-sm">
          <p><strong>Contract:</strong> {testnetConfig.contractAddress}</p>
          <p><strong>Network:</strong> BSC Testnet (Chain ID: 97)</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="font-semibold">Wallet Connection</div>
          <div className="text-sm">
            {isConnected ? `✅ Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : '❌ Not Connected'}
          </div>
          {!isConnected && (
            <button 
              onClick={connectWallet}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <div className={`p-4 rounded-lg ${networkCorrect ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          <div className="font-semibold">Network Status</div>
          <div className="text-sm">
            {networkCorrect ? '✅ BSC Testnet' : '⚠️ Wrong Network'}
          </div>
          {!networkCorrect && isConnected && (
            <button 
              onClick={switchToTestnet}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Switch Network
            </button>
          )}
        </div>

        <div className={`p-4 rounded-lg ${contract ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          <div className="font-semibold">Contract Status</div>
          <div className="text-sm">
            {contract ? '✅ Contract Ready' : '⏳ Not Initialized'}
          </div>
        </div>
      </div>

      {/* User Information */}
      {userInfo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">👤 User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Registered</div>
              <div className="font-semibold">{userInfo.isRegistered ? 'Yes' : 'No'}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Balance</div>
              <div className="font-semibold">{ethers.formatUnits(userInfo.balance, 18)} USDT</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Package Level</div>
              <div className="font-semibold">{userInfo.packageLevel.toString()}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Direct Referrals</div>
              <div className="font-semibold">{userInfo.directReferrals.toString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Testing */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">💰 Withdrawal Testing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Status */}
          <div>
            <h3 className="font-semibold mb-3">Current Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Withdrawal Split:</span>
                <span className="font-mono">{withdrawalSplit[0]}% / {withdrawalSplit[1]}%</span>
              </div>
              <div className="flex justify-between">
                <span>Referral Count:</span>
                <span className="font-mono">{referralCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Compound:</span>
                <span className={`font-mono ${autoCompound ? 'text-green-600' : 'text-red-600'}`}>
                  {autoCompound ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Treasury:</span>
                <span className="font-mono text-xs">{treasuryWallet}</span>
              </div>
            </div>
          </div>

          {/* Testing Controls */}
          <div>
            <h3 className="font-semibold mb-3">Test Controls</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdrawal Amount (USDT)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter amount to test"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={testWithdrawalCalculation}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  Calculate Split
                </button>
                <button
                  onClick={toggleAutoCompound}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  disabled={loading || !contract}
                >
                  Toggle Auto-Compound
                </button>
              </div>
              
              <button
                onClick={testEnhancedWithdrawal}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading || !contract || !withdrawAmount}
              >
                Test Enhanced Withdrawal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pool Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">🏊 Pool Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-blue-600">Leader Pool</div>
            <div className="font-semibold text-xl">{poolBalances[0]} USDT</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-sm text-green-600">Help Pool</div>
            <div className="font-semibold text-xl">{poolBalances[1]} USDT</div>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <div className="text-sm text-purple-600">Club Pool</div>
            <div className="font-semibold text-xl">{poolBalances[2]} USDT</div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📊 Test Results</h2>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {testResults.map(result => (
            <div
              key={result.id}
              className={`p-3 rounded-lg ${
                result.type === 'success' ? 'bg-green-50 text-green-800' :
                result.type === 'error' ? 'bg-red-50 text-red-800' :
                result.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                'bg-blue-50 text-blue-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <pre className="text-sm whitespace-pre-wrap flex-1">{result.message}</pre>
                <span className="text-xs opacity-75">{result.timestamp}</span>
              </div>
            </div>
          ))}
          
          {testResults.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No test results yet. Connect your wallet and start testing!
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestnetWithdrawalTester;