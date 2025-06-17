# 🚀 ORPHI CrowdFund - DigitalOcean Deployment Guide

## 📋 Prerequisites
- DigitalOcean account
- Docker installed locally (for testing)
- Git repository access
- Domain name (optional but recommended)

## 🎯 Deployment Options

### Option 1: DigitalOcean App Platform (Recommended - Easiest)

#### Step 1: Push to Git Repository
```bash
# Ensure your code is committed and pushed
git add .
git commit -m "Prepare for DigitalOcean deployment"
git push origin main
```

#### Step 2: Deploy via DigitalOcean App Platform
1. **Login to DigitalOcean Dashboard**
2. **Go to Apps** → **Create App**
3. **Connect GitHub/GitLab** repository
4. **Select Repository**: Your ORPHI CrowdFund repo
5. **Configure App Settings**:
   - **Service Name**: `orphi-crowdfund-frontend`
   - **Source Directory**: `/` (root)
   - **Build Command**: `npm run build`
   - **Run Command**: `serve -s dist -l 8080`
   - **Port**: `8080`
   - **Environment**: `Node.js 18.x`

#### Step 3: Environment Variables (if needed)
```env
NODE_ENV=production
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_NETWORK_ID=56
VITE_RPC_URL=https://bsc-dataseed.binance.org/
```

#### Step 4: Deploy
- Click **Create Resources**
- Wait for deployment (5-10 minutes)
- Your app will be available at: `https://your-app-name.ondigitalocean.app`

---

### Option 2: DigitalOcean Droplet with Docker

#### Step 1: Create Droplet
```bash
# Create a new droplet (via DO dashboard or CLI)
# Recommended: Ubuntu 22.04, Basic plan, $6/month
# Enable Docker in marketplace apps or install manually
```

#### Step 2: Connect to Droplet
```bash
ssh root@your_droplet_ip
```

#### Step 3: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (if not pre-installed)
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker

# Install Git
sudo apt install git -y

# Install Node.js (for local builds)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 4: Clone and Deploy
```bash
# Clone repository
git clone https://github.com/yourusername/orphi-crowdfund.git
cd orphi-crowdfund

# Build Docker image
sudo docker build -t orphi-crowdfund .

# Run container
sudo docker run -d \
  --name orphi-crowdfund-app \
  --restart unless-stopped \
  -p 80:8080 \
  orphi-crowdfund
```

#### Step 5: Setup Nginx (Optional - for custom domain)
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo tee /etc/nginx/sites-available/orphi-crowdfund << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/orphi-crowdfund /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option 3: DigitalOcean Container Registry + App Platform

#### Step 1: Setup Container Registry
```bash
# Install doctl CLI
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Create registry
doctl registry create orphi-crowdfund
```

#### Step 2: Build and Push Docker Image
```bash
# Build for production
docker build -t orphi-crowdfund .

# Tag for registry
docker tag orphi-crowdfund registry.digitalocean.com/orphi-crowdfund/frontend:latest

# Login to registry
doctl registry login

# Push image
docker push registry.digitalocean.com/orphi-crowdfund/frontend:latest
```

#### Step 3: Deploy from Registry
- Go to **Apps** → **Create App**
- Choose **DigitalOcean Container Registry**
- Select your image
- Configure and deploy

---

## 🔧 Production Optimizations

### 1. Environment Configuration
Create `.env.production`:
```env
NODE_ENV=production
VITE_APP_TITLE=ORPHI CrowdFund
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_NETWORK_ID=56
VITE_RPC_URL=https://bsc-dataseed.binance.org/
VITE_BLOCK_EXPLORER=https://bscscan.com
```

### 2. Performance Optimizations
```bash
# Enable gzip compression in vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['ethers', 'web3']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 3. Security Headers (Nginx)
```nginx
# Add to nginx config
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

---

## 🎯 Quick Deploy Script
Save as `deploy.sh`:
```bash
#!/bin/bash
echo "🚀 Deploying ORPHI CrowdFund to DigitalOcean..."

# Build application
echo "📦 Building application..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t orphi-crowdfund .

# Tag for DigitalOcean registry (if using)
echo "🏷️ Tagging image..."
docker tag orphi-crowdfund registry.digitalocean.com/orphi-crowdfund/frontend:latest

# Push to registry (uncomment if using registry)
# echo "📤 Pushing to registry..."
# doctl registry login
# docker push registry.digitalocean.com/orphi-crowdfund/frontend:latest

echo "✅ Deployment preparation complete!"
echo "🌐 Next: Deploy via DigitalOcean App Platform dashboard"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔍 Monitoring & Troubleshooting

### Check Application Status
```bash
# Check container status
docker ps

# View logs
docker logs orphi-crowdfund-app

# Check resource usage
docker stats orphi-crowdfund-app
```

### Common Issues & Solutions

1. **Port 8080 already in use**
   ```bash
   sudo lsof -i :8080
   sudo kill -9 PID
   ```

2. **Build failures**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Container won't start**
   ```bash
   # Check Docker logs
   docker logs orphi-crowdfund-app --follow
   
   # Rebuild image
   docker rmi orphi-crowdfund
   docker build -t orphi-crowdfund .
   ```

---

## 🌟 Recommended: App Platform Deployment
For the easiest deployment, I recommend **Option 1 (App Platform)** as it provides:
- Automatic scaling
- SSL certificates
- Global CDN
- Automatic deployments from Git
- Built-in monitoring
- Zero server management

**Estimated Cost**: $5-12/month depending on traffic

---

## 🎉 Post-Deployment
After successful deployment:
1. ✅ Test all wallet connections
2. ✅ Verify contract interactions
3. ✅ Test responsive design
4. ✅ Check loading performance
5. ✅ Setup domain (if applicable)
6. ✅ Configure monitoring alerts

Your ORPHI CrowdFund application will be live and accessible worldwide! 🌍 