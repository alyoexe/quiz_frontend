import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BookOpen, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { GoogleSignInButton } from '../components/ui/GoogleSignInButton';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const { register: registerUser, googleLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      await registerUser(data.username, data.email, data.password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
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
      navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-600 mt-2">Join QuizAI and start learning</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Sign Up</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    {...register('username', { required: 'Username is required' })}
                    type="text"
                    id="username"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email'
                      }
                    })}
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    id="password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Create a password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type="password"
                    id="confirmPassword"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
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
                variant="secondary"
              >
                Create Account
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
                  text="Sign up with Google"
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};