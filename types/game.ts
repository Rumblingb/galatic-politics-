export type SwipeDirection = 'left' | 'right' | 'up';

export type Politician = {
  id: string;
  name: string;
  country: string;
  role: string;
  archetype: string;
  issues: string[];
  portraitEmoji: string;
  /** Local require() image asset — legacy, lower priority than `photo` */
  portraitImage?: number | null;
  /** Remote Wikimedia photo URL — takes priority over portraitImage */
  photo?: string | null;
  marketOdds: number;
  promiseScore: number;
  integrityScore: number;
  momentum: number;
  volatility: 'Low' | 'Medium' | 'High';
  scoutingReport: string;
  signatureMove: string;
  palette: [string, string];
  memeTitle: string;
};

export type PromiseReceipt = {
  id: string;
  politicianId: string;
  type: 'promise-kept' | 'promise-broken' | 'lie' | 'flip-flop' | 'market-surge';
  title: string;
  source: string;
  status: 'Verified' | 'Pending' | 'Community review';
  points: number;
};

export type MarketSignal = {
  id: string;
  politicianId: string;
  question: string;
  probability: number;
  change: number;
  linkLabel: string;
};

export type WildCardEvent = {
  id: string;
  politicianId: string;
  title: string;
  trigger: string;
  effect: string;
  points: number;
  tone: 'buff' | 'crash' | 'versus';
};

export type RosterSlot = {
  politician: Politician;
  captain: boolean;
  points: number;
};

export type MemeEvent = {
  id: string;
  politicianId: string;
  tone: 'buff' | 'crash' | 'hype';
  title: string;
  detail: string;
  scoreDelta: number;
};

export type LeagueEntry = {
  id: string;
  name: string;
  score: number;
  vibe: string;
  policyFocus?: string;
  truthScore?: number;
};

export type Team = {
  id: string;
  name: string;
  country: string;
  memberIds: string[];
  theme: string;
  description: string;
};

export type PolymarketCard = {
  id: string;
  question: string;
  yesOdds: number;
  noOdds: number;
  volume24h: number;
};

export type AuraFarmingMoment = {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  auraPoints?: number;
  points?: number;
};

export type CardSubmission = {
  id: string;
  politicianName: string;
  country: string;
  uploader: string;
  proposedSkin: string;
  safeForAds: boolean;
  moderationStatus: 'Approved' | 'Rejected' | 'Scanning';
  botNotes: string;
};

export type CardArt = {
  id: string;
  politicianId: string;
  pack: string;
  title: string;
  artDirection: string;
  status: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
};
