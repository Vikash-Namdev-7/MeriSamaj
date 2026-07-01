import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ChevronRight } from 'lucide-react';

export const FeedAnalytics = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white mx-4 mt-4 mb-2 rounded-[24px] border border-purple-100/40 shadow-sm overflow-hidden relative">
      <div 
        className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-purple-50/20 active:bg-purple-50/40 transition-colors press-scale"
        onClick={() => navigate('/member/social/insights')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-glow text-white flex items-center justify-center shadow-md">
            <BarChart2 size={20} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-text-primary leading-tight">My Social Insights</h3>
            <p className="text-[11px] text-text-secondary font-medium">Track your engagement & growth</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-brand-primary">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};
