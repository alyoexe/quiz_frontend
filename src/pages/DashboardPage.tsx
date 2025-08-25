import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, BookOpen, TrendingUp, Clock, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/api';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { QuizAttempt } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalAttempts: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const attempts = await quizService.getQuizHistory();
        setRecentAttempts(attempts.slice(0, 3)); // Show 5 most recent

        // Calculate stats
        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
        const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;

        setStats({
          totalQuizzes: new Set(attempts.map(a => a.quiz_title)).size,
          averageScore: Math.round(averageScore),
          totalAttempts,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const quickActions = [
    {
      title: 'Upload PDF',
      description: 'Upload a new PDF to generate quizzes',
      icon: Upload,
      href: '/upload',
      color: 'bg-blue-500',
    },
    {
      title: 'Browse Quizzes',
      description: 'Explore available quizzes',
      icon: BookOpen,
      href: '/quizzes',
      color: 'bg-purple-500',
    },
    {
      title: 'View History',
      description: 'See your quiz performance',
      icon: Clock,
      href: '/history',
      color: 'bg-green-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your learning progress and recent activities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="py-4 px-6">
              <div className="flex items-center mt-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 px-6">
              <div className="flex items-center mt-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Quizzes Taken</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 px-6">
              <div className="flex items-center mt-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.href}>
                  <Card hover className="p-4 group">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${action.color} bg-opacity-10`}>
                        <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Link to="/quizzes">
                <Button variant="ghost" size="sm">
                  Browse All Quizzes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <Link key={attempt.attempt_id} to={`/quiz-results/${attempt.attempt_id}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {attempt.quiz_title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(attempt.submitted_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                            attempt.percentage >= 80
                              ? 'bg-green-100 text-green-800'
                              : attempt.percentage >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {attempt.percentage}%
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {attempt.score}/{attempt.total_questions}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Clock className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600">No quiz attempts yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Upload a PDF or take a quiz to get started!
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};