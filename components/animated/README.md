# components/animated

Turns the 213 static politician portrait photos into lively animated game
characters. Built entirely on `react-native-reanimated` (already an Expo
dependency in this app) — no new packages installed.

## Exports (`components/animated/index.ts`)

```ts
import {
  AnimatedPortrait,
  AnimatedPortraitRow,
  PortraitFaceOff,
  useSparkBurst,
  SparkBurst,
} from '@/components/animated';
import type { PortraitState } from '@/components/animated';
```

### `AnimatedPortrait`

```ts
function AnimatedPortrait(props: {
  politician: Politician;
  size?: number;                    // px, default 120
  state?: PortraitState;            // default 'idle'
  onStateAnimationEnd?: () => void; // fires when a one-shot state finishes
}): JSX.Element
```

```ts
type PortraitState =
  | 'idle' | 'enter' | 'attack' | 'hurt' | 'victory' | 'defeat'
  | 'taunt' | 'speak'; // optional extras, safe no-ops if never used
```

Callers that only ever pass the original six states see no behavior change —
`taunt` and `speak` are additive.

### `AnimatedPortraitRow`

A row of small `AnimatedPortrait`s that pop in one after another instead of
all at once — pass a roster/squad list and it staggers `enter`.

### `PortraitFaceOff`

Two portraits facing off with a "VS" gap for round-resolution screens —
`{ left, right, leftState?, rightState?, size? }`. Both slide in from opposite
edges on mount; if `leftState` and `rightState` are both `'attack'` at the
same time, the rings clash with a shared flash in the gap.

### `useSparkBurst()` / `SparkBurst`

Internal confetti-dot helper used by `AnimatedPortrait` for `victory`. Exposed
in case a caller wants a standalone spark burst (`burst()` bumps `burstId`,
pass it to `<SparkBurst trigger={burstId} palette={...} radius={...} />`).

## What each state looks like

| State    | Behavior |
|----------|----------|
| `idle`   | Breathing scale loop, slow ring hue shimmer, random micro-tilt every few seconds (cadence/amplitude scaled by `volatility` — High is twitchy with occasional ring-color flicker, Low is a stately slow drift). Continuous, no completion callback. |
| `enter`  | Spring drop-in with overshoot (back-easing scale pop + spring translateY) and a ring flash. Fires `onStateAnimationEnd` when the settle finishes. |
| `taunt`  | Quick chin-up tilt + ring flare, then settles back to rest. One-shot. |
| `speak`  | Subtle 2–3px rhythmic bounce + ring pulse. Loops until `state` changes — no completion callback (it's not meant to "finish"). |
| `attack` | 80ms anticipation pull-back, then a lunge (translateX + scale punch) with a ring flash timed to the strike. Anticipation is what sells it as a hit instead of a glitch. Settles back to rest and fires the callback. |
| `hurt`   | One-frame white "impact flash" overlay, immediately followed by a red flash + shake. Settles back to rest and fires the callback. |
| `victory`| Multi-bounce scale/translateY sequence + a palette-colored confetti spark burst, settling into a raised "held" victory pose. Fires the callback once, then stays elevated until `state` changes. |
| `defeat` | Dark dim overlay fade-in + downward slump with a slight rotate, held (doesn't reset itself). Fires the callback once settled. |

Every non-`idle`/`speak` state that "completes" calls `onStateAnimationEnd`
exactly once, so callers can chain (`enter` → `idle`, `attack` → `idle`,
`victory` held until the caller flips back to `idle`, etc). `idle` and
`speak` are continuous and never call it.

## Extra "alive" details

- **Ken Burns drift**: the portrait image itself slowly scales 1.06→1.12 over
  ~8s with a subtle pan, on top of (and independent from) the frame's
  breathing loop — two motion frequencies read as "alive" much better than
  one.
- **Foil sweep**: a faint diagonal specular highlight (opacity ≤ 0.12) sweeps
  across the portrait every 6–10s (randomized per instance) for a premium
  holo-card feel.
- **Momentum arrow**: a small caret badge (green up / red down) driven by
  `politician.momentum`, idling with a continuous gentle bob.
- **Archetype chip**: a small pill under the frame showing
  `politician.archetype`.

## Design notes / constraints

- **No SVG available** (`react-native-svg` isn't installed and this task
  can't add dependencies), so the "rounded-hexagon" frame is approximated
  with a circular clipped portrait plus a static 45°-rotated rounded-square
  glow layer peeking out behind it, rather than a true hexagon path.
- **Colored glow** uses `shadowColor`/`shadowRadius`/`shadowOpacity`, which
  renders correctly on iOS/web but Android only shows a generic elevation
  shadow (no color) — a known RN platform limitation, not fixable without
  SVG/skia.
- **Hurt desaturation** is approximated with a red flash overlay `View`
  (per the brief) since filtering the underlying image isn't possible without
  a shader library.
- **Random micro-motion** (idle tilt, foil sweep timing) uses a lightweight
  `setTimeout` that reschedules itself, cleaned up on unmount / state change —
  everything else (breathing, shimmer, Ken Burns, momentum bob, all one-shot
  state animations) runs as reanimated worklets on the UI thread, so none of
  it causes JS-thread layout thrash.
- **No network calls**: unlike `components/game-ui.tsx` (which prefers the
  remote `politician.photo` Wikimedia URL), this component intentionally only
  ever renders the local `politician.portraitImage` require, falling back to
  initials drawn from `politician.palette` when it's missing.
