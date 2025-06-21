import React, { useState, useEffect } from 'react';
import './MatrixView.css';

const MatrixView = ({ account, contract }) => {
  const [matrixData, setMatrixData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account && contract) {
      fetchMatrixData();
    }
  }, [account, contract]);

  const fetchMatrixData = async () => {
    try {
      setLoading(true);
      
      // Mock 5x5 matrix data
      const mockMatrix = {
        level1: {
          positions: Array(25).fill(null).map((_, i) => ({
            id: i + 1,
            address: i < 15 ? `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}` : null,
            isActive: i < 15,
            package: ['Entry', 'Standard', 'Advanced', 'Premium'][Math.floor(Math.random() * 4)],
            earnings: i < 15 ? (Math.random() * 500 + 50).toFixed(2) : '0.00'
          })),
          totalEarnings: '2,450.75',
          cycleCount: 3
        },
        level2: {
          positions: Array(25).fill(null).map((_, i) => ({
            id: i + 1,
            address: i < 8 ? `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}` : null,
            isActive: i < 8,
            package: ['Standard', 'Advanced', 'Premium'][Math.floor(Math.random() * 3)],
            earnings: i < 8 ? (Math.random() * 800 + 100).toFixed(2) : '0.00'
          })),
          totalEarnings: '1,875.50',
          cycleCount: 1
        }
      };
      
      setMatrixData(mockMatrix);
      
    } catch (error) {
      console.error('Error fetching matrix data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMatrixGrid = (levelData) => {
    return (
      <div className="matrix-grid">
        {levelData.positions.map((position, index) => (
          <div
            key={index}
            className={`matrix-position ${position.address ? 'filled' : 'empty'} ${index === 0 ? 'center' : ''}`}
          >
            {position.address ? (
              <div className="position-content">
                <div className="position-avatar">
                  <span>{position.address.charAt(2)}</span>
                </div>
                <div className="position-info">
                  <div className="position-address">{position.address}</div>
                  <div className="position-package">{position.package}</div>
                  <div className="position-earnings">${position.earnings}</div>
                </div>
              </div>
            ) : (
              <div className="empty-position">
                <span className="position-number">{index + 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="matrix-loading">Loading matrix data...</div>;
  }

  const currentLevel = matrixData[`level${selectedLevel}`];

  return (
    <div className="matrix-view">
      <div className="matrix-header">
        <h2>5x5 Matrix Structure</h2>
        <div className="level-selector">
          <button
            className={`level-btn ${selectedLevel === 1 ? 'active' : ''}`}
            onClick={() => setSelectedLevel(1)}
          >
            Level 1
          </button>
          <button
            className={`level-btn ${selectedLevel === 2 ? 'active' : ''}`}
            onClick={() => setSelectedLevel(2)}
          >
            Level 2
          </button>
        </div>
      </div>

      <div className="matrix-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Earnings</h3>
            <p>${currentLevel.totalEarnings}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>Cycle Count</h3>
            <p>{currentLevel.cycleCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Filled Positions</h3>
            <p>{currentLevel.positions.filter(p => p.address).length}/25</p>
          </div>
        </div>
      </div>

      <div className="matrix-container">
        {renderMatrixGrid(currentLevel)}
      </div>

      <div className="matrix-legend">
        <div className="legend-item">
          <div className="legend-color filled"></div>
          <span>Filled Position</span>
        </div>
        <div className="legend-item">
          <div className="legend-color empty"></div>
          <span>Empty Position</span>
        </div>
        <div className="legend-item">
          <div className="legend-color center"></div>
          <span>Your Position</span>
        </div>
      </div>
    </div>
  );
};

export default MatrixView;
