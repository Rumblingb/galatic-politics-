import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { useGame } from '@/providers/game-provider';

export default function LeagueScreen() {
  const { roster, totalScore, feed } = useGame();
  const standings = buildStandings(totalScore);
  const hitRate = getPromiseHitRate(roster);
  const truthPressure = getTruthPressure(roster);
  const rank = standings.findIndex((entry) => entry.id === 'you') + 1;
  const activeWildCard = wildCardEvents[1];
  const wildPolitician = politicians.find(
    (politician) => politician.id === activeWildCard.politicianId
  );

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
            {standings.map((entry, index) => (
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
});
