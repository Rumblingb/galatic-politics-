import {
  createContext,
  PropsWithChildren,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { politicians, startingFeed } from '@/data/politicians';
import { loadRoster, saveRoster } from '@/lib/supabase';
import {
  MAX_ROSTER_SIZE,
  calculateRosterScore,
  createRosterSlot,
  getPromiseHitRate,
} from '@/lib/game';
import { MemeEvent, Politician, RosterSlot } from '@/types/game';
import { useAuth } from '@/providers/auth-provider';

// Free tier: first 8 politicians. Pro: all 16.
const FREE_POLITICIAN_IDS = politicians.slice(0, 8).map((p) => p.id);

type GameContextValue = {
  roster: RosterSlot[];
  feed: MemeEvent[];
  availablePoliticians: Politician[];
  lockedPoliticians: Politician[];
  currentPolitician: Politician | null;
  rosterFull: boolean;
  totalScore: number;
  isSyncing: boolean;
  draftPolitician: (politicianId: string, captain?: boolean) => void;
  dismissPolitician: (politicianId: string) => void;
  resetGame: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

function buildEvent(politician: Politician, captain: boolean, drafted: boolean): MemeEvent {
  if (!drafted) {
    return {
      id: `${politician.id}-${Date.now()}`,
      politicianId: politician.id,
      tone: 'hype',
      title: `${politician.name} Skipped`,
      detail: `${politician.country} hits the transfer market. Someone else holds the volatility bag.`,
      scoreDelta: 0,
    };
  }
  return {
    id: `${politician.id}-${Date.now()}`,
    politicianId: politician.id,
    tone: captain ? 'buff' : 'hype',
    title: captain ? `${politician.memeTitle} Captain Buff` : `${politician.memeTitle} Drafted`,
    detail: captain
      ? `${politician.name} gets the 1.8× captain multiplier. Maximum clip potential.`
      : `${politician.name} joins your cabinet with ${politician.promiseScore} promise pace.`,
    scoreDelta: createRosterSlot(politician, captain).points,
  };
}

export function GameProvider({ children }: PropsWithChildren) {
  const { user, isPro } = useAuth();

  const [roster, setRoster] = useState<RosterSlot[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [feed, setFeed] = useState<MemeEvent[]>(startingFeed);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load roster from Supabase when user signs in
  useEffect(() => {
    if (!user) {
      setRoster([]);
      setDismissedIds([]);
      setFeed(startingFeed);
      return;
    }

    setIsSyncing(true);
    loadRoster(user.id).then((row) => {
      if (row) {
        const loadedRoster = row.politician_ids
          .map((id, idx) => {
            const pol = politicians.find((p) => p.id === id);
            if (!pol) return null;
            return createRosterSlot(pol, id === row.captain_id);
          })
          .filter(Boolean) as RosterSlot[];

        setRoster(loadedRoster);
        setDismissedIds(row.dismissed_ids ?? []);
      }
      setIsSyncing(false);
    });
  }, [user?.id]);

  // Persist roster to Supabase on every change (debounced to avoid rapid writes)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try {
        await saveRoster(user.id, {
          politician_ids: roster.map((s) => s.politician.id),
          captain_id: roster.find((s) => s.captain)?.politician.id ?? null,
          dismissed_ids: dismissedIds,
          total_score: calculateRosterScore(roster),
          season: 'S1-2026',
        });
      } catch (err) {
        console.error('[Roster] Save failed:', err);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [roster, dismissedIds, user]);

  const rosterIds = useMemo(() => roster.map((s) => s.politician.id), [roster]);

  // Available = not drafted, not dismissed, and visible to this tier
  const visiblePool = useMemo(
    () => (isPro ? politicians : politicians.filter((p) => FREE_POLITICIAN_IDS.includes(p.id))),
    [isPro]
  );

  const lockedPoliticians = useMemo(
    () => (!isPro ? politicians.filter((p) => !FREE_POLITICIAN_IDS.includes(p.id)) : []),
    [isPro]
  );

  const availablePoliticians = useMemo(
    () => visiblePool.filter((p) => !rosterIds.includes(p.id) && !dismissedIds.includes(p.id)),
    [visiblePool, rosterIds, dismissedIds]
  );

  const currentPolitician = availablePoliticians[0] ?? null;
  const totalScore = calculateRosterScore(roster);
  const rosterFull = roster.length >= MAX_ROSTER_SIZE;

  const draftPolitician = (politicianId: string, captain = false) => {
    const politician = politicians.find((p) => p.id === politicianId);
    if (!politician || rosterFull) return;

    startTransition(() => {
      setRoster((current) => {
        const alreadyHasCaptain = current.some((s) => s.captain);
        const shouldCaptain = captain && !alreadyHasCaptain;
        return [...current, createRosterSlot(politician, shouldCaptain)];
      });

      if (captain && roster.some((s) => s.captain)) {
        setFeed((current) => [
          {
            id: `captain-taken-${Date.now()}`,
            politicianId,
            tone: 'crash' as const,
            title: 'Captain Already Set',
            detail: 'Drafted without captain multiplier — you already have one.',
            scoreDelta: 0,
          },
          ...current,
        ].slice(0, 10));
      } else {
        setFeed((current) => [buildEvent(politician, captain, true), ...current].slice(0, 10));
      }
    });
  };

  const dismissPolitician = (politicianId: string) => {
    const politician = politicians.find((p) => p.id === politicianId);
    if (!politician) return;

    startTransition(() => {
      setDismissedIds((current) => [...current, politicianId]);
      setFeed((current) => [buildEvent(politician, false, false), ...current].slice(0, 10));
    });
  };

  const resetGame = useCallback(() => {
    startTransition(() => {
      setRoster([]);
      setDismissedIds([]);
      setFeed(startingFeed);
    });
  }, []);

  const value = useMemo(
    () => ({
      roster,
      feed,
      availablePoliticians,
      lockedPoliticians,
      currentPolitician,
      rosterFull,
      totalScore,
      isSyncing,
      draftPolitician,
      dismissPolitician,
      resetGame,
    }),
    [availablePoliticians, lockedPoliticians, currentPolitician, feed, roster, rosterFull, totalScore, isSyncing]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
