/**
 * Secure API Proxy Service
 * Routes API calls through backend to protect API keys
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.leadfive.com';

class SecureProxyService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.endpoints = {
      openai: '/api/v1/ai/chat',
      elevenLabs: '/api/v1/voice/synthesize',
      coinMarketCap: '/api/v1/crypto/prices'
    };
  }

  /**
   * Make secure API call through backend proxy
   */
  async makeRequest(endpoint, data, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Secure proxy request failed:', error);
      throw error;
    }
  }

  /**
   * OpenAI Chat Completion (proxied through backend)
   */
  async getChatCompletion(messages, options = {}) {
    return this.makeRequest(this.endpoints.openai, {
      messages,
      model: options.model || 'gpt-4o-mini',
      temperature: options.temperature || 0.8,
      max_tokens: options.max_tokens || 200
    });
  }

  /**
   * ElevenLabs Voice Synthesis (proxied through backend)
   */
  async synthesizeVoice(text, voiceId = 'default') {
    return this.makeRequest(this.endpoints.elevenLabs, {
      text,
      voice_id: voiceId,
      model_id: 'eleven_monolingual_v1'
    });
  }

  /**
   * Get Crypto Prices (proxied through backend if using premium API)
   */
  async getCryptoPrices(symbols) {
    return this.makeRequest(this.endpoints.coinMarketCap, {
      symbols
    }, {
      method: 'GET'
    });
  }
}

export default new SecureProxyService();