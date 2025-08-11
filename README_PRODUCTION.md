# EchoReads - Production Deployment Guide

## 🚀 Overview

EchoReads is a React Native/Expo application for reading magazines and publications. This guide covers setting up, building, and deploying the app for production.

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g @expo/eas-cli`)
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

## 🏗️ Project Structure

```
Echoreads/
├── app/                    # Expo Router screens
├── src/
│   ├── components/         # Reusable UI components
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── redux/             # Redux store and slices
│   ├── screens/           # App screens
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, and static assets
├── config/                # Environment configuration
└── scripts/               # Build and deployment scripts
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
API_URL=https://api.echoreads.online/api/v1

# Build Configuration
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.echoreads.online/api/v1

# EAS Build Configuration
EAS_PROJECT_ID=your-project-id

# Sentry Configuration (Optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=echoreads
```

### App Configuration

The app uses `app.config.js` for configuration. Key settings:

- **Bundle Identifier**: `com.echoreads.app`
- **Version**: `1.0.0`
- **Build Number**: `1.0.0`
- **Orientation**: Portrait
- **User Interface Style**: Dark

## 🔧 Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Run on specific platform:**
   ```bash
   npm run android    # Android
   npm run ios        # iOS
   npm run web        # Web
   ```

## 🧪 Testing & Quality Assurance

1. **Type checking:**
   ```bash
   npm run type-check
   ```

2. **Linting:**
   ```bash
   npm run lint
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

## 🏗️ Building for Production

### Web Build

```bash
npm run build:web
```

This creates a `dist/` folder with the web build.

### Android Build

```bash
npm run build:android
```

Requirements:
- Android Studio installed
- Android SDK configured
- Keystore file for signing

### iOS Build

```bash
npm run build:ios
```

Requirements:
- macOS with Xcode installed
- Apple Developer account
- Provisioning profiles

### All Platforms

```bash
npm run build:all
```

## 🚀 Deployment

### Web Deployment

1. **Build the web version:**
   ```bash
   npm run build:web
   ```

2. **Deploy to hosting service:**
   - **Vercel**: `vercel --prod`
   - **Netlify**: `netlify deploy --prod`
   - **Firebase**: `firebase deploy`

### Mobile App Deployment

1. **EAS Build (Recommended):**
   ```bash
   # Install EAS CLI
   npm install -g @expo/eas-cli
   
   # Login to Expo
   eas login
   
   # Configure EAS
   eas build:configure
   
   # Build for production
   eas build --platform all --profile production
   ```

2. **Manual Build:**
   ```bash
   # Android
   npx expo build:android --release-channel production
   
   # iOS
   npx expo build:ios --release-channel production
   ```

### App Store Deployment

1. **Android (Google Play Store):**
   - Upload APK/AAB to Google Play Console
   - Complete store listing
   - Submit for review

2. **iOS (App Store):**
   - Upload IPA to App Store Connect
   - Complete app information
   - Submit for review

## 📱 Production Features

### Error Handling
- Error boundaries for graceful error handling
- Production logging (configurable)
- User-friendly error messages

### Performance
- Lazy loading of components
- Image optimization
- Bundle size optimization

### Security
- Secure storage for sensitive data
- API authentication
- Input validation

### Monitoring
- Error tracking (Sentry integration ready)
- Performance monitoring
- User analytics

## 🔒 Security Considerations

1. **API Security:**
   - Use HTTPS for all API calls
   - Implement proper authentication
   - Validate all inputs

2. **Data Storage:**
   - Use Expo SecureStore for sensitive data
   - Implement proper data encryption
   - Regular security audits

3. **Code Protection:**
   - Obfuscate production builds
   - Remove debug information
   - Secure API keys

## 📊 Monitoring & Analytics

### Error Tracking
- Sentry integration for error monitoring
- Crash reporting
- Performance metrics

### User Analytics
- User behavior tracking
- Reading progress analytics
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check TypeScript errors: `npm run type-check`
   - Verify dependencies: `npm install`
   - Clear cache: `npx expo start --clear`

2. **Runtime Errors:**
   - Check error boundaries
   - Verify API endpoints
   - Check network connectivity

3. **Performance Issues:**
   - Optimize images
   - Implement lazy loading
   - Monitor bundle size

### Support

For production issues:
1. Check error logs
2. Verify environment configuration
3. Test on multiple devices
4. Contact development team

## 📈 Performance Optimization

### Bundle Optimization
- Tree shaking
- Code splitting
- Lazy loading

### Image Optimization
- WebP format support
- Progressive loading
- Caching strategies

### Network Optimization
- Request caching
- Compression
- Offline support

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build:web
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Router Documentation](https://expo.github.io/router/)

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: EchoReads Development Team 