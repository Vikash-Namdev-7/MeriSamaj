import React from 'react';
import { EmptyState } from '../components/EmptyStates';
import { CalendarCheck } from 'lucide-react';

export const EventParticipation = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">Event Participation</h3>
        <p className="text-sm text-gray-500">Track attendance and RSVPs for community events</p>
      </div>
      
      <EmptyState 
        icon={CalendarCheck} 
        title="Event Tracking Ready" 
        message="Upcoming events and their participation metrics will appear here." 
      />
    </div>
  );
};
