/**
 * Enhanced ElevenLabs Service - Professional Voice AI Integration
 * Provides high-quality text-to-speech with voice cloning, emotion control,
 * and advanced audio processing for the LeadFive platform
 */

class ElevenLabsService {
  constructor() {
    this.apiKey = process.env.REACT_APP_ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.isEnabled = !!this.apiKey;
    this.audioCache = new Map();
    this.voiceProfiles = new Map();
    this.isInitialized = false;
    
    // Voice configurations for different contexts
    this.voiceSettings = {
      'motivational-coach': {
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm, encouraging
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.8,
        use_speaker_boost: true
      },
      'business-advisor': {
        voice_id: 'ErXwobaYiN019PkySvjV', // Antoni - professional, confident
        stability: 0.85,
        similarity_boost: 0.75,
        style: 0.6,
        use_speaker_boost: true
      },
      'ai-assistant': {
        voice_id: 'AZnzlk1XvdvUeBnXmlld', // Domi - friendly, helpful
        stability: 0.8,
        similarity_boost: 0.8,
        style: 0.7,
        use_speaker_boost: true
      },
      'success-celebration': {
        voice_id: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - excited, celebratory
        stability: 0.7,
        similarity_boost: 0.9,
        style: 0.9,
        use_speaker_boost: true
      }
    };
    
    this.init();
  }

  async init() {
    if (!this.isEnabled) {
      console.warn('ElevenLabs API key not found. Voice features will use fallback.');
      return;
    }

    try {
      await this.loadVoiceProfiles();
      this.isInitialized = true;
      console.log('ElevenLabs service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ElevenLabs service:', error);
      this.isEnabled = false;
    }
  }

  async loadVoiceProfiles() {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load voices: ${response.status}`);
      }

      const data = await response.json();
      data.voices.forEach(voice => {
        this.voiceProfiles.set(voice.voice_id, voice);
      });

      console.log(`Loaded ${data.voices.length} voice profiles`);
    } catch (error) {
      console.error('Error loading voice profiles:', error);
      throw error;
    }
  }

  async generateSpeech(text, options = {}) {
    if (!this.isEnabled) {
      return this.generateFallbackAudio(text);
    }

    try {
      // Get voice configuration
      const voiceType = options.voice || 'ai-assistant';
      const voiceConfig = this.voiceSettings[voiceType] || this.voiceSettings['ai-assistant'];
      
      // Create cache key
      const cacheKey = this.createCacheKey(text, voiceConfig);
      
      // Check cache first
      if (this.audioCache.has(cacheKey)) {
        console.log('Returning cached audio');
        return this.audioCache.get(cacheKey);
      }

      // Prepare request
      const requestBody = {
        text: this.preprocessText(text),
        voice_settings: {
          stability: options.stability || voiceConfig.stability,
          similarity_boost: options.similarity_boost || voiceConfig.similarity_boost,
          style: options.style || voiceConfig.style,
          use_speaker_boost: options.use_speaker_boost || voiceConfig.use_speaker_boost
        }
      };

      // Add model settings if specified
      if (options.model_id) {
        requestBody.model_id = options.model_id;
      }

      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceConfig.voice_id}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      
      // Cache the audio (limit cache size)
      if (this.audioCache.size > 50) {
        const firstKey = this.audioCache.keys().next().value;
        this.audioCache.delete(firstKey);
      }
      this.audioCache.set(cacheKey, audioBlob);

      return audioBlob;

    } catch (error) {
      console.error('ElevenLabs speech generation failed:', error);
      return this.generateFallbackAudio(text);
    }
  }

  async generateFallbackAudio(text) {
    // Use Web Speech API as fallback
    return new Promise((resolve) => {
      try {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          utterance.volume = 0.8;
          
          // Try to use a good quality voice
          const voices = speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.lang.startsWith('en')
          );
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          speechSynthesis.speak(utterance);
          
          // Return a placeholder blob for consistency
          resolve(new Blob([''], { type: 'audio/mpeg' }));
        } else {
          console.warn('Speech synthesis not supported');
          resolve(null);
        }
      } catch (error) {
        console.error('Fallback audio generation failed:', error);
        resolve(null);
      }
    });
  }

  preprocessText(text) {
    // Clean and optimize text for speech synthesis
    return text
      .replace(/\$([0-9,]+(?:\.[0-9]{2})?)/g, '$1 dollars') // Convert currency
      .replace(/%/g, ' percent') // Convert percentages
      .replace(/\b([A-Z]{2,})\b/g, (match) => match.split('').join(' ')) // Spell out acronyms
      .replace(/([.!?])\s*/g, '$1 ') // Ensure pauses after sentences
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  createCacheKey(text, voiceConfig) {
    const keyData = {
      text: text.substring(0, 100), // First 100 chars
      voice_id: voiceConfig.voice_id,
      stability: voiceConfig.stability,
      similarity_boost: voiceConfig.similarity_boost
    };
    return btoa(JSON.stringify(keyData)).substring(0, 32);
  }

  async playAudio(audioBlob, options = {}) {
    if (!audioBlob) return null;

    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Apply audio options
      audio.volume = options.volume || 0.8;
      audio.playbackRate = options.playbackRate || 1.0;
      
      // Set up event handlers
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });

      if (options.autoplay !== false) {
        await audio.play();
      }

      return audio;
    } catch (error) {
      console.error('Audio playback failed:', error);
      return null;
    }
  }

  async generateAndPlay(text, options = {}) {
    try {
      const audioBlob = await this.generateSpeech(text, options);
      return await this.playAudio(audioBlob, options);
    } catch (error) {
      console.error('Generate and play failed:', error);
      return null;
    }
  }

  // Specialized methods for different contexts
  async speakWelcomeMessage(userName, earnings = 0) {
    const welcomeMessages = [
      `Welcome back, ${userName}! You're building something amazing. Your current earnings of $${earnings} show your dedication is paying off.`,
      `Hello ${userName}! Ready to take your success to the next level? You've already earned $${earnings} - let's build on that momentum!`,
      `Great to see you, ${userName}! Your journey to financial freedom is progressing beautifully. $${earnings} earned and counting!`
    ];
    
    const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    return await this.generateAndPlay(message, { voice: 'motivational-coach' });
  }

  async speakMotivationalMessage(context = {}) {
    const motivationalMessages = [
      "You're exactly where you need to be. Every successful entrepreneur started with a single step. Your step is today!",
      "Remember, you're not just building income - you're building a legacy. Every action you take today impacts your tomorrow.",
      "Success isn't about perfection, it's about persistence. You've got this! Keep pushing forward!",
      "Your potential is unlimited. The only thing standing between you and your dreams is the action you take right now."
    ];
    
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    return await this.generateAndPlay(message, { voice: 'motivational-coach' });
  }

  async speakBusinessAdvice(advice) {
    return await this.generateAndPlay(advice, { voice: 'business-advisor' });
  }

  async speakSuccessCelebration(achievement) {
    const celebrationIntros = [
      "Congratulations!", "Outstanding!", "Incredible achievement!", "Way to go!"
    ];
    
    const intro = celebrationIntros[Math.floor(Math.random() * celebrationIntros.length)];
    const message = `${intro} ${achievement} This is just the beginning of your success story!`;
    
    return await this.generateAndPlay(message, { voice: 'success-celebration' });
  }

  async speakAIResponse(response) {
    return await this.generateAndPlay(response, { voice: 'ai-assistant' });
  }

  // Voice management
  async getAvailableVoices() {
    if (!this.isEnabled) {
      return Object.keys(this.voiceSettings);
    }

    try {
      if (!this.isInitialized) {
        await this.init();
      }
      return Array.from(this.voiceProfiles.values());
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }

  // Utility methods
  isAvailable() {
    return this.isEnabled && this.isInitialized;
  }

  clearCache() {
    this.audioCache.clear();
    console.log('Audio cache cleared');
  }

  getCacheStats() {
    return {
      size: this.audioCache.size,
      maxSize: 50,
      memoryUsage: `${Math.round(this.audioCache.size * 0.1)}MB (estimated)`
    };
  }

  // Advanced features
  async generateCustomVoice(text, emotionSettings = {}) {
    const emotion = emotionSettings.emotion || 'neutral';
    let voiceConfig = { ...this.voiceSettings['ai-assistant'] };
    
    // Adjust voice settings based on emotion
    switch (emotion) {
      case 'excited':
        voiceConfig.stability = 0.6;
        voiceConfig.style = 0.9;
        break;
      case 'calm':
        voiceConfig.stability = 0.9;
        voiceConfig.style = 0.3;
        break;
      case 'confident':
        voiceConfig.stability = 0.8;
        voiceConfig.style = 0.7;
        break;
      case 'encouraging':
        voiceConfig.stability = 0.75;
        voiceConfig.style = 0.8;
        break;
    }
    
    return await this.generateSpeech(text, voiceConfig);
  }

  async batchGenerate(textArray, options = {}) {
    const results = [];
    
    for (const text of textArray) {
      try {
        const audio = await this.generateSpeech(text, options);
        results.push({ text, audio, success: true });
      } catch (error) {
        results.push({ text, audio: null, success: false, error: error.message });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Legacy methods for backward compatibility
  async synthesize(text, voice = 'default') {
    const voiceType = voice === 'default' ? 'ai-assistant' : voice;
    return await this.generateSpeech(text, { voice: voiceType });
  }

  async getVoices() {
    return await this.getAvailableVoices();
  }

  async playWelcomeMessage(userName) {
    return await this.speakWelcomeMessage(userName);
  }

  async generateAudioResponse(text) {
    return await this.generateSpeech(text);
  }
}

// Create singleton instance
const elevenLabsService = new ElevenLabsService();

// Named exports
export { ElevenLabsService };
export { elevenLabsService };

// Default export
export default elevenLabsService;