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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext';
import {
  SUBJECTS,
  getCategoriesBySubject,
  getQuestionsByCategory,
  getQuestionsBySubject,
} from '../lib/questionData';
import { StatusBadges } from '../components/StatusBadges';
import { QuestionSettingsModal } from '../components/QuestionSettingsModal';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';
import type { StatusType } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { getStatusCounts } = useApp();
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [modalTarget, setModalTarget] = useState<{
    type: 'subject' | 'category';
    id: string;
    name: string;
  } | null>(null);

  const activeSubject = SUBJECTS[activeSubjectIndex];
  const categories = useMemo(
    () => getCategoriesBySubject(activeSubject.id),
    [activeSubject.id]
  );

  const subjectQuestions = useMemo(
    () => getQuestionsBySubject(activeSubject.id),
    [activeSubject.id]
  );

  const subjectCounts = useMemo(
    () => getStatusCounts(subjectQuestions.map((q) => q.id)),
    [subjectQuestions, getStatusCounts]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>問題演習</Text>

      {/* Subject tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {SUBJECTS.map((subject, index) => (
          <TouchableOpacity
            key={subject.id}
            style={[styles.tab, index === activeSubjectIndex && styles.tabActive]}
            onPress={() => setActiveSubjectIndex(index)}
          >
            <Text
              style={[styles.tabText, index === activeSubjectIndex && styles.tabTextActive]}
              numberOfLines={1}
            >
              {subject.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* All questions row */}
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            setModalTarget({ type: 'subject', id: activeSubject.id, name: activeSubject.name })
          }
        >
          <Text style={styles.rowTitle}>全問</Text>
          <Text style={styles.rowCount}>{subjectQuestions.length}問</Text>
          <StatusBadges counts={subjectCounts} />
        </TouchableOpacity>

        {/* Category rows */}
        {categories.map((cat) => {
          const questions = getQuestionsByCategory(cat.id);
          const counts = getStatusCounts(questions.map((q) => q.id));
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.row}
              onPress={() =>
                setModalTarget({ type: 'category', id: cat.id, name: cat.name })
              }
            >
              <Text style={styles.rowTitle}>{cat.name}</Text>
              <Text style={styles.rowCount}>{questions.length}問</Text>
              <StatusBadges counts={counts} />
            </TouchableOpacity>
          );
        })}

        {subjectQuestions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>問題データがまだ登録されていません</Text>
            <Text style={styles.emptySubText}>問題データを追加すると、ここに表示されます</Text>
          </View>
        )}
      </ScrollView>

      {modalTarget && (
        <QuestionSettingsModal
          visible={true}
          onClose={() => setModalTarget(null)}
          title={modalTarget.name}
          totalQuestions={
            modalTarget.type === 'subject'
              ? subjectQuestions.length
              : getQuestionsByCategory(modalTarget.id).length
          }
          counts={
            modalTarget.type === 'subject'
              ? subjectCounts
              : getStatusCounts(
                  getQuestionsByCategory(modalTarget.id).map((q) => q.id)
                )
          }
          onStart={(filter, count) => {
            setModalTarget(null);
            navigation.navigate('Exercise', {
              sourceType: modalTarget.type,
              sourceId: modalTarget.id,
              filter,
              count: count === 'all' ? undefined : count,
            });
          }}
        />
      )}
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
  tabs: {
    flexGrow: 0,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.md,
  },
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  rowTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  rowCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.unlearned,
  },
});
