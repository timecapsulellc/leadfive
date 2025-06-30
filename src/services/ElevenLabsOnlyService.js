/**
 * ElevenLabs Service Stub
 * Placeholder service to prevent import errors
 */

class ElevenLabsService {
  constructor() {
    this.isInitialized = false;
    console.log('🎵 ElevenLabs service stub initialized');
  }

  readDashboardWelcome(userName, userStats) {
    console.log(`🎵 Would play welcome message for ${userName}:`, userStats);
    // Stub - would implement actual voice synthesis here
  }

  readText(text) {
    console.log('🎵 Would read text:', text);
    // Stub - would implement actual text-to-speech here
  }

  isReady() {
    return false; // Always return false for stub
  }

  getStatus() {
    return {
      initialized: false,
      hasApiKey: false,
      model: 'stub'
    };
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;
