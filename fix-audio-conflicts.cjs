/**
 * Audio Conflicts Diagnostic and Fix Script
 * Identifies and resolves audio conflicts in LeadFive dApp
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Audio Conflicts Diagnostic & Fix');
console.log('====================================\n');

// 1. Check for multiple audio implementations
console.log('1. Checking for Audio Implementation Conflicts:');

const audioFiles = [
  'src/services/ElevenLabsService.js',
  'src/services/AudioNativeService.js',
  'src/services/OpenAIService.js',
  'src/services/UnifiedChatbotService.js',
  'src/components/AICoachingPanel.jsx',
  'src/pages/Dashboard.jsx'
];

const conflicts = [];

audioFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for audio-related patterns
    const audioPatterns = [
      /speechSynthesis/g,
      /new Audio\(/g,
      /\.play\(\)/g,
      /\.speak\(/g,
      /ElevenLabs/g,
      /generateSpeech/g,
      /playAudio/g,
      /audioContext/g
    ];
    
    const foundPatterns = [];
    audioPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        foundPatterns.push({
          pattern: pattern.source,
          count: matches.length
        });
      }
    });
    
    if (foundPatterns.length > 0) {
      console.log(`   📄 ${file}:`);
      foundPatterns.forEach(p => {
        console.log(`      - ${p.pattern}: ${p.count} occurrences`);
      });
      
      conflicts.push({
        file,
        patterns: foundPatterns
      });
    }
  }
});

console.log('\n2. Audio Conflict Analysis:');
if (conflicts.length > 1) {
  console.log('   ⚠️  MULTIPLE AUDIO IMPLEMENTATIONS DETECTED');
  console.log('   This can cause audio conflicts and word skipping');
  
  conflicts.forEach(conflict => {
    console.log(`   - ${conflict.file} has ${conflict.patterns.length} audio patterns`);
  });
} else {
  console.log('   ✅ No major conflicts detected');
}

// 3. Check ElevenLabs configuration
console.log('\n3. ElevenLabs Configuration Check:');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasApiKey = envContent.includes('ELEVENLABS_API_KEY');
  const hasVoiceId = envContent.includes('ELEVENLABS_VOICE_ID');
  
  console.log(`   API Key: ${hasApiKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Voice ID: ${hasVoiceId ? '✅ Present' : '❌ Missing'}`);
  
  if (!hasApiKey || !hasVoiceId) {
    console.log('   ⚠️  ElevenLabs configuration incomplete');
  }
} else {
  console.log('   ❌ .env file not found');
}

// 4. Check for browser speech synthesis conflicts
console.log('\n4. Browser Speech Synthesis Conflicts:');

const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.jsx');
if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  const speechSynthesisCount = (dashboardContent.match(/speechSynthesis/g) || []).length;
  const elevenLabsCount = (dashboardContent.match(/ElevenLabs/g) || []).length;
  
  console.log(`   Browser Speech Synthesis calls: ${speechSynthesisCount}`);
  console.log(`   ElevenLabs calls: ${elevenLabsCount}`);
  
  if (speechSynthesisCount > 0 && elevenLabsCount > 0) {
    console.log('   ⚠️  CONFLICT: Both browser speech and ElevenLabs active');
    console.log('   This causes audio overlapping and word skipping');
  }
}

// 5. Recommendations
console.log('\n5. Fix Recommendations:');
console.log('========================');

console.log('\n🔧 IMMEDIATE FIXES NEEDED:');
console.log('1. Disable browser speechSynthesis when ElevenLabs is available');
console.log('2. Implement proper audio queue management');
console.log('3. Add audio conflict detection');
console.log('4. Fix ElevenLabs API configuration');
console.log('5. Remove duplicate audio initialization');

console.log('\n🎯 PRIORITY ACTIONS:');
console.log('1. Update AudioNativeService to prioritize ElevenLabs');
console.log('2. Add audio state management');
console.log('3. Implement proper error handling');
console.log('4. Add audio debugging tools');

console.log('\n📋 TESTING CHECKLIST:');
console.log('□ ElevenLabs API key is valid');
console.log('□ Only one audio service active at a time');
console.log('□ No overlapping audio playback');
console.log('□ Proper error fallbacks');
console.log('□ Audio queue management working');

console.log('\n🚀 Next Steps:');
console.log('1. Run: node fix-elevenlabs-priority.cjs');
console.log('2. Test: node test-audio-isolation.cjs');
console.log('3. Verify: Check browser console for audio logs');
console.log('4. Validate: Test ElevenLabs API connection');

console.log('\n✅ AUDIO DIAGNOSTIC COMPLETE');
console.log('Ready to implement fixes...');
