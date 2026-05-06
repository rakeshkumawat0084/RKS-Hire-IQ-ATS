#!/bin/bash

# RKS HIREIQ Deployment Script
# This script helps deploy the project to Vercel and Render

echo "🚀 RKS HIREIQ Deployment Setup"
echo "================================"

# Check if required tools are installed
command -v vercel >/dev/null 2>&1 || { echo "❌ Vercel CLI is not installed. Install with: npm i -g vercel"; exit 1; }
command -v render >/dev/null 2>&1 || { echo "⚠️  Render CLI not found. You'll need to deploy via dashboard."; }

echo "✅ Prerequisites check passed"

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Vercel
echo "🌐 Deploying frontend to Vercel..."
echo "Note: Make sure to set VITE_API_URL environment variable in Vercel dashboard"
echo "      pointing to your Render backend URL"
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Vercel deployment failed. Check your Vercel configuration."
    exit 1
fi

echo "✅ Frontend deployed to Vercel"

# Instructions for Render
echo ""
echo "🔧 Backend Deployment Instructions:"
echo "==================================="
echo "1. Go to https://render.com"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Runtime: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "5. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - MONGODB_URI=<your-mongodb-uri>"
echo "   - JWT_SECRET=<random-secret>"
echo "   - INITIAL_ADMIN_EMAIL=<admin-email>"
echo "   - INITIAL_ADMIN_PASSWORD=<admin-password>"
echo "   - GEMINI_API_KEY=<gemini-api-key>"
echo "6. Deploy the service"
echo ""
echo "7. Update your Vercel VITE_API_URL with the Render service URL"
echo ""
echo "🎉 Deployment setup complete!"
echo "   Frontend: Vercel"
echo "   Backend: Render (manual setup required)"