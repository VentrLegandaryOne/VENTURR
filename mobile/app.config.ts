import { ExpoConfig, ConfigContext } from 'expo/config';

const defineConfig = (_ctx: ConfigContext): ExpoConfig => ({
  name: 'Venturr Mobile',
  slug: 'venturr-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTabletMode: true,
    bundleIdentifier: 'com.venturr.mobile',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.venturr.mobile',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Venturr to access your camera for site measurements.',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Venturr to access your location for project mapping.',
      },
    ],
    [
      'expo-file-system',
      {
        documentDirectory: 'Venturr',
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000',
  },
});

export default defineConfig;

