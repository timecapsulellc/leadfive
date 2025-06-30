# 🚀 Production Environment Setup Guide
## LeadFive with ElevenLabs Conversational AI

### 🎯 **Current Status**

✅ **Application Deployed**: https://leadfive-app-3f8tb.ondigitalocean.app  
✅ **Repository Secured**: All API keys removed from git history  
✅ **Build Successful**: Application running on Digital Ocean App Platform  
⚠️ **Environment Variables Needed**: Production API keys must be configured  

---

## 🔐 **Required Environment Variables for Production**

The following environment variables need to be set in your Digital Ocean App Platform:

### 1. **ElevenLabs Conversational AI** (Primary)
```bash
VITE_ELEVENLABS_API_KEY=sk_your_real_elevenlabs_api_key_here
VITE_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
VITE_ELEVENLABS_VOICE_ID=6F5Zhi321D3Oq7v1oNT4
```

### 2. **OpenAI Integration** (Optional)
```bash
VITE_OPENAI_API_KEY=sk-proj-your_openai_key_if_needed
```

---

## 📋 **Digital Ocean Environment Configuration Steps**

### **Step 1: Access Your App Settings**

1. **Go to Digital Ocean Apps Dashboard:**
   - Login to: https://cloud.digitalocean.com/apps
   - Select your `leadfive-app` deployment

2. **Navigate to Settings:**
   - Click on your app name
   - Go to "Settings" tab
   - Click on "App-Level Environment Variables"

### **Step 2: Add Environment Variables**

**Add each variable individually:**

1. **Click "Edit"**
2. **Add New Variable:**
   - **Key**: `VITE_ELEVENLABS_API_KEY`
   - **Value**: Your ElevenLabs API key (starts with `sk_`)
   - **Encrypted**: ✅ Yes (recommended)

3. **Add Agent ID:**
   - **Key**: `VITE_ELEVENLABS_AGENT_ID`
   - **Value**: Your ElevenLabs Agent ID
   - **Encrypted**: ✅ Yes

4. **Add Voice ID:**
   - **Key**: `VITE_ELEVENLABS_VOICE_ID`
   - **Value**: `6F5Zhi321D3Oq7v1oNT4` (or your preferred voice)
   - **Encrypted**: ✅ Yes

5. **Save Changes**

### **Step 3: Trigger Deployment**

After adding environment variables:
1. **Click "Actions" → "Force Rebuild and Deploy"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Verify deployment** at your app URL

---

## 🎤 **Getting Your ElevenLabs Credentials**

### **A. ElevenLabs API Key**

1. **Go to ElevenLabs:**
   - Visit: https://elevenlabs.io/
   - Sign in to your account

2. **Get API Key:**
   - Click profile → "API Key"
   - Copy your key (starts with `sk_`)

### **B. ElevenLabs Agent ID**

1. **Create Conversational Agent:**
   - Go to: https://elevenlabs.io/app/conversational-ai
   - Click "Create Agent"

2. **Configure Agent:**
   - **Name**: LeadFive Assistant
   - **System Prompt**: Use the prompt from `LeadFiveConversationalAI.jsx`
   - **Voice**: Select your preferred voice
   - **Language**: English

3. **Save and Copy ID:**
   - Save your agent
   - Copy the Agent ID from the URL or settings

---

## 🧪 **Testing Production Configuration**

### **Step 1: Verify Environment Variables**

After deployment, test if variables are loaded:
1. **Open browser DevTools** on your live app
2. **Check console** for initialization messages
3. **Look for**: `✅ ElevenLabs service initialized`

### **Step 2: Test AI Assistant**

1. **Connect Wallet:**
   - Use MetaMask or WalletConnect
   - Connect to BSC network

2. **Test Voice Chat:**
   - Click "VOICE CHAT" button
   - Grant microphone permission
   - Speak to the AI assistant
   - Verify AI responds correctly

### **Step 3: Monitor Performance**

**Check Digital Ocean Logs:**
1. Go to your app dashboard
2. Click "Runtime Logs"
3. Monitor for any errors or warnings

---

## 🔍 **Troubleshooting Production Issues**

### **Common Issues:**

❌ **"ElevenLabs Agent ID not configured"**
- **Solution**: Add `VITE_ELEVENLABS_AGENT_ID` to environment variables
- **Check**: Variable name is exactly `VITE_ELEVENLABS_AGENT_ID`

❌ **"ElevenLabs API key not configured properly"**
- **Solution**: Add valid `VITE_ELEVENLABS_API_KEY`
- **Verify**: Key starts with `sk_` (not `sk-proj-`)

❌ **"Failed to start conversation"**
- **Check**: Agent ID exists in your ElevenLabs account
- **Verify**: API key has sufficient credits/quota

❌ **"Microphone permission denied"**
- **User Issue**: Ask users to grant microphone permission
- **Browser**: Some browsers block mic on non-HTTPS (yours is HTTPS ✅)

### **Performance Monitoring:**

**Digital Ocean Metrics:**
- Monitor CPU/Memory usage
- Check request response times
- Watch for error rates

**ElevenLabs Usage:**
- Monitor API quota usage
- Track conversation minutes
- Watch for rate limits

---

## 🚀 **Go-Live Checklist**

### **Pre-Launch:**
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] AI assistant tested
- [ ] Wallet connection verified
- [ ] BSC network integration tested
- [ ] Mobile responsiveness checked

### **Post-Launch:**
- [ ] Monitor error logs
- [ ] Track user engagement
- [ ] Monitor API usage
- [ ] Collect user feedback
- [ ] Plan feature updates

---

## 📊 **Expected Production Behavior**

### **User Journey:**
1. **🌐 User visits**: https://leadfive-app-3f8tb.ondigitalocean.app
2. **🔗 Connects wallet** (MetaMask/WalletConnect)
3. **📊 Views dashboard** with earnings/team data
4. **🎤 Clicks "VOICE CHAT"** to activate AI
5. **🤖 AI responds** to voice questions about LeadFive
6. **💼 User manages** their network and earnings

### **AI Assistant Features:**
- **Conversational**: Natural voice interaction
- **Contextual**: Knows about LeadFive platform
- **Secure**: Never reads dashboard content
- **Professional**: Business-focused responses
- **Helpful**: Answers platform questions

---

## 🎯 **Success Metrics**

### **Technical KPIs:**
- **Uptime**: >99.9%
- **Response Time**: <2 seconds
- **Error Rate**: <1%
- **AI Response Time**: <3 seconds

### **User Experience KPIs:**
- **Wallet Connection Rate**: >80%
- **AI Interaction Rate**: >40%
- **Session Duration**: >5 minutes
- **User Satisfaction**: >90%

---

## 🔐 **Security Best Practices**

### **Maintained:**
✅ **API keys encrypted** in environment variables  
✅ **No secrets in git history**  
✅ **HTTPS-only deployment**  
✅ **Environment isolation**  

### **Ongoing:**
- **Regular security audits**
- **API key rotation**
- **Monitor for unusual activity**
- **Keep dependencies updated**

---

**🎉 Your LeadFive platform with ElevenLabs Conversational AI is ready for production!**

For support, refer to:
- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [Digital Ocean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [LeadFive Technical Documentation](./README.md)
