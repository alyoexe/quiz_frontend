import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BookOpen, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { GoogleSignInButton } from '../components/ui/GoogleSignInButton';

interface LoginForm {
  username: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login, googleLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const from = (location.state as any)?.from?.pathname || '/';

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await login(data.username, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: string) => {
    try {
      setError('');
      const { created } = await googleLogin(credentialResponse);
      if (created) {
        toast.success('Account created successfully! Welcome to QuizAI!');
      } else {
        toast.success('Welcome back!');
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Google sign-in failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed');
    toast.error('Google sign-in failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your QuizAI account</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Sign In</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    {...register('username', { required: 'Username is required' })}
                    type="text"
                    id="username"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type="password"
                    id="password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            {/* Show Google OAuth section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <GoogleSignInButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="Sign in with Google"
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};