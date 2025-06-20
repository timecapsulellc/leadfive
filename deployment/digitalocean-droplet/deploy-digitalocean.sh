#!/bin/bash

# ==================== LEADFIVE DIGITALOCEAN DEPLOYMENT SCRIPT ====================
# Automated deployment script for DigitalOcean Droplet
# Repository: https://github.com/timecapsulellc/LeadFive

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/timecapsulellc/LeadFive.git"
APP_DIR="/opt/leadfive"
DOMAIN="${DOMAIN:-leadfive.today}"
EMAIL="${EMAIL:-admin@leadfive.today}"
ENV_FILE="${APP_DIR}/.env"

echo -e "${BLUE}==================== LEADFIVE DIGITALOCEAN DEPLOYMENT ====================${NC}"
echo -e "${GREEN}Starting deployment process...${NC}"

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    nginx \
    certbot \
    python3-certbot-nginx \
    htop \
    unzip

# Install Docker
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
else
    print_success "Docker already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    print_success "Docker Compose already installed"
fi

# Setup firewall
print_status "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Clone repository
print_status "Cloning LeadFive repository..."
if [ -d "$APP_DIR" ]; then
    print_warning "Directory exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Create environment file
print_status "Creating environment configuration..."
cat > $ENV_FILE << EOL
# LeadFive Production Environment
NODE_ENV=production
VITE_APP_ENV=production

# Domain Configuration
DOMAIN=$DOMAIN
SSL_EMAIL=$EMAIL

# Contract Configuration (Update these with your deployed contract details)
VITE_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D398389b7aaB0F7d
VITE_NETWORK_ID=56
VITE_WEB3_PROVIDER_URL=https://bsc-dataseed.binance.org/

# Backup Configuration
BACKUP_FREQUENCY=daily
BACKUP_RETENTION_DAYS=30

# Security
VITE_DEBUG_MODE=false
EOL

print_success "Environment file created at $ENV_FILE"

# Create nginx configuration
print_status "Creating Nginx configuration..."
cat > nginx.conf << 'EOL'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 16M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rss+xml
        application/vnd.geo+json
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/bmp
        image/svg+xml
        image/x-icon
        text/cache-manifest
        text/css
        text/plain
        text/vcard
        text/vnd.rim.location.xloc
        text/vtt
        text/x-component
        text/x-cross-domain-policy;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # LeadFive upstream
    upstream leadfive_app {
        server leadfive-frontend:8080;
        keepalive 32;
    }
    
    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/html;
        }
        
        # Redirect all HTTP to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }
    
    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name leadfive.today www.leadfive.today;
        
        # SSL Configuration
        ssl_certificate /etc/letsencrypt/live/leadfive.today/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/leadfive.today/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:MozTLS:10m;
        ssl_session_tickets off;
        
        # Modern configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;
        
        # Root directory
        root /var/www/html;
        index index.html;
        
        # Main application
        location / {
            proxy_pass http://leadfive_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }
        
        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://leadfive_app;
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Cache-Status "STATIC";
        }
        
        # Security.txt
        location = /.well-known/security.txt {
            return 200 "Contact: mailto:security@leadfive.today\nExpires: 2025-12-31T23:59:59.000Z\nPreferred-Languages: en\n";
            add_header Content-Type text/plain;
        }
    }
}
EOL

# Set proper permissions
print_status "Setting permissions..."
chown -R root:root $APP_DIR
chmod +x $APP_DIR/deploy-digitalocean.sh

# Create systemd service for auto-restart
print_status "Creating systemd service..."
cat > /etc/systemd/system/leadfive.service << EOL
[Unit]
Description=LeadFive MLM Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable leadfive

# Build and start the application
print_status "Building and starting LeadFive application..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_success "LeadFive services are running!"
else
    print_error "Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Setup SSL certificate
print_status "Setting up SSL certificate..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/html \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Restart nginx to use new certificate
docker-compose restart nginx

# Setup automatic certificate renewal
print_status "Setting up automatic SSL renewal..."
cat > /etc/cron.d/leadfive-ssl-renewal << EOL
0 12 * * * root cd $APP_DIR && docker-compose run --rm certbot renew --quiet && docker-compose restart nginx
EOL

# Create backup script
print_status "Creating backup script..."
cat > /usr/local/bin/leadfive-backup.sh << 'EOL'
#!/bin/bash
BACKUP_DIR="/opt/leadfive/backups"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR
cd /opt/leadfive
tar -czf $BACKUP_DIR/leadfive-backup-$DATE.tar.gz . --exclude=backups --exclude=node_modules
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOL

chmod +x /usr/local/bin/leadfive-backup.sh

# Add to crontab
echo "0 3 * * * root /usr/local/bin/leadfive-backup.sh" >> /etc/crontab

print_success "==================== DEPLOYMENT COMPLETED ===================="
echo ""
echo -e "${GREEN}LeadFive has been successfully deployed!${NC}"
echo ""
echo -e "${BLUE}Application Details:${NC}"
echo -e "  🌐 Domain: https://$DOMAIN"
echo -e "  📁 Directory: $APP_DIR"
echo -e "  🔧 Environment: $ENV_FILE"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  📊 Check status: ${YELLOW}cd $APP_DIR && docker-compose ps${NC}"
echo -e "  📋 View logs: ${YELLOW}cd $APP_DIR && docker-compose logs -f${NC}"
echo -e "  🔄 Restart: ${YELLOW}cd $APP_DIR && docker-compose restart${NC}"
echo -e "  🛑 Stop: ${YELLOW}cd $APP_DIR && docker-compose down${NC}"
echo -e "  🚀 Start: ${YELLOW}cd $APP_DIR && docker-compose up -d${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Update the contract address in $ENV_FILE"
echo "2. Point your domain DNS to this server's IP"
echo "3. Wait for DNS propagation and SSL certificate"
echo "4. Test the application at https://$DOMAIN"
echo ""
echo -e "${GREEN}Deployment completed successfully! 🎉${NC}"
