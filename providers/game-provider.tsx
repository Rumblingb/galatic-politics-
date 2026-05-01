import {
  createContext,
  PropsWithChildren,
  startTransition,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { politicians, startingFeed, teams } from '@/data/politicians';
import { MAX_ROSTER_SIZE, calculateRosterScore, createRosterSlot } from '@/lib/game';
import { MemeEvent, Politician, RosterSlot, Team } from '@/types/game';

type GameContextValue = {
  isLoggedIn: boolean;
  roster: RosterSlot[];
  feed: MemeEvent[];
  availablePoliticians: Politician[];
  currentPolitician: Politician | null;
  rosterFull: boolean;
  region: string;
  teams: Team[];
  setRegion: (region: string) => void;
  login: () => void;
  draftPolitician: (politicianId: string, captain?: boolean) => void;
  dismissPolitician: (politicianId: string) => void;
  resetGame: () => void;
  totalScore: number;
};

const GameContext = createContext<GameContextValue | null>(null);

function buildEvent(politician: Politician, captain: boolean, drafted: boolean): MemeEvent {
  if (!drafted) {
    return {
      id: `${politician.id}-${Date.now()}`,
      politicianId: politician.id,
      tone: 'hype',
      title: `${politician.name} Skipped`,
      detail: `${politician.country} just hit the transfer market. Somebody else can hold the volatility bag.`,
      scoreDelta: 0,
    };
  }

  return {
    id: `${politician.id}-${Date.now()}`,
    politicianId: politician.id,
    tone: captain ? 'buff' : 'hype',
    title: captain ? `${politician.memeTitle} Captain Buff` : `${politician.memeTitle} Drafted`,
    detail: captain
      ? `${politician.name} gets the 1.8x captain multiplier. Maximum clip potential unlocked.`
      : `${politician.name} joins your global cabinet with ${politician.promiseScore} promise pace and ${politician.marketOdds}% market heat.`,
    scoreDelta: createRosterSlot(politician, captain).points,
  };
}

export function GameProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(process.env.NODE_ENV !== 'production' ? true : false);
  const [roster, setRoster] = useState<RosterSlot[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [feed, setFeed] = useState<MemeEvent[]>(startingFeed);
  const [region, setRegion] = useState<string>('global');

  const rosterIds = useMemo(() => roster.map((slot) => slot.politician.id), [roster]);
  const availablePoliticians = useMemo(
    () =>
      politicians.filter(
        (politician) => !rosterIds.includes(politician.id) && !dismissedIds.includes(politician.id)
      ),
    [dismissedIds, rosterIds]
  );

  const currentPolitician = availablePoliticians[0] ?? null;
  const totalScore = calculateRosterScore(roster);
  const rosterFull = roster.length >= MAX_ROSTER_SIZE;

  const draftPolitician = useCallback((politicianId: string, captain = false) => {
    const politician = politicians.find((entry) => entry.id === politicianId);
    if (!politician) {
      return;
    }

    startTransition(() => {
      setRoster((current) => {
        if (current.length >= MAX_ROSTER_SIZE) {
          return current;
        }
        const alreadyHasCaptain = current.some((slot) => slot.captain);
        const shouldCaptain = captain && !alreadyHasCaptain;
        return [...current, createRosterSlot(politician, shouldCaptain)];
      });
      setFeed((current) => [buildEvent(politician, captain, true), ...current].slice(0, 8));
    });
  }, []);

  const dismissPolitician = useCallback((politicianId: string) => {
    const politician = politicians.find((entry) => entry.id === politicianId);
    if (!politician) {
      return;
    }

    startTransition(() => {
      setDismissedIds((current) => [...current, politicianId]);
      setFeed((current) => [buildEvent(politician, false, false), ...current].slice(0, 8));
    });
  }, []);

  const resetGame = useCallback(() => {
    startTransition(() => {
      setRoster([]);
      setDismissedIds([]);
      setFeed(startingFeed);
    });
  }, []);

  const login = useCallback(() => {
    startTransition(() => {
      setIsLoggedIn(true);
    });
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      roster,
      feed,
      availablePoliticians,
      currentPolitician,
      rosterFull,
      region,
      teams,
      setRegion,
      login,
      draftPolitician,
      dismissPolitician,
      resetGame,
      totalScore,
    }),
    [availablePoliticians, currentPolitician, dismissPolitician, draftPolitician, feed, isLoggedIn, login, resetGame, roster, rosterFull, totalScore, region]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame must be used inside GameProvider');
  }

  return context;
}
