import React, { createContext, useContext, useState } from 'react';

const ReferralContext = createContext();

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
};

// Admin Configuration Mock
export const POINTS_CONFIG = {
  REGISTRATION: 50,
  SUBSCRIPTION: 100,
  MEMBERSHIP: 150,
  DONATION: 75,
};

export const LEVELS = [
  { name: 'Bronze', minReferrals: 0, color: 'text-orange-400', bg: 'bg-orange-100' },
  { name: 'Silver', minReferrals: 5, color: 'text-slate-400', bg: 'bg-slate-100' },
  { name: 'Gold', minReferrals: 15, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { name: 'Platinum', minReferrals: 50, color: 'text-teal-400', bg: 'bg-teal-100' },
  { name: 'Diamond', minReferrals: 100, color: 'text-blue-500', bg: 'bg-blue-100' }
];

export const ReferralProvider = ({ children }) => {
  // Mock Data
  const [referralCode, setReferralCode] = useState('MERI123');
  const [totalPoints, setTotalPoints] = useState(2450);
  const [pendingPoints, setPendingPoints] = useState(1200);
  const [redeemedPoints, setRedeemedPoints] = useState(1250);
  const conversionRate = 1; // 1 Point = 1 INR
  
  // Gamification State
  const [totalReferrals, setTotalReferrals] = useState(12);
  const [successfulReferrals, setSuccessfulReferrals] = useState(8);
  const [monthlyRank, setMonthlyRank] = useState(42);
  
  // Badges array: id, name, icon (emoji or string), date
  const [unlockedBadges, setUnlockedBadges] = useState([
    { id: 'b1', name: 'First Blood', icon: '🎯', date: '2026-01-10T10:00:00Z' },
    { id: 'b2', name: 'High Five', icon: '🖐️', date: '2026-02-15T10:00:00Z' },
    { id: 'b3', name: 'Gold Member', icon: '👑', date: '2026-04-20T10:00:00Z' }
  ]);

  const currentLevel = LEVELS.slice().reverse().find(l => successfulReferrals >= l.minReferrals) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minReferrals > successfulReferrals) || null;

  // Extended History Data (Categorized by type)
  const [referralHistory, setReferralHistory] = useState([
    { id: 1, name: 'Rohit Sharma', date: '2026-05-02T10:30:00Z', action: 'Joined using your code', points: POINTS_CONFIG.REGISTRATION, status: 'earned', type: 'registration' },
    { id: 2, name: 'Anjali Verma', date: '2026-05-01T14:15:00Z', action: 'Premium Subscription', points: POINTS_CONFIG.SUBSCRIPTION, status: 'earned', type: 'subscription' },
    { id: 3, name: 'Vikash Kumar', date: '2026-04-30T09:00:00Z', action: 'Joined using your code', points: POINTS_CONFIG.REGISTRATION, status: 'earned', type: 'registration' },
    { id: 4, name: 'Neha Singh', date: '2026-04-28T16:45:00Z', action: 'Membership Purchase', points: POINTS_CONFIG.MEMBERSHIP, status: 'earned', type: 'membership' },
    { id: 5, name: 'Amit Patel', date: '2026-04-25T11:20:00Z', action: 'Joined using your code', points: POINTS_CONFIG.REGISTRATION, status: 'pending', type: 'registration' },
  ]);

  const [redemptionHistory, setRedemptionHistory] = useState([
    { id: 101, amount: 500, date: '2026-04-15T12:00:00Z', method: 'UPI', status: 'Completed', type: 'redeemed' },
    { id: 102, amount: 750, date: '2026-03-10T09:30:00Z', method: 'Bank Transfer', status: 'Completed', type: 'redeemed' },
  ]);

  // Validation function for registration & subscription flow
  const validateReferralCode = async (code) => {
    // Simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        // ALWAYS return true for demonstration purposes
        resolve({ valid: true, discountValue: 100, message: 'Code Applied! Flat ₹100 OFF.' });
      }, 800);
    });
  };

  const redeemPoints = async (amount, method, details) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount > totalPoints) {
          reject(new Error('Insufficient points'));
          return;
        }
        if (amount < 500 && method !== 'Subscription Checkout') {
          reject(new Error('Minimum redeem is 500 points'));
          return;
        }
        
        // Success
        setTotalPoints(prev => prev - amount);
        setRedeemedPoints(prev => prev + amount);
        
        const newRedemption = {
          id: Date.now(),
          amount: amount,
          date: new Date().toISOString(),
          method: method,
          status: method === 'Subscription Checkout' ? 'Completed' : 'Processing',
          type: 'redeemed'
        };
        setRedemptionHistory(prev => [newRedemption, ...prev]);
        resolve({ success: true, message: `Successfully redeemed ${amount} points.` });
      }, 1500);
    });
  };

  // Logic for Subscription Checkout
  const calculateCheckoutDiscount = (originalPrice, applyPoints = false, appliedCode = null) => {
    let codeDiscount = 0;
    if (appliedCode) {
      codeDiscount = 100; // Flat ₹100 off based on mock validation
    }
    
    let subtotal = originalPrice - codeDiscount;
    let pointsRedeemed = 0;
    
    if (applyPoints) {
      const maxPointsUsable = Math.min(totalPoints, subtotal);
      pointsRedeemed = maxPointsUsable;
    }
    
    const finalAmount = Math.max(0, subtotal - pointsRedeemed);
    
    return {
      originalPrice,
      codeDiscount,
      pointsRedeemed,
      finalAmount
    };
  };

  const availablePoints = totalPoints;

  const value = {
    referralCode,
    totalPoints,
    pendingPoints,
    redeemedPoints,
    availablePoints,
    conversionRate,
    totalReferrals,
    successfulReferrals,
    monthlyRank,
    unlockedBadges,
    currentLevel,
    nextLevel,
    referralHistory,
    redemptionHistory,
    validateReferralCode,
    redeemPoints,
    calculateCheckoutDiscount
  };

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
};
