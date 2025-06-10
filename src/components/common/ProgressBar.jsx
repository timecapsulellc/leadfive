import React from 'react';

const ProgressBar = ({ value, max = 100, color = '#00D4FF' }) => (
  <div className="progress-bar-bg" style={{ background: '#eee', borderRadius: 8, height: 8 }}>
    <div
      className="progress-bar-fill"
      style={{ width: `${(value / max) * 100}%`, background: color, height: 8, borderRadius: 8 }}
    />
  </div>
);

export default ProgressBar;
