import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, MapPin, Phone, Receipt, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useFund } from '../../context/FundContext';

export default function FundMemberProfilePage() {
  const { fundId, id } = useParams();
  const navigate = useNavigate();
  const { getFundById, getUserContribution, mockUsers } = useFund();

  const fund = getFundById(fundId);
  const user = mockUsers.find(u => u.id === id);
  const contribution = getUserContribution(fundId, id) || { assignedAmount: 0, paidAmount: 0, lastPaymentDate: '-' };

  const dueAmount = contribution.assignedAmount - contribution.paidAmount;
  
  let status = 'Pending';
  if (contribution.paidAmount >= contribution.assignedAmount) status = 'Paid';
  else if (contribution.paidAmount > 0) status = 'Partial';

  if (!fund || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[28px] border border-slate-200 p-8 text-center shadow-sm max-w-sm w-full">
          <h2 className="text-lg font-extrabold text-slate-800">Member Details Not Found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid': 
        return (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" /> Paid
          </span>
        );
      case 'Partial': 
        return (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            <Clock size={11} className="text-amber-600 shrink-0" /> Partial
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            <AlertTriangle size={11} className="text-rose-600 shrink-0" /> Pending
          </span>
        );
    }
  };

  const progressPct = contribution.assignedAmount > 0 
    ? Math.min(100, Math.round((contribution.paidAmount / contribution.assignedAmount) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans pb-24 select-none">
      {/* Header — Glassmorphism */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-purple-100/30 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.03)] shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors press-scale"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col text-left">
            <h1 className="text-[16px] font-extrabold text-slate-800 leading-tight tracking-tight">Member Contribution</h1>
            <p className="text-[10px] text-purple-600 font-extrabold leading-none uppercase tracking-wider">{fund.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto w-full">
        {/* Profile Card — Clean Neutral Avatar */}
        <div className="bg-white rounded-[26px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-5 relative overflow-hidden text-left">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-slate-100 text-slate-700 font-black text-[15px] flex items-center justify-center border border-slate-200/80 shrink-0 shadow-2xs">
                {user.avatar || user.profilePic ? (
                  <img src={user.avatar || user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.substring(0, 2).toUpperCase() || 'M'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-800 tracking-tight leading-tight truncate">{user.name}</h2>
                <p className="text-[10.5px] font-semibold text-slate-400 mt-0.5 truncate">Member ID: #{user.id.toUpperCase()}</p>
              </div>
            </div>
            <div className="shrink-0">{getStatusBadge(status)}</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/60">
                <Phone size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-[12.5px] font-extrabold text-slate-800 truncate">{user.phone || '+91 98930 12345'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
                <Mail size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-[12.5px] font-extrabold text-slate-800 truncate">{user.email || `${user.name.toLowerCase().replace(/\s/g, '.')}@gmail.com`}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                <MapPin size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Location</p>
                <p className="text-[12.5px] font-extrabold text-slate-800 truncate">{user.city || 'Indore, MP'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Details */}
        <div className="bg-white rounded-[26px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[15px] text-slate-800 tracking-tight">Contribution Summary</h3>
            <span className="text-[12px] font-black text-purple-700">{progressPct}% Paid</span>
          </div>

          <div className="h-2.5 w-full bg-purple-50 rounded-full overflow-hidden border border-purple-100/60 mb-5">
            <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
          
          <div className="grid grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 mb-4 text-center">
            <div>
              <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Assigned</p>
              <p className="text-[15px] font-black text-slate-800">₹{contribution.assignedAmount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Paid</p>
              <p className="text-[15px] font-black text-emerald-600">₹{contribution.paidAmount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Balance</p>
              <p className={`text-[15px] font-black ${dueAmount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                ₹{dueAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          
          {contribution.lastPaymentDate && status !== 'Pending' && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-100/80 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="text-slate-500 text-[11px] font-medium">Last Payment Recorded:</span>
              <span className="font-extrabold text-emerald-700">{contribution.lastPaymentDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
