/**
 * ElevenLabs Voice AI Service
 * Official API Documentation: https://elevenlabs.io/docs/api-reference/introduction
 * Implements text-to-speech with automatic welcome greetings for LeadFive dApp
 */

class ElevenLabsService {
  constructor() {
    // Get API configuration from environment
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '6F5Zhi321D3Oq7v1oNT4'; // Your voice ID
    this.model = import.meta.env.VITE_ELEVENLABS_MODEL || 'eleven_multilingual_v3'; // Your model
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    
    // Voice settings for optimal quality
    this.voiceSettings = {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    };
    
    // Check API key availability
    this.isInitialized = this.validateApiKey();
    
    if (this.isInitialized) {
      console.log('✅ ElevenLabs service initialized with your API key');
      console.log(`🎤 Using voice ID: ${this.voiceId}`);
      console.log(`🤖 Using model: ${this.model}`);
    } else {
      console.warn('⚠️ ElevenLabs API key not configured. Using browser speech fallback.');
    }
  }

  // Validate API key format and availability
  validateApiKey() {
    if (!this.apiKey) {
      return false;
    }
    
    // Check if it's a placeholder or invalid key
    const invalidKeys = [
      'your-elevenlabs-api-key-here',
      '***REMOVED***'
    ];
    
    if (invalidKeys.includes(this.apiKey)) {
      console.warn('⚠️ Invalid ElevenLabs API key detected. Please update your .env file with a valid ElevenLabs API key.');
      return false;
    }
    
    return true;
  }

  /**
   * Generate speech from text using ElevenLabs API
   * Official API endpoint: POST /v1/text-to-speech/{voice_id}
   */
  async generateSpeech(text, voiceId = this.voiceId, options = {}) {
    if (!this.isInitialized) {
      console.log('🔄 ElevenLabs unavailable, using browser speech fallback');
      return this.fallbackSpeech(text);
    }

    try {
      console.log(`🎤 Generating speech with ElevenLabs: "${text.substring(0, 50)}..."`);
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: options.model || this.model,
          voice_settings: {
            ...this.voiceSettings,
            ...options.voiceSettings
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error ${response.status}:`, errorText);
        
        if (response.status === 401) {
          console.error('❌ Invalid ElevenLabs API key. Please check your .env configuration.');
        } else if (response.status === 422) {
          console.error('❌ Invalid voice ID or model. Please check your configuration.');
        }
        
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ ElevenLabs speech generated successfully');
      
      return {
        success: true,
        audioUrl: audioUrl,
        audioBlob: audioBlob,
        play: () => this.playAudio(audioUrl)
      };

    } catch (error) {
      console.error('ElevenLabs generation error:', error);
      console.log('🔄 Falling back to browser speech synthesis');
      return this.fallbackSpeech(text);
    }
  }

  /**
   * Play audio from URL with error handling
   */
  async playAudio(audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      
      // Handle audio loading and playback
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          audio.play()
            .then(() => {
              console.log('🔊 Audio playback started');
              resolve(audio);
            })
            .catch(reject);
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          reject(e);
        });
        
        audio.load();
      });
      
    } catch (error) {
      console.error('Audio playback error:', error);
      return null;
    }
  }

  /**
   * Fallback to browser speech synthesis when ElevenLabs is unavailable
   */
  fallbackSpeech(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings for better quality
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to use a female voice similar to your ElevenLabs voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Zira')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log(`🎤 Using browser voice: ${preferredVoice.name}`);
      }

      return {
        success: true,
        audioUrl: null,
        audioBlob: null,
        play: () => {
          console.log('🔊 Playing browser speech synthesis');
          speechSynthesis.speak(utterance);
          return utterance;
        }
      };
    }

    console.warn('❌ No speech synthesis available');
    return {
      success: false,
      audioUrl: null,
      audioBlob: null,
      play: () => null
    };
  }

  /**
   * Generate personalized welcome greeting for dashboard
   * This is called automatically when users land on the dashboard
   */
  async generateWelcomeGreeting(userName, userStats = {}) {
    console.log(`🎉 Generating welcome greeting for user: ${userName}`);
    
    const greetings = [
      `Welcome back to LeadFive, ${userName}! Ready to revolutionize Web3 networking today?`,
      `Hey ${userName}! Your crypto success story is just beginning. Let's make it legendary!`,
      `${userName}, the blockchain revolution needs leaders like you. Ready to claim your spot?`,
      `Welcome to the future, ${userName}! LeadFive's AI is here to guide your Web3 journey.`,
      `${userName}, diamond hands incoming! Let's turn your vision into blockchain reality.`
    ];

    // Add earnings-based greetings if user has earnings
    if (userStats.totalEarnings && parseFloat(userStats.totalEarnings) > 0) {
      greetings.push(
        `Amazing work, ${userName}! You've already earned $${userStats.totalEarnings}. Ready for your next milestone?`,
        `${userName}, you're crushing it with $${userStats.totalEarnings} earned! The top 10% awaits you.`
      );
    }

    // Add team-based greetings if user has a team
    if (userStats.teamSize && parseInt(userStats.teamSize) > 0) {
      greetings.push(
        `${userName}, your team of ${userStats.teamSize} is growing strong! Time to scale to the next level.`,
        `Leading ${userStats.teamSize} people already, ${userName}? You're born for Web3 leadership!`
      );
    }

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    console.log(`💬 Selected greeting: "${greeting}"`);
    
    return this.generateSpeech(greeting);
  }

  /**
   * Generate motivational messages based on user context
   */
  async generateMotivationalMessage(context = {}) {
    const { mood = 'neutral', achievement, timeOfDay } = context;
    
    let message = '';

    switch (mood) {
      case 'happy':
        message = "Love that energy! 🚀 You're in the perfect mindset to explore those high-ROI opportunities. The crypto gods are smiling!";
        break;
      case 'stressed':
        message = "Rough day? Remember, every crypto success story started with a challenge. Your breakthrough moment could be next!";
        break;
      case 'focused':
        message = "That focus is pure gold! 💎 This is exactly when the best investment decisions happen. The blockchain is calling your name!";
        break;
      case 'excited':
        message = "That excitement is contagious! ⚡ Channel that energy into your next big move. The Web3 revolution needs leaders like you!";
        break;
      default:
        message = "Ready to turn potential into profit? 🔥 The top 10% of LeadFive users earn $15,000 monthly. Your breakthrough moment is now!";
    }

    if (achievement) {
      message = `Congratulations on ${achievement}! 🎉 You're building something incredible. Next stop: crypto success hall of fame!`;
    }

    return this.generateSpeech(message);
  }

  /**
   * Generate FOMO-driven announcements for engagement
   */
  async generateFOMOAnnouncement(type, data = {}) {
    const announcements = {
      newUser: `Alert! Someone just joined LeadFive and claimed their spot in the Web3 revolution. Don't let opportunity slip away!`,
      bigInvestment: `Breaking: A user just invested $${data.amount || '5,000'}! The smart money is moving. Are you ready?`,
      achievement: `Success story alert! ${data.user || 'A member'} just hit $${data.earnings || '10,000'} in earnings. Your turn is coming!`,
      limitedTime: `Exclusive access closing in ${data.timeLeft || '24 hours'}! Only ${data.spotsLeft || '23'} spots remain for the elite tier.`,
      marketUpdate: `Market update: Web3 projects are up ${data.percentage || '127'}%! The revolution is accelerating. Don't miss out!`
    };

    const message = announcements[type] || announcements.marketUpdate;
    
    // Use more dramatic voice settings for FOMO
    return this.generateSpeech(message, this.voiceId, {
      voiceSettings: {
        stability: 0.8,
        similarity_boost: 0.8,
        style: 0.7 // More dramatic
      }
    });
  }

  /**
   * Get available voices from ElevenLabs API
   * Official API endpoint: GET /v1/voices
   */
  async getVoices() {
    if (!this.isInitialized) {
      return this.getBrowserVoices();
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📋 Retrieved ${data.voices.length} ElevenLabs voices`);
      return data.voices;
      
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      return this.getBrowserVoices();
    }
  }

  /**
   * Get browser speech synthesis voices as fallback
   */
  getBrowserVoices() {
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      console.log(`📋 Retrieved ${voices.length} browser voices`);
      return voices.map(voice => ({
        voice_id: voice.voiceURI,
        name: voice.name,
        category: 'browser',
        preview_url: null
      }));
    }
    return [];
  }

  /**
   * Stop all audio playback
   */
  stopAll() {
    // Stop browser speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Stop HTML5 audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    console.log('🔇 All audio stopped');
  }

  /**
   * Check if service is ready for use
   */
  isReady() {
    return this.isInitialized || 'speechSynthesis' in window;
  }

  /**
   * Get service status for debugging
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!this.apiKey,
      voiceId: this.voiceId,
      model: this.model,
      fallbackAvailable: 'speechSynthesis' in window,
      service: this.isInitialized ? 'ElevenLabs' : 'Browser Speech'
    };
  }

  /**
   * Test the service with a simple message
   */
  async test() {
    console.log('🧪 Testing ElevenLabs service...');
    const testMessage = "Hello! This is a test of the LeadFive voice system.";
    const result = await this.generateSpeech(testMessage);
    
    if (result.success) {
      console.log('✅ ElevenLabs test successful');
      result.play();
    } else {
      console.log('❌ ElevenLabs test failed');
    }
    
    return result;
  }
}

// Export singleton instance
export default new ElevenLabsService();
