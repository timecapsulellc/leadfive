/**
 * ORPHI CrowdFund File Upload Service
 * Enhanced file upload with security, validation, and AI integration
 * Developed by LEAD 5 - Young Blockchain Engineers
 */

class FileUploadService {
  constructor() {
    this.uploadPath = '/uploads/';
    this.maxFileSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
    this.allowedTypes = (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/*,application/pdf,.doc,.docx').split(',');
    this.rateLimitRequests = parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS) || 100;
    this.rateLimitWindow = parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW) || 900000; // 15 minutes
    
    // Rate limiting storage
    this.uploadHistory = new Map();
    
    // Supported file types with their MIME types
    this.supportedTypes = {
      'image/jpeg': { ext: '.jpg', category: 'image' },
      'image/png': { ext: '.png', category: 'image' },
      'image/gif': { ext: '.gif', category: 'image' },
      'image/webp': { ext: '.webp', category: 'image' },
      'application/pdf': { ext: '.pdf', category: 'document' },
      'application/msword': { ext: '.doc', category: 'document' },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', category: 'document' },
      'text/plain': { ext: '.txt', category: 'text' },
      'application/json': { ext: '.json', category: 'data' }
    };
  }

  /**
   * Validate file before upload
   */
  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds limit of ${(this.maxFileSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // Check file type
    if (!this.supportedTypes[file.type]) {
      errors.push(`File type ${file.type} is not supported`);
    }

    // Check for malicious file names
    if (this.containsMaliciousPatterns(file.name)) {
      errors.push('File name contains potentially dangerous characters');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Check for malicious patterns in file names
   */
  containsMaliciousPatterns(filename) {
    const maliciousPatterns = [
      /\.\./,           // Directory traversal
      /[<>:"|?*]/,      // Invalid filename characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
      /\.exe$|\.bat$|\.cmd$|\.scr$/i // Executable files
    ];

    return maliciousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(userId) {
    const now = Date.now();
    const userHistory = this.uploadHistory.get(userId) || [];
    
    // Clean old entries
    const recentUploads = userHistory.filter(timestamp => now - timestamp < this.rateLimitWindow);
    
    if (recentUploads.length >= this.rateLimitRequests) {
      return {
        allowed: false,
        resetTime: recentUploads[0] + this.rateLimitWindow
      };
    }

    // Update history
    recentUploads.push(now);
    this.uploadHistory.set(userId, recentUploads);

    return { allowed: true };
  }

  /**
   * Generate secure filename
   */
  generateSecureFilename(originalName, userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
    
    return `${timestamp}_${userId}_${random}_${safeName}${extension}`;
  }

  /**
   * Upload file with security checks
   */
  async uploadFile(file, userId, projectId = null, metadata = {}) {
    try {
      // Rate limiting check
      const rateLimitCheck = this.checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Rate limit exceeded. Try again after ${new Date(rateLimitCheck.resetTime).toLocaleTimeString()}`);
      }

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate secure filename
      const secureFilename = this.generateSecureFilename(file.name, userId);
      
      // Create file metadata
      const fileMetadata = {
        originalName: file.name,
        secureFilename: secureFilename,
        size: file.size,
        type: file.type,
        category: this.supportedTypes[file.type]?.category || 'unknown',
        uploadedBy: userId,
        projectId: projectId,
        uploadedAt: new Date().toISOString(),
        ...metadata
      };

      // In a real implementation, you would upload to your server
      // For now, we'll simulate the upload and store metadata locally
      const uploadResult = await this.simulateUpload(file, secureFilename, fileMetadata);

      return {
        success: true,
        fileUrl: `${this.uploadPath}${secureFilename}`,
        fileName: secureFilename,
        originalName: file.name,
        metadata: fileMetadata,
        uploadId: uploadResult.uploadId
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Simulate file upload (replace with actual server upload)
   */
  async simulateUpload(file, filename, metadata) {
    return new Promise((resolve) => {
      // Simulate upload delay
      setTimeout(() => {
        // Store metadata in localStorage for demo purposes
        const uploads = JSON.parse(localStorage.getItem('orphi_uploads') || '[]');
        const uploadId = Date.now().toString();
        
        uploads.push({
          uploadId,
          filename,
          metadata,
          uploadedAt: new Date().toISOString()
        });
        
        localStorage.setItem('orphi_uploads', JSON.stringify(uploads));
        
        resolve({ uploadId });
      }, 1000 + Math.random() * 2000); // 1-3 second delay
    });
  }

  /**
   * Get upload history for a user
   */
  getUserUploads(userId) {
    const uploads = JSON.parse(localStorage.getItem('orphi_uploads') || '[]');
    return uploads.filter(upload => upload.metadata.uploadedBy === userId);
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(uploadId, userId) {
    try {
      const uploads = JSON.parse(localStorage.getItem('orphi_uploads') || '[]');
      const fileIndex = uploads.findIndex(upload => 
        upload.uploadId === uploadId && upload.metadata.uploadedBy === userId
      );

      if (fileIndex === -1) {
        throw new Error('File not found or access denied');
      }

      uploads.splice(fileIndex, 1);
      localStorage.setItem('orphi_uploads', JSON.stringify(uploads));

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('File deletion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process uploaded file with AI
   */
  async processWithAI(uploadId, processingType = 'analyze') {
    try {
      const uploads = JSON.parse(localStorage.getItem('orphi_uploads') || '[]');
      const upload = uploads.find(u => u.uploadId === uploadId);

      if (!upload) {
        throw new Error('Upload not found');
      }

      // Import AI services dynamically to avoid circular dependencies
      const { default: OpenAIService } = await import('./OpenAIService.js');

      let result;
      switch (processingType) {
        case 'analyze':
          result = await this.analyzeDocument(upload, OpenAIService);
          break;
        case 'summarize':
          result = await this.summarizeContent(upload, OpenAIService);
          break;
        case 'extract':
          result = await this.extractData(upload, OpenAIService);
          break;
        default:
          throw new Error('Unknown processing type');
      }

      return {
        success: true,
        result: result,
        processedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('AI processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze document content
   */
  async analyzeDocument(upload, openAIService) {
    const prompt = `Analyze this ${upload.metadata.category} file named "${upload.metadata.originalName}". 
    Provide insights about its content, structure, and potential use in a Web3 crowdfunding context.
    File type: ${upload.metadata.type}, Size: ${(upload.metadata.size / 1024).toFixed(1)}KB`;

    return await openAIService.generateResponse(prompt, {
      fileType: upload.metadata.type,
      category: upload.metadata.category,
      context: 'file_analysis'
    });
  }

  /**
   * Summarize content
   */
  async summarizeContent(upload, openAIService) {
    const prompt = `Create a concise summary of the file "${upload.metadata.originalName}". 
    Focus on key points relevant to Web3 crowdfunding and investment decisions.`;

    return await openAIService.generateResponse(prompt, {
      fileType: upload.metadata.type,
      context: 'content_summary'
    });
  }

  /**
   * Extract structured data
   */
  async extractData(upload, openAIService) {
    const prompt = `Extract structured data from "${upload.metadata.originalName}". 
    Identify key metrics, dates, amounts, and other relevant information for crowdfunding analysis.
    Return in JSON format if possible.`;

    return await openAIService.generateResponse(prompt, {
      fileType: upload.metadata.type,
      context: 'data_extraction',
      responseFormat: 'json'
    });
  }

  /**
   * Get file statistics
   */
  getUploadStats(userId = null) {
    const uploads = JSON.parse(localStorage.getItem('orphi_uploads') || '[]');
    const userUploads = userId ? uploads.filter(u => u.metadata.uploadedBy === userId) : uploads;

    const stats = {
      totalFiles: userUploads.length,
      totalSize: userUploads.reduce((sum, u) => sum + u.metadata.size, 0),
      byCategory: {},
      byType: {},
      recentUploads: userUploads.slice(-5).reverse()
    };

    userUploads.forEach(upload => {
      const category = upload.metadata.category;
      const type = upload.metadata.type;

      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clean up old uploads (maintenance function)
   */
  cleanupOldUploads(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
    const uploads = JSON.parse(localStorage.getItem('orphi_uploads') || '[]');
    const cutoffDate = Date.now() - maxAge;

    const activeUploads = uploads.filter(upload => {
      const uploadDate = new Date(upload.uploadedAt).getTime();
      return uploadDate > cutoffDate;
    });

    localStorage.setItem('orphi_uploads', JSON.stringify(activeUploads));
    
    return {
      cleaned: uploads.length - activeUploads.length,
      remaining: activeUploads.length
    };
  }
}

export default new FileUploadService(); 