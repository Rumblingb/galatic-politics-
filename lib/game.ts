import { promiseReceipts, rivalLeagues } from '@/data/politicians';
import { LeagueEntry, Politician, PromiseReceipt, RosterSlot } from '@/types/game';

export const MAX_ROSTER_SIZE = 5;
export type CardRarity = 'Bronze' | 'Silver' | 'Gold' | 'Icon' | 'Mythic';

export function calculateBasePoints(politician: Politician) {
  const truthTax = Math.max(0, 60 - politician.integrityScore);
  const receiptPoints = getReceiptsForPolitician(politician.id).reduce(
    (total, receipt) => total + receipt.points,
    0
  );
  return Math.round(
    politician.promiseScore * 1.6 +
      politician.marketOdds * 0.7 +
      politician.momentum * 1.4 -
      truthTax * 0.85 +
      (politician.volatility === 'High' ? 9 : politician.volatility === 'Medium' ? 4 : 0) +
      receiptPoints
  );
}

export function getOverallRating(politician: Politician) {
  const volatilityBonus =
    politician.volatility === 'High' ? 5 : politician.volatility === 'Medium' ? 3 : 1;

  return Math.min(
    99,
    Math.max(
      50,
      Math.round(
        politician.promiseScore * 0.34 +
          politician.marketOdds * 0.26 +
          politician.integrityScore * 0.18 +
          politician.momentum * 0.82 +
          volatilityBonus
      )
    )
  );
}

export function getCardRarity(politician: Politician): CardRarity {
  const rating = getOverallRating(politician);
  if (rating >= 88) {
    return 'Mythic';
  }
  if (rating >= 80) {
    return 'Icon';
  }
  if (rating >= 70) {
    return 'Gold';
  }
  if (rating >= 62) {
    return 'Silver';
  }
  return 'Bronze';
}

export function getRarityColor(rarity: CardRarity) {
  switch (rarity) {
    case 'Mythic':
      return '#f7c948';
    case 'Icon':
      return '#f77f00';
    case 'Gold':
      return '#d4af37';
    case 'Silver':
      return '#c5cbd3';
    case 'Bronze':
      return '#b07d4f';
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function getCardPosition(politician: Politician) {
  if (politician.role.includes('President') || politician.role.includes('State')) {
    return 'CAP';
  }
  if (politician.role.includes('Prime') || politician.role.includes('Chancellor')) {
    return 'PM';
  }
  return 'POL';
}

export function getReceiptsForPolitician(politicianId: string) {
  return promiseReceipts.filter((receipt) => receipt.politicianId === politicianId);
}

export function getReceiptSummary(politicianId: string) {
  const receipts = getReceiptsForPolitician(politicianId);
  const positive = receipts.filter((receipt) => receipt.points > 0).length;
  const negative = receipts.filter((receipt) => receipt.points < 0).length;
  const net = receipts.reduce((total, receipt) => total + receipt.points, 0);

  return { positive, negative, net, receipts };
}

export function getReceiptTone(receipt: PromiseReceipt) {
  if (receipt.points > 0) {
    return '#2dc653';
  }
  if (receipt.type === 'lie') {
    return '#ef233c';
  }
  return '#f77f00';
}

export function getAccountabilityDamage(politician: Politician) {
  const { negative } = getReceiptSummary(politician.id);
  return Math.min(100, Math.max(0, 100 - politician.integrityScore + negative * 9));
}

export function createRosterSlot(politician: Politician, captain = false): RosterSlot {
  const basePoints = calculateBasePoints(politician);

  return {
    politician,
    captain,
    points: captain ? Math.round(basePoints * 1.8) : basePoints,
  };
}

export function calculateRosterScore(roster: RosterSlot[]) {
  return roster.reduce((total, slot) => total + slot.points, 0);
}

export function getTruthPressure(roster: RosterSlot[]) {
  if (!roster.length) {
    return 0;
  }

  const totalPressure = roster.reduce(
    (total, slot) => total + Math.max(0, 100 - slot.politician.integrityScore),
    0
  );

  return Math.round(totalPressure / roster.length);
}

export function getPromiseHitRate(roster: RosterSlot[]) {
  if (!roster.length) {
    return 0;
  }

  const total = roster.reduce((sum, slot) => sum + slot.politician.promiseScore, 0);
  return Math.round(total / roster.length);
}

export function buildStandings(userScore: number): LeagueEntry[] {
  const all = [
    ...rivalLeagues,
    {
      id: 'you',
      name: 'Your Cabinet',
      score: userScore,
      vibe: 'Swipe-built and chronically online',
    },
  ];

  return all.sort((left, right) => right.score - left.score);
}

export function createShareMessage(roster: RosterSlot[], totalScore: number) {
  if (!roster.length) {
    return 'Power Cabinet is live. Draft a five-card political squad, chase promise points, and survive the truth tax.';
  }

  const captain = roster.find((slot) => slot.captain) ?? roster[0];
  const countries = roster.map((slot) => slot.politician.country).join(', ');

  return `My Power Cabinet squad just posted ${totalScore} points. Captain ${captain.politician.name} is carrying cards from ${countries}. Draft yours: powercabinet://draft`;
}
