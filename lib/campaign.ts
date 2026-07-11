// Showdown battle engine — deterministic stats + a seeded dash of luck.
import { politicians } from '@/data/politicians';
import { Politician } from '@/types/game';
import {
  BattleClass,
  BattleUnit,
  CommentaryLine,
  RecruitOffer,
  RoundBreakdown,
  RoundEventKind,
  ShowdownRound,
  ShowdownState,
  SideBreakdown,
} from '@/types/campaign';

export const TOTAL_MATCHES = 6;
export const ROUNDS_TO_WIN = 3; // best-of-5
export const MAX_CABINET = 5;
export const MAX_LOSSES = 2; // lose 2 showdowns = season over

// ── Seeded RNG (mulberry32) ────────────────────────────────────────────────
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export function randInt(rng: Rng, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick<T>(rng: Rng, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── Data helpers ────────────────────────────────────────────────────────────
export function getPolitician(id: string): Politician | undefined {
  return politicians.find((p) => p.id === id);
}

export function getPoliticians(ids: string[]): Politician[] {
  return ids.map(getPolitician).filter(Boolean) as Politician[];
}

/** Curated starter cabinets — real politician ids only. */
export const STARTER_CABINETS: { id: string; name: string; blurb: string; memberIds: string[] }[] = [
  {
    id: 'chaos',
    name: 'Chaos Cabinet',
    blurb: 'High momentum, high volatility. Boom-or-bust rounds.',
    memberIds: ['us-president', 'argentina-president', 'el-salvador-president', 'russia-president', 'italy-prime-minister'],
  },
  {
    id: 'establishment',
    name: 'Establishment Core',
    blurb: 'Dependable floors and clean integrity. Grinds out wins.',
    memberIds: ['uk-prime-minister', 'canada-prime-minister', 'japan-prime-minister', 'germany-chancellor', 'france-president'],
  },
  {
    id: 'emerging',
    name: 'Emerging Giants',
    blurb: 'Global-South upside with massive audience gravity.',
    memberIds: ['india-prime-minister', 'brazil-president', 'mexico-president', 'south-africa-president', 'vijay-actor'],
  },
  {
    id: 'coalition',
    name: 'Defense Coalition',
    blurb: 'Alliance-minded, strong on Security and Defense issues.',
    memberIds: ['ukraine-president', 'france-president', 'japan-prime-minister', 'canada-prime-minister', 'india-prime-minister'],
  },
];

// ── Battle classes & the counterplay triangle ───────────────────────────────
// Populist > Technocrat > Strongman > Populist (soft ~15% edge).
const BEATS: Record<BattleClass, BattleClass | null> = {
  Populist: 'Technocrat',
  Technocrat: 'Strongman',
  Strongman: 'Populist',
  Balanced: null,
};

export function battleClass(p: Politician): BattleClass {
  if (p.marketOdds >= 64 && p.integrityScore <= 42) return 'Strongman';
  if (p.integrityScore >= 55) return 'Technocrat';
  if (p.momentum >= 15) return 'Populist';
  return 'Balanced';
}

/** +1 = player class has the edge, -1 = rival has it, 0 = neutral. */
export function classAdvantage(playerClass: BattleClass, rivalClass: BattleClass): number {
  if (BEATS[playerClass] === rivalClass) return 1;
  if (BEATS[rivalClass] === playerClass) return -1;
  return 0;
}

export const CLASS_ICON: Record<BattleClass, string> = {
  Populist: '📣',
  Technocrat: '📊',
  Strongman: '🪖',
  Balanced: '⚖️',
};

// ── Rival ladder — themed identities, escalate by BIAS not just stats ────────
export type RivalIdentity = {
  key: string;
  name: string;
  tagline: string;
  difficulty: number;
  /** Higher score = more likely to be drafted by this rival. */
  draftBias: (p: Politician) => number;
  /** Skews between-round event probabilities. */
  eventWeights: { scandal: number; memeStorm: number; marketShock: number };
  sigPropensity: number;
};

export const RIVAL_LADDER: RivalIdentity[] = [
  {
    key: 'backbenchers',
    name: 'The Backbenchers',
    tagline: 'Nervous, under-briefed, learning on the job',
    difficulty: 0.8,
    draftBias: (p) => 100 - p.marketOdds, // weakest cards
    eventWeights: { scandal: 0.15, memeStorm: 0.15, marketShock: 0.15 },
    sigPropensity: 0.1,
  },
  {
    key: 'technocrats',
    name: 'The Technocrats',
    tagline: 'Spreadsheet warriors who punish your scandals',
    difficulty: 0.95,
    draftBias: (p) => p.integrityScore + (p.volatility === 'Low' ? 20 : 0),
    eventWeights: { scandal: 0.4, memeStorm: 0.1, marketShock: 0.2 }, // they weaponize scandals
    sigPropensity: 0.25,
  },
  {
    key: 'populists',
    name: 'The Populists',
    tagline: 'Meme-storm addicts running on pure momentum',
    difficulty: 1.05,
    draftBias: (p) => p.momentum * 3 + p.marketOdds * 0.4,
    eventWeights: { scandal: 0.1, memeStorm: 0.45, marketShock: 0.2 }, // meme storms
    sigPropensity: 0.4,
  },
  {
    key: 'oil-bloc',
    name: 'The Oil Bloc',
    tagline: 'Energy and trade specialists, allergic to reform',
    difficulty: 1.12,
    draftBias: (p) =>
      p.issues.some((i) => ['Energy', 'Trade', 'Tariffs', 'Industry', 'Manufacturing'].includes(i))
        ? 80 + p.marketOdds
        : p.marketOdds * 0.3,
    eventWeights: { scandal: 0.2, memeStorm: 0.15, marketShock: 0.4 }, // market shocks
    sigPropensity: 0.35,
  },
  {
    key: 'strongmen',
    name: 'The Strongmen',
    tagline: 'Market-odds bullies, thin on integrity',
    difficulty: 1.2,
    draftBias: (p) => p.marketOdds * 2 - p.integrityScore,
    eventWeights: { scandal: 0.3, memeStorm: 0.2, marketShock: 0.2 },
    sigPropensity: 0.45,
  },
  {
    key: 'world-summit',
    name: 'The World Summit',
    tagline: 'An all-star super-cabinet. The final boss.',
    difficulty: 1.32,
    draftBias: (p) => p.marketOdds + p.promiseScore + p.momentum * 2, // top overall
    eventWeights: { scandal: 0.25, memeStorm: 0.25, marketShock: 0.25 },
    sigPropensity: 0.55,
  },
];

export function rivalIdentity(matchIndex: number): RivalIdentity {
  return RIVAL_LADDER[Math.min(matchIndex, RIVAL_LADDER.length - 1)];
}

export function difficultyForMatch(matchIndex: number) {
  return rivalIdentity(matchIndex).difficulty;
}

/** Build a rival cabinet from its themed drafting bias, seeded. */
export function buildRival(seed: number, matchIndex: number) {
  const rng = makeRng(seed ^ (matchIndex * 7919));
  const identity = rivalIdentity(matchIndex);
  const ranked = [...politicians].sort(
    (a, b) => identity.draftBias(b) - identity.draftBias(a) + (rng() - 0.5) * 25
  );
  return {
    cabinet: ranked.slice(0, MAX_CABINET).map((p) => p.id),
    identity,
  };
}

// ── Commentary — satirical broadcast duo (DRY analyst + UNHINGED hype) ───────
const LINES = {
  playerWin: [
    'Clinical. Your cabinet closes the file on that one.',
    'THEY LOVE IT, THEY ABSOLUTELY LOVE IT — round is yours!',
    'The room reads the polling and nods. Point to you.',
    'Somewhere a focus group just stood up and applauded.',
  ],
  rivalWin: [
    'And the challenger banks it. Textbook.',
    'OH IT IS UGLY — the rival bench is losing their minds!',
    'You got out-briefed there. Simple as.',
    'That is a mugging in broad daylight, ladies and gentlemen.',
  ],
  scandal: [
    'A dossier hits the wire at the worst possible moment.',
    'THE PHONES ARE RINGING, THE PHONES ARE RINGING — scandal!',
    'Integrity was always going to be the pressure point.',
    'Somebody left a paper trail and the room smelled it.',
  ],
  memeStorm: [
    'The clip is doing numbers. Momentum is a currency now.',
    'IT IS TRENDING, IT IS TRENDING, nobody is safe!',
    'A single reaction shot just moved the whole board.',
    'The algorithm has entered the chamber. Chaos ensues.',
  ],
  marketShock: [
    'Prediction odds gap on the open. The floor tilts.',
    'THE MARKET JUST DID A BACKFLIP — hold onto something!',
    'Liquidity moves, and so does the momentum.',
    'Someone big took a position. You can feel the swing.',
  ],
  signature: [
    'The signature play — you knew it was coming, could not stop it.',
    'THAT IS THE MOVE, THAT IS THE WHOLE BRAND, unbelievable!',
    'Rehearsed a thousand times and it still lands clean.',
  ],
  advantage: [
    'The matchup tilts before a word is spoken.',
    'Rock, paper, cabinet — and one of them brought scissors.',
  ],
};

let cid = 0;
function line(text: string, tone: CommentaryLine['tone']): CommentaryLine {
  cid += 1;
  return { id: `c-${Date.now()}-${cid}`, text, tone };
}
function poolLine(rng: Rng, key: keyof typeof LINES, tone: CommentaryLine['tone']): CommentaryLine {
  return line(pick(rng, LINES[key]), tone);
}

// ── Battle math ─────────────────────────────────────────────────────────────
const ISSUE_MATCH_BONUS = 18;
const SIGNATURE_PUNCH = 30;
const CLASS_EDGE = 0.15;

function volatilityRange(v: Politician['volatility']) {
  return v === 'High' ? 16 : v === 'Medium' ? 9 : 4;
}

function baseFor(p: Politician, unit: BattleUnit) {
  return p.marketOdds * 0.5 + p.promiseScore * 0.5 + (p.momentum + unit.momentumMod) * 0.6;
}

/** Deterministic base power of a politician for a given issue (before luck). */
export function unitBasePower(p: Politician, issue: string, unit: BattleUnit) {
  return baseFor(p, unit) + (p.issues.includes(issue) ? ISSUE_MATCH_BONUS : 0);
}

export type ResolveInput = {
  issue: string;
  eventKind: RoundEventKind;
  playerPol: Politician;
  rivalPol: Politician;
  playerUnit: BattleUnit;
  rivalUnit: BattleUnit;
  playerSignature: boolean;
  rivalSignature: boolean;
  difficulty: number;
  rng: Rng;
};

export type ResolveResult = {
  winner: 'player' | 'rival';
  breakdown: RoundBreakdown;
  commentary: CommentaryLine[];
  playerMomentumDelta: number;
  rivalMomentumDelta: number;
};

/** Resolve a single round. Pure given its rng. */
export function resolveRound(input: ResolveInput): ResolveResult {
  const {
    issue, eventKind, playerPol, rivalPol, playerUnit, rivalUnit,
    playerSignature, rivalSignature, difficulty, rng,
  } = input;

  const commentary: CommentaryLine[] = [];
  let playerMomentumDelta = 0;
  let rivalMomentumDelta = 0;

  const p: SideBreakdown = { base: 0, issueBonus: 0, classBonus: 0, eventSwing: 0, signature: 0, volatilitySwing: 0, total: 0 };
  const r: SideBreakdown = { base: 0, issueBonus: 0, classBonus: 0, eventSwing: 0, signature: 0, volatilitySwing: 0, total: 0 };

  p.base = Math.round(baseFor(playerPol, playerUnit));
  r.base = Math.round(baseFor(rivalPol, rivalUnit) * difficulty);

  p.issueBonus = playerPol.issues.includes(issue) ? ISSUE_MATCH_BONUS : 0;
  r.issueBonus = rivalPol.issues.includes(issue) ? Math.round(ISSUE_MATCH_BONUS * difficulty) : 0;

  // Counterplay triangle — soft ~15% edge to the favored class.
  const pClass = battleClass(playerPol);
  const rClass = battleClass(rivalPol);
  const adv = classAdvantage(pClass, rClass);
  if (adv > 0) {
    p.classBonus = Math.round(p.base * CLASS_EDGE);
    commentary.push(poolLine(rng, 'advantage', 'player'));
  } else if (adv < 0) {
    r.classBonus = Math.round(r.base * CLASS_EDGE);
    commentary.push(poolLine(rng, 'advantage', 'rival'));
  }

  // Between-round event modifiers.
  if (eventKind === 'scandal') {
    const target = playerPol.integrityScore <= rivalPol.integrityScore ? 'player' : 'rival';
    const targetPol = target === 'player' ? playerPol : rivalPol;
    const failed = rng() * 100 > targetPol.integrityScore; // low integrity => likely fail
    if (failed) {
      if (target === 'player') p.eventSwing = -14;
      else r.eventSwing = -14;
      commentary.push(line(`SCANDAL breaks on ${targetPol.name} — integrity ${targetPol.integrityScore} fails the check (-14).`, 'event'));
      commentary.push(poolLine(rng, 'scandal', 'event'));
    } else {
      commentary.push(line(`${targetPol.name} weathers the scandal rumor — integrity holds.`, 'event'));
    }
  } else if (eventKind === 'market-shock') {
    const swing = randInt(rng, 8, 18);
    if (rng() > 0.5) { p.eventSwing += swing; } else { r.eventSwing += swing; }
    commentary.push(poolLine(rng, 'marketShock', 'event'));
  }

  // Signature moves (once per showdown per politician).
  if (playerSignature && !playerUnit.signatureUsed) {
    p.signature = SIGNATURE_PUNCH;
    commentary.push(line(`SIGNATURE — ${playerPol.name}: "${playerPol.signatureMove}" (+${SIGNATURE_PUNCH})`, 'signature'));
    commentary.push(poolLine(rng, 'signature', 'signature'));
  }
  if (rivalSignature && !rivalUnit.signatureUsed) {
    r.signature = SIGNATURE_PUNCH;
    commentary.push(line(`${rivalPol.name} unloads their signature move (+${SIGNATURE_PUNCH}).`, 'rival'));
  }

  // Volatility variance — the seeded dash of luck.
  p.volatilitySwing = Math.round((rng() * 2 - 1) * volatilityRange(playerPol.volatility));
  r.volatilitySwing = Math.round((rng() * 2 - 1) * volatilityRange(rivalPol.volatility));

  p.total = Math.max(0, p.base + p.issueBonus + p.classBonus + p.eventSwing + p.signature + p.volatilitySwing);
  r.total = Math.max(0, r.base + r.issueBonus + r.classBonus + r.eventSwing + r.signature + r.volatilitySwing);

  const winner: 'player' | 'rival' = p.total >= r.total ? 'player' : 'rival';

  // Meme Storm: winner steals momentum from the loser (persists across rounds).
  if (eventKind === 'meme-storm') {
    const stealer = winner === 'player' ? playerPol : rivalPol;
    if (winner === 'player') { playerMomentumDelta += 6; rivalMomentumDelta -= 4; }
    else { rivalMomentumDelta += 6; playerMomentumDelta -= 4; }
    commentary.push(line(`MEME STORM — "${stealer.memeTitle}" goes viral. ${stealer.name} steals momentum.`, 'event'));
    commentary.push(poolLine(rng, 'memeStorm', 'event'));
  }

  commentary.push(poolLine(rng, winner === 'player' ? 'playerWin' : 'rivalWin', winner === 'player' ? 'player' : 'rival'));

  return {
    winner,
    breakdown: { player: p, rival: r, margin: p.total - r.total },
    commentary,
    playerMomentumDelta,
    rivalMomentumDelta,
  };
}

/** Rival AI: pick its strongest available unit for the issue. */
export function rivalPick(
  cabinet: string[],
  units: Record<string, BattleUnit>,
  issue: string,
  identity: RivalIdentity,
  rng: Rng
): { id: string; useSignature: boolean } {
  let bestId = cabinet[0];
  let bestPower = -Infinity;
  for (const id of cabinet) {
    const pol = getPolitician(id);
    if (!pol) continue;
    const power = unitBasePower(pol, issue, units[id]);
    if (power > bestPower) { bestPower = power; bestId = id; }
  }
  const best = getPolitician(bestId)!;
  const wantsSig = !units[bestId].signatureUsed && best.issues.includes(issue) && rng() < identity.sigPropensity;
  return { id: bestId, useSignature: wantsSig };
}

/** Draw a between-round event, seeded and skewed by the rival's identity. */
export function drawEvent(rng: Rng, roundNumber: number, identity: RivalIdentity): { kind: RoundEventKind; label: string } {
  if (roundNumber <= 1) return { kind: null, label: '' };
  const w = identity.eventWeights;
  const roll = rng();
  if (roll < w.scandal) return { kind: 'scandal', label: 'Scandal' };
  if (roll < w.scandal + w.memeStorm) return { kind: 'meme-storm', label: 'Meme Storm' };
  if (roll < w.scandal + w.memeStorm + w.marketShock) return { kind: 'market-shock', label: 'Market Shock' };
  return { kind: null, label: 'Quiet news cycle' };
}

/** Pick an issue for a round from both cabinets' issue pools. */
export function drawIssue(rng: Rng, playerCabinet: string[], rivalCabinet: string[]): string {
  const pool = new Set<string>();
  for (const id of [...playerCabinet, ...rivalCabinet]) {
    getPolitician(id)?.issues.forEach((i) => pool.add(i));
  }
  const arr = Array.from(pool);
  return arr.length ? pick(rng, arr) : 'Trade';
}

export function initUnits(cabinet: string[]): Record<string, BattleUnit> {
  const units: Record<string, BattleUnit> = {};
  for (const id of cabinet) units[id] = { politicianId: id, signatureUsed: false, momentumMod: 0 };
  return units;
}

/** Capital reward for winning a showdown. */
export function capitalReward(matchIndex: number, playerWins: number, rivalWins: number) {
  const base = 40;
  const marginBonus = Math.max(0, (playerWins - rivalWins) * 8);
  const difficultyBonus = Math.round(matchIndex * 10);
  return base + marginBonus + difficultyBonus;
}

/** Generate 3 recruit offers from politicians not already in the cabinet. */
export function buildRecruitOffers(seed: number, cabinet: string[], matchIndex: number): RecruitOffer[] {
  const rng = makeRng(seed ^ (matchIndex * 104729) ^ 0x9e3779b9);
  const available = politicians.filter((p) => !cabinet.includes(p.id));
  const shuffled = [...available].sort(() => rng() - 0.5).slice(0, 3);
  return shuffled.map((p) => ({ politicianId: p.id, cost: 30 + Math.round(p.marketOdds * 0.6) }));
}

export function buildShowdown(seed: number, cabinet: string[], matchIndex: number): ShowdownState {
  const { cabinet: rivalCabinet, identity } = buildRival(seed, matchIndex);
  const issueRng = makeRng(seed ^ (matchIndex * 2654435761) ^ 1);
  const issue = drawIssue(issueRng, cabinet, rivalCabinet);
  const nextIssue = drawIssue(issueRng, cabinet, rivalCabinet);
  const round: ShowdownRound = { number: 1, issue, nextIssue, eventKind: null, resolved: false };
  return {
    matchIndex,
    rivalKey: identity.key,
    rivalName: identity.name,
    rivalTagline: identity.tagline,
    rivalCabinet,
    difficulty: identity.difficulty,
    playerWins: 0,
    rivalWins: 0,
    round,
    commentary: [
      line(`Showdown ${matchIndex + 1} of ${TOTAL_MATCHES}: your cabinet vs ${identity.name}.`, 'neutral'),
      line(`${identity.tagline}. Opening issue: ${issue}. Best of ${ROUNDS_TO_WIN * 2 - 1}.`, 'neutral'),
    ],
    playerUnits: initUnits(cabinet),
    rivalUnits: initUnits(rivalCabinet),
    phase: 'select',
  };
}
