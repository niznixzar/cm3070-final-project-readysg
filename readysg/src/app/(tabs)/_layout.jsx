import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

// Filled icon for the selected tab, outline for the others.
const icon = (name) => ({ color, focused }) => (
  <Ionicons name={focused ? name : `${name}-outline`} size={26} color={color} />
);

export default function TabsLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 13 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant, minHeight: 64 },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="missions" options={{ title: 'Missions', tabBarIcon: icon('flag') }} />
      <Tabs.Screen name="guides" options={{ title: 'Guides', tabBarIcon: icon('book') }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: icon('location') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
