# VENTURR VALDT Native App Build Guide

This guide explains how to build native iOS and Android apps from the VENTURR VALDT web application using Capacitor.

## Prerequisites

### For Android Builds
- Node.js 18+ and pnpm
- Java JDK 17+
- Android Studio with Android SDK
- Android SDK Build Tools 34+

### For iOS Builds
- macOS with Xcode 15+
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer Account (for distribution)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build Web App

```bash
pnpm run build:client
```

### 3. Initialize Native Platforms

First time only - add native platforms:

```bash
# Add Android
npx cap add android

# Add iOS (macOS only)
npx cap add ios
```

### 4. Sync Web Assets

After any web changes:

```bash
npx cap sync
```

### 5. Open in Native IDE

```bash
# Open in Android Studio
npx cap open android

# Open in Xcode (macOS only)
npx cap open ios
```

## Building APK (Android)

### Debug Build

```bash
./scripts/build-native.sh --android --debug
```

Output: `dist/native/venturr-valdt-debug.apk`

### Release Build

1. Create a keystore (first time only):
```bash
keytool -genkey -v -keystore venturr-valdt.keystore -alias venturr -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('venturr-valdt.keystore')
            storePassword 'your-password'
            keyAlias 'venturr'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. Build release:
```bash
./scripts/build-native.sh --android --release
```

Output: `dist/native/venturr-valdt-release.apk`

## Building IPA (iOS)

### Development Build

1. Open in Xcode:
```bash
npx cap open ios
```

2. Select your development team in Xcode
3. Build and run on simulator or device

### Distribution Build

1. In Xcode, select "Any iOS Device" as target
2. Product → Archive
3. Distribute App → App Store Connect or Ad Hoc

## App Configuration

### App Icons

Place icons in:
- Android: `android/app/src/main/res/mipmap-*`
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset`

Recommended sizes:
- Android: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512
- iOS: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### Splash Screen

Configure in `capacitor.config.ts`:
```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#0891b2',
  }
}
```

### Push Notifications

1. Android: Add `google-services.json` to `android/app/`
2. iOS: Enable Push Notifications capability in Xcode

## Live Reload (Development)

For development with live reload:

1. Start the dev server:
```bash
pnpm run dev
```

2. Update `capacitor.config.ts`:
```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:3000',
  cleartext: true,
}
```

3. Sync and run:
```bash
npx cap sync
npx cap run android
```

## Troubleshooting

### Android Build Fails

1. Check Java version: `java -version` (should be 17+)
2. Check Android SDK: `echo $ANDROID_HOME`
3. Accept licenses: `sdkmanager --licenses`

### iOS Build Fails

1. Update CocoaPods: `pod repo update`
2. Clean pods: `cd ios/App && pod deintegrate && pod install`
3. Clean Xcode: Product → Clean Build Folder

### Capacitor Sync Issues

```bash
npx cap sync --force
```

## App Store Submission

### Google Play Store

1. Build release APK or AAB
2. Create app in Google Play Console
3. Upload APK/AAB
4. Fill in store listing
5. Submit for review

### Apple App Store

1. Archive in Xcode
2. Upload to App Store Connect
3. Fill in app information
4. Submit for review

## Native Plugin Usage

The app includes these native plugins:

| Plugin | Purpose |
|--------|---------|
| @capacitor/camera | Photo capture and gallery |
| @capacitor/filesystem | File storage |
| @capacitor/haptics | Haptic feedback |
| @capacitor/keyboard | Keyboard control |
| @capacitor/local-notifications | Local notifications |
| @capacitor/push-notifications | Push notifications |
| @capacitor/share | Native share sheet |
| @capacitor/splash-screen | Splash screen |
| @capacitor/status-bar | Status bar styling |

Import and use in your code:
```typescript
import { camera, haptics, share } from '@/lib/native';

// Take a photo
const result = await camera.takePhoto();

// Haptic feedback
await haptics.impact('medium');

// Share content
await share.share({ title: 'Quote', url: 'https://...' });
```

## Support

For build issues, check:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/studio)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
