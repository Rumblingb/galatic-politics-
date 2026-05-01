import { useRouter } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton, AppBackground, CaricaturePortrait } from '@/components/game-ui';
import { politicians, wildCardEvents } from '@/data/politicians';
import { useGame } from '@/providers/game-provider';

export function LoginGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, login, selectTeam, region, setRegion } = useGame();
  const bossEvent = wildCardEvents[0];
  const bossCard = politicians.find((p) => p.id === bossEvent.politicianId) ?? politicians[0];

  const handleLogin = () => {
    login();
    router.replace('/');
  };

  const doQuickStart = () => {
    login();
    // Intentionally not auto-drafting a team here — quick start simply logs in and returns to root.
    router.replace('/');
  };

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
  }, [isLoggedIn, login, selectTeam, router]);

  if (isLoggedIn) return <>{children}</>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <View style={styles.container}>
        <View style={styles.titlePlate}>
          <View style={styles.livePill}>
            <Text style={styles.liveDot}>LIVE</Text>
            <Text style={styles.liveText}>GLOBAL DRAFT</Text>
          </View>
          <Text style={styles.kicker}>POWER CABINET</Text>
          <Text style={styles.title}>Enter the arena.</Text>
          <Text style={styles.subtitle}>Build a five-card cabinet before the receipts hit.</Text>
        </View>

        <View style={styles.bossCard}>
          <View style={styles.challengerBar}>
            <Text style={styles.challenger}>CHALLENGER APPROACHING</Text>
            <Text style={styles.clipTag}>GIF READY</Text>
          </View>
          <CaricaturePortrait politician={bossCard} size="large" />
          <Text style={styles.bossName}>{bossCard.name}</Text>
          <Text style={styles.bossCopy}>{bossEvent.effect}</Text>
        </View>

        <View style={styles.regionRow}>
          <Text style={styles.regionLabel}>Region</Text>
          <View style={styles.regionButtons}>
            {['Global', 'India', 'UK', 'US'].map((r) => {
              const key = r.toLowerCase();
              const active = region === key;
              return (
                <Pressable key={key} onPress={() => setRegion(key)} style={[styles.regionBtn, active && styles.regionBtnActive]}>
                  <Text style={[styles.regionBtnText, active && styles.regionBtnTextActive]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actionWrap}>
          <ActionButton label="Login and draft" icon="flash" tone="gold" onPress={handleLogin} />
          <View style={{ height: 12 }} />
          <ActionButton label="Quick Start" icon="flash-outline" tone="accent" onPress={doQuickStart} />
        </View>

        <Text style={styles.footer}>Swipe right to draft. Swipe left to pass. Swipe up to captain.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3ead7' },
  container: { flex: 1, padding: 18, justifyContent: 'center', gap: 12 },
  titlePlate: { borderRadius: 8, borderWidth: 4, borderColor: '#111111', backgroundColor: '#111111', padding: 16, gap: 8 },
  livePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 8, borderWidth: 2, borderColor: '#f7c948', paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { color: '#111111', backgroundColor: '#f7c948', overflow: 'hidden', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, fontSize: 10, fontWeight: '900' },
  liveText: { color: '#f7c948', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  kicker: { color: '#f7c948', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: '#fff7e6', fontSize: 48, lineHeight: 50, fontWeight: '900' },
  subtitle: { color: '#fff7e6', fontSize: 15, lineHeight: 20, fontWeight: '800' },
  bossCard: { borderRadius: 8, borderWidth: 5, borderColor: '#ef233c', backgroundColor: '#111111', padding: 18, alignItems: 'center', gap: 10 },
  challengerBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  challenger: { color: '#f7c948', fontSize: 12, fontWeight: '900', letterSpacing: 1.4 },
  clipTag: { color: '#111111', backgroundColor: '#f7c948', overflow: 'hidden', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '900' },
  bossName: { color: '#fff7e6', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  bossCopy: { color: '#fff7e6', fontSize: 14, lineHeight: 20, fontWeight: '800', textAlign: 'center' },
  actionWrap: { width: '100%' },
  footer: { color: '#fff7e6', backgroundColor: '#111111', overflow: 'hidden', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, fontWeight: '900', textAlign: 'center' },
  regionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  regionLabel: { fontSize: 16, fontWeight: '800', color: '#fff7e6' },
  regionButtons: { flexDirection: 'row', gap: 10 },
  regionBtn: { padding: 10, borderRadius: 5, backgroundColor: '#f7c948' },
  regionBtnActive: { backgroundColor: '#ef233c' },
  regionBtnText: { color: '#111111', fontWeight: '900' },
  regionBtnTextActive: { color: '#fff7e6' },
});
