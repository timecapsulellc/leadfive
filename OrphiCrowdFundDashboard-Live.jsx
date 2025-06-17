import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Live Mainnet Configuration
const LIVE_CONFIG = {
    contractAddress: "0x4965197b430343daec1042B413Dd6e20D06dAdba",
    networkId: 56,
    networkName: "BSC Mainnet",
    explorerUrl: "https://bscscan.com",
    rpcUrl: "https://bsc-dataseed.binance.org/"
};

// Simplified ABI for live contract
const CONTRACT_ABI = [
    "function getUserInfo(address user) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate))",
    "function getPoolBalances() view returns (uint96, uint96, uint96)",
    "function packages(uint8) view returns (tuple(uint96 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus))",
    "function register(address referrer, uint8 packageLevel, bool useUSDT) payable",
    "function upgradePackage(uint8 newLevel, bool useUSDT) payable",
    "function withdraw(uint96 amount)",
    "function paused() view returns (bool)"
];

const OrphiCrowdFundDashboard = () => {
    const [contract, setContract] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [poolBalances, setPoolBalances] = useState([0, 0, 0]);
    const [packages, setPackages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState(null);
    const [networkError, setNetworkError] = useState(false);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await connectWallet();
                }
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        }
    };

    const connectWallet = async () => {
        try {
            setLoading(true);
            setNetworkError(false);

            if (!window.ethereum) {
                alert('Please install MetaMask!');
                return;
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            
            // Check if on BSC Mainnet
            if (Number(network.chainId) !== LIVE_CONFIG.networkId) {
                setNetworkError(true);
                await switchToBSC();
                return;
            }

            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            const contractInstance = new ethers.Contract(
                LIVE_CONFIG.contractAddress,
                CONTRACT_ABI,
                signer
            );
            
            setContract(contractInstance);
            setAccount(address);
            setIsConnected(true);
            
            // Load data
            await loadUserData(contractInstance, address);
            await loadPoolData(contractInstance);
            await loadPackages(contractInstance);
            
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const switchToBSC = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${LIVE_CONFIG.networkId.toString(16)}` }],
            });
            
            // Retry connection after network switch
            setTimeout(() => connectWallet(), 1000);
            
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${LIVE_CONFIG.networkId.toString(16)}`,
                            chainName: LIVE_CONFIG.networkName,
                            rpcUrls: [LIVE_CONFIG.rpcUrl],
                            blockExplorerUrls: [LIVE_CONFIG.explorerUrl],
                            nativeCurrency: {
                                name: 'BNB',
                                symbol: 'BNB',
                                decimals: 18
                            }
                        }],
                    });
                    
                    setTimeout(() => connectWallet(), 1000);
                    
                } catch (addError) {
                    console.error('Failed to add BSC network:', addError);
                    alert('Please manually add BSC Mainnet to your wallet');
                }
            }
        }
    };

    const loadUserData = async (contractInstance, address) => {
        try {
            const info = await contractInstance.getUserInfo(address);
            
            // Transform to match existing interface
            setUserInfo({
                isRegistered: info.isRegistered,
                sponsor: info.referrer,
                currentTier: info.packageLevel,
                totalInvestment: info.totalInvestment,
                totalEarnings: info.totalEarnings,
                withdrawableBalance: info.balance,
                directReferrals: info.directReferrals,
                teamSize: info.teamSize,
                rank: info.rank,
                withdrawalRate: info.withdrawalRate,
                earningsCap: info.earningsCap
            });
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const loadPoolData = async (contractInstance) => {
        try {
            const balances = await contractInstance.getPoolBalances();
            setPoolBalances(balances);
        } catch (error) {
            console.error('Failed to load pool data:', error);
        }
    };

    const loadPackages = async (contractInstance) => {
        try {
            const packageData = [];
            const packageInfo = [
                { name: "Starter", price: 30 },
                { name: "Basic", price: 50 },
                { name: "Standard", price: 100 },
                { name: "Advanced", price: 200 },
                { name: "Professional", price: 300 },
                { name: "Premium", price: 500 },
                { name: "Elite", price: 1000 },
                { name: "Ultimate", price: 2000 }
            ];

            for (let i = 1; i <= 8; i++) {
                try {
                    const pkg = await contractInstance.packages(i);
                    packageData.push({
                        id: i,
                        name: packageInfo[i-1].name,
                        price: packageInfo[i-1].price,
                        directBonus: Number(pkg.directBonus) / 100,
                        levelBonus: Number(pkg.levelBonus) / 100
                    });
                } catch (error) {
                    console.error(`Error loading package ${i}:`, error);
                }
            }
            setPackages(packageData);
        } catch (error) {
            console.error('Failed to load packages:', error);
        }
    };

    const registerUser = async (packageTier) => {
        try {
            setLoading(true);
            
            const referrer = new URLSearchParams(window.location.search).get('ref') || ethers.ZeroAddress;
            const packagePrice = packages[packageTier - 1]?.price || 30;
            
            // Convert USD to BNB (approximate)
            const bnbAmount = ethers.parseEther((packagePrice / 300).toString());
            
            const tx = await contract.register(referrer, packageTier, false, {
                value: bnbAmount
            });
            
            console.log('Registration transaction:', tx.hash);
            await tx.wait();
            
            alert('Registration successful!');
            await loadUserData(contract, account);
            
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const upgradePackage = async (newTier) => {
        try {
            setLoading(true);
            
            const packagePrice = packages[newTier - 1]?.price || 30;
            const bnbAmount = ethers.parseEther((packagePrice / 300).toString());
            
            const tx = await contract.upgradePackage(newTier, false, {
                value: bnbAmount
            });
            
            console.log('Upgrade transaction:', tx.hash);
            await tx.wait();
            
            alert('Package upgraded successfully!');
            await loadUserData(contract, account);
            
        } catch (error) {
            console.error('Upgrade failed:', error);
            alert('Upgrade failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const withdraw = async () => {
        try {
            setLoading(true);
            
            if (!userInfo?.withdrawableBalance || userInfo.withdrawableBalance === 0n) {
                alert('No balance available for withdrawal');
                return;
            }
            
            const tx = await contract.withdraw(userInfo.withdrawableBalance);
            console.log('Withdrawal transaction:', tx.hash);
            await tx.wait();
            
            alert('Withdrawal successful!');
            await loadUserData(contract, account);
            
        } catch (error) {
            console.error('Withdrawal failed:', error);
            alert('Withdrawal failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (networkError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Wrong Network</h2>
                    <p className="text-gray-600 mb-6">
                        Please switch to BSC Mainnet to use OrphiCrowdFund
                    </p>
                    <button
                        onClick={switchToBSC}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Switch to BSC Mainnet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-lg">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-gray-800">OrphiCrowdFund</h1>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">LIVE</span>
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">BSC MAINNET</span>
                    </div>
                    
                    {!isConnected ? (
                        <button
                            onClick={connectWallet}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {account?.slice(0, 6)}...{account?.slice(-4)}
                            </span>
                            <a
                                href={`${LIVE_CONFIG.explorerUrl}/address/${LIVE_CONFIG.contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                View Contract
                            </a>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {!isConnected ? (
                    <div className="text-center py-16">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Welcome to OrphiCrowdFund
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Connect your wallet to access the live platform on BSC Mainnet
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-xl font-semibold mb-2">🎯 40% Direct Bonus</h3>
                                <p>Earn 40% commission on direct referrals</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-xl font-semibold mb-2">📈 10-Level System</h3>
                                <p>Earn from 10 levels of your network</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-xl font-semibold mb-2">💰 Global Pools</h3>
                                <p>Participate in global reward pools</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* User Stats */}
                        {userInfo && (
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-700">Status</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {userInfo.isRegistered ? 'Registered' : 'Not Registered'}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-700">Package Level</h3>
                                    <p className="text-2xl font-bold text-blue-600">{userInfo.currentTier}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-700">Balance</h3>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {ethers.formatEther(userInfo.withdrawableBalance)} ETH
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-700">Total Earnings</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {ethers.formatEther(userInfo.totalEarnings)} ETH
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Pool Balances */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-700">Leader Pool</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {ethers.formatEther(poolBalances[0])} ETH
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-700">Help Pool</h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {ethers.formatEther(poolBalances[1])} ETH
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-700">Club Pool</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {ethers.formatEther(poolBalances[2])} ETH
                                </p>
                            </div>
                        </div>

                        {/* Packages */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Available Packages</h2>
                            <div className="grid md:grid-cols-4 gap-6">
                                {packages.map((pkg) => (
                                    <div key={pkg.id} className="bg-white p-6 rounded-lg shadow-lg">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                                        <p className="text-3xl font-bold text-blue-600 mb-2">${pkg.price}</p>
                                        <div className="space-y-1 mb-4">
                                            <p className="text-sm">Direct: {pkg.directBonus}%</p>
                                            <p className="text-sm">Level: {pkg.levelBonus}%</p>
                                        </div>
                                        
                                        {!userInfo?.isRegistered ? (
                                            <button
                                                onClick={() => registerUser(pkg.id)}
                                                disabled={loading}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {loading ? 'Processing...' : 'Register'}
                                            </button>
                                        ) : userInfo.currentTier < pkg.id ? (
                                            <button
                                                onClick={() => upgradePackage(pkg.id)}
                                                disabled={loading}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {loading ? 'Processing...' : 'Upgrade'}
                                            </button>
                                        ) : userInfo.currentTier === pkg.id ? (
                                            <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-center">
                                                Current Package
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Withdrawal */}
                        {userInfo?.withdrawableBalance > 0 && (
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Withdraw Earnings</h3>
                                <p className="text-gray-600 mb-4">
                                    Available: {ethers.formatEther(userInfo.withdrawableBalance)} ETH
                                </p>
                                <button
                                    onClick={withdraw}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Withdraw All'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrphiCrowdFundDashboard; 