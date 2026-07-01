import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, MapPin, CalendarDays, Receipt, CheckCircle2 } from 'lucide-react';
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
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Details Not Found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24 select-none">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[17px] font-bold text-slate-800">Member Profile</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{fund.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 relative overflow-hidden">
          <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-bold text-[10px] ${status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : status === 'Partial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
            {status}
          </div>
          
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shrink-0">
              {user.profilePic}
            </div>
            <div>
              <h2 className="text-[18px] font-black text-slate-800">{user.name}</h2>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Member ID: {user.id.toUpperCase()}882</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Receipt size={14} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Mobile Number</p>
                <p className="text-[13px] font-bold text-slate-800">{user.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Mail size={14} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Email</p>
                <p className="text-[13px] font-bold text-slate-800">{user.name.toLowerCase().replace(' ', '.')}@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">Address</p>
                <p className="text-[13px] font-bold text-slate-800">Vijay Nagar, Indore, M.P.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-[15px] text-slate-800 mb-4">Contribution Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-slate-600">Assigned Amount</span>
              <span className="text-[14px] font-bold text-slate-800">₹ {contribution.assignedAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-slate-600">Paid Amount</span>
              <span className="text-[14px] font-bold text-emerald-600">₹ {contribution.paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-px bg-slate-100 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-black text-slate-800">Remaining Balance</span>
              <span className={`text-[16px] font-black ${dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹ {dueAmount.toLocaleString('en-IN')}
              </span>
            </div>
            
            {contribution.lastPaymentDate && status !== 'Pending' && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] font-bold text-slate-400 mb-1">Last Payment Date</p>
                <p className="text-[13px] font-black text-slate-700">{contribution.lastPaymentDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
