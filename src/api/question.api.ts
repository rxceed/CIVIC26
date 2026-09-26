import { api } from './client'

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface OptionItem {
  text: string
  image?: string | null
}

export interface QuestionOptions {
  a: OptionItem
  b: OptionItem
  c: OptionItem
  d: OptionItem
  e: OptionItem
}

export interface Question {
  id: string
  quizId: string
  question: string
  options: QuestionOptions
  answer: string
  scoreWeight: number
  penaltyWeight: number
  unansweredWeight: number
  imageRef: string | null
  shuffleChoices: boolean
}

export const questionApi = {
  getQuestionsByQuizId: async (quizId: string): Promise<ApiResponse<Question[]>> => {
    const { data } = await api.get<ApiResponse<Question[]>>(`/questions?quizId=${quizId}`)
    return data
  },
  
  createQuestion: async (
    payload: Omit<Question, 'id' | 'penaltyWeight' | 'unansweredWeight'> & {
      penaltyWeight?: number
      unansweredWeight?: number
    }
  ): Promise<ApiResponse<Question>> => {
    const { data } = await api.post<ApiResponse<Question>>('/questions', {
      penaltyWeight: 0,
      unansweredWeight: 0,
      ...payload
    })
    return data
  },

  updateQuestion: async (id: string, payload: Partial<Omit<Question, 'id' | 'quizId'>>): Promise<ApiResponse<Question>> => {
    const { data } = await api.put<ApiResponse<Question>>(`/questions/${id}`, payload)
    return data
  },

  deleteQuestion: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete<ApiResponse<null>>(`/questions/${id}`)
    return data
  }
}
