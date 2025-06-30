# ==================== DIGITALOCEAN APP PLATFORM DEPLOYMENT ====================

## 🚀 **DigitalOcean App Platform Setup for LeadFive**

Quick guide to deploy LeadFive on DigitalOcean App Platform (simpler than Droplets).

---

## 🎯 **Option 1: App Platform (Static Site)**

### **Step 1: Create App on DigitalOcean**

1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Select **"GitHub"** as source
4. Choose repository: `timecapsulellc/LeadFive`
5. Branch: `main`
6. Auto-deploy: ✅ Enabled

### **Step 2: Configure Build Settings**

```yaml
Name: leadfive
Type: Static Site
Build Command: npm ci && npm run build
Output Directory: dist
```

### **Step 3: Environment Variables**

Add these in App Platform dashboard:
```
NODE_ENV=production
VITE_APP_ENV=production
VITE_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D398389b7aaB0F7d
VITE_NETWORK_ID=56
VITE_WEB3_PROVIDER_URL=https://bsc-dataseed.binance.org/
VITE_DEBUG_MODE=false
```

### **Step 4: Deploy**

Click **"Create Resources"** - App Platform will:
- ✅ Clone your repository
- ✅ Install dependencies with `npm ci`
- ✅ Build with `npm run build`
- ✅ Deploy the `dist` folder
- ✅ Provide HTTPS URL

---

## 🔧 **Troubleshooting Current 404 Error**

### **Issue**: `leadfive-app-3f8tb.ondigitalocean.app` shows 404

### **Causes & Solutions**:

1. **Wrong service type** - Using `web` instead of `static_site`
   ```yaml
   # Fix: Change to static_site in app.yaml
   type: static_site
   ```

2. **Missing SPA routing** - React Router needs catch-all
   ```yaml
   # Fix: Add catch-all routing
   routes:
   - path: /
   - path: /[...catchall]
     type: rewrite
     destination: /index.html
   ```

3. **Build command issue** - Build might be failing
   ```bash
   # Check build logs in App Platform dashboard
   # Look for npm install or npm run build errors
   ```

---

## 🚀 **Quick Fix Steps**

### **Method 1: Update Current App**

1. Go to your App in DigitalOcean dashboard
2. Go to **Settings** → **App Spec**
3. Replace with this configuration:

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
  build_command: npm ci && npm run build
  output_dir: dist
  routes:
  - path: /
  static_site:
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

4. Click **"Save"** and **"Deploy"**

### **Method 2: Create New App**

1. Delete current app (if completely broken)
2. Create new app with correct configuration
3. Use the updated `app.yaml` from the repository

---

## 📊 **App Platform vs Droplet Comparison**

| Feature | App Platform | Droplet |
|---------|-------------|---------|
| **Setup Time** | 5 minutes | 30 minutes |
| **Maintenance** | Zero | Manual |
| **Scaling** | Automatic | Manual |
| **SSL** | Automatic | Manual setup |
| **Cost (Basic)** | $5/month | $6/month |
| **Database** | Managed add-on | Self-hosted |
| **Control** | Limited | Full |

---

## 🎯 **Recommended Approach**

### **For Current Issue (Quick Fix):**
1. Use App Platform with static site configuration
2. Update the app.yaml as shown above
3. Should work within 5-10 minutes

### **For Long-term Scaling:**
1. Start with App Platform for simplicity
2. Move to Droplet when you need:
   - Custom backend services
   - Database integration
   - More control over infrastructure
   - Cost optimization at scale

---

## 🔍 **Debug Steps**

If still getting 404 after the fix:

1. **Check build logs**:
   - Go to App Platform dashboard
   - Click on your app
   - Go to **"Runtime Logs"**
   - Look for build errors

2. **Verify build output**:
   - Ensure `dist` folder is created
   - Check if `index.html` exists in `dist`

3. **Test locally**:
   ```bash
   npm run build
   npm run preview
   # Should work on localhost:8080
   ```

4. **Check environment variables**:
   - Ensure all VITE_ variables are set
   - Restart deployment after adding variables

---

Let me know if you need help with any of these steps! The static site approach should fix your 404 error quickly.
