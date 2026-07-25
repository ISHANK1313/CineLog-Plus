import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthModal = () => {
  const {
    showAuthModal,
    authModalMode,
    closeAuthModal,
    switchAuthMode,
    login,
    signup,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const isLogin = authModalMode === 'login';

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await signup(email, password);
      }

      if (!result.success) {
        setError(result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    switchAuthMode(isLogin ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div
        className="relative bg-black bg-opacity-95 rounded w-full max-w-md mx-4 py-12 px-16 animate-scale-in border border-netflix-dark-light"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-netflix-gray-light hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Netflix-style logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-netflix-red">CINELOG</span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-6">
          {isLogin ? 'Sign In' : 'Create an account to save your watchlist'}
        </h2>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-netflix-red bg-opacity-20 border border-netflix-red rounded px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-netflix-red flex-shrink-0 mt-0.5" />
            <span className="text-sm text-white">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="input-netflix text-sm"
              disabled={loading}
              autoComplete={isLogin ? "email" : "new-email"}
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-netflix text-sm pr-10"
              disabled={loading}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-netflix-gray-light hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {!isLogin && (
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="input-netflix text-sm pr-10"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-netflix-gray-light hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-netflix w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-netflix-gray text-sm">
            {isLogin ? "New to CineLog?" : "Already have an account?"}{' '}
            <button
              onClick={switchMode}
              className="text-white font-medium hover:underline transition-all"
            >
              {isLogin ? 'Sign up now' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-netflix-gray text-xs">
            This will save your watchlist so you never lose your picks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;