import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
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
          fontSize: 12,
          fontWeight: '800',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Draft',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          title: 'League',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="clips"
        options={{
          title: 'Clips',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="share-social" color={color} />,
        }}
      />
    </Tabs>
  );
}
