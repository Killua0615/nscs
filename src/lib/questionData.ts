import { Subject, Category, Question } from '../types';
import { ALL_QUESTIONS } from './questions';

// Seed data: subjects and categories based on NSCA-CPT official domains

export const SUBJECTS: Subject[] = [
  { id: 'subject-1', name: 'クライアントに対する面談と評価', display_order: 1 },
  { id: 'subject-2', name: 'プログラムプランニング', display_order: 2 },
  { id: 'subject-3', name: 'エクササイズテクニック', display_order: 3 },
  { id: 'subject-4', name: '安全性・緊急時の手順・法的諸問題', display_order: 4 },
];

export const CATEGORIES: Category[] = [
  // I. クライアントに対する面談と評価
  { id: 'cat-1a', subject_id: 'subject-1', name: '初回面談と健康評価', display_order: 1 },
  { id: 'cat-1b', subject_id: 'subject-1', name: '体力評価', display_order: 2 },
  { id: 'cat-1c', subject_id: 'subject-1', name: '目標・動機付け', display_order: 3 },
  { id: 'cat-1d', subject_id: 'subject-1', name: '栄養', display_order: 4 },

  // II. プログラムプランニング
  { id: 'cat-2a', subject_id: 'subject-2', name: 'プランニング', display_order: 1 },
  { id: 'cat-2b', subject_id: 'subject-2', name: 'RM計算', display_order: 2 },
  { id: 'cat-2c', subject_id: 'subject-2', name: '心拍数', display_order: 3 },
  { id: 'cat-2d', subject_id: 'subject-2', name: '特別なクライアント', display_order: 4 },

  // III. エクササイズテクニック
  { id: 'cat-3a', subject_id: 'subject-3', name: '種目', display_order: 1 },
  { id: 'cat-3b', subject_id: 'subject-3', name: '補助', display_order: 2 },
  { id: 'cat-3c', subject_id: 'subject-3', name: 'ウエイトベルト', display_order: 3 },
  { id: 'cat-3d', subject_id: 'subject-3', name: '筋活動', display_order: 4 },
  { id: 'cat-3e', subject_id: 'subject-3', name: '呼吸法', display_order: 5 },
  { id: 'cat-3f', subject_id: 'subject-3', name: 'エクササイズの種類・配列', display_order: 6 },
  { id: 'cat-3g', subject_id: 'subject-3', name: '筋構造・筋繊維', display_order: 7 },
  { id: 'cat-3h', subject_id: 'subject-3', name: '自重・スタビリティボール', display_order: 8 },
  { id: 'cat-3i', subject_id: 'subject-3', name: 'ストレッチ・生理的メカニズム', display_order: 9 },
  { id: 'cat-3j', subject_id: 'subject-3', name: 'プライオメトリック', display_order: 10 },
  { id: 'cat-3k', subject_id: 'subject-3', name: 'スプリント・有酸素トレーニング', display_order: 11 },

  // IV. 安全性・緊急時の手順・法的諸問題
  { id: 'cat-4a', subject_id: 'subject-4', name: '機器の配置', display_order: 1 },
  { id: 'cat-4b', subject_id: 'subject-4', name: '緊急時の手順・法的諸問題', display_order: 2 },
];

export const QUESTIONS: Question[] = ALL_QUESTIONS;


export function getSubjects(): Subject[] {
  return SUBJECTS;
}

export function getCategoriesBySubject(subjectId: string): Category[] {
  return CATEGORIES.filter((c) => c.subject_id === subjectId).sort(
    (a, b) => a.display_order - b.display_order
  );
}

export function getQuestionsByCategory(categoryId: string): Question[] {
  return QUESTIONS.filter((q) => q.category_id === categoryId).sort(
    (a, b) => a.display_order - b.display_order
  );
}

export function getQuestionsBySubject(subjectId: string): Question[] {
  const catIds = getCategoriesBySubject(subjectId).map((c) => c.id);
  return QUESTIONS.filter((q) => catIds.includes(q.category_id)).sort(
    (a, b) => a.display_order - b.display_order
  );
}

export function getAllQuestions(): Question[] {
  return [...QUESTIONS].sort((a, b) => a.display_order - b.display_order);
}
