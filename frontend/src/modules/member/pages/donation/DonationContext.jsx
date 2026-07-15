/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import donationService from '../../../../core/api/donationService';
import { useData } from '../../context/DataProvider';

const DonationContext = createContext(null);

export const DonationProvider = ({ children }) => {
  const { currentUser } = useData();
  const [purposes, setPurposes] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [impactStats, setImpactStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonationData = async () => {
    try {
      setIsLoading(true);
      const [campaignsRes, historyRes, statsRes] = await Promise.all([
        donationService.getCampaigns(),
        donationService.getHistory(),
        donationService.getStats()
      ]);

      if (campaignsRes.status === 'success') {
        setPurposes(campaignsRes.data);
      }
      if (historyRes.status === 'success') {
        setDonationHistory(historyRes.data);
      }
      if (statsRes.status === 'success') {
        setTopDonors(statsRes.data.topDonors);
        setImpactStats(statsRes.data.impactStats);
      }
    } catch (error) {
      console.error("Failed to fetch donation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonationData();
  }, []);

  const makeDonation = async (purposeId, amount, type) => {
    try {
      const response = await donationService.createDonation({
        purposeId,
        amount,
        type
      });

      if (response.status === 'success') {
        // Refresh data after successful donation
        await fetchDonationData();
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to submit donation:", error);
      return null;
    }
  };

  return (
    <DonationContext.Provider value={{ purposes, donationHistory, topDonors, impactStats, isLoading, makeDonation }}>
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
