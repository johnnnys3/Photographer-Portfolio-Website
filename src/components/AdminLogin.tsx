import React, { useState } from 'react';
import { Camera, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { secureSignIn } from '../lib/authSecurity';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await secureSignIn(email, password);
      onLogin();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      setError(errorMessage);
      setLoginAttempts(prev => prev + 1);
      
      // Log security events for monitoring
      if (error.message?.includes('locked')) {
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-black p-3 rounded-full">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Sign in to manage your portfolio</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              error.includes('locked') 
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error.includes('locked') ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div>
                <p className="font-medium">{error}</p>
                {loginAttempts > 2 && (
                  <p className="text-sm mt-1 opacity-75">
                    Please contact support if you continue to experience issues.
                  </p>
                )}
              </div>
            </div>
          )}

          {loginAttempts >= 3 && !error && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <p className="text-sm">
                <strong>Security Tip:</strong> Ensure you're using the correct admin credentials. 
                Multiple failed attempts will temporarily lock your account.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="•••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || loginAttempts >= 5}
            className={`w-full font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors ${
              loading || loginAttempts >= 5
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8C8 4.477 9.477 3 12 3s4 1.477 4 4v8a8 8 0 0016 0z"></path>
                </svg>
                Signing in...
              </span>
            ) : loginAttempts >= 5 ? (
              'Account Temporarily Locked'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Photographer Portfolio Admin
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure authentication powered by Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
