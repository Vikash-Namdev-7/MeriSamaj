import { axiosPrivate } from '../../../core/api/axiosPrivate';

const API_URL = '/admin/groups';

export const adminGroupApi = {
  getGroups: async (params) => {
    const res = await axiosPrivate.get(API_URL, { params });
    return res.data;
  },
  
  getGroupById: async (id) => {
    const res = await axiosPrivate.get(`${API_URL}/${id}`);
    return res.data;
  },
  
  createGroup: async (groupData) => {
    const res = await axiosPrivate.post(API_URL, groupData);
    return res.data;
  },
  
  updateGroupStatus: async (id, status) => {
    const res = await axiosPrivate.patch(`${API_URL}/${id}/status`, { status });
    return res.data;
  },
  
  archiveGroup: async (id) => {
    const res = await axiosPrivate.patch(`${API_URL}/${id}/archive`);
    return res.data;
  },
  
  restoreGroup: async (id) => {
    const res = await axiosPrivate.patch(`${API_URL}/${id}/restore`);
    return res.data;
  },
  
  deleteGroup: async (id) => {
    const res = await axiosPrivate.delete(`${API_URL}/${id}`);
    return res.data;
  }
};
