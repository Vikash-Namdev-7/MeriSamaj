import React from 'react';
import { Building2, Users, Calendar, Heart, Briefcase, Star, MapPin } from 'lucide-react';

export const CommunityDetails = ({ profile, stats }) => {
  if (!profile || !stats) return null;

  return (
    <div className="space-y-6">
      <div className="card-neo p-6 bg-gradient-to-br from-brand-primary to-purple-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black">{profile.communityName}</h2>
            <p className="text-sm text-purple-200 font-medium">Community ID: {profile.communityId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mb-1">Your Role</p>
            <p className="font-bold text-sm">{profile.designation}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mb-1">Joined Date</p>
            <p className="font-bold text-sm">{profile.memberSince}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mb-1">Account Status</p>
            <p className="font-bold text-sm">{profile.accountStatus}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mb-1">Working Area</p>
            <p className="font-bold text-sm flex items-center gap-1"><MapPin size={12}/> {stats.workingArea}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Members Managed" value={stats.totalMembers} color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={Calendar} label="Total Events Managed" value={stats.totalEvents} color="text-amber-500" bg="bg-amber-500/10" />
        <StatCard icon={Heart} label="Matrimonial Approvals" value={stats.matrimonialApprovals} color="text-rose-500" bg="bg-rose-500/10" />
        <StatCard icon={Briefcase} label="Professional Listings" value={stats.professionalListings} color="text-indigo-500" bg="bg-indigo-500/10" />
        <StatCard icon={Star} label="Community Rating" value={`${stats.rating} / 5`} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="card-neo p-5 flex items-center gap-4 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${bg} ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);
