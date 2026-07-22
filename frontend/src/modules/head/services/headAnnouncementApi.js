import { axiosPrivate } from '../../../core/api/axiosPrivate';

const BASE_URL = '/head/announcements';

export const headAnnouncementApi = {
  // ─── Channel Management ────────────────────────────────────────────────────────
  getChannels: async () => {
    const res = await axiosPrivate.get(BASE_URL);
    return res.data.data;
  },

  getChannelById: async (id) => {
    const res = await axiosPrivate.get(`${BASE_URL}/${id}`);
    return res.data.data;
  },

  createChannel: async (data) => {
    // data can be FormData if image is included, else JSON
    const res = await axiosPrivate.post(BASE_URL, data);
    return res.data.data;
  },

  updateChannel: async (id, data) => {
    const res = await axiosPrivate.patch(`${BASE_URL}/${id}`, data);
    return res.data.data;
  },

  archiveChannel: async (id) => {
    const res = await axiosPrivate.patch(`${BASE_URL}/${id}/archive`);
    return res.data.data;
  },

  deleteChannel: async (id) => {
    const res = await axiosPrivate.delete(`${BASE_URL}/${id}`);
    return res.data;
  },

  // ─── Messages & Interactions ───────────────────────────────────────────────────
  getMessages: async (channelId, page = 1, limit = 30) => {
    const res = await axiosPrivate.get(`${BASE_URL}/${channelId}/messages?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  postMessage: async (channelId, data) => {
    // data can be FormData or JSON
    const res = await axiosPrivate.post(`${BASE_URL}/${channelId}/messages`, data);
    return res.data.data;
  },

  pinMessage: async (messageId) => {
    const res = await axiosPrivate.patch(`${BASE_URL}/messages/${messageId}/pin`);
    return res.data;
  },

  deleteMessage: async (messageId) => {
    const res = await axiosPrivate.delete(`${BASE_URL}/messages/${messageId}`);
    return res.data;
  }
};
