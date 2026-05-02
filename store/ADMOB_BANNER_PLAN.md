# AdMob Banner Plan

Generated: 2026-05-02

## Decision

Use `react-native-google-mobile-ads` for real Google AdMob banners. Do not use `expo-ads-admob`; Expo marks it deprecated and removed from modern SDKs.

## Current App State

- The visible ad rail remains a safe placeholder in `AdBanner`.
- The rail now reads as an AdMob-ready slot.
- Live AdMob SDK wiring is intentionally gated until real AdMob app IDs and banner ad-unit IDs exist.

## Required Credentials

- Android AdMob app ID for `com.agentpay.powercabinet`
- iOS AdMob app ID for `com.agentpay.powercabinet`
- Android banner ad unit ID
- iOS banner ad unit ID

## Implementation Path

1. Create/select the Android and iOS apps in AdMob.
2. Create anchored adaptive banner ad units for each platform.
3. Install `react-native-google-mobile-ads`.
4. Add the Expo config plugin with `androidAppId` and `iosAppId`.
5. Add a native banner component using the platform-specific banner unit ID.
6. Use Google demo ad units only during development/test builds.
7. Replace demo IDs with real IDs before store submission.
8. In Google Play Console, mark that the app contains ads under App content.

## Official References

- Expo deprecated `expo-ads-admob` and points EAS/development-build users to `react-native-google-mobile-ads`: https://github.com/expo/expo-ads-admob
- `react-native-google-mobile-ads` Expo setup and config plugin: https://docs.page/invertase/react-native-google-mobile-ads
- Google Android banner guide and test-unit warning: https://developers.google.com/admob/android/banner
- Google Android demo ad units: https://developers.google.com/admob/android/test-ads
- Google iOS demo ad units: https://developers.google.com/admob/ios/test-ads
