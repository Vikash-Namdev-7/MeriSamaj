import { axiosPublic } from '../api/axiosConfig';

export const authService = {
  login: async (credentials) => {
    const response = await axiosPublic.post('/auth/login', credentials, {
      withCredentials: true
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosPublic.post('/auth/register', userData, {
      withCredentials: true
    });
    return response.data;
  },

  sendOtp: async (data) => {
    // data: { phone, type }
    const response = await axiosPublic.post('/auth/send-otp', data);
    return response.data;
  },

  verifyOtp: async (data) => {
    // data: { phone, otp, type }
    const response = await axiosPublic.post('/auth/verify-otp', data);
    return response.data;
  },

  resetPassword: async (resetData) => {
    // resetData: { phone, otp, newPassword }
    const response = await axiosPublic.post('/auth/reset-password', resetData);
    return response.data;
  },

  refresh: async () => {
    const response = await axiosPublic.post('/auth/refresh', {}, {
      withCredentials: true
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    // Determine if data is FormData (for file uploads) or normal object
    const isFormData = profileData instanceof FormData;
    const response = await axiosPublic.put('/auth/update-profile', profileData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      withCredentials: true
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosPublic.post('/auth/logout', {}, {
      withCredentials: true
    });
    return response.data;
  }
};
