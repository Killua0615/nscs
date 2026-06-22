import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext';
import {
  getQuestionsBySubject,
  getQuestionsByCategory,
  getAllQuestions,
  SUBJECTS,
  CATEGORIES,
} from '../lib/questionData';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';
import { getNoteForQuestion } from '../lib/categoryNotes';
import { StatusButtons } from '../components/StatusButtons';
import type { RootStackParamList } from '../navigation/types';
import type { Question, StatusType, SessionQuestion, AnswerResult } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Exercise'>;

export function ExerciseScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sourceType, sourceId, filter, count, isQuiz } = route.params;
  const { statuses, updateAfterAnswer, setManualStatus } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [sessionResults, setSessionResults] = useState<SessionQuestion[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const [initialStatuses] = useState(() => statuses);

  const questions = useMemo(() => {
    let qs: Question[];
    if (sourceType === 'subject') {
      qs = getQuestionsBySubject(sourceId);
    } else if (sourceType === 'category') {
      qs = getQuestionsByCategory(sourceId);
    } else {
      qs = getAllQuestions();
    }

    // Filter by status (use snapshot from session start)
    if (filter === 'exclude_perfect') {
      qs = qs.filter((q) => {
        const s = initialStatuses[q.id];
        return !s || s.status !== 'perfect';
      });
    } else if (filter && filter !== 'all') {
      qs = qs.filter((q) => {
        const s = initialStatuses[q.id];
        if (filter === 'unlearned') return !s;
        return s?.status === filter;
      });
    }

    // Shuffle for quiz mode only
    if (isQuiz) {
      qs = [...qs].sort(() => Math.random() - 0.5);
    }

    // Limit count
    if (count && count < qs.length) {
      qs = qs.slice(0, count);
    }

    return qs;
  }, [sourceType, sourceId, filter, count, isQuiz, initialStatuses]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const scopeName = useMemo(() => {
    if (sourceType === 'subject') {
      return SUBJECTS.find((s) => s.id === sourceId)?.name || '';
    }
    if (sourceType === 'category') {
      return CATEGORIES.find((c) => c.id === sourceId)?.name || '';
    }
    return '全分野';
  }, [sourceType, sourceId]);

  const handleAnswer = useCallback(async () => {
    if (!currentQuestion || !selectedChoice) return;

    const isCorrect = selectedChoice === currentQuestion.correct_choice;
    await updateAfterAnswer(currentQuestion.id, isCorrect);
    setIsAnswered(true);

    const result: AnswerResult = isCorrect ? 'correct' : 'incorrect';
    setSessionResults((prev) => [
      ...prev,
      {
        question: currentQuestion,
        status: statuses[currentQuestion.id],
        answerResult: result,
        selectedChoice,
      },
    ]);
  }, [currentQuestion, selectedChoice, updateAfterAnswer, statuses]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion) return;
    setSessionResults((prev) => [
      ...prev,
      {
        question: currentQuestion,
        status: statuses[currentQuestion.id],
        answerResult: 'skipped',
      },
    ]);
    moveNext();
  }, [currentQuestion, statuses]);

  const moveNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      // Session complete
      const results = [...sessionResults];
      if (isAnswered && currentQuestion) {
        // Already added in handleAnswer
      }
      navigation.replace('ResultSummary', {
        results: sessionResults,
        scope: scopeName,
        scopeId: sourceType === 'all' ? 'all' : sourceId,
        isQuiz: isQuiz || false,
      });
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedChoice(null);
    setIsAnswered(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex, totalQuestions, sessionResults, navigation, scopeName, isQuiz, currentQuestion, isAnswered]);

  const handleManualStatus = useCallback(
    async (status: StatusType) => {
      if (!currentQuestion) return;
      await setManualStatus(currentQuestion.id, status);
    },
    [currentQuestion, setManualStatus]
  );

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対象の問題がありません</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCorrect = selectedChoice === currentQuestion.correct_choice;
  const currentStatus = statuses[currentQuestion.id];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowReport(true)}>
          <Text style={styles.reportBtn}>誤りを通報</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {scopeName} ({currentIndex + 1}/{totalQuestions})
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        {!isAnswered ? (
          <>
            {/* Question */}
            <Text style={styles.questionBody}>{currentQuestion.body}</Text>

            {/* Choices */}
            {currentQuestion.choices.map((choice) => (
              <TouchableOpacity
                key={choice.label}
                style={[
                  styles.choiceBtn,
                  selectedChoice === choice.label && styles.choiceSelected,
                ]}
                onPress={() => setSelectedChoice(choice.label)}
              >
                <Text style={styles.choiceLabel}>{choice.label}.</Text>
                <Text style={styles.choiceText}>{choice.text}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>スキップ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerBtn, !selectedChoice && styles.disabledBtn]}
                onPress={handleAnswer}
                disabled={!selectedChoice}
              >
                <Text style={styles.answerText}>解答する</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Result */}
            <View style={[styles.resultBanner, isCorrect ? styles.correctBanner : styles.incorrectBanner]}>
              <Text style={styles.resultText}>{isCorrect ? '正解' : '不正解'}</Text>
            </View>

            <View style={styles.answerComparison}>
              <Text style={styles.answerLabel}>
                答え: {currentQuestion.correct_choice}.{' '}
                {currentQuestion.choices.find((c) => c.label === currentQuestion.correct_choice)?.text}
              </Text>
              <Text style={styles.yourAnswer}>
                あなたの解答: {selectedChoice}.{' '}
                {currentQuestion.choices.find((c) => c.label === selectedChoice)?.text}
              </Text>
            </View>

            {/* Explanation */}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>

            {/* Reference note */}
            {getNoteForQuestion(currentQuestion.id) && (
              <View style={styles.noteBox}>
                <Text style={styles.noteTitle}>参考</Text>
                <Text style={styles.noteText}>{getNoteForQuestion(currentQuestion.id)}</Text>
              </View>
            )}

            {/* Manual status */}
            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>理解度を変更</Text>
              <StatusButtons
                currentStatus={currentStatus?.status}
                onSelect={handleManualStatus}
              />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.nextBtn} onPress={moveNext}>
                <Text style={styles.nextText}>
                  {currentIndex + 1 >= totalQuestions ? '結果を見る' : '次へ'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Report modal */}
      <Modal visible={showReport} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.reportTitle}>誤りを通報</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="問題・解説の誤りの内容を入力"
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            <View style={styles.reportActions}>
              <TouchableOpacity
                onPress={() => { setShowReport(false); setReportReason(''); }}
              >
                <Text style={styles.reportCancel}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Save report to storage/supabase
                  Alert.alert('送信完了', '通報を受け付けました');
                  setShowReport(false);
                  setReportReason('');
                }}
              >
                <Text style={styles.reportSubmit}>送信</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  reportBtn: { fontSize: FONT_SIZES.sm, color: COLORS.accent },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  closeBtn: { fontSize: FONT_SIZES.lg, color: COLORS.textSecondary },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  questionBody: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: SPACING.lg,
  },
  choiceBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  choiceSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  choiceLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.sm,
    minWidth: 20,
  },
  choiceText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  skipText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  answerBtn: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  disabledBtn: { opacity: 0.4 },
  answerText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, fontWeight: '700' },
  resultBanner: {
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  correctBanner: { backgroundColor: '#E8F5E9' },
  incorrectBanner: { backgroundColor: '#FFEBEE' },
  resultText: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  answerComparison: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  answerLabel: { fontSize: FONT_SIZES.md, color: COLORS.correct, fontWeight: '600', marginBottom: SPACING.xs },
  yourAnswer: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  explanationBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  explanationText: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 24 },
  noteBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
  },
  noteTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
  noteText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },
  sourceText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  statusSection: { marginTop: SPACING.lg, marginBottom: SPACING.md },
  statusLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  nextBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  nextText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.md },
  backLink: { fontSize: FONT_SIZES.md, color: COLORS.primary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  reportModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  reportTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  reportInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  reportCancel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  reportSubmit: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
});
