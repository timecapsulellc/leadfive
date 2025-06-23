#!/usr/bin/env node

/**
 * 🔓 AI API Keys Decryption Script
 * Decrypts OpenAI and ElevenLabs API keys for runtime use
 * Used by AI services to securely access encrypted API keys
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Encryption configuration (must match encrypt-ai-keys.cjs)
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Decrypt API key
function decryptApiKey(encryptedData, encryptionKey) {
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    
    const iv = combined.slice(0, IV_LENGTH);
    const tag = combined.slice(-TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH, -TAG_LENGTH);
    
    const decipher = crypto.createDecipher(ALGORITHM, encryptionKey);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt API key: ' + error.message);
  }
}

// Get encryption key from environment or prompt
function getEncryptionKey() {
  // Try environment variable first
  const envKey = process.env.AI_ENCRYPTION_KEY;
  if (envKey) {
    return Buffer.from(envKey, 'hex');
  }
  
  // For development, try a default key (not secure for production)
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Using development encryption key - not secure for production!');
    return crypto.createHash('sha256').update('leadfive-ai-dev-key').digest();
  }
  
  throw new Error('AI_ENCRYPTION_KEY environment variable not set');
}

// Read .env file and extract encrypted keys
function getEncryptedKeys() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const openAIMatch = envContent.match(/VITE_OPENAI_API_KEY_ENCRYPTED=(.+)/);
  const elevenLabsMatch = envContent.match(/VITE_ELEVENLABS_API_KEY_ENCRYPTED=(.+)/);
  
  return {
    openAI: openAIMatch ? openAIMatch[1].trim() : null,
    elevenLabs: elevenLabsMatch ? elevenLabsMatch[1].trim() : null
  };
}

// Decrypt all AI keys
function decryptAIKeys() {
  try {
    const encryptionKey = getEncryptionKey();
    const encryptedKeys = getEncryptedKeys();
    
    const decryptedKeys = {};
    
    if (encryptedKeys.openAI) {
      decryptedKeys.openAI = decryptApiKey(encryptedKeys.openAI, encryptionKey);
    }
    
    if (encryptedKeys.elevenLabs) {
      decryptedKeys.elevenLabs = decryptApiKey(encryptedKeys.elevenLabs, encryptionKey);
    }
    
    return decryptedKeys;
  } catch (error) {
    console.error('❌ Failed to decrypt AI keys:', error.message);
    return null;
  }
}

// Secure key access for AI services
function getDecryptedKey(service) {
  try {
    const keys = decryptAIKeys();
    if (!keys) return null;
    
    switch (service.toLowerCase()) {
      case 'openai':
        return keys.openAI;
      case 'elevenlabs':
        return keys.elevenLabs;
      default:
        throw new Error(`Unknown AI service: ${service}`);
    }
  } catch (error) {
    console.error(`❌ Failed to get ${service} key:`, error.message);
    return null;
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test') {
    // Test decryption
    console.log('🔓 Testing AI Keys Decryption');
    console.log('==============================\n');
    
    const keys = decryptAIKeys();
    if (keys) {
      console.log('✅ Decryption successful!');
      if (keys.openAI) {
        console.log('✅ OpenAI key decrypted (length:', keys.openAI.length, ')');
      }
      if (keys.elevenLabs) {
        console.log('✅ ElevenLabs key decrypted (length:', keys.elevenLabs.length, ')');
      }
    } else {
      console.log('❌ Decryption failed');
      process.exit(1);
    }
  } else if (command === 'openai') {
    // Get OpenAI key
    const key = getDecryptedKey('openai');
    if (key) {
      console.log(key);
    } else {
      process.exit(1);
    }
  } else if (command === 'elevenlabs') {
    // Get ElevenLabs key
    const key = getDecryptedKey('elevenlabs');
    if (key) {
      console.log(key);
    } else {
      process.exit(1);
    }
  } else {
    console.log('🔓 AI Keys Decryption Tool');
    console.log('Usage:');
    console.log('  node decrypt-ai-keys.cjs test        - Test decryption');
    console.log('  node decrypt-ai-keys.cjs openai      - Get OpenAI key');
    console.log('  node decrypt-ai-keys.cjs elevenlabs  - Get ElevenLabs key');
  }
}

module.exports = {
  decryptApiKey,
  decryptAIKeys,
  getDecryptedKey
};
