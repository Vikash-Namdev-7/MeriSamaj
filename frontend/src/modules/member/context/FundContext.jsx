import React, { createContext, useContext, useState } from 'react';
import { initialFunds, initialContributions, initialExpenses, mockUsers } from '../data/mockFund';

const FundContext = createContext();

export const useFund = () => useContext(FundContext);

export const FundProvider = ({ children }) => {
  const [funds, setFunds] = useState(initialFunds);
  const [contributions, setContributions] = useState(initialContributions);
  const [expenses, setExpenses] = useState(initialExpenses);
  
  // For demonstration, assume the logged-in user is 'm1'
  const currentUserId = 'm1';
  
  // Also provide a way to toggle Admin mode for UI demonstration
  const [isAdmin, setIsAdmin] = useState(true);

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
  const makePayment = (fundId, userId, amount) => {
    setContributions(prev => {
      const fundData = prev[fundId] || [];
      const updatedFundData = fundData.map(c => {
        if (c.memberId === userId) {
          return {
            ...c,
            paidAmount: c.paidAmount + amount,
            lastPaymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          };
        }
        return c;
      });
      return { ...prev, [fundId]: updatedFundData };
    });
  };

  const addFund = (newFundData) => {
    const newId = 'f' + (funds.length + 1);
    const newFund = { ...newFundData, id: newId, status: 'Active' };
    
    // Initialize contributions for assigned members
    const fundContributions = newFund.assignedMembers.map(memberId => ({
      memberId,
      assignedAmount: newFund.contributionPerMember,
      paidAmount: 0,
      lastPaymentDate: null
    }));

    setFunds([...funds, newFund]);
    setContributions(prev => ({ ...prev, [newId]: fundContributions }));
    setExpenses(prev => ({ ...prev, [newId]: [] }));
  };

  const addExpense = (fundId, expenseData) => {
    const newExpense = {
      ...expenseData,
      id: 'e' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      addedBy: isAdmin ? 'Admin' : 'Member',
    };
    
    setExpenses(prev => {
      const fundExpenses = prev[fundId] || [];
      return { ...prev, [fundId]: [...fundExpenses, newExpense] };
    });
  };

  return (
    <FundContext.Provider value={{
      funds,
      contributions,
      expenses,
      currentUserId,
      isAdmin,
      setIsAdmin,
      getUserFunds,
      getFundById,
      getContributionsByFund,
      getExpensesByFund,
      getUserContribution,
      makePayment,
      addFund,
      addExpense,
      mockUsers
    }}>
      {children}
    </FundContext.Provider>
  );
};
