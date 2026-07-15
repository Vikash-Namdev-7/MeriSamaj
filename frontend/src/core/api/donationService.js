import { axiosPrivate } from './axiosPrivate';

const API_URL = '/member/donations';

const getCampaigns = async () => {
  const response = await axiosPrivate.get(`${API_URL}/campaigns`);
  return response.data;
};

const getCampaignById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/campaigns/${id}`);
  return response.data;
};

const getRecentDonors = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/campaigns/${id}/donors`);
  return response.data;
};

const getHistory = async () => {
  const response = await axiosPrivate.get(`${API_URL}/history`);
  return response.data;
};

const createDonation = async (donationData) => {
  const response = await axiosPrivate.post(`${API_URL}/submit`, donationData);
  return response.data;
};

const getStats = async () => {
  const response = await axiosPrivate.get(`${API_URL}/stats`);
  return response.data;
};

const donationService = {
  getCampaigns,
  getCampaignById,
  getRecentDonors,
  getHistory,
  createDonation,
  getStats
};

export default donationService;
