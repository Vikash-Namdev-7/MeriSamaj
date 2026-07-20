import { axiosPrivate } from './axiosPrivate';

const API_URL = '/member/voting';

// Get all votings for community
const getVotings = async () => {
  const response = await axiosPrivate.get(API_URL);
  return response.data;
};

// Get single voting by id
const getVotingById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

// Cast a vote
const castVote = async (id, candidateId) => {
  const response = await axiosPrivate.post(`${API_URL}/${id}/vote`, { candidateId });
  return response.data;
};

const votingService = {
  getVotings,
  getVotingById,
  castVote
};

export default votingService;
