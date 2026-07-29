import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Wallet, IndianRupee, Users, TrendingUp, AlertCircle, Menu, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useFund } from '../../context/FundContext';
import { useData } from '../../context/DataProvider';

export default function FundListingPage() {
  const navigate = useNavigate();
  const { funds, currentUserId, isAdmin, getUserFunds, contributions, loading, error } = useFund();
  const { setMobileMenuOpen } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin mb-4" />
        <p className="text-sm font-extrabold text-slate-700">Loading Community Funds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans justify-center items-center p-6 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-extrabold text-slate-800 mb-1">{error}</h3>
        <p className="text-xs text-slate-500 max-w-xs font-medium">Please verify your connection and try again.</p>
      </div>
    );
  }

  // If Admin, they see all funds. If member, they see only assigned funds.
  const displayFunds = isAdmin ? funds : getUserFunds(currentUserId);

  // Calculate overall statistics
  const totalFunds = funds.length;
  let overallExpected = 0;
  let overallCollected = 0;
  let overallContributors = new Set();

  funds.forEach(fund => {
    const fundContribs = contributions[fund.id] || [];
    fundContribs.forEach(c => {
      overallExpected += c.assignedAmount || 0;
      overallCollected += c.paidAmount || 0;
      overallContributors.add(c.memberId);
    });
  });

  const overallPending = overallExpected - overallCollected;
  const overallPercentage = overallExpected > 0 ? Math.round((overallCollected / overallExpected) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans pb-24">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-purple-100/30 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.03)] shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 hover:bg-purple-50 transition-colors press-scale"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-extrabold text-slate-800 tracking-tight">Community Funds</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full">
        
        {/* Overall Statistics Dashboard — Royal Glass Gradient Card */}
        <div className="bg-gradient-to-br from-[#2A0E5C] via-[#3B1578] to-[#5B21B6] rounded-[28px] p-5.5 text-white shadow-[0_10px_30px_rgba(59,21,120,0.25)] relative overflow-hidden">
          {/* Ambient Glow Effects */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Wallet size={16} className="text-purple-200" />
              </div>
              <h2 className="text-[15px] font-extrabold text-white tracking-tight">Total Funds Overview</h2>
            </div>
            <button 
              onClick={() => navigate('/member/fund/total-report')}
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl text-[11px] font-bold transition-all press-scale backdrop-blur-md flex items-center gap-1"
            >
              View Report <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5 relative z-10 mb-4">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 relative overflow-hidden">
              <p className="text-[9.5px] font-extrabold text-emerald-300 mb-1 uppercase tracking-wider">Total Collected</p>
              <p className="text-[19px] font-black text-white leading-none tracking-tight">₹{overallCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 relative overflow-hidden">
              <p className="text-[9.5px] font-extrabold text-purple-200 mb-1 uppercase tracking-wider">Total Expected</p>
              <p className="text-[19px] font-black text-white leading-none tracking-tight">₹{overallExpected.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white/8 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 relative z-10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-300/30 text-rose-300 flex items-center justify-center">
                <AlertCircle size={16} />
              </div>
              <div className="text-left">
                <p className="text-[9.5px] font-extrabold text-purple-200 uppercase tracking-wider leading-tight">Total Pending</p>
                <p className="text-[13.5px] font-black text-rose-300 mt-0.5">₹{overallPending.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9.5px] font-extrabold text-purple-200 uppercase tracking-wider leading-tight mb-0.5">Total Contributors</p>
              <p className="text-[13px] font-black text-white">{overallContributors.size} Members</p>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10.5px] font-bold text-purple-200">Overall Progress</span>
              <span className="text-[12px] font-black text-amber-300">{overallPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${overallPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Funds List */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-extrabold text-slate-800 tracking-tight">Your Assigned Funds</h3>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              {displayFunds.length} Active Funds
            </span>
          </div>
          
          <div className="space-y-4">
            {displayFunds.map(fund => {
              const fContribs = contributions[fund.id] || [];
              let fExpected = 0;
              let fCollected = 0;
              fContribs.forEach(c => {
                fExpected += c.assignedAmount || 0;
                fCollected += c.paidAmount || 0;
              });
              const fPercentage = fExpected > 0 ? Math.round((fCollected / fExpected) * 100) : 0;
              
              // Personal status for logged-in user
              const myContrib = fContribs.find(c => c.memberId === currentUserId);
              const isPaid = myContrib && myContrib.paidAmount >= myContrib.assignedAmount;

              return (
                <div 
                  key={fund.id}
                  onClick={() => navigate(`/member/fund/${fund.id}`)}
                  className="bg-white rounded-[26px] border border-slate-200/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.08)] hover:border-purple-200 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="pr-12 text-left">
                      <h4 className="text-[16px] font-extrabold text-slate-800 leading-tight mb-1 group-hover:text-purple-700 transition-colors tracking-tight">{fund.name}</h4>
                      <p className="text-[12px] text-slate-500 font-medium line-clamp-1">{fund.purpose}</p>
                    </div>
                    {/* Status Badge */}
                    <span className={`absolute top-5 right-5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      fund.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {fund.status}
                    </span>
                  </div>

                  {myContrib && (
                    <div className="mb-3.5 bg-purple-50/60 p-3 rounded-2xl border border-purple-100/70 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[9.5px] font-extrabold text-purple-400 uppercase tracking-wider mb-0.5">My Contribution</p>
                        <p className="text-[13.5px] font-black text-slate-800">
                          ₹{myContrib.paidAmount.toLocaleString('en-IN')} <span className="text-slate-400 font-bold text-[11px]">/ ₹{myContrib.assignedAmount}</span>
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        isPaid ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : myContrib.paidAmount > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {isPaid ? 'Fully Paid' : myContrib.paidAmount > 0 ? 'Partial' : 'Pending'}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <div className="text-left">
                        <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Community Collection</p>
                        <p className="text-[13px] font-extrabold text-slate-800">₹{fCollected.toLocaleString('en-IN')} <span className="text-[11px] font-medium text-slate-400">/ ₹{fExpected.toLocaleString('en-IN')}</span></p>
                      </div>
                      <span className="text-[13px] font-black text-purple-700">{fPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-purple-50 rounded-full overflow-hidden border border-purple-100/50">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-700" style={{ width: `${fPercentage}%` }} />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Users size={14} className="text-purple-500" />
                      <span className="text-[11.5px] font-bold text-slate-700">{fund.assignedMembers.length} Members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">Due: {new Date(fund.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {displayFunds.length === 0 && (
              <div className="bg-white rounded-[28px] p-8 border border-slate-200/80 text-center shadow-xs">
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet size={26} />
                </div>
                <h3 className="text-[15px] font-extrabold text-slate-800 mb-1">No Funds Available</h3>
                <p className="text-[12px] font-medium text-slate-400">You are not assigned to any active community funds.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
