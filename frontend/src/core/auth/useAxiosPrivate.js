import { axiosPrivate } from '../api/axiosPrivate';
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useHeadAuth } from '../../modules/head/auth/useHeadAuth';
import { authService } from './authService';

export const useAxiosPrivate = () => {
  const { auth, setAuth } = useAuth();
  const { headAuth } = useHeadAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        if (!config.headers['Authorization']) {
          // If we have a Head Admin token, use it
          const headToken = localStorage.getItem('head_auth_token');
          if (headToken) {
            config.headers['Authorization'] = `Bearer ${headToken}`;
          } else if (auth?.accessToken) {
            config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
          }
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      response => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent && auth?.isAuthenticated) {
          prevRequest.sent = true;
          try {
            // Attempt to get a new access token using the HTTP-only refresh token cookie for member
            const response = await authService.refresh();
            const newAccessToken = response.accessToken;
            
            setAuth(prev => {
              localStorage.setItem('merisamaj_token', newAccessToken);
              return { ...prev, accessToken: newAccessToken };
            });
            
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            // Refresh token expired or invalid, log out the user
            localStorage.removeItem('merisamaj_user');
            localStorage.removeItem('merisamaj_token');
            setAuth({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isInitialized: true,
            });
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, setAuth, headAuth]);

  return axiosPrivate;
};
