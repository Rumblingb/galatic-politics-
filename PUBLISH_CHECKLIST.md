# Power Cabinet — Publish Checklist

## Step 1 — Install new dependencies
```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage expo-apple-authentication expo-auth-session expo-crypto react-native-url-polyfill
```

## Step 2 — Supabase setup (10 min)
1. Go to https://supabase.com → New project
2. Copy your project URL and anon key
3. Run `supabase-migration.sql` in the SQL editor
4. Enable Apple provider: Authentication → Providers → Apple
5. Enable Google provider: Authentication → Providers → Google
6. Set redirect URL: `powercabinet://auth/callback`

## Step 3 — Google OAuth (15 min)
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 Client IDs (iOS + Android)
3. Add your Supabase redirect URL to authorized redirect URIs

## Step 4 — Apple Sign In (requires Apple Developer account)
1. Enable Sign in with Apple for your App ID at developer.apple.com
2. Create a Services ID and configure the domain
3. Add the key to your Supabase Apple provider settings

## Step 5 — Environment variables
Copy `.env.example` to `.env` and fill in:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Step 6 — EAS setup
```bash
npm install -g eas-cli
eas login
eas init          # creates EAS project, replace REPLACE_WITH_EAS_PROJECT_ID in app.json
```

## Step 7 — Build
```bash
# iOS (TestFlight)
eas build --platform ios --profile preview

# Android (Play Store internal)
eas build --platform android --profile preview
```

## Step 8 — Store listings

### App Store (App Store Connect)
- Name: Power Cabinet
- Subtitle: Build your global cabinet
- Category: Games → Strategy
- Privacy Policy URL: https://rumblingb.github.io/agentpay-labs-hub/privacy/power-cabinet.html
- Support URL: mailto:vishar.rumbling@gmail.com
- Age Rating: 12+ (political satire, realistic depictions)
- In-App Purchase: Pro Cabinet - $9.99/month (create in App Store Connect)

### Google Play Console
- Title: Power Cabinet
- Short description: Swipe to draft world leaders. Build your political cabinet.
- Category: Strategy
- Content rating: Teen (political content, mild language)
- Privacy policy: https://rumblingb.github.io/agentpay-labs-hub/privacy/power-cabinet.html

## Step 9 — Submit
```bash
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

## What's done ✅
- [x] Bundle IDs configured (com.agentpaylabs.powercabinet)
- [x] Sign in with Apple + Google auth
- [x] Supabase cloud save (roster persists across devices)
- [x] Pro gating (Free: 8 politicians, Pro: 16 + wild cards + export)
- [x] Pro tab with upgrade flow (Stripe)
- [x] ChallengerOverlay — Pro only (no broken stub in free)
- [x] Packs tab hidden (v2)
- [x] Privacy policy hosted at GitHub Pages URL
- [x] eas.json build config
- [x] Swipe deck stale closure fixed
- [x] First-use swipe hint animation

## What you still need to do 🔲
- [ ] Run `npx expo install` (adds new deps)
- [ ] Create Supabase project + run migration SQL
- [ ] Set up Google OAuth client IDs
- [ ] Set up Apple Sign In in Apple Developer portal
- [ ] Fill in `.env` file
- [ ] Run `eas init` to get EAS project ID
- [ ] Create Apple In-App Purchase for Pro ($9.99/mo) in App Store Connect
- [ ] Replace Stripe payment link with native IAP for App Store compliance
  ↳ Apple requires in-app purchases go through IAP (30% cut) — Stripe is fine for Android only
- [ ] Create store screenshots (6.7" iPhone + Pixel 6)
- [ ] App icon + splash screen (replace stock Expo assets)
