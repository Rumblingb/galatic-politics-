import { useAudioPlayer } from 'expo-audio';

// Static requires so Metro can bundle the assets at build time.
// Replace these placeholder files in assets/sounds/ with real short clips:
//   draft.mp3   — positive whoosh/pop (~0.3s)
//   pass.mp3    — negative whoosh (~0.3s)
//   captain.mp3 — triumphant ping/chime (~0.5s)
// Free sources: freesound.org, mixkit.co/free-sound-effects/
export const SOUND_FILES = {
  swipeRight: require('../assets/sounds/draft.mp3') as number,
  swipeLeft: require('../assets/sounds/pass.mp3') as number,
  captain: require('../assets/sounds/captain.mp3') as number,
};

/**
 * Hook that returns a `playSwipeSound` function bound to pre-loaded players.
 * Call the returned function from runOnJS inside a Reanimated worklet.
 */
export function useSwipeSounds() {
  const draftPlayer = useAudioPlayer(SOUND_FILES.swipeRight);
  const passPlayer = useAudioPlayer(SOUND_FILES.swipeLeft);
  const captainPlayer = useAudioPlayer(SOUND_FILES.captain);

  function playSwipeSound(direction: 'draft' | 'pass' | 'captain') {
    try {
      if (direction === 'draft') {
        draftPlayer.seekTo(0);
        draftPlayer.play();
      } else if (direction === 'pass') {
        passPlayer.seekTo(0);
        passPlayer.play();
      } else {
        captainPlayer.seekTo(0);
        captainPlayer.play();
      }
    } catch {
      // Sound playback is best-effort — never block the gesture
    }
  }

  return playSwipeSound;
}
