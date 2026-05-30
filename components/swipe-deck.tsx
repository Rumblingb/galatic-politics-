import * as Haptics from 'expo-haptics';
import { ReactNode, useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ActionButton } from '@/components/game-ui';
import { useSwipeSounds } from '@/lib/sounds';
import { SwipeDirection } from '@/types/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COMMIT_X_THRESHOLD = SCREEN_WIDTH * 0.30;
const COMMIT_VELOCITY = 800;
const CAPTAIN_Y_THRESHOLD = -80;
const CAPTAIN_X_MAX = 60;

const SPRING_BACK = { stiffness: 120, damping: 15, mass: 0.5 };
const SPRING_FLY = { stiffness: 80, damping: 20 };

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
  const playSound = useSwipeSounds();

  // Shared values for the front card position
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Y where the user first pressed (0–1 relative to card height, set in onBegin)
  const touchYRatio = useSharedValue(0.5);
  // Tracks which threshold we've already fired a haptic for ('none'|'draft'|'pass'|'captain')
  const hapticFired = useSharedValue<'none' | 'draft' | 'pass' | 'captain'>('none');

  // ─── JS-side callbacks (called via runOnJS) ───────────────────────────────

  const triggerHaptic = useCallback((direction: 'draft' | 'pass' | 'captain') => {
    if (direction === 'captain') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (direction === 'draft') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    playSound(direction);
  }, [playSound]);

  const commitSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!item) return;
      onSwipe(item, direction);
    },
    [item, onSwipe],
  );

  // ─── Gesture ─────────────────────────────────────────────────────────────

  const pan = Gesture.Pan()
    .onBegin((e) => {
      // Card height is not known at worklet time; approximate from a fixed height
      // The card is roughly 520px tall (cardShellFifa minHeight). We use that.
      touchYRatio.value = e.y / 520;
      hapticFired.value = 'none';
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;

      // Check thresholds for mid-drag haptic (fires once per swipe direction)
      const absTX = Math.abs(e.translationX);
      const isCaptain =
        e.translationY < CAPTAIN_Y_THRESHOLD && absTX < CAPTAIN_X_MAX;
      const isDraft = e.translationX > COMMIT_X_THRESHOLD;
      const isPass = e.translationX < -COMMIT_X_THRESHOLD;

      if (isCaptain && hapticFired.value !== 'captain') {
        hapticFired.value = 'captain';
        runOnJS(triggerHaptic)('captain');
      } else if (isDraft && hapticFired.value !== 'draft') {
        hapticFired.value = 'draft';
        runOnJS(triggerHaptic)('draft');
      } else if (isPass && hapticFired.value !== 'pass') {
        hapticFired.value = 'pass';
        runOnJS(triggerHaptic)('pass');
      }
    })
    .onEnd((e) => {
      const absTX = Math.abs(e.translationX);
      const isCaptain =
        e.translationY < CAPTAIN_Y_THRESHOLD && absTX < CAPTAIN_X_MAX;
      const overThresholdX = absTX > COMMIT_X_THRESHOLD;
      const fastFlick = Math.abs(e.velocityX) > COMMIT_VELOCITY;
      const committed = overThresholdX || fastFlick;

      if (isCaptain) {
        // Fly off upward
        translateY.value = withSpring(-SCREEN_HEIGHT * 1.5, SPRING_FLY, () => {
          runOnJS(commitSwipe)('up');
          translateX.value = 0;
          translateY.value = 0;
        });
      } else if (committed && e.translationX > 0) {
        // DRAFT — fly right
        translateX.value = withSpring(
          SCREEN_WIDTH * 1.5,
          { ...SPRING_FLY, velocity: e.velocityX },
          () => {
            runOnJS(commitSwipe)('right');
            translateX.value = 0;
            translateY.value = 0;
          },
        );
      } else if (committed && e.translationX < 0) {
        // PASS — fly left
        translateX.value = withSpring(
          -SCREEN_WIDTH * 1.5,
          { ...SPRING_FLY, velocity: e.velocityX },
          () => {
            runOnJS(commitSwipe)('left');
            translateX.value = 0;
            translateY.value = 0;
          },
        );
      } else {
        // Spring back to center
        translateX.value = withSpring(0, SPRING_BACK);
        translateY.value = withSpring(0, SPRING_BACK);
      }
    });

  // ─── Animated styles ──────────────────────────────────────────────────────

  const cardStyle = useAnimatedStyle(() => {
    const tx = translateX.value;
    const ty = translateY.value;

    // Rotation magnitude derived from x translation
    const rotMag = interpolate(tx, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-10, 0, 10], Extrapolation.CLAMP);
    // If grabbed top half: normal rotation; bottom half: invert (rotates around touch point)
    const rotation = touchYRatio.value < 0.5 ? rotMag : -rotMag;

    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const draftOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SCREEN_WIDTH / 3], [0, 1], Extrapolation.CLAMP),
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SCREEN_WIDTH / 3], [0, 1], Extrapolation.CLAMP),
  }));

  const captainOverlayStyle = useAnimatedStyle(() => ({
    opacity:
      Math.abs(translateX.value) < CAPTAIN_X_MAX
        ? interpolate(translateY.value, [0, -80], [0, 1], Extrapolation.CLAMP)
        : 0,
  }));

  // Back card scale + translateY derived from front card's x movement
  const backCardStyle = useAnimatedStyle(() => {
    const absTX = Math.abs(translateX.value);
    const scale = interpolate(absTX, [0, SCREEN_WIDTH / 2], [0.95, 1.0], Extrapolation.CLAMP);
    const ty = interpolate(absTX, [0, SCREEN_WIDTH / 2], [10, 0], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY: ty }] };
  });

  // ─── Button handlers (JS side) ────────────────────────────────────────────

  const handleButtonSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!item) return;
      const targetX =
        direction === 'right'
          ? SCREEN_WIDTH * 1.5
          : direction === 'left'
            ? -SCREEN_WIDTH * 1.5
            : 0;
      const targetY = direction === 'up' ? -SCREEN_HEIGHT * 1.5 : 0;

      if (direction === 'up') {
        translateY.value = withSpring(targetY, SPRING_FLY, () => {
          runOnJS(commitSwipe)('up');
          translateX.value = 0;
          translateY.value = 0;
        });
      } else {
        translateX.value = withSpring(targetX, SPRING_FLY, () => {
          runOnJS(commitSwipe)(direction);
          translateX.value = 0;
          translateY.value = 0;
        });
      }
    },
    [item, commitSwipe, translateX, translateY],
  );

  // ─── Empty state ──────────────────────────────────────────────────────────

  if (!item) {
    return (
      <View style={styles.emptyDeck}>
        <Text style={styles.emptyTitle}>Deck cleared</Text>
        <Text style={styles.emptyCopy}>
          You have scouted the full launch board. Reset or jump into league mode.
        </Text>
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.deckArea}>
      {/* Back card */}
      {nextItem ? (
        <Animated.View style={[styles.nextCard, backCardStyle]} pointerEvents="none">
          {renderCard(nextItem)}
        </Animated.View>
      ) : null}

      {/* Front card with gesture */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cardWrap, cardStyle]}>
          {/* DRAFT overlay — top-left, green */}
          <Animated.View style={[styles.overlayBadge, styles.overlayDraft, draftOverlayStyle]}>
            <Text style={styles.overlayTextDraft}>DRAFT</Text>
          </Animated.View>

          {/* PASS overlay — top-right, red */}
          <Animated.View style={[styles.overlayBadge, styles.overlayPass, passOverlayStyle]}>
            <Text style={styles.overlayTextPass}>PASS</Text>
          </Animated.View>

          {/* CAPTAIN overlay — center, gold */}
          <Animated.View style={[styles.overlayBadge, styles.overlayCaptain, captainOverlayStyle]}>
            <Text style={styles.overlayTextCaptain}>⭐ CAPTAIN</Text>
          </Animated.View>

          {renderCard(item)}
        </Animated.View>
      </GestureDetector>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <ActionButton label="Pass" icon="close" tone="bad" onPress={() => handleButtonSwipe('left')} />
        <ActionButton label="Captain" icon="star" tone="gold" onPress={() => handleButtonSwipe('up')} />
        <ActionButton label="Draft" icon="checkmark" tone="good" onPress={() => handleButtonSwipe('right')} />
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  cardWrap: {
    zIndex: 2,
  },
  overlayBadge: {
    position: 'absolute',
    zIndex: 4,
    borderWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  overlayDraft: {
    top: 28,
    left: 24,
    borderColor: '#22c55e',
    transform: [{ rotate: '-15deg' }],
  },
  overlayPass: {
    top: 28,
    right: 24,
    borderColor: '#ef233c',
    transform: [{ rotate: '15deg' }],
  },
  overlayCaptain: {
    top: '40%',
    alignSelf: 'center',
    borderColor: '#f7c948',
  },
  overlayTextDraft: {
    color: '#22c55e',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 1,
  },
  overlayTextPass: {
    color: '#ef233c',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 1,
  },
  overlayTextCaptain: {
    color: '#f7c948',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    position: 'relative',
    zIndex: 999,
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
