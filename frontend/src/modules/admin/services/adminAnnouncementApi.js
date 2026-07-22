import { axiosPrivate } from '../../../core/api/axiosPrivate';

const BASE_URL = '/admin/announcement-channels';

export const adminAnnouncementApi = {
  // ─── Global Channel Management ───────────────────────────────────────────────
  getGlobalChannels: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.communityId && filters.communityId !== 'all') {
      params.append('communityId', filters.communityId);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    const res = await axiosPrivate.get(`${BASE_URL}?${params.toString()}`);
    return res.data.data;
  },

  getChannelById: async (id) => {
    const res = await axiosPrivate.get(`${BASE_URL}/${id}`);
    return res.data.data;
  },

  updateChannelPermission: async (id, whoCanPost) => {
    const res = await axiosPrivate.patch(`${BASE_URL}/${id}/posting-permission`, { whoCanPost });
    return res.data.data;
  },

  archiveChannel: async (id) => {
    const res = await axiosPrivate.patch(`${BASE_URL}/${id}/archive`);
    return res.data.data;
  },

  deleteChannel: async (id) => {
    const res = await axiosPrivate.delete(`${BASE_URL}/${id}`);
    return res.data;
  }
};
