import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import { StatusButtons } from '../components/StatusButtons';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';
import { CATEGORIES } from '../lib/questionData';
import type { RootStackParamList } from '../navigation/types';
import type { AnswerResult, SessionQuestion, StatusType } from '../types';

type Route = RouteProp<RootStackParamList, 'Review'>;

type FilterType = 'all' | 'correct' | 'incorrect' | 'skipped';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'correct', label: '正解' },
  { value: 'incorrect', label: '不正解' },
  { value: 'skipped', label: 'スキップ' },
];

export function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { results, scope } = route.params;
  const { statuses, setManualStatus } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') return results;
    return results.filter((r) => r.answerResult === activeFilter);
  }, [results, activeFilter]);

  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || '';
  };

  const getBadgeStyle = (result: AnswerResult | undefined) => {
    switch (result) {
      case 'correct': return { bg: '#E8F5E9', text: COLORS.correct, label: '正解' };
      case 'incorrect': return { bg: '#FFEBEE', text: COLORS.incorrect, label: '不正解' };
      case 'skipped': return { bg: '#ECEFF1', text: COLORS.skip, label: 'スキップ' };
      default: return { bg: '#ECEFF1', text: COLORS.textSecondary, label: '未挑戦' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>振り返り</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, activeFilter === f.value && styles.filterActive]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text
              style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredResults.map((item, index) => {
          const badge = getBadgeStyle(item.answerResult);
          const status = statuses[item.question.id];
          const accuracy = status
            ? status.total_attempts > 0
              ? Math.round((status.total_correct / status.total_attempts) * 100)
              : 0
            : 0;
          const attempts = status?.total_attempts || 0;
          const correct = status?.total_correct || 0;
          const isExpanded = expandedId === item.question.id;

          return (
            <View key={item.question.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                </View>
                <Text style={styles.accuracy}>
                  正答率: {accuracy}%（{correct}/{attempts}問中）
                </Text>
              </View>

              <Text style={styles.categoryLabel}>{getCategoryName(item.question.category_id)}</Text>
              <Text style={styles.questionBody} numberOfLines={isExpanded ? undefined : 2}>
                {item.question.body}
              </Text>

              <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item.question.id)}>
                <Text style={styles.toggleBtn}>
                  {isExpanded ? '閉じる' : '解答文をみる'}
                </Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  {item.question.choices.map((c) => (
                    <Text
                      key={c.label}
                      style={[
                        styles.reviewChoice,
                        c.label === item.question.correct_choice && styles.correctChoice,
                        c.label === item.selectedChoice && c.label !== item.question.correct_choice && styles.wrongChoice,
                      ]}
                    >
                      {c.label}. {c.text}
                    </Text>
                  ))}
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>{item.question.explanation}</Text>
                  </View>
                </View>
              )}

              <StatusButtons
                currentStatus={status?.status}
                onSelect={(s: StatusType) => setManualStatus(item.question.id, s)}
                includeUnlearned
              />
            </View>
          );
        })}

        {filteredResults.length === 0 && (
          <Text style={styles.emptyText}>該当する問題がありません</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { fontSize: FONT_SIZES.md, color: COLORS.primary },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  filterRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.textLight, fontWeight: '600' },
  content: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  accuracy: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  categoryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primaryLight,
    marginBottom: SPACING.xs,
  },
  questionBody: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  toggleBtn: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  expandedContent: { marginBottom: SPACING.sm },
  reviewChoice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
    marginBottom: 2,
  },
  correctChoice: { backgroundColor: '#E8F5E9', color: COLORS.correct, fontWeight: '600' },
  wrongChoice: { backgroundColor: '#FFEBEE', color: COLORS.incorrect },
  explanationBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  explanationText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
  },
});
