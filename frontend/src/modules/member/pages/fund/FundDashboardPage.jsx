import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Info, FileText, X, CheckCircle2, HeartHandshake, TrendingUp, Users, ShieldAlert, Wallet } from 'lucide-react';
import { useFund } from '../../context/FundContext';

export default function FundDashboardPage() {
  const { fundId } = useParams();
  const navigate = useNavigate();
  const { getFundById, getContributionsByFund, getExpensesByFund, currentUserId, isAdmin, razorpayMakePayment } = useFund();

  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(0);

  // Payment flow states
  const [checkoutStep, setCheckoutStep] = useState('pay'); // 'pay' | 'processing' | 'success'
  const [isPayingNow, setIsPayingNow] = useState(false);   // Disables button during payment
  const [lastPaymentResult, setLastPaymentResult] = useState(null);

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
  const fundExpenses = getExpensesByFund(fundId);

  // My Contribution
  const myContrib = fundContribs.find(c => c.memberId === currentUserId) || { assignedAmount: 0, paidAmount: 0 };
  const myDue = myContrib.assignedAmount - myContrib.paidAmount;
  const isPaid = myContrib.paidAmount > 0 && myDue <= 0;

  // Community Calculations
  const totalMembers = fund.assignedMembers.length;
  let targetCollection = 0;
  let totalCollected = 0;
  let fullyPaidMembers = 0;

  fundContribs.forEach(c => {
    targetCollection += c.assignedAmount || 0;
    totalCollected += c.paidAmount || 0;
    if (c.paidAmount >= c.assignedAmount) fullyPaidMembers++;
  });
  
  const percentage = targetCollection > 0 ? Math.round((totalCollected / targetCollection) * 100) : 0;
  const remaining = targetCollection - totalCollected;

  // Financial Dashboard (Expenses)
  const totalExpenses = fundExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const availableBalance = totalCollected - totalExpenses;

  const handleRazorpayPayment = async () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid contribution amount.');
      return;
    }

    setIsPayingNow(true);
    setCheckoutStep('processing');

    const result = await razorpayMakePayment(fundId, amount, {
      onSuccess: (data) => {
        setLastPaymentResult(data);
        setCheckoutStep('success');
      },
      onCancel: () => {
        setCheckoutStep('pay');
        alert('Payment cancelled.');
      },
      onFailure: (msg) => {
        setCheckoutStep('pay');
        alert(msg || 'Payment failed. Please try again.');
      }
    });

    setIsPayingNow(false);
    if (result?.cancelled || !result?.success) {
      setCheckoutStep('pay');
    }
  };

  const openPaymentModal = () => {
    setPayAmount(myDue);
    setCheckoutStep('pay');
    setLastPaymentResult(null);
    setShowPayModal(true);
  };


  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans pb-10 select-none">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)] shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-text-primary tracking-tight leading-tight line-clamp-1 pr-2">{fund.name}</h1>
            <p className="text-[9px] text-text-secondary font-bold leading-none uppercase tracking-wider">{fund.status}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto w-full">
        
        {/* MY CONTRIBUTION WIDGET */}
        {fund.assignedMembers.includes(currentUserId) && (
          <div className="card-neo p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake size={18} className="text-brand-primary" />
              <h3 className="font-bold text-[15px] text-text-primary tracking-tight">My Contribution</h3>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold text-text-secondary mb-0.5">Assigned Amount</p>
                <p className="text-[18px] font-black text-text-primary leading-none">₹{myContrib.assignedAmount.toLocaleString('en-IN')}</p>
                
                <div className="flex items-center gap-3 mt-3">
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">Paid</p>
                    <p className="text-[13px] font-bold text-emerald-600">₹{myContrib.paidAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="w-px h-6 bg-purple-100/30" />
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">Balance</p>
                    <p className={`text-[13px] font-bold ${myDue > 0 ? 'text-rose-650' : 'text-text-primary'}`}>₹{myDue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
              
              {myDue > 0 ? (
                <button 
                  onClick={openPaymentModal}
                  className="bg-gradient-to-r from-brand-primary to-brand-glow text-white text-[13px] font-bold px-5 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.25)] active:scale-95 transition-all press-scale"
                >
                  Pay Now
                </button>
              ) : (
                <div className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-4 py-2 rounded-xl flex items-center gap-1.5 font-semibold shadow-sm">
                  <CheckCircle2 size={16} />
                  <span className="text-[12px]">Paid</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMMUNITY COLLECTION BANNER */}
        <div className="bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] rounded-[28px] p-5 text-white shadow-xl shadow-purple-500/10 border border-purple-400/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
          <p className="text-[12px] font-medium text-purple-200/90 mb-1 relative z-10">Community Collection</p>
          <div className="flex items-end gap-2 relative z-10 mb-4">
            <h2 className="text-3xl font-black leading-none">₹ {totalCollected.toLocaleString('en-IN')}</h2>
            <span className="text-[12px] font-bold text-purple-200/70 mb-1">/ ₹{targetCollection.toLocaleString('en-IN')}</span>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between text-[11px] font-bold text-purple-100/80 mb-1.5">
              <span>Collection Progress</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-purple-950/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* FINANCIAL DASHBOARD */}
        <div className="card-neo p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={18} className="text-text-primary" />
            <h3 className="font-bold text-[15px] text-text-primary tracking-tight">Financial Dashboard</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50/30 p-3 rounded-2xl border border-purple-100/15">
              <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-1">Available Bal.</p>
              <p className="text-[15px] font-black text-brand-dark">₹ {availableBalance.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-rose-50/20 p-3 rounded-2xl border border-rose-100/15">
              <p className="text-[10px] font-bold text-rose-550 uppercase tracking-wider mb-1">Total Expenses</p>
              <p className="text-[15px] font-black text-rose-650">₹ {totalExpenses.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div 
            onClick={() => navigate(`/member/fund/${fundId}/dues`)}
            className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-[16px] font-black text-slate-800">{fullyPaidMembers} / {totalMembers}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Fully Paid</p>
          </div>
          
          <div 
            onClick={() => navigate(`/member/fund/${fundId}/dues`)}
            className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-2">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-[16px] font-black text-slate-800">₹ {remaining.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Pending Collection</p>
          </div>
        </div>

        {/* NAVIGATIONS */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm mt-2">
          <h3 className="font-bold text-[14px] text-slate-800 mb-4">Manage Fund</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => navigate(`/member/fund/${fundId}/dues`)} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 active:scale-95 transition-all">
                <Users size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">Members</span>
            </button>
            <button onClick={() => navigate(`/member/fund/${fundId}/expense`)} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 active:scale-95 transition-all">
                <FileText size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">Expenses</span>
            </button>
            <button onClick={() => navigate(`/member/fund/${fundId}/report`)} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-100 active:scale-95 transition-all">
                <Info size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── CHECKOUT / PAYMENT FLOW MODAL ─── */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up text-left max-h-[85vh]"
          >
            {/* Checkout Header */}
            <div className="bg-indigo-50/50 px-5 py-4 border-b border-indigo-100/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
                  <Wallet size={16} className="fill-indigo-600/10" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-indigo-950">Fund Contribution Pay</h3>
                  <p className="text-[9px] font-bold text-slate-500 tracking-wide uppercase">Secure checkout</p>
                </div>
              </div>
              {checkoutStep !== 'processing' && (
                <button 
                  onClick={() => setShowPayModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Checkout Body Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">

              {checkoutStep === 'pay' ? (
                <>
                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center text-xs font-bold text-slate-800">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 font-bold block">{fund.name}</span>
                      <span className="text-indigo-950 text-sm mt-0.5 block">Amount Due: ₹{myDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Amount to Pay (₹)</label>
                    <input 
                      type="number" 
                      value={payAmount}
                      min="1"
                      max={myDue}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-bold text-slate-800 outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>

                  {/* Pay Button */}
                  <div className="pt-1">
                    <button
                      onClick={handleRazorpayPayment}
                      disabled={isPayingNow || Number(payAmount) <= 0}
                      className={`w-full py-3.5 text-white font-extrabold text-sm rounded-2xl active:scale-95 transition-all shadow-md ${
                        !isPayingNow && Number(payAmount) > 0
                          ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-indigo-200'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isPayingNow ? 'Processing...' : `Pay ₹${Number(payAmount).toLocaleString('en-IN')}`}
                    </button>
                    <p className="text-[9px] text-center text-slate-500 mt-2.5">
                      🔒 Your transaction is secured with 256-bit SSL encryption.
                    </p>
                  </div>
                </>
              ) : checkoutStep === 'processing' ? (
                /* ─── PAYMENT PROCESSING SPIN STATE ─── */
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <Wallet size={20} className="text-indigo-600 absolute animate-pulse fill-indigo-600/10" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <h4 className="text-xs font-extrabold text-indigo-950">Opening Razorpay...</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Please do not refresh the page or press the back button.
                    </p>
                  </div>
                </div>
              ) : (
                /* ─── SUCCESS screen ─── */
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-5 animate-fade-in-up">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-md animate-scale-up mx-auto">
                    <CheckCircle2 size={36} className="stroke-[2.5]" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-emerald-950">Payment Successful!</h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed px-4">
                      Thank you! Your contribution to <strong>{fund.name}</strong> has been successfully recorded.
                    </p>
                  </div>

                  {/* Receipt Box */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-left space-y-2.5 text-[10px] font-bold text-slate-800">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-500 uppercase">Receipt details</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Paid</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fund Name:</span>
                      <span className="text-right truncate ml-4">{fund.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Paid:</span>
                      <span className="text-emerald-700 font-extrabold">₹{Number(payAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trans ID:</span>
                      <span className="font-mono text-slate-400 text-[9px]">{lastPaymentResult?.txnId || lastPaymentResult?.paymentId || `TXN${Math.floor(Date.now() / 1000)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span>{new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPayModal(false)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold active:scale-95 shadow-lg shadow-emerald-100 transition-all animate-scale-up"
                  >
                    Done
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
