import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './MatrixPositionDisplay.css';

const MatrixPositionDisplay = ({ account, provider, signer, contractAddress, contractABI }) => {
  const [matrixData, setMatrixData] = useState({
    x3: { positions: [], activeLevel: 0, earnings: '0', recycleCount: 0 },
    x4: { positions: [], activeLevel: 0, earnings: '0', recycleCount: 0 },
    x6: { positions: [], activeLevel: 0, earnings: '0', recycleCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState('0');

  // Matrix configuration based on smart contract
  const MATRIX_CONFIGS = {
    x3: {
      name: 'X3 Matrix',
      description: 'Direct Referral Matrix',
      maxLevels: 12,
      icon: '🔥',
      color: '#ff6b6b'
    },
    x4: {
      name: 'X4 Matrix',
      description: 'Team Building Matrix',
      maxLevels: 12,
      icon: '⭐',
      color: '#4ecdc4'
    },
    x6: {
      name: 'X6 Matrix',
      description: 'Global Matrix',
      maxLevels: 12,
      icon: '💎',
      color: '#45b7d1'
    }
  };

  // Level prices in USDT (based on smart contract)
  const LEVEL_PRICES = {
    1: 5, 2: 10, 3: 20, 4: 40, 5: 80, 6: 160,
    7: 320, 8: 640, 9: 1280, 10: 2560, 11: 5120, 12: 10240
  };

  useEffect(() => {
    if (account && provider && contractAddress) {
      fetchMatrixData();
    }
  }, [account, provider, contractAddress]);

  const fetchMatrixData = async () => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Fetch data for each matrix type
      const matrices = ['x3', 'x4', 'x6'];
      const newMatrixData = {};
      let totalEarningsSum = 0;

      for (const matrixType of matrices) {
        try {
          // Get user's matrix data
          const userMatrix = await contract.users(account);
          const activeLevel = await contract.usersActiveX3Levels(account, 1) ? 1 : 0;
          
          // Get earnings for this matrix
          const earnings = await contract.getUserMatrixEarnings?.(account, matrixType.toUpperCase()) || '0';
          
          // Get recycle count
          const recycleCount = await contract.getUserRecycleCount?.(account, matrixType.toUpperCase()) || 0;
          
          // Generate position data for visualization
          const positions = [];
          for (let level = 1; level <= MATRIX_CONFIGS[matrixType].maxLevels; level++) {
            const isActive = level <= activeLevel;
            const price = LEVEL_PRICES[level];
            
            positions.push({
              level,
              isActive,
              price,
              earnings: isActive ? (parseFloat(earnings) / MATRIX_CONFIGS[matrixType].maxLevels).toFixed(2) : '0',
              partners: isActive ? Math.floor(Math.random() * 3) + 1 : 0, // Mock data - replace with real contract calls
              isCompleted: isActive && Math.random() > 0.5
            });
          }

          newMatrixData[matrixType] = {
            positions,
            activeLevel,
            earnings: ethers.formatEther(earnings || '0'),
            recycleCount: recycleCount.toString()
          };

          totalEarningsSum += parseFloat(ethers.formatEther(earnings || '0'));
        } catch (error) {
          console.warn(`Error fetching ${matrixType} data:`, error);
          newMatrixData[matrixType] = {
            positions: [],
            activeLevel: 0,
            earnings: '0',
            recycleCount: 0
          };
        }
      }

      setMatrixData(newMatrixData);
      setTotalEarnings(totalEarningsSum.toFixed(4));
    } catch (error) {
      console.error('Error fetching matrix data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeLevel = async (matrixType, level) => {
    if (!signer) {
      alert('Please connect your wallet to upgrade');
      return;
    }

    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const price = LEVEL_PRICES[level];
      const priceInWei = ethers.parseEther(price.toString());

      // Call the appropriate upgrade function
      const tx = await contract.buyNewLevel(matrixType.toUpperCase(), level, {
        value: priceInWei,
        gasLimit: 500000
      });

      await tx.wait();
      alert(`Successfully upgraded to ${matrixType.toUpperCase()} Level ${level}!`);
      fetchMatrixData(); // Refresh data
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="matrix-loading">
        <div className="loading-spinner"></div>
        <p>Loading Matrix Positions...</p>
      </div>
    );
  }

  return (
    <div className="matrix-position-display">
      <div className="matrix-header">
        <h2>🔹 Matrix Position Dashboard</h2>
        <div className="total-earnings">
          <span className="earnings-label">Total Matrix Earnings:</span>
          <span className="earnings-value">{totalEarnings} USDT</span>
        </div>
      </div>

      <div className="matrix-grid">
        {Object.entries(MATRIX_CONFIGS).map(([matrixType, config]) => {
          const data = matrixData[matrixType];
          return (
            <div key={matrixType} className="matrix-card" style={{ borderColor: config.color }}>
              <div className="matrix-card-header" style={{ backgroundColor: config.color }}>
                <span className="matrix-icon">{config.icon}</span>
                <div className="matrix-info">
                  <h3>{config.name}</h3>
                  <p>{config.description}</p>
                </div>
              </div>

              <div className="matrix-stats">
                <div className="stat-item">
                  <span className="stat-label">Active Level:</span>
                  <span className="stat-value">{data.activeLevel}/{config.maxLevels}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Earnings:</span>
                  <span className="stat-value">{data.earnings} USDT</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Recycles:</span>
                  <span className="stat-value">{data.recycleCount}</span>
                </div>
              </div>

              <div className="matrix-levels">
                <h4>Level Progression</h4>
                <div className="levels-grid">
                  {data.positions.slice(0, 6).map((position) => (
                    <div
                      key={position.level}
                      className={`level-slot ${position.isActive ? 'active' : 'inactive'} ${
                        position.isCompleted ? 'completed' : ''
                      }`}
                    >
                      <div className="level-number">{position.level}</div>
                      <div className="level-price">{position.price} USDT</div>
                      {position.isActive ? (
                        <div className="level-details">
                          <div className="level-earnings">+{position.earnings} USDT</div>
                          <div className="level-partners">{position.partners} Partners</div>
                        </div>
                      ) : (
                        <button
                          className="upgrade-btn"
                          onClick={() => handleUpgradeLevel(matrixType, position.level)}
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {data.positions.length > 6 && (
                  <div className="view-all-levels">
                    <button className="btn-secondary">
                      View All {config.maxLevels} Levels
                    </button>
                  </div>
                )}
              </div>

              <div className="matrix-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(data.activeLevel / config.maxLevels) * 100}%`,
                      backgroundColor: config.color
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {Math.round((data.activeLevel / config.maxLevels) * 100)}% Complete
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="matrix-insights">
        <h3>💡 Matrix Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Next Recommended Action</h4>
            <p>Upgrade X3 Level 2 for maximum ROI potential</p>
          </div>
          <div className="insight-card">
            <h4>📈 Earning Potential</h4>
            <p>Complete current levels to unlock recycling bonuses</p>
          </div>
          <div className="insight-card">
            <h4>🔄 Recycling Benefits</h4>
            <p>Each recycle can generate 2-3x the original investment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixPositionDisplay;
