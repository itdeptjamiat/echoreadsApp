#!/bin/bash

# EchoReads Production Build Script
echo "🚀 Starting EchoReads Production Build..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if logged in to Expo
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please run: eas login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false

# Run linting
echo "🔍 Running linting..."
npm run lint

# Type checking
echo "📝 Type checking..."
npx tsc --noEmit

# Build for production
echo "🏗️ Building for production..."
npm run build:production

echo "✅ Production build completed successfully!"
echo "📱 Your app is ready for deployment!" 