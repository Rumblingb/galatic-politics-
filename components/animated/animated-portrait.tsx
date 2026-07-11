import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { getInitials } from '@/lib/game';
import { Politician } from '@/types/game';

import { SparkBurst, useSparkBurst } from './sparks';

export type PortraitState =
  | 'idle'
  | 'enter'
  | 'attack'
  | 'hurt'
  | 'victory'
  | 'defeat'
  // Optional extras — safe no-ops for callers that never pass them.
  | 'taunt'
  | 'speak';

const DEFAULT_SIZE = 120;

/** Per-volatility idle "personality": tilt cadence, breathing rate/amount, ring flicker. */
const VOLATILITY_MOTION: Record<
  Politician['volatility'],
  { tiltMinMs: number; tiltMaxMs: number; tiltMaxDeg: number; breatheMs: number; breatheAmp: number; flicker: boolean }
> = {
  Low: { tiltMinMs: 4600, tiltMaxMs: 7400, tiltMaxDeg: 1.4, breatheMs: 2800, breatheAmp: 1.022, flicker: false },
  Medium: { tiltMinMs: 2800, tiltMaxMs: 4800, tiltMaxDeg: 2.6, breatheMs: 2100, breatheAmp: 1.03, flicker: false },
  High: { tiltMinMs: 1200, tiltMaxMs: 2400, tiltMaxDeg: 4.4, breatheMs: 1500, breatheAmp: 1.036, flicker: true },
};

const PAN_VECTORS: { x: number; y: number }[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

/** Small deterministic string hash — used to give each politician a stable-but-distinct
 * Ken Burns pan direction / cadence without any extra dependency. */
function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function AnimatedPortrait({
  politician,
  size = DEFAULT_SIZE,
  state = 'idle',
  onStateAnimationEnd,
}: {
  politician: Politician;
  size?: number;
  state?: PortraitState;
  onStateAnimationEnd?: () => void;
}) {
  const palette = politician.palette;
  const initials = getInitials(politician.name);
  // Local require'd asset only — this component makes no network calls, so the
  // remote `politician.photo` URL (used elsewhere in the app) is intentionally not used here.
  const hasLocalPhoto = !!politician.portraitImage;
  const motion = VOLATILITY_MOTION[politician.volatility];
  const idHash = useMemo(() => hashId(politician.id), [politician.id]);
  const panVec = PAN_VECTORS[idHash % PAN_VECTORS.length];

  // ── transform / frame shared values ─────────────────────────────────────
  const scale = useSharedValue(state === 'enter' ? 0.5 : 1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(state === 'enter' ? -size * 0.35 : 0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(state === 'enter' ? 0 : 1);

  // ── ring / overlay shared values ────────────────────────────────────────
  const ringShimmer = useSharedValue(0); // 0..1 loops, idle hue drift
  const ringFlash = useSharedValue(0); // 0..1 spike, enter/attack/taunt/speak-pulse
  const whiteFlash = useSharedValue(0); // hurt impact frame (pre-red)
  const hurtFlash = useSharedValue(0); // red overlay
  const defeatDim = useSharedValue(0); // dark overlay, persists once defeated
  const momentumBob = useSharedValue(0); // continuous small arrow bob

  // ── inner-image Ken Burns drift (independent of frame breathing) ───────
  const kenBurns = useSharedValue(0);

  // ── foil / specular sweep ────────────────────────────────────────────────
  const foilX = useSharedValue(-1.4);

  const { burstId, burst } = useSparkBurst();

  const tiltTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const foilTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endCallback = useRef(onStateAnimationEnd);
  endCallback.current = onStateAnimationEnd;
  const fireEnd = useMemo(() => () => endCallback.current?.(), []);

  // Continuous ambient loops that run for the lifetime of the component,
  // independent of `state` (idle shimmer, momentum bob, Ken Burns, foil sweep).
  useEffect(() => {
    ringShimmer.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    momentumBob.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    kenBurns.value = withRepeat(
      withTiming(1, { duration: 7600 + (idHash % 6) * 350, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    return () => {
      cancelAnimation(ringShimmer);
      cancelAnimation(momentumBob);
      cancelAnimation(kenBurns);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idHash]);

  useEffect(() => {
    function scheduleFoil() {
      const delay = 6000 + Math.random() * 4000;
      foilTimer.current = setTimeout(() => {
        foilX.value = -1.4;
        foilX.value = withTiming(1.4, { duration: 900, easing: Easing.inOut(Easing.quad) });
        scheduleFoil();
      }, delay);
    }
    scheduleFoil();
    return () => {
      if (foilTimer.current) clearTimeout(foilTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Random micro-tilt (idle-only) — a lightweight JS timer, not a layout-thrashing
  // interval; cleaned up on unmount/state change. Cadence + amplitude scale with
  // volatility, and High-volatility politicians also get an occasional ring flicker.
  useEffect(() => {
    function scheduleTilt() {
      const delay = motion.tiltMinMs + Math.random() * (motion.tiltMaxMs - motion.tiltMinMs);
      tiltTimer.current = setTimeout(() => {
        const deg = (Math.random() * 2 - 1) * motion.tiltMaxDeg;
        rotate.value = withSequence(
          withTiming(deg, { duration: 160, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 320, easing: Easing.inOut(Easing.quad) })
        );
        if (motion.flicker && Math.random() < 0.35) {
          ringFlash.value = withSequence(withTiming(0.8, { duration: 40 }), withTiming(0, { duration: 220 }));
        }
        scheduleTilt();
      }, delay);
    }
    if (state === 'idle') scheduleTilt();
    return () => {
      if (tiltTimer.current) clearTimeout(tiltTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, politician.volatility]);

  // State-driven one-shot / looping animations.
  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(rotate);
    cancelAnimation(ringFlash);
    ringFlash.value = withTiming(0, { duration: 200 });

    switch (state) {
      case 'idle': {
        scale.value = withRepeat(
          withSequence(
            withTiming(motion.breatheAmp, { duration: motion.breatheMs, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: motion.breatheMs, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        translateX.value = withTiming(0, { duration: 260 });
        translateY.value = withTiming(0, { duration: 260 });
        rotate.value = withTiming(0, { duration: 260 });
        opacity.value = withTiming(1, { duration: 200 });
        defeatDim.value = withTiming(0, { duration: 300 });
        hurtFlash.value = withTiming(0, { duration: 200 });
        whiteFlash.value = withTiming(0, { duration: 200 });
        break;
      }
      case 'enter': {
        opacity.value = withTiming(1, { duration: 260 });
        scale.value = withSequence(
          withTiming(1.14, { duration: 360, easing: Easing.out(Easing.back(2)) }),
          withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }, (finished) => {
            if (finished) runOnJS(fireEnd)();
          })
        );
        translateY.value = withSpring(0, { damping: 9, stiffness: 140, mass: 0.6 });
        ringFlash.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 380 }));
        break;
      }
      case 'taunt': {
        rotate.value = withSequence(
          withTiming(-9, { duration: 140, easing: Easing.out(Easing.quad) }),
          withTiming(-9, { duration: 260 }),
          withTiming(0, { duration: 220, easing: Easing.inOut(Easing.quad) }, (finished) => {
            if (finished) runOnJS(fireEnd)();
          })
        );
        scale.value = withSequence(withTiming(1.06, { duration: 160 }), withTiming(1, { duration: 300 }));
        ringFlash.value = withSequence(
          withTiming(1, { duration: 120 }),
          withTiming(0.15, { duration: 260 }),
          withTiming(0, { duration: 260 })
        );
        break;
      }
      case 'speak': {
        // Continuous — loops until `state` changes, so no completion callback.
        translateY.value = withRepeat(
          withSequence(
            withTiming(-Math.max(2, size * 0.02), { duration: 260, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 260, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          false
        );
        ringFlash.value = withRepeat(
          withSequence(withTiming(0.55, { duration: 260 }), withTiming(0.1, { duration: 260 })),
          -1,
          false
        );
        scale.value = withTiming(1.01, { duration: 200 });
        break;
      }
      case 'attack': {
        // 80ms anticipation pull-back before the lunge, so it reads as a hit, not a glitch.
        translateX.value = withSequence(
          withTiming(-size * 0.05, { duration: 80, easing: Easing.in(Easing.quad) }),
          withTiming(size * 0.22, { duration: 90, easing: Easing.out(Easing.quad) }),
          withTiming(-size * 0.05, { duration: 90 }),
          withTiming(0, { duration: 160, easing: Easing.inOut(Easing.quad) }, (finished) => {
            if (finished) runOnJS(fireEnd)();
          })
        );
        scale.value = withSequence(
          withTiming(0.96, { duration: 80 }),
          withTiming(1.12, { duration: 90 }),
          withTiming(0.97, { duration: 90 }),
          withTiming(1, { duration: 160 })
        );
        ringFlash.value = withDelay(
          80,
          withSequence(withTiming(0.9, { duration: 90 }), withTiming(0, { duration: 220 }))
        );
        break;
      }
      case 'hurt': {
        // Fighting-game impact frame: one quick white flash, then the red desaturate flash.
        whiteFlash.value = withSequence(withTiming(0.85, { duration: 16 }), withTiming(0, { duration: 90 }));
        hurtFlash.value = withDelay(
          16,
          withSequence(withTiming(0.6, { duration: 50 }), withTiming(0, { duration: 320 }))
        );
        translateX.value = withSequence(
          withTiming(-size * 0.09, { duration: 45 }),
          withTiming(size * 0.09, { duration: 45 }),
          withTiming(-size * 0.06, { duration: 45 }),
          withTiming(size * 0.06, { duration: 45 }),
          withTiming(0, { duration: 60 }, (finished) => {
            if (finished) runOnJS(fireEnd)();
          })
        );
        break;
      }
      case 'victory': {
        runOnJS(burst)();
        scale.value = withSequence(
          withTiming(1.16, { duration: 220, easing: Easing.out(Easing.quad) }),
          withTiming(1.04, { duration: 180 }),
          withTiming(1.14, { duration: 180 }),
          withTiming(1.06, { duration: 220 }, (finished) => {
            if (finished) runOnJS(fireEnd)();
          })
        );
        translateY.value = withSequence(
          withTiming(-size * 0.12, { duration: 220, easing: Easing.out(Easing.quad) }),
          withTiming(-size * 0.02, { duration: 180 }),
          withTiming(-size * 0.09, { duration: 180 }),
          withTiming(-size * 0.04, { duration: 220 })
        );
        rotate.value = withSequence(
          withTiming(-3, { duration: 200 }),
          withTiming(3, { duration: 200 }),
          withTiming(0, { duration: 200 })
        );
        break;
      }
      case 'defeat': {
        scale.value = withTiming(0.94, { duration: 420, easing: Easing.out(Easing.quad) });
        translateY.value = withTiming(size * 0.1, { duration: 420, easing: Easing.out(Easing.quad) });
        rotate.value = withTiming(6, { duration: 420, easing: Easing.out(Easing.quad) });
        defeatDim.value = withTiming(0.6, { duration: 420 }, (finished) => {
          if (finished) runOnJS(fireEnd)();
        });
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── animated styles ──────────────────────────────────────────────────────
  const wrapStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + ringFlash.value * 0.35,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(ringShimmer.value, [0, 1], [palette[0], palette[1]]),
    opacity: 0.55 + ringFlash.value * 0.45,
    transform: [{ scale: 1 + ringFlash.value * 0.06 }],
  }));

  const kenBurnsStyle = useAnimatedStyle(() => {
    const s = 1.06 + kenBurns.value * 0.06;
    const panRange = size * 0.035;
    return {
      transform: [
        { scale: s },
        { translateX: panVec.x * kenBurns.value * panRange },
        { translateY: panVec.y * kenBurns.value * panRange },
      ],
    };
  });

  const foilStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: foilX.value * size }, { rotate: '20deg' }],
  }));

  const whiteFlashStyle = useAnimatedStyle(() => ({ opacity: whiteFlash.value }));
  const hurtFlashStyle = useAnimatedStyle(() => ({ opacity: hurtFlash.value }));
  const defeatDimStyle = useAnimatedStyle(() => ({ opacity: defeatDim.value }));
  const momentumBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -momentumBob.value * Math.max(3, size * 0.03) }],
  }));

  const dims = useMemo(
    () => ({
      frame: size,
      glow: size + 18,
      ring: size + 8,
      facet: size * 0.94,
      facetRadius: size * 0.2,
    }),
    [size]
  );

  const momentumUp = politician.momentum >= 0;

  return (
    <View style={styles.outer}>
      <Animated.View style={[styles.wrap, wrapStyle, { width: dims.frame, height: dims.frame }]}>
        {/* rounded-hexagon facet glow behind the circular frame (no SVG dependency available) */}
        <View
          pointerEvents="none"
          style={[
            styles.facet,
            {
              width: dims.facet,
              height: dims.facet,
              borderRadius: dims.facetRadius,
              backgroundColor: palette[1],
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            glowStyle,
            { width: dims.glow, height: dims.glow, borderRadius: dims.glow / 2, backgroundColor: palette[0] },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.ring, ringStyle, { width: dims.ring, height: dims.ring, borderRadius: dims.ring / 2 }]}
        />

        <View style={[styles.clip, { width: dims.frame, height: dims.frame, borderRadius: dims.frame / 2 }]}>
          {hasLocalPhoto ? (
            <Animated.Image
              source={politician.portraitImage!}
              style={[StyleSheet.absoluteFill, kenBurnsStyle]}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.fallback, { backgroundColor: palette[0] }]}>
              <Text style={styles.fallbackText}>{initials}</Text>
            </View>
          )}

          {/* diagonal specular "foil sweep" — subtle premium holo-card highlight */}
          <Animated.View pointerEvents="none" style={[styles.foilClip, foilStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.foilBar}
            />
          </Animated.View>

          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.whiteOverlay, whiteFlashStyle]} />
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.hurtOverlay, hurtFlashStyle]} />
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.defeatOverlay, defeatDimStyle]} />
        </View>

        {/* Rendered outside the clipped circle (not `styles.clip`) so the burst can travel
            past the frame edge instead of being cut off by `overflow: 'hidden'`. */}
        <SparkBurst trigger={burstId} palette={palette} radius={dims.frame * 0.62} />

        <Animated.View style={[styles.momentumBadge, momentumBadgeStyle]}>
          <Ionicons
            name={momentumUp ? 'caret-up' : 'caret-down'}
            size={Math.max(12, size * 0.14)}
            color={momentumUp ? '#4ade80' : '#f87171'}
          />
        </Animated.View>
      </Animated.View>

      <View style={[styles.archetypeChip, { borderColor: palette[0] }]}>
        <Text numberOfLines={1} style={styles.archetypeText}>
          {politician.archetype}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
  },
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  facet: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    opacity: 0.16,
  },
  glow: {
    position: 'absolute',
    shadowColor: '#000',
    shadowRadius: 14,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
  },
  clip: {
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 22,
  },
  foilClip: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: 0,
    right: 0,
  },
  foilBar: {
    width: '55%',
    height: '260%',
    position: 'absolute',
    left: '-10%',
  },
  whiteOverlay: {
    backgroundColor: '#ffffff',
  },
  hurtOverlay: {
    backgroundColor: '#ef233c',
  },
  defeatOverlay: {
    backgroundColor: '#05060a',
  },
  momentumBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    backgroundColor: 'rgba(10,10,14,0.75)',
    borderRadius: 999,
    padding: 3,
  },
  archetypeChip: {
    marginTop: 6,
    maxWidth: 140,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(10,10,14,0.55)',
  },
  archetypeText: {
    color: '#f5f5f5',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
