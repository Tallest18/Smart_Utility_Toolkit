import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSize, Spacing, Shadow } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

type Slide = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  bgColor: string;
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'flash',
    iconColor: '#A78BFA',
    bgColor: '#2D1B69',
    title: 'Your All-In-One\nToolkit',
    subtitle: 'Everything you need, right at your fingertips. Convert, calculate, note, and more.',
  },
  {
    id: '2',
    icon: 'swap-horizontal',
    iconColor: '#34D399',
    bgColor: '#0F3D3E',
    title: 'Powerful Unit\nConverter',
    subtitle: 'Convert between length, weight, temperature, speed, area, volume, and currency.',
  },
  {
    id: '3',
    icon: 'document-text',
    iconColor: '#60A5FA',
    bgColor: '#1D3557',
    title: 'Smart Notes\nAnywhere',
    subtitle: 'Create color-coded notes, pin your favorites, and search across all your content.',
  },
  {
    id: '4',
    icon: 'apps',
    iconColor: '#FCD34D',
    bgColor: '#3D2C0A',
    title: 'BMI, QR, Color\n& More',
    subtitle: 'A growing collection of everyday utility tools, all beautifully designed.',
  },
];

interface OnboardingProps {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingProps) {
  const { colors } = useTheme();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goTo = (idx: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.4, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setCurrent(idx);
    scrollRef.current?.scrollTo({ x: idx * width, animated: true });
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      onFinish();
    }
  };

  const slide = SLIDES[current];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
      </TouchableOpacity>

      {/* Slide content */}
      <Animated.View style={[styles.slideContent, { opacity: fadeAnim }]}>
        {/* Icon card */}
        <View style={[styles.iconCard, { backgroundColor: slide.bgColor }]}>
          <View style={[styles.iconGlow, { backgroundColor: slide.iconColor + '30' }]}>
            <Ionicons name={slide.icon} size={72} color={slide.iconColor} />
          </View>
          {/* Decorative floating dots */}
          <View style={[styles.dot1, { backgroundColor: slide.iconColor + '40' }]} />
          <View style={[styles.dot2, { backgroundColor: slide.iconColor + '25' }]} />
          <View style={[styles.dot3, { backgroundColor: slide.iconColor + '15' }]} />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{slide.subtitle}</Text>
      </Animated.View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === current ? slide.iconColor : colors.surfaceBorder,
                    width: i === current ? 24 : 8,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.iconColor }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={current === SLIDES.length - 1 ? 'rocket' : 'arrow-forward'}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Feature chips at the bottom of icon card */}
      {current === SLIDES.length - 1 && (
        <View style={styles.featureChips}>
          {['Unit Converter', 'Notes', 'Calculator', 'BMI', 'QR Code', 'Color Picker'].map(f => (
            <View key={f} style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>{f}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },
  skipBtn: { position: 'absolute', top: 60, right: Spacing.lg, padding: 8 },
  skipText: { fontSize: FontSize.sm, fontWeight: '500' },
  slideContent: { alignItems: 'center', width: '100%', marginBottom: Spacing.xl },
  iconCard: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: BorderRadius.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  iconGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot1: { position: 'absolute', width: 80, height: 80, borderRadius: 40, top: 20, right: 20 },
  dot2: { position: 'absolute', width: 50, height: 50, borderRadius: 25, bottom: 30, left: 25 },
  dot3: { position: 'absolute', width: 100, height: 100, borderRadius: 50, bottom: -30, right: -20 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.sm,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    ...Shadow.md,
  },
  nextBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  featureChips: {
    position: 'absolute',
    bottom: 130,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: FontSize.xs, fontWeight: '500' },
});
