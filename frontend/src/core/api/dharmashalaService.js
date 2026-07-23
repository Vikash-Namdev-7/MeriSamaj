import { axiosPrivate } from './axiosPrivate';

const API_URL = '/member/dharmashala';

const dharmashalaService = {
  getDharmashalas: async (params = {}) => {
    const response = await axiosPrivate.get(API_URL, { params });
    return response.data;
  },

  getDharmashalaById: async (id) => {
    const response = await axiosPrivate.get(`${API_URL}/${id}`);
    return response.data;
  },

  getAvailability: async (id, month, year) => {
    const response = await axiosPrivate.get(`${API_URL}/${id}/availability`, {
      params: { month, year }
    });
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await axiosPrivate.post(`${API_URL}/bookings`, bookingData);
    return response.data;
  },

  getBookingHistory: async () => {
    const response = await axiosPrivate.get(`${API_URL}/bookings`);
    return response.data;
  },

  payBooking: async (id) => {
    const response = await axiosPrivate.post(`${API_URL}/bookings/${id}/pay`);
    return response.data;
  },

  createRazorpayOrder: async (bookingId) => {
    const response = await axiosPrivate.post(`${API_URL}/bookings/create-order`, { bookingId });
    return response.data;
  },

  verifyRazorpayPayment: async (paymentData) => {
    const response = await axiosPrivate.post(`${API_URL}/bookings/verify-payment`, paymentData);
    return response.data;
  },

  cancelBooking: async (id, reason = '') => {
    const response = await axiosPrivate.post(`${API_URL}/bookings/${id}/cancel`, { reason });
    return response.data;
  }
};

export default dharmashalaService;
