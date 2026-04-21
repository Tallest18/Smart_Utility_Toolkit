import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

type ConversionCategory = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  units: { id: string; label: string; symbol: string; toBase: number }[];
  baseUnit: string;
};

const CATEGORIES: ConversionCategory[] = [
  {
    id: 'length',
    label: 'Length',
    icon: 'resize',
    color: '#A78BFA',
    baseUnit: 'm',
    units: [
      { id: 'mm', label: 'Millimeter', symbol: 'mm', toBase: 0.001 },
      { id: 'cm', label: 'Centimeter', symbol: 'cm', toBase: 0.01 },
      { id: 'm', label: 'Meter', symbol: 'm', toBase: 1 },
      { id: 'km', label: 'Kilometer', symbol: 'km', toBase: 1000 },
      { id: 'in', label: 'Inch', symbol: 'in', toBase: 0.0254 },
      { id: 'ft', label: 'Foot', symbol: 'ft', toBase: 0.3048 },
      { id: 'yd', label: 'Yard', symbol: 'yd', toBase: 0.9144 },
      { id: 'mi', label: 'Mile', symbol: 'mi', toBase: 1609.344 },
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    icon: 'barbell',
    color: '#34D399',
    baseUnit: 'kg',
    units: [
      { id: 'mg', label: 'Milligram', symbol: 'mg', toBase: 0.000001 },
      { id: 'g', label: 'Gram', symbol: 'g', toBase: 0.001 },
      { id: 'kg', label: 'Kilogram', symbol: 'kg', toBase: 1 },
      { id: 't', label: 'Metric Ton', symbol: 't', toBase: 1000 },
      { id: 'oz', label: 'Ounce', symbol: 'oz', toBase: 0.028349523 },
      { id: 'lb', label: 'Pound', symbol: 'lb', toBase: 0.45359237 },
      { id: 'st', label: 'Stone', symbol: 'st', toBase: 6.35029318 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: 'thermometer',
    color: '#F87171',
    baseUnit: '°C',
    units: [
      { id: 'c', label: 'Celsius', symbol: '°C', toBase: 1 },
      { id: 'f', label: 'Fahrenheit', symbol: '°F', toBase: 1 },
      { id: 'k', label: 'Kelvin', symbol: 'K', toBase: 1 },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    icon: 'speedometer',
    color: '#60A5FA',
    baseUnit: 'm/s',
    units: [
      { id: 'ms', label: 'Meters/sec', symbol: 'm/s', toBase: 1 },
      { id: 'kmh', label: 'Km/hour', symbol: 'km/h', toBase: 0.277778 },
      { id: 'mph', label: 'Miles/hour', symbol: 'mph', toBase: 0.44704 },
      { id: 'kn', label: 'Knot', symbol: 'kn', toBase: 0.514444 },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    icon: 'square',
    color: '#FCD34D',
    baseUnit: 'm²',
    units: [
      { id: 'mm2', label: 'mm²', symbol: 'mm²', toBase: 0.000001 },
      { id: 'cm2', label: 'cm²', symbol: 'cm²', toBase: 0.0001 },
      { id: 'm2', label: 'm²', symbol: 'm²', toBase: 1 },
      { id: 'km2', label: 'km²', symbol: 'km²', toBase: 1000000 },
      { id: 'ft2', label: 'ft²', symbol: 'ft²', toBase: 0.092903 },
      { id: 'ac', label: 'Acre', symbol: 'ac', toBase: 4046.856 },
      { id: 'ha', label: 'Hectare', symbol: 'ha', toBase: 10000 },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    icon: 'beaker',
    color: '#6EE7B7',
    baseUnit: 'L',
    units: [
      { id: 'ml', label: 'Milliliter', symbol: 'mL', toBase: 0.001 },
      { id: 'l', label: 'Liter', symbol: 'L', toBase: 1 },
      { id: 'm3', label: 'Cubic meter', symbol: 'm³', toBase: 1000 },
      { id: 'tsp', label: 'Teaspoon', symbol: 'tsp', toBase: 0.00492892 },
      { id: 'tbsp', label: 'Tablespoon', symbol: 'tbsp', toBase: 0.0147868 },
      { id: 'cup', label: 'Cup', symbol: 'cup', toBase: 0.236588 },
      { id: 'pt', label: 'Pint', symbol: 'pt', toBase: 0.473176 },
      { id: 'gal', label: 'Gallon', symbol: 'gal', toBase: 3.78541 },
    ],
  },
];

function convertTemperature(value: number, from: string, to: string): number {
  let celsius = value;
  if (from === 'f') celsius = (value - 32) * (5 / 9);
  if (from === 'k') celsius = value - 273.15;

  if (to === 'c') return celsius;
  if (to === 'f') return celsius * (9 / 5) + 32;
  if (to === 'k') return celsius + 273.15;
  return celsius;
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1e9) return n.toExponential(4);
  if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(4);
  const fixed = parseFloat(n.toPrecision(8));
  return fixed.toString();
}

export default function ConverterScreen() {
  const { colors } = useTheme();
  const [activeCat, setActiveCat] = useState<ConversionCategory>(CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState(CATEGORIES[0].units[2]);
  const [toUnit, setToUnit] = useState(CATEGORIES[0].units[3]);
  const [inputValue, setInputValue] = useState('1');
  const [selectingFor, setSelectingFor] = useState<'from' | 'to' | null>(null);

  const convertedValue = useCallback(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return '—';
    if (activeCat.id === 'temperature') {
      return formatNumber(convertTemperature(num, fromUnit.id, toUnit.id));
    }
    const inBase = num * fromUnit.toBase;
    return formatNumber(inBase / toUnit.toBase);
  }, [inputValue, fromUnit, toUnit, activeCat]);

  const handleCategoryChange = (cat: ConversionCategory) => {
    setActiveCat(cat);
    setFromUnit(cat.units[0]);
    setToUnit(cat.units[1]);
    setInputValue('1');
    setSelectingFor(null);
  };

  const handleSwap = () => {
    const tmp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tmp);
  };

  const handleSelectUnit = (unit: typeof fromUnit) => {
    if (selectingFor === 'from') setFromUnit(unit);
    else if (selectingFor === 'to') setToUnit(unit);
    setSelectingFor(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Unit Converter</Text>
        <Text style={styles.headerSub}>Convert between different units</Text>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.catPill,
              activeCat.id === cat.id && {
                backgroundColor: cat.color + '25',
                borderColor: cat.color,
              },
            ]}
            onPress={() => handleCategoryChange(cat)}
          >
            <Ionicons
              name={cat.icon}
              size={14}
              color={activeCat.id === cat.id ? cat.color : Colors.textMuted}
            />
            <Text
              style={[
                styles.catLabel,
                activeCat.id === cat.id && { color: cat.color, fontWeight: '700' },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Converter Card */}
        <View style={styles.converterCard}>
          {/* FROM */}
          <View style={styles.inputSection}>
            <View style={styles.unitRow}>
              <Text style={styles.dirLabel}>FROM</Text>
              <TouchableOpacity
                style={[styles.unitSelector, { borderColor: activeCat.color }]}
                onPress={() => setSelectingFor(selectingFor === 'from' ? null : 'from')}
              >
                <Text style={[styles.unitSymbol, { color: activeCat.color }]}>{fromUnit.symbol}</Text>
                <Text style={styles.unitName}>{fromUnit.label}</Text>
                <Ionicons
                  name={selectingFor === 'from' ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.valueInput}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              selectionColor={activeCat.color}
            />
          </View>

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
            <Ionicons name="swap-vertical" size={20} color={Colors.white} />
          </TouchableOpacity>

          {/* TO */}
          <View style={styles.outputSection}>
            <View style={styles.unitRow}>
              <Text style={styles.dirLabel}>TO</Text>
              <TouchableOpacity
                style={[styles.unitSelector, { borderColor: activeCat.color }]}
                onPress={() => setSelectingFor(selectingFor === 'to' ? null : 'to')}
              >
                <Text style={[styles.unitSymbol, { color: activeCat.color }]}>{toUnit.symbol}</Text>
                <Text style={styles.unitName}>{toUnit.label}</Text>
                <Ionicons
                  name={selectingFor === 'to' ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.resultValue, { color: activeCat.color }]}>
              {convertedValue()}
            </Text>
          </View>
        </View>

        {/* Unit Picker Dropdown */}
        {selectingFor && (
          <View style={styles.unitPicker}>
            <Text style={styles.pickerTitle}>
              Select {selectingFor === 'from' ? 'source' : 'target'} unit
            </Text>
            {activeCat.units.map((unit) => {
              const isSelected =
                selectingFor === 'from' ? unit.id === fromUnit.id : unit.id === toUnit.id;
              return (
                <TouchableOpacity
                  key={unit.id}
                  style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                  onPress={() => handleSelectUnit(unit)}
                >
                  <Text
                    style={[
                      styles.pickerItemSymbol,
                      isSelected && { color: activeCat.color },
                    ]}
                  >
                    {unit.symbol}
                  </Text>
                  <Text
                    style={[
                      styles.pickerItemLabel,
                      isSelected && { color: Colors.textPrimary },
                    ]}
                  >
                    {unit.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color={activeCat.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quick Reference Table */}
        <View style={styles.refCard}>
          <Text style={styles.refTitle}>Quick Reference</Text>
          {activeCat.units.slice(0, 5).map((unit) => {
            const num = parseFloat(inputValue) || 1;
            let result = '';
            if (activeCat.id === 'temperature') {
              result = formatNumber(convertTemperature(num, fromUnit.id, unit.id));
            } else {
              const inBase = num * fromUnit.toBase;
              result = formatNumber(inBase / unit.toBase);
            }
            return (
              <View key={unit.id} style={styles.refRow}>
                <Text style={styles.refUnit}>{unit.label}</Text>
                <Text style={[styles.refValue, { color: activeCat.color }]}>
                  {result} {unit.symbol}
                </Text>
              </View>
            );
          })}
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
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  catScroll: {
    marginBottom: Spacing.md,
  },
  catContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    paddingVertical: 4,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  catLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  converterCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  inputSection: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  outputSection: {
    padding: Spacing.md,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dirLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    width: 36,
  },
  unitSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  unitSymbol: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  unitName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  valueInput: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingVertical: 8,
    paddingLeft: 44,
  },
  resultValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    paddingVertical: 8,
    paddingLeft: 44,
  },
  swapBtn: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Shadow.md,
  },
  unitPicker: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  pickerTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  pickerItemActive: {
    backgroundColor: Colors.surfaceLight,
  },
  pickerItemSymbol: {
    width: 40,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pickerItemLabel: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  refCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  refTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  refUnit: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  refValue: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
