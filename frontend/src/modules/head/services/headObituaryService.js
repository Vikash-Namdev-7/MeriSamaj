import { axiosPrivate } from '../../../core/api/axiosPrivate';

const API_BASE = '/head/obituaries';

export const headObituaryService = {
  getAllObituaries: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosPrivate.get(`${API_BASE}${query ? `?${query}` : ''}`);
    return res.data;
  },

  getStats: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosPrivate.get(`${API_BASE}/stats${query ? `?${query}` : ''}`);
    return res.data;
  },

  getObituaryById: async (id) => {
    const res = await axiosPrivate.get(`${API_BASE}/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await axiosPrivate.patch(`${API_BASE}/${id}/status`, { status });
    return res.data;
  },

  deleteObituary: async (id) => {
    const res = await axiosPrivate.delete(`${API_BASE}/${id}`);
    return res.data;
  }
};

export default headObituaryService;
