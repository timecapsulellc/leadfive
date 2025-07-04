# 🚀 LeadFive Digital Ocean Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Contract Information Updated:
- **📄 Contract Address:** `0x29dcCb502D10C042BcC6a02a7762C49595A9E498`
- **👤 Default Sponsor:** `0xCeaEfDaDE5a0D574bFd5577665dC58d132995335`
- **🎫 Referral Code:** `K9NBHT`
- **💰 USDT Contract:** `0x55d398326f99059fF775485246999027B3197955`
- **🌐 Network:** BSC Mainnet (Chain ID: 56)
- **📅 Last Updated:** June 29, 2025

---

## 🔧 Digital Ocean Setup

### 1. Create Digital Ocean Droplet

```bash
# Recommended Specifications:
- OS: Ubuntu 22.04 LTS
- Size: Basic Droplet - 2 GB RAM / 1 vCPU / 50 GB SSD ($12/month)
- Region: Choose closest to your users
- Additional Options: Enable Monitoring
```

### 2. Connect to Your Droplet

```bash
ssh root@your_droplet_ip
```

### 3. Initial Server Setup

```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx for reverse proxy
apt install -y nginx

# Install Git
apt install -y git

# Create deployment user
adduser leadfive --disabled-password --gecos ""
usermod -aG sudo leadfive
```

---

## 📂 Application Deployment

### 1. Clone and Setup Application

```bash
# Switch to deployment user
su - leadfive

# Clone the repository
git clone https://github.com/your-username/LEAD-FIVE.git
cd LEAD-FIVE

# Install dependencies
npm install --production

# Build the application
npm run build
```

### 2. Environment Configuration

Create production environment file:

```bash
nano .env.production
```

Add the following content:

```env
# LeadFive Production Configuration

# Contract Configuration
VITE_CONTRACT_ADDRESS=0x29dcCb502D10C042BcC6a02a7762C49595A9E498
VITE_DEFAULT_SPONSOR=0xCeaEfDaDE5a0D574bFd5577665dC58d132995335
VITE_REFERRAL_CODE=K9NBHT
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Network Configuration
VITE_CHAIN_ID=56
VITE_NETWORK_NAME=BSC Mainnet
VITE_RPC_URL=https://bsc-dataseed1.binance.org/

# Application Configuration
VITE_APP_NAME=LeadFive
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# API Configuration (if needed)
VITE_API_BASE_URL=https://your-domain.com/api

# Security
VITE_ENABLE_DEVTOOLS=false
```

### 3. PM2 Process Configuration

Create PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'leadfive',
    script: 'npx',
    args: 'serve -s dist -l 3000',
    cwd: '/home/leadfive/LEAD-FIVE',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 4. Start Application with PM2

```bash
# Install serve globally for serving static files
npm install -g serve

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 startup
pm2 startup
# Follow the instructions to enable auto-startup
```

---

## 🌐 Nginx Configuration

### 1. Create Nginx Server Block

```bash
sudo nano /etc/nginx/sites-available/leadfive
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Root directory
    root /home/leadfive/LEAD-FIVE/dist;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests (if needed)
    location /api/ {
        proxy_pass http://localhost:3001;
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
```

### 2. Enable Site and Configure Nginx

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/leadfive /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx auto-start
sudo systemctl enable nginx
```

---

## 🔒 SSL Certificate Setup

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Auto-renewal Setup

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔥 Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

---

## 📊 Monitoring Setup

### 1. PM2 Monitoring

```bash
# View application logs
pm2 logs leadfive

# Monitor application
pm2 monit

# Restart application
pm2 restart leadfive

# View application status
pm2 status
```

### 2. System Monitoring

```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚀 Deployment Commands

### Initial Deployment

```bash
# On your local machine
npm run build

# Upload to server (or use git)
rsync -avz --delete ./dist/ leadfive@your-server:/home/leadfive/LEAD-FIVE/dist/

# On server
pm2 restart leadfive
```

### Update Deployment

```bash
# On server
cd /home/leadfive/LEAD-FIVE
git pull origin main
npm install --production
npm run build
pm2 restart leadfive
```

---

## 🎯 Domain Configuration

### 1. DNS Settings

Point your domain to the Digital Ocean droplet:

```
Type: A Record
Name: @
Value: your_droplet_ip

Type: A Record  
Name: www
Value: your_droplet_ip
```

### 2. Update Application URLs

Update any hardcoded URLs in your application to use your domain:

```javascript
// src/config/app.js
export const APP_CONFIG = {
  domain: 'https://your-domain.com',
  apiUrl: 'https://your-domain.com/api'
};
```

---

## ✅ Post-Deployment Verification

### 1. Check Application Status

- ✅ Visit `https://your-domain.com`
- ✅ Test wallet connection
- ✅ Verify contract address: `0x29dcCb502D10C042BcC6a02a7762C49595A9E498`
- ✅ Test dashboard functionality
- ✅ Verify BSC Mainnet connection
- ✅ Test referral code: `K9NBHT`

### 2. Performance Testing

```bash
# Test response time
curl -o /dev/null -s -w "%{time_total}\n" https://your-domain.com

# Test SSL
curl -I https://your-domain.com

# Check security headers
curl -I https://your-domain.com | grep -E '(X-Frame-Options|X-Content-Type-Options)'
```

---

## 🆘 Troubleshooting

### Common Issues

1. **Application not starting:**
   ```bash
   pm2 logs leadfive
   ```

2. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **SSL issues:**
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

4. **Permission issues:**
   ```bash
   sudo chown -R leadfive:leadfive /home/leadfive/LEAD-FIVE
   ```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression

Already configured in Nginx config above.

### 2. Enable Browser Caching

Already configured for static assets.

### 3. Optimize Images

```bash
# Install image optimization tools
sudo apt install -y imagemagick

# Optimize images (run as needed)
find ./dist -name "*.png" -exec pngcrush -ow {} \;
```

---

## 🔐 Security Best Practices

1. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Fail2ban for SSH Protection:**
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Regular Backups:**
   ```bash
   # Backup application
   tar -czf leadfive-backup-$(date +%Y%m%d).tar.gz /home/leadfive/LEAD-FIVE
   ```

---

## 📞 Support Information

- **Contract Address:** `0x29dcCb502D10C042BcC6a02a7762C49595A9E498`
- **BSCScan:** https://bscscan.com/address/0x29dcCb502D10C042BcC6a02a7762C49595A9E498
- **Network:** BSC Mainnet
- **Deployment Date:** June 29, 2025

---

**🎉 Your LeadFive application is now live on Digital Ocean!**

Access your application at: `https://your-domain.com`
