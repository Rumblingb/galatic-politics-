import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';

import {
  CardRarity,
  calculateBasePoints,
  getAccountabilityDamage,
  getCardRarity,
  getInitials,
  getOverallRating,
  getRarityColor,
  getReceiptTone,
} from '@/lib/game';
import {
  LeagueEntry,
  MarketSignal,
  MemeEvent,
  Politician,
  PromiseReceipt,
  RosterSlot,
  WildCardEvent,
  PolymarketCard as PolymarketCardType,
  AuraFarmingMoment,
} from '@/types/game';

const ink = '#111111';
const paper = '#fff7e6';
const muted = '#837766';

export function AppBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <View style={styles.stageBase} />
      <View style={[styles.stageStripe, styles.stageStripeOne]} />
      <View style={[styles.stageStripe, styles.stageStripeTwo]} />
      <View style={[styles.stageStripe, styles.stageStripeThree]} />
      <View style={styles.pitchLine} />
    </View>
  );
}

export function ScreenHeader({
  kicker,
  title,
  score,
  rightLabel,
}: {
  kicker: string;
  title: string;
  score?: number;
  rightLabel?: string;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeValue}>{score ?? rightLabel ?? 'LIVE'}</Text>
        <Text style={styles.headerBadgeLabel}>{score === undefined ? 'season' : 'pts'}</Text>
      </View>
    </View>
  );
}

export function ActionButton({
  label,
  icon,
  tone,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'good' | 'bad' | 'gold' | 'neutral' | 'accent';
  onPress: () => void;
}) {
  const accent =
    tone === 'good' ? '#2dc653' : tone === 'bad' ? '#ef233c' : tone === 'gold' ? '#f7c948' : tone === 'accent' ? '#00a9a5' : ink;

  return (
    <Pressable onPress={onPress} style={[styles.actionButton, { borderColor: accent }]}>
      <Ionicons name={icon} size={18} color={accent} />
      <Text style={[styles.actionLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

export function ScoreTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <View style={[styles.scoreTile, { borderTopColor: accent }]}>
      <Text style={styles.scoreTileValue}>{value}</Text>
      <Text style={styles.scoreTileLabel}>{label}</Text>
    </View>
  );
}

export function MarketTicker({ items }: { items: Politician[] }) {
  return (
    <View style={styles.ticker}>
      {items.map((item) => (
        <View key={item.id} style={styles.tickerChip}>
          <Text style={styles.tickerCode}>{item.portraitEmoji}</Text>
          <Text numberOfLines={1} style={styles.tickerName}>
            {item.name}
          </Text>
          <Text style={styles.tickerValue}>{item.marketOdds}%</Text>
        </View>
      ))}
    </View>
  );
}

export function MarketSignalCard({ signal }: { signal?: MarketSignal }) {
  if (!signal) {
    return (
      <View style={styles.marketSignal}>
        <Text style={styles.marketSignalKicker}>Market signal</Text>
        <Text style={styles.marketSignalQuestion}>No active external market linked yet.</Text>
        <Text style={styles.marketSignalNote}>Display only. No bets inside the app.</Text>
      </View>
    );
  }

  const positive = signal.change >= 0;

  return (
    <View style={styles.marketSignal}>
      <View style={styles.marketSignalTop}>
        <Text style={styles.marketSignalKicker}>Market signal</Text>
        <Text style={[styles.marketSignalChange, { color: positive ? '#2dc653' : '#ef233c' }]}>
          {positive ? '+' : ''}
          {signal.change}%
        </Text>
      </View>
      <Text style={styles.marketSignalQuestion}>{signal.question}</Text>
      <View style={styles.marketTrack}>
        <View style={[styles.marketFill, { width: `${signal.probability}%` }]} />
      </View>
      <Text style={styles.marketSignalNote}>
        {signal.probability}% crowd price - {signal.linkLabel}
      </Text>
    </View>
  );
}

export function AdBanner({ label = 'Sponsored break' }: { label?: string }) {
  return (
    <View style={styles.adBanner}>
      <View style={styles.adIcon}>
        <Ionicons name="radio-outline" size={18} color={ink} />
      </View>
      <View style={styles.adCopy}>
        <Text style={styles.adLabel}>{label}</Text>
        <Text style={styles.adCaption}>300x50 inventory rail</Text>
      </View>
      <Text style={styles.adTag}>AD</Text>
    </View>
  );
}

export function PolymarketCard({ card, onYes, onNo }: { card: PolymarketCardType; onYes?: () => void; onNo?: () => void }) {
  return (
    <View style={styles.polymarketCard}>
      <Text style={styles.polymarketKicker}>PREDICTION MARKET</Text>
      <Text style={styles.polymarketQuestion}>{card.question}</Text>
      <View style={styles.oddsRow}>
        <Pressable style={styles.oddsBtnYes} onPress={onYes}>
          <Text style={styles.oddsValue}>{card.yesOdds}¢</Text>
          <Text style={styles.oddsLabel}>YES</Text>
        </Pressable>
        <Pressable style={styles.oddsBtnNo} onPress={onNo}>
          <Text style={styles.oddsValue}>{card.noOdds}¢</Text>
          <Text style={styles.oddsLabel}>NO</Text>
        </Pressable>
      </View>
      <Text style={styles.polymarketVolume}>Vol ${(card.volume24h / 1000).toFixed(1)}k</Text>
      <View style={styles.polymarketAttribution}>
        <Text style={styles.attributionText}>Markets on Polymarket</Text>
        <Text style={styles.affiliateTag}>Affiliate</Text>
      </View>
    </View>
  );
}

export function AuraFarmingMomentCard({ moment, onSwipe }: { moment: AuraFarmingMoment; onSwipe?: () => void }) {
  return (
    <View style={[styles.auraCard, { backgroundColor: '#111111' }]}>
      {moment.imageUrl ? (
        <Image source={{ uri: moment.imageUrl }} style={styles.auraImage} />
      ) : (
        <View style={styles.auraImagePlaceholder}>
          <Ionicons name="flash" size={48} color="#f7c948" />
        </View>
      )}
      <View style={styles.auraOverlay}>
        <Text style={styles.auraKicker}>{moment.category.toUpperCase()}</Text>
        <Text style={styles.auraTitle}>{moment.title}</Text>
        <Text style={styles.auraPoints}>+{moment.points} pts</Text>
        <Pressable style={styles.auraButton} onPress={onSwipe}>
          <Text style={styles.auraButtonText}>Got it</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function PoliticianCard({
  politician,
  captainPreview = false,
}: {
  politician: Politician;
  captainPreview?: boolean;
}) {
  const basePoints = calculateBasePoints(politician);
  const projectedPoints = captainPreview ? Math.round(basePoints * 1.8) : basePoints;
  const rating = getOverallRating(politician);
  const rarity = getCardRarity(politician);
  const rarityColor = getRarityColor(rarity);
  const damage = getAccountabilityDamage(politician);

  return (
    <View
      style={[
        styles.cardShellFifa,
        {
          borderColor: rarityColor,
          backgroundColor: politician.palette[0],
        },
      ]}>
      <View style={styles.cardTopFifa}>
        <View style={[styles.ratingBlockFifa, { backgroundColor: rarityColor }]}>
          <Text style={styles.ratingFifa}>{rating}</Text>
        </View>
      </View>

      <View style={[styles.cardArtFifa, { backgroundColor: politician.palette[1] }]}>
        <CaricaturePortrait politician={politician} size="large" />
      </View>

      <View style={styles.cardBottomFifa}>
        <View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.cardNameFifa}>
            {politician.name}
          </Text>
          <Text numberOfLines={1} style={styles.cardCountryFifa}>
            {politician.country}
          </Text>
        </View>
        <Text style={styles.projectedFifa}>{projectedPoints}</Text>
      </View>

      <View style={styles.statsGridFifa}>
        <StatBar label="Promise" value={politician.promiseScore} color="#2dc653" />
        <StatBar label="Truth" value={politician.integrityScore} color="#00a9a5" />
        <StatBar label="Market" value={politician.marketOdds} color="#f7c948" />
        <StatBar label="Risk" value={damage} color="#ef233c" />
      </View>
    </View>
  );
}

export function CaricaturePortrait({
  politician,
  size = 'small',
}: {
  politician: Politician;
  size?: 'small' | 'large';
}) {
  const isLarge = size === 'large';
  const trait = getPortraitTrait(politician.id);
  const showDecorations = !isLarge;

  return (
    <View style={[styles.portraitWrap, isLarge && styles.portraitWrapLarge]}>
      {showDecorations ? <View style={[styles.portraitAura, { backgroundColor: politician.palette[0] }]} /> : null}
      {showDecorations && trait === 'horseback' ? <View style={styles.horsebackShape} /> : null}
      <View style={[styles.portraitHead, isLarge && styles.portraitHeadLarge]}>
        {showDecorations ? (
          <View
            style={[
              styles.portraitHair,
              trait === 'hair' && styles.portraitHairTall,
              { backgroundColor: politician.palette[0] },
            ]}
          />
        ) : null}
        {showDecorations && trait === 'shades' ? <View style={styles.shades} /> : null}
        {showDecorations && trait === 'chainsaw' ? <View style={styles.chainsaw} /> : null}
        {showDecorations && trait === 'crown' ? <View style={styles.crownShape} /> : null}
        {politician.portraitImage ? (
          <Image
            source={politician.portraitImage}
            style={[styles.portraitImage, isLarge && styles.portraitImageLarge]}
            resizeMode="contain"
          />
        ) : (
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[styles.portraitInitials, isLarge && styles.portraitInitialsLarge]}>
            {getInitials(politician.name)}
          </Text>
        )}
      </View>
      {showDecorations && <Text style={styles.countryCode}>{politician.portraitEmoji}</Text>}
    </View>
  );
}

function getPortraitTrait(politicianId: string) {
  if (politicianId === 'us-president') {
    return 'hair';
  }
  if (politicianId === 'russia-president') {
    return 'horseback';
  }
  if (politicianId === 'argentina-president') {
    return 'chainsaw';
  }
  if (politicianId === 'el-salvador-president') {
    return 'shades';
  }
  if (politicianId === 'ukraine-president') {
    return 'crown';
  }
  return 'standard';
}

export function ReceiptStack({ receipts, compact = false }: { receipts: PromiseReceipt[]; compact?: boolean }) {
  const visibleReceipts = compact ? receipts.slice(0, 2) : receipts;

  if (!visibleReceipts.length) {
    return (
      <View style={styles.emptyReceipts}>
        <Text style={styles.emptyReceiptsText}>No receipts yet. This card is waiting for evidence.</Text>
      </View>
    );
  }

  return (
    <View style={styles.receiptStack}>
      {visibleReceipts.map((receipt) => (
        <View key={receipt.id} style={[styles.receiptRow, { borderLeftColor: getReceiptTone(receipt) }]}>
          <View style={styles.receiptTop}>
            <Text style={styles.receiptType}>{receipt.type.replace(/-/g, ' ')}</Text>
            <Text style={[styles.receiptPoints, { color: getReceiptTone(receipt) }]}>
              {receipt.points > 0 ? '+' : ''}
              {receipt.points}
            </Text>
          </View>
          <Text style={styles.receiptTitle}>{receipt.title}</Text>
          <Text style={styles.receiptSource}>
            {receipt.status} - {receipt.source}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function WildCardSpotlight({ event, politician }: { event?: WildCardEvent; politician?: Politician }) {
  if (!event || !politician) {
    return null;
  }

  const color = event.tone === 'buff' ? '#2dc653' : event.tone === 'crash' ? '#ef233c' : '#f7c948';

  return (
    <View style={[styles.wildCard, { borderColor: color }]}>
      <View style={styles.wildPortraitRail}>
        <CaricaturePortrait politician={politician} />
        <View style={styles.wildNotification}>
          <Text style={styles.gifLabel}>GIF NOTIFICATION</Text>
          <Text style={styles.gifCopy}>5s clip ready</Text>
        </View>
      </View>
      <View style={styles.wildTop}>
        <Text style={styles.wildKicker}>Wild card event</Text>
        <Text style={[styles.wildPoints, { color }]}>
          {event.points > 0 ? '+' : ''}
          {event.points}
        </Text>
      </View>
      <Text style={styles.wildTitle}>{event.title}</Text>
      <Text style={styles.wildPolitician}>{politician.name}</Text>
      <Text style={styles.wildCopy}>{event.trigger}</Text>
      <Text style={styles.wildEffect}>{event.effect}</Text>
      <View style={styles.soundRow}>
        <Ionicons name="musical-notes" size={16} color="#f7c948" />
        <Text style={styles.soundText}>8-bit sting + haptic hit</Text>
      </View>
    </View>
  );
}

export function ChallengerOverlay({
  event,
  politician,
  visible,
  onClose,
}: {
  event?: WildCardEvent;
  politician?: Politician;
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible || !event || !politician) {
    return null;
  }

  const color = event.tone === 'buff' ? '#2dc653' : event.tone === 'crash' ? '#ef233c' : '#f7c948';

  return (
    <View style={styles.challengerOverlay}>
      <View style={[styles.challengerCard, { borderColor: color }]}>
        <Text style={styles.challengerKicker}>Challenger approaching</Text>
        <CaricaturePortrait politician={politician} size="large" />
        <Text style={styles.challengerTitle}>{event.title}</Text>
        <Text style={styles.challengerName}>{politician.name}</Text>
        <Text style={styles.challengerEffect}>{event.effect}</Text>
        <View style={styles.challengerActions}>
          <ActionButton label="Swipe now" icon="flash" tone="gold" onPress={onClose} />
        </View>
      </View>
    </View>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statRowWrap}>
      {label ? <Text style={[styles.statLabel, { color }]}>{label}</Text> : null}
      <View style={styles.statRowCompact}>
        <View style={styles.statTrack}>
          <View style={[styles.statFill, { width: `${Math.min(100, value)}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

export function RosterStrip({ roster }: { roster: RosterSlot[] }) {
  return (
    <View style={styles.rosterStrip}>
      {Array.from({ length: 5 }).map((_, index) => {
        const slot = roster[index];
        const rarity = slot ? getCardRarity(slot.politician) : undefined;
        return (
          <View
            key={`slot-${index}`}
            style={[
              styles.rosterSeat,
              slot && {
                borderColor: getRarityColor(rarity as CardRarity),
                backgroundColor: slot.politician.palette[0],
              },
            ]}>
            {slot ? (
              <>
                <Text style={styles.rosterRating}>{getOverallRating(slot.politician)}</Text>
                <Text numberOfLines={1} style={styles.rosterInitials}>
                  {getInitials(slot.politician.name)}
                </Text>
                <Text numberOfLines={1} style={styles.rosterName}>
                  {slot.politician.name}
                </Text>
                <Text style={styles.rosterPoints}>{slot.points} pts</Text>
                {slot.captain ? <Text style={styles.captainTag}>C</Text> : null}
              </>
            ) : (
              <>
                <Ionicons name="add" size={22} color={muted} />
                <Text style={styles.rosterEmptyLabel}>Slot {index + 1}</Text>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function LeagueStandingRow({
  entry,
  rank,
  isYou,
}: {
  entry: LeagueEntry;
  rank: number;
  isYou?: boolean;
}) {
  return (
    <View style={[styles.standingRow, isYou && styles.standingRowYou]}>
      <Text style={styles.standingRank}>#{rank}</Text>
      <View style={styles.standingAvatar}>
        <View style={styles.standingAvatarPlaceholder} />
      </View>
      <View style={styles.standingBody}>
        <Text style={styles.standingName}>{entry.name}</Text>
        <Text style={styles.standingTruth}>
          {entry.policyFocus ? `${entry.policyFocus} focus` : entry.vibe}
          {entry.truthScore !== undefined ? ` · Truth ${entry.truthScore}%` : ''}
        </Text>
      </View>
      <Text style={styles.standingScore}>{entry.score}</Text>
    </View>
  );
}

export function EventCard({ event, politician }: { event: MemeEvent; politician?: Politician }) {
  const toneColor =
    event.tone === 'buff' ? '#2dc653' : event.tone === 'crash' ? '#ef233c' : '#00a9a5';
  const icon =
    event.tone === 'buff'
      ? 'trending-up'
      : event.tone === 'crash'
        ? 'trending-down'
        : 'flash-outline';

  return (
    <View style={[styles.eventCard, { borderLeftColor: toneColor }]}>
      <Ionicons name={icon} size={22} color={toneColor} />
      <View style={styles.eventBody}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={[styles.eventDelta, { color: toneColor }]}>
            {event.scoreDelta > 0 ? '+' : ''}
            {event.scoreDelta}
          </Text>
        </View>
        <Text style={styles.eventDetail}>{event.detail}</Text>
        {politician ? (
          <Text style={styles.eventFoot}>
            {politician.name} - {politician.country}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function SharePoster({ slot }: { slot: RosterSlot }) {
  const rarity = getCardRarity(slot.politician);
  const rarityColor = getRarityColor(rarity);

  return (
    <View style={[styles.poster, { borderColor: rarityColor }]}>
      <View style={styles.posterTop}>
        <View>
          <Text style={styles.posterLabel}>POWER CABINET CARD</Text>
          <Text style={styles.posterName}>{slot.politician.name}</Text>
          <Text style={styles.posterRole}>
            {slot.politician.country} - {slot.politician.role}
          </Text>
        </View>
        <View style={[styles.posterRating, { backgroundColor: rarityColor }]}>
          <Text style={styles.posterRatingText}>{getOverallRating(slot.politician)}</Text>
        </View>
      </View>
      <View style={[styles.posterArt, { backgroundColor: slot.politician.palette[0] }]}>
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.posterInitials}>
          {getInitials(slot.politician.name)}
        </Text>
      </View>
      <Text style={styles.posterHeadline}>
        {slot.captain ? 'Captain multiplier active' : `${rarity} squad card`} - {slot.points} pts
      </Text>
      <Text style={styles.posterCopy}>{slot.politician.scoutingReport}</Text>
      <View style={styles.posterTags}>
        {slot.politician.issues.map((issue) => (
          <Text key={issue} style={styles.posterTag}>
            #{issue.replace(/\s+/g, '')}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stageBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f3ead7',
  },
  stageStripe: {
    position: 'absolute',
    height: 170,
    left: -80,
    right: -80,
    transform: [{ rotate: '-8deg' }],
  },
  stageStripeOne: {
    top: -30,
    backgroundColor: '#111111',
  },
  stageStripeTwo: {
    top: 118,
    backgroundColor: '#ef233c',
  },
  stageStripeThree: {
    bottom: -20,
    backgroundColor: '#00a9a5',
  },
  pitchLine: {
    position: 'absolute',
    top: 165,
    left: 20,
    right: 20,
    borderTopWidth: 2,
    borderColor: 'rgba(17,17,17,0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  kicker: {
    color: '#ef233c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  headerTitle: {
    color: ink,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
    marginTop: 4,
    maxWidth: 280,
  },
  headerBadge: {
    minWidth: 72,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: '#f7c948',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerBadgeValue: {
    color: ink,
    fontSize: 22,
    fontWeight: '900',
  },
  headerBadgeLabel: {
    color: ink,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: paper,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  scoreTile: {
    flexGrow: 1,
    minWidth: 98,
    borderRadius: 8,
    borderWidth: 2,
    borderTopWidth: 7,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
  },
  scoreTileValue: {
    color: ink,
    fontSize: 24,
    fontWeight: '900',
  },
  scoreTileLabel: {
    color: muted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  ticker: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tickerChip: {
    maxWidth: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  tickerCode: {
    color: ink,
    fontSize: 11,
    fontWeight: '900',
  },
  tickerName: {
    color: ink,
    fontSize: 12,
    fontWeight: '800',
    flexShrink: 1,
  },
  tickerValue: {
    color: '#ef233c',
    fontSize: 12,
    fontWeight: '900',
  },
  marketSignal: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
    gap: 8,
  },
  marketSignalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  marketSignalKicker: {
    color: '#ef233c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  marketSignalChange: {
    fontSize: 13,
    fontWeight: '900',
  },
  marketSignalQuestion: {
    color: ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  marketTrack: {
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ink,
    overflow: 'hidden',
    backgroundColor: '#eadfca',
  },
  marketFill: {
    height: '100%',
    backgroundColor: '#f7c948',
  },
  marketSignalNote: {
    color: muted,
    fontSize: 11,
    fontWeight: '800',
  },
  adBanner: {
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#837766',
    backgroundColor: '#fff7e6',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7c948',
  },
  adCopy: {
    flex: 1,
  },
  adLabel: {
    color: ink,
    fontSize: 14,
    fontWeight: '900',
  },
  adCaption: {
    color: muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  adTag: {
    color: ink,
    fontSize: 12,
    fontWeight: '900',
  },
  cardShell: {
    minHeight: 585,
    borderRadius: 8,
    borderWidth: 4,
    padding: 14,
    overflow: 'hidden',
  },
  foilStripeA: {
    position: 'absolute',
    width: 120,
    height: 720,
    left: 30,
    top: -70,
    backgroundColor: 'rgba(255,255,255,0.26)',
    transform: [{ rotate: '18deg' }],
  },
  foilStripeB: {
    position: 'absolute',
    width: 80,
    height: 720,
    right: 44,
    top: -90,
    backgroundColor: 'rgba(17,17,17,0.15)',
    transform: [{ rotate: '18deg' }],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  ratingBlock: {
    width: 74,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: paper,
    paddingVertical: 6,
    alignItems: 'center',
  },
  rating: {
    color: ink,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '900',
  },
  position: {
    color: ink,
    fontSize: 13,
    fontWeight: '900',
  },
  rarityTag: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rarityText: {
    color: ink,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardArt: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: paper,
    padding: 10,
    zIndex: 1,
  },
  cardArtPlate: {
    minHeight: 168,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  portraitWrap: {
    width: 132,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitWrapLarge: {
    width: '100%',
    height: undefined,
    aspectRatio: 3 / 4,
    maxHeight: 320,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitAura: {
    position: 'absolute',
    width: 102,
    height: 102,
    borderRadius: 999,
    opacity: 0.34,
    transform: [{ scaleX: 1.45 }],
  },
  portraitHead: {
    width: 78,
    height: 78,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: paper,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  portraitHeadLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  portraitHair: {
    position: 'absolute',
    top: -12,
    width: 62,
    height: 26,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: ink,
    zIndex: 2,
  },
  portraitHairTall: {
    top: -24,
    height: 38,
    transform: [{ rotate: '-8deg' }],
  },
  portraitInitials: {
    color: ink,
    fontSize: 26,
    fontWeight: '900',
  },
  portraitInitialsLarge: {
    fontSize: 46,
  },
  portraitImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    resizeMode: 'contain',
  },
  portraitImageLarge: {
    borderRadius: 0,
    width: '100%',
    height: '100%',
  },
  horsebackShape: {
    position: 'absolute',
    bottom: 10,
    width: 132,
    height: 34,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: '#6d4c35',
  },
  shades: {
    position: 'absolute',
    top: 25,
    width: 56,
    height: 14,
    borderRadius: 6,
    backgroundColor: ink,
    zIndex: 2,
  },
  chainsaw: {
    position: 'absolute',
    right: -32,
    bottom: 4,
    width: 58,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: '#f7c948',
    transform: [{ rotate: '-18deg' }],
  },
  crownShape: {
    position: 'absolute',
    top: -28,
    width: 58,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: '#f7c948',
    transform: [{ rotate: '5deg' }],
  },
  initials: {
    color: paper,
    fontSize: 86,
    fontWeight: '900',
  },
  countryCode: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    color: paper,
    fontSize: 20,
    fontWeight: '900',
  },
  countryCodeLarge: {
    right: 22,
    bottom: 12,
    fontSize: 24,
  },
  memeSkin: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: -6,
    color: paper,
    backgroundColor: ink,
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  memeSkinLarge: {
    bottom: 4,
    fontSize: 11,
  },
  cardNamePlate: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
    zIndex: 1,
  },
  cardName: {
    color: ink,
    fontSize: 26,
    fontWeight: '900',
  },
  cardRole: {
    color: muted,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  statsGrid: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
    gap: 9,
    zIndex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    minWidth: 54,
  },
  statTrack: {
    flex: 1,
    height: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ink,
    overflow: 'hidden',
    backgroundColor: '#eadfca',
  },
  statFill: {
    height: '100%',
    borderRadius: 999,
  },
  statValue: {
    width: 26,
    color: ink,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '900',
  },
  statRowWrap: {
    gap: 4,
  },
  cardBottom: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
    zIndex: 1,
  },
  projectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  projected: {
    color: '#ef233c',
    fontSize: 30,
    fontWeight: '900',
  },
  receiptMini: {
    minWidth: 58,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: '#eadfca',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  receiptMiniGood: {
    color: '#2dc653',
    fontSize: 13,
    fontWeight: '900',
  },
  receiptMiniBad: {
    color: '#ef233c',
    fontSize: 13,
    fontWeight: '900',
  },
  projectedLabel: {
    color: muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: -2,
  },
  signature: {
    color: ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  rosterStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rosterSeat: {
    flexBasis: '31%',
    flexGrow: 1,
    minHeight: 126,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: paper,
    padding: 9,
    justifyContent: 'center',
  },
  rosterRating: {
    color: ink,
    fontSize: 18,
    fontWeight: '900',
  },
  rosterInitials: {
    color: ink,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  standingAvatar: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff7e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  standingAvatarImage: {
    width: '100%',
    height: '100%',
  },
  standingAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#837766',
  },
  rosterName: {
    color: ink,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  rosterPoints: {
    color: paper,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 5,
  },
  captainTag: {
    position: 'absolute',
    right: 6,
    top: 6,
    color: ink,
    backgroundColor: '#f7c948',
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '900',
  },
  rosterEmptyLabel: {
    color: muted,
    fontSize: 12,
    marginTop: 5,
    fontWeight: '900',
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    padding: 14,
    backgroundColor: paper,
    borderWidth: 2,
    borderColor: ink,
  },
  standingRowYou: {
    backgroundColor: '#f7c948',
  },
  standingRank: {
    color: ink,
    fontSize: 18,
    fontWeight: '900',
    width: 36,
  },
  standingBody: {
    flex: 1,
  },
  standingName: {
    color: ink,
    fontSize: 15,
    fontWeight: '900',
  },
  standingVibe: {
    color: muted,
    fontSize: 11,
    marginTop: 3,
    fontWeight: '800',
  },
  standingTruth: {
    color: muted,
    fontSize: 11,
    marginTop: 3,
    fontWeight: '800',
  },
  standingScore: {
    color: '#ef233c',
    fontSize: 18,
    fontWeight: '900',
  },
  eventCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderLeftWidth: 8,
    borderColor: ink,
    padding: 14,
    backgroundColor: paper,
  },
  eventBody: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  eventTitle: {
    color: ink,
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
  },
  eventDelta: {
    fontSize: 16,
    fontWeight: '900',
  },
  eventDetail: {
    color: ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  eventFoot: {
    color: muted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  poster: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: paper,
    borderWidth: 4,
    gap: 12,
  },
  posterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  posterLabel: {
    color: '#ef233c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  posterName: {
    color: ink,
    fontSize: 23,
    fontWeight: '900',
    marginTop: 3,
  },
  posterRole: {
    color: muted,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  posterRating: {
    minWidth: 58,
    height: 58,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterRatingText: {
    color: ink,
    fontSize: 25,
    fontWeight: '900',
  },
  posterArt: {
    minHeight: 126,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterInitials: {
    color: paper,
    fontSize: 72,
    fontWeight: '900',
  },
  posterHeadline: {
    color: '#ef233c',
    fontSize: 15,
    fontWeight: '900',
  },
  posterCopy: {
    color: ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  posterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  posterTag: {
    color: ink,
    borderWidth: 1,
    borderColor: ink,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '900',
  },
  receiptStack: {
    gap: 8,
  },
  receiptRow: {
    borderRadius: 8,
    borderWidth: 2,
    borderLeftWidth: 8,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
    gap: 6,
  },
  receiptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  receiptType: {
    color: muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  receiptPoints: {
    fontSize: 14,
    fontWeight: '900',
  },
  receiptTitle: {
    color: ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  receiptSource: {
    color: muted,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyReceipts: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
  },
  emptyReceiptsText: {
    color: muted,
    fontSize: 13,
    fontWeight: '800',
  },
  wildCard: {
    borderRadius: 8,
    borderWidth: 4,
    backgroundColor: '#111111',
    padding: 14,
    gap: 7,
  },
  wildPortraitRail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  wildNotification: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff7e6',
    padding: 10,
  },
  gifLabel: {
    color: '#f7c948',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gifCopy: {
    color: '#fff7e6',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  wildTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  wildKicker: {
    color: '#fff7e6',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  wildPoints: {
    fontSize: 14,
    fontWeight: '900',
  },
  wildTitle: {
    color: '#fff7e6',
    fontSize: 22,
    fontWeight: '900',
  },
  wildPolitician: {
    color: '#f7c948',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  wildCopy: {
    color: '#fff7e6',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  wildEffect: {
    color: '#f7c948',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 3,
  },
  soundText: {
    color: '#f7c948',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  challengerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: 'rgba(17,17,17,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  challengerCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 8,
    borderWidth: 5,
    backgroundColor: '#111111',
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  challengerKicker: {
    color: '#f7c948',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  challengerTitle: {
    color: '#fff7e6',
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '900',
  },
  challengerName: {
    color: '#f7c948',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  challengerEffect: {
    color: '#fff7e6',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '800',
  },
  challengerActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 4,
  },
  
  // FIFA-style card
  cardShellFifa: {
    minHeight: 520,
    borderRadius: 10,
    borderWidth: 3,
    overflow: 'hidden',
  },
  cardTopFifa: {
    paddingHorizontal: 12,
    paddingTop: 12,
    zIndex: 1,
  },
  ratingBlockFifa: {
    width: 60,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ink,
    paddingVertical: 4,
    alignItems: 'center',
  },
  ratingFifa: {
    color: ink,
    fontSize: 28,
    fontWeight: '900',
  },
  cardArtFifa: {
    marginVertical: 12,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardBottomFifa: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  cardNameFifa: {
    color: ink,
    fontSize: 18,
    fontWeight: '900',
  },
  cardCountryFifa: {
    color: muted,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  projectedFifa: {
    color: ink,
    fontSize: 22,
    fontWeight: '900',
    minWidth: 50,
    textAlign: 'right',
  },
  statsGridFifa: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 6,
  },
  statRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 6,
  },
  // Polymarket Card
  polymarketCard: {
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#00a9a5',
    backgroundColor: '#fff7e6',
    padding: 16,
    gap: 12,
  },
  polymarketKicker: {
    color: '#00a9a5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  polymarketQuestion: {
    color: ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  oddsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  oddsBtnYes: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#2dc653',
    backgroundColor: '#2dc653',
    padding: 12,
    alignItems: 'center',
  },
  oddsBtnNo: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ef233c',
    backgroundColor: '#ef233c',
    padding: 12,
    alignItems: 'center',
  },
  oddsValue: {
    color: paper,
    fontSize: 24,
    fontWeight: '900',
  },
  oddsLabel: {
    color: paper,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  polymarketVolume: {
    color: muted,
    fontSize: 12,
    fontWeight: '900',
  },
  polymarketAttribution: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  attributionText: {
    color: muted,
    fontSize: 11,
    fontWeight: '800',
  },
  affiliateTag: {
    color: '#f7c948',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  // Aura Farming Moment Card
  auraCard: {
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#f7c948',
    overflow: 'hidden',
    minHeight: 300,
    justifyContent: 'flex-end',
  },
  auraImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  auraImagePlaceholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  auraOverlay: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 14,
    gap: 8,
  },
  auraKicker: {
    color: '#f7c948',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  auraTitle: {
    color: '#fff7e6',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  auraPoints: {
    color: '#2dc653',
    fontSize: 16,
    fontWeight: '900',
  },
  auraButton: {
    backgroundColor: '#f7c948',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  auraButtonText: {
    color: ink,
    fontSize: 14,
    fontWeight: '900',
  },
  promoBanner: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTitle: {
    color: '#ef233c',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  promoSubtitle: {
    color: ink,
    fontSize: 14,
    fontWeight: '900',
  },
});

export function RegionalPromo({ region = 'Global', politician, onExplore }: { region?: string; politician?: Politician; onExplore?: () => void }) {
  if (!politician) {
    return (
      <View style={styles.promoBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.promoTitle}>{region} Spotlight</Text>
          <Text style={styles.promoSubtitle}>Discover region-specific squads and events</Text>
        </View>
        <ActionButton label="Explore" icon="globe" tone="accent" onPress={onExplore ?? (() => {})} />
      </View>
    );
  }

  return (
    <View style={styles.promoBanner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.promoTitle}>{region} Spotlight</Text>
        <Text style={styles.promoSubtitle}>{politician.name} — {politician.role}</Text>
      </View>
      <ActionButton label={`Follow ${politician.name}`} icon="person" tone="gold" onPress={onExplore ?? (() => {})} />
    </View>
  );
}
