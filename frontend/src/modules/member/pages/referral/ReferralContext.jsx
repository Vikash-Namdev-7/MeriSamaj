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
  const [referralCode] = useState('MERI123');
  const [totalPoints, setTotalPoints] = useState(2450);
  const [pendingPoints] = useState(1200);
  const [totalEarned] = useState(3450);
  const [redeemedPoints, setRedeemedPoints] = useState(1250);
  const conversionRate = 1; // 1 Point = 1 INR
  
  // Gamification & Stats
  const [totalReferrals] = useState(28);
  const [registeredUsers] = useState(24);
  const [paidSubscribers] = useState(17);
  const referralConversionRate = ((paidSubscribers / registeredUsers) * 100).toFixed(2);
  const [monthlyRank] = useState(42);
  
  // Badges array
  const [unlockedBadges] = useState([
    { id: 'b1', name: 'High Five', icon: '🖐️', desc: '5 Referrals', date: '2026-01-10T10:00:00Z', progress: '5/5', completed: true },
    { id: 'b2', name: 'Gold Member', icon: '👑', desc: '25 Referrals', date: '2026-04-20T10:00:00Z', progress: '28/25', completed: true },
    { id: 'b3', name: 'Super Referrer', icon: '⭐', desc: '50 Referrals', date: null, progress: '28/50', completed: false },
  ]);

  const currentLevel = LEVELS.slice().reverse().find(l => paidSubscribers >= l.minReferrals) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minReferrals > paidSubscribers) || null;

  // Chart Data
  const [earningsOverview] = useState([
    { month: 'Jan', value: 500 },
    { month: 'Feb', value: 800 },
    { month: 'Mar', value: 1100 },
    { month: 'Apr', value: 1500 },
    { month: 'May', value: 2000 },
    { month: 'Jun', value: 2450 },
  ]);

  // Earnings Summary (for secondary views)
  const earningsSummary = [
    { title: 'Registration Reward', count: '9 Referrals', amount: 450, icon: 'Users' },
    { title: 'Subscription Reward', count: '8 Subscribers', amount: 700, icon: 'Crown' },
    { title: 'Bonus Reward', count: 'Campaign', amount: 100, icon: 'Gift' },
    { title: 'Cashback Earned', count: '2 Transactions', amount: 50, icon: 'Wallet' }
  ];

  // Top Earners (Leaderboard)
  const topEarners = [
    { id: 1, name: 'Amit Sharma', points: 12450, avatar: 'https://i.pravatar.cc/150?u=amit' },
    { id: 2, name: 'Neha Verma', points: 9850, avatar: 'https://i.pravatar.cc/150?u=neha' },
    { id: 3, name: 'Rohit Singh', points: 8600, avatar: 'https://i.pravatar.cc/150?u=rohit' },
  ];

  // Recent Activity Feed
  const recentActivity = [
    { id: 1, name: 'Rohit Sharma', date: '2 May 2026', action: 'Joined using your code', points: 50, type: 'join', avatar: 'https://i.pravatar.cc/150?u=rohit' },
    { id: 2, name: 'Anjali Verma', date: '1 May 2026', action: 'Premium Subscription', points: 100, type: 'subscription', avatar: 'https://i.pravatar.cc/150?u=anjali' },
    { id: 3, name: 'Vikash Kumar', date: '30 Apr 2026', action: 'Joined using your code', points: 50, type: 'join', avatar: 'https://i.pravatar.cc/150?u=vikash' },
    { id: 4, name: 'System', date: '28 Apr 2026', action: 'Rewards Credited', points: 200, type: 'bonus', avatar: null },
  ];

  const [referralHistory] = useState([
    { id: 1, name: 'Rohit Sharma', date: '2026-05-02T10:30:00Z', action: 'Joined using your code', points: POINTS_CONFIG.REGISTRATION, status: 'earned', type: 'registration' },
    { id: 2, name: 'Anjali Verma', date: '2026-05-01T14:15:00Z', action: 'Premium Subscription', points: POINTS_CONFIG.SUBSCRIPTION, status: 'earned', type: 'subscription' },
  ]);

  const [redemptionHistory, setRedemptionHistory] = useState([
    { id: 101, amount: 500, date: '2026-04-15T12:00:00Z', method: 'UPI', status: 'Completed', type: 'redeemed' },
  ]);

  // Validation function
  const validateReferralCode = async (code) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ valid: true, discountValue: 100, message: 'Code Applied! Flat ₹100 OFF.' }), 800);
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
        
        setTotalPoints(prev => prev - amount);
        setRedeemedPoints(prev => prev + amount);
        
        const newRedemption = {
          id: Date.now(),
          amount,
          date: new Date().toISOString(),
          method,
          status: method === 'Subscription Checkout' ? 'Completed' : 'Processing',
          type: 'redeemed'
        };
        setRedemptionHistory(prev => [newRedemption, ...prev]);
        resolve({ success: true, message: `Successfully redeemed ${amount} points.` });
      }, 1500);
    });
  };

  const calculateCheckoutDiscount = (originalPrice, applyPoints = false, appliedCode = null) => {
    let codeDiscount = appliedCode ? 100 : 0;
    let subtotal = originalPrice - codeDiscount;
    let pointsRedeemed = applyPoints ? Math.min(totalPoints, subtotal) : 0;
    return {
      originalPrice,
      codeDiscount,
      pointsRedeemed,
      finalAmount: Math.max(0, subtotal - pointsRedeemed)
    };
  };

  const value = {
    referralCode,
    totalPoints,
    pendingPoints,
    totalEarned,
    redeemedPoints,
    availablePoints: totalPoints,
    conversionRate,
    totalReferrals,
    registeredUsers,
    paidSubscribers,
    referralConversionRate,
    monthlyRank,
    unlockedBadges,
    currentLevel,
    nextLevel,
    earningsOverview,
    earningsSummary,
    topEarners,
    recentActivity,
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

