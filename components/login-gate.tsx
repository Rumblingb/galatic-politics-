import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground, CaricaturePortrait } from '@/components/game-ui';
import { politicians, wildCardEvents } from '@/data/politicians';
import { useAuth } from '@/providers/auth-provider';

WebBrowser.maybeCompleteAuthSession();

export function LoginGate({ children }: { children: ReactNode }) {
  const { user, isLoading, signInWithApple, signInWithGoogle, continueAsGuest } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f7c948" />
      </View>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  const bossEvent = wildCardEvents[0];
  const bossCard = politicians.find((p) => p.id === bossEvent.politicianId) ?? politicians[0];

  return (
    <SafeAreaView style={styles.root}>
      <AppBackground />

      <View style={styles.header}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>GLOBAL DRAFT OPEN</Text>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.kicker}>POWER CABINET</Text>
        <Text style={styles.headline}>Build your{'\n'}global cabinet.</Text>
        <Text style={styles.sub}>
          Draft world leaders. Chase promise points.{'\n'}Survive the truth tax.
        </Text>
      </View>

      <View style={styles.bossCard}>
        <View style={styles.bossTopRow}>
          <Text style={styles.challengerLabel}>CHALLENGER APPROACHING</Text>
          <View style={styles.rarityBadge}>
            <Text style={styles.rarityText}>MYTHIC</Text>
          </View>
        </View>
        <CaricaturePortrait politician={bossCard} size="large" />
        <Text style={styles.bossName}>{bossCard.name}</Text>
        <Text style={styles.bossCopy}>{bossEvent.effect}</Text>
      </View>

      <View style={styles.authBlock}>
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={10}
            style={styles.appleBtn}
            onPress={signInWithApple}
          />
        )}

        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
          onPress={signInWithGoogle}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleLabel}>Continue with Google</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.guestBtn, pressed && { opacity: 0.7 }]}
          onPress={continueAsGuest}>
          <Text style={styles.guestLabel}>Play as guest</Text>
        </Pressable>

        <Text style={styles.hint}>
          Swipe right to draft · left to pass · up to captain
        </Text>
      </View>

      <Pressable
        onPress={() =>
          Linking.openURL(
            'https://rumblingb.github.io/agentpay-labs-hub/privacy/power-cabinet.html'
          )
        }>
        <Text style={styles.privacy}>Privacy Policy</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111111',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  loader: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 8,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#f7c948',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f7c948',
  },
  liveText: {
    color: '#f7c948',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  titleBlock: {
    gap: 6,
  },
  kicker: {
    color: '#f7c948',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headline: {
    color: '#fff7e6',
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 46,
    textShadowColor: '#ef233c',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  sub: {
    color: '#837766',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  bossCard: {
    borderWidth: 3,
    borderColor: '#ef233c',
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  bossTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  challengerLabel: {
    color: '#f7c948',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  rarityBadge: {
    backgroundColor: '#f7c948',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  rarityText: {
    color: '#111111',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bossName: {
    color: '#fff7e6',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  bossCopy: {
    color: '#837766',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  authBlock: {
    gap: 10,
  },
  appleBtn: {
    width: '100%',
    height: 52,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff7e6',
    borderRadius: 10,
    height: 52,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleLabel: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  hint: {
    color: '#555544',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  privacy: {
    color: '#555544',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
