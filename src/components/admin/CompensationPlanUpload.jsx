import React, { useState, useRef } from 'react';
import OpenAIService from '../../services/OpenAIService';

const CompensationPlanUpload = ({ onAnalysisComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setUploadedFile(file);
    processFile(file);
  };

  // Process the uploaded PDF
  const processFile = async (file) => {
    setUploading(true);
    setAnalyzing(false);

    try {
      // Read file as text (simplified - in production, use proper PDF parsing)
      const text = await extractTextFromPDF(file);
      
      setUploading(false);
      setAnalyzing(true);

      // Analyze with OpenAI
      const analysisResult = await OpenAIService.analyzeCompensationPlan(text);
      
      setAnalysis(analysisResult);
      setAnalyzing(false);

      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete({
          file: file,
          analysis: analysisResult,
          extractedText: text
        });
      }

    } catch (error) {
      console.error('File processing error:', error);
      setError('Failed to process PDF. Please try again.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  // Extract text from PDF (simplified version)
  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // In a real implementation, you'd use pdf-parse or similar
          // For now, we'll simulate text extraction
          const arrayBuffer = e.target.result;
          
          // Simulate PDF text extraction
          const simulatedText = `
            LEADFIVE COMPENSATION PLAN DOCUMENT
            
            Commission Structure:
            - Direct Referral Bonus: 10%
            - Level 1 Team Bonus: 5%
            - Level 2 Team Bonus: 3%
            - Level 3 Team Bonus: 2%
            
            Leadership Bonuses:
            - Team Leader: $500/month
            - Regional Leader: $1,500/month
            - Global Leader: $5,000/month
            
            Requirements:
            - Minimum 3 direct referrals
            - Monthly volume requirements
            - Compliance with platform terms
            
            Special Pools:
            - Global Help Pool: 30% distribution
            - Leadership Pool: 10% distribution
            - Innovation Fund: 5% allocation
            
            Payment Terms:
            - Weekly distributions
            - Blockchain transparency
            - Smart contract automation
          `;
          
          resolve(simulatedText);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Reset upload
  const resetUpload = () => {
    setUploadedFile(null);
    setAnalysis(null);
    setError(null);
    setUploading(false);
    setAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="compensation-plan-upload">
      {/* Upload Area */}
      {!uploadedFile && (
        <div
          className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-content">
            <div className="upload-icon">
              <i className="fas fa-file-pdf text-6xl text-royal-purple mb-4"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Upload Compensation Plan
            </h3>
            <p className="text-silver-mist mb-4">
              Drag & drop your PDF file here, or click to browse
            </p>
            <div className="upload-specs text-sm text-silver-mist/70">
              <p>• PDF files only</p>
              <p>• Maximum 10MB</p>
              <p>• AI analysis included</p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message bg-alert-red/20 border border-alert-red/50 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-alert-red mr-3"></i>
            <span className="text-alert-red">{error}</span>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress glass-morphism rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue"></div>
          </div>
          <h3 className="text-lg font-semibold text-white text-center mb-2">
            Processing PDF...
          </h3>
          <p className="text-silver-mist text-center">
            Extracting text and preparing for AI analysis
          </p>
        </div>
      )}

      {/* Analysis Progress */}
      {analyzing && (
        <div className="analysis-progress glass-morphism rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-pulse">
              <i className="fas fa-brain text-4xl text-premium-gold"></i>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white text-center mb-2">
            AI Analysis in Progress...
          </h3>
          <p className="text-silver-mist text-center">
            ChatGPT is analyzing your compensation plan for insights and compliance
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && uploadedFile && (
        <div className="analysis-results space-y-6">
          {/* File Info */}
          <div className="file-info glass-morphism rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-file-pdf text-royal-purple text-2xl mr-3"></i>
                <div>
                  <h4 className="text-white font-semibold">{uploadedFile.name}</h4>
                  <p className="text-silver-mist text-sm">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="text-silver-mist hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* AI Analysis Summary */}
          <div className="analysis-summary glass-morphism rounded-lg p-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-brain text-premium-gold text-2xl mr-3"></i>
              <h3 className="text-xl font-bold text-white">AI Analysis Summary</h3>
            </div>
            
            <div className="bg-gradient-to-r from-royal-purple/20 to-cyber-blue/20 rounded-lg p-4 mb-4">
              <p className="text-white leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Key Points */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <i className="fas fa-key text-success-green mr-2"></i>
                Key Features
              </h4>
              <ul className="space-y-2">
                {analysis.keyPoints?.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check-circle text-success-green mt-1 mr-3"></i>
                    <span className="text-silver-mist">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <i className="fas fa-lightbulb text-premium-gold mr-2"></i>
                AI Recommendations
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-arrow-right text-cyber-blue mt-1 mr-3"></i>
                    <span className="text-silver-mist">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compliance Notes */}
            {analysis.complianceNotes && (
              <div className="compliance-notes bg-energy-orange/20 border border-energy-orange/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-shield-alt text-energy-orange mr-2"></i>
                  Compliance Considerations
                </h4>
                <ul className="space-y-2">
                  {analysis.complianceNotes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <i className="fas fa-exclamation-circle text-energy-orange mt-1 mr-3"></i>
                      <span className="text-white">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons flex gap-4">
            <button
              onClick={() => window.print()}
              className="btn-gradient-secondary flex-1 py-3 rounded-lg font-semibold hover:scale-105 transition-all"
            >
              <i className="fas fa-print mr-2"></i>
              Print Analysis
            </button>
            <button
              onClick={resetUpload}
              className="glass-morphism flex-1 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
            >
              <i className="fas fa-upload mr-2"></i>
              Upload New Plan
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .upload-dropzone {
          border: 2px dashed #7B2CBF;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(123, 44, 191, 0.05);
        }

        .upload-dropzone:hover,
        .upload-dropzone.drag-active {
          border-color: #00D4FF;
          background: rgba(0, 212, 255, 0.1);
          transform: scale(1.02);
        }

        .upload-content {
          pointer-events: none;
        }

        .analysis-results {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-gradient-secondary {
          background: linear-gradient(135deg, #7B2CBF, #FF6B35);
          color: white;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default CompensationPlanUpload; 