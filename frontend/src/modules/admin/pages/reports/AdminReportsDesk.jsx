import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Download, RefreshCw, Calendar, Users, 
  IndianRupee, Heart, ShieldCheck, Building2, CreditCard, Filter, CheckCircle, AlertCircle
} from 'lucide-react';
import adminReportsService from '../../services/adminReportsService';
import { exportToCsv } from '../../../../core/utils/exporters';

export default function AdminReportsDesk() {
  const [activeTab, setActiveTab] = useState('revenue'); // revenue | community | user | matrimonial | subscription
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Date Range Presets: '30days' | '90days' | 'year' | 'custom'
  const [presetRange, setPresetRange] = useState('year');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const calculateDates = (preset) => {
    const end = new Date();
    const start = new Date();
    if (preset === '30days') {
      start.setDate(end.getDate() - 30);
    } else if (preset === '90days') {
      start.setDate(end.getDate() - 90);
    } else if (preset === 'year') {
      start.setFullYear(end.getFullYear() - 1);
    }
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let params = {};
      if (presetRange !== 'custom') {
        const dates = calculateDates(presetRange);
        params = dates;
      } else if (startDate && endDate) {
        params = { startDate, endDate };
      }

      let res;
      if (activeTab === 'revenue') res = await adminReportsService.getRevenueReport(params);
      else if (activeTab === 'community') res = await adminReportsService.getCommunityReport(params);
      else if (activeTab === 'user') res = await adminReportsService.getUserReport(params);
      else if (activeTab === 'matrimonial') res = await adminReportsService.getMatrimonialReport(params);
      else if (activeTab === 'subscription') res = await adminReportsService.getSubscriptionReport(params);

      if (res && res.status === 'success') {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, presetRange]);

  const handleExportCSV = () => {
    if (!reportData) return;

    let exportPayload = [];
    let filename = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'revenue') {
      exportPayload = reportData.monthlyTrend || [];
    } else if (activeTab === 'community') {
      exportPayload = reportData.topCommunities || [];
    } else if (activeTab === 'user') {
      exportPayload = reportData.registrationTrend || [];
    } else if (activeTab === 'matrimonial') {
      exportPayload = reportData.creationTrend || [];
    } else if (activeTab === 'subscription') {
      exportPayload = reportData.planBreakdown || [];
    }

    if (exportPayload.length === 0) {
      showToast('No data available to export');
      return;
    }

    const success = exportToCsv(exportPayload, filename);
    if (success) showToast(`Exported ${activeTab} report to CSV!`);
    else showToast('Failed to export CSV');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-purple-500/30">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-6 rounded-3xl border border-purple-500/20 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">
            <BarChart3 size={14} className="text-purple-400" /> Platform Insights
          </div>
          <h1 className="text-2xl font-black tracking-tight">Reports & Executive Analytics</h1>
          <p className="text-xs text-purple-200/75 mt-1">Cross-module time-series trends, financial aggregation, and community growth metrics.</p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button 
            onClick={handleExportCSV}
            disabled={loading || !reportData}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'revenue', label: 'Revenue Reports', icon: IndianRupee },
          { id: 'community', label: 'Community Reports', icon: Building2 },
          { id: 'user', label: 'User Reports', icon: Users },
          { id: 'matrimonial', label: 'Matrimonial Reports', icon: Heart },
          { id: 'subscription', label: 'Subscription Reports', icon: CreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-purple-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-purple-300' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Range Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Calendar size={16} className="text-purple-600" />
          <span>Date Range Preset:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: '30days', label: 'Last 30 Days' },
            { id: '90days', label: 'Last 90 Days' },
            { id: 'year', label: 'Last 12 Months' },
            { id: 'custom', label: 'Custom Range' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPresetRange(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                presetRange === p.id 
                  ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}

          {presetRange === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              />
              <span className="text-slate-400 font-bold">to</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              />
              <button 
                onClick={fetchReport}
                className="px-3 py-1 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Render */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw size={28} className="text-purple-600 animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500">Aggregating report analytics...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center">
          <AlertCircle size={28} className="text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-rose-800">{error}</p>
          <button onClick={fetchReport} className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">Retry</button>
        </div>
      ) : reportData && (
        <div className="space-y-6">
          {/* TAB 1: REVENUE REPORT */}
          {activeTab === 'revenue' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">₹{(reportData.summary?.grandTotalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
                  <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Donations Total</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">₹{(reportData.summary?.donationTotal || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{reportData.summary?.donationCount || 0} Donations</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Contributions Total</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">₹{(reportData.summary?.contribTotal || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{reportData.summary?.contribCount || 0} Contributions</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                  <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Dharmashala Total</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">₹{(reportData.summary?.dharmashalaTotal || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{reportData.summary?.dharmashalaCount || 0} Bookings</p>
                </div>
              </div>

              {/* Monthly Trend Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-900 mb-4">Monthly Revenue Time-Series Trend</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-4">Month / Year</th>
                        <th className="py-3 px-4">Donations (₹)</th>
                        <th className="py-3 px-4">Contributions (₹)</th>
                        <th className="py-3 px-4">Dharmashala (₹)</th>
                        <th className="py-3 px-4 text-right">Total Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(reportData.monthlyTrend || []).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{row.month} {row.year}</td>
                          <td className="py-3 px-4 text-purple-700">₹{(row.donations || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-emerald-700">₹{(row.contributions || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-indigo-700">₹{(row.dharmashala || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">₹{(row.total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: COMMUNITY REPORT */}
          {activeTab === 'community' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Communities</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{reportData.summary?.totalCommunities || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Communities</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{reportData.summary?.activeCommunities || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                  <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Inactive Chapters</p>
                  <p className="text-2xl font-black text-rose-600 mt-1">{reportData.summary?.inactiveCommunities || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
                  <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Active Ratio</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">{reportData.summary?.activePercentage || 0}%</p>
                </div>
              </div>

              {/* Top Communities Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-900 mb-4">Top 10 Communities by Member Density</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-4">Community Name</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">State</th>
                        <th className="py-3 px-4 text-right">Total Members</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(reportData.topCommunities || []).map((comm, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{comm.name}</td>
                          <td className="py-3 px-4 text-slate-600">{comm.city || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-600">{comm.state || 'N/A'}</td>
                          <td className="py-3 px-4 text-right font-black text-purple-700">{comm.memberCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: USER REPORT */}
          {activeTab === 'user' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total User Base</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{reportData.summary?.totalUsers || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Verified Users</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{reportData.summary?.verifiedUsers || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Verification</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{reportData.summary?.pendingVerificationUsers || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                  <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Verification Rate</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{reportData.summary?.verificationRate || 0}%</p>
                </div>
              </div>

              {/* Registration Trend Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-900 mb-4">Monthly User Registration Trend</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-4">Month / Year</th>
                        <th className="py-3 px-4 text-right">New Registrations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(reportData.registrationTrend || []).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{row.month} {row.year}</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700">+{row.registrations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 4: MATRIMONIAL REPORT */}
          {activeTab === 'matrimonial' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Profiles</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{reportData.summary?.totalProfiles || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Verified Profiles</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{reportData.summary?.verifiedProfiles || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
                  <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Single Profiles</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">{reportData.summary?.singleProfiles || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                  <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Successful Marriages</p>
                  <p className="text-2xl font-black text-rose-600 mt-1">{reportData.summary?.marriedProfiles || 0}</p>
                </div>
              </div>

              {/* Matrimonial Creation Trend Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-900 mb-4">Monthly Profile Creation Trend</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-4">Month / Year</th>
                        <th className="py-3 px-4 text-right">Profiles Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(reportData.creationTrend || []).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{row.month} {row.year}</td>
                          <td className="py-3 px-4 text-right font-black text-purple-700">+{row.profilesCreated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 5: SUBSCRIPTION REPORT */}
          {activeTab === 'subscription' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Subscriptions</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{reportData.summary?.totalSubscriptions || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Subscriptions</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{reportData.summary?.activeSubscriptions || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
                  <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Subscription Revenue</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">₹{(reportData.summary?.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                  <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Churn Rate</p>
                  <p className="text-2xl font-black text-rose-600 mt-1">{reportData.summary?.churnRate || 0}%</p>
                </div>
              </div>

              {/* Plan Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-900 mb-4">Subscription Plan Revenue & Volume Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-4">Plan Name</th>
                        <th className="py-3 px-4">Purchases Count</th>
                        <th className="py-3 px-4 text-right">Total Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(reportData.planBreakdown || []).map((plan, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{plan.planName}</td>
                          <td className="py-3 px-4 text-slate-600">{plan.subscriptionsCount}</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700">₹{(plan.revenue || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
