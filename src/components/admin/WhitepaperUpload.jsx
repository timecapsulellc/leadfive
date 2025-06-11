
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const WhitepaperUpload = ({ isAdmin }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Load existing whitepapers from localStorage (in production, this would be from a database)
  useEffect(() => {
    const savedFiles = localStorage.getItem('orphi_whitepapers');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  const saveFilesToStorage = (files) => {
    localStorage.setItem('orphi_whitepapers', JSON.stringify(files));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setUploading(true);
    try {
      // In production, this would upload to IPFS, AWS S3, or similar
      // For demo purposes, we'll simulate the upload and store metadata
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileData = {
        id: Date.now().toString(),
        name: selectedFile.name,
        size: selectedFile.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(selectedFile), // In production, this would be the actual file URL
        hash: `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`, // Mock IPFS hash
        uploader: 'Admin'
      };
      
      const updatedFiles = [...uploadedFiles, fileData];
      setUploadedFiles(updatedFiles);
      saveFilesToStorage(updatedFiles);
      
      toast.success(`Whitepaper "${selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('whitepaper-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = (fileId) => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this whitepaper?')) {
      return;
    }

    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
    toast.success('Whitepaper deleted successfully');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isAdmin) {
    return (
      <div className="whitepaper-section">
        <h3>📄 Whitepapers</h3>
        <div className="whitepaper-list">
          {uploadedFiles.length > 0 ? (
            uploadedFiles.map((file) => (
              <div key={file.id} className="whitepaper-item">
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  onClick={() => window.open(file.url, '_blank')}
                  className="btn-secondary"
                >
                  📖 View
                </Button>
              </div>
            ))
          ) : (
            <p>No whitepapers available yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h3>📄 Whitepaper Management</h3>
      
      <div className="upload-section">
        <div className="file-input-container">
          <input
            id="whitepaper-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
          />
          <label htmlFor="whitepaper-upload" className="file-input-label">
            {selectedFile ? selectedFile.name : 'Choose PDF file...'}
          </label>
        </div>
        
        <Button
          onClick={handleFileUpload}
          disabled={uploading || !selectedFile}
          className="btn-primary"
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload Whitepaper'}
        </Button>
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Uploading to IPFS...</p>
        </div>
      )}
      
      <div className="uploaded-files">
        <h4>📚 Uploaded Whitepapers</h4>
        {uploadedFiles.length > 0 ? (
          uploadedFiles.map((file) => (
            <div key={file.id} className="file-item admin-file-item">
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                  {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                </div>
                <div className="file-hash">IPFS: {file.hash}</div>
              </div>
              <div className="file-actions">
                <Button
                  onClick={() => window.open(file.url, '_blank')}
                  className="btn-secondary"
                >
                  📖 View
                </Button>
                <Button
                  onClick={() => handleFileDelete(file.id)}
                  className="btn-danger"
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p>No whitepapers uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default WhitepaperUpload;
