import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusType, StatusCounts } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onStart: (filter: StatusType | 'all' | 'exclude_perfect', count: number | 'all') => void;
  title: string;
  totalQuestions: number;
  counts: StatusCounts;
}

type FilterOption = StatusType | 'all' | 'exclude_perfect';

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'exclude_perfect', label: '完璧以外の問題' },
  { value: 'all', label: 'すべての問題' },
  { value: 'perfect', label: '完璧な問題のみ' },
  { value: 'almost', label: 'やや完璧な問題のみ' },
  { value: 'weak', label: '苦手な問題のみ' },
  { value: 'unlearned', label: '未学習の問題のみ' },
];

const COUNT_OPTIONS = [10, 20, 50];

export function QuestionSettingsModal({ visible, onClose, onStart, title, totalQuestions, counts }: Props) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [count, setCount] = useState<number | 'all'>('all');

  const availableCount = filter === 'all'
    ? totalQuestions
    : filter === 'exclude_perfect'
    ? totalQuestions - (counts.perfect || 0)
    : counts[filter as StatusType] || 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.sectionLabel}>出題範囲</Text>
          <ScrollView style={styles.options}>
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, filter === opt.value && styles.optionActive]}
                onPress={() => setFilter(opt.value)}
              >
                <Text style={[styles.optionText, filter === opt.value && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>出題数（{availableCount}問中）</Text>
          <View style={styles.countRow}>
            {COUNT_OPTIONS.filter((n) => n <= availableCount).map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.countBtn, count === n && styles.countBtnActive]}
                onPress={() => setCount(n)}
              >
                <Text style={[styles.countText, count === n && styles.countTextActive]}>
                  {n}問
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.countBtn, count === 'all' && styles.countBtnActive]}
              onPress={() => setCount('all')}
            >
              <Text style={[styles.countText, count === 'all' && styles.countTextActive]}>
                全問
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.startBtn, availableCount === 0 && styles.disabledBtn]}
              onPress={() => availableCount > 0 && onStart(filter, count)}
              disabled={availableCount === 0}
            >
              <Text style={styles.startText}>開始</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  options: {
    maxHeight: 200,
  },
  option: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  optionActive: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  optionTextActive: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  countRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  countBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    minWidth: 60,
    alignItems: 'center',
  },
  countBtnActive: {
    backgroundColor: COLORS.primary,
  },
  countText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  countTextActive: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  startBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  startText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: '700',
  },
});
