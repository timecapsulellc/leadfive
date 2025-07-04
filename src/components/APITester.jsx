import React, { useState, useEffect } from 'react';
import coinMarketCapService from '../services/coinMarketCapService';
import coinMarketCapServicePro from '../services/coinMarketCapServicePro';
import elevenLabsService from '../services/elevenLabsService';
import openAIService from '../services/openAIService';

const APITester = () => {
  const [apiStatus, setApiStatus] = useState({
    coinMarketCap: { status: 'testing', data: null, error: null },
    elevenLabs: { status: 'testing', data: null, error: null },
    openAI: { status: 'testing', data: null, error: null }
  });

  useEffect(() => {
    testAPIs();
  }, []);

  const testAPIs = async () => {
    // Test CoinMarketCap API
    try {
      const prices = await coinMarketCapServicePro.getCurrentPricesEnhanced();
      setApiStatus(prev => ({
        ...prev,
        coinMarketCap: { 
          status: 'success', 
          data: prices, 
          error: null 
        }
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        coinMarketCap: { 
          status: 'error', 
          data: null, 
          error: error.message 
        }
      }));
    }

    // Test ElevenLabs Service
    try {
      const voiceStatus = elevenLabsService.getServiceStatus();
      setApiStatus(prev => ({
        ...prev,
        elevenLabs: { 
          status: voiceStatus.enabled ? 'success' : 'warning', 
          data: voiceStatus, 
          error: null 
        }
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        elevenLabs: { 
          status: 'error', 
          data: null, 
          error: error.message 
        }
      }));
    }

    // Test OpenAI Service
    try {
      const aiStatus = openAIService.getStatus();
      const isReady = openAIService.isReady();
      setApiStatus(prev => ({
        ...prev,
        openAI: { 
          status: isReady ? 'success' : (aiStatus.hasApiKey ? 'warning' : 'error'), 
          data: { ...aiStatus, ready: isReady }, 
          error: null 
        }
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        openAI: { 
          status: 'error', 
          data: null, 
          error: error.message 
        }
      }));
    }
  };

  const testVoiceSynthesis = async () => {
    try {
      await elevenLabsService.synthesizeText("Hello! This is a test of the enhanced voice synthesis system.", {
        voiceId: 'professional_female',
        emphasis: true,
        pause: true
      });
    } catch (error) {
      console.error('Voice test failed:', error);
    }
  };

  const testAIRAGreeting = async () => {
    try {
      await elevenLabsService.playPredefinedMessage('aiGreeting');
    } catch (error) {
      console.error('AIRA greeting test failed:', error);
    }
  };

  const testPersonalityVoice = async (personality = 'advisor') => {
    try {
      await elevenLabsService.testPersonalityVoice(personality);
      console.log(`${personality} personality voice test completed`);
    } catch (error) {
      console.error(`${personality} voice test failed:`, error);
    }
  };

  const testOpenAIResponse = async () => {
    try {
      const testResponse = await openAIService.getChatResponse(
        "Hello AIRA! Can you help me understand LeadFive's earning potential?", 
        { personality: 'Revenue Advisor', userInfo: { packageLevel: 'Bronze' } }
      );
      console.log('OpenAI test response:', testResponse);
      alert('OpenAI test successful! Check console for response.');
    } catch (error) {
      console.error('OpenAI test failed:', error);
      alert('OpenAI test failed: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      padding: '24px',
      margin: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h3 style={{ marginBottom: '20px', color: '#fbbf24' }}>🧪 API Integration Status</h3>
      
      {/* CoinMarketCap Status */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>{getStatusIcon(apiStatus.coinMarketCap.status)}</span>
          <h4 style={{ margin: 0, color: getStatusColor(apiStatus.coinMarketCap.status) }}>
            CoinMarketCap API
          </h4>
          <span style={{ 
            background: getStatusColor(apiStatus.coinMarketCap.status),
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            textTransform: 'uppercase'
          }}>
            {apiStatus.coinMarketCap.status}
          </span>
        </div>
        
        {apiStatus.coinMarketCap.data && (
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p>✅ Successfully fetched prices for {Object.keys(apiStatus.coinMarketCap.data).length} cryptocurrencies</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginTop: '8px' }}>
              {Object.entries(apiStatus.coinMarketCap.data).map(([symbol, data]) => (
                <div key={symbol} style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '8px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#fbbf24' }}>{symbol}</div>
                  <div style={{ fontFamily: 'monospace' }}>${data.price?.toFixed(2)}</div>
                  <div style={{ 
                    color: data.change24h >= 0 ? '#10b981' : '#ef4444',
                    fontSize: '0.8rem'
                  }}>
                    {data.change24h >= 0 ? '+' : ''}{data.change24h?.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {apiStatus.coinMarketCap.error && (
          <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>
            ❌ Error: {apiStatus.coinMarketCap.error}
          </div>
        )}
      </div>

      {/* ElevenLabs Status */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>{getStatusIcon(apiStatus.elevenLabs.status)}</span>
          <h4 style={{ margin: 0, color: getStatusColor(apiStatus.elevenLabs.status) }}>
            ElevenLabs Voice Service
          </h4>
          <span style={{ 
            background: getStatusColor(apiStatus.elevenLabs.status),
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            textTransform: 'uppercase'
          }}>
            {apiStatus.elevenLabs.status}
          </span>
        </div>
        
        {apiStatus.elevenLabs.data && (
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p>✅ Voice synthesis enabled: {apiStatus.elevenLabs.data.enabled ? 'Yes' : 'No'}</p>
            <p>🎵 Web Speech available: {apiStatus.elevenLabs.data.webSpeechAvailable ? 'Yes' : 'No'}</p>
            <p>🔊 Available voices: {apiStatus.elevenLabs.data.availableVoices}</p>
            <p>🤖 Conversational AI: {apiStatus.elevenLabs.data.conversationalAIEnabled ? 'Enabled' : 'Disabled'}</p>
            <p>🔑 ElevenLabs API: {apiStatus.elevenLabs.data.hasElevenLabsKey ? 'Connected' : 'Not configured'}</p>
            <p>🎭 Personality voices: {apiStatus.elevenLabs.data.personalityVoices || 0}</p>
            <p>💾 Cache size: {apiStatus.elevenLabs.data.cacheSize}</p>
            
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={testVoiceSynthesis}
                style={{
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🎵 Test Voice
              </button>
              <button
                onClick={testAIRAGreeting}
                style={{
                  background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🤖 Test AIRA
              </button>
              <button
                onClick={() => testPersonalityVoice('advisor')}
                style={{
                  background: 'linear-gradient(45deg, #7c3aed, #5b21b6)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🧠 Test Advisor Voice
              </button>
              <button
                onClick={() => testPersonalityVoice('mentor')}
                style={{
                  background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🚀 Test Mentor Voice
              </button>
            </div>
          </div>
        )}
        
        {apiStatus.elevenLabs.error && (
          <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>
            ❌ Error: {apiStatus.elevenLabs.error}
          </div>
        )}
      </div>

      {/* OpenAI Status */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>{getStatusIcon(apiStatus.openAI.status)}</span>
          <h4 style={{ margin: 0, color: getStatusColor(apiStatus.openAI.status) }}>
            OpenAI API (AIRA)
          </h4>
          <span style={{ 
            background: getStatusColor(apiStatus.openAI.status),
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            textTransform: 'uppercase'
          }}>
            {apiStatus.openAI.status}
          </span>
        </div>
        
        {apiStatus.openAI.data && (
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p>✅ OpenAI initialized: {apiStatus.openAI.data.initialized ? 'Yes' : 'No'}</p>
            <p>🔑 API key available: {apiStatus.openAI.data.hasApiKey ? 'Yes' : 'No'}</p>
            <p>🤖 Model: {apiStatus.openAI.data.model}</p>
            <p>⚡ Ready for AIRA: {apiStatus.openAI.data.ready ? 'Yes' : 'No'}</p>
            
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={testOpenAIResponse}
                style={{
                  background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🤖 Test AIRA Response
              </button>
            </div>
          </div>
        )}
        
        {apiStatus.openAI.error && (
          <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>
            ❌ Error: {apiStatus.openAI.error}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={testAPIs}
          style={{
            background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            color: '#1e3a8a',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          🔄 Refresh API Status
        </button>
      </div>
    </div>
  );
};

export default APITester;