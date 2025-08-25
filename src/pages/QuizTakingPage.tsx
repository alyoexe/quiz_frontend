import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { quizService } from '../services/api';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Quiz, Question } from '../types';

export const QuizTakingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await quizService.getQuiz(Number(id));
        setQuiz(quizData);
      } catch (error) {
        toast.error('Failed to load quiz');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id, navigate]);

  const selectAnswer = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const nextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions!.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowConfirmation(true);
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const answerArray = quiz.questions!.map(question => ({
        question_id: question.id,
        option_id: answers[question.id],
      }));

      const result = await quizService.submitQuiz(quiz.id, answerArray);
      toast.success('Quiz submitted successfully!');
      navigate(`/quiz-results/${result.attempt_id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = quiz ? ((currentQuestion + 1) / quiz.questions!.length) * 100 : 0;
  const currentQ = quiz?.questions?.[currentQuestion];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <LoadingSpinner size="lg" text="Loading quiz..." />
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center pt-20">
          <p className="text-gray-600">Quiz not found</p>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Submit Quiz?</h1>
              <p className="text-gray-600 mt-2">
                Are you ready to submit your answers? You won't be able to change them after submission.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Questions answered: {Object.keys(answers).length} / {quiz.questions.length}
                  </p>
                  {Object.keys(answers).length < quiz.questions.length && (
                    <p className="text-sm text-yellow-600 mt-2">
                      You have unanswered questions
                    </p>
                  )}
                </div>
                <div className="flex space-x-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Review Answers
                  </Button>
                  <Button
                    onClick={submitQuiz}
                    loading={submitting}
                  >
                    Submit Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Question {currentQuestion + 1} of {quiz.questions.length}</span>
            </div>
          </div>
          <ProgressBar progress={progress} />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
              {currentQ?.text}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ?.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    currentAnswer === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option.id}
                    checked={currentAnswer === option.id}
                    onChange={() => selectAnswer(currentQ.id, option.id)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900 leading-relaxed">{option.text}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8">
              <div className="text-sm text-gray-500">
                {Object.keys(answers).length} of {quiz.questions.length} answered
              </div>
              <Button
                onClick={nextQuestion}
                disabled={!currentAnswer}
                size="lg"
              >
                {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation */}
        <div className="mt-6">
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[quiz.questions![index].id]
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};