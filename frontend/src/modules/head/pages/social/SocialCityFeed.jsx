import React from 'react';
import { MapPin } from 'lucide-react';
import { SocialPostList } from './components/SocialPostList';

export const SocialCityFeed = () => {
  return (
    <SocialPostList
      feedType="city"
      title="City Feed Moderation"
      subtitle="View and moderate City Feed posts for your assigned city jurisdiction."
      icon={MapPin}
    />
  );
};

export default SocialCityFeed;
