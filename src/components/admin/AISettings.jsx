import React, { useState, useEffect } from 'react';
import OpenAIService from '../../services/OpenAIService';
import ElevenLabsService from '../../services/ElevenLabsService';

const AISettings = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [testing, setTesting] = useState({ openai: false, elevenlabs: false });
  const [status, setStatus] = useState({
    openai: { connected: false, message: '' },
    elevenlabs: { connected: false, message: '' }
  });
  const [testResults, setTestResults] = useState(null);

  // Load saved keys on component mount
  useEffect(() => {
    const savedOpenaiKey = localStorage.getItem('orphi_openai_key');
    const savedElevenLabsKey = localStorage.getItem('orphi_elevenlabs_key');
    
    if (savedOpenaiKey) {
      setOpenaiKey(savedOpenaiKey);
      OpenAIService.initialize(savedOpenaiKey);
    }
    
    if (savedElevenLabsKey) {
      setElevenLabsKey(savedElevenLabsKey);
      ElevenLabsService.initialize(savedElevenLabsKey);
    }
    
    updateStatus();
  }, []);

  // Update service status
  const updateStatus = () => {
    setStatus({
      openai: {
        connected: OpenAIService.isReady(),
        message: OpenAIService.isReady() ? 'Connected and ready' : 'Not configured'
      },
      elevenlabs: {
        connected: ElevenLabsService.isReady(),
        message: ElevenLabsService.isReady() ? 'Connected and ready' : 'Browser fallback active'
      }
    });
  };

  // Save OpenAI key
  const saveOpenaiKey = () => {
    if (!openaiKey.trim()) {
      alert('Please enter a valid OpenAI API key');
      return;
    }

    const success = OpenAIService.initialize(openaiKey);
    if (success) {
      localStorage.setItem('orphi_openai_key', openaiKey);
      updateStatus();
      alert('✅ OpenAI API key saved successfully!');
    } else {
      alert('❌ Failed to initialize OpenAI service');
    }
  };

  // Save ElevenLabs key
  const saveElevenLabsKey = () => {
    if (!elevenLabsKey.trim()) {
      alert('Please enter a valid ElevenLabs API key');
      return;
    }

    const success = ElevenLabsService.initialize(elevenLabsKey);
    if (success) {
      localStorage.setItem('orphi_elevenlabs_key', elevenLabsKey);
      updateStatus();
      alert('✅ ElevenLabs API key saved successfully!');
    } else {
      alert('❌ Failed to initialize ElevenLabs service');
    }
  };

  // Test OpenAI connection
  const testOpenAI = async () => {
    if (!OpenAIService.isReady()) {
      alert('Please configure OpenAI API key first');
      return;
    }

    setTesting(prev => ({ ...prev, openai: true }));
    
    try {
      const response = await OpenAIService.getChatResponse(
        "Test message: Say hello and confirm you're working for ORPHI!",
        { account: 'test-user', isRegistered: true }
      );
      
      setTestResults(prev => ({
        ...prev,
        openai: {
          success: true,
          response: response,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        openai: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setTesting(prev => ({ ...prev, openai: false }));
    }
  };

  // Test ElevenLabs connection
  const testElevenLabs = async () => {
    setTesting(prev => ({ ...prev, elevenlabs: true }));
    
    try {
      const audio = await ElevenLabsService.generateSpeech(
        "Hello from ORPHI! This is a test of the ElevenLabs voice synthesis."
      );
      
      if (audio.success) {
        audio.play();
        setTestResults(prev => ({
          ...prev,
          elevenlabs: {
            success: true,
            message: 'Voice synthesis test successful! Audio should be playing.',
            service: ElevenLabsService.getStatus().service,
            timestamp: new Date().toLocaleTimeString()
          }
        }));
      } else {
        throw new Error('Voice synthesis failed');
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        elevenlabs: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setTesting(prev => ({ ...prev, elevenlabs: false }));
    }
  };

  // Clear API keys
  const clearKeys = () => {
    if (window.confirm('Are you sure you want to clear all API keys?')) {
      localStorage.removeItem('orphi_openai_key');
      localStorage.removeItem('orphi_elevenlabs_key');
      setOpenaiKey('');
      setElevenLabsKey('');
      setTestResults(null);
      updateStatus();
      alert('✅ All API keys cleared');
    }
  };

  return (
    <div className="ai-settings max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="header text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-cyber-blue to-royal-purple rounded-full flex items-center justify-center mr-4">
            <i className="fas fa-brain text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">AI Services Configuration</h1>
            <p className="text-silver-mist">Configure ChatGPT and ElevenLabs integration</p>
          </div>
        </div>
        <div className="text-sm text-silver-mist/70">
          Developed by <span className="text-cyber-blue font-semibold">LEAD 5</span> - 
          Young Blockchain Engineers
        </div>
      </div>

      {/* Service Status Cards */}
      <div className="status-grid grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* OpenAI Status */}
        <div className="status-card glass-morphism rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <i className="fas fa-robot text-2xl text-premium-gold mr-3"></i>
              <h3 className="text-lg font-bold text-white">ChatGPT (OpenAI)</h3>
            </div>
            <div className={`status-indicator ${status.openai.connected ? 'connected' : 'disconnected'}`}>
              <i className={`fas ${status.openai.connected ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </div>
          </div>
          <p className="text-silver-mist text-sm mb-2">{status.openai.message}</p>
          <div className="text-xs text-silver-mist/70">
            Model: {OpenAIService.getStatus().model}
          </div>
        </div>

        {/* ElevenLabs Status */}
        <div className="status-card glass-morphism rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <i className="fas fa-microphone text-2xl text-success-green mr-3"></i>
              <h3 className="text-lg font-bold text-white">ElevenLabs Voice</h3>
            </div>
            <div className={`status-indicator ${status.elevenlabs.connected ? 'connected' : 'fallback'}`}>
              <i className={`fas ${status.elevenlabs.connected ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            </div>
          </div>
          <p className="text-silver-mist text-sm mb-2">{status.elevenlabs.message}</p>
          <div className="text-xs text-silver-mist/70">
            Service: {ElevenLabsService.getStatus().service}
          </div>
        </div>
      </div>

      {/* OpenAI Configuration */}
      <div className="openai-config glass-morphism rounded-2xl p-6">
        <div className="flex items-center mb-6">
          <i className="fas fa-cog text-premium-gold text-xl mr-3"></i>
          <h2 className="text-xl font-bold text-white">OpenAI Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">
              API Key
              <span className="text-energy-orange ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showOpenaiKey ? "text" : "password"}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-charcoal-gray/50 border border-silver-mist/30 rounded-lg px-4 py-3 text-white placeholder-silver-mist/50 focus:border-cyber-blue focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                className="absolute right-3 top-3 text-silver-mist hover:text-white"
              >
                <i className={`fas ${showOpenaiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <p className="text-silver-mist/70 text-sm mt-2">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyber-blue hover:underline">OpenAI Platform</a>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={saveOpenaiKey}
              disabled={!openaiKey.trim()}
              className="btn-gradient-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-save mr-2"></i>
              Save Key
            </button>
            <button
              onClick={testOpenAI}
              disabled={!status.openai.connected || testing.openai}
              className="btn-gradient-secondary px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing.openai ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-flask mr-2"></i>
                  Test Connection
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ElevenLabs Configuration */}
      <div className="elevenlabs-config glass-morphism rounded-2xl p-6">
        <div className="flex items-center mb-6">
          <i className="fas fa-cog text-success-green text-xl mr-3"></i>
          <h2 className="text-xl font-bold text-white">ElevenLabs Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">
              API Key
              <span className="text-silver-mist/70 ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type={showElevenLabsKey ? "text" : "password"}
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
                placeholder="Leave empty to use browser speech synthesis"
                className="w-full bg-charcoal-gray/50 border border-silver-mist/30 rounded-lg px-4 py-3 text-white placeholder-silver-mist/50 focus:border-cyber-blue focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                className="absolute right-3 top-3 text-silver-mist hover:text-white"
              >
                <i className={`fas ${showElevenLabsKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <p className="text-silver-mist/70 text-sm mt-2">
              Get your API key from <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" className="text-cyber-blue hover:underline">ElevenLabs</a>. 
              Browser speech synthesis will be used as fallback.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={saveElevenLabsKey}
              disabled={!elevenLabsKey.trim()}
              className="btn-gradient-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-save mr-2"></i>
              Save Key
            </button>
            <button
              onClick={testElevenLabs}
              disabled={testing.elevenlabs}
              className="btn-gradient-secondary px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing.elevenlabs ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-volume-up mr-2"></i>
                  Test Voice
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="test-results glass-morphism rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-clipboard-list text-cyber-blue mr-3"></i>
            Test Results
          </h3>
          
          {testResults.openai && (
            <div className={`test-result mb-4 p-4 rounded-lg ${testResults.openai.success ? 'bg-success-green/20 border border-success-green/50' : 'bg-alert-red/20 border border-alert-red/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">OpenAI Test</h4>
                <span className="text-sm text-silver-mist">{testResults.openai.timestamp}</span>
              </div>
              {testResults.openai.success ? (
                <p className="text-success-green text-sm">{testResults.openai.response}</p>
              ) : (
                <p className="text-alert-red text-sm">Error: {testResults.openai.error}</p>
              )}
            </div>
          )}
          
          {testResults.elevenlabs && (
            <div className={`test-result p-4 rounded-lg ${testResults.elevenlabs.success ? 'bg-success-green/20 border border-success-green/50' : 'bg-alert-red/20 border border-alert-red/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">ElevenLabs Test</h4>
                <span className="text-sm text-silver-mist">{testResults.elevenlabs.timestamp}</span>
              </div>
              {testResults.elevenlabs.success ? (
                <div>
                  <p className="text-success-green text-sm">{testResults.elevenlabs.message}</p>
                  <p className="text-silver-mist text-xs mt-1">Service: {testResults.elevenlabs.service}</p>
                </div>
              ) : (
                <p className="text-alert-red text-sm">Error: {testResults.elevenlabs.error}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="actions flex justify-between items-center">
        <div className="info text-silver-mist text-sm">
          <i className="fas fa-info-circle mr-2"></i>
          API keys are stored locally in your browser
        </div>
        <button
          onClick={clearKeys}
          className="text-alert-red hover:text-white transition-colors"
        >
          <i className="fas fa-trash mr-2"></i>
          Clear All Keys
        </button>
      </div>

      <style jsx>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-gradient-primary {
          background: linear-gradient(135deg, #00D4FF, #7B2CBF);
          color: white;
          border: none;
        }

        .btn-gradient-secondary {
          background: linear-gradient(135deg, #7B2CBF, #FF6B35);
          color: white;
          border: none;
        }

        .status-indicator.connected {
          color: #00FF88;
        }

        .status-indicator.disconnected {
          color: #FF4757;
        }

        .status-indicator.fallback {
          color: #FFD700;
        }

        .text-gradient {
          background: linear-gradient(135deg, #00D4FF, #7B2CBF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default AISettings; 