# Power Cabinet

Power Cabinet is a political fantasy-card game built with Expo and React Native. Players draft a five-card cabinet of world leaders, score promise receipts, and climb the league table through momentum, market-style signals, and the truth tax.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## QA

Run the full release QA:

```bash
npm run qa
```

Individual checks:

```bash
npm run lint
npm run typecheck
npm run doctor
npm run export:web
```

## Quick Demo

Open the web UI and use the `Draft`, `League`, `Teams`, and `Clips` tabs. The app is entertainment only and does not provide betting, trading, financial advice, or real-money market execution.

## Release

The production bundle identifiers are:

- Android: `com.agentpay.powercabinet`
- iOS: `com.agentpay.powercabinet`

Build with EAS after logging in to Expo and connecting the Apple/Google developer accounts:

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

Submit only after the production builds pass QA and the final store submission is approved:

```bash
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## Automation Scripts

Several helper scripts are provided in `scripts/`:

- `scripts/wikidata_fetch.js` — exports `reports/leaders_wikidata.json` via SPARQL.
- `scripts/fetch_portraits_rate_limited.js` — download politician portraits (rate-limited).
- `scripts/fetch_portraits_backoff.js` — robust portrait downloader with exponential backoff.
- `scripts/generate_promise_report.js` — regenerates `reports/promise_report.json`.
- `scripts/generate_wikipedia_patches.js` — writes suggested wiki patches to `reports/wiki_patches/`.
- `scripts/generate_teams.js` — generates `data/teams.ts` grouped by country.

Run them with `node scripts/<script>.js`.

## CI

A GitHub Action `.github/workflows/generate-assets.yml` regenerates leaders, downloads portraits, and writes reports on push to `main`.

## Get A Fresh Project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
