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

  // Check auth status on initial load by trying to refresh the token or checking localStorage
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('merisamaj_user');
      const savedToken = localStorage.getItem('merisamaj_token');

      if (savedUser && savedToken) {
        if (isMounted) {
          setAuth({
            user: JSON.parse(savedUser),
            accessToken: savedToken,
            isAuthenticated: true,
            isInitialized: true,
          });
        }
        
        // Validate in background
        try {
          const response = await authService.refresh();
          if (isMounted) {
            localStorage.setItem('merisamaj_user', JSON.stringify(response.user));
            localStorage.setItem('merisamaj_token', response.accessToken);
            setAuth({
              user: response.user,
              accessToken: response.accessToken,
              isAuthenticated: true,
              isInitialized: true,
            });
          }
        } catch (error) {
          // Token expired or invalid, log out
          if (isMounted) {
            localStorage.removeItem('merisamaj_user');
            localStorage.removeItem('merisamaj_token');
            setAuth({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isInitialized: true,
            });
          }
        }
      } else {
        // Fallback to checking cookie if no localStorage item exists
        try {
          const response = await authService.refresh();
          if (isMounted) {
            localStorage.setItem('merisamaj_user', JSON.stringify(response.user));
            localStorage.setItem('merisamaj_token', response.accessToken);
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
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('merisamaj_user', JSON.stringify(response.user));
    localStorage.setItem('merisamaj_token', response.accessToken);
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
    localStorage.setItem('merisamaj_user', JSON.stringify(response.user));
    localStorage.setItem('merisamaj_token', response.accessToken);
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
      localStorage.removeItem('merisamaj_user');
      localStorage.removeItem('merisamaj_token');
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
