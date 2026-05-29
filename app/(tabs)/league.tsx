import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  AdBanner,
  AppBackground,
  EventCard,
  LeagueStandingRow,
  MarketSignalCard,
  ReceiptStack,
  RosterStrip,
  ScoreTile,
  ScreenHeader,
  WildCardSpotlight,
} from '@/components/game-ui';
import { marketSignals, politicians, promiseReceipts, wildCardEvents } from '@/data/politicians';
import { buildStandings, getPromiseHitRate, getTruthPressure } from '@/lib/game';
import { getLeaderboard } from '@/lib/supabase';
import { useGame } from '@/providers/game-provider';

export default function LeagueScreen() {
  const router = useRouter();
  const { roster, totalScore, feed } = useGame();
  const standings = buildStandings(totalScore);
  const hitRate = getPromiseHitRate(roster);
  const truthPressure = getTruthPressure(roster);
  const rank = standings.findIndex((entry) => entry.id === 'you') + 1;

  const [liveEntries, setLiveEntries] = useState<any[]>([]);

  useEffect(() => {
    getLeaderboard(20)
      .then((rows) => setLiveEntries(rows))
      .catch((err) => console.warn('[League] Fetch failed:', err));
  }, [totalScore]);
  const activeWildCard = wildCardEvents[1];
  const wildPolitician = politicians.find(
    (politician) => politician.id === activeWildCard.politicianId
  );

  if (roster.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBackground />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No scores yet.</Text>
          <Text style={styles.emptySub}>Be the first. Draft your cabinet to join the league.</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push('/(tabs)/index')}>
            <Text style={styles.emptyBtnText}>Draft cabinet →</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader kicker="MATCHDAY TABLE" title="World League" score={totalScore} />

        <View style={styles.scoreRow}>
          <ScoreTile label="Rank" value={`#${rank}`} accent="#f7c948" />
          <ScoreTile label="Promise" value={`${hitRate}%`} accent="#2dc653" />
          <ScoreTile label="Truth tax" value={truthPressure} accent="#ef233c" />
        </View>

        <RosterStrip roster={roster} />

        <WildCardSpotlight event={activeWildCard} politician={wildPolitician} />

        <AdBanner label="Leaderboard break" />

        <View style={styles.band}>
          <Text style={styles.sectionTitle}>External market watch</Text>
          <View style={styles.stack}>
            {marketSignals.slice(0, 3).map((signal) => (
              <MarketSignalCard key={signal.id} signal={signal} />
            ))}
          </View>
        </View>

        <View style={styles.band}>
          <Text style={styles.sectionTitle}>Standings</Text>
          <View style={styles.stack}>
            {(liveEntries.length > 0
              ? liveEntries.map((row, index) => ({
                  id: `live-${index}`,
                  name: row.display_name ?? 'Anonymous',
                  score: row.total_score ?? 0,
                  vibe: '',
                }))
              : standings
            ).map((entry, index) => (
              <LeagueStandingRow
                key={entry.id}
                entry={entry}
                rank={index + 1}
                isYou={entry.id === 'you'}
              />
            ))}
          </View>
        </View>

        <View style={styles.band}>
          <Text style={styles.sectionTitle}>Promise and lie receipts</Text>
          <ReceiptStack receipts={promiseReceipts.slice(0, 6)} />
        </View>

        <View style={styles.band}>
          <Text style={styles.sectionTitle}>Event tape</Text>
          <View style={styles.stack}>
            {feed.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                politician={politicians.find((politician) => politician.id === event.politicianId)}
              />
            ))}
          </View>
        </View>
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
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  band: {
    gap: 10,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '900',
  },
  stack: {
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
  },
  emptyTitle: {
    color: '#111111',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptySub: {
    color: '#837766',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 4,
    backgroundColor: '#f7c948',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111111',
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  emptyBtnText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
  },
});
