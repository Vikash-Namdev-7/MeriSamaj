import { axiosPrivate } from '../../../core/api/axiosPrivate';

const API_BASE = '/admin/reports';

export const adminReportsService = {
  getRevenueReport: async (params = {}) => {
    const res = await axiosPrivate.get(`${API_BASE}/revenue`, { params });
    return res.data;
  },

  getCommunityReport: async (params = {}) => {
    const res = await axiosPrivate.get(`${API_BASE}/community`, { params });
    return res.data;
  },

  getUserReport: async (params = {}) => {
    const res = await axiosPrivate.get(`${API_BASE}/user`, { params });
    return res.data;
  },

  getMatrimonialReport: async (params = {}) => {
    const res = await axiosPrivate.get(`${API_BASE}/matrimonial`, { params });
    return res.data;
  },

  getSubscriptionReport: async (params = {}) => {
    const res = await axiosPrivate.get(`${API_BASE}/subscriptions`, { params });
    return res.data;
  }
};

export default adminReportsService;
