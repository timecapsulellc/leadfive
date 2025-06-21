import React, { useState } from 'react';
import TreeExporter from '../utils/TreeExporter';
import './ExportModal.css';

const ExportModal = ({ isOpen, onClose, treeData, elementId = 'genealogy-tree' }) => {
  const [exportType, setExportType] = useState('png');
  const [fileName, setFileName] = useState('genealogy-tree');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [includeData, setIncludeData] = useState(true);
  const [quality, setQuality] = useState('high');

  const exportOptions = {
    png: {
      name: 'PNG Image',
      description: 'High-quality image file',
      icon: '🖼️'
    },
    pdf: {
      name: 'PDF Document',
      description: 'Portable document format',
      icon: '📄'
    },
    json: {
      name: 'JSON Data',
      description: 'Raw tree data structure',
      icon: '📊'
    },
    csv: {
      name: 'CSV Spreadsheet',
      description: 'Tabular data format',
      icon: '📈'
    }
  };

  const qualityOptions = {
    low: { scale: 1, description: 'Faster export, smaller file' },
    medium: { scale: 1.5, description: 'Balanced quality and size' },
    high: { scale: 2, description: 'Best quality, larger file' },
    ultra: { scale: 3, description: 'Ultra HD, very large file' }
  };

  const handleExport = async () => {
    if (!treeData && (exportType === 'json' || exportType === 'csv')) {
      setExportStatus('No data available to export');
      return;
    }

    setIsExporting(true);
    setExportStatus('Preparing export...');

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fullFileName = `${fileName}-${timestamp}`;

      switch (exportType) {
        case 'png':
          setExportStatus('Capturing screenshot...');
          await TreeExporter.exportToPNG(
            elementId,
            `${fullFileName}.png`,
            {
              scale: qualityOptions[quality].scale,
              backgroundColor: '#0F0F23'
            }
          );
          break;

        case 'pdf':
          setExportStatus('Generating PDF...');
          await TreeExporter.exportToPDF(
            elementId,
            `${fullFileName}.pdf`,
            {
              scale: qualityOptions[quality].scale,
              backgroundColor: '#0F0F23'
            }
          );
          break;

        case 'json':
          setExportStatus('Exporting data...');
          TreeExporter.exportDataAsJSON(treeData, `${fullFileName}.json`);
          break;

        case 'csv':
          setExportStatus('Converting to CSV...');
          TreeExporter.exportDataAsCSV(treeData, `${fullFileName}.csv`);
          break;

        default:
          throw new Error('Invalid export type');
      }

      setExportStatus('Export completed successfully!');
      setTimeout(() => {
        onClose();
        setExportStatus('');
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getFileSize = () => {
    if (!treeData) return 'Unknown';
    
    const stats = TreeExporter.getExportStats(treeData);
    if (!stats) return 'Unknown';

    switch (exportType) {
      case 'png':
      case 'pdf':
        const baseSize = stats.totalNodes * 50; // Rough estimate
        const scaledSize = baseSize * qualityOptions[quality].scale;
        return `~${(scaledSize / 1024).toFixed(1)} KB`;
      case 'json':
        return `~${(JSON.stringify(treeData).length / 1024).toFixed(1)} KB`;
      case 'csv':
        return `~${(stats.totalNodes * 200 / 1024).toFixed(1)} KB`;
      default:
        return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-header">
          <h2>Export Genealogy Tree</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>

        <div className="export-content">
          <div className="export-section">
            <h3>Export Format</h3>
            <div className="format-grid">
              {Object.entries(exportOptions).map(([key, option]) => (
                <div
                  key={key}
                  className={`format-card ${exportType === key ? 'selected' : ''}`}
                  onClick={() => setExportType(key)}
                >
                  <div className="format-icon">{option.icon}</div>
                  <div className="format-info">
                    <h4>{option.name}</h4>
                    <p>{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="export-section">
            <h3>File Settings</h3>
            <div className="settings-grid">
              <div className="setting-group">
                <label>File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="genealogy-tree"
                  className="file-input"
                />
              </div>

              {(exportType === 'png' || exportType === 'pdf') && (
                <div className="setting-group">
                  <label>Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="quality-select"
                  >
                    {Object.entries(qualityOptions).map(([key, option]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="export-section">
            <h3>Export Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Format:</span>
                <span className="info-value">{exportOptions[exportType].name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Estimated Size:</span>
                <span className="info-value">{getFileSize()}</span>
              </div>
              {treeData && (
                <>
                  <div className="info-item">
                    <span className="info-label">Total Nodes:</span>
                    <span className="info-value">{TreeExporter.getExportStats(treeData)?.totalNodes || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Max Depth:</span>
                    <span className="info-value">{TreeExporter.getExportStats(treeData)?.maxDepth || 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {exportStatus && (
            <div className={`export-status ${isExporting ? 'loading' : 'success'}`}>
              {isExporting && <div className="status-spinner"></div>}
              <span>{exportStatus}</span>
            </div>
          )}
        </div>

        <div className="export-footer">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button 
            className="export-btn" 
            onClick={handleExport}
            disabled={isExporting || !fileName.trim()}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
