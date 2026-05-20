import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

import { useAuth } from '@/providers/auth-provider';

export default function TabLayout() {
  const { isPro } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#837766',
        tabBarStyle: {
          backgroundColor: '#fff7e6',
          borderTopColor: '#111111',
          borderTopWidth: 2,
          height: 82,
          paddingTop: 10,
          paddingBottom: 14,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.3,
        },
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
      {/* Hidden — packs is v2 */}
      <Tabs.Screen name="packs" options={{ href: null }} />
    </Tabs>
  );
}
