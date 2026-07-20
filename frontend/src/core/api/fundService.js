import { axiosPrivate } from './axiosPrivate';

const API_URL = '/member/fund';

const getFundsData = async () => {
  const response = await axiosPrivate.get(`${API_URL}/funds-data`);
  return response.data;
};

const payFund = async (fundId, amount, details = {}) => {
  const response = await axiosPrivate.post(`${API_URL}/${fundId}/pay`, { amount, ...details });
  return response.data;
};

const addFund = async (fundData) => {
  const response = await axiosPrivate.post(`${API_URL}/`, fundData);
  return response.data;
};

const addExpense = async (fundId, expenseData) => {
  const response = await axiosPrivate.post(`${API_URL}/${fundId}/expense`, expenseData);
  return response.data;
};

const getHistory = async () => {
  const response = await axiosPrivate.get(`${API_URL}/history`);
  return response.data;
};

const fundService = {
  getFundsData,
  payFund,
  addFund,
  addExpense,
  getHistory
};

export default fundService;
