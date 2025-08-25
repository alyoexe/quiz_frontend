import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, X, Award, RotateCcw, ArrowLeft, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { quizService } from '../services/api';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { QuizResult, QuestionExplanation } from '../types';

export const QuizResultsPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState<Record<number, QuestionExplanation>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchResults = async () => {
      if (!attemptId) {
        toast.error('Invalid attempt ID');
        setLoading(false);
        return;
      }

      try {
        const result = await quizService.getAttemptResults(Number(attemptId));
        setResult(result);
        toast.success('Results loaded!');
      } catch (error: any) {
        console.error('Error fetching results:', error);
        toast.error(error.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <LoadingSpinner size="lg" text="Loading results..." />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center pt-20">
          <p className="text-gray-600">Results not found</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 80) return 'Excellent work! 🎉';
    if (percentage >= 60) return 'Good job! 👍';
    return 'Keep practicing! 📚';
  };

  const fetchExplanation = async (questionId: number) => {
    if (!result?.quiz_id) {
      toast.error('Quiz ID not available');
      return;
    }

    setLoadingExplanations(prev => ({ ...prev, [questionId]: true }));

    try {
      const response = await quizService.getQuestionExplanations(result.quiz_id, [questionId], false);
      if (response.explanations && response.explanations.length > 0) {
        setExplanations(prev => ({
          ...prev,
          [questionId]: response.explanations[0]
        }));
      }
    } catch (error: any) {
      console.error('Error fetching explanation:', error);
      toast.error('Failed to load explanation');
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Summary */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <Award className={`w-16 h-16 mx-auto mb-4 ${
              result.percentage >= 80 ? 'text-green-500' :
              result.percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`} />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quiz Complete!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {getScoreMessage(result.percentage)}
            </p>
            
            <div className={`inline-flex items-center px-6 py-4 rounded-xl border-2 ${getScoreColor(result.percentage)}`}>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {result.score}/{result.total_questions}
                </div>
                <div className="text-lg font-medium">
                  {result.percentage}%
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-8">
              <Link to="/quizzes">
                <Button variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Another Quiz
                </Button>
              </Link>
              <Link to="/">
                <Button>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Results</h2>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {result.results.map((questionResult, index) => (
            <Card key={questionResult.question_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-gray-900 leading-relaxed pr-4">
                    {index + 1}. {questionResult.question_text}
                  </h3>
                  <div className={`flex-shrink-0 p-2 rounded-full ${
                    questionResult.is_correct ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {questionResult.is_correct ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Your answer:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      questionResult.is_correct
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {questionResult.selected_option}
                    </span>
                  </div>
                  
                  {!questionResult.is_correct && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Correct answer:</span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {questionResult.correct_option}
                      </span>
                    </div>
                  )}

                  {/* Explanation Section */}
                  <div className="pt-4 border-t border-gray-100">
                    {!explanations[questionResult.question_id] ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchExplanation(questionResult.question_id)}
                        loading={loadingExplanations[questionResult.question_id]}
                        className="flex items-center space-x-2"
                      >
                        <Lightbulb className="w-4 h-4" />
                        <span>Explain Answer</span>
                      </Button>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                          <h4 className="font-medium text-blue-900">Explanation</h4>
                        </div>
                        <p className="text-sm text-blue-800 mb-3 leading-relaxed">
                          {explanations[questionResult.question_id].explanation}
                        </p>
                        {explanations[questionResult.question_id].key_concepts.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-blue-700 mb-2">Key Concepts:</h5>
                            <div className="flex flex-wrap gap-2">
                              {explanations[questionResult.question_id].key_concepts.map((concept, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Share Section */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Share your achievement!
            </h3>
            <p className="text-gray-600 mb-4">
              I scored {result.percentage}% on a QuizAI quiz! 🎯
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`I scored ${result.percentage}% on a QuizAI quiz! 🎯`);
                  toast.success('Copied to clipboard!');
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};