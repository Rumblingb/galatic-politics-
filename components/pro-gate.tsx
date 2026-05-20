import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/providers/auth-provider';

const PRO_STRIPE_URL = 'https://buy.stripe.com/bJe00la1xbg05zG5QT1oI1g';

const PRO_FEATURES = [
  { icon: 'globe', label: 'Full 16-politician roster', detail: 'Free tier gets 8' },
  { icon: 'flash', label: 'Wild card events', detail: 'Live score shakers' },
  { icon: 'bar-chart', label: 'Full draft stats', detail: 'History & analytics' },
  { icon: 'image', label: 'Card image export', detail: 'Share on socials' },
];

type ProGateProps = {
  feature: string;
  children: React.ReactNode;
};

export function ProGate({ feature, children }: ProGateProps) {
  const { isPro } = useAuth();

  if (isPro) return <>{children}</>;

  return (
    <View style={styles.wall}>
      <View style={styles.lockRow}>
        <Ionicons name="lock-closed" size={18} color="#f7c948" />
        <Text style={styles.lockLabel}>PRO ONLY</Text>
      </View>
      <Text style={styles.wallTitle}>{feature}</Text>
      <Text style={styles.wallSub}>Upgrade to Pro to unlock this feature.</Text>
      <Pressable
        style={({ pressed }) => [styles.upgradeBtn, pressed && { opacity: 0.88 }]}
        onPress={() => WebBrowser.openBrowserAsync(PRO_STRIPE_URL)}>
        <Text style={styles.upgradeLabel}>Upgrade — $9/mo</Text>
      </Pressable>
    </View>
  );
}

export function ProUpgradeBanner() {
  const { isPro } = useAuth();
  if (isPro) return null;

  return (
    <Pressable
      style={styles.banner}
      onPress={() => WebBrowser.openBrowserAsync(PRO_STRIPE_URL)}>
      <View style={styles.bannerLeft}>
        <Text style={styles.bannerTitle}>Unlock Pro — $9/mo</Text>
        <Text style={styles.bannerSub}>Full roster · Wild cards · Card export</Text>
      </View>
      <Ionicons name="arrow-forward-circle" size={28} color="#111111" />
    </Pressable>
  );
}

export function ProFeatureList() {
  return (
    <View style={styles.featureList}>
      {PRO_FEATURES.map((f) => (
        <View key={f.label} style={styles.featureRow}>
          <View style={styles.featureIconWrap}>
            <Ionicons name={f.icon as any} size={18} color="#f7c948" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureLabel}>{f.label}</Text>
            <Text style={styles.featureDetail}>{f.detail}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color="#2dc653" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wall: {
    borderWidth: 2,
    borderColor: '#f7c948',
    borderRadius: 12,
    backgroundColor: '#1a1a00',
    padding: 20,
    gap: 10,
    alignItems: 'center',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockLabel: {
    color: '#f7c948',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  wallTitle: {
    color: '#fff7e6',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  wallSub: {
    color: '#837766',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  upgradeBtn: {
    backgroundColor: '#f7c948',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 4,
  },
  upgradeLabel: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
  },
  banner: {
    backgroundColor: '#f7c948',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#111111',
  },
  bannerLeft: {
    gap: 2,
  },
  bannerTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
  },
  bannerSub: {
    color: '#333300',
    fontSize: 12,
    fontWeight: '700',
  },
  featureList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#f7c948',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 1,
  },
  featureLabel: {
    color: '#fff7e6',
    fontSize: 14,
    fontWeight: '800',
  },
  featureDetail: {
    color: '#837766',
    fontSize: 12,
    fontWeight: '700',
  },
});
