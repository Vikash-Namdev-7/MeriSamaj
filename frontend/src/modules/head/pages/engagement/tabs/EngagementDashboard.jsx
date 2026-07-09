import React from 'react';
import { Users, UserPlus, MessageSquare, Heart, Calendar, Award } from 'lucide-react';
import { useEngagementDashboard } from '../hooks/useEngagementDashboard';
import { MetricCard } from '../components/MetricCard';
import { ProgressRing } from '../components/ProgressRing';
import { LoadingSkeleton, EmptyState } from '../components/EmptyStates';

export const EngagementDashboard = () => {
  const { metrics, isLoading, error } = useEngagementDashboard();

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (error) return <EmptyState icon={Award} title="Error Loading Data" message={error} />;
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Members (Today)"
          value={metrics.activeMembersToday}
          growth={metrics.activeMembersGrowth}
          icon={Users}
          colorClass="bg-blue-500 text-white"
        />
        <MetricCard
          title="New Members (Today)"
          value={metrics.newMembersToday}
          growth={metrics.newMembersGrowth}
          icon={UserPlus}
          colorClass="bg-emerald-500 text-white"
        />
        <MetricCard
          title="Total Posts"
          value={metrics.totalPosts}
          growth={metrics.postsGrowth}
          icon={MessageSquare}
          colorClass="bg-purple-500 text-white"
        />
        <MetricCard
          title="Donations Received"
          value={metrics.donationsReceived}
          prefix="₹"
          icon={Heart}
          colorClass="bg-rose-500 text-white"
        />
      </div>

      {/* Secondary Metrics & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Events Hosted</p>
              <h3 className="text-2xl font-black text-gray-800">{metrics.eventsHosted}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Volunteer Hours</p>
              <h3 className="text-2xl font-black text-gray-800">{metrics.volunteerHours}</h3>
            </div>
          </div>
        </div>
        
        {/* Community Health Score */}
        <div className="bg-gradient-to-br from-[#1e1e2d] to-brand-primary p-6 rounded-2xl text-white shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <h3 className="text-lg font-bold mb-4 z-10">Community Health</h3>
          <div className="z-10">
            <ProgressRing progress={metrics.communityHealthScore} radius={60} stroke={12} color="text-emerald-400" />
          </div>
          <p className="text-sm text-white/80 mt-4 z-10">Excellent Engagement!</p>
        </div>
      </div>
    </div>
  );
};
