import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSize, Shadow, Spacing } from '@/constants/theme';

// ─── Button ──────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  disabled,
  fullWidth,
  style,
}: ButtonProps) {
  const { colors } = useTheme();

  const bgMap: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.surface,
    ghost: 'transparent',
    danger: colors.error,
  };
  const textColorMap: Record<ButtonVariant, string> = {
    primary: colors.white,
    secondary: colors.textPrimary,
    ghost: colors.primary,
    danger: colors.white,
  };
  const heightMap: Record<ButtonSize, number> = { sm: 36, md: 46, lg: 54 };
  const fontMap: Record<ButtonSize, number> = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.md };
  const iconMap: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 20 };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bgMap[variant],
          height: heightMap[size],
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.surfaceBorder,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: size === 'sm' ? 14 : size === 'lg' ? 24 : 18,
        },
        variant === 'primary' && Shadow.md,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColorMap[variant]} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={iconMap[size]} color={textColorMap[variant]} />
          )}
          <Text style={[styles.buttonText, { color: textColorMap[variant], fontSize: fontMap[size] }]}>
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={iconMap[size]} color={textColorMap[variant]} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  accent?: string;
  onPress?: () => void;
}

export function Card({ children, style, accent, onPress }: CardProps) {
  const { colors } = useTheme();
  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: accent || colors.surfaceBorder,
          borderLeftWidth: accent ? 3 : 1,
          borderTopWidth: accent ? 0 : 1,
          borderRightWidth: accent ? 0 : 1,
          borderBottomWidth: accent ? 0 : 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, size = 'md' }: BadgeProps) {
  const { colors } = useTheme();
  const bg = color || colors.primary;
  return (
    <View style={[styles.badge, { backgroundColor: bg + '25', paddingHorizontal: size === 'sm' ? 8 : 12, paddingVertical: size === 'sm' ? 2 : 4 }]}>
      <Text style={[styles.badgeText, { color: bg, fontSize: size === 'sm' ? 10 : FontSize.xs }]}>{label}</Text>
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  const { colors } = useTheme();
  if (!label) {
    return <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />;
  }
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
      <Text style={[styles.dividerLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconWrapper, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={40} color={colors.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle && <Text style={[styles.emptySub, { color: colors.textMuted }]}>{subtitle}</Text>}
      {action && (
        <Button label={action.label} onPress={action.onPress} variant="primary" size="md" style={{ marginTop: Spacing.md }} />
      )}
    </View>
  );
}

// ─── SettingRow ───────────────────────────────────────────────────────────────
interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  showChevron?: boolean;
}

export function SettingRow({ icon, iconColor, label, subtitle, onPress, rightElement, showChevron = true }: SettingRowProps) {
  const { colors } = useTheme();
  const content = (
    <View style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder }]}>
      <View style={[styles.settingIcon, { backgroundColor: (iconColor || colors.primary) + '20' }]}>
        <Ionicons name={icon} size={18} color={iconColor || colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
        {subtitle && <Text style={[styles.settingSub, { color: colors.textMuted }]}>{subtitle}</Text>}
      </View>
      {rightElement}
      {showChevron && !rightElement && onPress && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}

export function Toggle({ value, onChange, color }: ToggleProps) {
  const { colors } = useTheme();
  const activeColor = color || colors.primary;
  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        { backgroundColor: value ? activeColor : colors.surfaceBorder },
      ]}
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.toggleThumb,
          { backgroundColor: colors.white, transform: [{ translateX: value ? 18 : 2 }] },
        ]}
      />
    </TouchableOpacity>
  );
}

// ─── ScreenHeader ─────────────────────────────────────────────────────────────
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: { icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void };
}

export function ScreenHeader({ title, subtitle, onBack, rightAction }: ScreenHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.screenHeader, { borderBottomColor: colors.surfaceBorder }]}>
      {onBack && (
        <TouchableOpacity
          style={[styles.headerIconBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.screenHeaderTitle, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.screenHeaderSub, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightAction && (
        <TouchableOpacity
          style={[styles.headerIconBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
          onPress={rightAction.onPress}
        >
          <Ionicons name={rightAction.icon} size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  buttonText: { fontWeight: '600' },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  badge: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: { fontWeight: '700', letterSpacing: 0.3 },
  divider: { height: 1, marginVertical: Spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.md },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700' },
  sectionSub: { fontSize: FontSize.xs, marginTop: 2 },
  sectionAction: { fontSize: FontSize.sm, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xl },
  emptyIconWrapper: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: FontSize.base, fontWeight: '500' },
  settingSub: { fontSize: FontSize.xs, marginTop: 1 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, position: 'absolute' },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  screenHeaderTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  screenHeaderSub: { fontSize: FontSize.sm, marginTop: 2 },
});
