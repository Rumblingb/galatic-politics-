# Power Cabinet Release QA

Generated: 2026-05-02

## Automated Checks

- `npm run lint` - pass
- `npm run typecheck` - pass
- `npm run doctor` - pass, 17/17 checks
- `npm run export:web` - pass
- Xcode simulator build - pass, `PowerCabinet` Debug / iPhone 17 simulator
- Xcode simulator release build - pass, `PowerCabinet` Release / iPhone 17 simulator with embedded JS bundle
- Android production build - pass, EAS build `961072bd-a5db-4751-973b-4bdf7243b0f3`
- Android `.aab` integrity - pass, `unzip -t` no errors

## Manual Checks

- First-run native login/store hero screen captured at `store/screenshots/native/ios-store-login-ready.png`.
- Draft tab opens without login blockers.
- Swipe actions respond: right drafts, left passes, up marks captain.
- League tab renders standings and current score.
- Teams tab renders sample portraits and handles missing politician IDs without crashing.
- Clips tab renders share/poster creative.
- No real-money betting or trading is available inside the app.

## Store Release Gate

- Android package: `com.agentpay.powercabinet`
- iOS bundle ID: `com.agentpay.powercabinet`
- Build profile: `production`
- Expo project: `@rumblingb/power-cabinet`
- Android build output: `.aab` available from EAS and locally at `store/builds/power-cabinet-android-v2.aab` (ignored from Git)
- iOS build output must be App Store distribution build.
- Final Google Play/App Store submission requires active developer accounts and confirmation before submitting externally.

## Current Store Blockers

- Google Play upload through EAS Submit requires a Google Service Account JSON key, or a manual upload through Play Console.
- Apple archive requires a development team, distribution certificate, and provisioning profile.
- Apple Developer account currently requires the latest Apple Developer Program License Agreement to be reviewed before Certificates, App Store Connect, and App Store Connect API access are available.
- EAS iOS credential setup reaches the Apple password prompt for `vishar.rumbling@gmail.com`; no password was entered.
