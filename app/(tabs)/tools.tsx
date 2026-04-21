import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import QRCodeTool from '@/components/QRCodeTool';
import ColorPickerTool from '@/components/ColorPickerTool';

const { width } = Dimensions.get('window');

type Tool = 'home' | 'bmi' | 'timer' | 'currency' | 'password' | 'qrcode' | 'color';

// ─── BMI Calculator ──────────────────────────────────────────────────────────
function BMICalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [isMetric, setIsMetric] = useState(true);

  const bmi = (() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || h === 0) return null;
    if (isMetric) {
      return w / ((h / 100) * (h / 100));
    } else {
      return (703 * w) / (h * h);
    }
  })();

  const bmiCategory = (b: number) => {
    if (b < 18.5) return { label: 'Underweight', color: '#60A5FA' };
    if (b < 25) return { label: 'Normal weight', color: Colors.success };
    if (b < 30) return { label: 'Overweight', color: Colors.warning };
    return { label: 'Obese', color: Colors.error };
  };

  const cat = bmi ? bmiCategory(bmi) : null;
  const bmiPercent = bmi ? Math.min(Math.max((bmi - 10) / 30, 0), 1) : 0;

  return (
    <View style={styles.toolContent}>
      {/* Unit Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, isMetric && styles.toggleBtnActive]}
          onPress={() => setIsMetric(true)}
        >
          <Text style={[styles.toggleText, isMetric && styles.toggleTextActive]}>Metric</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !isMetric && styles.toggleBtnActive]}
          onPress={() => setIsMetric(false)}
        >
          <Text style={[styles.toggleText, !isMetric && styles.toggleTextActive]}>Imperial</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <View style={styles.inputGroup}>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Weight</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.numInput}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.inputUnit}>{isMetric ? 'kg' : 'lbs'}</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Height</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.numInput}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.inputUnit}>{isMetric ? 'cm' : 'in'}</Text>
          </View>
        </View>
      </View>

      {/* Result */}
      {bmi && cat && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Your BMI</Text>
          <Text style={[styles.bmiValue, { color: cat.color }]}>{bmi.toFixed(1)}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: cat.color + '25' }]}>
            <Text style={[styles.categoryText, { color: cat.color }]}>{cat.label}</Text>
          </View>
          {/* Progress bar */}
          <View style={styles.bmiBar}>
            <View style={[styles.bmiBarFill, { width: `${bmiPercent * 100}%`, backgroundColor: cat.color }]} />
          </View>
          <View style={styles.bmiScale}>
            {['Underweight', 'Normal', 'Overweight', 'Obese'].map((l, i) => (
              <Text key={l} style={styles.bmiScaleLabel}>{l}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Reference Table */}
      <View style={styles.refTable}>
        {[
          { range: '< 18.5', label: 'Underweight', color: '#60A5FA' },
          { range: '18.5 – 24.9', label: 'Normal', color: Colors.success },
          { range: '25.0 – 29.9', label: 'Overweight', color: Colors.warning },
          { range: '≥ 30.0', label: 'Obese', color: Colors.error },
        ].map((row) => (
          <View key={row.label} style={styles.refTableRow}>
            <View style={[styles.refDot, { backgroundColor: row.color }]} />
            <Text style={styles.refTableLabel}>{row.label}</Text>
            <Text style={styles.refTableRange}>{row.range}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Stopwatch / Countdown ─────────────────────────────────────────────────
function TimerTool() {
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms
  const [countdown, setCountdown] = useState(60); // seconds
  const [countdownInput, setCountdownInput] = useState('60');
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      elapsedRef.current = elapsed;
    } else {
      startRef.current = Date.now() - elapsedRef.current;
      intervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setElapsed(Date.now() - startRef.current);
        } else {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current!);
              setRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, mode === 'stopwatch' ? 50 : 1000);
      setRunning(true);
    }
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setCountdown(parseInt(countdownInput) || 60);
    setLaps([]);
  };

  const handleLap = () => {
    if (running && mode === 'stopwatch') {
      setLaps((prev) => [elapsed, ...prev]);
    }
  };

  const circumference = 2 * Math.PI * 90;
  const progress = mode === 'stopwatch'
    ? (elapsed % 60000) / 60000
    : countdown / (parseInt(countdownInput) || 60);

  return (
    <View style={styles.toolContent}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'stopwatch' && styles.toggleBtnActive]}
          onPress={() => { setMode('stopwatch'); handleReset(); }}
        >
          <Text style={[styles.toggleText, mode === 'stopwatch' && styles.toggleTextActive]}>Stopwatch</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'countdown' && styles.toggleBtnActive]}
          onPress={() => { setMode('countdown'); handleReset(); }}
        >
          <Text style={[styles.toggleText, mode === 'countdown' && styles.toggleTextActive]}>Countdown</Text>
        </TouchableOpacity>
      </View>

      {mode === 'countdown' && !running && (
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Seconds</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.numInput}
              value={countdownInput}
              onChangeText={(v) => {
                setCountdownInput(v);
                setCountdown(parseInt(v) || 60);
              }}
              keyboardType="numeric"
            />
            <Text style={styles.inputUnit}>sec</Text>
          </View>
        </View>
      )}

      {/* Clock Display */}
      <View style={styles.clockWrapper}>
        <View style={styles.clockDisplay}>
          <Text style={styles.clockText}>
            {mode === 'stopwatch' ? formatTime(elapsed) : formatCountdown(countdown)}
          </Text>
          {mode === 'stopwatch' && (
            <Text style={styles.lapCount}>{laps.length > 0 ? `${laps.length} lap${laps.length > 1 ? 's' : ''}` : ''}</Text>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.timerControls}>
        {mode === 'stopwatch' && (
          <TouchableOpacity
            style={[styles.timerBtn, styles.timerBtnSecondary]}
            onPress={running ? handleLap : handleReset}
          >
            <Text style={styles.timerBtnSecText}>{running ? 'Lap' : 'Reset'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.timerBtn,
            styles.timerBtnPrimary,
            { backgroundColor: running ? '#EF4444' : Colors.success },
          ]}
          onPress={handleStartStop}
        >
          <Ionicons name={running ? 'pause' : 'play'} size={28} color={Colors.white} />
        </TouchableOpacity>
        {mode === 'countdown' && (
          <TouchableOpacity style={[styles.timerBtn, styles.timerBtnSecondary]} onPress={handleReset}>
            <Text style={styles.timerBtnSecText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Laps */}
      {laps.length > 0 && (
        <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
          {laps.map((lap, i) => (
            <View key={i} style={styles.lapRow}>
              <Text style={styles.lapNum}>Lap {laps.length - i}</Text>
              <Text style={styles.lapTime}>{formatTime(lap)}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Currency Converter ────────────────────────────────────────────────────
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.5 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1580 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.1 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.97 },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', rate: 17.2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.6 },
];

function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCur, setFromCur] = useState(CURRENCIES[0]);
  const [toCur, setToCur] = useState(CURRENCIES[4]);
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);

  const convert = () => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '—';
    const inUSD = num / fromCur.rate;
    return (inUSD * toCur.rate).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <View style={styles.toolContent}>
      <View style={styles.currencyCard}>
        {/* From */}
        <View style={styles.curSection}>
          <TouchableOpacity
            style={styles.curSelector}
            onPress={() => setPicking(picking === 'from' ? null : 'from')}
          >
            <Text style={styles.curSymbol}>{fromCur.symbol}</Text>
            <View>
              <Text style={styles.curCode}>{fromCur.code}</Text>
              <Text style={styles.curName}>{fromCur.name}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TextInput
            style={styles.curInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Swap */}
        <TouchableOpacity
          style={styles.curSwapBtn}
          onPress={() => { const t = fromCur; setFromCur(toCur); setToCur(t); }}
        >
          <Ionicons name="swap-vertical" size={18} color={Colors.white} />
        </TouchableOpacity>

        {/* To */}
        <View style={[styles.curSection, { borderTopWidth: 1, borderTopColor: Colors.surfaceBorder }]}>
          <TouchableOpacity
            style={styles.curSelector}
            onPress={() => setPicking(picking === 'to' ? null : 'to')}
          >
            <Text style={styles.curSymbol}>{toCur.symbol}</Text>
            <View>
              <Text style={styles.curCode}>{toCur.code}</Text>
              <Text style={styles.curName}>{toCur.name}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <Text style={[styles.curResult, { color: Colors.accent }]}>{convert()}</Text>
        </View>
      </View>

      {/* Rate info */}
      <Text style={styles.rateInfo}>
        1 {fromCur.code} = {(toCur.rate / fromCur.rate).toFixed(4)} {toCur.code}
      </Text>
      <Text style={styles.rateDisclaimer}>* Indicative rates, not for financial use</Text>

      {/* Currency picker */}
      {picking && (
        <View style={styles.currencyPicker}>
          <Text style={styles.pickerTitle}>Select {picking === 'from' ? 'source' : 'target'} currency</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
            {CURRENCIES.map((cur) => {
              const isSelected = picking === 'from' ? cur.code === fromCur.code : cur.code === toCur.code;
              return (
                <TouchableOpacity
                  key={cur.code}
                  style={[styles.curPickerItem, isSelected && styles.curPickerItemActive]}
                  onPress={() => {
                    if (picking === 'from') setFromCur(cur);
                    else setToCur(cur);
                    setPicking(null);
                  }}
                >
                  <Text style={styles.curPickerSymbol}>{cur.symbol}</Text>
                  <Text style={styles.curPickerCode}>{cur.code}</Text>
                  <Text style={styles.curPickerName}>{cur.name}</Text>
                  {isSelected && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Password Generator ───────────────────────────────────────────────────
function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let chars = '';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) { setPassword('Enable at least one option'); return; }
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
    setCopied(false);
  };

  const strength = (() => {
    let s = 0;
    if (useUpper) s++;
    if (useLower) s++;
    if (useNumbers) s++;
    if (useSymbols) s++;
    if (length >= 12) s++;
    if (length >= 16) s++;
    if (s <= 2) return { label: 'Weak', color: Colors.error, width: '25%' };
    if (s <= 4) return { label: 'Good', color: Colors.warning, width: '60%' };
    return { label: 'Strong', color: Colors.success, width: '100%' };
  })();

  const ToggleRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <TouchableOpacity style={styles.toggleOption} onPress={() => onChange(!value)}>
      <Text style={styles.toggleOptionLabel}>{label}</Text>
      <View style={[styles.toggleSwitch, value && styles.toggleSwitchOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.toolContent}>
      {/* Length */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Length: {length}</Text>
        <View style={styles.lengthControls}>
          <TouchableOpacity
            style={styles.lengthBtn}
            onPress={() => setLength(Math.max(4, length - 1))}
          >
            <Ionicons name="remove" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.lengthValue}>{length}</Text>
          <TouchableOpacity
            style={styles.lengthBtn}
            onPress={() => setLength(Math.min(64, length + 1))}
          >
            <Ionicons name="add" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Options */}
      <ToggleRow label="Uppercase (A-Z)" value={useUpper} onChange={setUseUpper} />
      <ToggleRow label="Lowercase (a-z)" value={useLower} onChange={setUseLower} />
      <ToggleRow label="Numbers (0-9)" value={useNumbers} onChange={setUseNumbers} />
      <ToggleRow label="Symbols (!@#...)" value={useSymbols} onChange={setUseSymbols} />

      <TouchableOpacity style={styles.generateBtn} onPress={generate}>
        <Ionicons name="refresh" size={18} color={Colors.white} />
        <Text style={styles.generateBtnText}>Generate Password</Text>
      </TouchableOpacity>

      {password ? (
        <>
          <View style={styles.passwordDisplay}>
            <Text style={styles.passwordText} selectable>{password}</Text>
          </View>
          {/* Strength */}
          <View style={styles.strengthRow}>
            <Text style={styles.strengthLabel}>Strength: </Text>
            <Text style={[styles.strengthValue, { color: strength.color }]}>{strength.label}</Text>
          </View>
          <View style={styles.strengthBar}>
            <View style={[styles.strengthFill, { width: strength.width as any, backgroundColor: strength.color }]} />
          </View>
        </>
      ) : null}
    </View>
  );
}

// ─── Tools Home ───────────────────────────────────────────────────────────
type ToolItem = {
  id: Tool;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  cardColor: string;
};

const TOOL_LIST: ToolItem[] = [
  { id: 'bmi', title: 'BMI Calculator', subtitle: 'Body Mass Index', icon: 'fitness', color: '#F87171', cardColor: Colors.cardRose },
  { id: 'timer', title: 'Timer', subtitle: 'Stopwatch & countdown', icon: 'timer', color: '#6EE7B7', cardColor: Colors.cardGreen },
  { id: 'currency', title: 'Currency', subtitle: 'Exchange converter', icon: 'cash', color: '#FCD34D', cardColor: Colors.cardAmber },
  { id: 'password', title: 'Password', subtitle: 'Secure generator', icon: 'lock-closed', color: '#A78BFA', cardColor: Colors.cardPurple },
  { id: 'qrcode', title: 'QR Code', subtitle: 'Generate QR codes', icon: 'qr-code', color: '#60A5FA', cardColor: Colors.cardBlue },
  { id: 'color', title: 'Color Picker', subtitle: 'Color tool & palette', icon: 'color-palette', color: '#34D399', cardColor: Colors.cardTeal },
];

export default function ToolsScreen() {
  const [activeTool, setActiveTool] = useState<Tool>('home');

  const activeItem = TOOL_LIST.find((t) => t.id === activeTool);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {activeTool !== 'home' && (
          <TouchableOpacity onPress={() => setActiveTool('home')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.headerTitle}>
            {activeTool === 'home' ? 'More Tools' : activeItem?.title}
          </Text>
          <Text style={styles.headerSub}>
            {activeTool === 'home' ? 'Useful everyday utilities' : activeItem?.subtitle}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTool === 'home' && (
          <View style={styles.toolGrid}>
            {TOOL_LIST.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { backgroundColor: tool.cardColor }]}
                onPress={() => setActiveTool(tool.id)}
                activeOpacity={0.85}
              >
                <View style={styles.toolCardIcon}>
                  <Ionicons name={tool.icon} size={30} color={tool.color} />
                </View>
                <Text style={styles.toolCardTitle}>{tool.title}</Text>
                <Text style={styles.toolCardSub}>{tool.subtitle}</Text>
                <Ionicons
                  name="arrow-forward-circle"
                  size={18}
                  color="rgba(255,255,255,0.3)"
                  style={{ alignSelf: 'flex-end', marginTop: 'auto' }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTool === 'bmi' && <BMICalculator />}
        {activeTool === 'timer' && <TimerTool />}
        {activeTool === 'currency' && <CurrencyConverter />}
        {activeTool === 'password' && <PasswordGenerator />}
        {activeTool === 'qrcode' && <QRCodeTool />}
        {activeTool === 'color' && <ColorPickerTool />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 32,
  },
  toolCard: {
    width: (width - Spacing.md * 2 - Spacing.sm) / 2,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    minHeight: 160,
  },
  toolCardIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  toolCardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  toolCardSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  toolContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 32,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  toggleTextActive: { color: Colors.white, fontWeight: '700' },
  inputGroup: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  inputLabel: { fontSize: FontSize.base, color: Colors.textSecondary, flex: 1 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  numInput: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '600',
    width: 80,
    paddingVertical: 8,
  },
  inputUnit: { fontSize: FontSize.sm, color: Colors.textMuted },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  resultLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  bmiValue: { fontSize: FontSize.display, fontWeight: '200', marginBottom: Spacing.sm },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.full, marginBottom: Spacing.md },
  categoryText: { fontSize: FontSize.sm, fontWeight: '700' },
  bmiBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  bmiBarFill: { height: 8, borderRadius: 4 },
  bmiScale: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  bmiScaleLabel: { fontSize: 8, color: Colors.textMuted },
  refTable: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  refTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  refDot: { width: 10, height: 10, borderRadius: 5 },
  refTableLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textSecondary },
  refTableRange: { fontSize: FontSize.sm, color: Colors.textMuted },
  clockWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  clockDisplay: { alignItems: 'center' },
  clockText: { fontSize: 52, fontWeight: '200', color: Colors.textPrimary, letterSpacing: 2 },
  lapCount: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  timerBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBtnPrimary: { backgroundColor: Colors.success, ...Shadow.md },
  timerBtnSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  timerBtnSecText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600' },
  lapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  lapNum: { fontSize: FontSize.sm, color: Colors.textSecondary },
  lapTime: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '500' },
  currencyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  curSection: { padding: Spacing.md },
  curSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  curSymbol: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, width: 32 },
  curCode: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  curName: { fontSize: FontSize.xs, color: Colors.textSecondary },
  curInput: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingLeft: 42,
  },
  curResult: { fontSize: FontSize.xxl, fontWeight: '700', paddingLeft: 42 },
  curSwapBtn: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  rateInfo: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  rateDisclaimer: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.md },
  currencyPicker: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
  },
  pickerTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  curPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  curPickerItemActive: { backgroundColor: Colors.surfaceLight },
  curPickerSymbol: { width: 28, fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  curPickerCode: { width: 44, fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  curPickerName: { flex: 1, fontSize: FontSize.sm, color: Colors.textMuted },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  toggleOptionLabel: { fontSize: FontSize.base, color: Colors.textPrimary },
  toggleSwitch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surfaceBorder,
    padding: 2,
  },
  toggleSwitchOn: { backgroundColor: Colors.primary },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.textMuted,
  },
  toggleThumbOn: {
    backgroundColor: Colors.white,
    transform: [{ translateX: 20 }],
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  generateBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  passwordDisplay: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    marginBottom: Spacing.sm,
  },
  passwordText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    letterSpacing: 1,
    lineHeight: 22,
  },
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  strengthLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  strengthValue: { fontSize: FontSize.sm, fontWeight: '700' },
  strengthBar: {
    height: 6,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: { height: 6, borderRadius: 3 },
  lengthControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lengthBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  lengthValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, minWidth: 30, textAlign: 'center' },
});
