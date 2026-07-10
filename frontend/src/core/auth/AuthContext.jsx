import React, { createContext, useState, useEffect } from 'react';
import { authService } from './authService';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false,
  });

  // Check auth status on initial load by trying to refresh the token
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const response = await authService.refresh();
        if (isMounted) {
          setAuth({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isInitialized: true,
          });
        }
      } catch (error) {
        if (isMounted) {
          setAuth(prev => ({ ...prev, isInitialized: true }));
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setAuth({
      user: response.user,
      accessToken: response.accessToken,
      isAuthenticated: true,
      isInitialized: true,
    });
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setAuth({
      user: response.user,
      accessToken: response.accessToken,
      isAuthenticated: true,
      isInitialized: true,
    });
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setAuth({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
