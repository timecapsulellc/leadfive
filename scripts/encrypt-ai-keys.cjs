#!/usr/bin/env node

/**
 * 🔐 AI API Keys Encryption Script
 * Encrypts OpenAI and ElevenLabs API keys for secure storage
 * Similar to the deployer private key encryption system
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Generate encryption key from environment or create new one
function generateEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    return Buffer.from(envKey, 'hex');
  }
  
  // Generate new key
  const key = crypto.randomBytes(KEY_LENGTH);
  console.log('🔑 Generated new encryption key:', key.toString('hex'));
  console.log('⚠️  Save this key securely - you\'ll need it to decrypt!');
  return key;
}

// Encrypt API key
function encryptApiKey(apiKey, encryptionKey) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher(ALGORITHM, encryptionKey);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Combine IV + encrypted data + tag
  const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), tag]);
  return combined.toString('base64');
}

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

// Read current .env file
function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }
  return fs.readFileSync(envPath, 'utf8');
}

// Update .env file with encrypted keys
function updateEnvFile(envContent, encryptedOpenAI, encryptedElevenLabs) {
  let updatedContent = envContent;
  
  // Add encrypted OpenAI key
  if (encryptedOpenAI) {
    updatedContent += `\n# ==================== ENCRYPTED AI API KEYS ====================\n`;
    updatedContent += `# ⚠️ OpenAI API key is encrypted for security\n`;
    updatedContent += `VITE_OPENAI_API_KEY_ENCRYPTED=${encryptedOpenAI}\n`;
    updatedContent += `# Original VITE_OPENAI_API_KEY line removed for security\n\n`;
  }
  
  // Add encrypted ElevenLabs key
  if (encryptedElevenLabs) {
    updatedContent += `# ⚠️ ElevenLabs API key is encrypted for security\n`;
    updatedContent += `VITE_ELEVENLABS_API_KEY_ENCRYPTED=${encryptedElevenLabs}\n`;
    updatedContent += `# Original VITE_ELEVENLABS_API_KEY line removed for security\n\n`;
  }
  
  return updatedContent;
}

// Main encryption function
async function encryptAIKeys() {
  try {
    console.log('🔐 AI API Keys Encryption Tool');
    console.log('================================\n');
    
    // Read current environment
    const envContent = readEnvFile();
    
    // Extract current API keys from .env
    const openAIMatch = envContent.match(/VITE_OPENAI_API_KEY=(.+)/);
    const elevenLabsMatch = envContent.match(/VITE_ELEVENLABS_API_KEY=(.+)/);
    
    if (!openAIMatch && !elevenLabsMatch) {
      console.log('❌ No API keys found in .env file');
      console.log('Please add your API keys to .env first:');
      console.log('VITE_OPENAI_API_KEY=your_openai_key_here');
      console.log('VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here');
      return;
    }
    
    // Generate encryption key
    const encryptionKey = generateEncryptionKey();
    
    let encryptedOpenAI = null;
    let encryptedElevenLabs = null;
    
    // Encrypt OpenAI key
    if (openAIMatch) {
      const openAIKey = openAIMatch[1].trim();
      if (openAIKey && openAIKey !== 'your_openai_key_here') {
        encryptedOpenAI = encryptApiKey(openAIKey, encryptionKey);
        console.log('✅ OpenAI API key encrypted successfully');
      }
    }
    
    // Encrypt ElevenLabs key
    if (elevenLabsMatch) {
      const elevenLabsKey = elevenLabsMatch[1].trim();
      if (elevenLabsKey && elevenLabsKey !== 'your_elevenlabs_key_here') {
        encryptedElevenLabs = encryptApiKey(elevenLabsKey, encryptionKey);
        console.log('✅ ElevenLabs API key encrypted successfully');
      }
    }
    
    if (!encryptedOpenAI && !encryptedElevenLabs) {
      console.log('❌ No valid API keys found to encrypt');
      return;
    }
    
    // Update .env file
    const updatedEnv = updateEnvFile(envContent, encryptedOpenAI, encryptedElevenLabs);
    
    // Create backup
    const backupPath = `.env.backup-${Date.now()}`;
    fs.writeFileSync(backupPath, envContent);
    console.log(`📋 Backup created: ${backupPath}`);
    
    // Write updated .env
    fs.writeFileSync('.env', updatedEnv);
    console.log('✅ .env file updated with encrypted API keys');
    
    console.log('\n🔐 Encryption Summary:');
    console.log('======================');
    if (encryptedOpenAI) console.log('✅ OpenAI API key encrypted');
    if (encryptedElevenLabs) console.log('✅ ElevenLabs API key encrypted');
    
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('- Save the encryption key securely');
    console.log('- Original API keys have been removed from .env');
    console.log('- Use decrypt-ai-keys.cjs to decrypt when needed');
    console.log('- Never commit the encryption key to version control');
    
  } catch (error) {
    console.error('❌ Encryption failed:', error.message);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'decrypt') {
    // Decrypt mode for testing
    const encryptedKey = process.argv[3];
    const encryptionKeyHex = process.argv[4];
    
    if (!encryptedKey || !encryptionKeyHex) {
      console.log('Usage: node encrypt-ai-keys.cjs decrypt <encrypted_key> <encryption_key_hex>');
      process.exit(1);
    }
    
    try {
      const encryptionKey = Buffer.from(encryptionKeyHex, 'hex');
      const decrypted = decryptApiKey(encryptedKey, encryptionKey);
      console.log('Decrypted key:', decrypted);
    } catch (error) {
      console.error('Decryption failed:', error.message);
    }
  } else {
    // Default encrypt mode
    encryptAIKeys();
  }
}

module.exports = {
  encryptApiKey,
  decryptApiKey,
  generateEncryptionKey
};
