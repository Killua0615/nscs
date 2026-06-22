import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusCounts } from '../types';
import { COLORS, FONT_SIZES, SPACING } from '../lib/theme';

interface Props {
  counts: StatusCounts;
  compact?: boolean;
  showPercent?: boolean;
}

export function StatusBadges({ counts, compact, showPercent }: Props) {
  const items: { key: keyof StatusCounts; label: string; color: string }[] = [
    { key: 'perfect', label: '完璧', color: COLORS.perfect },
    { key: 'almost', label: 'やや完璧', color: COLORS.almost },
    { key: 'weak', label: '苦手', color: COLORS.weak },
    { key: 'unlearned', label: '未学習', color: COLORS.unlearned },
  ];

  const total = counts.perfect + counts.almost + counts.weak + counts.unlearned;

  const formatValue = (count: number) => {
    if (!showPercent || total === 0) return `${count}`;
    return `${Math.round((count / total) * 100)}%`;
  };

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.key} style={[styles.badge, compact && styles.badgeCompact]}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          {!compact && <Text style={styles.label}>{item.label}</Text>}
          <Text style={[styles.count, { color: item.color }]}>{formatValue(counts[item.key])}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeCompact: {
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  count: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
