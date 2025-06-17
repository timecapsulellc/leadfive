/**
 * ORPHI CrowdFund AI Management Panel
 * Complete AI services management for administrators
 * Developed by LEAD 5 - Young Blockchain Engineers
 */

import React, { useState, useEffect } from 'react';
import OpenAIService from '../../services/OpenAIService.js';
import ElevenLabsService from '../../services/ElevenLabsService.js';
import FileUploadService from '../../services/FileUploadService.js';
import FileUploader from '../common/FileUploader.jsx';

const AIManagementPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState({
    openai: { status: 'disconnected', apiKey: '', model: 'gpt-4-turbo-preview' },
    elevenlabs: { status: 'disconnected', apiKey: '', voiceId: 'Bella' }
  });
  const [uploadStats, setUploadStats] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Brand colors
  const colors = {
    primary: '#00D4FF',
    secondary: '#7B2CBF',
    accent: '#FF6B35',
    success: '#00FF88',
    error: '#FF4757',
    warning: '#FFD700',
    background: '#1A1A2E',
    surface: '#16213E'
  };

  useEffect(() => {
    if (isOpen) {
      loadServiceStatus();
      loadUploadStats();
    }
  }, [isOpen]);

  /**
   * Load service status
   */
  const loadServiceStatus = () => {
    const openaiStatus = OpenAIService.getStatus();
    const elevenlabsStatus = ElevenLabsService.getStatus();

    setServices({
      openai: {
        status: openaiStatus.initialized ? 'connected' : 'disconnected',
        apiKey: openaiStatus.hasApiKey ? '••••••••••••••••' : '',
        model: openaiStatus.model || 'gpt-4-turbo-preview'
      },
      elevenlabs: {
        status: elevenlabsStatus.initialized ? 'connected' : 'fallback',
        apiKey: elevenlabsStatus.hasApiKey ? '••••••••••••••••' : '',
        voiceId: elevenlabsStatus.service || 'Browser Speech'
      }
    });
  };

  /**
   * Load upload statistics
   */
  const loadUploadStats = () => {
    const stats = FileUploadService.getUploadStats();
    setUploadStats(stats);
  };

  /**
   * Test AI service connection
   */
  const testService = async (serviceName) => {
    setIsLoading(true);
    setTestResults(prev => ({ ...prev, [serviceName]: { status: 'testing', message: 'Testing connection...' } }));

    try {
      let result;
      
      if (serviceName === 'openai') {
        result = await OpenAIService.generateResponse('Test connection', { context: 'connection_test' });
        setTestResults(prev => ({
          ...prev,
          openai: {
            status: 'success',
            message: 'OpenAI connection successful!',
            response: result.substring(0, 100) + '...'
          }
        }));
      } else if (serviceName === 'elevenlabs') {
        result = await ElevenLabsService.generateSpeech('Testing ElevenLabs connection');
        setTestResults(prev => ({
          ...prev,
          elevenlabs: {
            status: result.success ? 'success' : 'error',
            message: result.success ? 'ElevenLabs connection successful!' : 'Connection failed',
            service: ElevenLabsService.getStatus().service
          }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [serviceName]: {
          status: 'error',
          message: `Connection failed: ${error.message}`
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update API key
   */
  const updateApiKey = async (serviceName, apiKey) => {
    if (serviceName === 'openai') {
      const success = OpenAIService.initialize(apiKey);
      if (success) {
        setServices(prev => ({
          ...prev,
          openai: { ...prev.openai, status: 'connected', apiKey: '••••••••••••••••' }
        }));
      }
    } else if (serviceName === 'elevenlabs') {
      const success = ElevenLabsService.initialize(apiKey);
      if (success) {
        setServices(prev => ({
          ...prev,
          elevenlabs: { ...prev.elevenlabs, status: 'connected', apiKey: '••••••••••••••••' }
        }));
      }
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
   * Get status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return colors.success;
      case 'disconnected': return colors.error;
      case 'fallback': return colors.warning;
      case 'testing': return colors.primary;
      default: return '#666';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      case 'fallback': return '⚠️';
      case 'testing': return '🔄';
      default: return '❓';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: colors.background,
        borderRadius: '16px',
        width: '90vw',
        maxWidth: '800px',
        height: '80vh',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ color: '#fff', margin: 0 }}>🤖 AI Services Management</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{ padding: '2rem', flex: 1, overflow: 'auto' }}>
          <div style={{ color: '#fff', textAlign: 'center' }}>
            <h3>AI Management Panel</h3>
            <p style={{ color: '#ccc' }}>Configure and monitor your AI services</p>
            
            <FileUploader
              userId="admin"
              allowMultiple={true}
              showAIProcessing={true}
              style={{ marginTop: '2rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIManagementPanel; 