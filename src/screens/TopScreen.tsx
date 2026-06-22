import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext';
import { SUBJECTS, getQuestionsBySubject, getAllQuestions } from '../lib/questionData';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';
import { StatusBadges } from '../components/StatusBadges';
import { CircularProgress } from '../components/CircularProgress';
import { QuestionSettingsModal } from '../components/QuestionSettingsModal';
import type { RootStackParamList } from '../navigation/types';
import type { StatusType } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function TopScreen() {
  const navigation = useNavigation<Nav>();
  const { settings, saveExamDate, getStatusCounts, quizResults } = useApp();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const daysUntilExam = useMemo(() => {
    if (!settings?.exam_date) return null;
    const diff = new Date(settings.exam_date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [settings?.exam_date]);

  const latestQuizByScope = useMemo(() => {
    const map: Record<string, { score_rate: number }> = {};
    for (const r of quizResults) {
      if (!map[r.scope] || new Date(r.taken_at) > new Date(map[r.scope] as any)) {
        map[r.scope] = { score_rate: r.score_rate };
      }
    }
    return map;
  }, [quizResults]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.appTitle}>NSCA-CPT 試験対策</Text>

        {/* Countdown */}
        <View style={styles.card}>
          {daysUntilExam !== null ? (
            <View style={styles.countdownRow}>
              <Text style={styles.countdownText}>
                試験まであと <Text style={styles.countdownNumber}>{daysUntilExam}</Text> 日
              </Text>
              <TouchableOpacity onPress={() => saveExamDate(null)}>
                <Text style={styles.clearBtn}>クリア</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.setDateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.setDateText}>試験日を設定する</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date picker modal */}
        {Platform.OS === 'ios' ? (
          <Modal visible={showDatePicker} transparent animationType="fade">
            <View style={styles.dateModalOverlay}>
              <View style={styles.dateModalCenter}>
                <Text style={styles.dateModalTitle}>日付の選択</Text>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="inline"
                  locale="ja"
                  minimumDate={new Date()}
                  themeVariant="light"
                  onChange={(_, date) => { if (date) setTempDate(date); }}
                  style={{ height: 350 }}
                />
                <View style={styles.dateModalActions}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.cancelDateText}>キャンセル</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const yyyy = tempDate.getFullYear();
                      const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(tempDate.getDate()).padStart(2, '0');
                      saveExamDate(`${yyyy}-${mm}-${dd}`);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.confirmDateText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                  const dd = String(date.getDate()).padStart(2, '0');
                  saveExamDate(`${yyyy}-${mm}-${dd}`);
                }
              }}
            />
          )
        )}

        {/* Challenge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>さっそく問題にチャレンジする</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
            {SUBJECTS.map((subject) => {
              const questions = getQuestionsBySubject(subject.id);
              const counts = getStatusCounts(questions.map((q) => q.id));
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.subjectCard}
                  onPress={() => setSelectedSubject(subject.id)}
                >
                  <Text style={styles.subjectCardTitle} numberOfLines={2}>
                    {subject.name}
                  </Text>
                  <Text style={styles.subjectCardCount}>{questions.length}問</Text>
                  <StatusBadges counts={counts} compact />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quiz */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>小テストで腕試しする</Text>
          {[{ id: 'all', name: '全問' }, ...SUBJECTS].map((item) => {
            const latest = latestQuizByScope[item.id];
            const rate = latest ? Math.round(latest.score_rate * 100) : 0;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.quizCard}
                onPress={() => navigation.navigate('QuizSetup', { scope: item.id })}
              >
                <Text style={styles.quizCardTitle}>{item.name}</Text>
                <View style={styles.quizCardRight}>
                  <Text style={styles.quizCardRateLabel}>前回の{'\n'}正答率</Text>
                  <CircularProgress percent={rate} size={60} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedSubject && (
        <QuestionSettingsModal
          visible={true}
          onClose={() => setSelectedSubject(null)}
          title={SUBJECTS.find((s) => s.id === selectedSubject)?.name || ''}
          totalQuestions={getQuestionsBySubject(selectedSubject).length}
          counts={getStatusCounts(getQuestionsBySubject(selectedSubject).map((q) => q.id))}
          onStart={(filter, count) => {
            setSelectedSubject(null);
            navigation.navigate('Exercise', {
              sourceType: 'subject',
              sourceId: selectedSubject,
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
  content: { padding: SPACING.md },
  appTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
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
  countdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countdownText: { fontSize: FONT_SIZES.lg, color: COLORS.text },
  countdownNumber: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.primary },
  clearBtn: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  setDateBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  setDateText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  dateModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: SPACING.lg,
  },
  dateModalCenter: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    width: '100%',
    maxWidth: 360,
  },
  dateModalTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  dateModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  cancelDateText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
  confirmDateText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '600' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  cardScroll: { marginHorizontal: -SPACING.md, paddingHorizontal: SPACING.md },
  subjectCard: {
    width: 160,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  subjectCardTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  subjectCardCount: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  quizCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  quizCardTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, flex: 1 },
  quizCardRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  quizCardRateLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 16 },
});
