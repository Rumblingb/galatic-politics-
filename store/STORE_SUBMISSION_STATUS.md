# Power Cabinet Store Submission Status

Generated: 2026-05-02

## Ready

- Expo project: `@rumblingb/power-cabinet`
- Android package: `com.agentpay.powercabinet`
- iOS bundle ID: `com.agentpay.powercabinet`
- Android version code: `2`
- iOS build number: `1`
- Export compliance flag: `ITSAppUsesNonExemptEncryption=false`
- Production Android AAB: `store/builds/power-cabinet-android-v2.aab`
- EAS Android build: `https://expo.dev/accounts/rumblingb/projects/power-cabinet/builds/961072bd-a5db-4751-973b-4bdf7243b0f3`
- AdMob Android app: `ca-app-pub-2087477661680036~5812166270`
- AdMob Android banner unit: `ca-app-pub-2087477661680036/3425676084`
- AdMob iOS app: `ca-app-pub-2087477661680036~6821995611`
- AdMob iOS banner unit: `ca-app-pub-2087477661680036/1976863044`

## Verified

- `npm run qa` passed after EAS project link and export-compliance update.
- Xcode simulator build passed for `PowerCabinet`.
- Xcode Release simulator build passed and embedded the JS bundle; first-run native store hero was captured at `store/screenshots/native/ios-store-login-ready.png`.
- Android `.aab` downloaded and validated with `unzip -t`.

## Not Submitted Yet

- Google Play: EAS Submit stopped at the required Google Service Account JSON key prompt. The Play Console is logged in and shows one existing draft app, but `Power Cabinet` has not been created/uploaded there yet.
- Apple App Store: Xcode archive stopped because no development team/signing identity is configured locally. Apple Developer web access is blocked by the updated program license agreement review requirement.
- AdMob: Android and iOS Power Cabinet apps plus banner units are created. AdMob still shows payment setup incomplete, so app review/ad serving will remain limited until the payment profile is completed.

## Next Human Gates

- Accept/review the Apple Developer Program License Agreement in Apple Developer.
- Provide Apple password/2FA when EAS or Xcode requests it, or add the Apple account in Xcode and let it create/download signing assets.
- Provide a Google Play service account JSON for automated EAS Submit, or confirm manual Play Console draft creation/upload of the AAB.
- Confirm before final App Store Review / Google Play production submission.
