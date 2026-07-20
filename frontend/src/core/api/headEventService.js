import { axiosPrivate } from './axiosPrivate';

export const headEventService = {
  getEvents: async () => {
    const response = await axiosPrivate.get('/head/events');
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await axiosPrivate.post('/head/events', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await axiosPrivate.put(`/head/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await axiosPrivate.delete(`/head/events/${id}`);
    return response.data;
  },

  toggleFeatured: async (id) => {
    const response = await axiosPrivate.patch(`/head/events/${id}/feature`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosPrivate.patch(`/head/events/${id}/status`, { status });
    return response.data;
  },

  getMonitoringLogs: async () => {
    const response = await axiosPrivate.get('/head/events/monitoring');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axiosPrivate.get('/head/events/analytics');
    return response.data;
  },

  getAttendees: async (eventId) => {
    const response = await axiosPrivate.get(`/head/events/${eventId}/attendees`);
    return response.data;
  },

  getInterested: async (eventId) => {
    const response = await axiosPrivate.get(`/head/events/${eventId}/interested`);
    return response.data;
  }
};
export default headEventService;
