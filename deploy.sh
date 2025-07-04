#!/bin/bash

# LeadFive Production Deployment Script for Digital Ocean
# Run this script to deploy LeadFive to your Digital Ocean droplet

set -e  # Exit on any error

echo "🚀 Starting LeadFive Production Deployment..."

# Configuration
APP_NAME="leadfive"
DOMAIN="leadfive.today"
DEPLOY_USER="root"
SERVER_IP="your_server_ip_here"
DOCKER_IMAGE="leadfive/frontend"
VERSION="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_step "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        print_error "SSH is not available. Please install SSH client."
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Build Docker image
build_image() {
    print_step "Building Docker image..."
    
    # Build production image
    docker build -f Dockerfile.production -t ${DOCKER_IMAGE}:${VERSION} .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Deploy to server
deploy_to_server() {
    print_step "Deploying to Digital Ocean server..."
    
    # Create deployment directory on server
    ssh ${DEPLOY_USER}@${SERVER_IP} "mkdir -p /opt/${APP_NAME}"
    
    # Copy Docker Compose file
    scp docker-compose.production.yml ${DEPLOY_USER}@${SERVER_IP}:/opt/${APP_NAME}/docker-compose.yml
    
    # Copy nginx configuration
    scp nginx.production.conf ${DEPLOY_USER}@${SERVER_IP}:/opt/${APP_NAME}/nginx.conf
    
    # Export Docker image and transfer
    print_step "Transferring Docker image..."
    docker save ${DOCKER_IMAGE}:${VERSION} | ssh ${DEPLOY_USER}@${SERVER_IP} "docker load"
    
    print_success "Files transferred to server"
}

# Start services on server
start_services() {
    print_step "Starting services on server..."
    
    ssh ${DEPLOY_USER}@${SERVER_IP} << EOF
        cd /opt/${APP_NAME}
        
        # Stop existing services
        docker-compose down --remove-orphans || true
        
        # Start new services
        docker-compose up -d
        
        # Show status
        docker-compose ps
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Setup SSL (Let's Encrypt)
setup_ssl() {
    print_step "Setting up SSL certificate..."
    
    ssh ${DEPLOY_USER}@${SERVER_IP} << EOF
        # Install certbot if not installed
        if ! command -v certbot &> /dev/null; then
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
        fi
        
        # Temporarily stop nginx to get certificate
        docker-compose -f /opt/${APP_NAME}/docker-compose.yml stop
        
        # Get SSL certificate
        certbot certonly --standalone -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
        
        # Copy certificates to docker volume
        mkdir -p /opt/${APP_NAME}/ssl
        cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /opt/${APP_NAME}/ssl/${DOMAIN}.crt
        cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem /opt/${APP_NAME}/ssl/${DOMAIN}.key
        
        # Start services again
        cd /opt/${APP_NAME}
        docker-compose up -d
EOF
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate configured"
    else
        print_warning "SSL setup failed, but deployment continues"
    fi
}

# Health check
health_check() {
    print_step "Performing health check..."
    
    sleep 10  # Wait for services to start
    
    # Check if services are running
    ssh ${DEPLOY_USER}@${SERVER_IP} "docker-compose -f /opt/${APP_NAME}/docker-compose.yml ps"
    
    # Check HTTP response
    if curl -f -s https://${DOMAIN}/health > /dev/null; then
        print_success "Health check passed - LeadFive is live!"
        echo -e "${GREEN}🌐 Your LeadFive platform is now available at: https://${DOMAIN}${NC}"
        echo -e "${GREEN}📱 Root referral link: https://${DOMAIN}/register?ref=K9NBHT${NC}"
    else
        print_warning "Health check failed, but services may still be starting"
        echo -e "${YELLOW}Please check manually: https://${DOMAIN}${NC}"
    fi
}

# Setup monitoring (optional)
setup_monitoring() {
    print_step "Setting up basic monitoring..."
    
    ssh ${DEPLOY_USER}@${SERVER_IP} << EOF
        # Create monitoring script
        cat > /opt/${APP_NAME}/monitor.sh << 'MONITOR_EOF'
#!/bin/bash
cd /opt/${APP_NAME}

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "LeadFive containers are down, restarting..."
    docker-compose up -d
fi

# Check disk space
df -h | awk '\$5 > 80 {print "Warning: " \$5 " disk usage on " \$6}'

# Check memory usage
free | awk 'NR==2{printf "Memory Usage: %s/%s (%.2f%%)\n", \$3,\$2,\$3*100/\$2 }'
MONITOR_EOF

        chmod +x /opt/${APP_NAME}/monitor.sh
        
        # Add to crontab (check every 5 minutes)
        (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/${APP_NAME}/monitor.sh >> /var/log/leadfive-monitor.log 2>&1") | crontab -
EOF
    
    print_success "Basic monitoring configured"
}

# Main deployment function
main() {
    echo "=================================="
    echo "🚀 LeadFive Production Deployment"
    echo "=================================="
    echo "Domain: ${DOMAIN}"
    echo "Server: ${SERVER_IP}"
    echo "=================================="
    echo
    
    # Prompt for server IP if not set
    if [ "${SERVER_IP}" = "your_server_ip_here" ]; then
        read -p "Enter your Digital Ocean droplet IP address: " SERVER_IP
    fi
    
    # Confirm deployment
    read -p "Deploy LeadFive to ${SERVER_IP}? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    check_requirements
    build_image
    deploy_to_server
    start_services
    setup_ssl
    setup_monitoring
    health_check
    
    echo
    echo "=================================="
    print_success "🎉 Deployment completed successfully!"
    echo "=================================="
    echo
    echo "📋 Next steps:"
    echo "1. Visit https://${DOMAIN} to verify deployment"
    echo "2. Test the referral system: https://${DOMAIN}/register?ref=K9NBHT"
    echo "3. Monitor logs: ssh ${DEPLOY_USER}@${SERVER_IP} 'docker-compose -f /opt/${APP_NAME}/docker-compose.yml logs -f'"
    echo "4. Update DNS records to point ${DOMAIN} to ${SERVER_IP}"
    echo
    echo "🔗 Important links:"
    echo "   • Main site: https://${DOMAIN}"
    echo "   • Root referral: https://${DOMAIN}/register?ref=K9NBHT"
    echo "   • Health check: https://${DOMAIN}/health"
    echo
}

# Run main function
main "$@"