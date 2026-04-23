import { Share, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ActionButton,
  AdBanner,
  AppBackground,
  ReceiptStack,
  ScreenHeader,
  SharePoster,
} from '@/components/game-ui';
import { createShareMessage, getReceiptsForPolitician } from '@/lib/game';
import { useGame } from '@/providers/game-provider';

export default function ClipsScreen() {
  const { roster, totalScore } = useGame();

  const handleShare = async (message: string) => {
    await Share.share({ message });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader kicker="VIRAL PACK" title="Card Studio" score={totalScore} />

        <View style={styles.captionPanel}>
          <Text style={styles.captionLabel}>Squad caption</Text>
          <Text style={styles.captionCopy}>{createShareMessage(roster, totalScore)}</Text>
          <View style={styles.captionAction}>
            <ActionButton
              label="Share squad"
              icon="share-social"
              tone="gold"
              onPress={() => handleShare(createShareMessage(roster, totalScore))}
            />
          </View>
        </View>

        <AdBanner label="Clip break" />

        <View style={styles.stack}>
          {roster.length ? (
            roster.map((slot) => (
              <View key={slot.politician.id} style={styles.posterWrap}>
                <SharePoster slot={slot} />
                <ReceiptStack compact receipts={getReceiptsForPolitician(slot.politician.id)} />
                <ActionButton
                  label="Share card"
                  icon="image-outline"
                  tone="neutral"
                  onPress={() =>
                    handleShare(
                      `${slot.politician.name} just posted ${slot.points} points for my Power Cabinet squad. ${slot.politician.signatureMove}`
                    )
                  }
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No cards pulled</Text>
              <Text style={styles.emptyCopy}>Draft a squad and this becomes your share pack.</Text>
            </View>
          )}
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
  captionPanel: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    padding: 16,
    gap: 10,
  },
  captionLabel: {
    color: '#ef233c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  captionCopy: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  captionAction: {
    maxWidth: 190,
  },
  stack: {
    gap: 14,
  },
  posterWrap: {
    gap: 8,
  },
  emptyState: {
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#fff7e6',
    borderWidth: 3,
    borderColor: '#111111',
    gap: 6,
  },
  emptyTitle: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '900',
  },
  emptyCopy: {
    color: '#837766',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
  },
});
