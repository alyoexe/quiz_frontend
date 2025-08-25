import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  TrendingUp, 
  Award, 
  Clock, 
  BookOpen, 
  Target,
  ArrowRight,
  Download,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { quizService } from '../services/api';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { QuizAttempt } from '../types';

export const HistoryPage: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'excellent' | 'good' | 'needs-improvement'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await quizService.getQuizHistory();
        setAttempts(history);
      } catch (error: any) {
        console.error('Error fetching history:', error);
        toast.error(error.response?.data?.message || 'Failed to load quiz history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Calculate statistics
  const stats = {
    totalAttempts: attempts.length,
    averageScore: attempts.length > 0 
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length)
      : 0,
    bestScore: attempts.length > 0 
      ? Math.max(...attempts.map(attempt => attempt.percentage))
      : 0,
    uniqueQuizzes: new Set(attempts.map(a => a.quiz_title)).size,
    excellentAttempts: attempts.filter(a => a.percentage >= 80).length,
    goodAttempts: attempts.filter(a => a.percentage >= 60 && a.percentage < 80).length,
    needsImprovementAttempts: attempts.filter(a => a.percentage < 60).length,
  };

  // Filter attempts
  const filteredAttempts = attempts.filter(attempt => {
    switch (filterBy) {
      case 'excellent':
        return attempt.percentage >= 80;
      case 'good':
        return attempt.percentage >= 60 && attempt.percentage < 80;
      case 'needs-improvement':
        return attempt.percentage < 60;
      default:
        return true;
    }
  });

  // Sort attempts
  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.percentage - a.percentage;
      case 'title':
        return a.quiz_title.localeCompare(b.quiz_title);
      case 'date':
      default:
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceTrend = () => {
    if (attempts.length < 2) return 'neutral';
    const recent5 = attempts.slice(0, 5);
    const older5 = attempts.slice(5, 10);
    
    if (older5.length === 0) return 'neutral';
    
    const recentAvg = recent5.reduce((sum, a) => sum + a.percentage, 0) / recent5.length;
    const olderAvg = older5.reduce((sum, a) => sum + a.percentage, 0) / older5.length;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  };

  const performanceTrend = getPerformanceTrend();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <LoadingSpinner size="lg" text="Loading quiz history..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz History</h1>
              <p className="text-gray-600 mt-2">
                Track your learning progress and performance over time
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Link to="/quizzes">
                <Button>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Take New Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mt-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mt-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mt-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bestScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mt-4">
                <div className="p-3 rounded-lg bg-orange-100">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.uniqueQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Performance Overview</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Trend */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium text-gray-600">Trend</span>
                    <div className={`flex items-center text-sm font-medium ${
                      performanceTrend === 'improving' ? 'text-green-600' :
                      performanceTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 mr-1 ${
                        performanceTrend === 'declining' ? 'rotate-180' : ''
                      }`} />
                      {performanceTrend === 'improving' ? 'Improving' :
                       performanceTrend === 'declining' ? 'Declining' : 'Stable'}
                    </div>
                  </div>

                  {/* Score Distribution */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3">Score Distribution</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Excellent (80%+)</span>
                        </div>
                        <span className="text-sm font-medium">{stats.excellentAttempts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Good (60-79%)</span>
                        </div>
                        <span className="text-sm font-medium">{stats.goodAttempts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Needs Work (&lt;60%)</span>
                        </div>
                        <span className="text-sm font-medium">{stats.needsImprovementAttempts}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Overall Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                          stats.averageScore >= 80 ? 'w-4/5' :
                          stats.averageScore >= 60 ? 'w-3/5' :
                          stats.averageScore >= 40 ? 'w-2/5' :
                          stats.averageScore >= 20 ? 'w-1/5' : 'w-1/12'
                        }`}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Average: {stats.averageScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quiz History List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">All Attempts</h3>
                  <div className="flex space-x-2">
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Filter attempts by score"
                      title="Filter attempts by score"
                    >
                      <option value="all">All Attempts</option>
                      <option value="excellent">Excellent (80%+)</option>
                      <option value="good">Good (60-79%)</option>
                      <option value="needs-improvement">Needs Work (&lt;60%)</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Sort attempts by"
                      title="Sort attempts by"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="score">Sort by Score</option>
                      <option value="title">Sort by Title</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sortedAttempts.length > 0 ? (
                  <div className="space-y-3">
                    {sortedAttempts.map((attempt) => (
                      <div key={attempt.attempt_id} className="flex items-center gap-2">
                        <Link to={`/quiz-results/${attempt.attempt_id}`} className="flex-1">
                          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {attempt.quiz_title}
                              </h4>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(attempt.submitted_at)}
                              </div>
                            </div>
                            <div className="text-right mr-4">
                              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(attempt.percentage)}`}>
                                {attempt.percentage}%
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {attempt.score}/{attempt.total_questions} correct
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                          </div>
                        </Link>
                        {attempt.quiz_id && (
                          <Link to={`/quiz/${attempt.quiz_id}/analytics`}>
                            <Button variant="outline" size="sm" className="px-3">
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No quiz attempts found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {filterBy !== 'all' ? 'Try changing the filter or ' : ''}
                      <Link to="/quizzes" className="text-blue-600 hover:text-blue-700">
                        take your first quiz
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
