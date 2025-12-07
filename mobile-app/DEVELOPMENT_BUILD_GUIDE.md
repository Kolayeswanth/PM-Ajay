# How to Test Push Notifications (Development Build Guide)

You are seeing warnings because **remote push notifications do not work in Expo Go** (the standard testing app) on iOS as of SDK 53+.

To test notifications properly, you need to create a **Development Build**. This is a custom version of the app that includes all your native libraries (like `expo-notifications`) but still allows you to develop with hot reload.

## Prerequisites

1.  **EAS CLI**: Install it globally if you haven't.
    ```bash
    npm install -g eas-cli
    ```

2.  **Expo Account**: You need to be logged in.
    ```bash
    eas login
    ```

## Option 1: Build for Simulator (No Apple Developer Account Needed)

If you are testing on an iOS Simulator on a Mac, this is easiest. **Note: You cannot run iOS Simulator on Windows.**

1.  Configure the build profile:
    ```bash
    eas build:configure
    ```
    (Select `iOS` -> `development`)

2.  Run the build:
    ```bash
    eas build --profile development --platform ios --local
    ```

## Option 2: Build for Real Device (Apple Developer Account Required)

If you have an iPhone and Windows, you must use EAS Build service (cloud). **This requires a paid Apple Developer Account ($99/year).**

1.  Run the build command:
    ```bash
    eas build --profile development --platform ios
    ```

2.  Follow the prompts to sign in content with your Apple ID.

3.  Once finished, scan the QR code to install *your custom app* instead of Expo Go.

4.  Start your development server specifically for this build:
    ```bash
    npx expo start --dev-client
    ```

## Option A (Recommended for Free Testing): Use Android Emulator

If you do not have a paid Apple Developer Account and are on Windows:
1.  Use the Android Emulator (from Android Studio).
2.  Expo notifications work better there, or you can easily create a development build for Android (APK) without paying.

    ```bash
    eas build --profile development --platform android --local
    ```
    (Or just use `npx expo run:android` if you have the environment set up).
