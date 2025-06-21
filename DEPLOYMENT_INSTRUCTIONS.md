# 🚀 LeadFive DigitalOcean Deployment Instructions

## ✅ Step 1: Authentication (Required Once)

You need to authenticate with DigitalOcean first. Follow these steps:

1. **Get your DigitalOcean API Token:**
   - Go to https://cloud.digitalocean.com/account/api/tokens
   - Click "Generate New Token"
   - Name it "LeadFive Deployment"
   - Set scope to "Read and Write"
   - Copy the token (save it securely!)

2. **Authenticate doctl:**
   ```bash
   doctl auth init
   ```
   - Paste your API token when prompted

3. **Verify authentication:**
   ```bash
   doctl account get
   ```

## ✅ Step 2: Deploy to DigitalOcean

Once authenticated, run the deployment script:

```bash
./deploy-digitalocean.sh
```

## 🎯 What the Deployment Script Does:

1. ✅ **Builds** the production version
2. ✅ **Pushes** latest code to GitHub
3. ✅ **Creates/Updates** DigitalOcean App
4. ✅ **Configures** automatic deployment from GitHub
5. ✅ **Provides** the live URL

## 📋 Deployment Configuration:

- **Repository**: `timecapsulellc/leadfive`
- **Branch**: `main` (auto-deploy enabled)
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Environment**: Production
- **Contract Address**: `0x7FEEA22942407407801cCDA55a4392f25975D998`
- **Network**: BSC Mainnet (Chain ID: 56)

## 🌐 Expected Result:

Your app will be available at: `https://leadfive-*.ondigitalocean.app`

## 🔧 Manual Deployment (Alternative):

If you prefer to use the DigitalOcean web interface:

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose GitHub repository: `timecapsulellc/leadfive`
4. Select branch: `main`
5. Use the existing `.do/app.yaml` configuration

## 📊 Monitoring:

After deployment, monitor at:
- **DigitalOcean Dashboard**: https://cloud.digitalocean.com/apps
- **Build Logs**: Available in the app dashboard
- **Live Application**: Your custom URL

## 🔄 Automatic Updates:

Every push to the `main` branch will automatically trigger a new deployment!

---

**Ready to deploy? Run:**
```bash
./deploy-digitalocean.sh
```
