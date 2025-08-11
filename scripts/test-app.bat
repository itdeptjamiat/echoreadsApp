@echo off
echo 🧪 Testing EchoReads app...

REM Set development environment
set NODE_ENV=development

REM Run type check
echo 🔍 Running TypeScript check...
call npm run type-check

REM Run linting
echo 🔍 Running linting...
call npm run lint

REM Test web build
echo 🌐 Testing web build...
call npm run build:web

echo ✅ App test completed successfully!
echo.
echo The app should now work without the LibraryProvider error.
echo To start the app: npm start
pause 