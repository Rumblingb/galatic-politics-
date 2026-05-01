import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { SwipeDeck } from '@/components/swipe-deck';
import { marketSignals, politicians, promiseReceipts, wildCardEvents } from '@/data/politicians';
import { getPromiseHitRate, getReceiptsForPolitician, getTruthPressure } from '@/lib/game';
import { useGame } from '@/providers/game-provider';
import { SwipeDirection } from '@/types/game';

export default function DraftScreen() {
  const router = useRouter();
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
  const promiseRate = getPromiseHitRate(roster);
  const [showChallenger, setShowChallenger] = useState(true);
  const truthPressure = getTruthPressure(roster);
  const currentSignal = marketSignals.find(
    (signal) => signal.politicianId === currentPolitician?.id
  );
  const topWildCard = wildCardEvents[0];
  const wildPolitician = politicians.find(
    (politician) => politician.id === topWildCard.politicianId
  );

  const handleSwipe = (direction: SwipeDirection) => {
    if (!currentPolitician) {
      return;
    }

    void Haptics.impactAsync(
      direction === 'left' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    );

    if (direction === 'left') {
      dismissPolitician(currentPolitician.id);
      return;
    }

    draftPolitician(currentPolitician.id, direction === 'up');
    if (roster.length === 1 || direction === 'up') {
      setShowChallenger(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <ChallengerOverlay
        visible={showChallenger}
        event={topWildCard}
        politician={wildPolitician}
        onClose={() => setShowChallenger(false)}
      />
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
              {totalScore} projected points with a {promiseRate}% promise pace.
            </Text>
            <View style={styles.lockedActions}>
              <Text onPress={() => router.push('/(tabs)/league')} style={styles.primaryCta}>
                League table
              </Text>
              <Text onPress={() => router.push('/(tabs)/clips')} style={styles.secondaryCta}>
                Card pack
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
                  currentPolitician ? getReceiptsForPolitician(currentPolitician.id) : promiseReceipts.slice(0, 2)
                }
              />
            </View>
          </View>
        )}

        <AdBanner label="Pack break" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3ead7',
  },
  container: {
    padding: 16,
    paddingBottom: 30,
    gap: 16,
  },
  tickerWrap: {
    marginTop: -4,
  },
  draftStack: {
    gap: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  receiptsPanel: {
    gap: 8,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
  },
  lockedPanel: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    padding: 16,
    gap: 10,
  },
  lockedTitle: {
    color: '#111111',
    fontSize: 28,
    fontWeight: '900',
  },
  lockedCopy: {
    color: '#837766',
    fontSize: 15,
    fontWeight: '800',
  },
  lockedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
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
});
