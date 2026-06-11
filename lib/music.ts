import { useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MUSIC_STORAGE_KEY = 'background_music_enabled';

// Background music file — place background.mp3 in assets/music/
// Suggested free sources with CC BY license:
// - freemusicarchive.org (search "ambient", "political", "tense")
// - bensound.com (CC BY license, 2-3 min loops)
// - incompetech.com (Kevin MacLeod, CC BY 3.0)
const BACKGROUND_MUSIC_FILE = require('../assets/music/background.mp3') as number;

/**
 * Hook that manages background music playback.
 * Handles loading, looping, volume control, and persistence.
 */
export function useBackgroundMusic() {
  const playerRef = useRef<ReturnType<typeof useAudioPlayer> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [volume, setVolumeState] = useState(0.3);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize audio player
  useEffect(() => {
    try {
      playerRef.current = useAudioPlayer(BACKGROUND_MUSIC_FILE);
      setIsLoaded(true);
    } catch (error) {
      console.warn('Failed to initialize audio player:', error);
    }
  }, []);

  // Load saved preference from AsyncStorage
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(MUSIC_STORAGE_KEY);
        if (saved !== null) {
          setIsMusicEnabled(saved === 'true');
        }
      } catch (error) {
        console.warn('Failed to load music preference:', error);
      }
    };
    loadPreference();
  }, []);

  // Auto-play on load if enabled
  useEffect(() => {
    if (isLoaded && isMusicEnabled && playerRef.current && !isPlaying) {
      startBackgroundMusic();
    }
  }, [isLoaded, isMusicEnabled]);

  const startBackgroundMusic = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      // Set volume before playing
      playerRef.current.volume = volume;
      // Seek to start and play
      await playerRef.current.seekTo(0);
      await playerRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn('Failed to start background music:', error);
    }
  }, [volume]);

  const stopBackgroundMusic = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.pause();
      await playerRef.current.seekTo(0);
      setIsPlaying(false);
    } catch (error) {
      console.warn('Failed to stop background music:', error);
    }
  }, []);

  const setMusicVolume = useCallback(async (level: number) => {
    const clampedVolume = Math.max(0, Math.min(1, level));
    setVolumeState(clampedVolume);
    if (playerRef.current) {
      try {
        playerRef.current.volume = clampedVolume;
      } catch (error) {
        console.warn('Failed to set volume:', error);
      }
    }
  }, []);

  const toggleMusic = useCallback(
    async (enabled: boolean) => {
      setIsMusicEnabled(enabled);
      try {
        await AsyncStorage.setItem(MUSIC_STORAGE_KEY, enabled ? 'true' : 'false');
      } catch (error) {
        console.warn('Failed to save music preference:', error);
      }

      if (enabled) {
        await startBackgroundMusic();
      } else {
        await stopBackgroundMusic();
      }
    },
    [startBackgroundMusic, stopBackgroundMusic]
  );

  return {
    startBackgroundMusic,
    stopBackgroundMusic,
    setMusicVolume,
    toggleMusic,
    isMusicEnabled,
    isPlaying,
    volume,
  };
}
