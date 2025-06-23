#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎤 ElevenLabs API Key Test');
console.log('=========================\n');

// Read environment variables
const envPath = '.env';
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

// Extract ElevenLabs configuration
let elevenLabsApiKey = '';
let elevenLabsVoiceId = '';
let elevenLabsModel = '';

envLines.forEach(line => {
  if (line.startsWith('VITE_ELEVENLABS_API_KEY=')) {
    elevenLabsApiKey = line.split('=')[1];
  }
  if (line.startsWith('VITE_ELEVENLABS_VOICE_ID=')) {
    elevenLabsVoiceId = line.split('=')[1];
  }
  if (line.startsWith('VITE_ELEVENLABS_MODEL=')) {
    elevenLabsModel = line.split('=')[1];
  }
});

console.log('📋 Configuration Check:');
console.log('=======================');
console.log(`API Key: ${elevenLabsApiKey ? '✅ Found' : '❌ Missing'}`);
console.log(`Voice ID: ${elevenLabsVoiceId || 'Not set'}`);
console.log(`Model: ${elevenLabsModel || 'Not set'}`);
console.log('');

// Validate API key format
console.log('🔍 API Key Validation:');
console.log('======================');

if (!elevenLabsApiKey) {
  console.log('❌ No ElevenLabs API key found in .env file');
  process.exit(1);
}

// Check if it's a valid ElevenLabs API key format
const isValidElevenLabsKey = elevenLabsApiKey.startsWith('sk_') && elevenLabsApiKey.length > 10;
const isOpenAIKey = elevenLabsApiKey.startsWith('sk-proj-');

if (isOpenAIKey) {
  console.log('❌ WRONG: This appears to be an OpenAI API key');
  console.log('   ElevenLabs keys start with "sk_" not "sk-proj-"');
  console.log('   Please update your .env file with a real ElevenLabs API key');
  process.exit(1);
}

if (!isValidElevenLabsKey) {
  console.log('❌ INVALID: API key format doesn\'t match ElevenLabs pattern');
  console.log('   Expected format: sk_xxxxxxxxxxxxxxxxx');
  console.log('   Your key:', elevenLabsApiKey.substring(0, 10) + '...');
  process.exit(1);
}

console.log('✅ API key format looks correct');
console.log(`   Key prefix: ${elevenLabsApiKey.substring(0, 10)}...`);
console.log('');

// Test API connection
console.log('🌐 Testing API Connection:');
console.log('==========================');

async function testElevenLabsAPI() {
  try {
    console.log('📡 Connecting to ElevenLabs API...');
    
    const fetch = (await import('node-fetch')).default;
    
    // Test with voices endpoint (doesn't consume credits)
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': elevenLabsApiKey
      }
    });

    if (response.status === 401) {
      console.log('❌ AUTHENTICATION FAILED');
      console.log('   Your API key is invalid or expired');
      console.log('   Please check your ElevenLabs dashboard and update the key');
      return false;
    }

    if (response.status === 429) {
      console.log('⚠️  RATE LIMITED');
      console.log('   Too many requests. API key is valid but rate limited');
      return true;
    }

    if (!response.ok) {
      console.log(`❌ API ERROR: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ API CONNECTION SUCCESSFUL!');
    console.log(`   Found ${data.voices.length} available voices`);
    
    // Check if the configured voice ID exists
    if (elevenLabsVoiceId) {
      const voiceExists = data.voices.find(voice => voice.voice_id === elevenLabsVoiceId);
      if (voiceExists) {
        console.log(`✅ Voice ID "${elevenLabsVoiceId}" found: ${voiceExists.name}`);
      } else {
        console.log(`⚠️  Voice ID "${elevenLabsVoiceId}" not found in your account`);
        console.log('   Available voices:');
        data.voices.slice(0, 5).forEach(voice => {
          console.log(`   - ${voice.name} (${voice.voice_id})`);
        });
      }
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ CONNECTION ERROR:', error.message);
    return false;
  }
}

// Test speech generation (small test)
async function testSpeechGeneration() {
  try {
    console.log('\n🎵 Testing Speech Generation:');
    console.log('=============================');
    console.log('📡 Generating test speech...');
    
    const fetch = (await import('node-fetch')).default;
    
    const voiceId = elevenLabsVoiceId || '6F5Zhi321D3Oq7v1oNT4';
    const testText = 'Hello from LeadFive!';
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text: testText,
        model_id: elevenLabsModel || 'eleven_multilingual_v3',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    if (response.status === 401) {
      console.log('❌ AUTHENTICATION FAILED during speech generation');
      return false;
    }

    if (response.status === 422) {
      console.log('❌ INVALID VOICE ID or MODEL');
      console.log('   Check your voice ID and model configuration');
      return false;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ SPEECH GENERATION ERROR: ${response.status}`);
      console.log(`   ${errorText}`);
      return false;
    }

    const audioBuffer = await response.buffer();
    console.log('✅ SPEECH GENERATION SUCCESSFUL!');
    console.log(`   Generated ${audioBuffer.length} bytes of audio`);
    console.log(`   Voice: ${voiceId}`);
    console.log(`   Model: ${elevenLabsModel || 'eleven_multilingual_v3'}`);
    
    return true;
    
  } catch (error) {
    console.log('❌ SPEECH GENERATION ERROR:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const apiTest = await testElevenLabsAPI();
  
  if (apiTest) {
    const speechTest = await testSpeechGeneration();
    
    console.log('\n🎯 Final Results:');
    console.log('=================');
    
    if (speechTest) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Your ElevenLabs API is fully functional');
      console.log('✅ Voice greetings will work perfectly');
      console.log('');
      console.log('🚀 Your LeadFive dashboard is ready for voice-enhanced user experience!');
    } else {
      console.log('⚠️  API connection works but speech generation failed');
      console.log('   Check your voice ID and model configuration');
    }
  } else {
    console.log('\n❌ API TEST FAILED');
    console.log('   Please check your ElevenLabs API key and try again');
  }
}

// Check if node-fetch is available
async function checkDependencies() {
  try {
    await import('node-fetch');
    runTests();
  } catch (error) {
    console.log('📦 Installing node-fetch for testing...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install node-fetch@2', { stdio: 'inherit' });
      console.log('✅ node-fetch installed successfully');
      runTests();
    } catch (installError) {
      console.log('❌ Failed to install node-fetch');
      console.log('   Please run: npm install node-fetch@2');
      console.log('   Then run this test again');
    }
  }
}

checkDependencies();
