import React from 'react';
import { useTopContributors } from '../hooks/useTopContributors';
import { LeaderCard } from '../components/LeaderCard';
import { LoadingSkeleton, EmptyState } from '../components/EmptyStates';
import { Trophy } from 'lucide-react';

export const TopContributors = () => {
  const { contributors, isLoading, error } = useTopContributors();

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (error || !contributors?.length) return <EmptyState icon={Trophy} title="No Contributors Yet" message="Top contributors will be listed here based on activity." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Top Contributors</h3>
          <p className="text-sm text-gray-500">Members with the highest engagement scores</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contributors.map((member) => (
          <LeaderCard key={member.id} rank={member.rank} member={member} />
        ))}
      </div>
    </div>
  );
};
