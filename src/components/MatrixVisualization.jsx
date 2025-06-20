// LeadFive Matrix Visualization Component
import React, { useState, useEffect } from 'react';
import './MatrixVisualization.css';

const MatrixVisualization = ({ 
    contract, 
    account, 
    userInfo, 
    dashboardData, 
    onRefresh 
}) => {
    const [matrixData, setMatrixData] = useState({
        currentLevel: 1,
        position: null,
        upline: null,
        downline: [],
        earnings: '0',
        isActive: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contract && account && userInfo) {
            fetchMatrixData();
        }
    }, [contract, account, userInfo]);

    const fetchMatrixData = async () => {
        if (!contract || !account) return;

        try {
            setLoading(true);
            
            // Get user's matrix information
            const user = await contract.users(account);
            const matrixLevel = user.currentLevel || 1;
            const position = user.id?.toString() || null;
            
            // Get matrix structure data
            let upline = null;
            let downline = [];
            
            if (position && position !== '0') {
                try {
                    // Get upline information
                    const uplineId = Math.floor((parseInt(position) - 1) / 2) + 1;
                    if (uplineId !== parseInt(position)) {
                        const uplineAddress = await contract.idToAddress(uplineId);
                        const uplineUser = await contract.users(uplineAddress);
                        upline = {
                            id: uplineId,
                            address: uplineAddress,
                            level: uplineUser.currentLevel || 1
                        };
                    }

                    // Get downline information (simplified)
                    const maxCheck = Math.min(parseInt(position) * 2 + 2, parseInt(position) + 10);
                    for (let i = parseInt(position) * 2; i <= maxCheck; i++) {
                        try {
                            const downlineAddress = await contract.idToAddress(i);
                            if (downlineAddress !== ethers.constants.AddressZero) {
                                const downlineUser = await contract.users(downlineAddress);
                                downline.push({
                                    id: i,
                                    address: downlineAddress,
                                    level: downlineUser.currentLevel || 1
                                });
                            }
                        } catch (err) {
                            // No user at this ID
                            break;
                        }
                    }
                } catch (err) {
                    console.log('Matrix data fetch error:', err);
                }
            }

            setMatrixData({
                currentLevel: matrixLevel,
                position: position,
                upline: upline,
                downline: downline,
                earnings: userInfo?.totalRewards || '0',
                isActive: user.isActive || false
            });

        } catch (err) {
            console.error('Failed to fetch matrix data:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderMatrixNode = (nodeData, isUser = false) => (
        <div className={`matrix-node ${isUser ? 'user-node' : ''} ${nodeData?.address ? 'filled' : 'empty'}`}>
            {nodeData?.address ? (
                <>
                    <div className="node-id">#{nodeData.id}</div>
                    <div className="node-address">
                        {nodeData.address.slice(0, 6)}...{nodeData.address.slice(-4)}
                    </div>
                    <div className="node-level">Level {nodeData.level}</div>
                </>
            ) : (
                <div className="empty-slot">Empty</div>
            )}
        </div>
    );

    const renderMatrixTree = () => {
        if (!matrixData.position) {
            return (
                <div className="matrix-empty">
                    <h3>Not Registered</h3>
                    <p>Join the matrix to see your position and network</p>
                </div>
            );
        }

        return (
            <div className="matrix-tree">
                {/* Upline Level */}
                {matrixData.upline && (
                    <div className="matrix-level upline-level">
                        <h4>Upline</h4>
                        <div className="matrix-row">
                            {renderMatrixNode(matrixData.upline)}
                        </div>
                    </div>
                )}

                {/* User Level */}
                <div className="matrix-level user-level">
                    <h4>Your Position</h4>
                    <div className="matrix-row">
                        {renderMatrixNode({
                            id: matrixData.position,
                            address: account,
                            level: matrixData.currentLevel
                        }, true)}
                    </div>
                </div>

                {/* Downline Level */}
                <div className="matrix-level downline-level">
                    <h4>Your Team</h4>
                    <div className="matrix-row">
                        {Array.from({ length: 2 }, (_, i) => {
                            const downlineNode = matrixData.downline[i];
                            return (
                                <div key={i} className="downline-slot">
                                    {renderMatrixNode(downlineNode)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="matrix-visualization">
            <div className="matrix-header">
                <h2>🔄 Binary Matrix Visualization</h2>
                <button 
                    onClick={fetchMatrixData} 
                    disabled={loading}
                    className="refresh-btn"
                >
                    {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
            </div>

            <div className="matrix-stats">
                <div className="matrix-stat">
                    <label>Position</label>
                    <span>#{matrixData.position || 'Not Registered'}</span>
                </div>
                <div className="matrix-stat">
                    <label>Level</label>
                    <span>{matrixData.currentLevel}</span>
                </div>
                <div className="matrix-stat">
                    <label>Status</label>
                    <span className={matrixData.isActive ? 'active' : 'inactive'}>
                        {matrixData.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div className="matrix-stat">
                    <label>Matrix Earnings</label>
                    <span>${parseFloat(matrixData.earnings).toFixed(2)}</span>
                </div>
            </div>

            <div className="matrix-content">
                {loading ? (
                    <div className="loading-matrix">
                        <p>Loading matrix data...</p>
                    </div>
                ) : (
                    renderMatrixTree()
                )}
            </div>

            <div className="matrix-info">
                <h3>How Binary Matrix Works</h3>
                <ul>
                    <li>🔸 Each position can have maximum 2 direct referrals</li>
                    <li>🔸 When your position is filled, spillover creates new opportunities</li>
                    <li>🔸 Earn commissions from your entire matrix network</li>
                    <li>🔸 Higher levels unlock greater earning potential</li>
                </ul>
            </div>
        </div>
    );
};

export default MatrixVisualization;
