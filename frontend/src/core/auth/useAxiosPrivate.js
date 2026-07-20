import { axiosPrivate } from '../api/axiosPrivate';
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useHeadAuth } from '../../modules/head/auth/useHeadAuth';
import { useAdminAuth } from '../../modules/admin/auth/useAdminAuth';
import { authService } from './authService';

export const useAxiosPrivate = () => {
  const { auth, setAuth } = useAuth();
  const { headAuth } = useHeadAuth();
  const { adminAuth, setAdminAuth } = useAdminAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        if (!config.headers['Authorization']) {
          // Route the correct token based on the current context (URL path)
          const isHeadPanel = window.location.pathname.startsWith('/head');
          const isAdminPanel = window.location.pathname.startsWith('/admin');
          
          if (isHeadPanel) {
            const headToken = localStorage.getItem('head_auth_token');
            if (headToken) {
              config.headers['Authorization'] = `Bearer ${headToken}`;
            }
          } else if (isAdminPanel) {
            const adminToken = localStorage.getItem('admin_auth_token');
            if (adminToken) {
              config.headers['Authorization'] = `Bearer ${adminToken}`;
            }
          } else {
            const memberToken = localStorage.getItem('merisamaj_token');
            if (memberToken) {
              config.headers['Authorization'] = `Bearer ${memberToken}`;
            }
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
        const isHeadPanel = window.location.pathname.startsWith('/head');
        const isAdminPanel = window.location.pathname.startsWith('/admin');

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          try {
            if (isHeadPanel) {
              // Attempt to get a new access token using the Head HTTP-only refresh token cookie
              const response = await authService.refreshHead();
              const newAccessToken = response.accessToken;
              localStorage.setItem('head_auth_token', newAccessToken);
              prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axiosPrivate(prevRequest);
            } else if (isAdminPanel) {
              // Attempt to get a new access token using the Admin HTTP-only refresh token cookie
              const response = await authService.refreshAdmin();
              const newAccessToken = response.accessToken;
              localStorage.setItem('admin_auth_token', newAccessToken);
              
              setAdminAuth(prev => ({
                ...prev,
                adminUser: response.user,
                isAuthenticated: true
              }));
              
              prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axiosPrivate(prevRequest);
            } else {
              // Attempt to get a new access token using the Member HTTP-only refresh token cookie
              const response = await authService.refresh();
              const newAccessToken = response.accessToken;
              
              setAuth(prev => {
                localStorage.setItem('merisamaj_token', newAccessToken);
                return { ...prev, user: response.user, accessToken: newAccessToken, isAuthenticated: true };
              });
              
              prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axiosPrivate(prevRequest);
            }
          } catch (refreshError) {
            // Refresh token expired or invalid, clear only the current panel's session
            if (isHeadPanel) {
              localStorage.removeItem('head_auth_user');
              localStorage.removeItem('head_auth_token');
              localStorage.removeItem('head_has_session');
            } else if (isAdminPanel) {
              localStorage.removeItem('admin_auth_user');
              localStorage.removeItem('admin_auth_token');
              localStorage.removeItem('admin_has_session');
              
              setAdminAuth({
                adminUser: null,
                isAuthenticated: false,
                isInitialized: true,
              });
            } else {
              localStorage.removeItem('merisamaj_user');
              localStorage.removeItem('merisamaj_token');
              localStorage.removeItem('merisamaj_has_session');
              
              setAuth({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                isInitialized: true,
              });
            }
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
  }, [auth, setAuth, headAuth, adminAuth, setAdminAuth]);

  return axiosPrivate;
};
