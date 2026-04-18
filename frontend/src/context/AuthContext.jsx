import React, { createContext, useContext, useState, useEffect } from 'react';

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
