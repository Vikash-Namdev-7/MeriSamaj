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
          // Route the correct token based on the current context (URL path)
          const isHeadPanel = window.location.pathname.startsWith('/head');
          const headToken = localStorage.getItem('head_auth_token');
          
          if (isHeadPanel && headToken) {
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
        const hasMemberSession = auth?.isAuthenticated || localStorage.getItem('merisamaj_token');
        const hasHeadSession = headAuth?.isAuthenticated || localStorage.getItem('head_auth_token');

        if (error?.response?.status === 401 && !prevRequest?.sent && (hasMemberSession || hasHeadSession)) {
          prevRequest.sent = true;
          try {
            // Attempt to get a new access token using the HTTP-only refresh token cookie
            const response = await authService.refresh();
            const newAccessToken = response.accessToken;
            
            // Update Member Auth Context & Token if they are logged in as a member
            if (hasMemberSession) {
              setAuth(prev => {
                localStorage.setItem('merisamaj_token', newAccessToken);
                return { ...prev, accessToken: newAccessToken };
              });
            }

            // Update Head Auth Token if they are logged in as a Head User
            if (hasHeadSession) {
              localStorage.setItem('head_auth_token', newAccessToken);
            }
            
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            // Refresh token expired or invalid, clear both sessions
            localStorage.removeItem('merisamaj_user');
            localStorage.removeItem('merisamaj_token');
            localStorage.removeItem('head_auth_user');
            localStorage.removeItem('head_auth_token');
            localStorage.removeItem('head_has_session');
            
            setAuth({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isInitialized: true,
            });
            // HeadAuthContext will automatically reload/redirect on next mount
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
