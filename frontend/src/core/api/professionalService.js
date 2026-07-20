import { axiosPrivate } from './axiosPrivate';

const API_BASE = '/member/professional';
const ADMIN_BASE = '/admin/professional';
const HEAD_BASE = '/head/professional';

export const professionalService = {
  // Member Endpoints
  getProfessionals: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    const res = await axiosPrivate.get(`${API_BASE}?${params.toString()}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await axiosPrivate.get(`${API_BASE}/categories`);
    return res.data;
  },

  getProfessionalById: async (id) => {
    const res = await axiosPrivate.get(`${API_BASE}/${id}`);
    return res.data;
  },

  createProfessional: async (data) => {
    const res = await axiosPrivate.post(API_BASE, data);
    return res.data;
  },

  updateProfessional: async (id, data) => {
    const res = await axiosPrivate.put(`${API_BASE}/${id}`, data);
    return res.data;
  },

  deleteProfessional: async (id) => {
    const res = await axiosPrivate.delete(`${API_BASE}/${id}`);
    return res.data;
  },

  // Admin Endpoints
  adminGetListings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    if (filters.community) params.append('community', filters.community);
    if (filters.credentialStatus) params.append('credentialVerificationStatus', filters.credentialStatus);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    const res = await axiosPrivate.get(`${ADMIN_BASE}?${params.toString()}`);
    return res.data;
  },

  adminGetFilterOptions: async () => {
    const res = await axiosPrivate.get(`${ADMIN_BASE}/filter-options`);
    return res.data;
  },

  adminGetListingById: async (id) => {
    const res = await axiosPrivate.get(`${ADMIN_BASE}/${id}`);
    return res.data;
  },

  adminApproveListing: async (id) => {
    const res = await axiosPrivate.post(`${ADMIN_BASE}/${id}/approve`);
    return res.data;
  },

  adminRejectListing: async (id, reason) => {
    const res = await axiosPrivate.post(`${ADMIN_BASE}/${id}/reject`, { reason });
    return res.data;
  },

  adminVerifyCredentials: async (id, status, note) => {
    const res = await axiosPrivate.post(`${ADMIN_BASE}/${id}/verify`, { status, note });
    return res.data;
  },

  adminSuspendListing: async (id) => {
    const res = await axiosPrivate.post(`${ADMIN_BASE}/${id}/suspend`);
    return res.data;
  },

  adminReactivateListing: async (id) => {
    const res = await axiosPrivate.post(`${ADMIN_BASE}/${id}/reactivate`);
    return res.data;
  },

  // Admin Category Endpoints
  adminGetCategories: async () => {
    const res = await axiosPrivate.get(`${ADMIN_BASE}/categories`);
    return res.data;
  },

  adminCreateCategory: async (data) => {
    const res = await axiosPrivate.post(`${ADMIN_BASE}/categories`, data);
    return res.data;
  },

  adminUpdateCategory: async (id, data) => {
    const res = await axiosPrivate.put(`${ADMIN_BASE}/categories/${id}`, data);
    return res.data;
  },

  adminDeleteCategory: async (id) => {
    const res = await axiosPrivate.delete(`${ADMIN_BASE}/categories/${id}`);
    return res.data;
  },

  // Head Endpoints
  headGetListings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    if (filters.credentialStatus) params.append('credentialStatus', filters.credentialStatus);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    const res = await axiosPrivate.get(`${HEAD_BASE}?${params.toString()}`);
    return res.data;
  },

  headGetFilterOptions: async () => {
    const res = await axiosPrivate.get(`${HEAD_BASE}/filters`);
    return res.data;
  },

  headGetListingById: async (id) => {
    const res = await axiosPrivate.get(`${HEAD_BASE}/${id}`);
    return res.data;
  },

  headApproveListing: async (id) => {
    const res = await axiosPrivate.post(`${HEAD_BASE}/${id}/approve`);
    return res.data;
  },

  headRejectListing: async (id, reason) => {
    const res = await axiosPrivate.post(`${HEAD_BASE}/${id}/reject`, { reason });
    return res.data;
  },

  headVerifyCredentials: async (id, status, note) => {
    const res = await axiosPrivate.post(`${HEAD_BASE}/${id}/verify`, { status, note });
    return res.data;
  },

  headSuspendListing: async (id) => {
    const res = await axiosPrivate.post(`${HEAD_BASE}/${id}/suspend`);
    return res.data;
  },

  headRestoreListing: async (id) => {
    const res = await axiosPrivate.post(`${HEAD_BASE}/${id}/restore`);
    return res.data;
  },

  // Head Category Endpoints
  headGetCategories: async () => {
    const res = await axiosPrivate.get(`${HEAD_BASE}/categories`);
    return res.data;
  },

  headCreateCategory: async (data) => {
    const res = await axiosPrivate.post(`${HEAD_BASE}/categories`, data);
    return res.data;
  },

  headUpdateCategory: async (id, data) => {
    const res = await axiosPrivate.put(`${HEAD_BASE}/categories/${id}`, data);
    return res.data;
  },

  headDeleteCategory: async (id) => {
    const res = await axiosPrivate.delete(`${HEAD_BASE}/categories/${id}`);
    return res.data;
  }
};

export default professionalService;
