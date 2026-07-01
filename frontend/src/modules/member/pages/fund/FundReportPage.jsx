import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Download, ChevronDown, Filter } from 'lucide-react';
import { useFund } from '../../context/FundContext';

export default function FundReportPage() {
  const { fundId } = useParams();
  const navigate = useNavigate();
  const { getFundById, getContributionsByFund, getExpensesByFund } = useFund();
  
  const [year, setYear] = useState('2023-24');
  const [isDownloading, setIsDownloading] = useState(false);
  const years = ['2023-24', '2024-25', '2025-26'];
  const cycleYear = () => setYear(years[(years.indexOf(year) + 1) % years.length]);

  const fund = getFundById(fundId);
  const contributions = getContributionsByFund(fundId);
  const expenses = getExpensesByFund(fundId);

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

  const currentFund = contributions.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSaving = currentFund - totalExpense;

  // Mock monthly data for the bar chart
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const chartData = [
    { income: 60, expense: 40 },
    { income: 80, expense: 30 },
    { income: 50, expense: 70 },
    { income: 90, expense: 50 },
    { income: 40, expense: 30 },
    { income: 70, expense: 60 },
  ];

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
            <h1 className="text-[17px] font-bold text-slate-800">Fund Report</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{fund.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Financial Year Selector */}
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[13px] font-bold text-slate-600">Financial Year:</span>
          <button onClick={cycleYear} className="flex items-center gap-2 text-[14px] font-bold text-indigo-600 active:scale-95 transition-transform">
            {year} <ChevronDown size={16} className="text-indigo-400" />
          </button>
        </div>

        {/* Summary Banner */}
        <div className="bg-indigo-700 rounded-[24px] overflow-hidden shadow-md text-white">
          <div className="py-2.5 bg-indigo-800 text-center text-[12px] font-bold tracking-wider uppercase text-indigo-200">
            Total Summary
          </div>
          <div className="flex divide-x divide-indigo-500/50 p-4">
            <div className="flex-1 text-center px-2">
              <p className="text-[10px] font-medium text-indigo-200 mb-1">Total Income</p>
              <p className="text-[14px] font-black">₹ {currentFund.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex-1 text-center px-2">
              <p className="text-[10px] font-medium text-indigo-200 mb-1">Total Expense</p>
              <p className="text-[14px] font-black">₹ {totalExpense.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex-1 text-center px-2">
              <p className="text-[10px] font-medium text-indigo-200 mb-1">Net Balance</p>
              <p className="text-[14px] font-black">₹ {netSaving.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[14px] text-slate-800">Income vs Expense (Monthly)</h3>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-sm" /> Income</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-sm" /> Expense</div>
            </div>
          </div>
          
          <div className="h-40 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
            {/* Y-axis labels mock */}
            <div className="absolute left-0 top-0 bottom-2 flex flex-col justify-between text-[9px] font-medium text-slate-400">
              <span>High</span>
              <span>Med</span>
              <span>Low</span>
            </div>
            
            <div className="pl-6 w-full flex justify-between h-full items-end gap-1">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex justify-center items-end gap-1 h-full">
                  <div className="w-full max-w-[8px] bg-emerald-500 rounded-t-sm" style={{ height: `${d.income}%` }} />
                  <div className="w-full max-w-[8px] bg-rose-500 rounded-t-sm" style={{ height: `${d.expense}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between pl-6 mt-2 text-[10px] font-bold text-slate-400">
            {months.map(m => <span key={m} className="flex-1 text-center">{m}</span>)}
          </div>
        </div>

        <button 
          onClick={() => {
            if (isDownloading) return;
            setIsDownloading(true);
            setTimeout(() => {
              setIsDownloading(false);
            }, 2000);
          }}
          className={`w-full text-white rounded-2xl py-4 font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
            isDownloading ? 'bg-indigo-400 cursor-wait' : 'bg-slate-900'
          }`}
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download size={18} /> Download Detailed Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
