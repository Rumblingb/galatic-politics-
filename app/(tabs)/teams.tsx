import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground, ScreenHeader, RegionalPromo } from '@/components/game-ui';
import { SwipeDeck } from '@/components/swipe-deck';
import { politicians } from '@/data/politicians';
import { useGame } from '@/providers/game-provider';
import { Team, Politician } from '@/types/game';

function TeamCard({
  team,
  sampleMembers,
}: {
  team: Team;
  sampleMembers: Politician[];
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamMeta}>{team.country} · {team.memberIds.length} players</Text>
      </View>
      <View style={styles.thumbsRow}>
        {sampleMembers.map((member, idx) => (
          <View
            key={member.id}
            style={[
              styles.thumb,
              idx > 0 && { marginLeft: -18, zIndex: idx },
            ]}>
            {member.portraitImage ? (
              <Image source={member.portraitImage} style={styles.thumbImage} resizeMode="contain" />
            ) : (
              <Text style={styles.thumbEmoji}>{member.portraitEmoji}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function TeamsScreen() {
  const { teams } = useGame();
  const router = useRouter();
  const [idx, setIdx] = useState(0);

  const current = teams[idx] ?? null;
  const next = teams[idx + 1] ?? null;

  const getMembers = (team: Team): Politician[] =>
    team.memberIds
      .slice(0, 3)
      .map((id) => politicians.find((p) => p.id === id))
      .filter((p): p is Politician => p !== undefined);

  const handleSwipe = (_team: Team, _direction: 'left' | 'right' | 'up') => {
    // Just move to the next team without populating roster
    // This keeps the Teams flow smooth and focused on browsing
    setIdx((i) => i + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader kicker="TEAM DRAFT" title="Pick a Squad" />

        <RegionalPromo
          region="Teams"
          politician={current ? politicians.find((p) => p.id === current.memberIds[0]) ?? politicians[0] : politicians[0]}
          onExplore={() => router.push('/(tabs)/league')}
        />

        <Text style={styles.hint}>Swipe right to draft · left to pass · swipe up to make captain</Text>

        <SwipeDeck
          item={current}
          nextItem={next}
          renderCard={(team) => (
            <TeamCard
              team={team}
              sampleMembers={getMembers(team)}
            />
          )}
          onSwipe={handleSwipe}
        />

        {idx >= teams.length && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>All squads reviewed</Text>
            <Text style={styles.emptySub}>Head to Draft to pick individual cards.</Text>
            <Pressable style={styles.resetBtn} onPress={() => setIdx(0)}>
              <Text style={styles.resetBtnText}>Start over</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3ead7' },
  container: { padding: 16, paddingBottom: 30, gap: 16 },
  hint: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: 'rgba(17,17,17,0.04)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  card: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    padding: 18,
    gap: 14,
  },
  cardHeader: { gap: 4 },
  teamName: { color: '#111111', fontSize: 24, fontWeight: '900' },
  teamMeta: { color: '#837766', fontSize: 13, fontWeight: '800' },
  thumbsRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbEmoji: {
    fontSize: 24,
  },
  empty: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { color: '#111111', fontSize: 22, fontWeight: '900' },
  emptySub: { color: '#837766', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  resetBtn: {
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  resetBtnText: { color: '#f7c948', fontSize: 14, fontWeight: '900' },
});
