/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { initialPurposes, initialDonationHistory } from './mockDonationData';

const DonationContext = createContext(null);

export const DonationProvider = ({ children }) => {
  const [purposes, setPurposes] = useState(initialPurposes);
  const [donationHistory, setDonationHistory] = useState(initialDonationHistory);

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

    return newDonation;
  };

  return (
    <DonationContext.Provider value={{ purposes, donationHistory, makeDonation }}>
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
