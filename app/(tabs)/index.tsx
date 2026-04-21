import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 2 - Spacing.sm) / 2;

type Tool = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  cardColor: string;
  iconColor: string;
};

const TOOLS: Tool[] = [
  {
    id: 'converter',
    title: 'Unit Converter',
    subtitle: 'Length, Weight, Temp & more',
    icon: 'swap-horizontal',
    route: '/converter',
    cardColor: Colors.cardPurple,
    iconColor: '#A78BFA',
  },
  {
    id: 'notes',
    title: 'Smart Notes',
    subtitle: 'Create & organize notes',
    icon: 'document-text',
    route: '/notes',
    cardColor: Colors.cardTeal,
    iconColor: '#34D399',
  },
  {
    id: 'calculator',
    title: 'Calculator',
    subtitle: 'Advanced calculations',
    icon: 'calculator',
    route: '/calculator',
    cardColor: Colors.cardBlue,
    iconColor: '#60A5FA',
  },
  {
    id: 'bmi',
    title: 'BMI Calculator',
    subtitle: 'Health body mass index',
    icon: 'fitness',
    route: '/tools',
    cardColor: Colors.cardRose,
    iconColor: '#F87171',
  },
  {
    id: 'currency',
    title: 'Currency',
    subtitle: 'Exchange rate converter',
    icon: 'cash',
    route: '/converter',
    cardColor: Colors.cardAmber,
    iconColor: '#FCD34D',
  },
  {
    id: 'timer',
    title: 'Timer & Clock',
    subtitle: 'Stopwatch & countdown',
    icon: 'timer',
    route: '/tools',
    cardColor: Colors.cardGreen,
    iconColor: '#6EE7B7',
  },
];

const QUICK_STATS = [
  { label: 'Tools Available', value: '6+', icon: 'apps' as const, color: Colors.primary },
  { label: 'Categories', value: '5', icon: 'grid' as const, color: Colors.accent },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day! 👋</Text>
            <Text style={styles.headerTitle}>Smart Utility</Text>
            <Text style={styles.headerSubtitle}>Your everyday toolkit</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="person-circle" size={42} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTag}>ALL-IN-ONE</Text>
            <Text style={styles.bannerTitle}>Your Productivity{'\n'}Companion</Text>
            <Text style={styles.bannerSub}>Convert, calculate, and note — all in one place.</Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => router.push('/converter')}
            >
              <Text style={styles.bannerButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerDecor}>
            <Ionicons name="flash" size={80} color="rgba(255,255,255,0.08)" />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {QUICK_STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tools Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Tools</Text>
          <Text style={styles.sectionSub}>Tap to open</Text>
        </View>

        <View style={styles.toolsGrid}>
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolCard, { backgroundColor: tool.cardColor }]}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconWrapper, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name={tool.icon} size={26} color={tool.iconColor} />
              </View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
              <View style={styles.toolArrow}>
                <Ionicons name="arrow-forward-circle" size={20} color="rgba(255,255,255,0.35)" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent activity placeholder */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
        </View>
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={20} color={Colors.warning} />
          <Text style={styles.tipText}>
            Swipe between tools using the bottom navigation. Long-press notes to delete them.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  avatarButton: {
    padding: 4,
  },
  bannerCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 30,
    marginBottom: 8,
  },
  bannerSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  bannerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  bannerButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  bannerDecor: {
    position: 'absolute',
    right: -8,
    top: -8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  toolCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    minHeight: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  toolIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  toolTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
  },
  toolArrow: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
  },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
