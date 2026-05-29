import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AdBanner,
  AppBackground,
  ChallengerOverlay,
  MarketTicker,
  MarketSignalCard,
  PoliticianCard,
  ReceiptStack,
  RosterStrip,
  ScoreTile,
  ScreenHeader,
  RegionalPromo,
  WildCardSpotlight,
} from '@/components/game-ui';
import { ProUpgradeBanner } from '@/components/pro-gate';
import { SwipeDeck } from '@/components/swipe-deck';
import { marketSignals, politicians, promiseReceipts, wildCardEvents } from '@/data/politicians';
import { getPromiseHitRate, getReceiptsForPolitician, getTruthPressure } from '@/lib/game';
import { useAuth } from '@/providers/auth-provider';
import { useGame } from '@/providers/game-provider';
import { SwipeDirection } from '@/types/game';

export default function DraftScreen() {
  const router = useRouter();
  const { isPro } = useAuth();
  const {
    currentPolitician,
    availablePoliticians,
    draftPolitician,
    dismissPolitician,
    roster,
    rosterFull,
    totalScore,
    resetGame,
  } = useGame();

  const [showChallenger, setShowChallenger] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('tutorial_seen').then((val) => {
      if (!val) setShowTutorial(true);
    });
  }, []);

  const dismissTutorial = () => {
    void AsyncStorage.setItem('tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const promiseRate = getPromiseHitRate(roster);
  const truthPressure = getTruthPressure(roster);

  const currentSignal = marketSignals.find(
    (signal) => signal.politicianId === currentPolitician?.id
  );
  const topWildCard = wildCardEvents[0];
  const wildPolitician = politicians.find((p) => p.id === topWildCard.politicianId);

  const handleSwipe = (direction: SwipeDirection) => {
    if (!currentPolitician) return;

    void Haptics.impactAsync(
      direction === 'left'
        ? Haptics.ImpactFeedbackStyle.Light
        : direction === 'up'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium
    );

    if (direction === 'left') {
      dismissPolitician(currentPolitician.id);
      return;
    }

    draftPolitician(currentPolitician.id, direction === 'up');

    // Show challenger overlay after first draft or captain
    if (roster.length === 0 || direction === 'up') {
      setShowChallenger(true);
    }
  };

  const TUTORIAL_TIPS = [
    { icon: '→', action: 'Swipe right', label: 'Draft a politician to your cabinet' },
    { icon: '←', action: 'Swipe left', label: 'Pass on a politician' },
    { icon: '↑', action: 'Swipe up', label: 'Captain — doubles their score multiplier' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal visible={showTutorial} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>How to play</Text>
            {TUTORIAL_TIPS.map((tip) => (
              <View key={tip.action} style={styles.tutorialRow}>
                <Text style={styles.tutorialIcon}>{tip.icon}</Text>
                <View style={styles.tutorialTextWrap}>
                  <Text style={styles.tutorialAction}>{tip.action}</Text>
                  <Text style={styles.tutorialLabel}>{tip.label}</Text>
                </View>
              </View>
            ))}
            <Pressable style={styles.tutorialBtn} onPress={dismissTutorial}>
              <Text style={styles.tutorialBtnText}>Got it →</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <AppBackground />

      {isPro && (
        <ChallengerOverlay
          visible={showChallenger}
          event={topWildCard}
          politician={wildPolitician}
          onClose={() => setShowChallenger(false)}
        />
      )}

      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader kicker="GLOBAL DRAFT" title="Power Cabinet" score={totalScore} />

        <RegionalPromo
          region="Global"
          politician={currentPolitician ?? availablePoliticians[0]}
          onExplore={() => router.push('/(tabs)/teams')}
        />
        <View style={styles.tickerWrap}>
          <MarketTicker items={availablePoliticians.slice(0, 5)} />
        </View>

        <WildCardSpotlight event={topWildCard} politician={wildPolitician} />

        <View style={styles.scoreRow}>
          <ScoreTile label="Squad" value={`${roster.length}/5`} accent="#ef233c" />
          <ScoreTile label="Promise" value={`${promiseRate}%`} accent="#2dc653" />
          <ScoreTile label="Truth tax" value={truthPressure} accent="#00a9a5" />
        </View>

        <RosterStrip roster={roster} />

        {rosterFull ? (
          <View style={styles.lockedPanel}>
            <Text style={styles.lockedTitle}>Squad locked</Text>
            <Text style={styles.lockedCopy}>
              {totalScore} projected points · {promiseRate}% promise pace.
            </Text>
            <View style={styles.lockedActions}>
              <Text onPress={() => router.push('/(tabs)/league')} style={styles.primaryCta}>
                League table
              </Text>
              <Text onPress={() => router.push('/(tabs)/clips')} style={styles.secondaryCta}>
                Clips
              </Text>
              <Text onPress={resetGame} style={styles.secondaryCta}>
                Redraft
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.draftStack}>
            <SwipeDeck
              item={currentPolitician}
              nextItem={availablePoliticians[1]}
              renderCard={(item, captainPreview) => (
                <PoliticianCard politician={item} captainPreview={captainPreview} />
              )}
              onSwipe={(_, direction) => handleSwipe(direction)}
            />
            <MarketSignalCard signal={currentSignal} />
            <View style={styles.receiptsPanel}>
              <Text style={styles.sectionTitle}>Live receipts</Text>
              <ReceiptStack
                compact
                receipts={
                  currentPolitician
                    ? getReceiptsForPolitician(currentPolitician.id)
                    : promiseReceipts.slice(0, 2)
                }
              />
            </View>
          </View>
        )}

        {/* Pro upsell banner for free users */}
        {!isPro && <ProUpgradeBanner />}

        <AdBanner label="Pack break" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3ead7' },
  container: { padding: 16, paddingBottom: 30, gap: 16 },
  tickerWrap: { marginTop: -4 },
  draftStack: { gap: 12 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  receiptsPanel: { gap: 8 },
  sectionTitle: { color: '#111111', fontSize: 20, fontWeight: '900' },
  lockedPanel: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    padding: 16,
    gap: 10,
  },
  lockedTitle: { color: '#111111', fontSize: 28, fontWeight: '900' },
  lockedCopy: { color: '#837766', fontSize: 15, fontWeight: '800' },
  lockedActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  primaryCta: {
    color: '#111111',
    backgroundColor: '#f7c948',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111111',
    fontWeight: '900',
  },
  secondaryCta: {
    color: '#111111',
    backgroundColor: '#fff7e6',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111111',
    fontWeight: '900',
  },
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 20, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  tutorialCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2a2f3e',
    padding: 28,
    width: '100%',
    maxWidth: 360,
    gap: 20,
  },
  tutorialTitle: {
    color: '#f7c948',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tutorialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tutorialIcon: {
    color: '#f7c948',
    fontSize: 28,
    fontWeight: '900',
    width: 36,
    textAlign: 'center',
  },
  tutorialTextWrap: {
    flex: 1,
    gap: 2,
  },
  tutorialAction: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  tutorialLabel: {
    color: '#8a8fa8',
    fontSize: 13,
    lineHeight: 18,
  },
  tutorialBtn: {
    backgroundColor: '#f7c948',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  tutorialBtnText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
