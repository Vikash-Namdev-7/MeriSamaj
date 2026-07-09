import React from 'react';
import { useTimeline } from '../hooks/useTimeline';
import { TimelineItem } from '../components/TimelineItem';
import { LoadingSkeleton, EmptyState } from '../components/EmptyStates';
import { Clock } from 'lucide-react';

export const CommunityTimeline = () => {
  const { events, isLoading, error } = useTimeline();

  if (isLoading) return <LoadingSkeleton rows={5} />;
  if (error || !events?.length) return <EmptyState icon={Clock} title="No Timeline Events" message="Activities will appear here once members start engaging." />;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">Recent Activities</h3>
        <p className="text-sm text-gray-500">Live feed of community engagement</p>
      </div>
      <div className="space-y-0">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
