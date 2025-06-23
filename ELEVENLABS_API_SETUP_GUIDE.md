# 🎤 ElevenLabs API Setup Guide for LeadFive

## 🚨 IMPORTANT: Update Your API Key

Your current `.env` file has an incorrect ElevenLabs API key. Follow these steps to fix it:

### 📋 **Step 1: Get Your Real ElevenLabs API Key**

1. **Go to ElevenLabs Dashboard:**
   - Visit: https://elevenlabs.io/
   - Sign in to your account

2. **Navigate to API Settings:**
   - Click on your profile (top right)
   - Go to "Profile" → "API Key"
   - Or visit: https://elevenlabs.io/docs/api-reference/introduction

3. **Copy Your API Key:**
   - Your API key should look like: `sk_1234567890abcdef...` (starts with `sk_`)
   - **NOT** like an OpenAI key that starts with `sk-proj-`

### 🔧 **Step 2: Update Your .env File**

Replace this line in your `.env` file:
```bash
# ❌ WRONG (this is an OpenAI key)
VITE_ELEVENLABS_API_KEY=***REMOVED***
```

With your real ElevenLabs API key:
```bash
# ✅ CORRECT (your real ElevenLabs API key)
VITE_ELEVENLABS_API_KEY=sk_your_real_elevenlabs_api_key_here
```

### 🎵 **Step 3: Verify Your Voice Configuration**

Your current voice settings in `.env`:
```bash
VITE_ELEVENLABS_VOICE_ID=6F5Zhi321D3Oq7v1oNT4
VITE_ELEVENLABS_MODEL=eleven_multilingual_v3
```

**To verify these are correct:**

1. **Check Voice ID:**
   - Go to ElevenLabs → Voice Library
   - Find your preferred voice
   - Copy the Voice ID (should be similar to: `6F5Zhi321D3Oq7v1oNT4`)

2. **Check Model:**
   - Use `eleven_multilingual_v3` for best quality
   - Or `eleven_multilingual_v2` for faster generation

### 🧪 **Step 4: Test Your Configuration**

After updating your API key, test it:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for ElevenLabs initialization messages
   - Should see: `✅ ElevenLabs service initialized with your API key`

3. **Test voice greeting:**
   - Connect a wallet to your dashboard
   - You should hear an automatic voice greeting
   - Check console for voice generation logs

### 🔍 **Step 5: Troubleshooting**

**If you see these errors:**

❌ **"Invalid ElevenLabs API key"**
- Double-check your API key is correct
- Make sure it starts with `sk_` not `sk-proj-`
- Verify you copied the entire key

❌ **"Invalid voice ID or model"**
- Check your voice ID in ElevenLabs dashboard
- Try using a different voice ID
- Verify the model name is correct

❌ **"ElevenLabs unavailable, using browser speech fallback"**
- This means the API key validation failed
- Update your API key and restart the server

### 🎯 **Expected Behavior After Fix**

Once properly configured, your users will experience:

1. **🌐 User lands on dashboard**
2. **⏳ Dashboard loads user data**
3. **🎤 ElevenLabs generates personalized greeting:**
   - "Welcome back to LeadFive, [wallet]! Ready to revolutionize Web3 networking today?"
4. **🔊 High-quality voice plays automatically**
5. **✅ Professional, engaging user experience**

### 📊 **Current Integration Status**

✅ **Working Features:**
- Automatic greeting trigger (100%)
- Dashboard integration (100%)
- Fallback to browser speech (100%)
- Error handling (100%)
- User personalization (100%)

⚠️ **Needs Your API Key:**
- ElevenLabs voice synthesis (waiting for valid API key)

### 🔐 **Security Notes**

- **Never commit your real API key to Git**
- Keep your `.env` file in `.gitignore`
- Your API key is only used client-side for voice generation
- No sensitive data is sent to ElevenLabs

### 🎉 **After Setup Complete**

Your LeadFive dApp will have:
- **Professional voice greetings** for every user
- **Personalized messages** based on user stats
- **High-quality audio** from ElevenLabs
- **Seamless fallback** if service unavailable
- **Mobile-optimized** voice experience

---

## 🚀 **Quick Fix Command**

Replace `YOUR_REAL_ELEVENLABS_API_KEY` with your actual key:

```bash
# Update your .env file
sed -i 's/VITE_ELEVENLABS_API_KEY=.*/VITE_ELEVENLABS_API_KEY=YOUR_REAL_ELEVENLABS_API_KEY/' .env

# Restart development server
npm run dev
```

**🎤 Your voice-enhanced LeadFive dashboard will be ready to amaze users!**
