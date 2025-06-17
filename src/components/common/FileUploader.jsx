/**
 * ORPHI CrowdFund File Uploader Component
 * Advanced file upload with AI processing capabilities
 * Developed by LEAD 5 - Young Blockchain Engineers
 */

import React, { useState, useRef, useCallback } from 'react';
import FileUploadService from '../../services/FileUploadService.js';
import OpenAIService from '../../services/OpenAIService.js';
import ElevenLabsService from '../../services/ElevenLabsService.js';

const FileUploader = ({ 
  userId, 
  projectId = null, 
  onUploadComplete = () => {}, 
  onError = () => {},
  allowMultiple = false,
  showAIProcessing = true,
  className = ""
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Brand colors for ORPHI
  const colors = {
    primary: '#00D4FF',
    secondary: '#7B2CBF',
    accent: '#FF6B35',
    success: '#00FF88',
    error: '#FF4757',
    background: '#1A1A2E'
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (files) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const uploadId = Date.now() + Math.random().toString(36).substring(2);
      
      // Add file to upload queue
      const newUpload = {
        id: uploadId,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        error: null,
        aiResult: null
      };

      setUploads(prev => [...prev, newUpload]);

      try {
        // Upload file
        const result = await FileUploadService.uploadFile(file, userId, projectId);
        
        if (result.success) {
          // Update upload status
          setUploads(prev => prev.map(upload => 
            upload.id === uploadId 
              ? { ...upload, status: 'completed', progress: 100, uploadResult: result }
              : upload
          ));

          // Process with AI if enabled
          if (showAIProcessing && result.uploadId) {
            await processWithAI(uploadId, result.uploadId);
          }

          onUploadComplete(result);
        } else {
          throw new Error(result.error);
        }

      } catch (error) {
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, status: 'error', error: error.message }
            : upload
        ));
        onError(error);
      }
    }
  }, [userId, projectId, showAIProcessing, onUploadComplete, onError]);

  /**
   * Process file with AI
   */
  const processWithAI = async (uploadId, fileUploadId) => {
    try {
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'processing', aiProcessing: true }
          : upload
      ));

      // Analyze with AI
      const aiResult = await FileUploadService.processWithAI(fileUploadId, 'analyze');
      
      if (aiResult.success) {
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { 
                ...upload, 
                status: 'ai_completed', 
                aiProcessing: false,
                aiResult: aiResult.result 
              }
            : upload
        ));

        // Announce AI completion with voice
        if (import.meta.env.VITE_ENABLE_VOICE_SYNTHESIS === 'true') {
          ElevenLabsService.respondToChat("File analysis complete! I've extracted valuable insights from your document.");
        }
      }

    } catch (error) {
      console.error('AI processing error:', error);
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, aiProcessing: false, aiError: error.message }
          : upload
      ));
    }
  };

  /**
   * Handle drag events
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  /**
   * Open file dialog
   */
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  /**
   * Remove upload from list
   */
  const removeUpload = (uploadId) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  };

  /**
   * Retry failed upload
   */
  const retryUpload = async (uploadId) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (upload && upload.file) {
      // Reset status and retry
      setUploads(prev => prev.map(u => 
        u.id === uploadId 
          ? { ...u, status: 'uploading', progress: 0, error: null }
          : u
      ));
      
      await handleFileSelect([upload.file]);
    }
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return '⏳';
      case 'completed':
        return '✅';
      case 'processing':
        return '🤖';
      case 'ai_completed':
        return '🎯';
      case 'error':
        return '❌';
      default:
        return '📁';
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'uploading':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'processing':
        return colors.secondary;
      case 'ai_completed':
        return colors.accent;
      case 'error':
        return colors.error;
      default:
        return '#666';
    }
  };

  return (
    <div className={`orphi-file-uploader ${className}`}>
      <style jsx>{`
        .orphi-file-uploader {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .upload-zone {
          border: 2px dashed ${isDragOver ? colors.primary : '#444'};
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          background: ${isDragOver ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
          transition: all 0.3s ease;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }
        
        .upload-zone:hover {
          border-color: ${colors.primary};
          background: rgba(0, 212, 255, 0.05);
        }
        
        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: ${colors.primary};
        }
        
        .upload-text {
          color: #fff;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .upload-hint {
          color: #888;
          font-size: 0.9rem;
        }
        
        .upload-list {
          margin-top: 1.5rem;
          space-y: 0.75rem;
        }
        
        .upload-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          margin-bottom: 0.75rem;
        }
        
        .upload-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .upload-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .upload-name {
          color: #fff;
          font-weight: 500;
          font-size: 0.9rem;
        }
        
        .upload-size {
          color: #888;
          font-size: 0.8rem;
        }
        
        .upload-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary});
          transition: width 0.3s ease;
        }
        
        .upload-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .action-btn {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .retry-btn {
          background: ${colors.accent};
          color: white;
        }
        
        .retry-btn:hover {
          background: ${colors.accent}dd;
        }
        
        .remove-btn {
          background: ${colors.error};
          color: white;
        }
        
        .remove-btn:hover {
          background: ${colors.error}dd;
        }
        
        .ai-result {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(123, 44, 191, 0.1);
          border-radius: 6px;
          border-left: 3px solid ${colors.secondary};
        }
        
        .ai-result-title {
          color: ${colors.secondary};
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .ai-result-content {
          color: #ccc;
          font-size: 0.85rem;
          line-height: 1.4;
        }
        
        .hidden {
          display: none;
        }
      `}</style>

      {/* Upload Zone */}
      <div
        className="upload-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="upload-icon">📁</div>
        <div className="upload-text">
          Drag & drop files here, or click to browse
        </div>
        <div className="upload-hint">
          Supports images, PDFs, and documents • Max {(FileUploadService.maxFileSize / 1024 / 1024).toFixed(0)}MB
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={allowMultiple}
        onChange={handleInputChange}
        className="hidden"
        accept={FileUploadService.allowedTypes.join(',')}
      />

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="upload-list">
          {uploads.map((upload) => (
            <div key={upload.id} className="upload-item">
              <div className="upload-header">
                <div className="upload-info">
                  <span style={{ fontSize: '1.2rem' }}>{getStatusIcon(upload.status)}</span>
                  <div>
                    <div className="upload-name">{upload.name}</div>
                    <div className="upload-size">{formatFileSize(upload.size)}</div>
                  </div>
                </div>
                <div 
                  className="upload-status"
                  style={{ color: getStatusColor(upload.status) }}
                >
                  {upload.status === 'uploading' && 'Uploading...'}
                  {upload.status === 'completed' && 'Uploaded'}
                  {upload.status === 'processing' && 'AI Processing...'}
                  {upload.status === 'ai_completed' && 'Analysis Complete'}
                  {upload.status === 'error' && 'Failed'}
                </div>
              </div>

              {/* Progress Bar */}
              {(upload.status === 'uploading' || upload.status === 'processing') && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: upload.status === 'uploading' ? `${upload.progress}%` : '100%',
                      animation: upload.status === 'processing' ? 'pulse 2s infinite' : 'none'
                    }}
                  />
                </div>
              )}

              {/* Error Message */}
              {upload.error && (
                <div style={{ color: colors.error, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {upload.error}
                </div>
              )}

              {/* AI Result */}
              {upload.aiResult && (
                <div className="ai-result">
                  <div className="ai-result-title">
                    🤖 AI Analysis
                  </div>
                  <div className="ai-result-content">
                    {upload.aiResult}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="upload-actions">
                {upload.status === 'error' && (
                  <button 
                    className="action-btn retry-btn"
                    onClick={() => retryUpload(upload.id)}
                  >
                    Retry
                  </button>
                )}
                <button 
                  className="action-btn remove-btn"
                  onClick={() => removeUpload(upload.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader; 