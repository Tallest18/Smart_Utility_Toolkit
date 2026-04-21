import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabBarIcon({ name, color }: { name: IconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 84 : 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} /> }} />
      <Tabs.Screen name="converter" options={{ title: "Convert", tabBarIcon: ({ color }) => <TabBarIcon name="swap-horizontal" color={color} /> }} />
      <Tabs.Screen name="notes" options={{ title: "Notes", tabBarIcon: ({ color }) => <TabBarIcon name="document-text" color={color} /> }} />
      <Tabs.Screen name="calculator" options={{ title: "Calc", tabBarIcon: ({ color }) => <TabBarIcon name="calculator" color={color} /> }} />
      <Tabs.Screen name="tools" options={{ title: "Tools", tabBarIcon: ({ color }) => <TabBarIcon name="apps" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} /> }} />
    </Tabs>
  );
}
