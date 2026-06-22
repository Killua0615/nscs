import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserQuestionStatus,
  UserSettings,
  StatusType,
  StatusCounts,
  QuizResult,
} from '../types';
import * as storage from '../lib/storage';
import { QUESTIONS } from '../lib/questionData';

interface AppContextType {
  statuses: Record<string, UserQuestionStatus>;
  settings: UserSettings | null;
  quizResults: QuizResult[];
  refreshStatuses: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshQuizResults: () => Promise<void>;
  updateAfterAnswer: (questionId: string, isCorrect: boolean) => Promise<UserQuestionStatus>;
  setManualStatus: (questionId: string, status: StatusType) => Promise<void>;
  saveExamDate: (date: string | null) => Promise<void>;
  saveQuizResult: (result: QuizResult) => Promise<void>;
  getStatusCounts: (questionIds: string[]) => StatusCounts;
  isPremium: boolean;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_ID = 'local-user';

export function AppProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, UserQuestionStatus>>({});
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isPremium] = useState(true); // TODO: RevenueCat integration

  const refreshStatuses = useCallback(async () => {
    const s = await storage.getAllQuestionStatuses();
    setStatuses(s);
  }, []);

  const refreshSettings = useCallback(async () => {
    const s = await storage.getUserSettings();
    setSettings(s);
  }, []);

  const refreshQuizResults = useCallback(async () => {
    const r = await storage.getQuizResults();
    setQuizResults(r);
  }, []);

  useEffect(() => {
    refreshStatuses();
    refreshSettings();
    refreshQuizResults();
  }, [refreshStatuses, refreshSettings, refreshQuizResults]);

  const updateAfterAnswer = useCallback(
    async (questionId: string, isCorrect: boolean) => {
      const updated = await storage.updateAfterAnswer(questionId, isCorrect, USER_ID);
      setStatuses((prev) => ({ ...prev, [questionId]: updated }));
      return updated;
    },
    []
  );

  const setManualStatusFn = useCallback(
    async (questionId: string, status: StatusType) => {
      const updated = await storage.setManualStatus(questionId, status, USER_ID);
      setStatuses((prev) => ({ ...prev, [questionId]: updated }));
    },
    []
  );

  const saveExamDate = useCallback(
    async (date: string | null) => {
      const newSettings: UserSettings = {
        user_id: USER_ID,
        exam_date: date,
        updated_at: new Date().toISOString(),
      };
      await storage.saveUserSettings(newSettings);
      setSettings(newSettings);
    },
    []
  );

  const saveQuizResultFn = useCallback(
    async (result: QuizResult) => {
      await storage.saveQuizResult(result);
      setQuizResults((prev) => [...prev, result]);
    },
    []
  );

  const getStatusCounts = useCallback(
    (questionIds: string[]): StatusCounts => {
      const counts: StatusCounts = { perfect: 0, almost: 0, weak: 0, unlearned: 0 };
      for (const qid of questionIds) {
        const s = statuses[qid];
        if (s) {
          counts[s.status]++;
        } else {
          counts.unlearned++;
        }
      }
      return counts;
    },
    [statuses]
  );

  const resetAllDataFn = useCallback(async () => {
    await storage.resetAllData();
    setStatuses({});
    setSettings(null);
    setQuizResults([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        statuses,
        settings,
        quizResults,
        refreshStatuses,
        refreshSettings,
        refreshQuizResults,
        updateAfterAnswer,
        setManualStatus: setManualStatusFn,
        saveExamDate,
        saveQuizResult: saveQuizResultFn,
        getStatusCounts,
        isPremium,
        resetAllData: resetAllDataFn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
