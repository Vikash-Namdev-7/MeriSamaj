import React from 'react';
import { Building2 } from 'lucide-react';
import { SocialPostList } from './components/SocialPostList';

export const SocialCommunityFeed = () => {
  return (
    <SocialPostList
      feedType="community"
      title="Community Feed Moderation"
      subtitle="View and moderate Community Feed posts strictly for your assigned community."
      icon={Building2}
    />
  );
};

export default SocialCommunityFeed;
