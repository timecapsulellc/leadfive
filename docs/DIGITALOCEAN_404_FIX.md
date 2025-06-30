# 🚨 **DIGITALOCEAN 404 ERROR - IMMEDIATE FIX GUIDE**

## **Problem:** `https://leadfive-app-3f8tb.ondigitalocean.app/` returns 404

---

## 🔧 **SOLUTION 1: Update App Spec (Try This First)**

### **Step 1: Go to DigitalOcean Dashboard**
1. Visit: https://cloud.digitalocean.com/apps
2. Click on your `leadfive` app
3. Go to **Settings** tab
4. Click **"App Spec"** in the left sidebar

### **Step 2: Replace App Spec**
Click **"Edit"** and replace the ENTIRE content with this:

```yaml
name: leadfive
region: nyc
services:
- name: leadfive-web
  type: static_site
  source_dir: /
  github:
    repo: timecapsulellc/LeadFive
    branch: main
    deploy_on_push: true
  build_command: npm install && npm run build
  output_dir: dist
  static_site:
    index_document: index.html
    error_document: index.html
    catch_all_document: index.html
  envs:
  - key: NODE_ENV
    value: production
  - key: VITE_APP_ENV
    value: production
  - key: VITE_CONTRACT_ADDRESS
    value: "0x742d35Cc6634C0532925a3b8D398389b7aaB0F7d"
  - key: VITE_NETWORK_ID
    value: "56"
  - key: VITE_WEB3_PROVIDER_URL
    value: "https://bsc-dataseed.binance.org/"
  - key: VITE_DEBUG_MODE
    value: "false"
```

### **Step 3: Save and Deploy**
1. Click **"Save"**
2. Click **"Deploy"**
3. Wait 5-10 minutes for build to complete

---

## 🚨 **SOLUTION 2: Create New App (If Solution 1 Fails)**

### **Step 1: Delete Current App**
1. In your app dashboard, go to **Settings** → **Destroy**
2. Type the app name to confirm deletion

### **Step 2: Create Fresh App**
1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **"GitHub"** as source
4. Select repository: `timecapsulellc/LeadFive`
5. Branch: `main`
6. **IMPORTANT:** When it detects the app type, select **"Static Site"** (NOT Web Service)

### **Step 3: Configure Build**
```
Type: Static Site
Build Command: npm install && npm run build
Output Directory: dist
```

### **Step 4: Add Environment Variables**
Add these environment variables:
```
NODE_ENV=production
VITE_APP_ENV=production
VITE_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D398389b7aaB0F7d
VITE_NETWORK_ID=56
VITE_WEB3_PROVIDER_URL=https://bsc-dataseed.binance.org/
VITE_DEBUG_MODE=false
```

### **Step 5: Deploy**
1. Click **"Create Resources"**
2. Wait for deployment (5-10 minutes)
3. Test new URL

---

## 🔍 **DEBUGGING: Check Build Logs**

### **Monitor Deployment:**
1. In your app dashboard, go to **"Runtime Logs"**
2. Look for these SUCCESS indicators:
   ```
   ✅ Cloning repository...
   ✅ Installing dependencies...
   ✅ Running build command...
   ✅ Build completed successfully
   ✅ Static files deployed
   ```

### **Common Error Patterns:**
- **"npm install failed"** → Check package.json
- **"npm run build failed"** → Build script issue
- **"No index.html found"** → Wrong output directory
- **"Permission denied"** → Repository access issue

---

## 💡 **WHY THE 404 IS HAPPENING**

### **Most Likely Causes:**
1. **Wrong service type:** App configured as `web` instead of `static_site`
2. **Missing SPA routing:** No catch-all document configured
3. **Build failure:** Build process not completing successfully
4. **Wrong output directory:** Looking for files in wrong location

### **The Fix:**
The updated configuration addresses all these issues by:
- ✅ Setting correct `static_site` type
- ✅ Adding proper SPA routing with `catch_all_document`
- ✅ Using reliable build command
- ✅ Pointing to correct output directory (`dist`)

---

## ⚡ **QUICK TEST AFTER FIX**

Once deployed, test these URLs:
- ✅ `https://your-new-app-url.ondigitalocean.app/` (should load home page)
- ✅ `https://your-new-app-url.ondigitalocean.app/dashboard` (should redirect to home, then work after wallet connect)
- ✅ Wallet connection should work
- ✅ All dashboard features should be functional

---

## 🎯 **EXPECTED RESULT**

After applying the fix:
- ✅ App builds successfully
- ✅ Static files served correctly
- ✅ React Router navigation works
- ✅ All LeadFive features functional
- ✅ SSL certificate active
- ✅ Auto-deployment from GitHub working

---

## 📞 **IF STILL NOT WORKING**

If you're still getting 404 after trying both solutions:

1. **Check repository access:**
   - Ensure DigitalOcean has access to your GitHub repo
   - Verify the repository URL is correct

2. **Try manual deployment:**
   - Test build locally: `npm run build`
   - Check if `dist` folder is created
   - Verify `dist/index.html` exists

3. **Alternative: Use a different approach:**
   - Consider using DigitalOcean Droplet with our Docker setup
   - Or temporarily restore Vercel deployment

Let me know which solution works, and I'll help you optimize from there! 🚀
