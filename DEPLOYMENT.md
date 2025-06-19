# 🚀 LEADFIVE PRODUCTION DEPLOYMENT GUIDE

**Domain**: `leadfive.today`  
**Repository**: `https://github.com/timecapsulellc/LeadFive`  
**Platform**: DigitalOcean  
**Contract**: `0x7FEEA22942407407801cCDA55a4392f25975D998` (BSC Mainnet)

---

## 📋 **PREREQUISITES**

### **Required Accounts & Access**
- ✅ DigitalOcean account with billing enabled
- ✅ GitHub account with repository access
- ✅ Domain registrar access for `leadfive.today`
- ✅ BSC wallet with deployment keys
- ✅ Email for SSL certificates

### **Required Information**
- 🔑 **Private Key**: For contract interactions (keep secure!)
- 🌐 **Domain**: `leadfive.today` 
- 📧 **SSL Email**: For Let's Encrypt certificates
- 💰 **Admin Wallet**: For fee collection

---

## 🌊 **PHASE 1: DIGITALOCEAN SETUP**

### **Step 1.1: Create Droplet**

```bash
# Recommended Droplet Specifications:
# - Type: Basic Droplet
# - CPU: 2 vCPUs
# - Memory: 4 GB RAM
# - Storage: 80 GB SSD
# - Region: Choose closest to your users
# - OS: Ubuntu 22.04 LTS
# - Additional: Enable monitoring, backups
```

**Via DigitalOcean Dashboard:**
1. Go to **Create** → **Droplets**
2. Choose **Ubuntu 22.04 LTS**
3. Select **Basic** plan with **4GB RAM / 2 vCPUs**
4. Choose datacenter region (e.g., NYC, SFO, AMS)
5. Add SSH key or create password
6. Enable **Monitoring** and **Backups**
7. Name: `leadfive-production`
8. Click **Create Droplet**

### **Step 1.2: Initial Server Setup**

```bash
# Connect to your droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git ufw fail2ban

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

---

## 📁 **PHASE 2: PROJECT DEPLOYMENT**

### **Step 2.1: Clone Repository**

```bash
# Navigate to web directory
cd /opt

# Clone the repository
git clone https://github.com/timecapsulellc/LeadFive.git
cd LeadFive

# Set proper permissions
chown -R root:root /opt/LeadFive
chmod -R 755 /opt/LeadFive
```

### **Step 2.2: Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Required Environment Variables:**
```bash
# ==================== CRITICAL SETTINGS ====================
DEPLOYER_PRIVATE_KEY=your_actual_private_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here
LEADFIVE_ADMIN_WALLET=your_admin_wallet_address_here

# ==================== CONTRACT ADDRESSES ====================
VITE_CONTRACT_ADDRESS=0x7FEEA22942407407801cCDA55a4392f25975D998
LEADFIVE_MAINNET_PROXY=0x7FEEA22942407407801cCDA55a4392f25975D998

# ==================== DOMAIN CONFIGURATION ====================
DOMAIN=leadfive.today
SSL_EMAIL=your_email@example.com

# ==================== PRODUCTION SETTINGS ====================
VITE_APP_ENV=production
NODE_ENV=production
VITE_DEBUG_MODE=false
```

### **Step 2.3: Security Setup**

```bash
# Secure the .env file
chmod 600 .env
chown root:root .env

# Create SSL directory
mkdir -p /opt/LeadFive/ssl

# Create backup directory
mkdir -p /opt/LeadFive/backups
```

---

## 🌐 **PHASE 3: DNS CONFIGURATION**

### **Step 3.1: Domain Setup**

**Configure DNS Records:**
```
Type: A
Name: @
Value: your_droplet_ip
TTL: 300

Type: A  
Name: www
Value: your_droplet_ip
TTL: 300

Type: CNAME
Name: www
Value: leadfive.today
TTL: 300
```

### **Step 3.2: Verify DNS Propagation**

```bash
# Check DNS propagation
dig leadfive.today
dig www.leadfive.today

# Test from multiple locations
nslookup leadfive.today 8.8.8.8
nslookup leadfive.today 1.1.1.1
```

---

## 🐳 **PHASE 4: DOCKER DEPLOYMENT**

### **Step 4.1: Build and Deploy**

```bash
# Navigate to project directory
cd /opt/LeadFive

# Build the application
docker-compose build

# Start services (staging SSL first)
docker-compose up -d

# Check service status
docker-compose ps
docker-compose logs -f
```

### **Step 4.2: SSL Certificate Setup**

```bash
# First run with staging certificates
# (Already configured in docker-compose.yml)

# Check if staging certificates work
curl -I https://leadfive.today

# If successful, switch to production certificates
# Edit docker-compose.yml and remove --staging flag from certbot command
nano docker-compose.yml

# Remove the --staging flag from this line:
# command: certonly --webroot --webroot-path=/var/www/html --email ${SSL_EMAIL} --agree-tos --no-eff-email -d ${DOMAIN}

# Restart certbot to get production certificates
docker-compose stop certbot
docker-compose rm certbot
docker-compose up -d certbot

# Restart nginx to use new certificates
docker-compose restart nginx
```

---

## ✅ **PHASE 5: VERIFICATION & TESTING**

### **Step 5.1: Service Health Checks**

```bash
# Check all services are running
docker-compose ps

# Check application logs
docker-compose logs leadfive-app

# Check nginx logs
docker-compose logs nginx

# Test health endpoint
curl https://leadfive.today/health
```

### **Step 5.2: Application Testing**

```bash
# Test main application
curl -I https://leadfive.today

# Test SSL certificate
openssl s_client -connect leadfive.today:443 -servername leadfive.today

# Test contract connectivity
# (This should be done through the web interface)
```

### **Step 5.3: Performance Testing**

```bash
# Install testing tools
apt install -y apache2-utils

# Basic load test
ab -n 100 -c 10 https://leadfive.today/

# Monitor resource usage
htop
docker stats
```

---

## 🔧 **PHASE 6: MONITORING & MAINTENANCE**

### **Step 6.1: Setup Monitoring**

```bash
# Create monitoring script
cat > /opt/LeadFive/monitor.sh << 'EOF'
#!/bin/bash
# LeadFive Monitoring Script

echo "=== LeadFive System Status ==="
echo "Date: $(date)"
echo ""

echo "=== Docker Services ==="
docker-compose -f /opt/LeadFive/docker-compose.yml ps

echo ""
echo "=== Disk Usage ==="
df -h

echo ""
echo "=== Memory Usage ==="
free -h

echo ""
echo "=== SSL Certificate Status ==="
openssl x509 -in /opt/LeadFive/ssl/leadfive.today.crt -text -noout | grep "Not After" 2>/dev/null || echo "Certificate file not found"

echo ""
echo "=== Application Health ==="
curl -s https://leadfive.today/health || echo "Health check failed"
EOF

chmod +x /opt/LeadFive/monitor.sh

# Setup cron job for monitoring
crontab -e
# Add this line:
# 0 */6 * * * /opt/LeadFive/monitor.sh >> /var/log/leadfive-monitor.log 2>&1
```

### **Step 6.2: Backup Configuration**

```bash
# Create backup script
cat > /opt/LeadFive/backup.sh << 'EOF'
#!/bin/bash
# LeadFive Backup Script

BACKUP_DIR="/opt/LeadFive/backups"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/leadfive-backup-$DATE.tar.gz" \
    /opt/LeadFive/.env \
    /opt/LeadFive/ssl \
    /opt/LeadFive/docker-compose.yml

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "leadfive-backup-*.tar.gz" -mtime +30 -delete

echo "Backup completed: leadfive-backup-$DATE.tar.gz"
EOF

chmod +x /opt/LeadFive/backup.sh

# Setup daily backup
crontab -e
# Add this line:
# 0 2 * * * /opt/LeadFive/backup.sh >> /var/log/leadfive-backup.log 2>&1
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions**

**Issue: SSL Certificate Failed**
```bash
# Check certbot logs
docker-compose logs certbot

# Manually request certificate
docker-compose exec certbot certbot certonly --webroot --webroot-path=/var/www/html --email your_email@example.com --agree-tos --no-eff-email -d leadfive.today
```

**Issue: Application Not Loading**
```bash
# Check application logs
docker-compose logs leadfive-app

# Restart application
docker-compose restart leadfive-app

# Check environment variables
docker-compose exec leadfive-app env | grep VITE
```

**Issue: High Memory Usage**
```bash
# Check container resource usage
docker stats

# Restart services
docker-compose restart

# Check for memory leaks
docker-compose logs leadfive-app | grep -i memory
```

**Issue: Contract Connection Failed**
```bash
# Verify contract address in environment
grep VITE_CONTRACT_ADDRESS /opt/LeadFive/.env

# Test BSC connectivity
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://bsc-dataseed.binance.org/
```

---

## 📊 **MAINTENANCE COMMANDS**

### **Daily Operations**

```bash
# Check system status
cd /opt/LeadFive && docker-compose ps

# View recent logs
docker-compose logs --tail=50 -f

# Update application (if needed)
git pull origin main
docker-compose build
docker-compose up -d

# Check SSL certificate expiry
openssl x509 -in /etc/letsencrypt/live/leadfive.today/fullchain.pem -text -noout | grep "Not After"
```

### **Security Updates**

```bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d

# Restart services
docker-compose restart
```

---

## 🎯 **POST-DEPLOYMENT CHECKLIST**

### **✅ Deployment Verification**

- [ ] **Domain Resolution**: `leadfive.today` resolves to correct IP
- [ ] **SSL Certificate**: HTTPS working with valid certificate
- [ ] **Application Loading**: Website loads correctly
- [ ] **Contract Connection**: Web3 connects to BSC mainnet
- [ ] **Health Checks**: `/health` endpoint responds
- [ ] **Performance**: Page load times < 3 seconds
- [ ] **Mobile Responsive**: Works on mobile devices
- [ ] **Security Headers**: All security headers present

### **✅ Monitoring Setup**

- [ ] **System Monitoring**: Resource usage tracking
- [ ] **Application Logs**: Log rotation configured
- [ ] **SSL Monitoring**: Certificate expiry alerts
- [ ] **Backup System**: Daily backups working
- [ ] **Health Checks**: Automated monitoring
- [ ] **Error Tracking**: Error logging enabled

### **✅ Security Configuration**

- [ ] **Firewall Rules**: Only necessary ports open
- [ ] **SSL/TLS**: A+ rating on SSL Labs
- [ ] **Security Headers**: All headers configured
- [ ] **Rate Limiting**: API rate limits active
- [ ] **Access Control**: Admin panel restricted
- [ ] **Environment Security**: `.env` file secured

---

## 📞 **SUPPORT & MAINTENANCE**

### **Log Locations**
- **Application Logs**: `docker-compose logs leadfive-app`
- **Nginx Logs**: `docker-compose logs nginx`
- **System Logs**: `/var/log/syslog`
- **SSL Logs**: `docker-compose logs certbot`

### **Important Commands**
```bash
# Restart all services
docker-compose restart

# Update application
git pull && docker-compose build && docker-compose up -d

# View real-time logs
docker-compose logs -f

# Check service health
docker-compose ps && curl https://leadfive.today/health
```

### **Emergency Procedures**
```bash
# Emergency stop
docker-compose down

# Emergency restart
docker-compose down && docker-compose up -d

# Rollback (if needed)
git checkout previous_commit_hash
docker-compose build && docker-compose up -d
```

---

## 🎉 **DEPLOYMENT COMPLETE!**

Your LeadFive application should now be running at:
- **🌐 Website**: https://leadfive.today
- **🔒 SSL**: Secured with Let's Encrypt
- **📱 Mobile**: Responsive design
- **⚡ Performance**: Optimized for speed
- **🛡️ Security**: Production-grade security

**Next Steps:**
1. **Test User Registration**: Create test accounts
2. **Monitor Performance**: Watch logs and metrics
3. **Setup Analytics**: Configure user tracking
4. **Marketing Launch**: Begin user acquisition
5. **Ongoing Maintenance**: Regular updates and monitoring

**🚀 LeadFive is now LIVE and ready for users! 🚀**
