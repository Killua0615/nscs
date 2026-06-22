import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext';
import { SUBJECTS, getQuestionsBySubject, getAllQuestions } from '../lib/questionData';
import { StatusBadges } from '../components/StatusBadges';
import { CircularProgress } from '../components/CircularProgress';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function QuizScreen() {
  const navigation = useNavigation<Nav>();
  const { getStatusCounts, quizResults } = useApp();

  const allQuestions = useMemo(() => getAllQuestions(), []);
  const allCounts = getStatusCounts(allQuestions.map((q) => q.id));

  const getLatestResult = (scope: string) => {
    return quizResults
      .filter((r) => r.scope === scope)
      .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime())[0];
  };

  const renderCard = (scope: string, title: string, questionCount: number, counts: ReturnType<typeof getStatusCounts>) => {
    const latest = getLatestResult(scope);
    return (
      <TouchableOpacity
        key={scope}
        style={styles.card}
        onPress={() => navigation.navigate('QuizSetup', { scope })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardCount}>{questionCount}問</Text>
        </View>

        {latest ? (
          <View style={styles.resultRow}>
            <CircularProgress percent={Math.round(latest.score_rate * 100)} size={60} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultLabel}>前回の結果</Text>
              <Text style={styles.resultDetail}>
                {latest.correct}/{latest.total} 正解
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noResult}>まだテストを受けていません</Text>
        )}

        <StatusBadges counts={counts} showPercent />

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('QuizSetup', { scope })}
        >
          <Text style={styles.startText}>テストを受ける</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>小テスト</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {renderCard('all', '全分野', allQuestions.length, allCounts)}
        {SUBJECTS.map((subject) => {
          const questions = getQuestionsBySubject(subject.id);
          const counts = getStatusCounts(questions.map((q) => q.id));
          return renderCard(subject.id, subject.name, questions.length, counts);
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  screenTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  content: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  cardCount: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resultInfo: { marginLeft: SPACING.md },
  resultLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  resultDetail: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '600' },
  noResult: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  startText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
