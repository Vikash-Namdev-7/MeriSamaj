import React from 'react';
import { EmptyState } from '../components/EmptyStates';
import { HeartHandshake } from 'lucide-react';

export const DonationParticipation = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">Donation Participation</h3>
        <p className="text-sm text-gray-500">Monitor top donors and campaign progress</p>
      </div>
      
      <EmptyState 
        icon={HeartHandshake} 
        title="Donation Metrics Ready" 
        message="Active campaigns and contribution tracking will be displayed here." 
      />
    </div>
  );
};
