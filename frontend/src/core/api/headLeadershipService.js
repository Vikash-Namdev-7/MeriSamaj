import { axiosPrivate } from './axiosPrivate';

const BASE_URL = '/head/leadership';

const headLeadershipService = {
  getSubLeaders: async () => {
    const response = await axiosPrivate.get(`${BASE_URL}/sub-leaders`);
    return response.data;
  },

  createSubLeader: async (data) => {
    const response = await axiosPrivate.post(`${BASE_URL}/sub-leaders`, data);
    return response.data;
  },

  updateSubLeader: async (id, data) => {
    const response = await axiosPrivate.put(`${BASE_URL}/sub-leaders/${id}`, data);
    return response.data;
  },

  toggleSubLeaderStatus: async (id) => {
    const response = await axiosPrivate.patch(`${BASE_URL}/sub-leaders/${id}/status`);
    return response.data;
  },

  deleteSubLeader: async (id) => {
    const response = await axiosPrivate.delete(`${BASE_URL}/sub-leaders/${id}`);
    return response.data;
  }
};

export default headLeadershipService;
