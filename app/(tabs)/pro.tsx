import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground, CaricaturePortrait, ScreenHeader } from '@/components/game-ui';
import { ProFeatureList } from '@/components/pro-gate';
import { politicians } from '@/data/politicians';
import { getCardRarity, getRarityColor, getOverallRating } from '@/lib/game';
import { useAuth } from '@/providers/auth-provider';

const PRO_STRIPE_URL = 'https://buy.stripe.com/bJe00la1xbg05zG5QT1oI1g';
const PRO_POLITICIANS = politicians.slice(8);

export default function ProScreen() {
  const { isPro, profile } = useAuth();

  if (isPro) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBackground />
        <ScrollView contentContainerStyle={styles.container}>
          <ScreenHeader kicker="MEMBERSHIP" title="Pro Cabinet" />

          <View style={styles.activeBadge}>
            <Ionicons name="star" size={22} color="#111111" />
            <View>
              <Text style={styles.activeTitle}>Pro Active</Text>
              <Text style={styles.activeSub}>
                {profile?.display_name ? `Logged in as ${profile.display_name}` : 'Full access unlocked'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Pro benefits</Text>
            <ProFeatureList />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pro politician roster</Text>
            <Text style={styles.sectionSub}>8 exclusive politicians only Pro members can draft</Text>
            <View style={styles.proPolGrid}>
              {PRO_POLITICIANS.map((pol) => {
                const rarity = getCardRarity(pol);
                const rarityColor = getRarityColor(rarity);
                return (
                  <View key={pol.id} style={[styles.proPolCard, { borderColor: rarityColor }]}>
                    <CaricaturePortrait politician={pol} size="small" />
                    <Text style={[styles.proPolRarity, { color: rarityColor }]}>{rarity}</Text>
                    <Text style={styles.proPolName} numberOfLines={1}>{pol.name}</Text>
                    <Text style={styles.proPolOvr}>{getOverallRating(pol)} OVR</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader kicker="UPGRADE" title="Pro Cabinet" />

        {/* Hero CTA */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroKicker}>LIMITED LAUNCH OFFER</Text>
            <View style={styles.heroPriceBadge}>
              <Text style={styles.heroPriceText}>$9/mo</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>More politicians.{'\n'}More wild cards.{'\n'}More receipts.</Text>
          <Pressable
            style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.9 }]}
            onPress={() => WebBrowser.openBrowserAsync(PRO_STRIPE_URL)}>
            <Ionicons name="star" size={18} color="#111111" />
            <Text style={styles.heroBtnLabel}>Upgrade to Pro — $9/mo</Text>
          </Pressable>
          <Text style={styles.heroSmall}>Cancel anytime · Billed monthly via Stripe</Text>
        </View>

        {/* Feature list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everything in Pro</Text>
          <ProFeatureList />
        </View>

        {/* Locked politicians tease */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>8 locked politicians</Text>
            <View style={styles.lockChip}>
              <Ionicons name="lock-closed" size={12} color="#f7c948" />
              <Text style={styles.lockChipText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.sectionSub}>
            Free tier gets 8 politicians. Pro unlocks 8 more — higher ratings, harder truth tax.
          </Text>
          <View style={styles.proPolGrid}>
            {PRO_POLITICIANS.map((pol) => {
              const rarity = getCardRarity(pol);
              const rarityColor = getRarityColor(rarity);
              return (
                <Pressable
                  key={pol.id}
                  style={[styles.proPolCard, styles.proPolCardLocked, { borderColor: rarityColor }]}
                  onPress={() => WebBrowser.openBrowserAsync(PRO_STRIPE_URL)}>
                  <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={20} color="#f7c948" />
                  </View>
                  <CaricaturePortrait politician={pol} size="small" />
                  <Text style={[styles.proPolRarity, { color: rarityColor }]}>{rarity}</Text>
                  <Text style={styles.proPolName} numberOfLines={1}>{pol.name}</Text>
                  <Text style={styles.proPolOvr}>{getOverallRating(pol)} OVR</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Compare */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Free vs Pro</Text>
          <View style={styles.compareTable}>
            <View style={styles.compareHeader}>
              <Text style={[styles.compareCol, { flex: 2 }]}>Feature</Text>
              <Text style={styles.compareCol}>Free</Text>
              <Text style={[styles.compareCol, { color: '#f7c948' }]}>Pro</Text>
            </View>
            {[
              ['Politicians', '8', '16'],
              ['Wild card events', '—', '✓'],
              ['Draft history', '—', '✓'],
              ['Card image export', '—', '✓'],
              ['Cloud sync', '✓', '✓'],
              ['World league', '✓', '✓'],
            ].map(([feature, free, pro]) => (
              <View key={feature} style={styles.compareRow}>
                <Text style={[styles.compareCell, { flex: 2, color: '#837766' }]}>{feature}</Text>
                <Text style={styles.compareCell}>{free}</Text>
                <Text style={[styles.compareCell, { color: '#f7c948', fontWeight: '900' }]}>{pro}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <Pressable
          style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.9 }]}
          onPress={() => WebBrowser.openBrowserAsync(PRO_STRIPE_URL)}>
          <Text style={styles.bottomBtnLabel}>Get Pro — $9/month</Text>
          <Text style={styles.bottomBtnSub}>Cancel anytime</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3ead7' },
  container: { padding: 16, paddingBottom: 32, gap: 20 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: '#111111', fontSize: 22, fontWeight: '900' },
  sectionSub: { color: '#837766', fontSize: 13, fontWeight: '700', lineHeight: 18 },

  // Active Pro
  activeBadge: {
    backgroundColor: '#f7c948',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#111111',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeTitle: { color: '#111111', fontSize: 18, fontWeight: '900' },
  activeSub: { color: '#333300', fontSize: 12, fontWeight: '700' },

  // Hero upsell card
  heroCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#f7c948',
    padding: 20,
    gap: 12,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroKicker: { color: '#f7c948', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  heroPriceBadge: { backgroundColor: '#f7c948', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  heroPriceText: { color: '#111111', fontSize: 16, fontWeight: '900' },
  heroTitle: { color: '#fff7e6', fontSize: 28, fontWeight: '900', lineHeight: 32 },
  heroBtn: {
    backgroundColor: '#f7c948',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroBtnLabel: { color: '#111111', fontSize: 17, fontWeight: '900' },
  heroSmall: { color: '#555544', fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Lock chip
  lockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111111',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockChipText: { color: '#f7c948', fontSize: 10, fontWeight: '900' },

  // Politician grid
  proPolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  proPolCard: {
    width: '22%',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#fff7e6',
    padding: 8,
    alignItems: 'center',
    gap: 4,
  },
  proPolCardLocked: { opacity: 0.75, position: 'relative', overflow: 'hidden' },
  lockOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
  },
  proPolRarity: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  proPolName: { color: '#111111', fontSize: 9, fontWeight: '900', textAlign: 'center' },
  proPolOvr: { color: '#837766', fontSize: 9, fontWeight: '800' },

  // Compare table
  compareTable: {
    borderWidth: 2,
    borderColor: '#111111',
    borderRadius: 10,
    overflow: 'hidden',
  },
  compareHeader: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  compareCol: {
    flex: 1,
    color: '#fff7e6',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  compareRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#e8dfc8',
  },
  compareCell: {
    flex: 1,
    color: '#111111',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Bottom CTA
  bottomBtn: {
    backgroundColor: '#f7c948',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#111111',
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  bottomBtnLabel: { color: '#111111', fontSize: 20, fontWeight: '900' },
  bottomBtnSub: { color: '#333300', fontSize: 12, fontWeight: '700' },
});
