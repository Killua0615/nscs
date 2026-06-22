import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext';
import { StatusBadges } from '../components/StatusBadges';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';
import type { StatusCounts, QuizResult } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ResultSummary'>;

export function ResultSummaryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { results, scope, scopeId, isQuiz } = route.params;
  const { getStatusCounts, saveQuizResult, statuses } = useApp();

  const totalCorrect = results.filter((r) => r.answerResult === 'correct').length;
  const totalIncorrect = results.filter((r) => r.answerResult === 'incorrect').length;
  const totalSkipped = results.filter((r) => r.answerResult === 'skipped').length;
  const total = results.length;
  const scoreRate = total > 0 ? totalCorrect / total : 0;

  const counts: StatusCounts = useMemo(() => {
    return getStatusCounts(results.map((r) => r.question.id));
  }, [results, getStatusCounts]);

  // Save quiz result if it's a quiz
  React.useEffect(() => {
    if (isQuiz) {
      const result: QuizResult = {
        id: Date.now().toString(),
        user_id: 'local-user',
        scope: scopeId || scope,
        score_rate: scoreRate,
        total,
        correct: totalCorrect,
        skipped: totalSkipped,
        taken_at: new Date().toISOString(),
      };
      saveQuizResult(result);
    }
  }, []); // Run once on mount

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{isQuiz ? '小テスト結果' : '演習結果'}</Text>
        <Text style={styles.scope}>{scope}</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>正答数</Text>
          <Text style={styles.scoreValue}>
            {totalCorrect} / {total}
          </Text>
          <Text style={styles.scoreRate}>
            正答率: {Math.round(scoreRate * 100)}%
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <View style={[styles.breakdownItem, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.breakdownCount}>{totalCorrect}</Text>
            <Text style={styles.breakdownLabel}>正解</Text>
          </View>
          <View style={[styles.breakdownItem, { backgroundColor: '#FFEBEE' }]}>
            <Text style={styles.breakdownCount}>{totalIncorrect}</Text>
            <Text style={styles.breakdownLabel}>不正解</Text>
          </View>
          <View style={[styles.breakdownItem, { backgroundColor: '#ECEFF1' }]}>
            <Text style={styles.breakdownCount}>{totalSkipped}</Text>
            <Text style={styles.breakdownLabel}>スキップ</Text>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>理解度</Text>
          <StatusBadges counts={counts} />
        </View>

        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() =>
            navigation.replace('Review', { results, scope })
          }
        >
          <Text style={styles.reviewText}>出題された問題を見る</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.homeText}>ホームに戻る</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg, justifyContent: 'center' },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  scope: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  scoreLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: SPACING.sm,
  },
  scoreRate: { fontSize: FONT_SIZES.lg, color: COLORS.text, fontWeight: '600' },
  breakdownRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  breakdownItem: {
    flex: 1,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  breakdownCount: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  breakdownLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  statusSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statusTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  reviewBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '700' },
  homeBtn: {
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  homeText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
});
