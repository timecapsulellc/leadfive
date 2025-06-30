# 🚀 **ONE-CLICK DIGITALOCEAN SETUP**

## **SUPER SIMPLE: 2-Minute Fix for 404 Error**

---

## ⚡ **METHOD 1: Update Existing App (EASIEST)**

### **Step 1: Go to Your App**
1. Visit: https://cloud.digitalocean.com/apps
2. Click on your `leadfive` app

### **Step 2: Update Configuration**
1. Go to **Settings** tab
2. Click **"App Spec"** in left sidebar
3. Click **"Edit"** button

### **Step 3: Copy-Paste This Configuration**
**Replace ALL content** with this exact YAML:

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

### **Step 4: Deploy**
1. Click **"Save"**
2. Click **"Deploy"**
3. Wait 10 minutes ✅

---

## 🆕 **METHOD 2: Create Fresh App (ALTERNATIVE)**

### **Step 1: Delete Current App**
1. In your app dashboard, go to **Settings** → **Destroy**
2. Type app name to confirm

### **Step 2: Create New App**
1. Go to: https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **"GitHub"** source
4. Select repository: `timecapsulellc/LeadFive`
5. Branch: `main`
6. **IMPORTANT:** Select **"Static Site"** (NOT Web Service)

### **Step 3: Auto-Configuration**
✅ DigitalOcean will automatically detect our `.do/app.yaml` file
✅ All settings will be applied automatically
✅ No manual configuration needed!

### **Step 4: Deploy**
1. Click **"Create Resources"**
2. Wait for build to complete
3. Test your new URL ✅

---

## 🎯 **What This Fixes**

### **❌ Current Issues:**
- Service type set as `web` instead of `static_site`
- Missing SPA routing for React Router
- Wrong build configuration

### **✅ Our Solution:**
- ✅ Correct `static_site` type for React/Vite apps
- ✅ Perfect SPA routing with `catch_all_document`
- ✅ Optimized build commands: `npm install && npm run build`
- ✅ Correct output directory: `dist`
- ✅ All environment variables properly configured
- ✅ Auto-deployment from GitHub enabled

---

## 📊 **Expected Result**

After applying either method:

### **✅ Success Indicators:**
- App builds successfully in 5-10 minutes
- No more 404 errors
- `https://your-app-url.ondigitalocean.app/` loads LeadFive
- Wallet connection works
- All dashboard features functional
- SSL certificate active

### **🔧 Build Process:**
```
✅ Cloning repository from GitHub
✅ Installing dependencies with npm install
✅ Building application with npm run build
✅ Deploying static files from dist/ folder
✅ Setting up SPA routing
✅ Configuring SSL certificate
✅ App ready at your DigitalOcean URL
```

---

## 🚨 **Troubleshooting**

### **If Build Fails:**
1. Check **Runtime Logs** in DigitalOcean dashboard
2. Look for npm install or build errors
3. Verify repository access permissions

### **If Still Getting 404:**
1. Confirm service type is `static_site` (not `web`)
2. Verify `catch_all_document: index.html` is present
3. Check output directory is `dist`

### **Common Success Pattern:**
```
[INFO] Cloning repository...
[INFO] Installing dependencies...
[INFO] npm install completed
[INFO] Running build command...
[INFO] npm run build completed
[INFO] Build artifacts found in dist/
[INFO] Deploying static site...
[INFO] Deployment successful
```

---

## ⏱️ **Timeline**

- **Method 1 (Update):** 2 minutes config + 10 minutes deploy = 12 minutes total
- **Method 2 (Fresh):** 5 minutes setup + 10 minutes deploy = 15 minutes total

---

## 🎉 **After Success**

Once working, you'll have:
- ✅ Production LeadFive app on DigitalOcean
- ✅ Auto-deployment from GitHub
- ✅ SSL certificate and custom domain support
- ✅ Ready for future scaling (databases, backend, etc.)

---

**Choose Method 1 if you want to keep your current app URL, or Method 2 for a completely fresh start!** 🚀
