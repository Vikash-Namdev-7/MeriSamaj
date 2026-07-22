import { axiosPrivate } from '../core/api/axiosPrivate';

const API_BASE = '/member/donations';

export const memberDonationApi = {
  getActiveDonations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosPrivate.get(`${API_BASE}${query ? `?${query}` : ''}`);
    return res.data;
  },

  getDonationById: async (id) => {
    const res = await axiosPrivate.get(`${API_BASE}/${id}`);
    return res.data;
  },

  handleDonationPayment: async (id, donationPayload) => {
    const res = await axiosPrivate.post(`${API_BASE}/${id}/donate`, donationPayload);
    return res.data;
  }
};

export default memberDonationApi;
