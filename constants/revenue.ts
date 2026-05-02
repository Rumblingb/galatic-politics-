export const POLYMARKET_AFFILIATE_URL =
  process.env.EXPO_PUBLIC_POLYMARKET_AFFILIATE_URL ??
  'https://polymarket.com/?utm_source=power_cabinet&utm_medium=app_affiliate&utm_campaign=market_watch';

export const ADMOB_BANNER_STATUS = {
  provider: 'Google AdMob',
  format: 'large anchored adaptive banner',
  sdk: 'react-native-google-mobile-ads',
  enabled: process.env.EXPO_PUBLIC_ENABLE_ADMOB === 'true',
  androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ?? 'ca-app-pub-2087477661680036~5812166270',
  iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? 'ca-app-pub-2087477661680036~6821995611',
  androidAdUnitId:
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID ?? 'ca-app-pub-2087477661680036/3425676084',
  iosAdUnitId: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID ?? 'ca-app-pub-2087477661680036/1976863044',
};
