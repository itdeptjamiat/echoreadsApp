@echo off
echo 🚀 Building EchoReads locally...

REM Set development environment
set NODE_ENV=development

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist .expo rmdir /s /q .expo

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Run type check
echo 🔍 Running TypeScript check...
call npm run type-check

REM Run linting
echo 🔍 Running linting...
call npm run lint

REM Build for web
echo 🌐 Building for web...
call npm run build:web

echo ✅ Local build completed successfully!
echo 🌐 Web build: dist/
echo.
echo To run the app locally:
echo 1. npm start
echo 2. Press 'w' for web
echo 3. Press 'a' for Android
echo 4. Press 'i' for iOS
pause 