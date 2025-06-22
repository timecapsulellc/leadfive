# 🚀 LEADFIVE DIGITALOCEAN PHASED DEPLOYMENT GUIDE

**Repository**: `git@github.com:timecapsulellc/LeadFive.git`  
**Target Domain**: `leadfive.today`  
**Strategy**: GitHub → DigitalOcean → Domain Configuration  
**Updated**: 2025-06-22 (Current) UTC+5.5

---

## 📋 **DEPLOYMENT PHASES OVERVIEW**

### **✅ Phase 1: GitHub Repository (COMPLETED)**
- All build fixes applied and pushed
- Repository ready for deployment
- All critical errors resolved

### **🎯 Phase 2: DigitalOcean Deployment (CURRENT)**
- Deploy from GitHub to DigitalOcean App Platform
- Test on temporary URL
- Verify functionality

### **🌐 Phase 3: Domain Configuration (FINAL)**
- Configure DNS for leadfive.today
- Setup SSL certificate
- Final testing

---

## 🎯 **PHASE 2: DIGITALOCEAN DEPLOYMENT**

### **Step 1: Create DigitalOcean App**

1. **Login to DigitalOcean**
   - Go to https://cloud.digitalocean.com/
   - Navigate to "Apps" section

2. **Create New App**
   - Click "Create App"
   - Choose "GitHub" as source
   - Connect your GitHub account if not already connected

3. **Repository Configuration**
   ```
   Repository: timecapsulellc/LeadFive
   Branch: main
   Source Directory: / (root)
   Autodeploy: ✅ Enabled
   ```

### **Step 2: App Configuration**

#### **Build Settings**
```yaml
Name: leadfive
Environment: Node.js
Build Command: npm run build
Run Command: npm start
HTTP Port: 3000
```

#### **Environment Variables**
```bash
NODE_ENV=production
VITE_APP_ENV=production
VITE_CONTRACT_ADDRESS=0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569
VITE_NETWORK_ID=56
VITE_WEB3_PROVIDER_URL=https://bsc-dataseed.binance.org/
VITE_DEBUG_MODE=false
VITE_CHAIN_ID=56
VITE_NETWORK_NAME=BSC Mainnet
VITE_RPC_URL=https://bsc-dataseed.binance.org/
VITE_EXPLORER_URL=https://bscscan.com
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

#### **Resource Configuration**
```yaml
Plan: Basic ($5/month)
Instance Count: 1
Instance Size: 512 MB RAM, 1 vCPU
```

### **Step 3: Deploy Application**

1. **Review Configuration**
   - Verify all settings are correct
   - Check environment variables
   - Confirm build settings

2. **Start Deployment**
   - Click "Create Resources"
   - Wait for deployment to complete (5-10 minutes)

3. **Monitor Build Process**
   ```
   Expected Build Output:
   ✓ Installing dependencies
   ✓ Running build command
   ✓ Creating production build
   ✓ Starting application
   ```

### **Step 4: Test Temporary URL**

1. **Get Temporary URL**
   - DigitalOcean will provide a URL like:
   - `https://leadfive-xyz.ondigitalocean.app`

2. **Verify Application**
   ```bash
   # Test basic connectivity
   curl -I https://leadfive-xyz.ondigitalocean.app
   
   # Expected response:
   HTTP/2 200
   content-type: text/html
   ```

3. **Functional Testing**
   - ✅ Page loads correctly
   - ✅ React app initializes
   - ✅ Web3 connection works
   - ✅ Contract interaction available
   - ✅ No console errors

---

## 🌐 **PHASE 3: DOMAIN CONFIGURATION**

### **Step 1: DNS Configuration**

1. **Access Domain Registrar**
   - Login to your domain provider (where leadfive.today is registered)
   - Navigate to DNS management

2. **Add DNS Records**
   ```dns
   Type: CNAME
   Name: @
   Value: leadfive-xyz.ondigitalocean.app
   TTL: 300 (5 minutes)
   
   Type: CNAME  
   Name: www
   Value: leadfive-xyz.ondigitalocean.app
   TTL: 300 (5 minutes)
   ```

### **Step 2: DigitalOcean Domain Setup**

1. **Add Custom Domain**
   - In DigitalOcean App settings
   - Go to "Settings" → "Domains"
   - Click "Add Domain"

2. **Domain Configuration**
   ```
   Domain: leadfive.today
   Type: Primary Domain
   Certificate: Managed Certificate (Let's Encrypt)
   ```

3. **SSL Certificate**
   - DigitalOcean will automatically provision SSL
   - Wait for certificate validation (5-15 minutes)

### **Step 3: Verify Domain Setup**

1. **DNS Propagation Check**
   ```bash
   # Check DNS propagation
   nslookup leadfive.today
   dig leadfive.today
   ```

2. **SSL Certificate Verification**
   ```bash
   # Test SSL certificate
   curl -I https://leadfive.today
   
   # Expected response:
   HTTP/2 200
   server: nginx
   ```

3. **Final Testing**
   - ✅ https://leadfive.today loads
   - ✅ SSL certificate is valid
   - ✅ All functionality works
   - ✅ Redirects work properly

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **Common Deployment Issues**

#### **Build Failures**
```bash
# If build fails, check:
1. Package.json dependencies
2. Node.js version compatibility
3. Environment variables
4. Build command syntax
```

#### **Application Not Starting**
```bash
# Check application logs:
1. DigitalOcean App → Runtime Logs
2. Look for startup errors
3. Verify port configuration (3000)
4. Check start command
```

#### **Domain Issues**
```bash
# DNS troubleshooting:
1. Check DNS propagation (up to 48 hours)
2. Verify CNAME records
3. Clear browser cache
4. Test from different networks
```

### **Monitoring Commands**

```bash
# Check application status
curl -I https://leadfive.today

# Monitor logs (in DigitalOcean console)
# Apps → leadfive → Runtime Logs

# Test specific endpoints
curl https://leadfive.today/health
curl https://leadfive.today/api/status
```

---

## 📊 **DEPLOYMENT CHECKLIST**

### **✅ Pre-Deployment**
- [x] GitHub repository updated
- [x] All build errors fixed
- [x] Package.json optimized
- [x] Environment variables prepared

### **🎯 Phase 2 Checklist**
- [ ] DigitalOcean app created
- [ ] GitHub repository connected
- [ ] Environment variables configured
- [ ] Application deployed successfully
- [ ] Temporary URL accessible
- [ ] Functionality verified

### **🌐 Phase 3 Checklist**
- [ ] DNS records configured
- [ ] Custom domain added to DigitalOcean
- [ ] SSL certificate provisioned
- [ ] Domain accessible via HTTPS
- [ ] All redirects working
- [ ] Final testing completed

---

## 🚨 **EMERGENCY PROCEDURES**

### **Rollback Deployment**
```bash
# In DigitalOcean App Platform:
1. Go to "Deployments" tab
2. Select previous working deployment
3. Click "Redeploy"
```

### **Quick Fixes**
```bash
# Environment variable updates:
1. Apps → Settings → Environment Variables
2. Update values
3. Trigger new deployment

# Force rebuild:
1. Apps → Settings → General
2. Click "Force Rebuild and Deploy"
```

---

## 📞 **SUPPORT INFORMATION**

### **DigitalOcean Resources**
- **Documentation**: https://docs.digitalocean.com/products/app-platform/
- **Community**: https://www.digitalocean.com/community/
- **Support**: Available in DigitalOcean dashboard

### **Repository Information**
- **GitHub**: https://github.com/timecapsulellc/LeadFive
- **Issues**: Report via GitHub Issues
- **Documentation**: Available in repository

---

## 🎯 **SUCCESS INDICATORS**

### **✅ Deployment Successful When:**
```bash
# Application accessible
curl -I https://leadfive.today
# Returns: HTTP/2 200

# SSL certificate valid
openssl s_client -connect leadfive.today:443
# Shows valid certificate

# React app loads
# Browser shows LeadFive interface
# No console errors
# Web3 functionality works
```

---

**🎊 READY FOR PHASE 2 DEPLOYMENT! 🎊**

**Next Action**: Create DigitalOcean App using GitHub integration  
**Repository**: `git@github.com:timecapsulellc/LeadFive.git`  
**Branch**: `main`  
**Status**: ✅ **ALL FIXES APPLIED - READY TO DEPLOY**

---

**Updated**: 2025-06-20 01:45 UTC+5.5  
**Phase**: 2 - DigitalOcean Deployment  
**Repository**: `git@github.com:timecapsulellc/LeadFive.git`
