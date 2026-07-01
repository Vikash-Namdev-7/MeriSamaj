import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../../context/DataProvider';
import { 
  Activity, ArrowUpRight, BarChart2, Eye, 
  Heart, MessageCircle, FileText, Video, Image as ImageIcon, X 
} from 'lucide-react';

export const ActivityDashboard = ({ onClose }) => {
  const { currentUser, posts = [], videos = [] } = useData();

  const stats = currentUser?.stats || {
    posts: 0, videos: 0, images: 0,
    followers: 0, following: 0,
    likesReceived: '0', commentsReceived: 0, profileVisits: '0'
  };

  const statCards = [
    { label: 'Total Posts', value: stats.posts, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100', change: '+12%' },
    { label: 'Profile Visits', value: stats.profileVisits, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-100', change: '+24%' },
    { label: 'Total Likes', value: stats.likesReceived, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100', change: '+8%' },
    { label: 'Comments', value: stats.commentsReceived, icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', change: '+15%' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 bg-surface flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 flex items-center justify-between px-5 h-14 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-glow flex items-center justify-center text-white">
            <Activity size={16} />
          </div>
          <h2 className="text-[16px] font-bold text-text-primary tracking-tight">Activity Dashboard</h2>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors press-scale"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="p-4 space-y-4">
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat, idx) => (
              <div key={idx} className="card-neo p-4 relative overflow-hidden group">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 shadow-sm border border-white`}>
                  <stat.icon size={20} />
                </div>
                <h4 className="text-[22px] font-black text-text-primary leading-none mb-1">{stat.value}</h4>
                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{stat.label}</p>
                <div className="absolute top-4 right-4 flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <ArrowUpRight size={10} />
                  {stat.change}
                </div>
                {/* Decorative blur */}
                <div className={`absolute -bottom-4 -right-4 w-16 h-16 ${stat.bg} opacity-40 blur-2xl rounded-full`} />
              </div>
            ))}
          </div>

          {/* Engagement Chart Placeholder */}
          <div className="card-neo p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[14px] text-text-primary">Engagement History</h3>
              <select className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none">
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            
            {/* Mock Chart UI */}
            <div className="h-32 flex items-end justify-between gap-2 px-2">
              {[40, 70, 45, 90, 60, 80, 100].map((height, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-brand-primary to-purple-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" 
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[9px] font-bold text-slate-400">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity List */}
          <div>
            <h3 className="font-bold text-[15px] text-text-primary mb-3 px-1">Recent Activity</h3>
            <div className="card-neo overflow-hidden divide-y divide-slate-100">
              {[
                { type: 'post', title: 'Shared a new photo', time: '2 hours ago', icon: ImageIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
                { type: 'like', title: 'Liked a post by Suresh Agrawal', time: '5 hours ago', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                { type: 'comment', title: 'Commented on Event', time: '1 day ago', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
                { type: 'video', title: 'Uploaded a video', time: '2 days ago', icon: Video, color: 'text-indigo-500', bg: 'bg-indigo-50' }
              ].map((activity, i) => (
                <div key={i} className="p-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activity.bg} ${activity.color}`}>
                    <activity.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-800 leading-tight">{activity.title}</p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
