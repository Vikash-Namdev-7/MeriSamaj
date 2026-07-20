import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { 
  Users, Building2, MapPin, ShieldCheck, 
  Heart, Calendar, Briefcase, Activity, 
  IndianRupee, TrendingUp, TrendingDown 
} from 'lucide-react';

export const AdminDashboard = () => {
  const { data, loading, error } = useDashboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl max-w-lg mx-auto mt-20">
        <h3 className="text-rose-400 font-bold mb-2">System Error</h3>
        <p className="text-gray-400 text-sm">{error || "Failed to load dashboard data."}</p>
      </div>
    );
  }

  // Helper for rendering empty states safely
  const renderEmptyState = (message = "No data available yet") => (
    <div className="flex items-center justify-center h-32 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* ─── DASHBOARD HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Platform Overview</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time analytics across the entire MeriSamaj network
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Status</span>
        </div>
      </div>

      {/* ─── KPI CARDS ROW ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Registered Members</p>
            <h3 className="text-3xl font-black text-slate-800">{data.members?.total?.toLocaleString() || 0}</h3>
            <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {data.members?.verified?.toLocaleString() || 0} Verified
            </p>
          </div>
        </div>

        {/* Communities */}
        <div 
          onClick={() => navigate('/admin/communities')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Communities</p>
            <h3 className="text-3xl font-black text-slate-800">{data.communities?.total?.toLocaleString() || 0}</h3>
            <p className="text-xs font-semibold text-blue-600 mt-2">
              {data.communities?.active?.toLocaleString() || 0} Active
            </p>
          </div>
        </div>

        {/* Cities */}
        <div 
          onClick={() => navigate('/admin/cities')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cities Connected</p>
            <h3 className="text-3xl font-black text-slate-800">{data.cities?.total?.toLocaleString() || 0}</h3>
            <p className="text-xs font-semibold text-slate-400 mt-2">Across Network</p>
          </div>
        </div>

        {/* Community Heads */}
        <div 
          onClick={() => navigate('/admin/community-heads')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Heads</p>
            <h3 className="text-3xl font-black text-slate-800">{data.heads?.active?.toLocaleString() || 0}</h3>
            <p className="text-xs font-semibold text-purple-600 mt-2">Managing Communities</p>
          </div>
        </div>
      </div>

      {/* ─── MODULE STATISTICS ROW (MATRIMONIAL, EVENTS, DIRECTORY) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Matrimonial */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <h3 className="font-bold text-slate-800">Matrimonial Stats</h3>
          </div>
          {data.matrimonial?.total === 0 ? renderEmptyState() : (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600">Total Profiles</span>
                  <span className="text-sm font-black text-slate-800">{data.matrimonial?.total || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600">Single / Unmarried</span>
                  <span className="text-sm font-black text-slate-800">{data.matrimonial?.single || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(((data.matrimonial?.single || 0) / (data.matrimonial?.total || 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600">Married</span>
                  <span className="text-sm font-black text-slate-800">{data.matrimonial?.married || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full transition-all" style={{ width: `${Math.min(((data.matrimonial?.married || 0) / (data.matrimonial?.total || 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Events */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="font-bold text-slate-800">Event Statistics</h3>
          </div>
          {data.events?.total === 0 ? renderEmptyState() : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total</p>
                <h4 className="text-2xl font-black text-slate-800">{data.events?.total || 0}</h4>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-xs font-bold text-orange-600 uppercase mb-1">Active</p>
                <h4 className="text-2xl font-black text-orange-700">{data.events?.active || 0}</h4>
              </div>
              <div className="col-span-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Completed</p>
                  <h4 className="text-2xl font-black text-emerald-700">{data.events?.completed || 0}</h4>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-emerald-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-700">
                    {Math.round(((data.events?.completed || 0) / (data.events?.total || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Professional Directory */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-sky-500" />
            </div>
            <h3 className="font-bold text-slate-800">Professional Directory</h3>
          </div>
          {data.professionals?.total === 0 ? renderEmptyState() : (
            <div className="flex flex-col items-center justify-center h-full pb-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.8" strokeDashoffset="0" className="text-sky-500" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-800">{data.professionals?.total || 0}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-500 mt-4 text-center">Active Professional<br/>Listings</p>
            </div>
          )}
        </div>

      </div>

      {/* ─── ENGAGEMENT AND REVENUE ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Engagement Overview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="font-bold text-slate-800">Community Engagement</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-100 bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-2">Social Posts</p>
              <h4 className="text-4xl font-black">{data.engagement?.posts || 0}</h4>
              <p className="text-xs text-indigo-100 mt-2">Across all communities</p>
            </div>
            <div className="p-5 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Elections Hosted</p>
                <h4 className="text-4xl font-black text-slate-800">{data.engagement?.elections || 0}</h4>
              </div>
              <p className="text-xs font-semibold text-slate-400">Total voting instances</p>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800">Revenue Overview</h3>
          </div>
          <div className="flex flex-col h-full gap-4 pb-2">
            
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Total Revenue</p>
                <h3 className="text-2xl font-black text-emerald-800 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {(data.revenue?.total || 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div>
                <p className="text-xs font-bold text-rose-700 uppercase mb-1">Total Expenses</p>
                <h3 className="text-2xl font-black text-rose-800 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {(data.revenue?.expenses || 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm font-bold text-slate-500 uppercase">Available Balance</p>
              <h3 className="text-xl font-black text-slate-800 flex items-center">
                <IndianRupee className="w-4 h-4 mr-1 text-slate-400" />
                {(data.revenue?.available || 0).toLocaleString()}
              </h3>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export const MasterAdminDashboard = AdminDashboard;
export default AdminDashboard;
