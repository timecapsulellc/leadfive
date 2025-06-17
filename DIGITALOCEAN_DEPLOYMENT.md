# DigitalOcean Deployment Guide for ORPHI CrowdFund

This guide provides two deployment options for your ORPHI CrowdFund Web3 platform on DigitalOcean.

## 🚀 Option 1: DigitalOcean App Platform (Recommended)

### Prerequisites
- DigitalOcean account
- GitHub repository with your code
- Your code pushed to GitHub

### Steps

1. **Login to DigitalOcean**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"

2. **Connect GitHub Repository**
   - Select "GitHub" as source
   - Authorize DigitalOcean to access your repositories
   - Select your repository: `Orphi CrowFund`
   - Choose branch: `deployment-clean` (or your main branch)

3. **Configure Build Settings**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Run Command**: Leave empty (static site)

4. **Environment Variables**
   Add these environment variables in the App Platform:
   ```
   NODE_ENV=production
   VITE_CONTRACT_ADDRESS=0x123... (your BSC contract address)
   VITE_CHAIN_ID=56
   VITE_RPC_URL=https://bsc-dataseed.binance.org/
   ```

5. **Deploy**
   - Click "Next" through the configuration
   - Review settings and click "Create Resources"
   - Wait for deployment (5-10 minutes)

### Cost: ~$5-12/month

---

## 🖥️ Option 2: DigitalOcean Droplet (Manual Setup)

### Prerequisites
- DigitalOcean account
- SSH access knowledge

### Steps

1. **Create Droplet**
   - Size: Basic ($6/month - 1GB RAM, 1 vCPU)
   - Image: Ubuntu 22.04 LTS
   - Add SSH key or use password

2. **SSH into Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Install Nginx
   apt install nginx -y
   
   # Install PM2 for process management
   npm install -g pm2 serve
   
   # Install Git
   apt install git -y
   ```

4. **Clone and Build Your App**
   ```bash
   # Clone your repository
   git clone https://github.com/yourusername/your-repo.git /var/www/orphi-crowdfund
   cd /var/www/orphi-crowdfund
   
   # Install dependencies
   npm install
   
   # Build the application
   npm run build
   ```

5. **Configure Nginx**
   ```bash
   # Create Nginx configuration
   nano /etc/nginx/sites-available/orphi-crowdfund
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       root /var/www/orphi-crowdfund/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

6. **Enable Site**
   ```bash
   # Enable the site
   ln -s /etc/nginx/sites-available/orphi-crowdfund /etc/nginx/sites-enabled/
   
   # Test Nginx configuration
   nginx -t
   
   # Restart Nginx
   systemctl restart nginx
   
   # Enable Nginx to start on boot
   systemctl enable nginx
   ```

7. **Setup SSL (Optional but Recommended)**
   ```bash
   # Install Certbot
   apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

### Cost: ~$6/month

---

## 🔄 Automated Deployment Script

### Quick Deploy Script
Use the automated script I've created:

```bash
# On your DigitalOcean droplet, run:
curl -sSL https://raw.githubusercontent.com/yourusername/your-repo/main/scripts/deploy-digitalocean.sh | sudo bash
```

Or manually:
```bash
# Upload the script to your droplet
scp scripts/deploy-digitalocean.sh root@your_droplet_ip:/tmp/
ssh root@your_droplet_ip
chmod +x /tmp/deploy-digitalocean.sh
/tmp/deploy-digitalocean.sh
```

---

## 🤖 GitHub Actions Auto-Deployment

I've also created a GitHub Actions workflow for automatic deployment on every push:

### Setup GitHub Secrets
Add these secrets in your GitHub repository settings:

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   ```
   DO_HOST: your_droplet_ip_address
   DO_USERNAME: root
   DO_SSH_KEY: your_private_ssh_key
   DO_PORT: 22 (optional, defaults to 22)
   ```

### How to get your SSH key:
```bash
# Generate SSH key pair (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to your droplet
ssh-copy-id root@your_droplet_ip

# Copy private key content for GitHub secret
cat ~/.ssh/id_rsa
```

---

## 🚀 Ready to Deploy?

### Option 1: DigitalOcean App Platform (Easiest)
1. Push your code to GitHub
2. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
3. Connect your GitHub repo
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy!

### Option 2: DigitalOcean Droplet (More Control)
1. Create a DigitalOcean droplet (Ubuntu 22.04)
2. Run the deployment script:
   ```bash
   curl -sSL https://raw.githubusercontent.com/yourusername/your-repo/main/scripts/deploy-digitalocean.sh | sudo bash
   ```
3. Follow the prompts
4. Your app will be live!

---

## 📱 What You Get

✅ **Professional Web3 Platform**: Fully functional ORPHI CrowdFund  
✅ **Multi-Wallet Support**: MetaMask, Trust Wallet, Binance Wallet, etc.  
✅ **BSC Mainnet Integration**: Real blockchain functionality  
✅ **Responsive Design**: Works on all devices  
✅ **SSL Security**: HTTPS encryption (with domain)  
✅ **Auto-Updates**: GitHub Actions deployment  
✅ **Professional Branding**: LEAD 5 developer credits  

---

## 💡 Pro Tips

1. **Use a domain**: Point your domain to the droplet IP for professional look
2. **Enable SSL**: Run `sudo certbot --nginx -d yourdomain.com` after deployment
3. **Monitor performance**: Use DigitalOcean monitoring tools
4. **Backup regularly**: Set up automated backups
5. **Update regularly**: The GitHub Actions will auto-deploy on every push

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check logs**: `sudo tail -f /var/log/nginx/error.log`
2. **Restart services**: `sudo systemctl restart nginx`
3. **Check app status**: `cd /var/www/orphi-crowdfund && npm run build`
4. **Firewall issues**: `sudo ufw status` and `sudo ufw allow 'Nginx Full'`

---

**🎯 Ready to go live? Choose your deployment method above and launch your ORPHI CrowdFund platform to the world!**

*Deployment guide created by LEAD 5 - Young Blockchain Engineers* ✨
