# AdMob Banner Plan

Generated: 2026-05-02

## Decision

Use `react-native-google-mobile-ads` for real Google AdMob banners. Do not use `expo-ads-admob`; Expo marks it deprecated and removed from modern SDKs.

## Current App State

- The visible ad rail remains a safe placeholder in `AdBanner`.
- The rail now reads as an AdMob-ready slot.
- Real AdMob app IDs and banner ad-unit IDs now exist in AdMob and are recorded in `constants/revenue.ts`.
- Live AdMob SDK wiring is gated only on installing the native package and rebuilding with EAS.

## AdMob IDs

- Publisher ID: `pub-2087477661680036`
- Android app ID: `ca-app-pub-2087477661680036~5812166270`
- Android banner ad unit ID: `ca-app-pub-2087477661680036/3425676084`
- iOS app ID: `ca-app-pub-2087477661680036~6821995611`
- iOS banner ad unit ID: `ca-app-pub-2087477661680036/1976863044`

## Implementation Path

1. Install `react-native-google-mobile-ads`.
2. Add the Expo config plugin with `androidAppId` and `iosAppId`.
3. Add a native banner component using the platform-specific banner unit ID.
4. Use Google demo ad units only during development/test builds.
5. Use the real IDs for production builds.
6. In Google Play Console, mark that the app contains ads under App content.
7. Complete the AdMob payment profile so AdMob can review the apps and begin normal ad serving.

## Official References

- Expo deprecated `expo-ads-admob` and points EAS/development-build users to `react-native-google-mobile-ads`: https://github.com/expo/expo-ads-admob
- `react-native-google-mobile-ads` Expo setup and config plugin: https://docs.page/invertase/react-native-google-mobile-ads
- Google Android banner guide and test-unit warning: https://developers.google.com/admob/android/banner
- Google Android demo ad units: https://developers.google.com/admob/android/test-ads
- Google iOS demo ad units: https://developers.google.com/admob/ios/test-ads
