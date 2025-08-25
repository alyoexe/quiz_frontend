export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Quiz {
  id: number;
  quiz_id?: number; // For backend compatibility
  title: string;
  created_at: string;
  questions?: Question[];
  attempt_count?: number;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface Option {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  attempt_id: number;
  quiz_id?: number;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  submitted_at: string;
}

export interface QuizResult {
  attempt_id: number;
  quiz_id?: number;
  score: number;
  total_questions: number;
  percentage: number;
  results: QuestionResult[];
}

export interface QuestionResult {
  question_id: number;
  question_text: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
}

export interface UploadedPDF {
  id: number;
  title: string;
  file_name: string;
  is_public: boolean;
  uploaded_at: string;
}

export interface QuizAnalytics {
  quiz_title: string;
  total_questions: number;
  total_attempts: number;
  average_score: number;
  average_percentage: number;
  pass_rate: number;
  passing_threshold?: number; // Make optional in case backend doesn't provide it
  highest_score: number;
  lowest_score: number;
}

export interface QuestionExplanation {
  question_id: number;
  explanation: string;
  key_concepts: string[];
}

export interface QuizExplanationResponse {
  quiz_id: number;
  quiz_title: string;
  explanations: QuestionExplanation[];
}