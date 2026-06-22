// Domain types

export type StatusType = 'perfect' | 'almost' | 'weak' | 'unlearned';

export type AnswerResult = 'correct' | 'incorrect' | 'skipped' | 'unanswered';

export interface Subject {
  id: string;
  name: string;
  display_order: number;
}

export interface Category {
  id: string;
  subject_id: string;
  name: string;
  display_order: number;
}

export interface Choice {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  category_id: string;
  body: string;
  choices: Choice[];
  correct_choice: string;
  explanation: string;
  source: string;
  is_free: boolean;
  display_order: number;
}

export interface UserQuestionStatus {
  user_id: string;
  question_id: string;
  correct_streak: number;
  total_attempts: number;
  total_correct: number;
  status: StatusType;
  manual_override: boolean;
  last_answered_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  scope: string;
  score_rate: number;
  total: number;
  correct: number;
  skipped: number;
  taken_at: string;
}

export interface UserSettings {
  user_id: string;
  exam_date: string | null;
  updated_at: string;
}

// UI types

export interface CategoryWithCounts extends Category {
  counts: StatusCounts;
  totalQuestions: number;
}

export interface SubjectWithCategories extends Subject {
  categories: CategoryWithCounts[];
  counts: StatusCounts;
  totalQuestions: number;
}

export interface StatusCounts {
  perfect: number;
  almost: number;
  weak: number;
  unlearned: number;
}

export interface SessionQuestion {
  question: Question;
  status?: UserQuestionStatus;
  answerResult?: AnswerResult;
  selectedChoice?: string;
}

export interface SessionResult {
  questions: SessionQuestion[];
  totalCorrect: number;
  totalIncorrect: number;
  totalSkipped: number;
  scope: string;
}
