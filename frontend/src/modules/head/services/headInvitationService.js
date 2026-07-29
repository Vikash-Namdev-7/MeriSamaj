import { axiosPrivate } from '../../../core/api/axiosPrivate';

const API_BASE = '/head/invitations';

export const headInvitationService = {
  getAllInvitations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosPrivate.get(`${API_BASE}${query ? `?${query}` : ''}`);
    return res.data;
  },

  getStats: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosPrivate.get(`${API_BASE}/stats${query ? `?${query}` : ''}`);
    return res.data;
  },

  getInvitationById: async (id) => {
    const res = await axiosPrivate.get(`${API_BASE}/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await axiosPrivate.patch(`${API_BASE}/${id}/status`, { status });
    return res.data;
  },

  deleteInvitation: async (id) => {
    const res = await axiosPrivate.delete(`${API_BASE}/${id}`);
    return res.data;
  }
};

export default headInvitationService;
