import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ActionButton } from '@/components/game-ui';
import { SwipeDirection } from '@/types/game';

const SWIPE_THRESHOLD = 120;

type SwipeDeckProps<T extends { id: string }> = {
  item: T | null;
  nextItem?: T | null;
  renderCard: (item: T, captainPreview?: boolean) => ReactNode;
  onSwipe: (item: T, direction: SwipeDirection) => void;
};

export function SwipeDeck<T extends { id: string }>({
  item,
  nextItem,
  renderCard,
  onSwipe,
}: SwipeDeckProps<T>) {
  const position = useRef(new Animated.ValueXY()).current;
  const [hasHinted, setHasHinted] = useState(false);
  const hintAnim = useRef(new Animated.Value(0)).current;

  // Keep latest item/onSwipe in refs so panResponder closure never goes stale
  const itemRef = useRef(item);
  const onSwipeRef = useRef(onSwipe);
  itemRef.current = item;
  onSwipeRef.current = onSwipe;

  // Bounce hint animation on first card load
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
    if (!hasHinted && item) {
      setHasHinted(true);
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(hintAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.timing(position, { toValue: { x: 55, y: 0 }, duration: 320, useNativeDriver: false }),
        Animated.timing(position, { toValue: { x: 0, y: 0 }, duration: 280, useNativeDriver: false }),
        Animated.timing(hintAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      ]).start();
    }
  }, [item]);

  // animateOut uses refs so it's always current — safe to call from stable panResponder
  const animateOutRef = useRef<(direction: SwipeDirection) => void>(() => {});
  animateOutRef.current = (direction: SwipeDirection) => {
    const current = itemRef.current;
    if (!current) return;
    const target =
      direction === 'left'
        ? { x: -420, y: 40 }
        : direction === 'right'
          ? { x: 420, y: 40 }
          : { x: 0, y: -420 };
    Animated.timing(position, { toValue: target, duration: 200, useNativeDriver: false }).start(() => {
      position.setValue({ x: 0, y: 0 });
      onSwipeRef.current(current, direction);
    });
  };

  // Stable ref for resolveRelease so panResponder.create (run once) never uses a stale closure
  const resolveReleaseRef = useRef<(_: unknown, gesture: PanResponderGestureState) => void>(() => {});
  resolveReleaseRef.current = (_: unknown, gesture: PanResponderGestureState) => {
    if (gesture.dy < -SWIPE_THRESHOLD) { animateOutRef.current('up'); return; }
    if (gesture.dx > SWIPE_THRESHOLD) { animateOutRef.current('right'); return; }
    if (gesture.dx < -SWIPE_THRESHOLD) { animateOutRef.current('left'); return; }
    Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: false }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      // Delegate to ref — always calls the latest resolveRelease
      onPanResponderRelease: (e, gesture) => resolveReleaseRef.current(e, gesture),
    })
  ).current;

  const rotation = position.x.interpolate({
    inputRange: [-240, 0, 240],
    outputRange: ['-16deg', '0deg', '16deg'],
  });

  const leftOpacity = position.x.interpolate({
    inputRange: [-160, -50, 0],
    outputRange: [1, 0.35, 0],
  });

  const rightOpacity = position.x.interpolate({
    inputRange: [0, 50, 160],
    outputRange: [0, 0.35, 1],
  });

  const upOpacity = position.y.interpolate({
    inputRange: [-160, -60, 0],
    outputRange: [1, 0.4, 0],
  });

  // First-use hint arrow opacity (fades in/out with hintAnim)
  const hintOpacity = hintAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.75] });

  if (!item) {
    return (
      <View style={styles.emptyDeck}>
        <Text style={styles.emptyTitle}>Deck cleared</Text>
        <Text style={styles.emptyCopy}>You have scouted the full launch board. Reset or jump into league mode.</Text>
      </View>
    );
  }

  return (
    <View style={styles.deckArea}>
      {nextItem ? (
        <View style={styles.nextCard} pointerEvents="none">
          {renderCard(nextItem)}
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.cardWrap,
          {
            transform: [...position.getTranslateTransform(), { rotate: rotation }],
          },
        ]}
        {...panResponder.panHandlers}>
        <Animated.View style={[styles.overlayBadge, styles.overlayLeft, { opacity: leftOpacity }]}>
          <Text style={styles.overlayTextLeft}>PASS</Text>
        </Animated.View>
        <Animated.View style={[styles.overlayBadge, styles.overlayRight, { opacity: rightOpacity }]}>
          <Text style={styles.overlayTextRight}>DRAFT</Text>
        </Animated.View>
        <Animated.View style={[styles.overlayBadge, styles.overlayTop, { opacity: upOpacity }]}>
          <Text style={styles.overlayTextUp}>CAPTAIN</Text>
        </Animated.View>
        {/* First-use swipe hint arrow */}
        <Animated.View style={[styles.hintArrow, { opacity: hintOpacity }]}>
          <Text style={styles.hintText}>→ Swipe to draft</Text>
        </Animated.View>
        {renderCard(item)}
      </Animated.View>

      <View style={styles.actionRow}>
        <ActionButton label="Pass" icon="close" tone="bad" onPress={() => animateOutRef.current('left')} />
        <ActionButton label="Captain" icon="star" tone="gold" onPress={() => animateOutRef.current('up')} />
        <ActionButton label="Draft" icon="checkmark" tone="good" onPress={() => animateOutRef.current('right')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deckArea: {
    gap: 18,
    paddingBottom: 160,
  },
  nextCard: {
    position: 'absolute',
    top: 18,
    left: 10,
    right: 10,
    opacity: 0.35,
    transform: [{ scale: 0.95 }],
  },
  cardWrap: {
    zIndex: 2,
  },
  overlayBadge: {
    position: 'absolute',
    zIndex: 4,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(8, 12, 20, 0.85)',
  },
  overlayLeft: {
    top: 28,
    left: 24,
    borderColor: '#ff5d73',
    transform: [{ rotate: '-12deg' }],
  },
  overlayRight: {
    top: 28,
    right: 24,
    borderColor: '#8bd450',
    transform: [{ rotate: '12deg' }],
  },
  overlayTop: {
    top: 24,
    alignSelf: 'center',
    borderColor: '#ffd166',
  },
  overlayTextLeft: {
    color: '#ff5d73',
    fontWeight: '900',
    fontSize: 18,
  },
  overlayTextRight: {
    color: '#8bd450',
    fontWeight: '900',
    fontSize: 18,
  },
  overlayTextUp: {
    color: '#ffd166',
    fontWeight: '900',
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    position: 'relative',
    zIndex: 999,
    marginBottom: 0,
  },
  emptyDeck: {
    borderRadius: 8,
    backgroundColor: '#fff7e6',
    padding: 28,
    borderWidth: 2,
    borderColor: '#111111',
    gap: 8,
  },
  emptyTitle: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '900',
  },
  emptyCopy: {
    color: '#837766',
    fontSize: 15,
    lineHeight: 22,
  },
  hintArrow: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    zIndex: 5,
    backgroundColor: 'rgba(8, 12, 20, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8bd450',
  },
  hintText: {
    color: '#8bd450',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
