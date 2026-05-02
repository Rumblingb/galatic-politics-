# Power Cabinet Release QA

Generated: 2026-05-02

## Automated Checks

- `npm run lint`
- `npm run typecheck`
- `npm run doctor`
- `npm run export:web`

## Manual Checks

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
- Android build output must be `.aab`.
- iOS build output must be App Store distribution build.
- Final Google Play/App Store submission requires active developer accounts and confirmation before submitting externally.
