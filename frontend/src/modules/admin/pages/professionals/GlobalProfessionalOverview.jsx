import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, RefreshCw, CheckCircle, XCircle, Clock, 
  ShieldAlert, ShieldCheck, Award, TrendingUp, BarChart4, PieChart
} from 'lucide-react';
import { professionalService } from '../../../../core/api/professionalService';

export default function GlobalProfessionalOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0, verified: 0
  });
  const [categoryCounts, setCategoryCounts] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await professionalService.adminGetListings({ limit: 1 });
      if (res.success) {
        setStats(res.data.statistics);
        
        // Load all listings to calculate category breakdown
        const allRes = await professionalService.adminGetListings({ limit: 1000 });
        if (allRes.success) {
          const counts = {};
          allRes.data.listings.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
          });
          setCategoryCounts(counts);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load professional directory statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatClick = (filterType, value) => {
    if (filterType === 'status') {
      navigate(`/admin/professionals/grid?status=${value}`);
    } else if (filterType === 'credential') {
      navigate(`/admin/professionals/grid?credentialStatus=${value}`);
    } else {
      navigate(`/admin/professionals/grid`);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans rounded-3xl">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="text-indigo-650" />
            Professional Network Overview
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Monitor registration metrics, credential audits, and platform distributions.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-650 flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
        {[
          { label: 'Total Directory Pool', val: stats.total, click: () => handleStatClick('all'), color: 'text-slate-900', bg: 'bg-white hover:border-slate-300' },
          { label: 'Pending Approvals', val: stats.pending, click: () => handleStatClick('status', 'Pending'), color: 'text-amber-600', bg: 'bg-white border-amber-100 hover:border-amber-300' },
          { label: 'Approved Active', val: stats.approved, click: () => handleStatClick('status', 'Approved'), color: 'text-emerald-600', bg: 'bg-white border-emerald-100 hover:border-emerald-300' },
          { label: 'Rejected Listings', val: stats.rejected, click: () => handleStatClick('status', 'Rejected'), color: 'text-rose-600', bg: 'bg-white hover:border-slate-300' },
          { label: 'Suspended Listings', val: stats.suspended, click: () => handleStatClick('status', 'Suspended'), color: 'text-slate-500', bg: 'bg-white hover:border-slate-300' },
          { label: 'Verified Credentials', val: stats.verified, click: () => handleStatClick('credential', 'VERIFIED'), color: 'text-indigo-650', bg: 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-200' }
        ].map((s, idx) => (
          <div 
            key={idx} 
            onClick={s.click}
            className={`p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer transition-all ${s.bg}`}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors">Apply Filter →</p>
          </div>
        ))}
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category breakdown bar chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <BarChart4 size={18} className="text-indigo-600" />
            Business Categories Distribution
          </h3>
          <div className="space-y-3 pt-2">
            {Object.entries(categoryCounts).map(([cat, val]) => {
              const percentage = stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{cat}</span>
                    <span className="text-indigo-650">{val} Listings ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-550 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(categoryCounts).length === 0 && (
              <p className="text-xs text-slate-400 italic">No category data collected yet.</p>
            )}
          </div>
        </div>

        {/* Audit compliance donut visualization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <PieChart size={18} className="text-purple-600" />
              Audits and Credential Compliance
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Distribution of verified vs pending credential profiles.
            </p>
          </div>
          <div className="flex items-center justify-around py-4">
            {/* Simple Dynamic SVG Pie Chart */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="#7c3aed" 
                  strokeWidth="3.5" 
                  strokeDasharray={`${stats.total > 0 ? (stats.verified / stats.total) * 100 : 0} ${stats.total > 0 ? 100 - (stats.verified / stats.total) * 100 : 100}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black text-slate-800">{stats.verified}</span>
                <span className="text-[8px] text-slate-400 uppercase font-black">Verified</span>
              </div>
            </div>
            
            <div className="space-y-2 text-xs font-bold text-slate-650">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-600 block" />
                <span>Verified ({stats.verified})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-200 block" />
                <span>Pending Audit ({stats.total - stats.verified})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
