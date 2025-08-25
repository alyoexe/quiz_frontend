import axios from 'axios';
import type { User, Quiz, QuizResult, UploadedPDF, QuizAttempt, QuizAnalytics, QuizExplanationResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/login/', { username, password });
    return response.data;
  },

  async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/register/', { username, email, password });
    return response.data;
  },

  async verifyToken(token: string): Promise<User> {
    const response = await api.get('/user/', {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  },
};

export const pdfService = {
  async uploadPDF(file: File, title?: string, is_public?: boolean): Promise<UploadedPDF> {
    const formData = new FormData();
    formData.append('pdf_file', file);
    if (title) {
      formData.append('title', title);
    }
    if (is_public !== undefined) {
      formData.append('is_public', String(is_public));
    }

    const response = await api.post('/upload-pdf/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async generateQuiz(pdfId: number, numQuestions: number = 5): Promise<Quiz> {
    const response = await api.post(`/generate-quiz/${pdfId}/`, { 
      num_questions: numQuestions 
    });
    return response.data;
  },
};

export const quizService = {
  async getQuizzes(): Promise<Quiz[]> {
    const response = await api.get('/quizzes/');
    return response.data;
  },

  async getQuiz(id: number): Promise<Quiz> {
    const response = await api.get(`/quizzes/${id}/`);
    return response.data;
  },

  async submitQuiz(quizId: number, answers: Array<{ question_id: number; option_id: number }>): Promise<QuizResult> {
    const response = await api.post(`/submit-quiz/${quizId}/`, { answers });
    return response.data;
  },

  async getQuizHistory(): Promise<QuizAttempt[]> {
    const response = await api.get('/user/quiz-history/');
    return response.data.attempts || [];
  },

  async getQuizAnalytics(quizId: number): Promise<QuizAnalytics> {
    const response = await api.get(`/quiz/${quizId}/analytics/`);
    return response.data;
  },

  async getAttemptResults(attemptId: number): Promise<QuizResult> {
    // The results might be stored locally after quiz submission
    // or we need to fetch from a different endpoint based on your backend
    // For now, let's try the most likely endpoint structure
    const response = await api.get(`/attempt/${attemptId}/`);
    return response.data;
  },

  async getQuestionExplanations(quizId: number, questionIds: number[], includeContext: boolean = false): Promise<QuizExplanationResponse> {
    const response = await api.post(`/quiz/${quizId}/explain/`, {
      question_ids: questionIds,
      include_context: includeContext
    });
    return response.data;
  },
};

export { api };