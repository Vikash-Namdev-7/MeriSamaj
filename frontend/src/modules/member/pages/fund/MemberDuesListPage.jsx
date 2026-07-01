import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Search, Filter, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useFund } from '../../context/FundContext';

export default function MemberDuesListPage() {
  const { fundId } = useParams();
  const navigate = useNavigate();
  const { getFundById, getContributionsByFund, mockUsers } = useFund();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // 'All', 'Paid', 'Partial', 'Pending'
  
  const fund = getFundById(fundId);
  
  if (!fund) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Fund Not Found</h2>
          <button onClick={() => navigate('/member/fund')} className="mt-4 text-indigo-600 font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  const fundContribs = getContributionsByFund(fundId);
  
  // Merge user data with contributions
  const membersList = fund.assignedMembers.map(memberId => {
    const user = mockUsers.find(u => u.id === memberId);
    const contrib = fundContribs.find(c => c.memberId === memberId) || { assignedAmount: 0, paidAmount: 0, lastPaymentDate: '-' };
    const due = contrib.assignedAmount - contrib.paidAmount;
    
    let status = 'Pending';
    if (contrib.paidAmount >= contrib.assignedAmount) status = 'Paid';
    else if (contrib.paidAmount > 0) status = 'Partial';

    return {
      ...user,
      ...contrib,
      due,
      status
    };
  });

  // Calculate stats
  const totalMembers = membersList.length;
  const paidMembers = membersList.filter(m => m.status === 'Paid').length;
  const partialMembers = membersList.filter(m => m.status === 'Partial').length;
  const pendingMembers = membersList.filter(m => m.status === 'Pending').length;
  
  const totalDueAmount = membersList.reduce((acc, curr) => acc + curr.due, 0);
  const totalCollectedAmount = membersList.reduce((acc, curr) => acc + curr.paidAmount, 0);

  const filtered = membersList.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone?.includes(searchQuery);
    const matchesFilter = filter === 'All' ? true : m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Partial': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pending': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return <CheckCircle2 size={12} className="mr-1 inline" />;
      case 'Partial': return <Clock size={12} className="mr-1 inline" />;
      case 'Pending': return <AlertTriangle size={12} className="mr-1 inline" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-10 select-none">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[16px] font-black text-slate-800 leading-tight">Members</h1>
            <p className="text-[10px] text-slate-500 font-bold leading-none uppercase tracking-wider">{fund.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Bar & Filters */}
        <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 space-y-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search member..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-[14px] font-bold outline-none focus:border-indigo-400 transition-colors text-slate-800"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {['All', 'Paid', 'Partial', 'Pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors border ${
                  filter === f 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f} {f === 'Paid' ? `(${paidMembers})` : f === 'Partial' ? `(${partialMembers})` : f === 'Pending' ? `(${pendingMembers})` : `(${totalMembers})`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Banner Summary */}
          <div className="flex bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden text-slate-800 divide-x divide-slate-100">
            <div className="flex-1 py-4 px-3 text-center bg-emerald-50/30">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Collected</p>
              <p className="text-[16px] font-black text-emerald-600">₹{totalCollectedAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex-1 py-4 px-3 text-center bg-rose-50/30">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pending</p>
              <p className="text-[16px] font-black text-rose-600">₹{totalDueAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {filtered.map((member) => (
              <div 
                key={member.memberId}
                onClick={() => navigate(`/member/fund/${fundId}/member/${member.memberId}`)}
                className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 font-bold text-[14px] flex items-center justify-center border border-slate-200 shrink-0">
                    {member.profilePic || member.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-black text-slate-800 leading-tight mb-0.5">{member.name}</h3>
                    <p className="text-[11px] font-medium text-slate-500">{member.phone}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center ${getStatusColor(member.status)}`}>
                    {getStatusIcon(member.status)}
                    {member.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Assigned</p>
                    <p className="text-[13px] font-black text-slate-700">₹{member.assignedAmount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Paid</p>
                    <p className="text-[13px] font-black text-emerald-600">₹{member.paidAmount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Balance</p>
                    <p className={`text-[13px] font-black ${member.due > 0 ? 'text-rose-600' : 'text-slate-700'}`}>₹{member.due}</p>
                  </div>
                </div>

                {member.status !== 'Pending' && member.lastPaymentDate && (
                  <p className="text-[10px] font-semibold text-slate-400 mt-3 relative z-10 text-right">
                    Last Payment: {member.lastPaymentDate}
                  </p>
                )}
                
                {/* Background Decor */}
                {member.status === 'Paid' && (
                  <div className="absolute -right-4 -bottom-4 text-emerald-50 opacity-50 z-0">
                    <CheckCircle2 size={80} />
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-10">
                <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[14px] font-bold text-slate-500">No members found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
