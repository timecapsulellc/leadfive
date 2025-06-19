// LeadFive Main Application Component
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI, PACKAGES } from '../contracts-leadfive.js';
import WalletConnect from './WalletConnect';
import UltimateDashboard from './UltimateDashboard';
import AdminControlPanel from './admin/AdminControlPanel';
import RealTimeDashboard from './RealTimeDashboard';
import NetworkTreeVisualization from './NetworkTreeVisualization';
import ErrorBoundary from './ErrorBoundary';
import './LeadFiveApp.css';

const LeadFiveApp = () => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [networkStatus, setNetworkStatus] = useState('disconnected');

    // Initialize Web3 connection
    useEffect(() => {
        if (account && provider) {
            initializeContract();
            checkAdminStatus();
            fetchUserData();
        }
    }, [account, provider]);

    // Real-time event listeners
    useEffect(() => {
        if (contract && account) {
            setupEventListeners();
            return () => {
                contract.removeAllListeners();
            };
        }
    }, [contract, account]);

    const initializeContract = async () => {
        try {
            if (!LEAD_FIVE_CONFIG.address) {
                setError('Contract not deployed yet. Please wait for deployment.');
                return;
            }

            const contractInstance = new ethers.Contract(
                LEAD_FIVE_CONFIG.address,
                LEAD_FIVE_ABI,
                signer
            );
            setContract(contractInstance);
            setNetworkStatus('connected');
        } catch (err) {
            console.error('Contract initialization failed:', err);
            setError('Failed to connect to LeadFive contract');
            setNetworkStatus('error');
        }
    };

    const setupEventListeners = () => {
        if (!contract) return;

        // Listen for user registration
        contract.on("UserRegistered", (user, referrer, packageLevel, amount) => {
            if (user.toLowerCase() === account.toLowerCase()) {
                showNotification("Registration successful!", "success");
                fetchUserData();
            }
        });

        // Listen for bonus distributions
        contract.on("BonusDistributed", (recipient, amount, bonusType) => {
            if (recipient.toLowerCase() === account.toLowerCase()) {
                showNotification(`Bonus received: ${ethers.utils.formatEther(amount)} USDT`, "success");
                fetchUserData();
            }
        });

        // Listen for withdrawals
        contract.on("Withdrawal", (user, amount) => {
            if (user.toLowerCase() === account.toLowerCase()) {
                showNotification(`Withdrawal processed: ${ethers.utils.formatEther(amount)} USDT`, "success");
                fetchUserData();
            }
        });

        // Listen for package upgrades
        contract.on("PackageUpgraded", (user, newLevel, amount) => {
            if (user.toLowerCase() === account.toLowerCase()) {
                showNotification(`Package upgraded to Level ${newLevel}`, "success");
                fetchUserData();
            }
        });
    };

    const fetchUserData = async () => {
        if (!contract || !account) return;

        try {
            setLoading(true);
            const userData = await contract.getUserInfo(account);
            const directReferrals = await contract.getDirectReferrals(account);
            const uplineChain = await contract.getUplineChain(account);
            const binaryMatrix = await contract.getBinaryMatrix(account);
            const poolBalances = await contract.getPoolBalances();

            setUserInfo({
                ...userData,
                directReferrals,
                uplineChain,
                binaryMatrix,
                poolBalances
            });
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const checkAdminStatus = async () => {
        if (!contract || !account) return;

        try {
            // Check if user is admin by trying to call an admin function
            const adminIds = await contract.adminIds(0);
            // This is a simplified check - in production, you'd have a proper admin check function
            setIsAdmin(account.toLowerCase() === adminIds.toLowerCase());
        } catch (err) {
            setIsAdmin(false);
        }
    };

    const handleWalletConnect = (walletAccount, walletProvider, walletSigner) => {
        setAccount(walletAccount);
        setProvider(walletProvider);
        setSigner(walletSigner);
        setError(null);
    };

    const handleWalletDisconnect = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setContract(null);
        setUserInfo(null);
        setIsAdmin(false);
        setNetworkStatus('disconnected');
    };

    const showNotification = (message, type = 'info') => {
        // Implement notification system
        console.log(`${type.toUpperCase()}: ${message}`);
        // You can integrate with a toast library here
    };

    const registerUser = async (referrer, packageLevel, useUSDT) => {
        if (!contract) return;

        try {
            setLoading(true);
            let tx;

            if (useUSDT) {
                // USDT payment flow
                const usdtAddress = LEAD_FIVE_CONFIG.usdtAddress;
                const usdtContract = new ethers.Contract(
                    usdtAddress,
                    ['function approve(address spender, uint256 amount) returns (bool)'],
                    signer
                );

                const packagePrice = ethers.utils.parseEther(PACKAGES[packageLevel - 1].price.toString());
                
                // Approve USDT spending
                const approveTx = await usdtContract.approve(LEAD_FIVE_CONFIG.address, packagePrice);
                await approveTx.wait();

                // Register with USDT
                tx = await contract.register(referrer, packageLevel, true);
            } else {
                // BNB payment flow - contract will calculate the required BNB amount
                tx = await contract.register(referrer, packageLevel, false, {
                    value: ethers.utils.parseEther("0.1") // This will be calculated by the contract
                });
            }

            await tx.wait();
            showNotification("Registration transaction submitted!", "success");
        } catch (err) {
            console.error('Registration failed:', err);
            setError(`Registration failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const withdrawFunds = async (amount) => {
        if (!contract) return;

        try {
            setLoading(true);
            const tx = await contract.withdraw(ethers.utils.parseEther(amount.toString()));
            await tx.wait();
            showNotification("Withdrawal transaction submitted!", "success");
        } catch (err) {
            console.error('Withdrawal failed:', err);
            setError(`Withdrawal failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const upgradePackage = async (newLevel, useUSDT) => {
        if (!contract) return;

        try {
            setLoading(true);
            let tx;

            if (useUSDT) {
                // USDT upgrade flow
                const usdtAddress = LEAD_FIVE_CONFIG.usdtAddress;
                const usdtContract = new ethers.Contract(
                    usdtAddress,
                    ['function approve(address spender, uint256 amount) returns (bool)'],
                    signer
                );

                const packagePrice = ethers.utils.parseEther(PACKAGES[newLevel - 1].price.toString());
                
                // Approve USDT spending
                const approveTx = await usdtContract.approve(LEAD_FIVE_CONFIG.address, packagePrice);
                await approveTx.wait();

                // Upgrade with USDT
                tx = await contract.upgradePackage(newLevel, true);
            } else {
                // BNB upgrade flow
                tx = await contract.upgradePackage(newLevel, false, {
                    value: ethers.utils.parseEther("0.1") // This will be calculated by the contract
                });
            }

            await tx.wait();
            showNotification("Package upgrade transaction submitted!", "success");
        } catch (err) {
            console.error('Package upgrade failed:', err);
            setError(`Package upgrade failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return (
            <ErrorBoundary>
                <div className="leadfive-app">
                    <div className="leadfive-header">
                        <h1>🚀 LeadFive Platform</h1>
                        <p>Decentralized MLM Platform on Binance Smart Chain</p>
                    </div>
                    <WalletConnect onConnect={handleWalletConnect} />
                    <div className="leadfive-features">
                        <div className="feature-card">
                            <h3>💰 4-Tier Package System</h3>
                            <p>$30, $50, $100, $200 packages with 100% distribution</p>
                        </div>
                        <div className="feature-card">
                            <h3>🌐 Binary Matrix</h3>
                            <p>2×∞ matrix with automatic spillover</p>
                        </div>
                        <div className="feature-card">
                            <h3>⚡ Progressive Withdrawal</h3>
                            <p>70%-80% withdrawal rates based on referrals</p>
                        </div>
                        <div className="feature-card">
                            <h3>🛡️ Security Audited</h3>
                            <p>PhD-level security audit with A-grade rating</p>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <div className="leadfive-app">
                <div className="leadfive-header">
                    <h1>🚀 LeadFive Dashboard</h1>
                    <div className="header-info">
                        <span className={`network-status ${networkStatus}`}>
                            {networkStatus === 'connected' ? '🟢 Connected' : 
                             networkStatus === 'error' ? '🔴 Error' : '🟡 Connecting...'}
                        </span>
                        <span className="account-info">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                        <button onClick={handleWalletDisconnect} className="disconnect-btn">
                            Disconnect
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-banner">
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                <div className="leadfive-tabs">
                    <button 
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                    <button 
                        className={activeTab === 'realtime' ? 'active' : ''}
                        onClick={() => setActiveTab('realtime')}
                    >
                        ⚡ Real-time
                    </button>
                    <button 
                        className={activeTab === 'network' ? 'active' : ''}
                        onClick={() => setActiveTab('network')}
                    >
                        🌐 Network
                    </button>
                    {isAdmin && (
                        <button 
                            className={activeTab === 'admin' ? 'active' : ''}
                            onClick={() => setActiveTab('admin')}
                        >
                            🔧 Admin
                        </button>
                    )}
                </div>

                <div className="leadfive-content">
                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner">🔄 Loading...</div>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <UltimateDashboard
                            userInfo={userInfo}
                            contract={contract}
                            account={account}
                            onRegister={registerUser}
                            onWithdraw={withdrawFunds}
                            onUpgrade={upgradePackage}
                            loading={loading}
                        />
                    )}

                    {activeTab === 'realtime' && (
                        <RealTimeDashboard
                            userInfo={userInfo}
                            contract={contract}
                            account={account}
                        />
                    )}

                    {activeTab === 'network' && (
                        <NetworkTreeVisualization
                            userInfo={userInfo}
                            contract={contract}
                            account={account}
                        />
                    )}

                    {activeTab === 'admin' && isAdmin && (
                        <AdminControlPanel
                            contract={contract}
                            account={account}
                        />
                    )}
                </div>

                <div className="leadfive-footer">
                    <p>🚀 LeadFive Platform - Powered by Binance Smart Chain</p>
                    <p>Contract: {LEAD_FIVE_CONFIG.address || 'Deploying...'}</p>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default LeadFiveApp;
