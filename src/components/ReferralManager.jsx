// LeadFive Referral Manager Component
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './ReferralManager.css';

const ReferralManager = ({ 
    contract, 
    account, 
    userInfo, 
    dashboardData, 
    onRefresh 
}) => {
    const [referralData, setReferralData] = useState({
        referralLink: '',
        totalReferrals: 0,
        activeReferrals: 0,
        referralEarnings: '0',
        levelCommissions: {},
        recentReferrals: []
    });
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (contract && account && userInfo) {
            fetchReferralData();
        }
    }, [contract, account, userInfo]);

    useEffect(() => {
        // Generate referral link
        const baseUrl = window.location.origin;
        const referralLink = `${baseUrl}?ref=${account}`;
        setReferralData(prev => ({
            ...prev,
            referralLink: referralLink
        }));
    }, [account]);

    const fetchReferralData = async () => {
        if (!contract || !account) return;

        try {
            setLoading(true);
            
            // Get user's referral information
            const user = await contract.users(account);
            const totalReferrals = parseInt(user.teamSize?.toString() || '0');
            
            // Get referral earnings and commissions
            const referralEarnings = user.totalReferralRewards || '0';
            
            // Get direct referrals
            let directReferrals = [];
            let activeCount = 0;
            
            try {
                const referralCount = await contract.getUserReferralCount(account);
                const count = Math.min(parseInt(referralCount.toString()), 20); // Limit for performance
                
                for (let i = 0; i < count; i++) {
                    try {
                        const referralAddress = await contract.getUserReferral(account, i);
                        const referralUser = await contract.users(referralAddress);
                        
                        const referral = {
                            address: referralAddress,
                            id: referralUser.id?.toString() || '0',
                            totalDeposits: referralUser.totalDeposits || '0',
                            totalRewards: referralUser.totalRewards || '0',
                            isActive: referralUser.isActive || false,
                            joinDate: new Date(parseInt(referralUser.registrationTime || '0') * 1000),
                            currentPackage: referralUser.currentPackage?.toString() || '0'
                        };
                        
                        directReferrals.push(referral);
                        if (referral.isActive) activeCount++;
                        
                    } catch (err) {
                        console.log(`Error fetching referral ${i}:`, err);
                        break;
                    }
                }
            } catch (err) {
                console.log('Error fetching referrals:', err);
            }

            // Calculate level commissions (simulate based on team structure)
            const levelCommissions = {
                1: directReferrals.length,
                2: Math.max(0, totalReferrals - directReferrals.length),
                3: 0, // Would need more complex calculation
                4: 0,
                5: 0
            };

            setReferralData(prev => ({
                ...prev,
                totalReferrals: totalReferrals,
                activeReferrals: activeCount,
                referralEarnings: ethers.formatEther(referralEarnings),
                levelCommissions: levelCommissions,
                recentReferrals: directReferrals
                    .sort((a, b) => b.joinDate.getTime() - a.joinDate.getTime())
                    .slice(0, 10)
            }));

        } catch (err) {
            console.error('Failed to fetch referral data:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = async () => {
        try {
            await navigator.clipboard.writeText(referralData.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const shareOnSocial = (platform) => {
        const text = encodeURIComponent(`Join LeadFive and start earning! Use my referral link:`);
        const url = encodeURIComponent(referralData.referralLink);
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            telegram: `https://t.me/share/url?url=${url}&text=${text}`,
            whatsapp: `https://wa.me/?text=${text}%20${url}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank');
        }
    };

    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (date) => {
        if (!date || date.getTime() === 0) return 'Unknown';
        return date.toLocaleDateString();
    };

    const getPackageName = (packageId) => {
        const packages = {
            '0': 'Not Registered',
            '1': 'Starter ($25)',
            '2': 'Basic ($50)',
            '3': 'Premium ($100)',
            '4': 'VIP ($250)',
            '5': 'Elite ($500)'
        };
        return packages[packageId] || 'Unknown';
    };

    return (
        <div className="referral-manager">
            <div className="referral-header">
                <h2>🤝 Referral Manager</h2>
                <button 
                    onClick={fetchReferralData} 
                    disabled={loading}
                    className="refresh-btn"
                >
                    {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Referral Stats */}
            <div className="referral-stats">
                <div className="stat-card total">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Total Referrals</h3>
                        <div className="stat-value">{referralData.totalReferrals}</div>
                        <div className="stat-label">All levels</div>
                    </div>
                </div>

                <div className="stat-card active">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>Active Referrals</h3>
                        <div className="stat-value">{referralData.activeReferrals}</div>
                        <div className="stat-label">Direct active</div>
                    </div>
                </div>

                <div className="stat-card earnings">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Referral Earnings</h3>
                        <div className="stat-value">${parseFloat(referralData.referralEarnings).toFixed(2)}</div>
                        <div className="stat-label">Total commissions</div>
                    </div>
                </div>

                <div className="stat-card conversion">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                        <h3>Conversion Rate</h3>
                        <div className="stat-value">
                            {referralData.totalReferrals > 0 
                                ? ((referralData.activeReferrals / referralData.totalReferrals) * 100).toFixed(1)
                                : '0'
                            }%
                        </div>
                        <div className="stat-label">Active/Total</div>
                    </div>
                </div>
            </div>

            {/* Referral Link Section */}
            <div className="referral-link-section">
                <h3>Your Referral Link</h3>
                <div className="link-container">
                    <input 
                        type="text" 
                        value={referralData.referralLink}
                        readOnly
                        className="referral-input"
                    />
                    <button 
                        onClick={copyReferralLink}
                        className={`copy-btn ${copied ? 'copied' : ''}`}
                    >
                        {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                </div>

                <div className="share-buttons">
                    <button onClick={() => shareOnSocial('twitter')} className="share-btn twitter">
                        🐦 Twitter
                    </button>
                    <button onClick={() => shareOnSocial('facebook')} className="share-btn facebook">
                        📘 Facebook
                    </button>
                    <button onClick={() => shareOnSocial('telegram')} className="share-btn telegram">
                        📱 Telegram
                    </button>
                    <button onClick={() => shareOnSocial('whatsapp')} className="share-btn whatsapp">
                        💬 WhatsApp
                    </button>
                </div>
            </div>

            {/* Level Commissions */}
            <div className="level-commissions">
                <h3>Level Commission Structure</h3>
                <div className="levels-grid">
                    {Object.entries(referralData.levelCommissions).map(([level, count]) => (
                        <div key={level} className="level-card">
                            <div className="level-number">Level {level}</div>
                            <div className="level-count">{count}</div>
                            <div className="level-label">
                                {level === '1' ? 'Direct' : 'Indirect'} Referrals
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Referrals */}
            <div className="recent-referrals">
                <h3>Recent Referrals</h3>
                <div className="referrals-list">
                    {loading ? (
                        <div className="loading-referrals">
                            <p>Loading referral data...</p>
                        </div>
                    ) : referralData.recentReferrals.length === 0 ? (
                        <div className="no-referrals">
                            <div className="no-referrals-icon">🎯</div>
                            <h4>Start Building Your Network</h4>
                            <p>Share your referral link to start earning commissions from your network!</p>
                            <ul>
                                <li>💰 Earn direct referral commissions</li>
                                <li>🏆 Get level bonuses from team growth</li>
                                <li>📈 Build passive income streams</li>
                                <li>🎁 Unlock leader pool rewards</li>
                            </ul>
                        </div>
                    ) : (
                        referralData.recentReferrals.map((referral, index) => (
                            <div key={referral.address} className="referral-item">
                                <div className="referral-info">
                                    <div className="referral-address">
                                        <span className="address-text">{formatAddress(referral.address)}</span>
                                        <span className={`status ${referral.isActive ? 'active' : 'inactive'}`}>
                                            {referral.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="referral-details">
                                        <span>ID: {referral.id}</span>
                                        <span>•</span>
                                        <span>{getPackageName(referral.currentPackage)}</span>
                                        <span>•</span>
                                        <span>Joined: {formatDate(referral.joinDate)}</span>
                                    </div>
                                </div>
                                <div className="referral-metrics">                                <div className="metric">
                                    <label>Deposits</label>
                                    <span>${parseFloat(ethers.formatEther(referral.totalDeposits)).toFixed(2)}</span>
                                </div>
                                <div className="metric">
                                    <label>Rewards</label>
                                    <span>${parseFloat(ethers.formatEther(referral.totalRewards)).toFixed(2)}</span>
                                </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Referral Tips */}
            <div className="referral-tips">
                <h3>Maximize Your Referral Success</h3>
                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-icon">🎯</div>
                        <h4>Target the Right Audience</h4>
                        <p>Focus on people interested in cryptocurrency, passive income, and investment opportunities.</p>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">📚</div>
                        <h4>Educate and Support</h4>
                        <p>Help your referrals understand the platform and guide them through their first investments.</p>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">🔄</div>
                        <h4>Stay Active</h4>
                        <p>Regular engagement and activity in the platform builds trust and encourages referrals.</p>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">💬</div>
                        <h4>Use Social Proof</h4>
                        <p>Share your success stories and earnings to demonstrate the platform's potential.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralManager;
