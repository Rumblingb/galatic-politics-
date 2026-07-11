// Campaign / Showdown game types — the end-to-end game loop layer.

export type CampaignPhase =
  | 'title'
  | 'season'
  | 'showdown'
  | 'result'
  | 'recruit'
  | 'championship'
  | 'gameover';

export type ShowdownOutcome = 'win' | 'loss';

export type CommentaryTone = 'neutral' | 'player' | 'rival' | 'event' | 'signature';

export type CommentaryLine = {
  id: string;
  text: string;
  tone: CommentaryTone;
};

/** A politician while inside one showdown — tracks per-battle mutable state. */
export type BattleUnit = {
  politicianId: string;
  signatureUsed: boolean;
  /** Momentum stolen/lost across rounds via Meme Storm events. */
  momentumMod: number;
};

export type RoundEventKind = 'scandal' | 'meme-storm' | 'market-shock' | null;

export type BattleClass = 'Populist' | 'Technocrat' | 'Strongman' | 'Balanced';

/** Per-side additive breakdown for the "why did I win/lose" panel. */
export type SideBreakdown = {
  base: number;
  issueBonus: number;
  classBonus: number;
  eventSwing: number;
  signature: number;
  volatilitySwing: number;
  total: number;
};

export type RoundBreakdown = {
  player: SideBreakdown;
  rival: SideBreakdown;
  margin: number; // player.total - rival.total
};

export type ShowdownRound = {
  number: number; // 1-based
  issue: string;
  /** Forecast of the issue coming up next round (strategic planning). */
  nextIssue?: string;
  /** Event that fires going INTO this round (null on round 1). */
  eventKind: RoundEventKind;
  eventLabel?: string;
  playerUnitId?: string;
  rivalUnitId?: string;
  playerScore?: number;
  rivalScore?: number;
  playerSignature?: boolean;
  rivalSignature?: boolean;
  playerClass?: BattleClass;
  rivalClass?: BattleClass;
  breakdown?: RoundBreakdown;
  winner?: 'player' | 'rival';
  resolved: boolean;
};

export type ShowdownState = {
  matchIndex: number;
  rivalKey: string;
  rivalName: string;
  rivalTagline: string;
  rivalCabinet: string[]; // politician ids
  difficulty: number; // rival stat multiplier
  playerWins: number;
  rivalWins: number;
  round: ShowdownRound;
  commentary: CommentaryLine[];
  playerUnits: Record<string, BattleUnit>;
  rivalUnits: Record<string, BattleUnit>;
  /** 'select' = waiting for player commit, 'resolved' = round decided, 'done' = showdown over. */
  phase: 'select' | 'resolved' | 'done';
  outcome?: ShowdownOutcome;
  capitalEarned?: number;
};

export type RecruitOffer = {
  politicianId: string;
  cost: number;
};

export type CampaignState = {
  phase: CampaignPhase;
  seed: number;
  cabinet: string[]; // player politician ids
  cabinetName: string;
  matchIndex: number; // 0-based index of the CURRENT / next match
  totalMatches: number;
  wins: number;
  losses: number;
  politicalCapital: number;
  showdown: ShowdownState | null;
  lastOutcome: ShowdownOutcome | null;
  recruitOffers: RecruitOffer[];
};
