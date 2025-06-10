import React from 'react';

/**
 * ExportControls - Provides export buttons for analytics and team data
 * Props: onExport, analyticsData, deviceInfo
 */
function ExportControls({ onExport, analyticsData, deviceInfo }) {
  return (
    <div className="export-controls">
      <h3>Export Data</h3>
      <button onClick={() => onExport('json')}>Export JSON</button>
      <button onClick={() => onExport('csv')}>Export CSV</button>
      <div className="export-info">
        <span>Exported: {analyticsData.exportData ? analyticsData.exportData.timestamp : 'Never'}</span>
      </div>
    </div>
  );
}

export default ExportControls;
