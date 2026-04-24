import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPersistentLoginPrompt, setShowPersistentLoginPrompt] = useState(false);
  const [persistLoginData, setPersistLoginData] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('velora_token');
      if (token) {
        await validateToken(token);
      } else {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const validateToken = async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Invalid token');
      
      if (!res.body) throw new Error('Empty response from server');
      const data = await res.json();
      
      setUser(data);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Token validation error:', e);
      localStorage.removeItem('velora_token');
      localStorage.removeItem('velora_persist_login');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, shouldPersist = false) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Check response status before parsing JSON
      if (!res.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse error JSON, use default message
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Only try to parse JSON if response is OK
      const data = await res.json();
      if (!data.token || !data.user) {
        throw new Error('Invalid response structure from server');
      }

      localStorage.setItem('velora_token', data.token);
      if (shouldPersist) {
        localStorage.setItem('velora_persist_login', 'true');
        localStorage.setItem('velora_user_email', email);
      }
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Use Firebase Authentication directly
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Set user and authentication state with Firebase credentials
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${firebaseUser.displayName || 'user'}`,
      });

      // Store Firebase token instead of JWT
      localStorage.setItem('velora_token', idToken);
      localStorage.setItem('velora_persist_login', 'true');
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      // Re-throw with a user-friendly message
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. You closed the popup.');
      }
      throw error;
    }
  };

  const register = async (userData, shouldPersist = false) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      // Check response status before parsing JSON
      if (!res.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse error JSON, use default message
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Only try to parse JSON if response is OK
      const data = await res.json();
      if (!data.token || !data.user) {
        throw new Error('Invalid response structure from server');
      }

      localStorage.setItem('velora_token', data.token);
      if (shouldPersist) {
        localStorage.setItem('velora_persist_login', 'true');
        localStorage.setItem('velora_user_email', userData.email);
      }
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('velora_token');
    localStorage.removeItem('velora_persist_login');
    localStorage.removeItem('velora_user_email');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('velora_token');
    if (token) await validateToken(token);
  };

  const requestPersistentLogin = (email, password) => {
    setPersistLoginData({ email, password });
    setShowPersistentLoginPrompt(true);
  };

  const confirmPersistentLogin = async () => {
    if (persistLoginData) {
      await login(persistLoginData.email, persistLoginData.password, true);
    }
    setShowPersistentLoginPrompt(false);
    setPersistLoginData(null);
  };

  const declinePersistentLogin = () => {
    setShowPersistentLoginPrompt(false);
    setPersistLoginData(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
      requestPersistentLogin,
      confirmPersistentLogin,
      declinePersistentLogin,
      showPersistentLoginPrompt,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
