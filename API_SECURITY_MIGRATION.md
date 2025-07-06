# 🔐 API Security Migration Guide

**Date**: July 6, 2025  
**Priority**: CRITICAL - Immediate Action Required  
**Impact**: Prevents API key theft and unauthorized usage  

---

## 🚨 CRITICAL SECURITY ISSUE FIXED

### What Was Wrong
- OpenAI API key exposed in frontend code
- ElevenLabs API key exposed in frontend code  
- `dangerouslyAllowBrowser: true` security vulnerability
- Anyone could steal API keys from browser DevTools

### What We Fixed
- Created secure backend proxy service
- Removed all API keys from frontend
- All API calls now route through secure endpoints
- API keys only exist on backend server

---

## 📋 IMMEDIATE ACTIONS REQUIRED

### 1. **Rotate All API Keys** (DO THIS NOW!)
```bash
# Go to each service and generate new API keys:
# - OpenAI: https://platform.openai.com/api-keys
# - ElevenLabs: https://elevenlabs.io/api-keys
# - CoinMarketCap: https://pro.coinmarketcap.com/account

# The old keys may have been compromised!
```

### 2. **Deploy Backend API Proxy**
You need to create a backend server with these endpoints:
```
POST /api/v1/ai/chat          # OpenAI chat completions
POST /api/v1/voice/synthesize # ElevenLabs voice synthesis  
GET  /api/v1/crypto/prices    # CoinMarketCap prices (optional)
```

### 3. **Backend Implementation Example**
```javascript
// backend/routes/ai.js
app.post('/api/v1/ai/chat', async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens } = req.body;
    
    // Use OpenAI SDK with server-side API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY // From backend .env
    });
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens
    });
    
    res.json({ content: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'AI service error' });
  }
});
```

### 4. **Update Frontend Environment**
Remove these from your `.env` file:
```bash
# REMOVE THESE LINES:
VITE_OPENAI_API_KEY=...
VITE_ELEVENLABS_API_KEY=...
```

Add backend URL:
```bash
VITE_API_BASE_URL=https://api.leadfive.com
```

---

## 🛠️ TECHNICAL CHANGES

### Files Modified
1. **`src/services/OpenAIService.js`**
   - Removed direct OpenAI SDK usage
   - Now uses secure proxy endpoints
   - No API keys in frontend

2. **`src/services/api/secureProxy.js`** (NEW)
   - Handles all API communications
   - Routes through backend endpoints
   - Centralized error handling

3. **`src/services/ElevenLabsSecureService.js`** (NEW)
   - Replaces direct ElevenLabs API calls
   - Uses secure proxy for voice synthesis
   - Fallback to browser speech synthesis

### Components to Update
Update imports in these files:
```javascript
// OLD:
import OpenAIService from './services/OpenAIService';
import elevenLabsService from './services/elevenLabsService';

// NEW:
import OpenAIService from './services/OpenAIService';
import elevenLabsService from './services/ElevenLabsSecureService';
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Deploy backend API proxy server
- [ ] Configure backend environment variables
- [ ] Rotate all API keys
- [ ] Update frontend to use new proxy endpoints
- [ ] Test all AI features work through proxy
- [ ] Remove old API keys from version control history
- [ ] Monitor for any unauthorized API usage

---

## 📊 SECURITY IMPROVEMENTS

### Before
- ❌ API keys visible in browser
- ❌ Anyone could steal and use keys
- ❌ No control over API usage
- ❌ Risk of unexpected charges

### After
- ✅ API keys secure on backend only
- ✅ Frontend has no sensitive data
- ✅ Full control over API usage
- ✅ Can add rate limiting and auth

---

## 🔍 TESTING

### Test Secure Proxy
```javascript
// Test in browser console
fetch('https://api.leadfive.com/api/v1/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'gpt-4o-mini',
    max_tokens: 50
  })
}).then(r => r.json()).then(console.log);
```

### Verify No API Keys
```bash
# Check for exposed keys in built files
npm run build
grep -r "sk-" dist/
grep -r "OPENAI" dist/
# Should return nothing
```

---

## ⚠️ IMPORTANT NOTES

1. **Never add API keys to frontend code**
2. **Always use backend proxy for sensitive APIs**
3. **Rotate keys immediately if exposed**
4. **Use environment variables only on backend**
5. **Implement rate limiting on proxy endpoints**

---

## 📞 NEED HELP?

If you need assistance implementing the backend proxy:
1. Use a simple Express.js server
2. Deploy to DigitalOcean App Platform
3. Or use Vercel/Netlify serverless functions

The security of your API keys is critical for preventing unauthorized usage and unexpected charges!

---

*Security fix implemented on July 6, 2025*