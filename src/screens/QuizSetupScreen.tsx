import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext';
import { SUBJECTS, getQuestionsBySubject, getAllQuestions } from '../lib/questionData';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';
import type { StatusType } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'QuizSetup'>;

type FilterOption = StatusType | 'all';

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'すべての問題' },
  { value: 'perfect', label: '完璧な問題のみ' },
  { value: 'almost', label: 'やや完璧な問題のみ' },
  { value: 'weak', label: '苦手な問題のみ' },
  { value: 'unlearned', label: '未学習の問題のみ' },
];

const COUNT_OPTIONS = [10, 20, 50];

export function QuizSetupScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { scope } = route.params;
  const { getStatusCounts } = useApp();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [count, setCount] = useState<number | 'all'>(10);

  const questions = useMemo(() => {
    if (scope === 'all') return getAllQuestions();
    return getQuestionsBySubject(scope);
  }, [scope]);

  const counts = useMemo(() => getStatusCounts(questions.map((q) => q.id)), [questions]);

  const scopeName = scope === 'all'
    ? '全分野'
    : SUBJECTS.find((s) => s.id === scope)?.name || '';

  const availableCount = filter === 'all'
    ? questions.length
    : counts[filter as StatusType] || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>小テスト設定</Text>
        <Text style={styles.scope}>{scopeName}</Text>

        <Text style={styles.sectionLabel}>出題範囲</Text>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterOption, filter === opt.value && styles.filterOptionActive]}
            onPress={() => setFilter(opt.value)}
          >
            <Text style={[styles.filterText, filter === opt.value && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>出題数（{availableCount}問中）</Text>
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

        <TouchableOpacity
          style={[styles.startBtn, availableCount === 0 && styles.disabledBtn]}
          disabled={availableCount === 0}
          onPress={() => {
            navigation.replace('Exercise', {
              sourceType: scope === 'all' ? 'all' : 'subject',
              sourceId: scope,
              filter,
              count: count === 'all' ? undefined : count,
              isQuiz: true,
            });
          }}
        >
          <Text style={styles.startText}>テスト開始</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>キャンセル</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingTop: SPACING.xl },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  scope: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  countRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    marginBottom: SPACING.xl,
  },
  countBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    minWidth: 70,
  },
  countBtnActive: { backgroundColor: COLORS.primary },
  countText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  countTextActive: { color: COLORS.textLight, fontWeight: '700' },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  disabledBtn: { opacity: 0.4 },
  startText: { color: COLORS.textLight, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  cancelBtn: {
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
});
