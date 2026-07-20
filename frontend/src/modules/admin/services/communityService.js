/**
 * communityService.js
 * Admin Panel — Community Management API Service
 *
 * All API calls go through the authenticated Axios instance.
 * These endpoints are restricted to Master Admin only.
 */

import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/admin/communities`;

// Helper to get auth headers from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('merisamaj_token') || localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─────────────────────────────────────────────
// GET /admin/communities → All communities with member counts
// ─────────────────────────────────────────────
export const getAllCommunities = async () => {
  const response = await axios.get(API_BASE, { headers: getAuthHeaders() });
  return response.data;
};

// ─────────────────────────────────────────────
// GET /admin/communities/:id → Single community
// ─────────────────────────────────────────────
export const getCommunityById = async (id) => {
  const response = await axios.get(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// ─────────────────────────────────────────────
// POST /admin/communities → Create community
// ─────────────────────────────────────────────
export const createCommunity = async (data) => {
  const response = await axios.post(API_BASE, data, { headers: getAuthHeaders() });
  return response.data;
};

// ─────────────────────────────────────────────
// PUT /admin/communities/:id → Update community info / settings
// ─────────────────────────────────────────────
export const updateCommunity = async (id, data) => {
  const response = await axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() });
  return response.data;
};

// ─────────────────────────────────────────────
// DELETE /admin/communities/:id → Deactivate or delete community
// ─────────────────────────────────────────────
export const deleteCommunity = async (id) => {
  const response = await axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// ─────────────────────────────────────────────
// PUT /admin/communities/:id/assign-head → Assign head (atomic)
// ─────────────────────────────────────────────
export const assignHeadToCommunity = async (communityId, userId) => {
  const response = await axios.put(
    `${API_BASE}/${communityId}/assign-head`,
    { userId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ─────────────────────────────────────────────
// DELETE /admin/communities/:id/assign-head → Remove head
// ─────────────────────────────────────────────
export const removeHeadFromCommunity = async (communityId) => {
  const response = await axios.delete(
    `${API_BASE}/${communityId}/assign-head`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ─────────────────────────────────────────────
// PUT /admin/communities/:id → Update module settings only
// ─────────────────────────────────────────────
export const updateCommunitySettings = async (communityId, settings) => {
  const response = await axios.put(
    `${API_BASE}/${communityId}`,
    { settings },
    { headers: getAuthHeaders() }
  );
  return response.data;
};
