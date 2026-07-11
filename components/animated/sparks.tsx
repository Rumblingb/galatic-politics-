import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const SPARK_COUNT = 8;

/**
 * Bump `burst()` any time you want a fresh confetti-spark pop (used for the
 * `victory` state). Returns a `burstId` that changes identity on every call —
 * pass it straight into `SparkBurst`'s `trigger` prop.
 */
export function useSparkBurst() {
  const [burstId, setBurstId] = useState(0);
  const burst = useCallback(() => setBurstId((id) => id + 1), []);
  return { burstId, burst };
}

function SparkDot({
  index,
  trigger,
  color,
  radius,
}: {
  index: number;
  trigger: number;
  color: string;
  radius: number;
}) {
  const progress = useSharedValue(0);
  const angle = (index / SPARK_COUNT) * Math.PI * 2 + (index % 2 === 0 ? 0.18 : -0.18);
  const distance = radius * (0.85 + (index % 3) * 0.12);
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  useEffect(() => {
    if (trigger === 0) return;
    progress.value = 0;
    progress.value = withDelay(
      (index % SPARK_COUNT) * 18,
      withSequence(
        withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) })
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p,
      transform: [{ translateX: dx * p }, { translateY: dy * p }, { scale: 0.5 + p * 0.7 }],
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.dot, { backgroundColor: color }, style]} />;
}

/** Palette-colored confetti dots that burst outward from center on `trigger` change. */
export function SparkBurst({
  trigger,
  palette,
  radius,
}: {
  trigger: number;
  palette: [string, string];
  radius: number;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: SPARK_COUNT }).map((_, i) => (
        <SparkDot key={i} index={i} trigger={trigger} color={i % 2 === 0 ? palette[0] : palette[1]} radius={radius} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    marginTop: -3,
    marginLeft: -3,
    borderRadius: 3,
  },
});
