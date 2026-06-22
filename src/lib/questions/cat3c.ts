import { Question } from '../../types';

export const CAT3C_QUESTIONS: Question[] = [
// III-C-a: ウエイトベルト（5問）
  { id: 'q-3c-a-01', category_id: 'cat-3c', body: 'ウエイトベルトの使用条件は次のうちどれ', choices: [{ label: 'a', text: 'パワーエクササイズかつ高重量' }, { label: 'b', text: 'ストラクチャルエクササイズかつ高重量' }, { label: 'c', text: 'BIG３の種目のみ' }], correct_choice: 'b', explanation: '使用条件に該当するのは、ストラクチャルエクササイズかつ高重量', source: 'NEXT TRAINER LAB', is_free: true, display_order: 1 },
  { id: 'q-3c-a-02', category_id: 'cat-3c', body: 'ウエイトベルト使用したほうが良いのは次のうちどれ', choices: [{ label: 'a', text: 'ショルダープレス' }, { label: 'b', text: 'ベントオーバーロー' }, { label: 'c', text: 'トライセプスエクステンション' }], correct_choice: 'a', explanation: 'ショルダープレスは背骨に対して負荷がかかる種目になるため', source: 'NEXT TRAINER LAB', is_free: true, display_order: 2 },
  { id: 'q-3c-a-03', category_id: 'cat-3c', body: 'ウエイトベルト使用したほうが良いのは次のうちどれ', choices: [{ label: 'a', text: 'ラテラルレイズ' }, { label: 'b', text: 'バイセップスカール' }, { label: 'c', text: 'パワークリーン' }], correct_choice: 'c', explanation: 'パワークリーンが使用条件に該当する', source: 'NEXT TRAINER LAB', is_free: true, display_order: 3 },
  { id: 'q-3c-a-04', category_id: 'cat-3c', body: 'ウエイトベルトの使用しない種目は次のうちどれ', choices: [{ label: 'a', text: 'デットリフト' }, { label: 'b', text: 'スクワット' }, { label: 'c', text: 'ベンチプレス' }], correct_choice: 'c', explanation: 'ベンチプレスはコアエクササイズの為', source: 'NEXT TRAINER LAB', is_free: true, display_order: 4 },
  { id: 'q-3c-a-05', category_id: 'cat-3c', body: 'ウエイトベルトを使用したほうが良いのは次のうちどれ', choices: [{ label: 'a', text: '12RM' }, { label: 'b', text: '7RM' }, { label: 'c', text: '3RM' }], correct_choice: 'c', explanation: '高負荷かつ6RM以下の時', source: 'NEXT TRAINER LAB', is_free: true, display_order: 5 },
];
