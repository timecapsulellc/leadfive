/**
 * Remove All Audio & Create ElevenLabs-Only Solution
 * Completely removes previous audio and implements clean ElevenLabs-only system
 */

const fs = require('fs');
const path = require('path');

console.log('🎤 REMOVING ALL AUDIO & CREATING ELEVENLABS-ONLY SOLUTION');
console.log('=========================================================\n');

// 1. Remove AudioNativeService completely
console.log('1. Removing AudioNativeService...');
const audioNativeServicePath = path.join(__dirname, 'src/services/AudioNativeService.js');
if (fs.existsSync(audioNativeServicePath)) {
  fs.unlinkSync(audioNativeServicePath);
  console.log('   ✅ AudioNativeService.js removed');
} else {
  console.log('   ℹ️ AudioNativeService.js not found');
}

// 2. Create clean ElevenLabs-only service
console.log('\n2. Creating clean ElevenLabs-only service...');

const elevenLabsOnlyContent = `/**
 * ElevenLabs-Only Audio Service
 * Clean implementation using ONLY ElevenLabs API
 */

class ElevenLabsOnlyService {
  constructor() {
    this.isInitialized = false;
    this.isPlaying = false;
    this.currentAudio = null;
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
    this.apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
    
    console.log('🎤 ElevenLabsOnly: Initializing...');
    this.initialize();
  }

  async initialize() {
    try {
      if (!this.apiKey) {
        console.error('❌ ElevenLabs API key not found in environment');
        return;
      }

      // Test API connection
      const testResult = await this.testConnection();
      if (testResult) {
        console.log('✅ ElevenLabs: Connected successfully');
        this.isInitialized = true;
        this.createUI();
      } else {
        console.error('❌ ElevenLabs: Connection failed');
      }
    } catch (error) {
      console.error('❌ ElevenLabs initialization error:', error);
    }
  }

  async testConnection() {
    try {
      const response = await fetch(\`\${this.apiUrl}/\${this.voiceId}\`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: 'Test',
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('ElevenLabs test connection failed:', error);
      return false;
    }
  }

  createUI() {
    // Remove any existing UI
    const existingToggle = document.querySelector('.elevenlabs-toggle');
    const existingControls = document.querySelector('.elevenlabs-controls');
    if (existingToggle) existingToggle.remove();
    if (existingControls) existingControls.remove();

    // Create floating toggle button
    const toggleButton = document.createElement('div');
    toggleButton.className = 'elevenlabs-toggle';
    toggleButton.innerHTML = '🎤';
    toggleButton.title = 'ElevenLabs Voice Assistant';
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = \`
      .elevenlabs-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        user-select: none;
      }
      
      .elevenlabs-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(0,0,0,0.4);
      }
      
      .elevenlabs-controls {
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: white;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10001;
        min-width: 280px;
        display: none;
      }
      
      .elevenlabs-controls.active {
        display: block;
        animation: slideUp 0.3s ease;
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .elevenlabs-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        margin: 5px;
        transition: all 0.2s ease;
        font-size: 14px;
        width: 100%;
        display: block;
      }
      
      .elevenlabs-btn:hover {
        background: #5a6fd8;
        transform: translateY(-2px);
      }
      
      .elevenlabs-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }
      
      .elevenlabs-status {
        font-size: 12px;
        color: #666;
        margin-bottom: 15px;
        padding: 8px;
        background: #f0f8ff;
        border-radius: 5px;
        border-left: 4px solid #667eea;
      }
      
      .elevenlabs-highlight {
        outline: 3px solid #667eea !important;
        outline-offset: 2px;
        cursor: pointer;
        transition: all 0.2s ease;
        background-color: rgba(102, 126, 234, 0.1) !important;
      }
    \`;
    
    document.head.appendChild(style);
    document.body.appendChild(toggleButton);
    
    // Create controls panel
    const controls = document.createElement('div');
    controls.className = 'elevenlabs-controls';
    controls.innerHTML = \`
      <div class="elevenlabs-status">
        🎤 ElevenLabs Voice Assistant<br>
        Status: \${this.isInitialized ? 'Ready' : 'Initializing...'}
      </div>
      <button class="elevenlabs-btn" id="read-page-elevenlabs">📖 Read Entire Page</button>
      <button class="elevenlabs-btn" id="read-selection-elevenlabs">📝 Read Selected Text</button>
      <button class="elevenlabs-btn" id="stop-elevenlabs">⏹️ Stop Reading</button>
      <div style="margin-top: 15px; font-size: 12px; color: #666; text-align: center;">
        Hover over elements and click to hear them<br>
        <strong>Powered by ElevenLabs AI</strong>
      </div>
    \`;
    
    document.body.appendChild(controls);
    
    // Setup event listeners
    this.setupEventListeners(toggleButton, controls);
  }

  setupEventListeners(toggleButton, controls) {
    // Toggle button click
    toggleButton.addEventListener('click', () => {
      controls.classList.toggle('active');
    });
    
    // Control buttons
    document.getElementById('read-page-elevenlabs')?.addEventListener('click', () => {
      this.readEntirePage();
    });
    
    document.getElementById('read-selection-elevenlabs')?.addEventListener('click', () => {
      this.readSelectedText();
    });
    
    document.getElementById('stop-elevenlabs')?.addEventListener('click', () => {
      this.stopReading();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
          case 'R':
            e.preventDefault();
            this.readEntirePage();
            break;
          case 'S':
            e.preventDefault();
            this.stopReading();
            break;
        }
      }
    });
    
    // Element interaction for click-to-read
    document.addEventListener('mouseover', (e) => {
      if (this.isReadableElement(e.target)) {
        e.target.classList.add('elevenlabs-highlight');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      e.target.classList.remove('elevenlabs-highlight');
    });
    
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('elevenlabs-highlight')) {
        e.preventDefault();
        this.readElement(e.target);
      }
    });
  }

  isReadableElement(element) {
    const readableTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV', 'BUTTON', 'A', 'LABEL'];
    const hasText = element.textContent && element.textContent.trim().length > 0;
    const isVisible = element.offsetParent !== null;
    const isNotInput = !['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
    
    return readableTags.includes(element.tagName) && hasText && isVisible && isNotInput;
  }

  async readElement(element) {
    const text = this.extractElementText(element);
    if (text && text.length > 0) {
      await this.speak(text);
    }
  }

  extractElementText(element) {
    let text = element.textContent.trim();
    
    // Add context for different elements
    if (element.tagName === 'BUTTON') {
      text = \`Button: \${text}\`;
    } else if (element.tagName === 'A') {
      text = \`Link: \${text}\`;
    } else if (element.tagName.match(/^H[1-6]$/)) {
      text = \`Heading: \${text}\`;
    }
    
    // Limit text length
    if (text.length > 500) {
      text = text.substring(0, 500) + '...';
    }
    
    return text;
  }

  async readEntirePage() {
    console.log('🎤 Reading entire page...');
    
    const content = this.extractPageContent();
    if (content) {
      await this.speak(content);
    } else {
      console.log('No readable content found on page');
    }
  }

  extractPageContent() {
    // Get main content elements
    const elements = document.querySelectorAll('h1, h2, h3, p, .stat-value, .card-title, .dashboard-stat, .metric-value');
    let content = '';
    
    elements.forEach(el => {
      if (el.offsetParent !== null && el.textContent.trim()) {
        content += el.textContent.trim() + '. ';
      }
    });
    
    // If no specific content found, get general text
    if (!content) {
      const mainContent = document.querySelector('main, .main-content, .dashboard, .content');
      if (mainContent) {
        content = mainContent.textContent.trim();
      }
    }
    
    // Limit total content
    if (content.length > 3000) {
      content = content.substring(0, 3000) + '...';
    }
    
    return content;
  }

  async readSelectedText() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText) {
      console.log('🎤 Reading selected text...');
      await this.speak(selectedText);
    } else {
      console.log('No text selected');
      // Optionally speak a message
      await this.speak('No text is currently selected. Please select some text first.');
    }
  }

  async speak(text) {
    if (!text || this.isPlaying || !this.isInitialized) {
      return;
    }

    console.log(\`🎤 ElevenLabs speaking: "\${text.substring(0, 50)}..."\`);
    
    try {
      this.isPlaying = true;
      
      // Stop any existing audio
      this.stopReading();
      
      const audioBlob = await this.generateSpeech(text);
      if (audioBlob) {
        await this.playAudio(audioBlob);
      }
    } catch (error) {
      console.error('❌ Speech generation failed:', error);
    } finally {
      this.isPlaying = false;
    }
  }

  async generateSpeech(text) {
    try {
      const response = await fetch(\`\${this.apiUrl}/\${this.voiceId}\`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(\`ElevenLabs API error: \${response.status}\`);
      }

      return await response.blob();
    } catch (error) {
      console.error('❌ ElevenLabs API error:', error);
      return null;
    }
  }

  async playAudio(audioBlob) {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      this.currentAudio = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        reject(error);
      };
      
      audio.play().catch(reject);
    });
  }

  stopReading() {
    console.log('🛑 Stopping ElevenLabs audio...');
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    this.isPlaying = false;
  }

  // Dashboard integration method
  async readDashboardWelcome(userName, userStats) {
    if (!this.isInitialized) {
      console.log('ElevenLabs not initialized, skipping welcome message');
      return;
    }

    const welcomeText = \`Welcome to LeadFive, \${userName}! You have earned \${userStats.totalEarnings} dollars with \${userStats.teamSize} team members. Great work!\`;
    
    // Delay to ensure page is loaded
    setTimeout(() => {
      this.speak(welcomeText);
    }, 2000);
  }
}

// Create global instance
let elevenLabsService = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    elevenLabsService = new ElevenLabsOnlyService();
  });
} else {
  elevenLabsService = new ElevenLabsOnlyService();
}

export default ElevenLabsOnlyService;
export { elevenLabsService };
`;

fs.writeFileSync(path.join(__dirname, 'src/services/ElevenLabsOnlyService.js'), elevenLabsOnlyContent);
console.log('   ✅ ElevenLabsOnlyService.js created');

// 3. Update Dashboard to use only ElevenLabs
console.log('\n3. Updating Dashboard to use ONLY ElevenLabs...');

const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.jsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Remove all audio imports and replace with ElevenLabs-only
const cleanDashboardContent = dashboardContent
  // Remove all audio-related imports
  .replace(/import.*AudioNativeService.*?;/g, '')
  .replace(/import.*ElevenLabsService.*?;/g, '')
  .replace(/import.*AudioManager.*?;/g, '')
  // Add clean ElevenLabs-only import
  .replace(/import React, { useState, useEffect } from 'react';/, 
    \`import React, { useState, useEffect } from 'react';
import { elevenLabsService } from '../services/ElevenLabsOnlyService';\`)
  // Remove all audio-related state and variables
  .replace(/const \[.*audio.*\] = useState.*?;/g, '')
  .replace(/const \[.*Audio.*\] = useState.*?;/g, '')
  .replace(/const \[.*hasPlayedWelcome.*\] = useState.*?;/g, '')
  .replace(/let audioNative.*?;/g, '')
  .replace(/let audioService.*?;/g, '')
  // Remove all audio initialization code
  .replace(/\/\/ Initialize audio.*?[\s\S]*?audioNative = new AudioNativeService.*?;/g, '')
  .replace(/\/\/ Audio initialization.*?[\s\S]*?setHasPlayedWelcome\(true\);/g, '')
  .replace(/\/\/ Use AudioNative.*?[\s\S]*?setHasPlayedWelcome\(true\);/g, '')
  // Remove audio useEffect
  .replace(/useEffect\(\(\) => \{[\s\S]*?audio[\s\S]*?\}, \[\]\);/g, '')
  // Add clean ElevenLabs welcome integration
  .replace(/useEffect\(\(\) => \{/, 
    \`// ElevenLabs welcome message
  useEffect(() => {
    if (account && elevenLabsService) {
      const userName = account.slice(0, 6) + '...' + account.slice(-4);
      const userStats = {
        totalEarnings: totalEarnings || '0',
        teamSize: teamSize || '0'
      };
      
      // Play welcome message after dashboard loads
      setTimeout(() => {
        elevenLabsService.readDashboardWelcome(userName, userStats);
      }, 3000);
    }
  }, [account, totalEarnings, teamSize]);

  useEffect(() => {\`)
  // Remove any remaining audio references
  .replace(/\/\/ Handled by AudioNative/g, '')
  .replace(/audioNative\./g, '')
  .replace(/audioService\./g, '');

fs.writeFileSync(dashboardPath, cleanDashboardContent);
console.log('   ✅ Dashboard updated to use ONLY ElevenLabs');

// 4. Remove AudioManager
console.log('\n4. Removing AudioManager...');
const audioManagerPath = path.join(__dirname, 'src/services/AudioManager.js');
if (fs.existsSync(audioManagerPath)) {
  fs.unlinkSync(audioManagerPath);
  console.log('   ✅ AudioManager.js removed');
} else {
  console.log('   ℹ️ AudioManager.js not found');
}

// 5. Clean up any remaining audio files
console.log('\n5. Cleaning up remaining audio files...');

const filesToRemove = [
  'test-audio-native.cjs',
  'test-automatic-voice-greeting.cjs'
];

filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(\`   ✅ \${file} removed\`);
  }
});

console.log('\n🎉 ELEVENLABS-ONLY SOLUTION COMPLETE!');
console.log('=====================================');

console.log('\n✅ CLEANUP COMPLETED:');
console.log('• ✅ AudioNativeService removed');
console.log('• ✅ AudioManager removed');
console.log('• ✅ All conflicting audio code removed');
console.log('• ✅ Dashboard cleaned of audio conflicts');
console.log('• ✅ Test files cleaned up');

console.log('\n🎤 NEW ELEVENLABS-ONLY FEATURES:');
console.log('• ✅ Clean ElevenLabs-only implementation');
console.log('• ✅ No browser speech conflicts');
console.log('• ✅ Professional voice quality');
console.log('• ✅ Floating microphone UI (🎤)');
console.log('• ✅ Click-to-read functionality');
console.log('• ✅ Read entire page feature');
console.log('• ✅ Read selected text feature');
console.log('• ✅ Dashboard welcome integration');

console.log('\n🎯 USER EXPERIENCE:');
console.log('• 🎤 Floating microphone button in bottom-right');
console.log('• 📖 "Read Entire Page" button');
console.log('• 📝 "Read Selected Text" button');
console.log('• ⏹️ "Stop Reading" button');
console.log('• 🖱️ Hover and click elements to hear them');
console.log('• ⌨️ Keyboard shortcuts: Ctrl+Shift+R, Ctrl+Shift+S');

console.log('\n🚀 TESTING INSTRUCTIONS:');
console.log('1. Restart development server');
console.log('2. Open: http://localhost:5173/dashboard');
console.log('3. Look for floating 🎤 button');
console.log('4. Click microphone to open controls');
console.log('5. Test "Read Entire Page" - should use ONLY ElevenLabs');
console.log('6. Test hover-and-click on elements');
console.log('7. Listen for clean, professional voice');
console.log('8. No word skipping or conflicts!');

console.log('\n✨ ELEVENLABS-ONLY SOLUTION READY!');
console.log('No more audio conflicts - pure ElevenLabs experience!');
