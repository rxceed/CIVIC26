import { api } from './client';

export interface CBTSession {
  id: string;
  quizId: string;
  userId: string;
  answers: any[];
  score: number | null;
  infractions: Date[] | null;
  isSubmitted: boolean;
  startTime: string;
  finishTime: string | null;
  shuffleSeed: string | null;
  quizTimeLimitMs?: number;
}

export interface CBTStartResponse {
  success: boolean;
  message?: string;
  data?: {
    session: CBTSession;
    questions: any[]; // Questions with answer stripped
    quizTimeLimitMs?: number;
  };
}

export interface CBTGenericResponse {
  success: boolean;
  message?: string;
}

export interface CBTSubmitResponse {
  success: boolean;
  message?: string;
  data?: CBTSession;
}

export const cbtApi = {
  startSession: async (quizId: string): Promise<CBTStartResponse> => {
    const response = await api.post(`/cbt/${quizId}/start`);
    return response.data;
  },

  autosave: async (sessionId: string, answers: any[]): Promise<CBTGenericResponse> => {
    const response = await api.put(`/cbt/sessions/${sessionId}/autosave`, { answers });
    return response.data;
  },

  recordInfraction: async (sessionId: string, timestamp: string): Promise<CBTGenericResponse> => {
    const response = await api.post(`/cbt/sessions/${sessionId}/infraction`, { timestamp });
    return response.data;
  },

  submit: async (sessionId: string, answers: any[]): Promise<CBTSubmitResponse> => {
    const response = await api.post(`/cbt/sessions/${sessionId}/submit`, { answers });
    return response.data;
  },
};
