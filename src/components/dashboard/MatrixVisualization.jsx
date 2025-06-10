import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

// Demo matrix data fallback
const demoMatrixData = {
  user: 'You',
  children: [
    { user: 'A', children: [ { user: 'C', children: [] }, { user: 'D', children: [] } ] },
    { user: 'B', children: [ { user: 'E', children: [] }, { user: 'F', children: [] } ] }
  ]
};

const renderTree = (node, level = 0) => (
  <div style={{ marginLeft: level * 24 }}>
    <div style={{ fontWeight: node.user === 'You' ? 'bold' : 'normal', color: node.user === 'You' ? '#00D4FF' : '#fff' }}>
      {node.user}
    </div>
    {node.children && node.children.length > 0 && (
      <div style={{ display: 'flex', gap: 16 }}>
        {node.children.map((child, idx) => renderTree(child, level + 1))}
      </div>
    )}
  </div>
);

const MatrixVisualization = ({ wallet, contract }) => {
  const [matrixData, setMatrixData] = useState(demoMatrixData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example: Replace with your contract's real method names
  useEffect(() => {
    const fetchMatrix = async () => {
      if (!wallet?.account || !contract) return;
      setLoading(true);
      setError(null);
      try {
        // Replace with actual contract call
        // const data = await contract.getMatrix(wallet.account);
        // setMatrixData(data);
      } catch (err) {
        setError('Failed to fetch matrix data');
      }
      setLoading(false);
    };
    fetchMatrix();
  }, [wallet?.account, contract]);

  return (
    <div className="matrix-visualization card">
      <h2>Matrix Visualization</h2>
      {loading ? (
        <LoadingSpinner size={32} />
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div style={{ background: '#1a1a2e', padding: 16, borderRadius: 8 }}>
            {renderTree(matrixData)}
          </div>
          <div style={{ marginTop: 12, color: '#aaa', fontSize: 14 }}>
            <b>Legend:</b> <span style={{ color: '#00D4FF' }}>You</span> (your position), others are team members.
          </div>
        </>
      )}
    </div>
  );
};

export default MatrixVisualization;
