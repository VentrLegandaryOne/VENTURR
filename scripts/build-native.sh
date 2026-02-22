#!/bin/bash

# VENTURR VALDT Native App Build Script
# This script builds the web app and syncs it with native platforms

set -e

echo "🚀 VENTURR VALDT Native Build Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must be run from project root directory${NC}"
    exit 1
fi

# Parse arguments
PLATFORM=""
BUILD_TYPE="debug"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --android) PLATFORM="android" ;;
        --ios) PLATFORM="ios" ;;
        --all) PLATFORM="all" ;;
        --release) BUILD_TYPE="release" ;;
        --debug) BUILD_TYPE="debug" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$PLATFORM" ]; then
    echo "Usage: ./scripts/build-native.sh [--android|--ios|--all] [--debug|--release]"
    echo ""
    echo "Options:"
    echo "  --android    Build for Android only"
    echo "  --ios        Build for iOS only"
    echo "  --all        Build for both platforms"
    echo "  --debug      Build debug version (default)"
    echo "  --release    Build release version"
    exit 1
fi

# Step 1: Build the web app
echo ""
echo -e "${YELLOW}Step 1: Building web app...${NC}"
pnpm run build:client

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Web build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Web app built successfully${NC}"

# Step 2: Sync with Capacitor
echo ""
echo -e "${YELLOW}Step 2: Syncing with Capacitor...${NC}"

if [ "$PLATFORM" == "android" ] || [ "$PLATFORM" == "all" ]; then
    npx cap sync android
    echo -e "${GREEN}✓ Android synced${NC}"
fi

if [ "$PLATFORM" == "ios" ] || [ "$PLATFORM" == "all" ]; then
    npx cap sync ios
    echo -e "${GREEN}✓ iOS synced${NC}"
fi

# Step 3: Build native apps
echo ""
echo -e "${YELLOW}Step 3: Building native apps...${NC}"

if [ "$PLATFORM" == "android" ] || [ "$PLATFORM" == "all" ]; then
    echo "Building Android..."
    cd android
    
    if [ "$BUILD_TYPE" == "release" ]; then
        ./gradlew assembleRelease
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
    else
        ./gradlew assembleDebug
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    fi
    
    cd ..
    
    if [ -f "android/$APK_PATH" ]; then
        mkdir -p dist/native
        cp "android/$APK_PATH" "dist/native/venturr-valdt-$BUILD_TYPE.apk"
        echo -e "${GREEN}✓ Android APK built: dist/native/venturr-valdt-$BUILD_TYPE.apk${NC}"
    else
        echo -e "${RED}Warning: APK not found at expected location${NC}"
    fi
fi

if [ "$PLATFORM" == "ios" ] || [ "$PLATFORM" == "all" ]; then
    echo "Building iOS..."
    echo -e "${YELLOW}Note: iOS builds require Xcode on macOS${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        cd ios/App
        
        if [ "$BUILD_TYPE" == "release" ]; then
            xcodebuild -workspace App.xcworkspace \
                       -scheme App \
                       -configuration Release \
                       -archivePath build/App.xcarchive \
                       archive
            echo -e "${GREEN}✓ iOS archive created${NC}"
        else
            xcodebuild -workspace App.xcworkspace \
                       -scheme App \
                       -configuration Debug \
                       -sdk iphonesimulator \
                       build
            echo -e "${GREEN}✓ iOS debug build completed${NC}"
        fi
        
        cd ../..
    else
        echo -e "${YELLOW}Skipping iOS build (requires macOS with Xcode)${NC}"
    fi
fi

# Summary
echo ""
echo "===================================="
echo -e "${GREEN}Build completed!${NC}"
echo ""
echo "Output files:"
if [ "$PLATFORM" == "android" ] || [ "$PLATFORM" == "all" ]; then
    echo "  Android: dist/native/venturr-valdt-$BUILD_TYPE.apk"
fi
if [ "$PLATFORM" == "ios" ] || [ "$PLATFORM" == "all" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  iOS: ios/App/build/"
    fi
fi
echo ""
echo "Next steps:"
echo "  - Android: Install APK on device or upload to Play Store"
echo "  - iOS: Open ios/App/App.xcworkspace in Xcode to archive and distribute"
