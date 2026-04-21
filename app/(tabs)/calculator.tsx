import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');
const BTN_SIZE = (width - Spacing.md * 2 - Spacing.sm * 3) / 4;

type CalcButton = {
  label: string;
  value: string;
  type: 'number' | 'operator' | 'action' | 'equals' | 'special';
  span?: number;
};

const BUTTONS: CalcButton[][] = [
  [
    { label: 'AC', value: 'clear', type: 'action' },
    { label: '+/-', value: 'negate', type: 'action' },
    { label: '%', value: '%', type: 'operator' },
    { label: '÷', value: '/', type: 'operator' },
  ],
  [
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '×', value: '*', type: 'operator' },
  ],
  [
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '-', value: '-', type: 'operator' },
  ],
  [
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '+', value: '+', type: 'operator' },
  ],
  [
    { label: '0', value: '0', type: 'number', span: 2 },
    { label: '.', value: '.', type: 'number' },
    { label: '=', value: '=', type: 'equals' },
  ],
];

const SCIENTIFIC_BUTTONS: CalcButton[] = [
  { label: 'sin', value: 'sin', type: 'special' },
  { label: 'cos', value: 'cos', type: 'special' },
  { label: 'tan', value: 'tan', type: 'special' },
  { label: '√', value: 'sqrt', type: 'special' },
  { label: 'x²', value: 'sq', type: 'special' },
  { label: 'ln', value: 'ln', type: 'special' },
  { label: 'log', value: 'log', type: 'special' },
  { label: 'π', value: 'pi', type: 'special' },
];

function evaluate(expression: string): string {
  try {
    const result = Function('"use strict"; return (' + expression + ')')();
    if (!isFinite(result)) return 'Error';
    const str = result.toString();
    if (str.includes('.') && str.split('.')[1].length > 10) {
      return parseFloat(result.toFixed(10)).toString();
    }
    return str;
  } catch {
    return 'Error';
  }
}

export default function CalculatorScreen() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showScientific, setShowScientific] = useState(false);

  const handleButton = (btn: CalcButton) => {
    Vibration.vibrate(10);

    if (btn.value === 'clear') {
      setDisplay('0');
      setExpression('');
      setJustEvaluated(false);
      return;
    }

    if (btn.value === 'negate') {
      if (display !== '0') {
        const negated = display.startsWith('-') ? display.slice(1) : '-' + display;
        setDisplay(negated);
      }
      return;
    }

    if (btn.type === 'special') {
      const num = parseFloat(display);
      let result = 0;
      switch (btn.value) {
        case 'sin': result = Math.sin((num * Math.PI) / 180); break;
        case 'cos': result = Math.cos((num * Math.PI) / 180); break;
        case 'tan': result = Math.tan((num * Math.PI) / 180); break;
        case 'sqrt': result = Math.sqrt(num); break;
        case 'sq': result = num * num; break;
        case 'ln': result = Math.log(num); break;
        case 'log': result = Math.log10(num); break;
        case 'pi':
          setDisplay(Math.PI.toFixed(10));
          setExpression(Math.PI.toString());
          setJustEvaluated(true);
          return;
        default: result = num;
      }
      const res = isFinite(result) ? parseFloat(result.toFixed(10)).toString() : 'Error';
      setDisplay(res);
      setExpression(res);
      setJustEvaluated(true);
      return;
    }

    if (btn.value === '=') {
      if (!expression) return;
      const fullExpr = expression + (justEvaluated ? '' : display);
      const result = evaluate(fullExpr);
      setHistory((prev) => [`${fullExpr} = ${result}`, ...prev.slice(0, 9)]);
      setDisplay(result);
      setExpression('');
      setJustEvaluated(true);
      return;
    }

    if (['+', '-', '*', '/'].includes(btn.value)) {
      const newExpr = (justEvaluated ? display : expression + display) + btn.value;
      setExpression(newExpr);
      setDisplay('0');
      setJustEvaluated(false);
      return;
    }

    if (btn.value === '%') {
      const num = parseFloat(display);
      setDisplay((num / 100).toString());
      return;
    }

    // Number / dot
    if (justEvaluated && btn.type === 'number') {
      setDisplay(btn.value === '.' ? '0.' : btn.value);
      setExpression('');
      setJustEvaluated(false);
      return;
    }

    if (btn.value === '.') {
      if (!display.includes('.')) {
        setDisplay(display + '.');
      }
      return;
    }

    if (display === '0') {
      setDisplay(btn.value);
    } else {
      if (display.length < 12) {
        setDisplay(display + btn.value);
      }
    }
    setJustEvaluated(false);
  };

  const getBtnStyle = (btn: CalcButton) => {
    if (btn.type === 'equals') return [styles.btn, styles.btnEquals];
    if (btn.type === 'operator') return [styles.btn, styles.btnOperator];
    if (btn.type === 'action') return [styles.btn, styles.btnAction];
    if (btn.type === 'special') return [styles.btn, styles.btnSpecial];
    return [styles.btn, styles.btnNumber];
  };

  const getBtnTextStyle = (btn: CalcButton) => {
    if (btn.type === 'equals') return [styles.btnText, styles.btnTextEquals];
    if (btn.type === 'operator') return [styles.btnText, styles.btnTextOperator];
    if (btn.type === 'action') return [styles.btnText, styles.btnTextAction];
    if (btn.type === 'special') return [styles.btnText, styles.btnTextSpecial];
    return [styles.btnText, styles.btnTextNumber];
  };

  const displayFontSize =
    display.length > 10 ? FontSize.xl : display.length > 7 ? FontSize.xxl : FontSize.display;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calculator</Text>
        <TouchableOpacity
          style={[styles.sciBtn, showScientific && styles.sciBtnActive]}
          onPress={() => setShowScientific(!showScientific)}
        >
          <Text style={[styles.sciBtnText, showScientific && { color: Colors.primary }]}>
            Scientific
          </Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      {history.length > 0 && (
        <ScrollView
          style={styles.historyScroll}
          contentContainerStyle={styles.historyContent}
          showsVerticalScrollIndicator={false}
        >
          {history.map((h, i) => (
            <Text key={i} style={styles.historyItem}>
              {h}
            </Text>
          ))}
        </ScrollView>
      )}

      {/* Display */}
      <View style={styles.display}>
        <Text style={styles.expressionText} numberOfLines={1}>
          {expression}
        </Text>
        <Text
          style={[styles.displayText, { fontSize: displayFontSize }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {display}
        </Text>
      </View>

      {/* Scientific Row */}
      {showScientific && (
        <View style={styles.sciRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SCIENTIFIC_BUTTONS.map((btn) => (
              <TouchableOpacity
                key={btn.value}
                style={styles.sciButton}
                onPress={() => handleButton(btn)}
              >
                <Text style={styles.sciButtonText}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.pad}>
        {BUTTONS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn.value}
                style={[
                  ...getBtnStyle(btn),
                  btn.span === 2 && { width: BTN_SIZE * 2 + Spacing.sm },
                ]}
                onPress={() => handleButton(btn)}
                activeOpacity={0.75}
              >
                <Text style={getBtnTextStyle(btn)}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sciBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  sciBtnActive: {
    backgroundColor: Colors.primaryLight + '20',
    borderColor: Colors.primary,
  },
  sciBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  historyScroll: {
    maxHeight: 60,
    paddingHorizontal: Spacing.md,
  },
  historyContent: {
    paddingBottom: 4,
  },
  historyItem: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    paddingVertical: 1,
  },
  display: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  expressionText: {
    fontSize: FontSize.base,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  displayText: {
    fontWeight: '200',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  sciRow: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sciButton: {
    width: 56,
    height: 40,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sciButtonText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  pad: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnNumber: {
    backgroundColor: Colors.surfaceLight,
  },
  btnOperator: {
    backgroundColor: Colors.primary + 'CC',
  },
  btnAction: {
    backgroundColor: Colors.surfaceBorder,
  },
  btnEquals: {
    backgroundColor: Colors.primary,
  },
  btnSpecial: {
    backgroundColor: Colors.cardPurple,
  },
  btnText: {
    fontSize: FontSize.lg,
    fontWeight: '400',
  },
  btnTextNumber: {
    color: Colors.textPrimary,
    fontWeight: '300',
    fontSize: FontSize.xl,
  },
  btnTextOperator: {
    color: Colors.white,
    fontSize: FontSize.xl,
  },
  btnTextAction: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  btnTextEquals: {
    color: Colors.white,
    fontSize: FontSize.xl,
  },
  btnTextSpecial: {
    color: '#A78BFA',
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
