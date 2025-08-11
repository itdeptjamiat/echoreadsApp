@echo off
echo 🚀 Starting production build for EchoReads...

REM Set production environment
set NODE_ENV=production

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist .expo rmdir /s /q .expo

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci --production

REM Run type check
echo 🔍 Running TypeScript check...
call npx tsc --noEmit

REM Run linting
echo 🔍 Running linting...
call npm run lint

REM Build for web
echo 🌐 Building for web...
call npx expo export --platform web

REM Build for Android (Local)
echo 🤖 Building for Android (Local)...
call npx expo run:android --variant release

REM Build for iOS (Local)
echo 🍎 Building for iOS (Local)...
call npx expo run:ios --configuration Release

echo ✅ Production build completed successfully!
echo 📱 Android APK: android/app/build/outputs/apk/release/
echo 🍎 iOS IPA: ios/build/Release/
echo �� Web: dist/
pause 