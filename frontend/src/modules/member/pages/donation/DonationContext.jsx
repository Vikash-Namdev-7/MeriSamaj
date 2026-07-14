/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { initialPurposes, initialDonationHistory, topDonors as initialTopDonors } from './mockDonationData';
import { useData } from '../../context/DataProvider';

const DonationContext = createContext(null);

export const DonationProvider = ({ children }) => {
  const { currentUser } = useData();
  const [purposes, setPurposes] = useState(initialPurposes);
  const [donationHistory, setDonationHistory] = useState(initialDonationHistory);
  const [topDonors, setTopDonors] = useState(initialTopDonors);

  const makeDonation = (purposeId, amount, type) => {
    const targetPurpose = purposes.find(p => p.id === purposeId);
    if (!targetPurpose) return null;

    const formattedAmount = Number(amount);
    
    // Generate Date
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    
    // Generate Time
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Generate TXN ID
    const randomTxnId = `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const newDonation = {
      id: `h${Date.now()}`,
      purposeId,
      purposeTitle: targetPurpose.title,
      amount: formattedAmount,
      type,
      date: formattedDate,
      time: formattedTime,
      txnId: randomTxnId
    };

    // Add to user donation history
    setDonationHistory(prev => [newDonation, ...prev]);

    // Update purposes progress
    setPurposes(prevPurposes => 
      prevPurposes.map(purpose => {
        if (purpose.id === purposeId) {
          const newRaised = purpose.raised + formattedAmount;
          const newPercentage = Math.min(Math.round((newRaised / purpose.target) * 100), 100);
          return {
            ...purpose,
            raised: newRaised,
            percentage: newPercentage
          };
        }
        return purpose;
      })
    );

    // Update topDonors list dynamically
    const userName = currentUser?.name || "You";
    const userInitials = currentUser?.initials || (currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : "YO");
    const userAvatar = currentUser?.avatar || "";

    setTopDonors(prevTopDonors => {
      const newDonorRecord = {
        id: `td_user_${Date.now()}`,
        name: userName,
        amount: formattedAmount,
        initials: userInitials,
        purpose: targetPurpose.title,
        date: `${formattedDate}, ${formattedTime}`,
        paymentMode: type === "One-time" ? "Online (UPI)" : "Bank Transfer",
        avatar: userAvatar
      };

      const existingDonorIdx = prevTopDonors.findIndex(d => d.name === userName);
      if (existingDonorIdx >= 0) {
        const updated = [...prevTopDonors];
        updated[existingDonorIdx] = {
          ...updated[existingDonorIdx],
          amount: updated[existingDonorIdx].amount + formattedAmount,
          purpose: targetPurpose.title,
          date: `${formattedDate}, ${formattedTime}`,
          paymentMode: type === "One-time" ? "Online (UPI)" : "Bank Transfer"
        };
        return updated;
      } else {
        return [...prevTopDonors, newDonorRecord];
      }
    });

    return newDonation;
  };

  return (
    <DonationContext.Provider value={{ purposes, donationHistory, topDonors, makeDonation }}>
      {children || <Outlet />}
    </DonationContext.Provider>
  );
};

export const useDonation = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
};
