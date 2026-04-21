import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';

// ── Color utils ───────────────────────────────────────────────────────────────
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) return null;
  const n = parseInt(cleaned, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  let r, g, b;
  if (sn === 0) { r = g = b = ln; } else {
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q-p)*6*t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q-p)*(2/3-t)*6;
      return p;
    };
    r = hue2rgb(p, q, hn + 1/3);
    g = hue2rgb(p, q, hn);
    b = hue2rgb(p, q, hn - 1/3);
  }
  return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rn = r/255, gn = g/255, bn = b/255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round((1 - rn - k) / (1 - k) * 100),
    m: Math.round((1 - gn - k) / (1 - k) * 100),
    y: Math.round((1 - bn - k) / (1 - k) * 100),
    k: Math.round(k * 100),
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(v => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): string {
  const c1 = hexToRgb(hex1); const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return '—';
  const l1 = getLuminance(c1.r, c1.g, c1.b);
  const l2 = getLuminance(c2.r, c2.g, c2.b);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return ratio.toFixed(2) + ':1';
}

// ── Palette generation ────────────────────────────────────────────────────────
function generatePalette(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return [10, 25, 40, 55, 70, 85].map(l => {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  });
}

function generateHarmony(hex: string): { label: string; colors: string[] }[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const mkColor = (hue: number) => {
    const { r, g, b } = hslToRgb((hue + 360) % 360, s, l);
    return rgbToHex(r, g, b);
  };
  return [
    { label: 'Complementary', colors: [hex, mkColor(h + 180)] },
    { label: 'Triadic', colors: [hex, mkColor(h + 120), mkColor(h + 240)] },
    { label: 'Analogous', colors: [mkColor(h - 30), hex, mkColor(h + 30)] },
    { label: 'Split-Complementary', colors: [hex, mkColor(h + 150), mkColor(h + 210)] },
  ];
}

// ── Preset palettes ───────────────────────────────────────────────────────────
const PRESETS = [
  { name: 'Violet', hex: '#6C63FF' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Sky', hex: '#0EA5E9' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Fuchsia', hex: '#D946EF' },
  { name: 'Orange', hex: '#F97316' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function ColorPickerTool() {
  const { colors } = useTheme();
  const [hex, setHex] = useState('#6C63FF');
  const [hexInput, setHexInput] = useState('#6C63FF');
  const [hue, setHue] = useState(245);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(70);
  const [copiedKey, setCopiedKey] = useState('');

  const rgb = hexToRgb(hex) || { r: 108, g: 99, b: 255 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const palette = generatePalette(hex);
  const harmony = generateHarmony(hex);

  const contrastWhite = getContrastRatio(hex, '#FFFFFF');
  const contrastBlack = getContrastRatio(hex, '#000000');
  const textColor = hsl.l > 55 ? '#000000' : '#FFFFFF';

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    setHue(h); setSaturation(s); setLightness(l);
    const { r, g, b } = hslToRgb(h, s, l);
    const newHex = rgbToHex(r, g, b);
    setHex(newHex); setHexInput(newHex);
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    Clipboard.setString(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1500);
  };

  const CopyRow = ({ label, value, k }: { label: string; value: string; k: string }) => (
    <TouchableOpacity style={[s.copyRow, { borderBottomColor: colors.surfaceBorder }]} onPress={() => copyToClipboard(value, k)}>
      <Text style={[s.copyLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[s.copyValue, { color: colors.textPrimary }]}>{value}</Text>
      <Ionicons name={copiedKey === k ? 'checkmark-circle' : 'copy-outline'} size={16} color={copiedKey === k ? colors.success : colors.textMuted} />
    </TouchableOpacity>
  );

  const SliderRow = ({ label, value, max, onVal, gradient }: { label: string; value: number; max: number; onVal: (v: number) => void; gradient: string[] }) => (
    <View style={s.sliderRow}>
      <Text style={[s.sliderLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[s.sliderTrack, { backgroundColor: colors.surfaceBorder }]}>
        <View style={[s.sliderFill, { width: `${(value / max) * 100}%`, backgroundColor: colors.primary }]} />
        {/* Manual step buttons since we can't use Slider without a lib */}
        <View style={s.sliderBtns}>
          <TouchableOpacity onPress={() => onVal(Math.max(0, value - 5))} style={s.sliderBtn}>
            <Ionicons name="remove" size={12} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={[s.sliderValue, { color: colors.textPrimary }]}>{value}</Text>
          <TouchableOpacity onPress={() => onVal(Math.min(max, value + 5))} style={s.sliderBtn}>
            <Ionicons name="add" size={12} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={s.container}>
        {/* Color Preview */}
        <View style={[s.previewCard, { backgroundColor: hex }]}>
          <View style={s.previewTop}>
            <Text style={[s.previewHex, { color: textColor }]}>{hex}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(hex, 'preview')} style={[s.previewCopyBtn, { backgroundColor: textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
              <Ionicons name={copiedKey === 'preview' ? 'checkmark' : 'copy-outline'} size={16} color={textColor} />
              <Text style={{ color: textColor, fontSize: FontSize.xs, fontWeight: '600' }}>
                {copiedKey === 'preview' ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.previewName, { color: textColor + 'AA' }]}>
            HSL({hsl.h}°, {hsl.s}%, {hsl.l}%)
          </Text>
        </View>

        {/* Hex Input */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[s.cardTitle, { color: colors.textSecondary }]}>HEX INPUT</Text>
          <View style={s.hexInputRow}>
            <View style={[s.hexSwatch, { backgroundColor: hex, borderColor: colors.surfaceBorder }]} />
            <TextInput
              style={[s.hexInput, { color: colors.textPrimary, borderColor: colors.surfaceBorder, backgroundColor: colors.surfaceLight }]}
              value={hexInput}
              onChangeText={(v) => {
                setHexInput(v);
                const clean = v.startsWith('#') ? v : '#' + v;
                const rgb2 = hexToRgb(clean);
                if (rgb2) {
                  const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);
                  setHex(clean.toUpperCase());
                  setHue(hsl2.h);
                  setSaturation(hsl2.s);
                  setLightness(hsl2.l);
                }
              }}
              maxLength={7}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* HSL Controls */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[s.cardTitle, { color: colors.textSecondary }]}>HSL CONTROLS</Text>
          <SliderRow label="Hue" value={hue} max={360} onVal={(v) => updateFromHsl(v, saturation, lightness)} gradient={[]} />
          <SliderRow label="Saturation" value={saturation} max={100} onVal={(v) => updateFromHsl(hue, v, lightness)} gradient={[]} />
          <SliderRow label="Lightness" value={lightness} max={100} onVal={(v) => updateFromHsl(hue, saturation, v)} gradient={[]} />
        </View>

        {/* Color Values */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[s.cardTitle, { color: colors.textSecondary }]}>COLOR VALUES</Text>
          <CopyRow label="HEX" value={hex} k="hex" />
          <CopyRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} k="rgb" />
          <CopyRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} k="hsl" />
          <CopyRow label="CMYK" value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`} k="cmyk" />
        </View>

        {/* Presets */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[s.cardTitle, { color: colors.textSecondary }]}>PRESETS</Text>
          <View style={s.presetGrid}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p.hex}
                style={[s.presetItem, { borderColor: hex === p.hex ? colors.primary : 'transparent' }]}
                onPress={() => {
                  const rgb2 = hexToRgb(p.hex)!;
                  const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);
                  setHex(p.hex); setHexInput(p.hex);
                  setHue(hsl2.h); setSaturation(hsl2.s); setLightness(hsl2.l);
                }}
              >
                <View style={[s.presetSwatch, { backgroundColor: p.hex }]} />
                <Text style={[s.presetName, { color: colors.textSecondary }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tints & Shades */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[s.cardTitle, { color: colors.textSecondary }]}>TINTS & SHADES</Text>
          <View style={s.paletteRow}>
            {palette.map((c) => (
              <TouchableOpacity
                key={c}
                style={[s.paletteCell, { backgroundColor: c, borderColor: c === hex ? colors.primary : 'transparent' }]}
                onPress={() => copyToClipboard(c, c)}
              >
                {copiedKey === c && <Ionicons name="checkmark" size={12} color={getLuminance(...Object.values(hexToRgb(c)!) as [number,number,number]) > 0.5 ? '#000' : '#fff'} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Harmony */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[s.cardTitle, { color: colors.textSecondary }]}>COLOR HARMONY</Text>
          {harmony.map((h) => (
            <View key={h.label} style={[s.harmonyRow, { borderBottomColor: colors.surfaceBorder }]}>
              <Text style={[s.harmonyLabel, { color: colors.textSecondary }]}>{h.label}</Text>
              <View style={s.harmonySwatches}>
                {h.colors.map((c) => (
                  <TouchableOpacity key={c} onPress={() => copyToClipboard(c, c)}>
                    <View style={[s.harmonySwatch, { backgroundColor: c }]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Contrast */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[s.cardTitle, { color: colors.textSecondary }]}>CONTRAST RATIO</Text>
          <View style={s.contrastRow}>
            <View style={[s.contrastSample, { backgroundColor: hex }]}>
              <Text style={{ color: '#fff', fontSize: FontSize.sm, fontWeight: '600' }}>White text</Text>
            </View>
            <View style={s.contrastInfo}>
              <Text style={[s.contrastRatio, { color: colors.textPrimary }]}>{contrastWhite}</Text>
              <Text style={[s.contrastPass, { color: parseFloat(contrastWhite) >= 4.5 ? colors.success : colors.error }]}>
                {parseFloat(contrastWhite) >= 7 ? 'AAA Pass' : parseFloat(contrastWhite) >= 4.5 ? 'AA Pass' : 'Fail'}
              </Text>
            </View>
          </View>
          <View style={[s.contrastRow, { marginTop: 8 }]}>
            <View style={[s.contrastSample, { backgroundColor: hex, borderWidth: 1, borderColor: colors.surfaceBorder }]}>
              <Text style={{ color: '#000', fontSize: FontSize.sm, fontWeight: '600' }}>Black text</Text>
            </View>
            <View style={s.contrastInfo}>
              <Text style={[s.contrastRatio, { color: colors.textPrimary }]}>{contrastBlack}</Text>
              <Text style={[s.contrastPass, { color: parseFloat(contrastBlack) >= 4.5 ? colors.success : colors.error }]}>
                {parseFloat(contrastBlack) >= 7 ? 'AAA Pass' : parseFloat(contrastBlack) >= 4.5 ? 'AA Pass' : 'Fail'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  previewCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  previewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewHex: { fontSize: FontSize.xxl, fontWeight: '700', letterSpacing: 1 },
  previewCopyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  previewName: { fontSize: FontSize.sm },
  card: { borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  cardTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.sm },
  hexInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  hexSwatch: { width: 44, height: 44, borderRadius: BorderRadius.md, borderWidth: 1 },
  hexInput: { flex: 1, fontSize: FontSize.md, fontWeight: '600', borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 8, letterSpacing: 1 },
  sliderRow: { marginBottom: Spacing.sm },
  sliderLabel: { fontSize: FontSize.sm, marginBottom: 6 },
  sliderTrack: { height: 8, borderRadius: 4, position: 'relative', overflow: 'hidden' },
  sliderFill: { height: 8, borderRadius: 4 },
  sliderBtns: { position: 'absolute', top: -4, right: 0, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' },
  sliderBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  sliderValue: { fontSize: FontSize.xs, fontWeight: '600', minWidth: 28, textAlign: 'center' },
  copyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  copyLabel: { width: 44, fontSize: FontSize.xs, fontWeight: '600' },
  copyValue: { flex: 1, fontSize: FontSize.sm, fontFamily: 'monospace' },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetItem: { alignItems: 'center', gap: 4, padding: 4, borderRadius: BorderRadius.md, borderWidth: 2, width: 62 },
  presetSwatch: { width: 40, height: 40, borderRadius: 20 },
  presetName: { fontSize: 10, textAlign: 'center' },
  paletteRow: { flexDirection: 'row', gap: 6 },
  paletteCell: { flex: 1, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  harmonyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  harmonyLabel: { fontSize: FontSize.sm, flex: 1 },
  harmonySwatches: { flexDirection: 'row', gap: 6 },
  harmonySwatch: { width: 32, height: 32, borderRadius: 16 },
  contrastRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  contrastSample: { flex: 1, height: 50, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  contrastInfo: { alignItems: 'center', width: 80 },
  contrastRatio: { fontSize: FontSize.md, fontWeight: '700' },
  contrastPass: { fontSize: FontSize.xs, fontWeight: '600' },
});
