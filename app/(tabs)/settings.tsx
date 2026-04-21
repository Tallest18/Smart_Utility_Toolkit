import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ACCENT_PRESETS, ThemeMode } from '@/context/ThemeContext';
import { SettingRow, Toggle, Divider, Badge } from '@/components/ui';
import { BorderRadius, FontSize, Spacing, Shadow } from '@/constants/theme';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode, accentColor, setAccentColor, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your notes and saved preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const THEME_OPTIONS: { label: string; value: ThemeMode; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
    { label: 'Light', value: 'light', icon: 'sunny' },
    { label: 'Dark', value: 'dark', icon: 'moon' },
    { label: 'System', value: 'system', icon: 'phone-portrait' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Customize your experience</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>SU</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Smart Utility</Text>
            <Text style={styles.profileSub}>Your all-in-one toolkit</Text>
          </View>
          <Badge label={`v${APP_VERSION}`} color="#fff" size="sm" />
        </View>

        {/* Appearance Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.settingGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>

          {/* Theme Mode */}
          <View style={[styles.themeRow, { borderBottomColor: colors.surfaceBorder }]}>
            <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="contrast" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Theme</Text>
          </View>
          <View style={[styles.themeOptions, { borderBottomColor: colors.surfaceBorder }]}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: themeMode === opt.value ? colors.primary + '20' : colors.surfaceLight,
                    borderColor: themeMode === opt.value ? colors.primary : colors.surfaceBorder,
                  },
                ]}
                onPress={() => setThemeMode(opt.value)}
              >
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={themeMode === opt.value ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: themeMode === opt.value ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Accent Color */}
          <View style={[styles.accentRow, { borderBottomColor: colors.surfaceBorder }]}>
            <View style={[styles.settingIcon, { backgroundColor: accentColor + '20' }]}>
              <Ionicons name="color-palette" size={18} color={accentColor} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.textPrimary, flex: 1 }]}>Accent Color</Text>
            <View style={styles.accentDots}>
              {ACCENT_PRESETS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.accentDot,
                    { backgroundColor: c },
                    accentColor === c && styles.accentDotActive,
                  ]}
                  onPress={() => setAccentColor(c)}
                />
              ))}
            </View>
          </View>

          {/* Compact Mode */}
          <SettingRow
            icon="grid"
            iconColor={colors.accent}
            label="Compact Mode"
            subtitle="Reduce spacing for more content"
            rightElement={<Toggle value={compactMode} onChange={setCompactMode} />}
            showChevron={false}
          />
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PREFERENCES</Text>
        <View style={[styles.settingGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <SettingRow
            icon="notifications"
            iconColor="#F59E0B"
            label="Notifications"
            subtitle="Reminder alerts and updates"
            rightElement={<Toggle value={notificationsEnabled} onChange={setNotificationsEnabled} />}
            showChevron={false}
          />
          <SettingRow
            icon="phone-portrait"
            iconColor="#10B981"
            label="Haptic Feedback"
            subtitle="Vibration on interactions"
            rightElement={<Toggle value={hapticEnabled} onChange={setHapticEnabled} />}
            showChevron={false}
          />
        </View>

        {/* Tools Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>TOOLS & DATA</Text>
        <View style={[styles.settingGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <SettingRow
            icon="cloud-upload"
            iconColor="#3B82F6"
            label="Export Notes"
            subtitle="Save notes to clipboard or file"
            onPress={() => Alert.alert('Coming Soon', 'Export feature will be available in the next update.')}
          />
          <SettingRow
            icon="refresh"
            iconColor="#8B5CF6"
            label="Reset Converter History"
            subtitle="Clear recent conversion history"
            onPress={() =>
              Alert.alert('Reset', 'Conversion history cleared.', [{ text: 'OK' }])
            }
          />
          <SettingRow
            icon="trash"
            iconColor={colors.error}
            label="Clear All Data"
            subtitle="Delete all notes and preferences"
            onPress={handleClearData}
            showChevron={false}
          />
        </View>

        {/* About Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ABOUT</Text>
        <View style={[styles.settingGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <SettingRow
            icon="information-circle"
            iconColor={colors.info}
            label="App Version"
            subtitle={`Smart Utility Toolkit v${APP_VERSION}`}
            showChevron={false}
          />
          <SettingRow
            icon="shield-checkmark"
            iconColor="#22C55E"
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://example.com/privacy')}
          />
          <SettingRow
            icon="document-text"
            iconColor="#94A3B8"
            label="Terms of Service"
            onPress={() => Linking.openURL('https://example.com/terms')}
          />
          <SettingRow
            icon="star"
            iconColor="#F59E0B"
            label="Rate This App"
            subtitle="Share your feedback"
            onPress={() => Alert.alert('Thanks!', 'Your support means the world to us 🙏')}
          />
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.statsTitle, { color: colors.textSecondary }]}>App Statistics</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Modules', value: '7', icon: 'apps' as const, color: colors.primary },
              { label: 'Unit Types', value: '6', icon: 'swap-horizontal' as const, color: colors.accent },
              { label: 'Currencies', value: '12', icon: 'cash' as const, color: '#F59E0B' },
              { label: 'Features', value: '20+', icon: 'flash' as const, color: '#22C55E' },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statItem, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Smart Utility Toolkit © 2025{'\n'}Built with React Native & Expo
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  headerSub: { fontSize: FontSize.sm, marginTop: 2 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff' },
  profileName: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  profileSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: Spacing.md,
    paddingHorizontal: 4,
  },
  settingGroup: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: FontSize.base, fontWeight: '500' },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  themeOptionText: { fontSize: FontSize.sm, fontWeight: '600' },
  accentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  accentDots: { flexDirection: 'row', gap: 8 },
  accentDot: { width: 24, height: 24, borderRadius: 12 },
  accentDotActive: { borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.15 }] },
  statsCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statsTitle: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  statValue: { fontSize: FontSize.md, fontWeight: '700' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  footer: { textAlign: 'center', fontSize: FontSize.xs, lineHeight: 18, marginTop: Spacing.md },
});
