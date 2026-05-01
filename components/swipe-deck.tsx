import { ReactNode, useEffect, useRef } from 'react';
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

  // Always-current refs so the panResponder (created once) never closes over stale props
  const itemRef = useRef(item);
  const onSwipeRef = useRef(onSwipe);
  itemRef.current = item;
  onSwipeRef.current = onSwipe;

  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [item, position]);

  const animateOut = (direction: SwipeDirection) => {
    if (!itemRef.current) {
      return;
    }

    const target =
      direction === 'left'
        ? { x: -420, y: 40 }
        : direction === 'right'
          ? { x: 420, y: 40 }
          : { x: 0, y: -420 };

    Animated.timing(position, {
      toValue: target,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      onSwipeRef.current(itemRef.current!, direction);
    });
  };

  // Always-current ref so the panResponder closure always calls the latest animateOut
  const animateOutRef = useRef(animateOut);
  animateOutRef.current = animateOut;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_: unknown, gesture) => {
        if (gesture.dy < -SWIPE_THRESHOLD) {
          animateOutRef.current('up');
          return;
        }
        if (gesture.dx > SWIPE_THRESHOLD) {
          animateOutRef.current('right');
          return;
        }
        if (gesture.dx < -SWIPE_THRESHOLD) {
          animateOutRef.current('left');
          return;
        }
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start();
      },
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
        {renderCard(item)}
      </Animated.View>

      <View style={styles.actionRow}>
        <ActionButton label="Pass" icon="close" tone="bad" onPress={() => animateOut('left')} />
        <ActionButton label="Captain" icon="star" tone="gold" onPress={() => animateOut('up')} />
        <ActionButton label="Draft" icon="checkmark" tone="good" onPress={() => animateOut('right')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deckArea: {
    gap: 18,
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
});
