
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import OrphiCrowdFundSDK from './OrphiCrowdFundSDK';

const OrphiCrowdFundDashboard = () => {
    const [sdk, setSdk] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initializeSDK();
    }, []);

    const initializeSDK = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const newSdk = new OrphiCrowdFundSDK(provider);
                setSdk(newSdk);
            }
        } catch (error) {
            console.error('Failed to initialize SDK:', error);
        }
    };

    const connectWallet = async () => {
        try {
            setLoading(true);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            sdk.connect(signer);
            setIsConnected(true);
            
            // Load user info
            const info = await sdk.getUserInfo(address);
            setUserInfo(info);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const registerUser = async (sponsorAddress, packageTier) => {
        try {
            setLoading(true);
            const packageInfo = sdk.getPackageInfo(packageTier);
            const amount = sdk.parseBNB(packageInfo.amount);
            
            const tx = await sdk.registerUser(sponsorAddress, packageTier, amount);
            await tx.wait();
            
            // Refresh user info
            const signer = await sdk.provider.getSigner();
            const address = await signer.getAddress();
            const info = await sdk.getUserInfo(address);
            setUserInfo(info);
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const withdraw = async (amount) => {
        try {
            setLoading(true);
            const tx = await sdk.withdraw(amount);
            await tx.wait();
            
            // Refresh user info
            const signer = await sdk.provider.getSigner();
            const address = await signer.getAddress();
            const info = await sdk.getUserInfo(address);
            setUserInfo(info);
        } catch (error) {
            console.error('Withdrawal failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="orphi-dashboard">
            <h1>Orphi CrowdFund Dashboard</h1>
            
            {!isConnected ? (
                <button onClick={connectWallet} disabled={loading}>
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            ) : (
                <div>
                    <h2>User Information</h2>
                    {userInfo && (
                        <div>
                            <p>Registered: {userInfo.isRegistered.toString()}</p>
                            <p>Current Tier: {userInfo.currentTier.toString()}</p>
                            <p>Total Investment: {sdk.formatUSDT(userInfo.totalInvestment)} USDT</p>
                            <p>Total Earnings: {sdk.formatUSDT(userInfo.totalEarnings)} USDT</p>
                            <p>Withdrawable: {sdk.formatUSDT(userInfo.withdrawableBalance)} USDT</p>
                            <p>Direct Referrals: {userInfo.directReferrals.toString()}</p>
                        </div>
                    )}
                    
                    {!userInfo?.isRegistered && (
                        <div>
                            <h3>Register</h3>
                            <button onClick={() => registerUser('', 0)} disabled={loading}>
                                Register Package 1 ($30)
                            </button>
                        </div>
                    )}
                    
                    {userInfo?.withdrawableBalance > 0 && (
                        <div>
                            <h3>Withdraw</h3>
                            <button 
                                onClick={() => withdraw(userInfo.withdrawableBalance)} 
                                disabled={loading}
                            >
                                Withdraw All ({sdk.formatUSDT(userInfo.withdrawableBalance)} USDT)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrphiCrowdFundDashboard;
