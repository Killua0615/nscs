import { StatusType, SessionQuestion } from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  Exercise: {
    sourceType: 'subject' | 'category' | 'all';
    sourceId: string;
    filter: StatusType | 'all' | 'exclude_perfect';
    count?: number;
    isQuiz?: boolean;
  };
  ResultSummary: {
    results: SessionQuestion[];
    scope: string;
    scopeId?: string;
    isQuiz: boolean;
  };
  Review: {
    results: SessionQuestion[];
    scope: string;
  };
  QuizSetup: {
    scope: string;
  };
  Settings: undefined;
};

export type TabParamList = {
  TOP: undefined;
  Practice: undefined;
  Quiz: undefined;
  Info: undefined;
};
