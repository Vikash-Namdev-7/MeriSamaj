import { axiosPrivate } from './axiosPrivate';

export const adminEventService = {
  getAllEvents: async (params) => {
    const response = await axiosPrivate.get('/admin/events', { params });
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await axiosPrivate.post('/admin/events', eventData);
    return response.data;
  },

  getEventById: async (id) => {
    const response = await axiosPrivate.get(`/admin/events/${id}`);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await axiosPrivate.put(`/admin/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await axiosPrivate.delete(`/admin/events/${id}`);
    return response.data;
  },

  toggleFeatured: async (id, isFeatured, priority) => {
    const response = await axiosPrivate.patch(`/admin/events/${id}/feature`, { isFeatured, priority });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosPrivate.patch(`/admin/events/${id}/status`, { status });
    return response.data;
  },

  getMonitoringLogs: async () => {
    const response = await axiosPrivate.get('/admin/events/monitoring');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axiosPrivate.get('/admin/events/analytics');
    return response.data;
  }
};
export default adminEventService;
