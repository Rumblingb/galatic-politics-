import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground, ScreenHeader } from '@/components/game-ui';
import { useAuth } from '@/providers/auth-provider';
import { useMusic } from '@/providers/music-provider';

const PRO_STRIPE_URL = 'https://buy.stripe.com/bJe00la1xbg05zG5QT1oI1g';
const PRIVACY_URL = 'https://agentpay.so/privacy';

import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Divider() {
  return <View style={styles.divider} />;
}

function RowLabel({ label }: { label: string }) {
  return <Text style={styles.rowLabel}>{label}</Text>;
}

export default function SettingsScreen() {
  const { user, profile, isPro, signOut } = useAuth();
  const { isMusicEnabled, toggleMusic } = useMusic();
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);
  const [notifyReceipts, setNotifyReceipts] = useState(true);
  const [notifyLeague, setNotifyLeague] = useState(true);
  const [notifyWildCard, setNotifyWildCard] = useState(true);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('tutorial_seen');
    await signOut();
  };

  const handleMusicToggle = (enabled: boolean) => {
    toggleMusic(enabled);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader kicker="YOUR ACCOUNT" title="Settings" />

        {/* Account */}
        <Text style={styles.section}>Account</Text>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profile?.display_name ? profile.display_name[0].toUpperCase() : user?.email?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{profile?.display_name ?? 'Anonymous'}</Text>
              <Text style={styles.accountEmail}>{user?.email ?? 'Not signed in'}</Text>
            </View>
          </View>
        </View>

        {/* Audio */}
        <Text style={styles.section}>Audio</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <RowLabel label="Background music" />
            <Switch
              value={isMusicEnabled}
              onValueChange={handleMusicToggle}
              trackColor={{ true: '#f7c948', false: '#c0b89a' }}
              thumbColor="#111111"
            />
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.section}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <RowLabel label="Promise receipt alerts" />
            <Switch
              value={notifyReceipts}
              onValueChange={setNotifyReceipts}
              trackColor={{ true: '#f7c948', false: '#c0b89a' }}
              thumbColor="#111111"
            />
          </View>
          <Divider />
          <View style={styles.row}>
            <RowLabel label="Weekly league update" />
            <Switch
              value={notifyLeague}
              onValueChange={setNotifyLeague}
              trackColor={{ true: '#f7c948', false: '#c0b89a' }}
              thumbColor="#111111"
            />
          </View>
          <Divider />
          <View style={styles.row}>
            <RowLabel label="Wild card events" />
            <Switch
              value={notifyWildCard}
              onValueChange={setNotifyWildCard}
              trackColor={{ true: '#f7c948', false: '#c0b89a' }}
              thumbColor="#111111"
            />
          </View>
        </View>

        {/* Privacy */}
        <Text style={styles.section}>Privacy</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <RowLabel label="Show in global league" />
            <Switch
              value={leaderboardVisible}
              onValueChange={setLeaderboardVisible}
              trackColor={{ true: '#f7c948', false: '#c0b89a' }}
              thumbColor="#111111"
            />
          </View>
          <Divider />
          <Pressable
            style={styles.linkRow}
            onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color="#837766" />
          </Pressable>
        </View>

        {/* Subscription */}
        <Text style={styles.section}>Subscription</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <RowLabel label="Current plan" />
            <View style={[styles.planBadge, isPro && styles.planBadgePro]}>
              <Text style={[styles.planBadgeText, isPro && styles.planBadgeTextPro]}>
                {isPro ? 'Pro ★' : 'Free'}
              </Text>
            </View>
          </View>
          {!isPro && (
            <>
              <Divider />
              <Pressable
                style={({ pressed }) => [styles.upgradeBtn, pressed && { opacity: 0.88 }]}
                onPress={() => WebBrowser.openBrowserAsync(PRO_STRIPE_URL)}
              >
                <Ionicons name="star" size={16} color="#111111" />
                <Text style={styles.upgradeBtnText}>Upgrade to Pro — $9/mo</Text>
              </Pressable>
            </>
          )}
          {isPro && (
            <>
              <Divider />
              <Pressable
                style={styles.linkRow}
                onPress={() => WebBrowser.openBrowserAsync(PRO_STRIPE_URL)}
              >
                <Text style={styles.linkText}>Manage subscription</Text>
                <Ionicons name="open-outline" size={16} color="#837766" />
              </Pressable>
            </>
          )}
        </View>

        {/* About */}
        <Text style={styles.section}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <RowLabel label="Version" />
            <Text style={styles.mutedValue}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          </View>
          <Divider />
          <Pressable
            style={styles.linkRow}
            onPress={() => WebBrowser.openBrowserAsync('https://github.com/Rumblingb')}
          >
            <Text style={styles.linkText}>github.com/Rumblingb</Text>
            <Ionicons name="logo-github" size={16} color="#837766" />
          </Pressable>
          <Divider />
          <View style={styles.disclaimerRow}>
            <Ionicons name="information-circle-outline" size={16} color="#837766" />
            <Text style={styles.disclaimerText}>
              Power Cabinet is political satire. All politicians and events are fictional or parodied for entertainment.
            </Text>
          </View>
        </View>

        {/* Sign out */}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.85 }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef233c" />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3ead7' },
  container: { padding: 16, paddingBottom: 30, gap: 12 },
  section: {
    color: '#837766',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: '#fff7e6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111111',
    overflow: 'hidden',
  },
  divider: {
    height: 2,
    backgroundColor: '#111111',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 50,
  },
  rowLabel: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  mutedValue: {
    color: '#837766',
    fontSize: 14,
    fontWeight: '800',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 50,
  },
  linkText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#f7c948',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#f7c948',
    fontSize: 22,
    fontWeight: '900',
  },
  accountInfo: {
    flex: 1,
    gap: 3,
  },
  accountName: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '900',
  },
  accountEmail: {
    color: '#837766',
    fontSize: 13,
    fontWeight: '700',
  },
  planBadge: {
    backgroundColor: '#f3ead7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#111111',
  },
  planBadgePro: {
    backgroundColor: '#f7c948',
  },
  planBadgeText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '900',
  },
  planBadgeTextPro: {
    color: '#111111',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f7c948',
    margin: 12,
    borderRadius: 8,
    paddingVertical: 13,
    borderWidth: 2,
    borderColor: '#111111',
  },
  upgradeBtnText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  disclaimerText: {
    flex: 1,
    color: '#837766',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ef233c',
    paddingVertical: 14,
  },
  signOutText: {
    color: '#ef233c',
    fontSize: 15,
    fontWeight: '900',
  },
});
