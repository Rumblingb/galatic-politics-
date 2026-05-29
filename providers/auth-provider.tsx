import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { getOrCreateProfile, Profile, supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isPro: boolean;
  isLoading: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPro = profile?.is_pro ?? false;

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getOrCreateProfile(user.id);
    setProfile(p);
  };

  useEffect(() => {
    // Safety net: if Supabase hangs or env vars are missing, never stay on the
    // loading screen forever — fall through to the login screen after 8s.
    const loadingTimeout = setTimeout(() => {
      console.warn('[AuthProvider] Session check timed out — showing login screen');
      setIsLoading(false);
    }, 8000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        clearTimeout(loadingTimeout);
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          getOrCreateProfile(
            session.user.id,
            session.user.user_metadata?.full_name ?? session.user.user_metadata?.name
          ).then(setProfile);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        clearTimeout(loadingTimeout);
        console.error('[AuthProvider] Session check failed:', err);
        setIsLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        getOrCreateProfile(
          session.user.id,
          session.user.user_metadata?.full_name ?? session.user.user_metadata?.name
        ).then(setProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      if (err?.code !== 'ERR_REQUEST_CANCELED') {
        console.error('Apple sign-in error:', err);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'powercabinet://auth/callback',
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) return;

      const result = await WebBrowser.openAuthSessionAsync(data.url, 'powercabinet://auth/callback');

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');
        if (!access_token || !refresh_token) {
          throw new Error('OAuth callback missing tokens');
        }
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({ user, profile, isPro, isLoading, signInWithApple, signInWithGoogle, signOut, refreshProfile }),
    [user, profile, isPro, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
