import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  MAX_CABINET,
  MAX_LOSSES,
  ROUNDS_TO_WIN,
  TOTAL_MATCHES,
  buildRecruitOffers,
  buildShowdown,
  capitalReward,
  drawEvent,
  drawIssue,
  getPolitician,
  makeRng,
  resolveRound,
  rivalIdentity,
  rivalPick,
} from '@/lib/campaign';
import { CampaignState, CommentaryLine, ShowdownRound } from '@/types/campaign';

const STORAGE_KEY = 'campaign_state_v1';

function freshCampaign(): CampaignState {
  return {
    phase: 'title',
    seed: Math.floor(Math.random() * 0xffffffff) >>> 0,
    cabinet: [],
    cabinetName: '',
    matchIndex: 0,
    totalMatches: TOTAL_MATCHES,
    wins: 0,
    losses: 0,
    politicalCapital: 60,
    showdown: null,
    lastOutcome: null,
    recruitOffers: [],
  };
}

type CampaignContextValue = {
  state: CampaignState;
  ready: boolean;
  startCampaign: (cabinet: string[], name: string) => void;
  beginShowdown: () => void;
  commitRound: (playerUnitId: string, useSignature: boolean) => void;
  nextRound: () => void;
  continueAfterResult: () => void;
  recruit: (politicianId: string, cost: number) => void;
  skipRecruit: () => void;
  restart: () => void;
};

const CampaignContext = createContext<CampaignContextValue | null>(null);

// Prime multipliers for deriving deterministic per-round RNG seeds.
const A = 40503;
const B = 99991;

export function CampaignProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<CampaignState>(freshCampaign);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  // Load persisted campaign once.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CampaignState;
          // Guard against schema drift — require the core fields.
          if (parsed && typeof parsed.seed === 'number' && Array.isArray(parsed.cabinet)) {
            setState(parsed);
          }
        }
      } catch (e) {
        console.warn('[Campaign] load failed', e);
      } finally {
        hydrated.current = true;
        setReady(true);
      }
    })();
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn('[Campaign] save failed', e)
    );
  }, [state]);

  const startCampaign = useCallback((cabinet: string[], name: string) => {
    setState((s) => ({
      ...freshCampaign(),
      seed: s.seed || (Math.floor(Math.random() * 0xffffffff) >>> 0),
      cabinet: cabinet.slice(0, MAX_CABINET),
      cabinetName: name,
      phase: 'season',
    }));
  }, []);

  const beginShowdown = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 'showdown',
      showdown: buildShowdown(s.seed, s.cabinet, s.matchIndex),
    }));
  }, []);

  const commitRound = useCallback((playerUnitId: string, useSignature: boolean) => {
    setState((s) => {
      const sd = s.showdown;
      if (!sd || sd.phase !== 'select') return s;

      const round = sd.round;
      const identity = rivalIdentity(sd.matchIndex);
      const pickRng = makeRng(s.seed ^ (sd.matchIndex * A) ^ (round.number * B) ^ 21);
      const resolveRng = makeRng(s.seed ^ (sd.matchIndex * A) ^ (round.number * B) ^ 13);

      const rival = rivalPick(sd.rivalCabinet, sd.rivalUnits, round.issue, identity, pickRng);

      const playerPol = getPolitician(playerUnitId);
      const rivalPol = getPolitician(rival.id);
      if (!playerPol || !rivalPol) return s;

      const playerUnit = sd.playerUnits[playerUnitId];
      const rivalUnit = sd.rivalUnits[rival.id];

      const result = resolveRound({
        issue: round.issue,
        eventKind: round.eventKind,
        playerPol,
        rivalPol,
        playerUnit,
        rivalUnit,
        playerSignature: useSignature,
        rivalSignature: rival.useSignature,
        difficulty: sd.difficulty,
        rng: resolveRng,
      });

      // Persist unit mutations (signature spent + momentum steals).
      const playerUnits = { ...sd.playerUnits };
      const rivalUnits = { ...sd.rivalUnits };
      playerUnits[playerUnitId] = {
        ...playerUnit,
        signatureUsed: playerUnit.signatureUsed || (useSignature && result.breakdown.player.signature > 0),
        momentumMod: playerUnit.momentumMod + result.playerMomentumDelta,
      };
      rivalUnits[rival.id] = {
        ...rivalUnit,
        signatureUsed: rivalUnit.signatureUsed || (rival.useSignature && result.breakdown.rival.signature > 0),
        momentumMod: rivalUnit.momentumMod + result.rivalMomentumDelta,
      };

      const playerWins = sd.playerWins + (result.winner === 'player' ? 1 : 0);
      const rivalWins = sd.rivalWins + (result.winner === 'rival' ? 1 : 0);

      const resolvedRound: ShowdownRound = {
        ...round,
        resolved: true,
        playerUnitId,
        rivalUnitId: rival.id,
        playerScore: result.breakdown.player.total,
        rivalScore: result.breakdown.rival.total,
        playerSignature: useSignature && result.breakdown.player.signature > 0,
        rivalSignature: rival.useSignature && result.breakdown.rival.signature > 0,
        playerClass: undefined,
        rivalClass: undefined,
        breakdown: result.breakdown,
        winner: result.winner,
      };

      const done = playerWins >= ROUNDS_TO_WIN || rivalWins >= ROUNDS_TO_WIN;
      const outcome = done ? (playerWins >= ROUNDS_TO_WIN ? 'win' : 'loss') : undefined;
      const capitalEarned = done && outcome === 'win'
        ? capitalReward(sd.matchIndex, playerWins, rivalWins)
        : undefined;

      const commentary: CommentaryLine[] = [...result.commentary, ...sd.commentary].slice(0, 30);

      return {
        ...s,
        showdown: {
          ...sd,
          round: resolvedRound,
          playerWins,
          rivalWins,
          playerUnits,
          rivalUnits,
          commentary,
          phase: done ? 'done' : 'resolved',
          outcome,
          capitalEarned,
        },
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState((s) => {
      const sd = s.showdown;
      if (!sd) return s;

      // Showdown finished — bank the result and go to the result screen.
      if (sd.phase === 'done') {
        const win = sd.outcome === 'win';
        return {
          ...s,
          phase: 'result',
          lastOutcome: sd.outcome ?? 'loss',
          wins: s.wins + (win ? 1 : 0),
          losses: s.losses + (win ? 0 : 1),
          politicalCapital: s.politicalCapital + (sd.capitalEarned ?? 0),
        };
      }

      if (sd.phase !== 'resolved') return s;

      const nextNumber = sd.round.number + 1;
      const identity = rivalIdentity(sd.matchIndex);
      const eventRng = makeRng(s.seed ^ (sd.matchIndex * A) ^ (nextNumber * B) ^ 7);
      const issueRng = makeRng(s.seed ^ (sd.matchIndex * A) ^ (nextNumber * B) ^ 33);
      const event = drawEvent(eventRng, nextNumber, identity);
      // The forecast we showed last round becomes this round's issue.
      const issue = sd.round.nextIssue ?? drawIssue(issueRng, s.cabinet, sd.rivalCabinet);
      const nextIssue = drawIssue(issueRng, s.cabinet, sd.rivalCabinet);

      const intro: CommentaryLine[] = [
        {
          id: `r-${Date.now()}`,
          text: event.kind
            ? `Round ${nextNumber}: ${event.label} rocks the floor. Issue on the table: ${issue}.`
            : `Round ${nextNumber}: issue on the table — ${issue}.`,
          tone: 'neutral',
        },
      ];

      return {
        ...s,
        showdown: {
          ...sd,
          phase: 'select',
          commentary: [...intro, ...sd.commentary].slice(0, 30),
          round: {
            number: nextNumber,
            issue,
            nextIssue,
            eventKind: event.kind,
            eventLabel: event.label,
            resolved: false,
          },
        },
      };
    });
  }, []);

  const continueAfterResult = useCallback(() => {
    setState((s) => {
      // Game over — two losses.
      if (s.losses >= MAX_LOSSES) {
        return { ...s, phase: 'gameover', showdown: null };
      }
      // Completed the final match without busting out — champions.
      if (s.matchIndex >= s.totalMatches - 1) {
        return { ...s, phase: 'championship', showdown: null };
      }
      // Otherwise head to the recruit board before the next opponent.
      return {
        ...s,
        phase: 'recruit',
        showdown: null,
        recruitOffers: buildRecruitOffers(s.seed, s.cabinet, s.matchIndex),
      };
    });
  }, []);

  const advanceMatch = (s: CampaignState): CampaignState => ({
    ...s,
    phase: 'season',
    matchIndex: s.matchIndex + 1,
    recruitOffers: [],
  });

  const recruit = useCallback((politicianId: string, cost: number) => {
    setState((s) => {
      if (s.politicalCapital < cost) return s;
      let cabinet = s.cabinet;
      if (!cabinet.includes(politicianId)) {
        if (cabinet.length < MAX_CABINET) {
          cabinet = [...cabinet, politicianId];
        } else {
          // Replace the weakest current member by market odds.
          const weakest = [...cabinet].sort(
            (a, b) => (getPolitician(a)?.marketOdds ?? 0) - (getPolitician(b)?.marketOdds ?? 0)
          )[0];
          cabinet = cabinet.map((id) => (id === weakest ? politicianId : id));
        }
      }
      return advanceMatch({ ...s, cabinet, politicalCapital: s.politicalCapital - cost });
    });
  }, []);

  const skipRecruit = useCallback(() => {
    setState((s) => advanceMatch(s));
  }, []);

  const restart = useCallback(() => {
    setState(freshCampaign());
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      startCampaign,
      beginShowdown,
      commitRound,
      nextRound,
      continueAfterResult,
      recruit,
      skipRecruit,
      restart,
    }),
    [state, ready, startCampaign, beginShowdown, commitRound, nextRound, continueAfterResult, recruit, skipRecruit, restart]
  );

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

export function useCampaign() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaign must be used inside CampaignProvider');
  return ctx;
}
