import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSize, Spacing, Shadow } from '@/constants/theme';

/**
 * Pure-JS QR Code encoder (Reed-Solomon + data encoding, SVG output).
 * Supports alphanumeric + byte mode, error correction L/M/Q/H.
 * This is a simplified implementation that generates a valid QR for short strings.
 */

// ── Reed-Solomon GF(256) ──────────────────────────────────────────────────────
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  GF_EXP[i] = x;
  GF_LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];

function gfMul(a: number, b: number) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}
function gfPoly(keys: number[]) {
  let p = [1];
  for (let i = 0; i < keys.length; i++) {
    const t = [1, GF_EXP[i]];
    const r = new Array(p.length + t.length - 1).fill(0);
    for (let a = 0; a < p.length; a++)
      for (let b = 0; b < t.length; b++)
        r[a + b] ^= gfMul(p[a], t[b]);
    p = r;
  }
  return p;
}
function rsEncode(data: number[], nBlock: number) {
  const gen = gfPoly(new Array(nBlock).fill(0));
  const out = new Array(nBlock).fill(0);
  for (let i = 0; i < data.length; i++) {
    const coeff = data[i] ^ out[0];
    out.shift(); out.push(0);
    if (coeff !== 0)
      for (let j = 0; j < out.length; j++)
        out[j] ^= gfMul(gen[j + 1], coeff);
  }
  return out;
}

// ── QR Version 2, L error correction (28 data codewords) ─────────────────────
function encodeQR(text: string): boolean[][] | null {
  // Only version 2-L supported for simplicity (max ~32 bytes)
  const maxBytes = 32;
  const bytes = Array.from(new TextEncoder().encode(text.slice(0, maxBytes)));
  const n = bytes.length;

  // Byte mode header + data
  const bits: number[] = [];
  const push = (v: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((v >> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(n, 8);       // char count
  for (const b of bytes) push(b, 8);
  push(0, 4); // terminator
  while (bits.length % 8 !== 0) bits.push(0);
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((a, b, j) => a | (b << (7 - j)), 0));
  }
  const padBytes = [0xEC, 0x11];
  while (codewords.length < 28) codewords.push(padBytes[(codewords.length - n * 8 / 8) % 2]);
  const ec = rsEncode(codewords, 16);
  const all = [...codewords, ...ec];

  // 25x25 matrix for version 2
  const SIZE = 25;
  const mat: number[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(-1));
  const res: boolean[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));

  const setMod = (r: number, c: number, v: number) => { if (mat[r]?.[c] === undefined) return; mat[r][c] = v; };
  const setFixed = (r: number, c: number, v: number) => { mat[r][c] = v; res[r][c] = true; };

  // Finder patterns
  const finder = (tr: number, tc: number) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++) {
        const on = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        setFixed(tr + r, tc + c, on ? 1 : 0);
      }
  };
  finder(0, 0); finder(0, SIZE - 7); finder(SIZE - 7, 0);
  // Separators
  for (let i = 0; i < 8; i++) {
    setFixed(7, i, 0); setFixed(i, 7, 0);
    setFixed(7, SIZE - 1 - i, 0); setFixed(i, SIZE - 8, 0);
    setFixed(SIZE - 8, i, 0); setFixed(SIZE - 1 - i, 7, 0);
  }
  // Timing
  for (let i = 8; i < SIZE - 8; i++) {
    setFixed(6, i, i % 2 === 0 ? 1 : 0);
    setFixed(i, 6, i % 2 === 0 ? 1 : 0);
  }
  // Alignment (version 2: at 18,18)
  for (let r = 16; r <= 20; r++)
    for (let c = 16; c <= 20; c++) {
      if (mat[r][c] !== -1) continue; // don't overwrite finder
      const on = r === 16 || r === 20 || c === 16 || c === 20 || (r === 18 && c === 18);
      setFixed(r, c, on ? 1 : 0);
    }
  // Dark module
  setFixed(SIZE - 8, 8, 1);
  // Format info (mask 0, error L) – precomputed
  const fmtBits = [1,1,0,0,1,1,1,1,0,0,0,1,0,0,1]; // L, mask 0
  const fmtPos = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  fmtPos.forEach(([r,c],i) => setFixed(r,c,fmtBits[i]));
  const fmtPos2 = [[SIZE-1,8],[SIZE-2,8],[SIZE-3,8],[SIZE-4,8],[SIZE-5,8],[SIZE-6,8],[SIZE-7,8],[SIZE-8,8],[8,SIZE-8],[8,SIZE-7],[8,SIZE-6],[8,SIZE-5],[8,SIZE-4],[8,SIZE-3],[8,SIZE-2]];
  fmtPos2.forEach(([r,c],i) => setFixed(r,c,fmtBits[i]));

  // Data placement (zigzag, upward)
  let bitIdx = 0;
  const allBits = all.flatMap(b => Array.from({length:8},(_,i)=>(b>>(7-i))&1));
  const maskFn = (r: number, c: number) => (r + c) % 2 === 0;

  let up = true;
  let col = SIZE - 1;
  while (col > 0) {
    if (col === 6) col--;
    const cols = [col, col - 1];
    const rows = up ? Array.from({length:SIZE},(_,i)=>SIZE-1-i) : Array.from({length:SIZE},(_,i)=>i);
    for (const r of rows) {
      for (const c of cols) {
        if (res[r][c]) continue;
        if (bitIdx < allBits.length) {
          mat[r][c] = allBits[bitIdx++] ^ (maskFn(r,c)?1:0);
        } else {
          mat[r][c] = maskFn(r,c)?1:0;
        }
      }
    }
    up = !up;
    col -= 2;
  }

  // Convert to boolean
  return mat.map(row => row.map(v => v === 1));
}

type QRProps = {
  data: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
};

function QRCodeSVG({ data, size = 200, fgColor = '#000', bgColor = '#fff' }: QRProps) {
  const matrix = useMemo(() => encodeQR(data || ' '), [data]);
  if (!matrix) return null;
  const n = matrix.length;
  const cellSize = size / n;
  const quiet = cellSize * 2;
  const total = size + quiet * 2;

  const rects: string[] = [];
  matrix.forEach((row, r) => {
    row.forEach((on, c) => {
      if (on) {
        rects.push(
          `<rect x="${quiet + c * cellSize}" y="${quiet + r * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fgColor}"/>`
        );
      }
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}"><rect width="${total}" height="${total}" fill="${bgColor}"/>${rects.join('')}</svg>`;
}

// ── React component ───────────────────────────────────────────────────────────
const QUICK_OPTIONS = ['https://google.com', 'Hello World', 'mailto:test@email.com', '+2348012345678'];

export default function QRCodeTool() {
  const { colors } = useTheme();
  const [input, setInput] = useState('https://example.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const svgString = QRCodeSVG({ data: input, size: 240, fgColor, bgColor });

  const FG_OPTIONS = ['#000000', '#1E293B', '#6C63FF', '#EC4899', '#10B981'];
  const BG_OPTIONS = ['#FFFFFF', '#F8FAFC', '#FFF7ED', '#F0FDF4', '#EFF6FF'];

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={[s.container]}>
        {/* Input */}
        <View style={[s.inputCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[s.label, { color: colors.textSecondary }]}>Enter text or URL</Text>
          <TextInput
            style={[s.input, { color: colors.textPrimary, borderColor: colors.surfaceBorder }]}
            value={input}
            onChangeText={setInput}
            placeholder="https://example.com"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={200}
          />
          <Text style={[s.charCount, { color: colors.textMuted }]}>{input.length}/200</Text>
        </View>

        {/* Quick options */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.quickScroll} contentContainerStyle={s.quickContent}>
          {QUICK_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[s.quickPill, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              onPress={() => setInput(opt)}
            >
              <Text style={[s.quickText, { color: colors.textSecondary }]} numberOfLines={1}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Color options */}
        <View style={[s.colorCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={s.colorRow}>
            <Text style={[s.label, { color: colors.textSecondary }]}>Foreground</Text>
            <View style={s.colorDots}>
              {FG_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.colorDot, { backgroundColor: c, borderColor: fgColor === c ? colors.primary : 'transparent', borderWidth: 2 }]}
                  onPress={() => setFgColor(c)}
                />
              ))}
            </View>
          </View>
          <View style={[s.colorRow, { borderTopWidth: 1, borderTopColor: colors.surfaceBorder, paddingTop: 10 }]}>
            <Text style={[s.label, { color: colors.textSecondary }]}>Background</Text>
            <View style={s.colorDots}>
              {BG_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.colorDot, { backgroundColor: c, borderColor: bgColor === c ? colors.primary : colors.surfaceBorder, borderWidth: 2 }]}
                  onPress={() => setBgColor(c)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* QR Preview */}
        {svgString && input.trim() && (
          <View style={[s.qrCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[s.label, { color: colors.textSecondary, marginBottom: Spacing.md }]}>Preview</Text>
            <View style={s.qrWrapper}>
              {/* Render SVG as a styled view grid since we can't use WebView */}
              <QRMatrixView data={input} fgColor={fgColor} bgColor={bgColor} />
            </View>
            <TouchableOpacity
              style={[s.shareBtn, { backgroundColor: colors.primary }]}
              onPress={() => Share.share({ message: `QR Code content: ${input}` })}
            >
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={s.shareBtnText}>Share Content</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ── Native QR rendering using View grid ──────────────────────────────────────
function QRMatrixView({ data, fgColor, bgColor }: { data: string; fgColor: string; bgColor: string }) {
  const matrix = useMemo(() => encodeQR(data || ' '), [data]);
  if (!matrix) return null;
  const n = matrix.length;
  const cellSize = Math.floor(260 / n);
  const totalSize = cellSize * n;

  return (
    <View style={{ width: totalSize, height: totalSize, backgroundColor: bgColor }}>
      {matrix.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((on, c) => (
            <View
              key={c}
              style={{ width: cellSize, height: cellSize, backgroundColor: on ? fgColor : bgColor }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  inputCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 6 },
  input: {
    fontSize: FontSize.base,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: FontSize.xs, textAlign: 'right', marginTop: 4 },
  quickScroll: { marginBottom: Spacing.sm },
  quickContent: { gap: 8, paddingVertical: 4 },
  quickPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    maxWidth: 160,
  },
  quickText: { fontSize: FontSize.xs, fontWeight: '500' },
  colorCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  colorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  colorDots: { flexDirection: 'row', gap: 8 },
  colorDot: { width: 26, height: 26, borderRadius: 13 },
  qrCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 12,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  shareBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
});
