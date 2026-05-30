import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { useAuth } from '@/providers/auth-provider';

export default function TabLayout() {
  const { isPro } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f7c948',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,15,0.97)',
          borderTopColor: 'rgba(247,201,72,0.15)',
          borderTopWidth: 1,
          height: 82,
          paddingTop: 10,
          paddingBottom: 14,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 0.5,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Draft',
          tabBarIcon: ({ color }) => <Ionicons size={22} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          title: 'League',
          tabBarIcon: ({ color }) => <Ionicons size={22} name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="clips"
        options={{
          title: 'Clips',
          tabBarIcon: ({ color }) => <Ionicons size={22} name="share-social" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: isPro ? 'Pro ★' : 'Go Pro',
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name={isPro ? 'star' : 'star-outline'} color={isPro ? '#f7c948' : color} />
          ),
          tabBarActiveTintColor: '#f7c948',
          tabBarBadge: isPro ? undefined : '!',
          tabBarBadgeStyle: {
            backgroundColor: '#ef233c',
            fontSize: 9,
            fontWeight: '900',
            minWidth: 14,
            height: 14,
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons size={22} name="settings-outline" color={color} />,
        }}
      />
      {/* Hidden — packs is v2 */}
      <Tabs.Screen name="packs" options={{ href: null }} />
    </Tabs>
  );
}
