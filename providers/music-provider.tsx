import React, { createContext, useContext } from 'react';
import { useBackgroundMusic } from '@/lib/music';

interface MusicContextType {
  startBackgroundMusic: () => Promise<void>;
  stopBackgroundMusic: () => Promise<void>;
  setMusicVolume: (level: number) => Promise<void>;
  toggleMusic: (enabled: boolean) => Promise<void>;
  isMusicEnabled: boolean;
  isPlaying: boolean;
  volume: number;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const music = useBackgroundMusic();

  return (
    <MusicContext.Provider value={music}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
}
