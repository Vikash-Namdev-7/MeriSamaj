import React from 'react';
import { EmptyState } from '../components/EmptyStates';
import { Share2 } from 'lucide-react';

export const SocialEngagement = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">Social Engagement</h3>
        <p className="text-sm text-gray-500">Monitor posts, comments, polls and surveys</p>
      </div>
      
      <EmptyState 
        icon={Share2} 
        title="Social Dashboard Ready" 
        message="Trending topics and community discussions will be aggregated here." 
      />
    </div>
  );
};
