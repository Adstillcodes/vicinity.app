import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

const TabIcon = ({ name, focused, theme }: { name: string; focused: boolean; theme: any }) => {
  return (
    <Ionicons 
      name={name as any} 
      size={22} 
      color={focused ? theme.colors.ink : theme.colors.muted} 
    />
  );
};

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bg2,
          borderTopColor: theme.colors.border,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.ink,
        tabBarInactiveTintColor: theme.colors.muted,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="globe-outline" focused={focused} theme={theme} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="heart-outline" focused={focused} theme={theme} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="chatbubble-outline" focused={focused} theme={theme} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="compass-outline" focused={focused} theme={theme} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} theme={theme} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});