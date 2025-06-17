class ElevenLabsService {
  constructor() {
    this.apiKey = null;
    this.isInitialized = false;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.defaultVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Bella - friendly female voice
    this.model = import.meta.env.VITE_ELEVENLABS_MODEL || 'eleven_multilingual_v2';
    this.voiceSettings = {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    };
    
    // Auto-initialize if environment variable is available
    this.autoInitialize();
  }

  // Auto-initialize from environment variables
  autoInitialize() {
    const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (envApiKey && envApiKey !== 'your-elevenlabs-key-here') {
      this.initialize(envApiKey);
    }
  }

  // Initialize ElevenLabs with API key
  initialize(apiKey) {
    if (!apiKey) {
      console.warn('ElevenLabs API key not provided - using browser speech synthesis fallback');
      return false;
    }

    this.apiKey = apiKey;
    this.isInitialized = true;
    console.log('✅ ElevenLabs service initialized successfully');
    return true;
  }

  // Generate speech from text
  async generateSpeech(text, voiceId = this.defaultVoiceId, options = {}) {
    if (!this.isInitialized) {
      return this.fallbackSpeech(text);
    }

    try {
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
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return {
        success: true,
        audioUrl: audioUrl,
        audioBlob: audioBlob,
        play: () => this.playAudio(audioUrl)
      };

    } catch (error) {
      console.error('ElevenLabs generation error:', error);
      return this.fallbackSpeech(text);
    }
  }

  // Play audio from URL
  async playAudio(audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      await audio.play();
      return audio;
    } catch (error) {
      console.error('Audio playback error:', error);
      return null;
    }
  }

  // Fallback to browser speech synthesis
  fallbackSpeech(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to use a female voice
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      return {
        success: true,
        audioUrl: null,
        audioBlob: null,
        play: () => {
          speechSynthesis.speak(utterance);
          return utterance;
        }
      };
    }

    return {
      success: false,
      audioUrl: null,
      audioBlob: null,
      play: () => null
    };
  }

  // Generate welcome greeting with personalization
  async generateWelcomeGreeting(userName, userStats = {}) {
    const greetings = [
      `Welcome back to ORPHI, ${userName}! Ready to revolutionize Web3 crowdfunding today?`,
      `Hey ${userName}! Your crypto success story is just beginning. Let's make it legendary!`,
      `${userName}, the blockchain revolution needs leaders like you. Ready to claim your spot?`,
      `Welcome to the future, ${userName}! ORPHI's AI is here to guide your Web3 journey.`,
      `${userName}, diamond hands incoming! Let's turn your vision into blockchain reality.`
    ];

    if (userStats.totalEarnings && parseFloat(userStats.totalEarnings) > 0) {
      greetings.push(
        `Amazing work, ${userName}! You've already earned $${userStats.totalEarnings}. Ready for your next milestone?`,
        `${userName}, you're crushing it with $${userStats.totalEarnings} earned! The top 10% awaits you.`
      );
    }

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    return this.generateSpeech(greeting);
  }

  // Generate motivational messages based on context
  async generateMotivationalMessage(context = {}) {
    const { mood = 'neutral', achievement, timeOfDay } = context;
    
    let message = '';

    switch (mood) {
      case 'happy':
        message = "Love that energy! 🚀 You're in the perfect mindset to explore those high-ROI opportunities. The crypto gods are smiling!";
        break;
      case 'stressed':
        message = "Rough day? Remember, every crypto success story started with a challenge. Sarah Lee turned her worst day into a $23,500 win. Your turn!";
        break;
      case 'focused':
        message = "That focus is pure gold! 💎 This is exactly when the best investment decisions happen. The blockchain is calling your name!";
        break;
      case 'excited':
        message = "That excitement is contagious! ⚡ Channel that energy into your next big move. The Web3 revolution needs leaders like you!";
        break;
      default:
        message = "Ready to turn potential into profit? 🔥 The top 10% of ORPHI users earn $15,000 monthly. Your breakthrough moment is now!";
    }

    if (achievement) {
      message = `Congratulations on ${achievement}! 🎉 You're building something incredible. Next stop: crypto success hall of fame!`;
    }

    return this.generateSpeech(message);
  }

  // Generate FOMO-driven announcements
  async generateFOMOAnnouncement(type, data = {}) {
    const announcements = {
      newUser: `Alert! Someone just joined ORPHI and claimed their spot in the Web3 revolution. Don't let opportunity slip away!`,
      bigInvestment: `Breaking: A user just invested $${data.amount || '5,000'}! The smart money is moving. Are you ready?`,
      achievement: `Success story alert! ${data.user || 'A member'} just hit $${data.earnings || '10,000'} in earnings. Your turn is coming!`,
      limitedTime: `Exclusive access closing in ${data.timeLeft || '24 hours'}! Only ${data.spotsLeft || '23'} spots remain for the elite tier.`,
      marketUpdate: `Market update: Web3 projects are up ${data.percentage || '127'}%! The revolution is accelerating. Don't miss out!`
    };

    const message = announcements[type] || announcements.marketUpdate;
    return this.generateSpeech(message, this.defaultVoiceId, {
      voiceSettings: {
        stability: 0.8,
        similarity_boost: 0.8,
        style: 0.7 // More dramatic for FOMO
      }
    });
  }

  // Get available voices
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
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      return this.getBrowserVoices();
    }
  }

  // Get browser speech synthesis voices
  getBrowserVoices() {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices().map(voice => ({
        voice_id: voice.voiceURI,
        name: voice.name,
        category: 'browser',
        preview_url: null
      }));
    }
    return [];
  }

  // Preload common phrases for faster playback
  async preloadCommonPhrases() {
    const phrases = [
      "Welcome to ORPHI!",
      "Great question!",
      "You're on fire!",
      "Diamond hands!",
      "To the moon!",
      "Blockchain revolution!"
    ];

    const preloadedAudio = {};
    
    for (const phrase of phrases) {
      try {
        const audio = await this.generateSpeech(phrase);
        if (audio.success) {
          preloadedAudio[phrase] = audio;
        }
      } catch (error) {
        console.warn(`Failed to preload phrase: ${phrase}`);
      }
    }

    this.preloadedAudio = preloadedAudio;
    return preloadedAudio;
  }

  // Quick play for common phrases
  async quickPlay(phrase) {
    if (this.preloadedAudio && this.preloadedAudio[phrase]) {
      return this.preloadedAudio[phrase].play();
    }
    
    const audio = await this.generateSpeech(phrase);
    return audio.play();
  }

  // Stop all audio
  stopAll() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Stop HTML5 audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // Check service status
  isReady() {
    return this.isInitialized || 'speechSynthesis' in window;
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!this.apiKey,
      fallbackAvailable: 'speechSynthesis' in window,
      service: this.isInitialized ? 'ElevenLabs' : 'Browser Speech'
    };
  }
}

// Export singleton instance
export default new ElevenLabsService(); 