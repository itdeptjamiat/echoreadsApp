@echo off
echo 🚀 Starting EchoReads in development mode...

REM Set development environment
set NODE_ENV=development

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Run type check
echo 🔍 Running TypeScript check...
call npm run type-check

REM Start development server
echo 🌐 Starting development server...
call npm start

pause 