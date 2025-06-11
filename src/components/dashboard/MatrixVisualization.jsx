import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const MatrixVisualization = ({ wallet, contract }) => {
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Demo matrix positions for visualization
  const demoMatrix = {
    'You': 'center',
    'A': 'top-left',
    'B': 'top-right', 
    'C': 'bottom-left-1',
    'D': 'bottom-center-1',
    'E': 'bottom-right-1',
    'F': 'bottom-right-2'
  };

  useEffect(() => {
    const fetchMatrix = async () => {
      if (!wallet?.account || !contract) {
        // Set demo data when wallet is not connected
        setMatrixData(demoMatrix);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // Replace with actual contract call when available
        // const data = await contract.getMatrixData(wallet.account);
        // setMatrixData(data);
        setMatrixData(demoMatrix); // Fallback to demo
      } catch (err) {
        console.error('Error fetching matrix:', err);
        setError('Failed to fetch matrix data');
        setMatrixData(demoMatrix); // Fallback to demo on error
      }
      setLoading(false);
    };
    fetchMatrix();
  }, [wallet?.account, contract]);

  return (
    <div className="matrix-visualization card">
      <h2>🔄 Matrix Visualization</h2>
      {loading ? (
        <LoadingSpinner size={32} />
      ) : error ? (
        <div className="error-message" style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--accent-bg)', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      ) : null}
      
      <div className="matrix-container">
        <div className="matrix-grid">
          <div className="matrix-node empty">A</div>
          <div className="matrix-node you">You</div>
          <div className="matrix-node empty">B</div>
          <div className="matrix-node filled">C</div>
          <div className="matrix-node filled">D</div>
          <div className="matrix-node filled">E</div>
          <div className="matrix-node empty">F</div>
        </div>
        
        <div className="matrix-legend">
          <p><strong>Legend:</strong> <span style={{ color: 'var(--accent-color)' }}>You</span> (your position), others are team members.</p>
          <div className="matrix-stats">
            <div className="stat-row">
              <span className="stat-label">Direct Referrals:</span>
              <span className="stat-value">2</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Team Members:</span>
              <span className="stat-value">6</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Matrix Level:</span>
              <span className="stat-value">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixVisualization;
