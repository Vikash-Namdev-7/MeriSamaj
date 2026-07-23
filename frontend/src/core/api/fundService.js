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

// ── Razorpay Payment API Methods ───────────────────────────────────────────────

/**
 * Creates a Razorpay order for a fund contribution.
 * @param {string} fundId - MongoDB Fund ID
 * @param {number} amount - Contribution amount in INR
 * @returns {{ order_id, amount, currency, key }}
 */
const createFundOrder = async (fundId, amount) => {
  const response = await axiosPrivate.post(`${API_URL}/create-order`, { fundId, amount });
  return response.data;
};

/**
 * Verifies Razorpay payment signature and records the contribution.
 * @param {object} payload - { razorpay_payment_id, razorpay_order_id, razorpay_signature, fundId, amount }
 */
const verifyFundPayment = async (payload) => {
  const response = await axiosPrivate.post(`${API_URL}/verify-payment`, payload);
  return response.data;
};

const fundService = {
  getFundsData,
  payFund,
  addFund,
  addExpense,
  getHistory,
  createFundOrder,
  verifyFundPayment
};

export default fundService;

