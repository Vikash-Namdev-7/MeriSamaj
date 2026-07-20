import React, { createContext, useContext, useState, useEffect } from 'react';
import fundService from '../../../core/api/fundService';
import { useAuth } from '../../../core/auth/useAuth';

const FundContext = createContext();

export const useFund = () => useContext(FundContext);

export const FundProvider = ({ children }) => {
  const { auth } = useAuth();
  
  const [funds, setFunds] = useState([]);
  const [contributions, setContributions] = useState({});
  const [expenses, setExpenses] = useState({});
  const [mockUsers, setMockUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Resolve logged-in user dynamically from session
  const currentUserId = auth.user?.id || auth.user?._id || '';
  const isAdmin = ['admin', 'head'].includes(auth.user?.role || '');

  const fetchFundsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fundService.getFundsData();
      if (res.success && res.data) {
        setFunds(res.data.funds || []);
        setContributions(res.data.contributions || {});
        setExpenses(res.data.expenses || {});
        setMockUsers(res.data.mockUsers || []);
      }
    } catch (err) {
      console.error('Failed to fetch funds data:', err);
      setError('Failed to load Samaj funds data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchFundsData();
    } else {
      // Reset state on logout
      setFunds([]);
      setContributions({});
      setExpenses({});
      setMockUsers([]);
      setLoading(false);
    }
  }, [auth.isAuthenticated, currentUserId]);

  // Get funds assigned to a specific user (or all if admin viewing global)
  const getUserFunds = (userId) => {
    return funds.filter(fund => fund.assignedMembers.includes(userId));
  };

  const getFundById = (fundId) => funds.find(f => f.id === fundId);
  const getContributionsByFund = (fundId) => contributions[fundId] || [];
  const getExpensesByFund = (fundId) => expenses[fundId] || [];

  const getUserContribution = (fundId, userId) => {
    const fundContribs = getContributionsByFund(fundId);
    return fundContribs.find(c => c.memberId === userId);
  };

  // Actions
  const makePayment = async (fundId, userId, amount, paymentMethod) => {
    try {
      const details = { paymentMethod };
      const res = await fundService.payFund(fundId, amount, details);
      if (res.success) {
        await fetchFundsData(); // reload statistics and contributions list
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      console.error('Payment error:', err);
      return { success: false, message: 'Server error occurred during payment processing.' };
    }
  };

  const addFund = async (newFundData) => {
    try {
      const res = await fundService.addFund(newFundData);
      if (res.success) {
        await fetchFundsData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Failed to create fund:', err);
      return { success: false };
    }
  };

  const addExpense = async (fundId, expenseData) => {
    try {
      const res = await fundService.addExpense(fundId, expenseData);
      if (res.success) {
        await fetchFundsData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Failed to add expense:', err);
      return { success: false };
    }
  };

  return (
    <FundContext.Provider value={{
      funds,
      contributions,
      expenses,
      currentUserId,
      isAdmin,
      loading,
      error,
      getUserFunds,
      getFundById,
      getContributionsByFund,
      getExpensesByFund,
      getUserContribution,
      makePayment,
      addFund,
      addExpense,
      mockUsers,
      fetchFundsData
    }}>
      {children}
    </FundContext.Provider>
  );
};
