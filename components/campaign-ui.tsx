import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPortrait, PortraitFaceOff } from '@/components/animated';
import type { PortraitState } from '@/components/animated';
import { CLASS_ICON, battleClass } from '@/lib/campaign';
import { BattleClass, CommentaryLine, RoundBreakdown } from '@/types/campaign';
import { Politician } from '@/types/game';

const ink = '#111111';
const paper = '#fff7e6';
const muted = '#837766';
const gold = '#f7c948';
const red = '#ef233c';
const green = '#2dc653';
const teal = '#00a9a5';

// ── Coalition map: one region per showdown, lights up on wins ────────────────
export function CoalitionMap({
  total,
  matchIndex,
  wins,
  losses,
  championship = false,
}: {
  total: number;
  matchIndex: number;
  wins: number;
  losses: number;
  championship?: boolean;
}) {
  return (
    <View style={styles.mapWrap}>
      <View style={styles.mapRow}>
        {Array.from({ length: total }).map((_, i) => {
          const won = i < wins;
          const isCurrent = i === matchIndex && !championship;
          return (
            <View
              key={i}
              style={[
                styles.region,
                won && styles.regionWon,
                isCurrent && styles.regionCurrent,
                championship && styles.regionWon,
              ]}
            >
              <Text style={[styles.regionText, (won || championship) && { color: ink }]}>{i + 1}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.mapMeta}>
        <Text style={styles.mapMetaText}>
          {championship ? 'FULL COALITION' : `${wins} region${wins === 1 ? '' : 's'} held`}
        </Text>
        <Text style={[styles.mapMetaText, { color: red }]}>
          {'✕'.repeat(losses)}{losses ? ` ${losses} loss${losses === 1 ? '' : 'es'}` : ''}
        </Text>
      </View>
    </View>
  );
}

export function ClassChip({ cls, small = false }: { cls: BattleClass; small?: boolean }) {
  return (
    <View style={[styles.classChip, small && styles.classChipSmall]}>
      <Text style={[styles.classChipText, small && { fontSize: 10 }]}>
        {CLASS_ICON[cls]} {cls}
      </Text>
    </View>
  );
}

// ── Face-off arena: PortraitFaceOff clash when both sides are committed, ─────
// two-column select layout while the player is still choosing.
export function FaceOff({
  playerPol,
  rivalPol,
  playerState,
  rivalState,
  issue,
  size = 110,
}: {
  playerPol?: Politician;
  rivalPol?: Politician;
  playerState: PortraitState;
  rivalState: PortraitState;
  issue: string;
  size?: number;
}) {
  const issueTag = (
    <View style={styles.issueTag}>
      <Text style={styles.issueTagLabel}>ISSUE</Text>
      <Text style={styles.issueTagText}>{issue}</Text>
    </View>
  );

  if (playerPol && rivalPol) {
    // Both committed — the animated clash arena.
    return (
      <View style={styles.arena}>
        <PortraitFaceOff
          left={playerPol}
          right={rivalPol}
          leftState={playerState}
          rightState={rivalState}
          size={size}
        />
        <View style={styles.arenaNames}>
          <View style={styles.faceCol}>
            <Text numberOfLines={1} style={styles.arenaName}>{playerPol.name}</Text>
            <ClassChip cls={battleClass(playerPol)} small />
          </View>
          {issueTag}
          <View style={styles.faceCol}>
            <Text numberOfLines={1} style={styles.arenaName}>{rivalPol.name}</Text>
            <ClassChip cls={battleClass(rivalPol)} small />
          </View>
        </View>
      </View>
    );
  }

  // Select phase — player side (or empty), rival still hidden.
  return (
    <View style={styles.faceOff}>
      <View style={styles.faceCol}>
        {playerPol ? (
          <AnimatedPortrait politician={playerPol} size={size} state={playerState} />
        ) : (
          <View style={[styles.emptyPortrait, { width: size, height: size }]}>
            <Text style={styles.emptyPortraitText}>?</Text>
          </View>
        )}
        <Text numberOfLines={1} style={styles.faceName}>{playerPol?.name ?? 'Choose'}</Text>
        {playerPol ? <ClassChip cls={battleClass(playerPol)} small /> : null}
      </View>

      <View style={styles.faceCenter}>
        <Text style={styles.vsText}>VS</Text>
        {issueTag}
      </View>

      <View style={styles.faceCol}>
        <View style={[styles.emptyPortrait, { width: size, height: size }]}>
          <Text style={styles.emptyPortraitText}>?</Text>
        </View>
        <Text numberOfLines={1} style={styles.faceName}>Rival</Text>
      </View>
    </View>
  );
}

// ── Round math breakdown — the "why did I win/lose" panel ────────────────────
function BreakdownRow({ label, value }: { label: string; value: number }) {
  if (!value) return null;
  const positive = value > 0;
  return (
    <View style={styles.bdRow}>
      <Text style={styles.bdLabel}>{label}</Text>
      <Text style={[styles.bdValue, { color: positive ? green : red }]}>
        {positive ? '+' : ''}{value}
      </Text>
    </View>
  );
}

export function RoundBreakdownPanel({
  breakdown,
  playerName,
  rivalName,
  winner,
}: {
  breakdown: RoundBreakdown;
  playerName: string;
  rivalName: string;
  winner: 'player' | 'rival';
}) {
  const { player, rival, margin } = breakdown;
  return (
    <View style={styles.bdPanel}>
      <View style={styles.bdCols}>
        <View style={[styles.bdCol, winner === 'player' && styles.bdColWin]}>
          <Text numberOfLines={1} style={styles.bdName}>{playerName}</Text>
          <BreakdownRow label="Base power" value={player.base} />
          <BreakdownRow label="Issue match" value={player.issueBonus} />
          <BreakdownRow label="Class edge" value={player.classBonus} />
          <BreakdownRow label="Event swing" value={player.eventSwing} />
          <BreakdownRow label="Signature" value={player.signature} />
          <BreakdownRow label="Luck / volatility" value={player.volatilitySwing} />
          <View style={styles.bdTotalRow}>
            <Text style={styles.bdTotalLabel}>TOTAL</Text>
            <Text style={styles.bdTotalValue}>{player.total}</Text>
          </View>
        </View>

        <View style={[styles.bdCol, winner === 'rival' && styles.bdColWin]}>
          <Text numberOfLines={1} style={styles.bdName}>{rivalName}</Text>
          <BreakdownRow label="Base power" value={rival.base} />
          <BreakdownRow label="Issue match" value={rival.issueBonus} />
          <BreakdownRow label="Class edge" value={rival.classBonus} />
          <BreakdownRow label="Event swing" value={rival.eventSwing} />
          <BreakdownRow label="Signature" value={rival.signature} />
          <BreakdownRow label="Luck / volatility" value={rival.volatilitySwing} />
          <View style={styles.bdTotalRow}>
            <Text style={styles.bdTotalLabel}>TOTAL</Text>
            <Text style={styles.bdTotalValue}>{rival.total}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.marginBar, { backgroundColor: winner === 'player' ? green : red }]}>
        <Text style={styles.marginText}>
          {winner === 'player' ? playerName : rivalName} wins by {Math.abs(margin)}
        </Text>
      </View>
    </View>
  );
}

// ── Commentary log ──────────────────────────────────────────────────────────
export function CommentaryLog({ lines, max = 6 }: { lines: CommentaryLine[]; max?: number }) {
  const toneColor = (t: CommentaryLine['tone']) =>
    t === 'player' ? green : t === 'rival' ? red : t === 'event' ? teal : t === 'signature' ? gold : ink;
  return (
    <View style={styles.logWrap}>
      {lines.slice(0, max).map((l) => (
        <View key={l.id} style={styles.logRow}>
          <View style={[styles.logDot, { backgroundColor: toneColor(l.tone) }]} />
          <Text style={styles.logText}>{l.text}</Text>
        </View>
      ))}
    </View>
  );
}

export function CapitalBadge({ value }: { value: number }) {
  return (
    <View style={styles.capital}>
      <Ionicons name="cash" size={14} color={ink} />
      <Text style={styles.capitalText}>{value} PC</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: { gap: 8 },
  mapRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  region: {
    flexGrow: 1,
    minWidth: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: '#eadfca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionWon: { backgroundColor: gold },
  regionCurrent: { borderColor: red, borderWidth: 3, backgroundColor: paper },
  regionText: { color: muted, fontSize: 14, fontWeight: '900' },
  mapMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  mapMetaText: { color: muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },

  classChip: {
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: ink,
    backgroundColor: paper,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  classChipSmall: { paddingHorizontal: 6, paddingVertical: 2 },
  classChipText: { color: ink, fontSize: 12, fontWeight: '900' },

  arena: {
    borderRadius: 14,
    borderWidth: 3,
    borderColor: ink,
    backgroundColor: '#181c28',
    paddingVertical: 16,
    paddingHorizontal: 10,
    gap: 12,
  },
  arenaNames: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  arenaName: { color: paper, fontSize: 13, fontWeight: '900', maxWidth: 130, textAlign: 'center' },
  faceOff: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  faceCol: { alignItems: 'center', gap: 6, flex: 1 },
  faceCenter: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 30 },
  faceName: { color: ink, fontSize: 13, fontWeight: '900', maxWidth: 120, textAlign: 'center' },
  vsText: { color: red, fontSize: 22, fontWeight: '900' },
  issueTag: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: gold,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  issueTagLabel: { color: ink, fontSize: 8, fontWeight: '900' },
  issueTagText: { color: ink, fontSize: 12, fontWeight: '900' },
  emptyPortrait: {
    borderRadius: 20,
    borderWidth: 3,
    borderColor: muted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eadfca',
  },
  emptyPortraitText: { color: muted, fontSize: 40, fontWeight: '900' },

  bdPanel: { gap: 8 },
  bdCols: { flexDirection: 'row', gap: 8 },
  bdCol: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    padding: 10,
    gap: 3,
  },
  bdColWin: { borderColor: green, borderWidth: 3 },
  bdName: { color: ink, fontSize: 13, fontWeight: '900', marginBottom: 4 },
  bdRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bdLabel: { color: muted, fontSize: 11, fontWeight: '700' },
  bdValue: { fontSize: 12, fontWeight: '900' },
  bdTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0d4bd',
  },
  bdTotalLabel: { color: ink, fontSize: 11, fontWeight: '900' },
  bdTotalValue: { color: ink, fontSize: 16, fontWeight: '900' },
  marginBar: { borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  marginText: { color: paper, fontSize: 13, fontWeight: '900' },

  logWrap: { gap: 8 },
  logRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  logDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  logText: { color: ink, fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 },

  capital: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: gold,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  capitalText: { color: ink, fontSize: 13, fontWeight: '900' },
});
