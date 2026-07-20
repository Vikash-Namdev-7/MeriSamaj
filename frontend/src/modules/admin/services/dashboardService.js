import { axiosPrivate } from '../../../core/api/axiosPrivate';

export const dashboardService = {
  getOverview: async () => {
    try {
      const response = await axiosPrivate.get('/admin/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error);
      throw error;
    }
  }
};
