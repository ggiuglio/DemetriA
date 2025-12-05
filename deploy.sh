#!/bin/bash

# Deployment script for DemetriA with Cloud Functions

set -e

echo "🚀 DemetriA Deployment Script"
echo "=============================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install it with:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Run:"
    echo "   firebase login"
    exit 1
fi

echo "📦 Step 1: Installing function dependencies..."
cd functions
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
else
    echo "   ✓ Dependencies already installed"
fi
cd ..

echo ""
echo "🔑 Step 2: Checking Gemini API key configuration..."
if firebase functions:config:get | grep -q "gemini"; then
    echo "   ✓ Gemini API key is configured"
else
    echo "   ⚠️  Gemini API key not found in Firebase config"
    echo ""
    echo "   Please set your Gemini API key:"
    echo "   firebase functions:config:set gemini.api_key=\"YOUR_GEMINI_API_KEY\""
    echo ""
    read -p "   Do you want to set it now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "   Enter your Gemini API key: " api_key
        firebase functions:config:set gemini.api_key="$api_key"
        echo "   ✓ API key configured"
    else
        echo "   ⚠️  Skipping API key configuration. Functions may not work without it."
    fi
fi

echo ""
echo "🏗️  Step 3: Building frontend..."
npm run build

echo ""
echo "☁️  Step 4: Deploying to Firebase..."
echo ""
read -p "Deploy functions and hosting? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase deploy
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "🌐 Your app is live at:"
    firebase hosting:channel:list | grep "live" || echo "   Check Firebase Console for URL"
else
    echo "   Deployment cancelled"
fi

echo ""
echo "📝 Next steps:"
echo "   1. Visit your Firebase Hosting URL"
echo "   2. Test the /iq chat page"
echo "   3. Check Firebase Console → Functions for logs"
echo ""
