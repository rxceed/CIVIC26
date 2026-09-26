import { api } from './client';

export interface Quiz {
  id: string;
  name: string;
  description: string | null;
  type: string;
  openTime: string;
  closeTime: string;
  totalQuestions: number;
  cheatsheetRef: string | null;
  shuffleQuestions: boolean;
  isOpen: boolean;
  quizTimeLimitMs: number;
}

export interface QuizzesResponse {
  success: boolean;
  data: Quiz[];
}

export interface QuizResponse {
  success: boolean;
  data: Quiz;
}

export const quizApi = {
  getQuizzes: async (type?: string): Promise<QuizzesResponse> => {
    const url = type ? `/quizzes?type=${type}` : '/quizzes';
    const response = await api.get<QuizzesResponse>(url);
    return response.data;
  },

  getQuizById: async (id: string): Promise<QuizResponse> => {
    const response = await api.get<QuizResponse>(`/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (payload: Partial<Quiz> & { sourcePaketId?: string }): Promise<QuizResponse> => {
    const response = await api.post<QuizResponse>('/quizzes', payload);
    return response.data;
  },

  updateQuiz: async (id: string, payload: Partial<Quiz>): Promise<QuizResponse> => {
    const response = await api.put<QuizResponse>(`/quizzes/${id}`, payload);
    return response.data;
  },

  deleteQuiz: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/quizzes/${id}`);
    return response.data;
  },
};
