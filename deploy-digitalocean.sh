#!/bin/bash

# 🚀 LeadFive DigitalOcean Deployment Script
# This script automates the deployment process to DigitalOcean App Platform

set -e

echo "🚀 Starting LeadFive DigitalOcean Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    print_error "DigitalOcean CLI (doctl) is not installed."
    print_status "Install it from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if doctl is authenticated
if ! doctl auth list &> /dev/null; then
    print_error "doctl is not authenticated."
    print_status "Run: doctl auth init"
    exit 1
fi

print_status "Building production assets..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

print_status "Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Consider committing them first."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_status "Pushing latest changes to GitHub..."
git add .
git commit -m "🚀 Production deployment: $(date)" || true
git push origin main

print_success "Code pushed to GitHub successfully!"

print_status "Checking for existing DigitalOcean app..."

# Check if app exists
APP_NAME="leadfive"
APP_EXISTS=$(doctl apps list --format Name | grep -w "$APP_NAME" || true)

if [ -z "$APP_EXISTS" ]; then
    print_status "Creating new DigitalOcean app..."
    doctl apps create .do/app.yaml
    print_success "App created successfully!"
else
    print_status "Updating existing DigitalOcean app..."
    APP_ID=$(doctl apps list --format ID,Name | grep "$APP_NAME" | awk '{print $1}')
    doctl apps update "$APP_ID" --spec .do/app.yaml
    print_success "App updated successfully!"
fi

print_status "Getting app information..."
doctl apps list

print_success "🎉 Deployment initiated successfully!"
print_status "Check deployment status at: https://cloud.digitalocean.com/apps"
print_status "Your app will be available at: https://leadfive-*.ondigitalocean.app"

# Get the app URL
APP_ID=$(doctl apps list --format ID,Name | grep "$APP_NAME" | awk '{print $1}')
if [ ! -z "$APP_ID" ]; then
    print_status "Getting app URL..."
    APP_URL=$(doctl apps get "$APP_ID" --format Live.URL --no-header 2>/dev/null || echo "URL not ready yet")
    if [ "$APP_URL" != "URL not ready yet" ] && [ ! -z "$APP_URL" ]; then
        print_success "🌐 Your app is available at: $APP_URL"
    else
        print_status "App URL will be available once deployment completes."
    fi
fi

echo ""
print_success "✅ Deployment script completed!"
print_status "Monitor the deployment progress in the DigitalOcean dashboard."
