#!/bin/bash

# ORPHI CrowdFund - DigitalOcean Deployment Script
# Created by LEAD 5 - Young Blockchain Engineers

set -e

echo "🚀 ORPHI CrowdFund - DigitalOcean Deployment Script"
echo "=================================================="

# Configuration
APP_NAME="orphi-crowdfund"
APP_DIR="/var/www/$APP_NAME"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"
DOMAIN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

print_status "Starting deployment process..."

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
print_status "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
    print_success "Node.js installed successfully"
else
    print_success "Node.js already installed"
fi

# Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
    print_success "Nginx installed successfully"
else
    print_success "Nginx already installed"
fi

# Install PM2 and serve
print_status "Installing PM2 and serve..."
npm install -g pm2 serve

# Install Git
print_status "Installing Git..."
if ! command -v git &> /dev/null; then
    apt install git -y
    print_success "Git installed successfully"
else
    print_success "Git already installed"
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR

# Get repository URL
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    print_error "Repository URL is required"
    exit 1
fi

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $APP_DIR
    git pull origin main || git pull origin master || git pull origin deployment-clean
else
    print_status "Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build application
print_status "Building application..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_success "Application built successfully"

# Configure Nginx
print_status "Configuring Nginx..."

# Get domain name
echo ""
read -p "Enter your domain name (or press Enter to use server IP): " DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN="_"
    print_warning "No domain specified, using server IP"
fi

# Create Nginx configuration
cat > $NGINX_CONFIG << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    root $APP_DIR/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF

# Enable site
print_status "Enabling Nginx site..."
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

# Remove default site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
    print_status "Removed default Nginx site"
fi

# Test Nginx configuration
print_status "Testing Nginx configuration..."
if nginx -t; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration is invalid"
    exit 1
fi

# Restart Nginx
print_status "Restarting Nginx..."
systemctl restart nginx

# Setup firewall
print_status "Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

print_success "Firewall configured"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "🎉 Deployment completed successfully!"
echo "=================================="
print_success "Your ORPHI CrowdFund platform is now live!"
echo ""

if [ "$DOMAIN" = "_" ]; then
    echo "🌐 Access your application at: http://$SERVER_IP"
else
    echo "🌐 Access your application at: http://$DOMAIN"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Point your domain to this server IP: $SERVER_IP"
echo "2. Setup SSL certificate (recommended):"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
echo "🔧 Useful Commands:"
echo "- Update application: cd $APP_DIR && git pull && npm run build && systemctl reload nginx"
echo "- Check Nginx status: systemctl status nginx"
echo "- Check Nginx logs: tail -f /var/log/nginx/error.log"
echo ""
print_success "Deployment by LEAD 5 - Young Blockchain Engineers ✨" 