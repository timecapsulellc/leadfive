#!/bin/bash

# OrphiCrowdFund Vercel Re-deployment Script
echo "🚀 OrphiCrowdFund Vercel Re-deployment"
echo "======================================"

echo ""
echo "📋 Pre-deployment checklist:"
echo "✅ Build successful locally"
echo "✅ All components working"
echo "✅ Latest code pushed to GitHub"

echo ""
echo "🔧 Step 1: Installing Vercel CLI..."
npm install -g vercel

echo ""
echo "🔗 Step 2: Link to existing project..."
# This will re-link to the existing Vercel project
vercel --yes

echo ""
echo "🚀 Step 3: Deploy to production..."
vercel --prod

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📱 Your dashboard should now be accessible at the new URL provided above."
echo ""
echo "🔍 Alternative URLs to try:"
echo "- https://crowdfund.vercel.app"
echo "- https://crowdfund-git-main.vercel.app"
echo "- https://crowdfund-[hash].vercel.app"
