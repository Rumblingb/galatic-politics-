import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ReactNode, useCallback, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/game-ui';
import { politicians, wildCardEvents } from '@/data/politicians';
import { useGame } from '@/providers/game-provider';

export function LoginGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, login, region, setRegion } = useGame();
  const bossEvent = wildCardEvents[0];
  const bossCard = politicians.find((p) => p.id === bossEvent.politicianId) ?? politicians[0];

  const handleLogin = () => {
    login();
    router.replace('/');
  };

  const doQuickStart = useCallback(() => {
    login();
    // Intentionally not auto-drafting a team here — quick start simply logs in and returns to root.
    router.replace('/');
  }, [login, router]);

  const ALLOW_DEV_QUICKSTART = false;
  useEffect(() => {
    if (!isLoggedIn && process.env.NODE_ENV !== 'production' && ALLOW_DEV_QUICKSTART) {
      const t = setTimeout(() => {
        try {
          doQuickStart();
        } catch {}
      }, 600);
      return () => clearTimeout(t);
    }
    return;
  }, [isLoggedIn, ALLOW_DEV_QUICKSTART, doQuickStart]);

  if (isLoggedIn) return <>{children}</>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titlePlate}>
          <View style={styles.livePill}>
            <Text style={styles.liveDot}>LIVE</Text>
            <Text style={styles.liveText}>GLOBAL DRAFT</Text>
          </View>
          <Text style={styles.kicker}>POWER CABINET</Text>
          <Text style={styles.title}>Draft leaders. Survive receipts.</Text>
          <Text style={styles.subtitle}>Swipe a five-card cabinet, follow live-style signals, and climb the world league.</Text>
        </View>

        <View style={styles.bossCard}>
          <View style={styles.challengerBar}>
            <Text style={styles.challenger}>FEATURED CARD</Text>
            <Text style={styles.clipTag}>STORE READY</Text>
          </View>
          <View style={styles.cardShowcase}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{bossCard.marketOdds}</Text>
              <Text style={styles.ratingLabel}>ODDS</Text>
            </View>
            <View style={styles.portraitStage}>
              {bossCard.portraitImage ? (
                <Image source={bossCard.portraitImage} style={styles.bossImage} resizeMode="cover" />
              ) : (
                <Text style={styles.bossInitials}>{bossCard.name.slice(0, 2).toUpperCase()}</Text>
              )}
              <View style={styles.imageShade} />
              <Text style={styles.cardCountry}>{bossCard.country}</Text>
            </View>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.bossName}>
              {bossCard.name}
            </Text>
            <Text style={styles.bossCopy}>{bossEvent.effect}</Text>
          </View>
        </View>

        <View style={styles.regionRow}>
          <Text style={styles.regionLabel}>Region</Text>
          <View style={styles.regionButtons}>
            {['Global', 'India', 'UK', 'US'].map((r) => {
              const key = r.toLowerCase();
              const active = region === key;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${r} region`}
                  onPress={() => setRegion(key)}
                  style={[styles.regionBtn, active && styles.regionBtnActive]}>
                  <Text style={[styles.regionBtnText, active && styles.regionBtnTextActive]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actionWrap}>
          <Pressable accessibilityRole="button" accessibilityLabel="Login and draft" style={styles.primaryAction} onPress={handleLogin}>
            <Ionicons name="flash" size={19} color="#111111" />
            <Text style={styles.primaryActionText}>Login and draft</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Quick Start" style={styles.secondaryAction} onPress={doQuickStart}>
            <Ionicons name="play" size={18} color="#007f7c" />
            <Text style={styles.secondaryActionText}>Quick Start</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Swipe right to draft. Swipe left to pass. Swipe up to captain.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111111' },
  container: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 28, justifyContent: 'center', gap: 10 },
  titlePlate: { borderRadius: 8, borderWidth: 3, borderColor: '#111111', backgroundColor: '#111111', padding: 14, gap: 7 },
  livePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 8, borderWidth: 2, borderColor: '#f7c948', paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { color: '#111111', backgroundColor: '#f7c948', overflow: 'hidden', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, fontSize: 10, fontWeight: '900' },
  liveText: { color: '#f7c948', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  kicker: { color: '#f7c948', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: '#fff7e6', fontSize: 34, lineHeight: 36, fontWeight: '900' },
  subtitle: { color: '#fff7e6', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  bossCard: { borderRadius: 8, borderWidth: 4, borderColor: '#ef233c', backgroundColor: '#111111', padding: 12, alignItems: 'center', gap: 9 },
  challengerBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  challenger: { color: '#f7c948', fontSize: 12, fontWeight: '900', letterSpacing: 1.4 },
  clipTag: { color: '#111111', backgroundColor: '#f7c948', overflow: 'hidden', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '900' },
  cardShowcase: { width: '100%', borderRadius: 8, borderWidth: 2, borderColor: '#f7c948', backgroundColor: '#fff7e6', padding: 9, alignItems: 'center', gap: 7 },
  ratingBadge: { position: 'absolute', top: 17, left: 17, zIndex: 2, borderRadius: 8, borderWidth: 2, borderColor: '#111111', backgroundColor: '#f7c948', paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center' },
  ratingText: { color: '#111111', fontSize: 20, fontWeight: '900' },
  ratingLabel: { color: '#111111', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  portraitStage: { width: '100%', height: 220, borderRadius: 8, overflow: 'hidden', backgroundColor: '#111111' },
  bossImage: { width: '100%', height: '100%' },
  bossInitials: { color: '#f7c948', fontSize: 56, fontWeight: '900', textAlign: 'center', marginTop: 90 },
  imageShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 82, backgroundColor: 'rgba(0,0,0,0.58)' },
  cardCountry: { position: 'absolute', left: 12, right: 12, bottom: 12, color: '#fff7e6', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  bossName: { color: '#111111', fontSize: 28, lineHeight: 31, fontWeight: '900', textAlign: 'center' },
  bossCopy: { color: '#3f3a33', fontSize: 13, lineHeight: 18, fontWeight: '700', textAlign: 'center' },
  actionWrap: { width: '100%', flexDirection: 'row', gap: 10 },
  primaryAction: { flex: 1, minHeight: 54, borderRadius: 8, borderWidth: 2, borderColor: '#111111', backgroundColor: '#f7c948', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  primaryActionText: { color: '#111111', fontSize: 14, fontWeight: '900' },
  secondaryAction: { flex: 1, minHeight: 54, borderRadius: 8, borderWidth: 2, borderColor: '#007f7c', backgroundColor: '#fff7e6', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  secondaryActionText: { color: '#007f7c', fontSize: 14, fontWeight: '900' },
  footer: { color: '#fff7e6', backgroundColor: '#111111', overflow: 'hidden', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 12, lineHeight: 16, fontWeight: '900', textAlign: 'center' },
  regionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  regionLabel: { fontSize: 16, fontWeight: '900', color: '#111111' },
  regionButtons: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  regionBtn: { minHeight: 40, minWidth: 54, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#f7c948', alignItems: 'center', justifyContent: 'center' },
  regionBtnActive: { backgroundColor: '#ef233c' },
  regionBtnText: { color: '#111111', fontWeight: '900' },
  regionBtnTextActive: { color: '#fff7e6' },
});
