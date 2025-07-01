/**
 * ElevenLabs Voice Synthesis Service
 * Provides voice synthesis for AI responses using ElevenLabs API
 */

class ElevenLabsService {
  constructor() {
    this.isInitialized = false;
    this.apiKey = null;
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '9PVP7ENhDskL0KYHAKtD';
    this.model = import.meta.env.VITE_ELEVENLABS_MODEL || 'eleven_multilingual_v2';
    this.agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || null;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    
    // Auto-initialize if environment variable is available
    this.autoInitialize();
  }

  // Auto-initialize from environment variables
  autoInitialize() {
    const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (envApiKey && envApiKey !== 'YOUR_ELEVENLABS_API_KEY') {
      this.initialize(envApiKey);
    }
  }

  // Initialize ElevenLabs with API key
  initialize(apiKey) {
    if (!apiKey) {
      console.warn('ElevenLabs API key not provided');
      return false;
    }

    try {
      this.apiKey = apiKey;
      this.isInitialized = true;
      console.log('✅ ElevenLabs service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize ElevenLabs:', error);
      return false;
    }
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized && this.apiKey;
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!this.apiKey,
      service: this.isInitialized ? 'ElevenLabs API' : 'Browser Speech Fallback',
      voiceId: this.voiceId,
      model: this.model,
      fallbackAvailable: true
    };
  }

  // Generate speech from text
  async generateSpeech(text, options = {}) {
    if (!this.isReady()) {
      return this.generateFallbackSpeech(text);
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: this.model,
          voice_settings: {
            stability: options.stability || 0.5,
            similarity_boost: options.similarity_boost || 0.75,
            style: options.style || 0.0,
            use_speaker_boost: options.use_speaker_boost || true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return {
        success: true,
        audio: audio,
        play: () => audio.play(),
        url: audioUrl,
        service: 'ElevenLabs'
      };

    } catch (error) {
      console.warn('ElevenLabs API failed, using fallback:', error);
      return this.generateFallbackSpeech(text);
    }
  }

  // Fallback speech using browser Speech Synthesis API
  generateFallbackSpeech(text) {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to use a good voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        return {
          success: true,
          utterance: utterance,
          play: () => speechSynthesis.speak(utterance),
          service: 'Browser Speech'
        };
      } else {
        throw new Error('Speech synthesis not supported');
      }
    } catch (error) {
      console.error('Speech fallback failed:', error);
      return {
        success: false,
        error: error.message,
        service: 'None'
      };
    }
  }

  // Generate welcome greeting for users
  async generateWelcomeGreeting(userName, userStats = {}) {
    const greetings = [
      `Welcome back to LeadFive, ${userName}! Ready to revolutionize Web3 networking today?`,
      `Hello ${userName}! Your LeadFive dashboard is ready with exciting opportunities.`,
      `Great to see you, ${userName}! Let's explore your LeadFive network growth together.`,
      `Welcome ${userName}! Your decentralized future starts here with LeadFive.`
    ];

    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Add earnings info if available
    if (userStats.totalEarnings) {
      greeting += ` You've earned ${userStats.totalEarnings} USDT so far!`;
    }

    return this.generateSpeech(greeting);
  }

  // Generate motivational messages
  async generateMotivationalMessage(context = {}) {
    const motivationalMessages = [
      "Keep building your network! Every connection brings new opportunities.",
      "You're on the path to financial freedom with LeadFive. Stay consistent!",
      "Your network is your net worth. Keep growing with LeadFive!",
      "Success in Web3 requires persistence. You're doing great!",
      "The future of networking is decentralized. You're leading the way!"
    ];

    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    return this.generateSpeech(message);
  }

  // Generate FOMO announcements
  async generateFOMOAnnouncement(type, data = {}) {
    let message;

    switch (type) {
      case 'newUser':
        message = `🔥 Someone just joined your network and earned ${data.amount || '100'} USDT! The opportunity is real!`;
        break;
      case 'earnings':
        message = `💰 A network member just received ${data.amount || '500'} USDT in earnings! Your turn could be next!`;
        break;
      case 'milestone':
        message = `🎉 Congratulations! You've reached a new milestone with ${data.count || '10'} referrals!`;
        break;
      default:
        message = `🚀 Exciting things are happening in your LeadFive network right now!`;
    }

    return this.generateSpeech(message);
  }

  // Read dashboard data aloud
  async readDashboardWelcome(userName, userStats) {
    const stats = userStats || {};
    let message = `Welcome to your LeadFive dashboard, ${userName}. `;
    
    if (stats.totalEarnings) {
      message += `You have earned ${stats.totalEarnings} USDT in total. `;
    }
    
    if (stats.referralCount) {
      message += `Your network has ${stats.referralCount} members. `;
    }
    
    if (stats.pendingEarnings) {
      message += `You have ${stats.pendingEarnings} USDT pending. `;
    }

    message += "Ready to grow your network and increase your earnings?";

    return this.generateSpeech(message);
  }

  // Simple text-to-speech
  async readText(text) {
    return this.generateSpeech(text);
  }

  // Stop all speech
  stopSpeech() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  // Get available voices (for browser fallback)
  getAvailableVoices() {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  // Test the service
  async testService() {
    const testMessage = "Hello from LeadFive! This is a test of the ElevenLabs voice synthesis service.";
    
    try {
      const result = await this.generateSpeech(testMessage);
      
      if (result.success) {
        console.log('✅ ElevenLabs test successful');
        return {
          success: true,
          service: result.service,
          message: 'Voice synthesis test completed successfully'
        };
      } else {
        throw new Error(result.error || 'Voice synthesis failed');
      }
    } catch (error) {
      console.error('❌ ElevenLabs test failed:', error);
      return {
        success: false,
        error: error.message,
        service: 'None'
      };
    }
  }
}

// Export singleton instance
export default new ElevenLabsService();
