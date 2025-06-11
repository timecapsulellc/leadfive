#!/bin/bash

# Vercel Deployment Status Checker
echo "🚀 Checking Vercel Deployment Status..."
echo ""

# Check if the latest commit is deployed
echo "📍 Latest GitHub Commit:"
git log --oneline -1

echo ""
echo "🌐 Testing Vercel Deployment URLs:"

# Test the main deployment URL
echo "Testing: https://crowdfund-iiggrmtk2-timecapsulellcs-projects.vercel.app"
curl -s -I "https://crowdfund-iiggrmtk2-timecapsulellcs-projects.vercel.app" | head -5

echo ""
echo "🔄 Force Cache Refresh:"
echo "Try opening the URL with cache-busting parameter:"
echo "https://crowdfund-iiggrmtk2-timecapsulellcs-projects.vercel.app?t=$(date +%s)"

echo ""
echo "📝 Alternative Vercel URLs to try:"
echo "- https://crowdfund-git-main-timecapsulellcs-projects.vercel.app"
echo "- https://crowdfund-timecapsulellcs-projects.vercel.app"

echo ""
echo "✅ If the deployment is still not updated, check Vercel dashboard:"
echo "https://vercel.com/dashboard"
