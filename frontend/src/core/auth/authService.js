import { axiosPublic } from '../api/axiosConfig';

export const authService = {
  login: async (credentials) => {
    const response = await axiosPublic.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosPublic.post('/auth/register', userData);
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

  refresh: async () => {
    const response = await axiosPublic.post('/auth/refresh', {}, {
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
