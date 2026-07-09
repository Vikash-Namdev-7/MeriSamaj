import React from 'react';
import { useEngagementAnalytics } from '../hooks/useEngagementAnalytics';
import { AnalyticsCard } from '../components/AnalyticsCard';
import { LoadingSkeleton, EmptyState } from '../components/EmptyStates';
import { BarChart3 } from 'lucide-react';
// We'll use simple CSS-based visualization since a charting library might not be strictly available
// In a real MERN stack, we'd use recharts here. 

export const EngagementAnalytics = () => {
  const { chartData, isLoading, error } = useEngagementAnalytics('month');

  if (isLoading) return <LoadingSkeleton rows={5} />;
  if (error || !chartData) return <EmptyState icon={BarChart3} title="Analytics Unavailable" message={error || 'No data found'} />;

  return (
    <div className="space-y-6">
      <AnalyticsCard title="Daily Activity Trend">
        <div className="h-64 flex items-end gap-2 mt-4 relative">
          {/* Y-axis placeholders */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-gray-400">
            <span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
          </div>
          <div className="flex-1 flex items-end justify-between pl-10 h-full border-b border-gray-100 pb-2">
            {chartData.dailyActivity.map((day, idx) => {
              const heightPct = (day.active / 210) * 100; // max value ~210
              return (
                <div key={idx} className="flex flex-col items-center group w-full px-1">
                  <div 
                    className="w-full max-w-[40px] bg-brand-primary/80 rounded-t-sm group-hover:bg-brand-primary transition-all relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded">
                      {day.active}
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-2 font-medium">{day.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </AnalyticsCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Participation Breakdown">
           <div className="space-y-4">
             {chartData.participationBreakdown.map((item, idx) => {
               const max = 400; // max from mock
               const pct = (item.value / max) * 100;
               return (
                 <div key={idx}>
                   <div className="flex justify-between text-[12px] font-bold text-gray-700 mb-1">
                     <span>{item.name}</span>
                     <span>{item.value}</span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                   </div>
                 </div>
               );
             })}
           </div>
        </AnalyticsCard>
        
        <AnalyticsCard title="Growth Over Time">
           <EmptyState icon={BarChart3} title="Growth Chart" message="Growth trend visualization goes here." />
        </AnalyticsCard>
      </div>
    </div>
  );
};
