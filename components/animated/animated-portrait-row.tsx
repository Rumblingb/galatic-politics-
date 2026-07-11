import { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Politician } from '@/types/game';

import { AnimatedPortrait, PortraitState } from './animated-portrait';

function StaggeredPortrait({
  politician,
  size,
  state,
  delay,
}: {
  politician: Politician;
  size: number;
  state: PortraitState;
  delay: number;
}) {
  const [mounted, setMounted] = useState(delay <= 0);

  useEffect(() => {
    if (mounted) return;
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay, mounted]);

  if (!mounted) {
    // Reserve the slot so siblings don't jump when this one pops in.
    return <View style={{ width: size, height: size }} />;
  }

  return <AnimatedPortrait politician={politician} size={size} state={state} />;
}

/** A row of small AnimatedPortraits that pop in one after another (staggered `enter`). */
export function AnimatedPortraitRow({
  politicians,
  size = 64,
  gap = 10,
  staggerMs = 90,
  state = 'enter',
  style,
}: {
  politicians: Politician[];
  size?: number;
  gap?: number;
  staggerMs?: number;
  state?: PortraitState;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, { gap }, style]}>
      {politicians.map((politician, index) => (
        <StaggeredPortrait
          key={politician.id}
          politician={politician}
          size={size}
          state={state}
          delay={index * staggerMs}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
