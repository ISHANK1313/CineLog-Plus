import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // Auth modal state for watchlist signup prompt
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup'); // 'signup' or 'login'
  const [authModalCallback, setAuthModalCallback] = useState(null); // callback after successful auth

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authAPI.login(email, password);
    if (result.success) {
      setIsAuthenticated(true);
      localStorage.setItem('token', result.token);
      const userData = { email };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Execute callback if exists (e.g., retry watchlist action)
      if (authModalCallback) {
        authModalCallback();
        setAuthModalCallback(null);
      }

      closeAuthModal();
    }
    return result;
  }, [authModalCallback]);

  const signup = useCallback(async (email, password) => {
    const result = await authAPI.signup(email, password);
    if (result.success) {
      // Auto-login after signup
      const loginResult = await authAPI.login(email, password);
      if (loginResult.success) {
        setIsAuthenticated(true);
        localStorage.setItem('token', loginResult.token);
        const userData = { email };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Execute callback if exists
        if (authModalCallback) {
          authModalCallback();
          setAuthModalCallback(null);
        }

        closeAuthModal();
      }
    }
    return result;
  }, [authModalCallback]);

  const logout = useCallback(() => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Auth modal controls
  const openAuthModal = useCallback((mode = 'signup', callback = null) => {
    setAuthModalMode(mode);
    if (callback) {
      setAuthModalCallback(callback);
    }
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    setAuthModalMode('signup');
    setAuthModalCallback(null);
  }, []);

  const switchAuthMode = useCallback((mode) => {
    setAuthModalMode(mode);
  }, []);

  // Watchlist action that requires auth
  const requireAuthForAction = useCallback((action) => {
    if (isAuthenticated) {
      action();
    } else {
      openAuthModal('signup', action);
    }
  }, [isAuthenticated, openAuthModal]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        login,
        signup,
        logout,
        // Auth modal
        showAuthModal,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        switchAuthMode,
        requireAuthForAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};