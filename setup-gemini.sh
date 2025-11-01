#!/bin/bash

echo "🌱 DemetriA - Gemini AI Setup Script"
echo "===================================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing @google/generative-ai..."
npm install @google/generative-ai

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping .env creation"
    else
        read -p "Enter your Gemini API key: " api_key
        echo "GEMINI_API_KEY=$api_key" > .env
        echo "✅ .env file updated"
    fi
else
    read -p "Enter your Gemini API key (or press Enter to skip): " api_key
    if [ -n "$api_key" ]; then
        echo "GEMINI_API_KEY=$api_key" > .env
        echo "✅ .env file created"
    else
        echo "⚠️  Skipped .env creation. You'll need to create it manually."
    fi
fi

# Add .env to .gitignore if not already there
if [ -f ".gitignore" ]; then
    if ! grep -q "^\.env$" .gitignore; then
        echo ".env" >> .gitignore
        echo "✅ Added .env to .gitignore"
    fi
else
    echo ".env" > .gitignore
    echo "✅ Created .gitignore with .env"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. If you haven't already, get your API key from: https://makersuite.google.com/app/apikey"
echo "2. Make sure your .env file contains: GEMINI_API_KEY=your_key_here"
echo "3. Run: npm run dev"
echo "4. Navigate to: http://localhost:5173/iq"
echo ""
echo "For more information, see GEMINI_SETUP.md"
