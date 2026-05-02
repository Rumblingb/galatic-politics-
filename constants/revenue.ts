export const POLYMARKET_AFFILIATE_URL =
  process.env.EXPO_PUBLIC_POLYMARKET_AFFILIATE_URL ??
  'https://polymarket.com/?utm_source=power_cabinet&utm_medium=app_affiliate&utm_campaign=market_watch';

export const ADMOB_BANNER_STATUS = {
  provider: 'Google AdMob',
  format: 'anchored adaptive banner',
  sdk: 'react-native-google-mobile-ads',
  enabled: process.env.EXPO_PUBLIC_ENABLE_ADMOB === 'true',
  androidAdUnitId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID ?? '',
  iosAdUnitId: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID ?? '',
};
