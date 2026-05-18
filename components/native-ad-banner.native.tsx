import { StyleSheet, View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { ADMOB_BANNER_STATUS } from '@/constants/revenue';

export function NativeAdBanner() {
  if (!ADMOB_BANNER_STATUS.enabled) {
    return null;
  }

  const productionUnitId = Platform.select({
    android: ADMOB_BANNER_STATUS.androidAdUnitId,
    ios: ADMOB_BANNER_STATUS.iosAdUnitId,
    default: '',
  });
  const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_ADMOB_USE_TEST_IDS === 'true';
  const unitId = useTestAds ? TestIds.BANNER : productionUnitId;

  if (!unitId) {
    return null;
  }

  return (
    <View style={styles.bannerSlot}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    width: '100%',
  },
});
