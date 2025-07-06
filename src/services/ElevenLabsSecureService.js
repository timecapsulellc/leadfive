/**
 * Secure ElevenLabs Service
 * Routes all voice synthesis through backend proxy
 */

import secureProxy from './api/secureProxy';

class ElevenLabsSecureService {
  constructor() {
    // Environment configuration
    this.enableVoiceSynthesis = import.meta.env.VITE_ENABLE_VOICE_SYNTHESIS !== 'false';
    this.defaultVoiceId = import.meta.env.VITE_DEFAULT_VOICE_ID || 'elevenlabs_default';
    this.enableAIVoiceResponses = import.meta.env.VITE_ENABLE_AI_VOICE_RESPONSES !== 'false';

    // Audio cache for frequently used phrases
    this.audioCache = new Map();
    this.maxCacheSize = 50;

    // Pre-defined voice messages
    this.predefinedMessages = {
      welcome: 'Welcome to LeadFive! Your journey to financial freedom starts here.',
      packageSelected: 'Great choice! This package will help you build a strong foundation.',
      registrationSuccess: "Congratulations! You've successfully joined the LeadFive community.",
      referralEarned: "Excellent! You've earned a new referral commission.",
      levelUp: "Amazing! You've reached a new leadership level in LeadFive.",
      withdrawalSuccess: 'Your withdrawal has been processed successfully.',
      teamGrowth: 'Your team is growing! Keep up the excellent work.',
      aiGreeting: "Hi! I'm AIRA, your LeadFive AI assistant. How can I help you today?",
    };

    // Voice personalities
    this.voicePersonalities = {
      professional: { voice_id: 'rachel', stability: 0.75, similarity_boost: 0.8 },
      enthusiastic: { voice_id: 'josh', stability: 0.65, similarity_boost: 0.85 },
      supportive: { voice_id: 'bella', stability: 0.8, similarity_boost: 0.75 },
      motivational: { voice_id: 'adam', stability: 0.7, similarity_boost: 0.9 },
    };
  }

  /**
   * Synthesize text to speech through secure proxy
   */
  async synthesizeSpeech(text, options = {}) {
    if (!this.enableVoiceSynthesis) {
      return this.useFallbackSpeech(text);
    }

    // Check cache first
    const cacheKey = `${text}_${options.voiceId || this.defaultVoiceId}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey);
    }

    try {
      const response = await secureProxy.synthesizeVoice(text, options.voiceId || this.defaultVoiceId);
      
      if (response.audioUrl) {
        // Cache the result
        this.cacheAudio(cacheKey, response.audioUrl);
        return response.audioUrl;
      } else {
        return this.useFallbackSpeech(text);
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      return this.useFallbackSpeech(text);
    }
  }

  /**
   * Get pre-defined message audio
   */
  async getPredefinedAudio(messageKey) {
    const text = this.predefinedMessages[messageKey];
    if (!text) {
      console.warn(`Predefined message not found: ${messageKey}`);
      return null;
    }

    return this.synthesizeSpeech(text);
  }

  /**
   * Speak message with personality
   */
  async speakWithPersonality(text, personality = 'professional') {
    const voiceConfig = this.voicePersonalities[personality] || this.voicePersonalities.professional;
    
    return this.synthesizeSpeech(text, {
      voiceId: voiceConfig.voice_id,
      stability: voiceConfig.stability,
      similarityBoost: voiceConfig.similarity_boost
    });
  }

  /**
   * Fallback to browser's speech synthesis
   */
  useFallbackSpeech(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Use a professional voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
      return Promise.resolve('fallback');
    }
    
    return Promise.resolve(null);
  }

  /**
   * Cache audio URL
   */
  cacheAudio(key, audioUrl) {
    // Implement LRU cache
    if (this.audioCache.size >= this.maxCacheSize) {
      const firstKey = this.audioCache.keys().next().value;
      this.audioCache.delete(firstKey);
    }
    this.audioCache.set(key, audioUrl);
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.clear();
  }

  /**
   * Check if voice synthesis is available
   */
  isAvailable() {
    return this.enableVoiceSynthesis;
  }
}

// Export singleton instance
export default new ElevenLabsSecureService();