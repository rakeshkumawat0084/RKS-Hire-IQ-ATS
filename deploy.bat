@echo off
REM RKS HIREIQ Deployment Script for Windows
REM This script helps deploy the project to Vercel and Render

echo 🚀 RKS HIREIQ Deployment Setup
echo ================================

REM Check if required tools are installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI is not installed. Install with: npm i -g vercel
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Build the project
echo 📦 Building project...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix errors and try again.
    pause
    exit /b 1
)

echo ✅ Build completed successfully

REM Deploy to Vercel
echo 🌐 Deploying frontend to Vercel...
echo Note: Make sure to set VITE_API_URL environment variable in Vercel dashboard
echo       pointing to your Render backend URL
call vercel --prod

if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed. Check your Vercel configuration.
    pause
    exit /b 1
)

echo ✅ Frontend deployed to Vercel

REM Instructions for Render
echo.
echo 🔧 Backend Deployment Instructions:
echo ===================================
echo 1. Go to https://render.com
echo 2. Create a new Web Service
echo 3. Connect your GitHub repository
echo 4. Configure:
echo    - Runtime: Node
echo    - Build Command: npm install
echo    - Start Command: npm start
echo 5. Set environment variables:
echo    - NODE_ENV=production
echo    - MONGODB_URI=^<your-mongodb-uri^>
echo    - JWT_SECRET=^<random-secret^>
echo    - INITIAL_ADMIN_EMAIL=^<admin-email^>
echo    - INITIAL_ADMIN_PASSWORD=^<admin-password^>
echo    - GEMINI_API_KEY=^<gemini-api-key^>
echo 6. Deploy the service
echo.
echo 7. Update your Vercel VITE_API_URL with the Render service URL
echo.
echo 🎉 Deployment setup complete!
echo    Frontend: Vercel
echo    Backend: Render (manual setup required)

pause