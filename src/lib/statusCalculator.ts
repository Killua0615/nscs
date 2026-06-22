import { StatusType, UserQuestionStatus } from '../types';

export function calculateStatus(streak: number, totalAttempts: number): StatusType {
  if (totalAttempts === 0) return 'unlearned';
  if (streak === 0) return 'weak';
  if (streak === 1) return 'almost';
  return 'perfect';
}

export function getStatusAfterAnswer(
  current: UserQuestionStatus | undefined,
  isCorrect: boolean
): { status: StatusType; correct_streak: number; total_attempts: number; total_correct: number } {
  const prevStreak = current?.correct_streak ?? 0;
  const prevAttempts = current?.total_attempts ?? 0;
  const prevCorrect = current?.total_correct ?? 0;

  const newStreak = isCorrect ? prevStreak + 1 : 0;
  const newAttempts = prevAttempts + 1;
  const newCorrect = isCorrect ? prevCorrect + 1 : prevCorrect;

  return {
    status: calculateStatus(newStreak, newAttempts),
    correct_streak: newStreak,
    total_attempts: newAttempts,
    total_correct: newCorrect,
  };
}

export const STATUS_COLORS: Record<StatusType, string> = {
  perfect: '#4CAF50',
  almost: '#FF9800',
  weak: '#9C27B0',
  unlearned: '#9E9E9E',
};

export const STATUS_LABELS: Record<StatusType, string> = {
  perfect: '完璧',
  almost: 'やや完璧',
  weak: '苦手',
  unlearned: '未学習',
};
