#!/bin/bash

echo "🚀 Starting production build for EchoReads..."

# Set production environment
export NODE_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf .expo/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Run type check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build for web
echo "🌐 Building for web..."
npx expo export --platform web

# Build for Android (Local)
echo "🤖 Building for Android (Local)..."
npx expo run:android --variant release

# Build for iOS (Local)
echo "🍎 Building for iOS (Local)..."
npx expo run:ios --configuration Release

echo "✅ Production build completed successfully!"
echo "📱 Android APK: android/app/build/outputs/apk/release/"
echo "🍎 iOS IPA: ios/build/Release/"
echo "🌐 Web: dist/" 