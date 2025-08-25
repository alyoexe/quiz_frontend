import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowRight, Search, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { quizService } from '../services/api';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Quiz } from '../types';

export const QuizListPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizData = await quizService.getQuizzes();
        setQuizzes(quizData);
      } catch (error: any) {
        console.error('Error fetching quizzes:', error);
        toast.error(error.response?.data?.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <LoadingSpinner size="lg" text="Loading quizzes..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Quizzes</h1>
              <p className="text-gray-600 mt-2">
                Choose from {quizzes.length} available quiz{quizzes.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <Link to="/upload">
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Create New Quiz
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Quiz Grid */}
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} hover className="group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDate(quiz.created_at)}</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Questions:</span>
                      <span className="font-medium text-gray-900">
                        {quiz.questions?.length || 'N/A'}
                      </span>
                    </div>
                    
                    {quiz.attempt_count !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Attempts:</span>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="font-medium text-gray-900">{quiz.attempt_count}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <Link to={`/quiz/${quiz.id}`} className="block">
                        <Button className="w-full" size="sm">
                          Take Quiz
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <Link to={`/quiz/${quiz.id}/analytics`} className="block">
                        <Button variant="outline" className="w-full" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {searchTerm ? (
              <Card className="max-w-md mx-auto p-8">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-2">No quizzes found</p>
                <p className="text-sm text-gray-500">
                  Try searching with different keywords or{' '}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    clear your search
                  </button>
                </p>
              </Card>
            ) : (
              <Card className="max-w-md mx-auto p-8">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-2">No quizzes available</p>
                <p className="text-sm text-gray-500 mb-4">
                  Get started by uploading a PDF to generate your first quiz!
                </p>
                <Link to="/upload">
                  <Button>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Upload PDF
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
