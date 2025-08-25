import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Trophy, 
  TrendingDown,
  Users,
  ArrowLeft,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { quizService } from '../services/api';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { QuizAnalytics } from '../types';

export const QuizAnalyticsPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!quizId || isNaN(Number(quizId))) {
        toast.error('Invalid quiz ID');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching analytics for quiz ID:', quizId);
        const data = await quizService.getQuizAnalytics(Number(quizId));
        console.log('Analytics data received:', data); // Debug log
        
        // Validate that we have the required data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid analytics data received');
        }
        
        setAnalytics(data);
      } catch (error: any) {
        console.error('Error fetching analytics:', error);
        
        if (error.response?.status === 404) {
          toast.error('Analytics not found for this quiz');
        } else if (error.response?.status === 500) {
          toast.error('Server error loading analytics');
        } else {
          toast.error(error.response?.data?.message || error.message || 'Failed to load analytics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <LoadingSpinner size="lg" text="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center pt-20">
          <p className="text-gray-600">Analytics not found</p>
          <Link to="/quizzes" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 0.8) return 'text-green-600 bg-green-100';
    if (passRate >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz Analytics</h1>
              <h2 className="text-xl text-gray-600 mt-2">{analytics.quiz_title}</h2>
            </div>
            <div className="flex space-x-3">
              <Link to="/quizzes">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quizzes
                </Button>
              </Link>
              <Link to={`/quiz/${quizId}`}>
                <Button>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Take Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="py-8 px-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_attempts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-8 px-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analytics.average_percentage)}`}>
                    {analytics.average_score.toFixed(1)}/{analytics.total_questions}
                  </p>
                  <p className="text-xs text-gray-500">
                    {analytics.average_percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-8 px-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analytics.pass_rate * 100)}`}>
                    {Math.round(analytics.pass_rate * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-8 px-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Highest Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.highest_score}/{analytics.total_questions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Performance Overview</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Average Performance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Average Performance</span>
                    <span className={`text-sm font-medium ${getScoreColor(analytics.average_percentage)}`}>
                      {analytics.average_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        analytics.average_percentage >= 80 ? 'bg-green-500' :
                        analytics.average_percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      } ${
                        analytics.average_percentage >= 90 ? 'w-full' :
                        analytics.average_percentage >= 80 ? 'w-5/6' :
                        analytics.average_percentage >= 70 ? 'w-4/5' :
                        analytics.average_percentage >= 60 ? 'w-3/5' :
                        analytics.average_percentage >= 50 ? 'w-1/2' :
                        analytics.average_percentage >= 40 ? 'w-2/5' :
                        analytics.average_percentage >= 30 ? 'w-1/3' :
                        analytics.average_percentage >= 20 ? 'w-1/5' :
                        analytics.average_percentage >= 10 ? 'w-1/12' : 'w-0'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Pass Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Pass Rate (60%+)</span>
                    <span className={`text-sm font-medium ${getScoreColor(analytics.pass_rate * 100)}`}>
                      {Math.round(analytics.pass_rate * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        analytics.pass_rate >= 0.8 ? 'bg-green-500' :
                        analytics.pass_rate >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      } ${
                        analytics.pass_rate >= 0.9 ? 'w-full' :
                        analytics.pass_rate >= 0.8 ? 'w-5/6' :
                        analytics.pass_rate >= 0.7 ? 'w-4/5' :
                        analytics.pass_rate >= 0.6 ? 'w-3/5' :
                        analytics.pass_rate >= 0.5 ? 'w-1/2' :
                        analytics.pass_rate >= 0.4 ? 'w-2/5' :
                        analytics.pass_rate >= 0.3 ? 'w-1/3' :
                        analytics.pass_rate >= 0.2 ? 'w-1/5' :
                        analytics.pass_rate >= 0.1 ? 'w-1/12' : 'w-0'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Score Range */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Score Range</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">Lowest</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics.lowest_score}/{analytics.total_questions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Highest</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics.highest_score}/{analytics.total_questions}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Stats</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total Participants</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.total_attempts}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-indigo-900">Total Questions</p>
                    <p className="text-2xl font-bold text-indigo-600">{analytics.total_questions}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-indigo-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Average Questions Correct</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.average_score.toFixed(1)}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Passing Threshold</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {analytics.passing_threshold || 'N/A'}
                    </p>
                    <p className="text-xs text-yellow-700">points to pass</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-yellow-400" />
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg ${getPassRateColor(analytics.pass_rate)}`}>
                  <div>
                    <p className="text-sm font-medium">Students Passing</p>
                    <p className="text-2xl font-bold">
                      {Math.round(analytics.total_attempts * analytics.pass_rate)}/{analytics.total_attempts}
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 opacity-60" />
                </div>

                {analytics.total_attempts > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      Based on {analytics.total_attempts} attempt{analytics.total_attempts !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 text-center">
          <div className="inline-flex space-x-4">
            <Link to="/quizzes">
              <Button variant="outline">
                View All Quizzes
              </Button>
            </Link>
            <Link to={`/quiz/${quizId}`}>
              <Button>
                Take This Quiz
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
