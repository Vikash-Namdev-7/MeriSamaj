import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Receipt, FileText } from 'lucide-react';
import { useFund } from '../../context/FundContext';

export default function ExpenseDetailsPage() {
  const { fundId } = useParams();
  const navigate = useNavigate();
  const { getFundById, getExpensesByFund } = useFund();

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

  const expenses = getExpensesByFund(fundId);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

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
            <h1 className="text-[17px] font-bold text-slate-800 leading-tight">Expenses</h1>
            <p className="text-[10px] text-slate-500 font-bold leading-none uppercase tracking-wider">{fund.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Banner */}
        <div className="flex bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden text-slate-800 relative">
          <div className="flex-1 py-5 px-4 text-center bg-rose-50/50 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 text-rose-900">
              <Receipt size={80} />
            </div>
            <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-1 relative z-10">Total Expenses</p>
            <p className="text-[24px] font-black text-rose-600 relative z-10">₹ {totalExpense.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {expenses.map((expense) => {
            const percentage = totalExpense > 0 ? Math.round((expense.amount / totalExpense) * 100) : 0;
            return (
              <div key={expense.id} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-12">
                    <h4 className="text-[14px] font-black text-slate-800 leading-tight mb-1">{expense.title}</h4>
                    <p className="text-[11px] font-bold text-slate-500">{expense.category} • {new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right absolute top-4 right-4">
                    <p className="text-[15px] font-black text-slate-800 leading-none mb-1">₹{expense.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-bold text-slate-400">{percentage}% of total</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <p className="text-[10px] font-medium text-slate-400">Added by: <span className="font-bold">{expense.addedBy}</span></p>
                  {expense.receiptAttached && (
                    <button className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      <FileText size={12} /> View Receipt
                    </button>
                  )}
                </div>
                
                {/* Progress Bar background */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
                  <div className="h-full bg-rose-400" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}

          {expenses.length === 0 && (
            <div className="text-center py-10">
              <Receipt size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-[14px] font-bold text-slate-500">No expenses recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
