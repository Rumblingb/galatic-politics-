import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ActionButton,
  AdBanner,
  AppBackground,
  CaricaturePortrait,
  ScreenHeader,
} from '@/components/game-ui';
import { communityCardSubmissions, officialCardArt, politicians } from '@/data/politicians';

export default function PacksScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader kicker="CARD PACKS" title="Picture Lab" rightLabel="UGC" />

        <View style={styles.uploadPanel}>
          <View style={styles.uploadIcon}>
            <Ionicons name="cloud-upload-outline" size={28} color="#111111" />
          </View>
          <View style={styles.uploadCopy}>
            <Text style={styles.uploadTitle}>Community card upload</Text>
            <Text style={styles.uploadText}>
              User images should enter a private queue, pass bot moderation for nudity and explicit content,
              then wait for human review before public cards or ads touch them.
            </Text>
          </View>
          <ActionButton label="Mock upload" icon="add-circle" tone="gold" onPress={() => {}} />
        </View>

        <AdBanner label="Card pack ad rail" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Official meme pack</Text>
          <View style={styles.cardGrid}>
            {officialCardArt.map((card) => {
              const politician = politicians.find((entry) => entry.id === card.politicianId);
              if (!politician) {
                return null;
              }

              return (
                <View key={card.id} style={styles.artCard}>
                  <View style={styles.artHeader}>
                    <Text style={styles.packLabel}>{card.pack}</Text>
                    <Text style={styles.rarity}>{card.rarity}</Text>
                  </View>
                  <View style={[styles.artPortrait, { backgroundColor: politician.palette[1] }]}>
                    <CaricaturePortrait politician={politician} size="large" />
                  </View>
                  <Text style={styles.artTitle}>{card.title}</Text>
                  <Text style={styles.artName}>{politician.name}</Text>
                  <Text style={styles.artDirection}>{card.artDirection}</Text>
                  <Text style={styles.status}>{card.status}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moderation queue</Text>
          <View style={styles.queueStack}>
            {communityCardSubmissions.map((submission) => (
              <View key={submission.id} style={styles.queueCard}>
                <View style={styles.queueTop}>
                  <View>
                    <Text style={styles.queueName}>{submission.politicianName}</Text>
                    <Text style={styles.queueMeta}>
                      {submission.country} - {submission.uploader}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.safePill,
                      submission.safeForAds ? styles.safePillApproved : styles.safePillPending,
                    ]}>
                    <Text style={styles.safePillText}>
                      {submission.safeForAds ? 'AD SAFE' : 'HOLD'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.skin}>{submission.proposedSkin}</Text>
                <View style={styles.moderationRow}>
                  <Ionicons
                    name={
                      submission.moderationStatus === 'Approved'
                        ? 'checkmark-circle'
                        : submission.moderationStatus === 'Rejected'
                          ? 'close-circle'
                          : 'scan'
                    }
                    size={18}
                    color={submission.safeForAds ? '#2dc653' : '#ef233c'}
                  />
                  <Text style={styles.moderationStatus}>{submission.moderationStatus}</Text>
                </View>
                <Text style={styles.botNotes}>{submission.botNotes}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store-ready moderation rules</Text>
          <View style={styles.rulesCard}>
            <Rule text="Uploads stay private until image moderation passes nudity, sexual content, gore, hate-symbol, and harassment checks." />
            <Rule text="Public cards need report, block, remove, and appeal controls before App Store or Play Store submission." />
            <Rule text="Ad inventory only appears beside approved cards marked safe for ads." />
            <Rule text="Real backend should store the original upload, moderation result, reviewer action, and source rights note." />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Rule({ text }: { text: string }) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons name="shield-checkmark" size={18} color="#2dc653" />
      <Text style={styles.ruleText}>{text}</Text>
    </View>
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
  uploadPanel: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    padding: 14,
    gap: 12,
  },
  uploadIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: '#f7c948',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCopy: {
    gap: 5,
  },
  uploadTitle: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '900',
  },
  uploadText: {
    color: '#111111',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '900',
  },
  cardGrid: {
    gap: 12,
  },
  artCard: {
    borderRadius: 8,
    borderWidth: 4,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    padding: 14,
    gap: 9,
  },
  artHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  packLabel: {
    color: '#ef233c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rarity: {
    color: '#111111',
    backgroundColor: '#f7c948',
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '900',
  },
  artPortrait: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111111',
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artTitle: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '900',
  },
  artName: {
    color: '#837766',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  artDirection: {
    color: '#111111',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  status: {
    color: '#111111',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#111111',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '900',
  },
  queueStack: {
    gap: 9,
  },
  queueCard: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: '#fff7e6',
    padding: 13,
    gap: 8,
  },
  queueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  queueName: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '900',
  },
  queueMeta: {
    color: '#837766',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },
  safePill: {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#111111',
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  safePillApproved: {
    backgroundColor: '#2dc653',
  },
  safePillPending: {
    backgroundColor: '#ef233c',
  },
  safePillText: {
    color: '#111111',
    fontSize: 10,
    fontWeight: '900',
  },
  skin: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
  },
  moderationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  moderationStatus: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  botNotes: {
    color: '#837766',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  rulesCard: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#111111',
    padding: 14,
    gap: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  ruleText: {
    flex: 1,
    color: '#fff7e6',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
});
