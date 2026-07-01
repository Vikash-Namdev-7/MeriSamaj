import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Filter, User } from 'lucide-react';
import { useFund } from '../../context/FundContext';

export default function FundHistoryPage() {
  const { fundId } = useParams();
  const navigate = useNavigate();
  const { getFundById, getContributionsByFund, mockUsers } = useFund();

  const fund = getFundById(fundId);
  const contributions = getContributionsByFund(fundId);

  // Generate a mock history from contributions
  const mockHistory = contributions
    .filter(c => c.paidAmount > 0)
    .map(c => {
      const user = mockUsers.find(u => u.id === c.memberId);
      return {
        id: c.memberId,
        memberName: user?.name || 'Unknown',
        date: c.lastPaymentDate,
        amount: c.paidAmount,
        mode: 'Online'
      };
    });

  const totalCollected = mockHistory.reduce((acc, curr) => acc + curr.amount, 0);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-10 select-none">
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
            <h1 className="text-[17px] font-bold text-slate-800">Transaction History</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{fund.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Banner */}
        <div className="flex bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden text-slate-800 divide-x divide-slate-100">
          <div className="flex-1 py-4 px-3 text-center bg-emerald-50/50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Collected</p>
            <p className="text-[16px] font-black text-emerald-600">₹ {totalCollected.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex-1 py-4 px-3 text-center bg-emerald-50/50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Txns</p>
            <p className="text-[16px] font-black text-emerald-600">{mockHistory.length}</p>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
          {mockHistory.map((payment, index) => (
            <div key={payment.id} className={`p-4 flex items-center gap-3 ${index !== mockHistory.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User size={18} className="text-slate-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-bold text-slate-800 leading-tight">{payment.memberName}</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{payment.date}</p>
              </div>
              
              <div className="text-right flex flex-col items-end gap-0.5">
                <span className="text-[14px] font-black text-emerald-600">₹ {payment.amount}</span>
                <span className="text-[10px] font-bold text-slate-400">{payment.mode}</span>
              </div>
            </div>
          ))}

          {mockHistory.length === 0 && (
            <div className="text-center p-6 text-slate-500 font-bold text-[13px]">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
