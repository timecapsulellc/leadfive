// LeadFive Dashboard - Consolidated Main Dashboard Component
import React, { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI, PACKAGES } from '../contracts-leadfive.js';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';
import CompensationDashboard from '../components/compensation/CompensationDashboard';
import MatrixVisualization from '../components/MatrixVisualization';
import TeamOverview from '../components/TeamOverview';
import WithdrawalPanel from '../components/WithdrawalPanel';
import ReferralManager from '../components/ReferralManager';
import AdminDashboard from '../components/admin/AdminDashboard';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/dashboard-clean.css';

const Dashboard = () => {
    // Web3 State
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    
    // App State
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [networkStatus, setNetworkStatus] = useState('disconnected');
    const [dashboardData, setDashboardData] = useState({
        earnings: '0',
        teamSize: 0,
        rank: 'None',
        package: 'Not Registered',
        totalDeposits: '0',
        totalRewards: '0',
        referralCount: 0,
        matrixPosition: null
    });

    // Initialize contract when wallet connects
    useEffect(() => {
        if (account && provider && signer) {
            initializeContract();
            fetchUserData();
        }
    }, [account, provider, signer]);

    const initializeContract = async () => {
        try {
            setLoading(true);
            
            if (!LEAD_FIVE_CONFIG.address) {
                setError('LeadFive contract not deployed yet. Please wait for deployment.');
                return;
            }

            if (!signer) {
                setError('Signer not available. Please reconnect your wallet.');
                return;
            }

            const contractInstance = new ethers.Contract(
                LEAD_FIVE_CONFIG.address,
                LEAD_FIVE_ABI,
                signer
            );
            
            setContract(contractInstance);
            setNetworkStatus('connected');
            
            // Check if user is admin
            try {
                const adminRole = await contractInstance.hasRole(
                    ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")),
                    account
                );
                setIsAdmin(adminRole);
            } catch (err) {
                console.log('Admin check failed:', err);
                setIsAdmin(false);
            }

        } catch (err) {
            console.error('Contract initialization failed:', err);
            setError('Failed to connect to LeadFive contract: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        if (!contract || !account) return;

        try {
            setLoading(true);
            
            // Fetch user information
            const user = await contract.users(account);
            const userStats = {
                id: user.id?.toString() || '0',
                referrer: user.referrer || ethers.ZeroAddress,
                totalDeposits: ethers.formatEther(user.totalDeposits || '0'),
                totalRewards: ethers.formatEther(user.totalRewards || '0'),
                teamSize: user.teamSize?.toString() || '0',
                rank: getRankName(user.rank || 0),
                isActive: user.isActive || false,
                currentPackage: user.currentPackage?.toString() || '0'
            };

            setUserInfo(userStats);
            
            // Update dashboard data
            setDashboardData({
                earnings: userStats.totalRewards,
                teamSize: parseInt(userStats.teamSize),
                rank: userStats.rank,
                package: userStats.currentPackage !== '0' ? `$${PACKAGES[userStats.currentPackage]?.price || 'Unknown'} Package` : 'Not Registered',
                totalDeposits: userStats.totalDeposits,
                totalRewards: userStats.totalRewards,
                referralCount: parseInt(userStats.teamSize),
                matrixPosition: userStats.id !== '0' ? userStats.id : null
            });

        } catch (err) {
            console.error('Failed to fetch user data:', err);
            setError('Failed to load user data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRankName = (rankId) => {
        const ranks = ['None', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown'];
        return ranks[rankId] || 'None';
    };

    const handleWalletConnect = async (account, provider, signer) => {
        setAccount(account);
        setProvider(provider);
        setSigner(signer);
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
        setDashboardData({
            earnings: '0',
            teamSize: 0,
            rank: 'None',
            package: 'Not Registered',
            totalDeposits: '0',
            totalRewards: '0',
            referralCount: 0,
            matrixPosition: null
        });
    };

    const handleInvestment = async (packageId, referrerAddress) => {
        if (!contract || !signer) return;

        try {
            setLoading(true);
            const packagePrice = PACKAGES[packageId]?.price;
            if (!packagePrice) throw new Error('Invalid package');

            const tx = await contract.investInPackage(
                packageId,
                referrerAddress || ethers.ZeroAddress,
                {
                    value: ethers.parseEther(packagePrice.toString())
                }
            );

            await tx.wait();
            await fetchUserData(); // Refresh data
            
        } catch (err) {
            console.error('Investment failed:', err);
            setError('Investment failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Tab navigation
    const tabs = [
        { id: 'overview', label: '📊 Overview', component: 'compensation' },
        { id: 'matrix', label: '🔄 Matrix', component: 'matrix' },
        { id: 'team', label: '👥 Team', component: 'team' },
        { id: 'referrals', label: '🤝 Referrals', component: 'referrals' },
        { id: 'withdraw', label: '💰 Withdraw', component: 'withdraw' },
        ...(isAdmin ? [{ id: 'admin', label: '⚙️ Admin', component: 'admin' }] : [])
    ];

    const renderActiveComponent = () => {
        const commonProps = {
            contract,
            account,
            provider,
            signer,
            userInfo,
            dashboardData,
            onRefresh: fetchUserData
        };

        switch (activeTab) {
            case 'overview':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <CompensationDashboard 
                            {...commonProps}
                            onInvest={handleInvestment}
                        />
                    </Suspense>
                );
            case 'matrix':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <MatrixVisualization {...commonProps} />
                    </Suspense>
                );
            case 'team':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <TeamOverview {...commonProps} />
                    </Suspense>
                );
            case 'referrals':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ReferralManager {...commonProps} />
                    </Suspense>
                );
            case 'withdraw':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <WithdrawalPanel {...commonProps} />
                    </Suspense>
                );
            case 'admin':
                return isAdmin ? (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminDashboard {...commonProps} />
                    </Suspense>
                ) : null;
            default:
                return (
                    <div className="dashboard-welcome">
                        <h2>Welcome to LeadFive</h2>
                        <p>Select a tab to view dashboard features</p>
                    </div>
                );
        }
    };

    if (!account) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="dashboard-brand">
                        <h1>🚀 LeadFive</h1>
                        <p>Advanced MLM Platform on BSC</p>
                    </div>
                </div>
                
                <div className="wallet-connect-section">
                    <UnifiedWalletConnect
                        onConnect={handleWalletConnect}
                        onDisconnect={handleWalletDisconnect}
                        onError={(error) => setError(error)}
                        buttonText="Connect Wallet to Dashboard"
                    />
                </div>

                {error && (
                    <div className="error-message">
                        <p>❌ {error}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="dashboard-container">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="dashboard-brand">
                        <h1>🚀 LeadFive Dashboard</h1>
                        <p>Welcome back, {account.slice(0, 6)}...{account.slice(-4)}</p>
                    </div>
                    
                    <div className="dashboard-controls">
                        <div className="network-status">
                            <span className={`status-indicator ${networkStatus}`}></span>
                            <span>{networkStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        
                        <UnifiedWalletConnect
                            onConnect={handleWalletConnect}
                            onDisconnect={handleWalletDisconnect}
                            onError={(error) => setError(error)}
                            buttonText="Reconnect Wallet"
                        />
                    </div>
                </header>

                {/* Quick Stats */}
                <div className="quick-stats">
                    <div className="stat-card">
                        <div className="stat-label">Total Earnings</div>
                        <div className="stat-value">${parseFloat(dashboardData.earnings).toFixed(2)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Team Size</div>
                        <div className="stat-value">{dashboardData.teamSize}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Rank</div>
                        <div className="stat-value">{dashboardData.rank}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Package</div>
                        <div className="stat-value">{dashboardData.package}</div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="dashboard-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Main Content */}
                <main className="dashboard-content">
                    {loading && <LoadingSpinner />}
                    {error && (
                        <div className="error-message">
                            <p>❌ {error}</p>
                            <button onClick={() => setError(null)}>Dismiss</button>
                        </div>
                    )}
                    {renderActiveComponent()}
                </main>

                {/* Footer */}
                <footer className="dashboard-footer">
                    <p>LeadFive v1.0 - Advanced MLM Platform</p>
                    <p>Contract: {LEAD_FIVE_CONFIG.address}</p>
                </footer>
            </div>
        </ErrorBoundary>
    );
};

export default Dashboard;
