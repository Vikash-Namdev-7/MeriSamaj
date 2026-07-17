import { axiosPrivate } from './axiosPrivate';

const API_URL = '/member/obituaries';

// Create a new obituary post
const createObituary = async (obituaryData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  const response = await axiosPrivate.post(API_URL, obituaryData, config);
  return response.data;
};

// Get all obituaries for user's community
const getObituaries = async () => {
  const response = await axiosPrivate.get(API_URL);
  return response.data;
};

// Get single obituary details
const getObituaryById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

// Update an obituary post
const updateObituary = async (id, obituaryData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  const response = await axiosPrivate.put(`${API_URL}/${id}`, obituaryData, config);
  return response.data;
};

// Delete an obituary post
const deleteObituary = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

// Toggle folded hands (haath jode)
const toggleHaathJode = async (id) => {
  const response = await axiosPrivate.put(`${API_URL}/${id}/haathjode`);
  return response.data;
};

// Increment garland count (mala arpan)
const incrementMalaArpan = async (id, delta = 1) => {
  const response = await axiosPrivate.put(`${API_URL}/${id}/malaarpan`, { delta });
  return response.data;
};

// Toggle saving an obituary post
const toggleSave = async (id) => {
  const response = await axiosPrivate.put(`${API_URL}/${id}/save`);
  return response.data;
};

// Increment view count
const incrementViews = async (id) => {
  const response = await axiosPrivate.put(`${API_URL}/${id}/view`);
  return response.data;
};

// Add condolence comment
const addComment = async (id, text) => {
  const response = await axiosPrivate.post(`${API_URL}/${id}/comments`, { text });
  return response.data;
};

// Toggle comment like
const toggleCommentLike = async (id, commentId) => {
  const response = await axiosPrivate.put(`${API_URL}/${id}/comments/${commentId}/like`);
  return response.data;
};

// Update obituary moderation status
const updateObituaryStatus = async (id, status) => {
  const response = await axiosPrivate.put(`${API_URL}/${id}/status`, { status });
  return response.data;
};

const obituaryService = {
  createObituary,
  getObituaries,
  getObituaryById,
  updateObituary,
  deleteObituary,
  toggleHaathJode,
  incrementMalaArpan,
  toggleSave,
  incrementViews,
  addComment,
  toggleCommentLike,
  updateObituaryStatus
};

export default obituaryService;
