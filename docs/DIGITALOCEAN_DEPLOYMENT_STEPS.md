# 🚀 DIGITALOCEAN DEPLOYMENT - STEP BY STEP GUIDE

## ✅ LEADFIVE PRODUCTION DEPLOYMENT

**Repository Status**: ✅ **READY** - All expert fixes pushed to GitHub
**Latest Commit**: `0133c13` - Expert Issues Fixed - Production Ready
**Repository**: `git@github.com:timecapsulellc/leadfive.git`

---

## 📋 **STEP-BY-STEP DEPLOYMENT PROCESS**

### **STEP 1: ACCESS DIGITALOCEAN**

1. **Open Browser** and go to: https://cloud.digitalocean.com/
2. **Login** to your DigitalOcean account
3. **Navigate to Apps** section in the left sidebar
4. **Click "Create App"** button

### **STEP 2: CONFIGURE SOURCE REPOSITORY**

1. **Choose Source**: Select **"GitHub"**
2. **Authorize GitHub**: If not already connected, authorize DigitalOcean to access your GitHub
3. **Select Repository**: Choose `timecapsulellc/leadfive`
4. **Select Branch**: Choose **`main`** (IMPORTANT: Not any other branch)
5. **Auto-deploy**: ✅ **Enable** "Autodeploy code changes"

### **STEP 3: CONFIGURE BUILD SETTINGS**

**App Configuration:**
```yaml
App Name: leadfive
Environment: Node.js
Build Command: npm run build
Run Command: npm start
HTTP Port: 8080
```

**Environment Variables** (Add these in the Environment Variables section):
```bash
NODE_ENV=production
VITE_APP_ENV=production
VITE_CONTRACT_ADDRESS=0x7FEEA22942407407801cCDA55a4392f25975D998
VITE_NETWORK_ID=56
VITE_WEB3_PROVIDER_URL=https://bsc-dataseed.binance.org/
VITE_DEBUG_MODE=false
VITE_WEBSOCKET_URL=wss://ws.leadfive.today
VITE_API_BASE_URL=https://api.leadfive.today
```

### **STEP 4: RESOURCE CONFIGURATION**

**Recommended Settings:**
- **Plan**: Basic ($5/month)
- **Instance Size**: Basic XXS (512 MB RAM, 1 vCPU)
- **Region**: New York 3 (or closest to your users)

### **STEP 5: REVIEW AND DEPLOY**

1. **Review Configuration** - Make sure all settings are correct
2. **Click "Create Resources"**
3. **Wait for Build** - This will take 5-10 minutes
4. **Monitor Build Logs** - Watch for any errors

---

## 🔧 **EXPECTED BUILD PROCESS**

### **✅ SUCCESSFUL BUILD SEQUENCE**

```bash
# 1. Repository Clone
✓ Cloning repository from GitHub
✓ Checking out main branch  
✓ Using commit 0133c13

# 2. Docker Build
✓ Using Dockerfile with Node.js 18.14.2-alpine
✓ Installing build dependencies
✓ Copying package files

# 3. Dependency Installation  
✓ Running npm ci (with package-lock.json)
✓ Installing all dependencies successfully
✓ No missing dependencies errors

# 4. Application Build
✓ Running npm run build
✓ Vite building for production
✓ Transforming modules
✓ Creating dist/ folder

# 5. Production Container
✓ Creating production container
✓ Copying built files
✓ Setting up health checks
✓ Starting application on port 8080

# 6. Deployment Success
✓ Application accessible
✓ Health checks passing
✓ Ready for traffic
```

---

## 🌐 **POST-DEPLOYMENT TESTING**

### **✅ IMMEDIATE TESTING CHECKLIST**

Once deployment is complete, you'll get a temporary URL like:
`https://leadfive-xyz.ondigitalocean.app`

**Test the following:**

1. **Basic Functionality:**
   - [ ] Website loads successfully
   - [ ] LeadFive branding displays correctly
   - [ ] No console errors in browser (F12 → Console)
   - [ ] Responsive design works on mobile

2. **Navigation:**
   - [ ] All menu items work (Home, Dashboard, etc.)
   - [ ] Dashboard "Network Tree" navigation works
   - [ ] "Full Network View" button works
   - [ ] Genealogy page loads with proper styling

3. **Wallet Integration:**
   - [ ] "Connect Wallet" button appears
   - [ ] MetaMask connection works
   - [ ] BSC network auto-switch works
   - [ ] Account address displays correctly

4. **Visual Design:**
   - [ ] Genealogy tree has golden colors
   - [ ] LeadFive brand colors are visible
   - [ ] Dashboard styling looks professional
   - [ ] No broken images or missing styles

---

## 🎯 **DOMAIN CONFIGURATION (NEXT STEP)**

### **✅ CUSTOM DOMAIN SETUP**

**After Successful Deployment:**

1. **Note Your App URL**: Copy the DigitalOcean app URL (e.g., `leadfive-xyz.ondigitalocean.app`)

2. **Configure DNS for leadfive.today:**
   ```dns
   Type: CNAME
   Name: @
   Value: leadfive-xyz.ondigitalocean.app

   Type: CNAME  
   Name: www
   Value: leadfive-xyz.ondigitalocean.app
   ```

3. **Add Domain in DigitalOcean:**
   - Go to your app settings
   - Click "Settings" → "Domains"
   - Add custom domain: `leadfive.today`
   - DigitalOcean will auto-provision SSL certificate

4. **Verify SSL:**
   - HTTPS will be automatically configured
   - Certificate valid for leadfive.today
   - Secure connection established

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **✅ IF BUILD FAILS:**

**Common Issues & Solutions:**

1. **Node.js Version Error:**
   - Check Dockerfile specifies Node.js 18.14.2
   - Verify package.json engines field

2. **Dependency Installation Error:**
   - Ensure package-lock.json is present
   - Check for missing dependencies

3. **Build Command Error:**
   - Verify `npm run build` works locally
   - Check Vite configuration

4. **Environment Variables:**
   - Ensure all VITE_ variables are set
   - Check for typos in variable names

### **✅ IF DEPLOYMENT SUCCEEDS BUT SITE DOESN'T WORK:**

1. **Check Browser Console:**
   - Open F12 → Console
   - Look for JavaScript errors
   - Check network requests

2. **Verify Environment Variables:**
   - Check if WebSocket URL is correct
   - Verify contract address is set
   - Ensure API URLs are accessible

3. **Test Wallet Connection:**
   - Try connecting MetaMask
   - Check BSC network configuration
   - Verify contract interaction

---

## 📊 **DEPLOYMENT SUCCESS CRITERIA**

### **✅ DEPLOYMENT IS SUCCESSFUL WHEN:**

1. **Build Completes**: ✅ No build errors, all dependencies resolved
2. **Application Starts**: ✅ Serves on port 8080, health checks pass
3. **Frontend Loads**: ✅ Website accessible, no console errors
4. **Styling Works**: ✅ LeadFive branding and colors display correctly
5. **Navigation Works**: ✅ All menu items and buttons function
6. **Wallet Ready**: ✅ MetaMask integration prepared (may need real backend)

---

## 🎉 **DEPLOYMENT COMMAND CENTER**

### **✅ QUICK REFERENCE**

**Repository**: `git@github.com:timecapsulellc/leadfive.git`  
**Branch**: `main`  
**Latest Commit**: `0133c13`  
**Contract**: `0x7FEEA22942407407801cCDA55a4392f25975D998`  
**Network**: BSC Mainnet (Chain ID: 56)  
**Port**: 8080  
**Node.js**: 18.14.2  

**Critical Fixes Applied:**
- ✅ WebSocket URL: Environment-based configuration
- ✅ Genealogy Tree: Brand-aligned golden colors
- ✅ Dashboard Navigation: Full Network View button
- ✅ Production Environment: All URLs configured

---

## 🚀 **READY TO DEPLOY!**

```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ LEADFIVE DIGITALOCEAN DEPLOYMENT READY █
█ • Expert Issues: FIXED                  █
█ • Repository: UPDATED                   █
█ • Configuration: PRODUCTION READY       █
█ • Status: DEPLOY NOW!                   █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

**🎯 YOUR NEXT ACTIONS:**

1. **Follow Steps 1-5** above to deploy on DigitalOcean
2. **Test the deployment** using the temporary URL
3. **Configure custom domain** leadfive.today
4. **Launch to users** and start growing your network!

---

**Deployment Date**: 2025-06-22 00:00 UTC+5.5  
**Status**: ✅ **READY FOR IMMEDIATE DEPLOYMENT**  
**Target Domain**: `leadfive.today`  
**Live Contract**: `0x7FEEA22942407407801cCDA55a4392f25975D998`

---

**🎉 START YOUR DEPLOYMENT NOW! 🎉**
