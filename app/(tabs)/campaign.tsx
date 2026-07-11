import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground, ScreenHeader } from '@/components/game-ui';
import { AnimatedPortrait, AnimatedPortraitRow } from '@/components/animated';
import type { PortraitState } from '@/components/animated';
import {
  CapitalBadge,
  ClassChip,
  CoalitionMap,
  CommentaryLog,
  FaceOff,
  RoundBreakdownPanel,
} from '@/components/campaign-ui';
import {
  MAX_LOSSES,
  ROUNDS_TO_WIN,
  STARTER_CABINETS,
  battleClass,
  getPolitician,
  getPoliticians,
} from '@/lib/campaign';
import { useCampaign } from '@/providers/campaign-provider';
import { useGame } from '@/providers/game-provider';

const ink = '#111111';
const paper = '#fff7e6';
const muted = '#837766';
const gold = '#f7c948';
const red = '#ef233c';
const green = '#2dc653';

export default function CampaignScreen() {
  const { state, ready } = useCampaign();

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBackground />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading campaign…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground />
      {state.phase === 'title' && <TitleScreen />}
      {state.phase === 'season' && <SeasonScreen />}
      {state.phase === 'showdown' && (state.showdown ? <ShowdownScreen /> : <SeasonScreen />)}
      {state.phase === 'result' && <ResultScreen />}
      {state.phase === 'recruit' && <RecruitScreen />}
      {state.phase === 'championship' && <EndScreen kind="championship" />}
      {state.phase === 'gameover' && <EndScreen kind="gameover" />}
    </SafeAreaView>
  );
}

// ── TITLE ────────────────────────────────────────────────────────────────────
function TitleScreen() {
  const { startCampaign } = useCampaign();
  const { roster } = useGame();
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);

  const draftedIds = roster.map((s) => s.politician.id);
  const canUseDrafted = draftedIds.length >= 3;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader kicker="CAMPAIGN MODE" title="Galactic Politics" />
      <Text style={styles.lead}>
        Draft a cabinet, march through {6} political showdowns against escalating rival
        cabinets, and hold the coalition. Lose {MAX_LOSSES} showdowns and the season is over.
      </Text>

      <Text style={styles.sectionTitle}>Pick your cabinet</Text>
      {STARTER_CABINETS.map((c) => {
        const members = getPoliticians(c.memberIds);
        const active = picked === c.id;
        return (
          <Pressable
            key={c.id}
            style={[styles.cabinetCard, active && styles.cabinetCardActive]}
            onPress={() => setPicked(active ? null : c.id)}
          >
            <View style={styles.cabinetHead}>
              <Text style={styles.cabinetName}>{c.name}</Text>
              {active ? <Ionicons name="checkmark-circle" size={22} color={green} /> : null}
            </View>
            <Text style={styles.cabinetBlurb}>{c.blurb}</Text>
            <AnimatedPortraitRow politicians={members} size={52} state="idle" />
          </Pressable>
        );
      })}

      {canUseDrafted ? (
        <Pressable
          style={[styles.cabinetCard, picked === 'drafted' && styles.cabinetCardActive]}
          onPress={() => setPicked(picked === 'drafted' ? null : 'drafted')}
        >
          <View style={styles.cabinetHead}>
            <Text style={styles.cabinetName}>My Drafted Squad</Text>
            {picked === 'drafted' ? <Ionicons name="checkmark-circle" size={22} color={green} /> : null}
          </View>
          <Text style={styles.cabinetBlurb}>Use the cabinet you built on the Draft tab.</Text>
          <AnimatedPortraitRow politicians={getPoliticians(draftedIds)} size={52} state="idle" />
        </Pressable>
      ) : (
        <Pressable style={styles.linkCard} onPress={() => router.push('/(tabs)/index' as never)}>
          <Ionicons name="albums" size={20} color={ink} />
          <Text style={styles.linkCardText}>Or draft your own squad on the Draft tab →</Text>
        </Pressable>
      )}

      <Pressable
        disabled={!picked}
        style={[styles.primaryBtn, !picked && styles.btnDisabled]}
        onPress={() => {
          if (!picked) return;
          if (picked === 'drafted') {
            startCampaign(draftedIds, 'My Drafted Squad');
          } else {
            const c = STARTER_CABINETS.find((x) => x.id === picked)!;
            startCampaign(c.memberIds, c.name);
          }
        }}
      >
        <Text style={styles.primaryBtnText}>{picked ? 'Start the season →' : 'Pick a cabinet to begin'}</Text>
      </Pressable>
    </ScrollView>
  );
}

// ── SEASON MAP ───────────────────────────────────────────────────────────────
function SeasonScreen() {
  const { state, beginShowdown, restart } = useCampaign();
  const cabinet = getPoliticians(state.cabinet);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader kicker={`SEASON · MATCH ${state.matchIndex + 1}`} title={state.cabinetName} />
      <View style={styles.badgeRow}>
        <CapitalBadge value={state.politicalCapital} />
        <View style={styles.recordBadge}>
          <Text style={styles.recordText}>{state.wins}W · {state.losses}L</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Coalition map</Text>
      <CoalitionMap total={state.totalMatches} matchIndex={state.matchIndex} wins={state.wins} losses={state.losses} />

      <Text style={styles.sectionTitle}>Your cabinet</Text>
      <View style={styles.cabinetGrid}>
        {cabinet.map((p) => (
          <View key={p.id} style={styles.gridCell}>
            <AnimatedPortrait politician={p} size={64} state="idle" />
            <Text numberOfLines={1} style={styles.gridName}>{p.name}</Text>
            <ClassChip cls={battleClass(p)} small />
          </View>
        ))}
      </View>

      <Pressable style={styles.primaryBtn} onPress={beginShowdown}>
        <Text style={styles.primaryBtnText}>Enter Showdown {state.matchIndex + 1} →</Text>
      </Pressable>
      <Pressable style={styles.ghostBtn} onPress={restart}>
        <Text style={styles.ghostBtnText}>Abandon &amp; restart</Text>
      </Pressable>
    </ScrollView>
  );
}

// ── SHOWDOWN ─────────────────────────────────────────────────────────────────
type Stage = 'select' | 'stare' | 'clash' | 'hit' | 'verdict';

function ShowdownScreen() {
  const { state, commitRound, nextRound } = useCampaign();
  const sd = state.showdown!;
  const round = sd.round;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [useSig, setUseSig] = useState(false);
  const [stage, setStage] = useState<Stage>('select');
  const animatedRound = useRef<number>(-1);

  const playerPol = getPolitician(round.playerUnitId ?? selectedId ?? '');
  const rivalPol = round.resolved ? getPolitician(round.rivalUnitId ?? '') : undefined;

  // Reset selection when a fresh round starts.
  useEffect(() => {
    if (sd.phase === 'select') {
      setSelectedId(null);
      setUseSig(false);
      setStage('select');
    }
  }, [round.number, sd.phase]);

  // Drive the commit → staredown → clash → hit → verdict sequence.
  useEffect(() => {
    if ((sd.phase === 'resolved' || sd.phase === 'done') && animatedRound.current !== round.number) {
      animatedRound.current = round.number;
      setStage('stare');
      const t1 = setTimeout(() => setStage('clash'), 700);
      const t2 = setTimeout(() => setStage('hit'), 1350);
      const t3 = setTimeout(() => setStage('verdict'), 2000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [sd.phase, round.number]);

  const winner = round.winner;
  // Beat sheet: taunt/taunt → attack/attack (shared clash flash) → loser hurt → victory/defeat.
  const sideState = (side: 'player' | 'rival'): PortraitState => {
    switch (stage) {
      case 'stare':
        return 'taunt';
      case 'clash':
        return 'attack';
      case 'hit':
        return winner === side ? 'idle' : 'hurt';
      case 'verdict':
        return winner === side ? 'victory' : 'defeat';
      default:
        return 'idle';
    }
  };
  const playerState = sideState('player');
  const rivalState = sideState('rival');

  const cabinet = getPoliticians(state.cabinet);
  const selectedPol = selectedId ? getPolitician(selectedId) : undefined;
  const sigAvailable = selectedId ? !sd.playerUnits[selectedId]?.signatureUsed : false;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.showHeader}>
        <View>
          <Text style={styles.kicker}>SHOWDOWN {sd.matchIndex + 1} / {state.totalMatches}</Text>
          <Text style={styles.showTitle}>{sd.rivalName}</Text>
          <Text style={styles.showTagline}>{sd.rivalTagline}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreBig}>{sd.playerWins}<Text style={styles.scoreMid}> · </Text>{sd.rivalWins}</Text>
          <Text style={styles.scoreLabel}>first to {ROUNDS_TO_WIN}</Text>
        </View>
      </View>

      {round.eventKind ? (
        <View style={styles.eventBanner}>
          <Ionicons name="flash" size={16} color={ink} />
          <Text style={styles.eventBannerText}>{round.eventLabel} in play this round</Text>
        </View>
      ) : null}

      <FaceOff
        playerPol={playerPol}
        rivalPol={rivalPol}
        playerState={playerState}
        rivalState={rivalState}
        issue={round.issue}
      />

      {sd.phase === 'select' ? (
        <>
          <View style={styles.forecast}>
            <Text style={styles.forecastText}>
              Round {round.number} · Issue: <Text style={{ color: red }}>{round.issue}</Text>
              {round.nextIssue ? `   ·   Coming up: ${round.nextIssue}` : ''}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Commit a minister</Text>
          <View style={styles.pickerRow}>
            {cabinet.map((p) => {
              const match = p.issues.includes(round.issue);
              const sel = selectedId === p.id;
              const spent = sd.playerUnits[p.id]?.signatureUsed;
              return (
                <Pressable
                  key={p.id}
                  style={[styles.pickChip, sel && styles.pickChipActive]}
                  onPress={() => {
                    setSelectedId(p.id);
                    setUseSig(false);
                  }}
                >
                  <AnimatedPortrait politician={p} size={56} state="idle" />
                  <Text numberOfLines={1} style={styles.pickName}>{p.name.split(' ').slice(-1)[0]}</Text>
                  <View style={styles.pickTags}>
                    {match ? <Text style={styles.pickMatch}>⚡{round.issue}</Text> : null}
                    {!spent ? <Text style={styles.pickSig}>★</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {selectedPol ? (
            <View style={styles.selectedPanel}>
              <View style={styles.selectedTop}>
                <Text style={styles.selectedName}>{selectedPol.name}</Text>
                <ClassChip cls={battleClass(selectedPol)} small />
              </View>
              <Text style={styles.selectedMeta}>
                Odds {selectedPol.marketOdds} · Promise {selectedPol.promiseScore} · Integrity {selectedPol.integrityScore} · {selectedPol.volatility} volatility
              </Text>
              {selectedPol.issues.includes(round.issue) ? (
                <Text style={styles.selectedMatch}>⚡ Issue match on {round.issue} — +18 base</Text>
              ) : (
                <Text style={styles.selectedNoMatch}>No issue match on {round.issue}.</Text>
              )}
              {sigAvailable ? (
                <Pressable style={[styles.sigToggle, useSig && styles.sigToggleOn]} onPress={() => setUseSig((v) => !v)}>
                  <Ionicons name={useSig ? 'star' : 'star-outline'} size={16} color={useSig ? ink : gold} />
                  <Text style={[styles.sigToggleText, useSig && { color: ink }]}>
                    Signature: "{selectedPol.signatureMove}" (+30)
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.selectedNoMatch}>Signature already used this showdown.</Text>
              )}
              <Pressable
                style={styles.primaryBtn}
                onPress={() => commitRound(selectedPol.id, useSig)}
              >
                <Text style={styles.primaryBtnText}>Commit {selectedPol.name.split(' ').slice(-1)[0]} to the floor →</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.hint}>Tap a minister to see the matchup. ⚡ = issue match, ★ = signature ready.</Text>
          )}
        </>
      ) : null}

      {(sd.phase === 'resolved' || sd.phase === 'done') && stage === 'verdict' && round.breakdown ? (
        <>
          <RoundBreakdownPanel
            breakdown={round.breakdown}
            playerName={playerPol?.name.split(' ').slice(-1)[0] ?? 'You'}
            rivalName={rivalPol?.name.split(' ').slice(-1)[0] ?? 'Rival'}
            winner={round.winner ?? 'player'}
          />
          <CommentaryLog lines={sd.commentary} max={5} />
          <Pressable style={styles.primaryBtn} onPress={nextRound}>
            <Text style={styles.primaryBtnText}>
              {sd.phase === 'done'
                ? sd.outcome === 'win'
                  ? 'Showdown won — collect Political Capital →'
                  : 'Showdown lost — see the damage →'
                : 'Next round →'}
            </Text>
          </Pressable>
        </>
      ) : null}

      {(sd.phase === 'resolved' || sd.phase === 'done') && stage !== 'verdict' ? (
        <Text style={styles.hint}>
          {stage === 'stare' ? 'The floor goes quiet…' : stage === 'clash' ? 'Clash!' : 'The verdict lands…'}
        </Text>
      ) : null}
    </ScrollView>
  );
}

// ── RESULT ───────────────────────────────────────────────────────────────────
function ResultScreen() {
  const { state, continueAfterResult } = useCampaign();
  const win = state.lastOutcome === 'win';
  const gameEnding = state.losses >= MAX_LOSSES;
  const seasonEnding = state.matchIndex >= state.totalMatches - 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.resultBanner, { backgroundColor: win ? green : red }]}>
        <Text style={styles.resultBig}>{win ? 'SHOWDOWN WON' : 'SHOWDOWN LOST'}</Text>
      </View>
      <View style={styles.badgeRow}>
        <CapitalBadge value={state.politicalCapital} />
        <View style={styles.recordBadge}>
          <Text style={styles.recordText}>{state.wins}W · {state.losses}L</Text>
        </View>
      </View>
      <CoalitionMap total={state.totalMatches} matchIndex={state.matchIndex} wins={state.wins} losses={state.losses} />
      <Text style={styles.lead}>
        {gameEnding
          ? `That is loss number ${MAX_LOSSES}. The coalition collapses.`
          : win
            ? seasonEnding
              ? 'The final rival folds. The coalition is complete.'
              : 'Capital banked. Reinforce the cabinet before the next opponent.'
            : `A stumble, but the season continues. ${MAX_LOSSES - state.losses} loss left before game over.`}
      </Text>
      <Pressable style={styles.primaryBtn} onPress={continueAfterResult}>
        <Text style={styles.primaryBtnText}>
          {gameEnding ? 'See season stats →' : seasonEnding ? 'Championship →' : 'To the recruit board →'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// ── RECRUIT ──────────────────────────────────────────────────────────────────
function RecruitScreen() {
  const { state, recruit, skipRecruit } = useCampaign();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader kicker="RECRUIT BOARD" title="Spend Political Capital" />
      <View style={styles.badgeRow}>
        <CapitalBadge value={state.politicalCapital} />
        <Text style={styles.hint}>Recruits join your cabinet (or replace your weakest card).</Text>
      </View>

      {state.recruitOffers.map((offer) => {
        const p = getPolitician(offer.politicianId);
        if (!p) return null;
        const afford = state.politicalCapital >= offer.cost;
        return (
          <View key={offer.politicianId} style={styles.recruitCard}>
            <AnimatedPortrait politician={p} size={72} state="idle" />
            <View style={styles.recruitBody}>
              <Text style={styles.recruitName}>{p.name}</Text>
              <Text style={styles.recruitMeta}>{p.country} · {p.role}</Text>
              <View style={styles.recruitTags}>
                <ClassChip cls={battleClass(p)} small />
                <Text style={styles.recruitStat}>Odds {p.marketOdds}</Text>
                <Text style={styles.recruitStat}>{p.issues.join(', ')}</Text>
              </View>
            </View>
            <Pressable
              disabled={!afford}
              style={[styles.recruitBtn, !afford && styles.btnDisabled]}
              onPress={() => recruit(offer.politicianId, offer.cost)}
            >
              <Text style={styles.recruitBtnText}>{offer.cost} PC</Text>
            </Pressable>
          </View>
        );
      })}

      <Pressable style={styles.ghostBtn} onPress={skipRecruit}>
        <Text style={styles.ghostBtnText}>Skip &amp; keep capital →</Text>
      </Pressable>
    </ScrollView>
  );
}

// ── END (championship / gameover) ────────────────────────────────────────────
function EndScreen({ kind }: { kind: 'championship' | 'gameover' }) {
  const { state, restart } = useCampaign();
  const champion = kind === 'championship';

  // MVP = highest market odds in the cabinet (best card carried you).
  const mvp = useMemo(() => {
    const cab = getPoliticians(state.cabinet);
    return cab.sort((a, b) => b.marketOdds - a.marketOdds)[0];
  }, [state.cabinet]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.resultBanner, { backgroundColor: champion ? gold : ink }]}>
        <Text style={[styles.resultBig, { color: champion ? ink : paper }]}>
          {champion ? '🏆 CHAMPIONS' : 'SEASON OVER'}
        </Text>
      </View>

      {mvp ? (
        <View style={styles.mvpWrap}>
          <Text style={styles.mvpKicker}>SEASON MVP</Text>
          <AnimatedPortrait politician={mvp} size={140} state={champion ? 'victory' : 'idle'} />
          <Text style={styles.mvpName}>{mvp.name}</Text>
          <ClassChip cls={battleClass(mvp)} />
        </View>
      ) : null}

      <View style={styles.statGrid}>
        <StatCell label="Showdowns won" value={`${state.wins}`} />
        <StatCell label="Showdowns lost" value={`${state.losses}`} />
        <StatCell label="Political Capital" value={`${state.politicalCapital}`} />
        <StatCell label="Cabinet size" value={`${state.cabinet.length}`} />
      </View>

      <Text style={styles.lead}>
        {champion
          ? `${state.cabinetName} held every region. The full coalition glows.`
          : `${state.cabinetName} fought to ${state.wins} win${state.wins === 1 ? '' : 's'} before the coalition cracked. Run it back and re-roll the rivals.`}
      </Text>

      <Pressable style={styles.primaryBtn} onPress={restart}>
        <Text style={styles.primaryBtnText}>Run it back →</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3ead7' },
  container: { padding: 16, paddingBottom: 120, gap: 14 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: ink, fontSize: 16, fontWeight: '900' },
  lead: { color: ink, fontSize: 15, lineHeight: 21, fontWeight: '700' },
  sectionTitle: { color: ink, fontSize: 18, fontWeight: '900', marginTop: 4 },
  kicker: { color: red, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },

  cabinetCard: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    padding: 14,
    gap: 8,
  },
  cabinetCardActive: { borderColor: green, borderWidth: 3 },
  cabinetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cabinetName: { color: ink, fontSize: 18, fontWeight: '900' },
  cabinetBlurb: { color: muted, fontSize: 13, fontWeight: '700' },
  portraitRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },

  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: muted,
    backgroundColor: paper,
    padding: 14,
  },
  linkCardText: { color: ink, fontSize: 14, fontWeight: '800', flex: 1 },

  primaryBtn: {
    backgroundColor: gold,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ink,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: ink, fontSize: 16, fontWeight: '900' },
  btnDisabled: { opacity: 0.45 },
  ghostBtn: { alignItems: 'center', paddingVertical: 10 },
  ghostBtnText: { color: muted, fontSize: 14, fontWeight: '900' },

  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  recordBadge: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recordText: { color: ink, fontSize: 13, fontWeight: '900' },

  cabinetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCell: { alignItems: 'center', gap: 5, width: '30%' },
  gridName: { color: ink, fontSize: 11, fontWeight: '900', maxWidth: 90, textAlign: 'center' },

  showHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  showTitle: { color: ink, fontSize: 26, fontWeight: '900', marginTop: 2 },
  showTagline: { color: muted, fontSize: 12, fontWeight: '700', maxWidth: 220 },
  scoreBox: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  scoreBig: { color: ink, fontSize: 26, fontWeight: '900' },
  scoreMid: { color: ink, fontSize: 18 },
  scoreLabel: { color: ink, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },

  eventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: '#00a9a5',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eventBannerText: { color: ink, fontSize: 13, fontWeight: '900' },

  forecast: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    padding: 10,
  },
  forecastText: { color: ink, fontSize: 13, fontWeight: '800' },

  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pickChip: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    paddingVertical: 8,
  },
  pickChipActive: { borderColor: green, borderWidth: 3, backgroundColor: '#f0fff4' },
  pickName: { color: ink, fontSize: 12, fontWeight: '900' },
  pickTags: { flexDirection: 'row', gap: 4, minHeight: 14 },
  pickMatch: { color: red, fontSize: 9, fontWeight: '900' },
  pickSig: { color: gold, fontSize: 11, fontWeight: '900' },

  selectedPanel: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
    gap: 8,
  },
  selectedTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedName: { color: ink, fontSize: 17, fontWeight: '900' },
  selectedMeta: { color: muted, fontSize: 12, fontWeight: '700' },
  selectedMatch: { color: green, fontSize: 13, fontWeight: '900' },
  selectedNoMatch: { color: muted, fontSize: 13, fontWeight: '800' },
  sigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: gold,
    padding: 10,
  },
  sigToggleOn: { backgroundColor: gold },
  sigToggleText: { color: gold, fontSize: 13, fontWeight: '900', flex: 1 },
  hint: { color: muted, fontSize: 13, fontWeight: '700', textAlign: 'center', lineHeight: 18 },

  resultBanner: { borderRadius: 12, borderWidth: 3, borderColor: ink, paddingVertical: 22, alignItems: 'center' },
  resultBig: { color: paper, fontSize: 30, fontWeight: '900', letterSpacing: 1 },

  recruitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
  },
  recruitBody: { flex: 1, gap: 3 },
  recruitName: { color: ink, fontSize: 16, fontWeight: '900' },
  recruitMeta: { color: muted, fontSize: 11, fontWeight: '800' },
  recruitTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 2 },
  recruitStat: { color: ink, fontSize: 11, fontWeight: '800' },
  recruitBtn: {
    backgroundColor: gold,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  recruitBtnText: { color: ink, fontSize: 14, fontWeight: '900' },

  mvpWrap: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  mvpKicker: { color: red, fontSize: 12, fontWeight: '900', letterSpacing: 1.4 },
  mvpName: { color: ink, fontSize: 22, fontWeight: '900' },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: {
    flexGrow: 1,
    minWidth: '45%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: paper,
    padding: 12,
  },
  statValue: { color: ink, fontSize: 24, fontWeight: '900' },
  statLabel: { color: muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
});
