import { axiosPrivate } from '../core/api/axiosPrivate';

const API_BASE = '/admin/donations';

export const adminDonationApi = {
  getAllDonations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosPrivate.get(`${API_BASE}${query ? `?${query}` : ''}`);
    return res.data;
  },

  createDonation: async (donationData) => {
    const res = await axiosPrivate.post(API_BASE, donationData);
    return res.data;
  },

  updateDonation: async (id, donationData) => {
    const res = await axiosPrivate.put(`${API_BASE}/${id}`, donationData);
    return res.data;
  },

  closeDonation: async (id) => {
    const res = await axiosPrivate.patch(`${API_BASE}/${id}/close`);
    return res.data;
  },

  deleteDonation: async (id) => {
    const res = await axiosPrivate.delete(`${API_BASE}/${id}`);
    return res.data;
  }
};

export default adminDonationApi;
