import { axiosPrivate } from '../../../core/api/axiosPrivate';

export const eventService = {
  getEvents: async () => {
    const response = await axiosPrivate.get('/member/events');
    return response.data;
  },

  getEventById: async (id) => {
    const response = await axiosPrivate.get(`/member/events/${id}`);
    return response.data;
  },

  toggleInterested: async (id) => {
    const response = await axiosPrivate.post(`/member/events/${id}/interested`);
    return response.data;
  },

  toggleAttend: async (id) => {
    const response = await axiosPrivate.post(`/member/events/${id}/attend`);
    return response.data;
  },

  toggleBookmark: async (id) => {
    const response = await axiosPrivate.post(`/member/events/${id}/bookmark`);
    return response.data;
  },

  toggleReminder: async (id) => {
    const response = await axiosPrivate.post(`/member/events/${id}/reminder`);
    return response.data;
  }
};
