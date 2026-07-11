import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Politician } from '@/types/game';

import { AnimatedPortrait, PortraitState } from './animated-portrait';

/**
 * Two AnimatedPortraits facing each other with a "VS" gap. Both slide in from
 * opposite edges on mount; when both sides are mid-`attack` the rings clash
 * with a shared flash burst in the gap. Round-resolution UI can just re-mount
 * this (or change `leftState`/`rightState`) — it doesn't own any game logic.
 */
export function PortraitFaceOff({
  left,
  right,
  leftState = 'idle',
  rightState = 'idle',
  size = 110,
}: {
  left: Politician;
  right: Politician;
  leftState?: PortraitState;
  rightState?: PortraitState;
  size?: number;
}) {
  const clash = useSharedValue(0);

  useEffect(() => {
    if (leftState === 'attack' && rightState === 'attack') {
      clash.value = 0;
      clash.value = withSequence(
        withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftState, rightState]);

  const clashStyle = useAnimatedStyle(() => ({
    opacity: clash.value,
    transform: [{ scale: 0.6 + clash.value * 0.9 }],
  }));

  return (
    <View style={styles.row}>
      <Animated.View entering={SlideInLeft.springify().damping(14).mass(0.7)}>
        <AnimatedPortrait politician={left} size={size} state={leftState} />
      </Animated.View>

      <View style={styles.vsGap}>
        <Animated.View pointerEvents="none" style={[styles.clashBurst, clashStyle]} />
        <Text style={styles.vsText}>VS</Text>
      </View>

      <Animated.View entering={SlideInRight.springify().damping(14).mass(0.7)}>
        <AnimatedPortrait politician={right} size={size} state={rightState} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsGap: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clashBurst: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff8e1',
  },
  vsText: {
    color: '#f5f5f5',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
});
