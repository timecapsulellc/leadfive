import React, { useState, useEffect } from 'react';
import './MatrixVisualization.css';

const MatrixVisualization = ({ wallet, contract }) => {
  const [matrixData, setMatrixData] = useState({
    currentLevel: 4,
    positions: [],
    recyclingProgress: 0,
    totalEarnings: 1350.75,
    nextRecycling: 2
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet?.account && contract) {
      fetchMatrixData();
    }
  }, [wallet?.account, contract]);

  const fetchMatrixData = async () => {
    setLoading(true);
    try {
      // Simulate matrix data fetching
      const mockData = {
        currentLevel: 4,
        positions: [
          { level: 1, filled: true, earnings: 100, recycled: true },
          { level: 2, filled: true, earnings: 200, recycled: true },
          { level: 3, filled: true, earnings: 400, recycled: false },
          { level: 4, filled: true, earnings: 650.75, recycled: false },
          { level: 5, filled: false, earnings: 0, recycled: false },
          { level: 6, filled: false, earnings: 0, recycled: false }
        ],
        recyclingProgress: 75,
        totalEarnings: 1350.75,
        nextRecycling: 2
      };
      
      setMatrixData(mockData);
    } catch (error) {
      console.error('Error fetching matrix data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="matrix-visualization card">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading matrix visualization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matrix-visualization card">
      <div className="matrix-header">
        <h2>🌳 Matrix Structure</h2>
        <div className="matrix-stats">
          <div className="stat">
            <span>Current Level</span>
            <span className="level-badge">Level {matrixData.currentLevel}</span>
          </div>
          <div className="stat">
            <span>Total Earnings</span>
            <span className="earnings">${matrixData.totalEarnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="matrix-tree">
        {matrixData.positions.map((position, index) => (
          <div 
            key={position.level} 
            className={`matrix-level ${position.filled ? 'filled' : 'empty'} ${position.recycled ? 'recycled' : ''}`}
          >
            <div className="level-info">
              <span className="level-number">Level {position.level}</span>
              <span className="level-status">
                {position.filled ? (position.recycled ? '♻️ Recycled' : '✅ Active') : '🔒 Locked'}
              </span>
            </div>
            <div className="level-tree">
              <div className="positions-grid">
                {Array.from({ length: Math.pow(2, position.level) }, (_, i) => (
                  <div 
                    key={i} 
                    className={`position ${i < (position.filled ? Math.pow(2, position.level) : 0) ? 'filled' : 'empty'}`}
                  >
                    {i < (position.filled ? Math.pow(2, position.level) : 0) ? '👤' : '⭕'}
                  </div>
                ))}
              </div>
            </div>
            <div className="level-earnings">
              ${position.earnings.toFixed(2)} USDT
            </div>
          </div>
        ))}
      </div>

      <div className="recycling-status">
        <h3>♻️ Recycling Progress</h3>
        <div className="recycling-bar">
          <div 
            className="recycling-fill" 
            style={{ width: `${matrixData.recyclingProgress}%` }}
          ></div>
        </div>
        <p>
          {matrixData.nextRecycling} more positions needed for next recycling cycle
        </p>
      </div>
    </div>
  );
};

export default MatrixVisualization;
