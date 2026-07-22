import { axiosPrivate } from '../../../core/api/axiosPrivate';

export const getMembers = async (params) => {
  try {
    const response = await axiosPrivate.get('/member/members', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};

export const getMemberById = async (id) => {
  try {
    const response = await axiosPrivate.get(`/member/members/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};

export const getMemberStats = async () => {
  try {
    const response = await axiosPrivate.get('/member/members/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};


