import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserQuestionStatus, QuizResult, UserSettings, StatusType } from '../types';
import { calculateStatus } from './statusCalculator';

const KEYS = {
  QUESTION_STATUS: 'user_question_status',
  QUIZ_RESULTS: 'quiz_results',
  USER_SETTINGS: 'user_settings',
};

// Question Status
export async function getAllQuestionStatuses(): Promise<Record<string, UserQuestionStatus>> {
  const raw = await AsyncStorage.getItem(KEYS.QUESTION_STATUS);
  return raw ? JSON.parse(raw) : {};
}

export async function getQuestionStatus(questionId: string): Promise<UserQuestionStatus | undefined> {
  const all = await getAllQuestionStatuses();
  return all[questionId];
}

export async function saveQuestionStatus(questionId: string, status: UserQuestionStatus): Promise<void> {
  const all = await getAllQuestionStatuses();
  all[questionId] = status;
  await AsyncStorage.setItem(KEYS.QUESTION_STATUS, JSON.stringify(all));
}

export async function updateAfterAnswer(
  questionId: string,
  isCorrect: boolean,
  userId: string
): Promise<UserQuestionStatus> {
  const current = await getQuestionStatus(questionId);
  const prevStreak = current?.correct_streak ?? 0;
  const prevAttempts = current?.total_attempts ?? 0;
  const prevCorrect = current?.total_correct ?? 0;

  const newStreak = isCorrect ? prevStreak + 1 : 0;
  const newAttempts = prevAttempts + 1;
  const newCorrect = isCorrect ? prevCorrect + 1 : prevCorrect;
  const newStatus = calculateStatus(newStreak, newAttempts);

  const updated: UserQuestionStatus = {
    user_id: userId,
    question_id: questionId,
    correct_streak: newStreak,
    total_attempts: newAttempts,
    total_correct: newCorrect,
    status: newStatus,
    manual_override: false,
    last_answered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveQuestionStatus(questionId, updated);
  return updated;
}

export async function setManualStatus(
  questionId: string,
  status: StatusType,
  userId: string
): Promise<UserQuestionStatus> {
  const current = await getQuestionStatus(questionId);
  const updated: UserQuestionStatus = {
    user_id: userId,
    question_id: questionId,
    correct_streak: current?.correct_streak ?? 0,
    total_attempts: current?.total_attempts ?? 0,
    total_correct: current?.total_correct ?? 0,
    status,
    manual_override: true,
    last_answered_at: current?.last_answered_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveQuestionStatus(questionId, updated);
  return updated;
}

// Quiz Results
export async function getQuizResults(): Promise<QuizResult[]> {
  const raw = await AsyncStorage.getItem(KEYS.QUIZ_RESULTS);
  return raw ? JSON.parse(raw) : [];
}

export async function getLatestQuizResult(scope: string): Promise<QuizResult | undefined> {
  const results = await getQuizResults();
  return results
    .filter((r) => r.scope === scope)
    .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime())[0];
}

export async function saveQuizResult(result: QuizResult): Promise<void> {
  const results = await getQuizResults();
  results.push(result);
  await AsyncStorage.setItem(KEYS.QUIZ_RESULTS, JSON.stringify(results));
}

// User Settings
export async function getUserSettings(): Promise<UserSettings | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
  return raw ? JSON.parse(raw) : null;
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
}

export async function resetAllData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(KEYS.QUESTION_STATUS),
    AsyncStorage.removeItem(KEYS.QUIZ_RESULTS),
    AsyncStorage.removeItem(KEYS.USER_SETTINGS),
  ]);
}
