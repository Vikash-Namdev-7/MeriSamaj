import React, { createContext, useState, useEffect } from 'react';
import { authService } from './authService';

export const AuthContext = createContext({});

// Lightweight flag written to localStorage on login/register and cleared on logout.
// Its presence means a refresh-token cookie *might* still be valid, making the
// silent-refresh attempt worthwhile. Without it we skip the network call entirely,
// eliminating the spurious POST /auth/refresh 401 on first-ever app visits.
const SESSION_FLAG_KEY = 'merisamaj_has_session';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false,
  });

  // Restore auth state on initial load
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const savedUser  = localStorage.getItem('merisamaj_user');
      const savedToken = localStorage.getItem('merisamaj_token');
      const hasSession = localStorage.getItem(SESSION_FLAG_KEY);

      if (savedUser && savedToken) {
        // Fast path: credentials already in localStorage
        if (isMounted) {
          setAuth({
            user: JSON.parse(savedUser),
            accessToken: savedToken,
            isAuthenticated: true,
            isInitialized: true,
          });
        }
      } else if (hasSession) {
        // Session flag exists but localStorage was cleared (e.g. different tab logout).
        // Try to silently restore via the HTTP-only refresh-token cookie.
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
        } catch {
          // Refresh token expired or invalid — clear the stale flag and proceed as guest
          localStorage.removeItem(SESSION_FLAG_KEY);
          if (isMounted) {
            setAuth(prev => ({ ...prev, isInitialized: true }));
          }
        }
      } else {
        // No prior session at all — skip the network call and mark as initialized
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
    localStorage.setItem('merisamaj_user', JSON.stringify(response.user));
    localStorage.setItem('merisamaj_token', response.accessToken);
    localStorage.setItem(SESSION_FLAG_KEY, '1');
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
    localStorage.setItem(SESSION_FLAG_KEY, '1');
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
      localStorage.removeItem(SESSION_FLAG_KEY);
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
