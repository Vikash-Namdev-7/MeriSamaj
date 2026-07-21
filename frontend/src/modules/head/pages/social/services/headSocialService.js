import { axiosPrivate } from '../../../../../core/api/axiosPrivate';

export const headSocialService = {
  /**
   * Fetch City Feed posts for logged-in Head's jurisdiction
   */
  getCityFeed: async (params = {}) => {
    try {
      const response = await axiosPrivate.get('/head/social/city-feed', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch City Feed');
    }
  },

  /**
   * Fetch Community Feed posts for logged-in Head's community
   */
  getCommunityFeed: async (params = {}) => {
    try {
      const response = await axiosPrivate.get('/head/social/community-feed', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Community Feed');
    }
  },

  /**
   * Fetch complete post details with full likes and comments lists
   */
  getPostDetails: async (postId) => {
    try {
      const response = await axiosPrivate.get(`/head/social/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch post details');
    }
  },

  /**
   * Soft Delete post
   */
  softDeletePost: async (postId) => {
    try {
      const response = await axiosPrivate.delete(`/head/social/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to soft delete post');
    }
  },

  /**
   * Restore a soft-deleted post
   */
  restorePost: async (postId) => {
    try {
      const response = await axiosPrivate.post(`/head/social/posts/${postId}/restore`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to restore post');
    }
  }
};
