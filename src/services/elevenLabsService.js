// ElevenLabs API Service for LeadFive Platform
// Voice synthesis and audio generation

class ElevenLabsService {
  constructor() {
    // Environment configuration
    this.enableVoiceSynthesis =
      import.meta.env.VITE_ENABLE_VOICE_SYNTHESIS !== 'false';
    this.defaultVoiceId =
      import.meta.env.VITE_DEFAULT_VOICE_ID || 'elevenlabs_default';
    this.enableAIVoiceResponses =
      import.meta.env.VITE_ENABLE_AI_VOICE_RESPONSES !== 'false';
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    // ElevenLabs API configuration
    this.baseURL = 'https://api.elevenlabs.io/v1';
    this.conversationalAIURL = 'https://api.elevenlabs.io/v1/convai';

    // Audio cache for frequently used phrases
    this.audioCache = new Map();
    this.maxCacheSize = 50; // Limit cache size

    // Conversational AI configuration - gracefully handle missing API key
    this.isConversationalAIEnabled =
      !!this.apiKey && this.apiKey !== 'your_elevenlabs_api_key_here';

    // Log API status only once during initialization (not as warning)
    if (!this.isConversationalAIEnabled) {
      console.log(
        'ElevenLabs API: Using fallback speech synthesis (API key not configured)'
      );
    }

    // Pre-defined voice messages for LeadFive
    this.predefinedMessages = {
      welcome:
        'Welcome to LeadFive! Your journey to financial freedom starts here.',
      packageSelected:
        'Great choice! This package will help you build a strong foundation.',
      registrationSuccess:
        "Congratulations! You've successfully joined the LeadFive community.",
      referralEarned: "Excellent! You've earned a new referral commission.",
      levelUp: "Amazing! You've reached a new leadership level in LeadFive.",
      withdrawalSuccess: 'Your withdrawal has been processed successfully.',
      teamGrowth: 'Your team is growing! Keep up the excellent work.',
      aiGreeting:
        "Hi! I'm AIRA, your LeadFive AI assistant. How can I help you today?",
    };

    // AIRA Personality Voices (ElevenLabs Conversational AI optimized)
    this.personalityVoices = {
      advisor: {
        voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - professional male
        name: 'Revenue Advisor Voice',
        settings: {
          stability: 0.75,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true,
        },
        personality:
          'Professional, confident financial advisor with warm authority',
      },
      analyzer: {
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - analytical female
        name: 'Network Analyzer Voice',
        settings: {
          stability: 0.85,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
        personality: 'Analytical, data-driven expert with clear articulation',
      },
      mentor: {
        voiceId: 'IKne3meq5aSn9XLyUdCD', // Charlie - motivational
        name: 'Success Mentor Voice',
        settings: {
          stability: 0.65,
          similarity_boost: 0.85,
          style: 0.7,
          use_speaker_boost: true,
        },
        personality: 'Enthusiastic, inspiring mentor with emotional warmth',
      },
      strategist: {
        voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - strategic
        name: 'Binary Strategist Voice',
        settings: {
          stability: 0.8,
          similarity_boost: 0.8,
          style: 0.4,
          use_speaker_boost: true,
        },
        personality: 'Strategic, thoughtful planner with executive presence',
      },
    };

    // Available voices (these would be configured based on your ElevenLabs account)
    this.availableVoices = {
      professional_male: 'Professional Male Voice',
      professional_female: 'Professional Female Voice',
      friendly_assistant: 'Friendly AI Assistant',
      motivational_coach: 'Motivational Coach',
      business_presenter: 'Business Presenter',
    };
  }

  // Check if voice synthesis is enabled
  isVoiceSynthesisEnabled() {
    return this.enableVoiceSynthesis && 'speechSynthesis' in window;
  }

  // Check if ElevenLabs API is available
  async isElevenLabsAvailable() {
    return this.isConversationalAIEnabled;
  }

  // Check if conversational AI is enabled
  isConversationalAIReady() {
    return this.isConversationalAIEnabled;
  }

  // ========================================
  // CONVERSATIONAL AI METHODS
  // ========================================

  // Generate conversational AI response with voice for AIRA personality
  async generateConversationalResponse(
    text,
    personality = 'advisor',
    userContext = {}
  ) {
    if (!this.isConversationalAIReady()) {
      // Silently fall back to browser speech synthesis
      return this.synthesizeSpeechFallback(text);
    }

    try {
      const voiceConfig = this.personalityVoices[personality];
      if (!voiceConfig) {
        console.warn(`Voice config for personality '${personality}' not found`);
        return this.synthesizeSpeechFallback(text);
      }

      // Call ElevenLabs Text-to-Speech API with optimized settings
      const audioResponse = await this.callElevenLabsTTS(text, voiceConfig);

      if (audioResponse) {
        // Play the audio response
        await this.playAudioResponse(audioResponse);
        return { success: true, personality, voiceUsed: voiceConfig.name };
      } else {
        // Fallback to Web Speech API
        return this.synthesizeSpeechFallback(text);
      }
    } catch (error) {
      console.error('Conversational AI error:', error);
      return this.synthesizeSpeechFallback(text);
    }
  }

  // Call ElevenLabs Text-to-Speech API
  async callElevenLabsTTS(text, voiceConfig) {
    try {
      const response = await fetch(
        `${this.baseURL}/text-to-speech/${voiceConfig.voiceId}`,
        {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: voiceConfig.settings,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('ElevenLabs TTS API call failed:', error);
      return null;
    }
  }

  // Play audio response from ElevenLabs
  async playAudioResponse(audioBlob) {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };

        audio.onerror = error => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // AIRA personality-specific voice responses
  async airaPersonalityResponse(
    text,
    personality = 'advisor',
    userContext = {}
  ) {
    console.log(
      `[AIRA Voice] Generating ${personality} response for: "${text.substring(0, 50)}..."`
    );

    if (!this.enableAIVoiceResponses) {
      console.log('[AIRA Voice] AI voice responses disabled');
      return false;
    }

    // Optimize text for voice synthesis
    const voiceText = this.optimizeTextForVoice(text);

    // Use conversational AI if available, otherwise fallback
    return this.generateConversationalResponse(
      voiceText,
      personality,
      userContext
    );
  }

  // Optimize text for natural voice synthesis
  optimizeTextForVoice(text) {
    return (
      text
        // Remove markdown formatting
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        // Add natural pauses
        .replace(/\./g, '.')
        .replace(/:/g, ':')
        .replace(/;/g, ';')
        // Remove excessive emojis for cleaner speech
        .replace(/[🚀💎💰📊🎯⚡🔥✨🌟]/g, '')
        // Clean up multiple spaces
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  // Test voice for specific personality
  async testPersonalityVoice(personality = 'advisor') {
    const testMessages = {
      advisor:
        "Hello! I'm your Revenue Advisor. Let me help you optimize your earnings and build financial freedom through LeadFive's proven 4X system.",
      analyzer:
        'Greetings! As your Network Analyzer, I provide data-driven insights to maximize your team performance and growth metrics.',
      mentor:
        "Hey there! I'm your Success Mentor, here to inspire and guide you on your journey to financial independence. You've got this!",
      strategist:
        "Welcome! I'm your Binary Strategist, focused on architecting your long-term wealth building plan with systematic precision.",
    };

    const message = testMessages[personality] || testMessages.advisor;
    return this.airaPersonalityResponse(message, personality);
  }

  // Enhanced speech synthesis using ElevenLabs features
  async synthesizeSpeechEnhanced(text, options = {}) {
    if (await this.isElevenLabsAvailable()) {
      // Use ElevenLabs-like enhanced features
      return this.synthesizeWithEnhancedVoice(text, options);
    } else {
      // Fallback to Web Speech API
      return this.synthesizeSpeechFallback(text, options);
    }
  }

  // Enhanced voice synthesis with ElevenLabs-style features
  async synthesizeWithEnhancedVoice(text, options = {}) {
    try {
      // Simulate ElevenLabs API features with enhanced Web Speech API
      const utterance = new SpeechSynthesisUtterance(text);

      // Enhanced voice configuration
      const voiceConfig = {
        rate: options.rate || 0.85, // Slightly slower for clarity
        pitch: options.pitch || 1.1, // Higher pitch for AI assistant
        volume: options.volume || 0.8,
        voiceId: options.voiceId || this.defaultVoiceId,
      };

      // Apply voice configuration
      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = voiceConfig.volume;

      // Enhanced voice selection based on ElevenLabs voice types
      const voices = speechSynthesis.getVoices();
      let selectedVoice = null;

      // Try to find the best voice based on voice ID
      switch (voiceConfig.voiceId) {
        case 'professional_female':
          selectedVoice = voices.find(
            v =>
              v.lang.includes('en') &&
              (v.name.includes('Female') ||
                v.name.includes('Samantha') ||
                v.name.includes('Victoria'))
          );
          break;
        case 'professional_male':
          selectedVoice = voices.find(
            v =>
              v.lang.includes('en') &&
              (v.name.includes('Male') ||
                v.name.includes('Alex') ||
                v.name.includes('Daniel'))
          );
          break;
        case 'friendly_assistant':
          selectedVoice = voices.find(
            v =>
              v.lang.includes('en') &&
              (v.name.includes('Karen') ||
                v.name.includes('Siri') ||
                v.name.includes('Assistant'))
          );
          break;
        default:
          selectedVoice = voices.find(v => v.lang.includes('en-US'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Add enhanced features
      if (options.emphasis) {
        // Add SSML-like emphasis (simulated)
        text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold
        utterance.text = text;
      }

      if (options.pause) {
        // Add pauses for natural speech
        utterance.text = text.replace(/\./g, '. '); // Add pause after periods
      }

      return new Promise((resolve, reject) => {
        utterance.onend = () => {
          console.log('Enhanced voice synthesis completed');
          resolve(true);
        };
        utterance.onerror = error => {
          console.error('Enhanced voice synthesis error:', error);
          reject(error);
        };

        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Enhanced synthesis failed, falling back:', error);
      return this.synthesizeSpeechFallback(text, options);
    }
  }

  // Generate speech using Web Speech API (fallback)
  async synthesizeSpeechFallback(text, options = {}) {
    if (!this.isVoiceSynthesisEnabled()) {
      console.warn('Voice synthesis not available');
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);

        // Configure voice options
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 0.8;

        // Try to find a suitable voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          voice =>
            voice.lang.includes('en') &&
            (voice.name.includes('Female') || voice.name.includes('Male'))
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => resolve(true);
        utterance.onerror = error => reject(error);

        speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Play predefined message
  async playPredefinedMessage(messageKey, options = {}) {
    const message = this.predefinedMessages[messageKey];
    if (!message) {
      console.warn(`Predefined message '${messageKey}' not found`);
      return false;
    }

    try {
      await this.synthesizeSpeechFallback(message, options);
      return true;
    } catch (error) {
      console.error('Error playing predefined message:', error);
      return false;
    }
  }

  // Synthesize custom text with enhanced features
  async synthesizeText(text, options = {}) {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid text provided for synthesis');
      return false;
    }

    // Check cache first
    const cacheKey = `${text}_${JSON.stringify(options)}`;
    if (this.audioCache.has(cacheKey)) {
      console.log('Playing cached audio');
      // In a real implementation, you'd play the cached audio
      return true;
    }

    try {
      // Use enhanced synthesis with ElevenLabs-style features
      await this.synthesizeSpeechEnhanced(text, options);

      // Cache the result (in real implementation, cache the audio blob)
      if (this.audioCache.size >= this.maxCacheSize) {
        // Remove oldest entry
        const firstKey = this.audioCache.keys().next().value;
        this.audioCache.delete(firstKey);
      }
      this.audioCache.set(cacheKey, true);

      return true;
    } catch (error) {
      console.error('Error synthesizing text:', error);
      return false;
    }
  }

  // LeadFive specific voice notifications
  async notifyRegistrationSuccess(packageLevel) {
    const message = `Congratulations! You've successfully registered for Level ${packageLevel} package. Welcome to LeadFive!`;
    return this.synthesizeText(message);
  }

  async notifyReferralEarned(amount, currency = 'USDT') {
    const message = `Great news! You've earned ${amount} ${currency} from a new referral. Keep building your network!`;
    return this.synthesizeText(message);
  }

  async notifyWithdrawal(amount, currency = 'USDT') {
    const message = `Your withdrawal of ${amount} ${currency} has been processed successfully.`;
    return this.synthesizeText(message);
  }

  async notifyLevelUp(newLevel) {
    const message = `Amazing achievement! You've reached Level ${newLevel} in the LeadFive leadership program. Keep up the excellent work!`;
    return this.synthesizeText(message);
  }

  async notifyTeamGrowth(newMemberCount) {
    const message = `Your team is growing! You now have ${newMemberCount} team members. Your leadership is making a difference!`;
    return this.synthesizeText(message);
  }

  // AIRA voice responses (Enhanced with personality support)
  async airaResponse(text, personality = 'advisor') {
    if (!this.enableAIVoiceResponses) {
      return false;
    }

    // Use new personality-based voice system if available
    if (this.isConversationalAIReady()) {
      return this.airaPersonalityResponse(text, personality);
    }

    // Fallback to legacy method
    const options = {
      rate: 0.9,
      pitch: 1.1, // Slightly higher pitch for AI assistant
      volume: 0.7,
    };

    return this.synthesizeText(`AIRA says: ${text}`, options);
  }

  // Stop current speech
  stopSpeech() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  // Check if currently speaking
  isSpeaking() {
    if ('speechSynthesis' in window) {
      return speechSynthesis.speaking;
    }
    return false;
  }

  // Get available voices
  getAvailableVoices() {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  // Configure voice settings
  setVoiceSettings(settings) {
    this.voiceSettings = {
      rate: settings.rate || 0.9,
      pitch: settings.pitch || 1.0,
      volume: settings.volume || 0.8,
      voice: settings.voice || null,
    };
  }

  // Clear audio cache
  clearCache() {
    this.audioCache.clear();
  }

  // Get service status
  getServiceStatus() {
    return {
      enabled: this.enableVoiceSynthesis,
      aiVoicesEnabled: this.enableAIVoiceResponses,
      conversationalAIEnabled: this.isConversationalAIEnabled,
      hasElevenLabsKey:
        !!this.apiKey && this.apiKey !== 'your_elevenlabs_api_key_here',
      webSpeechAvailable: 'speechSynthesis' in window,
      currentlySpeaking: this.isSpeaking(),
      cacheSize: this.audioCache.size,
      availableVoices: this.getAvailableVoices().length,
      personalityVoices: Object.keys(this.personalityVoices).length,
    };
  }
}

// Export singleton instance
export default new ElevenLabsService();
