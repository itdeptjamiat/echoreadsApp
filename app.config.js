const IS_DEV = process.env.NODE_ENV === 'development';

export default {
  expo: {
    name: "EchoReads",
    slug: "echoreads",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#0a0a0a"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.echoreads.app",
      buildNumber: "1.0.0",
      icon: "./assets/logo.png",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#0a0a0a"
      },
      icon: "./assets/logo.png",
      package: "com.echoreads.app",
      versionCode: 1,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "CAMERA",
        "VIBRATE"
      ],
      blockedPermissions: [
        "android.permission.RECORD_AUDIO"
      ]
    },
    web: {
      favicon: "./assets/favicon_io/favicon-32x32.png",
      themeColor: "#f59e0b",
      backgroundColor: "#0a0a0a",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "expo-secure-store"
    ],
    scheme: "echoreads",
    extra: {
      apiUrl: process.env.API_URL || "https://api.echoreads.online/api/v1",
      eas: {
        projectId: "d2f68c05-1369-40a2-91f1-51a3bbbd5db6"
      }
    }
  }
}; 