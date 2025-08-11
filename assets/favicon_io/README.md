# EchoReads Favicon & Logo Setup

This folder contains all the favicon and icon assets for the EchoReads application across different platforms and sizes.

## 📁 File Structure

```
assets/favicon_io/
├── android-chrome-192x192.png    # Android Chrome icon (192x192)
├── android-chrome-512x512.png    # Android Chrome icon (512x512)
├── apple-touch-icon.png          # iOS Safari icon (180x180)
├── favicon-16x16.png            # Small favicon (16x16)
├── favicon-32x32.png            # Standard favicon (32x32)
├── favicon.ico                  # ICO format favicon
├── site.webmanifest            # Web app manifest
├── index.html                  # Demo page showing all icons
└── README.md                   # This file
```

## 🎯 Usage

### Mobile Apps (iOS & Android)
- **App Icon**: Uses `../logo.png` (main app icon)
- **Splash Screen**: Uses `../logo.png` (loading screen)
- **Adaptive Icon**: Uses `../logo.png` (Android adaptive icon)

### Web App
- **Favicon**: Uses `favicon-32x32.png` (browser tab icon)
- **Apple Touch Icon**: Uses `apple-touch-icon.png` (iOS home screen)
- **Android Chrome**: Uses `android-chrome-512x512.png` (Android home screen)
- **Web Manifest**: Uses `site.webmanifest` (PWA configuration)

## ⚙️ Configuration

### app.config.js Updates
The main app configuration has been updated to use your new assets:

```javascript
// Main app icon
icon: "./assets/logo.png"

// Splash screen
splash: {
  image: "./assets/logo.png",
  resizeMode: "contain",
  backgroundColor: "#0a0a0a"
}

// iOS specific
ios: {
  icon: "./assets/logo.png"
}

// Android specific
android: {
  adaptiveIcon: {
    foregroundImage: "./assets/logo.png",
    backgroundColor: "#0a0a0a"
  },
  icon: "./assets/logo.png"
}

// Web specific
web: {
  favicon: "./assets/favicon_io/favicon-32x32.png",
  themeColor: "#f59e0b",
  backgroundColor: "#0a0a0a"
}
```

### Web Manifest
The `site.webmanifest` file is configured with:
- **App Name**: EchoReads
- **Theme Color**: #f59e0b (Gold)
- **Background Color**: #0a0a0a (Dark)
- **Display Mode**: Standalone (PWA)
- **Orientation**: Portrait

## 🌐 Web Implementation

To use these favicons in your web app, include these meta tags in your HTML `<head>`:

```html
<!-- Basic favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="shortcut icon" href="/favicon.ico">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Web App Manifest -->
<link rel="manifest" href="/site.webmanifest">

<!-- Theme Colors -->
<meta name="theme-color" content="#f59e0b">
<meta name="msapplication-TileColor" content="#f59e0b">
```

## 🎨 Brand Colors

- **Primary Gold**: #f59e0b
- **Background**: #0a0a0a
- **Surface**: #1a1a1a
- **Text**: #ffffff

## 📱 Platform Support

### iOS
- App Store icon
- Home screen icon
- Settings icon
- Spotlight search icon

### Android
- Play Store icon
- Home screen icon
- App drawer icon
- Adaptive icon support

### Web
- Browser tab favicon
- Bookmark icon
- PWA home screen icon
- Touch device icons

## 🔄 Updating Icons

When you need to update your icons:

1. Replace the corresponding PNG files in this folder
2. Ensure the new images maintain the same dimensions
3. Update `../logo.png` for the main app icon
4. Test on all platforms to ensure proper display

## 📋 Testing

- **Mobile**: Build and install the app to see the new icons
- **Web**: Open `index.html` in a browser to preview all favicon sizes
- **PWA**: Install as a web app to test home screen icons

## 🚀 Next Steps

1. **Build your app** to see the new icons in action
2. **Test on different devices** to ensure proper scaling
3. **Verify web favicons** by opening your app in a browser
4. **Customize colors** in `site.webmanifest` if needed

---

*Last updated: $(date)*
*EchoReads App Version: 1.0.0* 