import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { User, Mail, Trophy, Target, Clock, Edit3, Save, X } from 'lucide-react';
import { quizService } from '../services/api';
import type { QuizAttempt } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    streakDays: 0,
    quizzesCompleted: 0,
    favoriteSubject: 'N/A'
  });
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || ''
  });

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      const attempts: QuizAttempt[] = await quizService.getQuizHistory();
      
      const totalAttempts = attempts.length;
      const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
      const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
      const bestScore = totalAttempts > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0;
      
      // Calculate total time spent (estimate based on questions)
      const totalTimeSpent = attempts.reduce((sum, attempt) => {
        // Estimate 1 minute per question
        return sum + (attempt.total_questions || 5);
      }, 0);

      // Count unique quizzes completed
      const uniqueQuizzes = new Set(attempts.map(attempt => attempt.quiz_id || attempt.quiz_title));
      const quizzesCompleted = uniqueQuizzes.size;

      // Calculate streak (simplified - consecutive days)
      const streakDays = calculateStreak(attempts);
      
      // Find favorite subject (most attempted)
      const subjectCounts: { [key: string]: number } = {};
      attempts.forEach(attempt => {
        const subject = attempt.quiz_title.split(' ')[0]; // Simple subject extraction
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
      
      const favoriteSubject = Object.keys(subjectCounts).length > 0 
        ? Object.entries(subjectCounts).sort(([,a], [,b]) => b - a)[0][0]
        : 'N/A';

      setStats({
        totalAttempts,
        averageScore,
        bestScore,
        totalTimeSpent: Math.round(totalTimeSpent), // Keep as minutes
        streakDays,
        quizzesCompleted,
        favoriteSubject
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (attempts: QuizAttempt[]): number => {
    if (attempts.length === 0) return 0;
    
    // Sort attempts by date (newest first)
    const sortedAttempts = attempts.sort((a, b) => 
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
    
    // Get unique dates
    const dates = [...new Set(sortedAttempts.map(attempt => 
      new Date(attempt.submitted_at).toDateString()
    ))];
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < dates.length; i++) {
      const attemptDate = new Date(dates[i]);
      const diffDays = Math.floor((today.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Here you would typically call an API to update user profile
      // await userService.updateProfile(editForm);
      
      // For now, just simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      // You would update the user context here with new data
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || user.username}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  {user?.auth_method === 'google' && (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                        placeholder="Full Name"
                      />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="text-gray-600 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                        placeholder="Email"
                      />
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="text-gray-600 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                        placeholder="Username"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user?.name ?? user?.username ?? 'Your Name'}
                      </h1>
                      <div className="flex items-center space-x-4 text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user?.email}</span>
                        </div>
                        {user?.auth_method === 'google' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Google Account
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-1"
                    >
                      {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                      <span>Save</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          name: user?.name || '',
                          email: user?.email || '',
                          username: user?.username || ''
                        });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col justify-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
                  <p className="text-sm text-gray-600">Total Attempts</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col justify-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col justify-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.bestScore}%</p>
                  <p className="text-sm text-gray-600">Best Score</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col justify-center">
                  <p className="text-2xl font-bold text-gray-900">{formatTime(stats.totalTimeSpent)}</p>
                  <p className="text-sm text-gray-600">Time Spent</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quiz Progress</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quizzes Completed</span>
                <span className="font-semibold">{stats.quizzesCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Streak</span>
                <span className="font-semibold">{stats.streakDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Favorite Subject</span>
                <span className="font-semibold">{stats.favoriteSubject}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Account Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">
                  {user ? new Date().toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Authentication</span>
                <span className="font-semibold capitalize">
                  {user?.auth_method || 'Email'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Status</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
