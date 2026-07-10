import { axiosPrivate } from '../api/axiosPrivate';
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { authService } from './authService';

export const useAxiosPrivate = () => {
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        if (!config.headers['Authorization'] && auth?.accessToken) {
          config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      response => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          try {
            // Attempt to get a new access token using the HTTP-only refresh token cookie
            const response = await authService.refresh();
            const newAccessToken = response.accessToken;
            
            setAuth(prev => {
              return { ...prev, accessToken: newAccessToken };
            });
            
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            // Refresh token expired or invalid, log out the user
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
  }, [auth, setAuth]);

  return axiosPrivate;
};
