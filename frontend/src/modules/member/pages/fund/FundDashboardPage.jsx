import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Info, FileText, X, CheckCircle2, HeartHandshake, TrendingUp, Users, ShieldAlert, Wallet, QrCode, CreditCard, Landmark } from 'lucide-react';
import { useFund } from '../../context/FundContext';

export default function FundDashboardPage() {
  const { fundId } = useParams();
  const navigate = useNavigate();
  const { getFundById, getContributionsByFund, getExpensesByFund, currentUserId, isAdmin, makePayment } = useFund();

  const [showPayModal, setShowPayModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [payAmount, setPayAmount] = useState(0);

  // Advanced Payment States
  const [checkoutStep, setCheckoutStep] = useState('select-method'); // 'select-method' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState(''); // 'upi' | 'card' | 'netbanking'
  const [upiMethod, setUpiMethod] = useState('apps'); // 'apps' | 'id'
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [upiId, setUpiId] = useState('');
  
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  const banksList = [
    { id: 'SBI', name: 'State Bank of India (SBI)' },
    { id: 'HDFC', name: 'HDFC Bank' },
    { id: 'ICICI', name: 'ICICI Bank' },
    { id: 'AXIS', name: 'Axis Bank' },
    { id: 'KOTAK', name: 'Kotak Mahindra Bank' }
  ];

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(' ') : v;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    return v;
  };

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

  const handlePayment = async () => {
    if (payAmount <= 0) return;
    setCheckoutStep('processing');
    try {
      const mode = paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Card' : 'Net Banking';
      const res = await makePayment(fundId, currentUserId, Number(payAmount), mode);
      if (res.success) {
        setCheckoutStep('success');
      } else {
        alert(res.message || 'Payment failed.');
        setCheckoutStep('select-method');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during payment processing.');
      setCheckoutStep('select-method');
    }
  };

  const openPaymentModal = () => {
    setPayAmount(myDue);
    setCheckoutStep('select-method');
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
            onClick={() => setIsBankDropdownOpen(false)}
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
              
              {checkoutStep === 'select-method' ? (
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
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-bold text-slate-800 outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>

                  {/* Payment Channel Options */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block text-left">Choose Payment Method</label>
                    
                    {/* Method 1: UPI */}
                    <div 
                      onClick={() => setPaymentMethod('upi')}
                      className={`border rounded-2xl p-3 cursor-pointer transition-all flex items-start gap-3 text-left ${
                        paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="payment_method" 
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="mt-0.5 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800">UPI (Google Pay, PhonePe, UPI ID)</span>
                          <QrCode size={16} className="text-slate-400" />
                        </div>
                        
                        {paymentMethod === 'upi' && (
                          <div className="mt-3.5 space-y-3 pt-3.5 border-t border-slate-100 animate-fade-in-up">
                            <div className="flex gap-2 text-[10px] font-bold">
                              {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                                <button
                                  key={app}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setUpiMethod('apps'); setSelectedUpiApp(app); }}
                                  className={`flex-1 py-2 border rounded-xl transition-all ${
                                    upiMethod === 'apps' && selectedUpiApp === app
                                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-extrabold'
                                      : 'border-slate-200 text-slate-500 hover:border-slate-300 font-bold'
                                  }`}
                                >
                                  {app}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setUpiMethod('id'); }}
                                className={`flex-1 py-2 border rounded-xl transition-all ${
                                  upiMethod === 'id'
                                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-extrabold'
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300 font-bold'
                                }`}
                              >
                                Enter UPI ID
                              </button>
                            </div>

                            {upiMethod === 'id' && (
                              <input 
                                type="text"
                                placeholder="example@upi"
                                value={upiId}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Method 2: Cards */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`border rounded-2xl p-3 cursor-pointer transition-all flex items-start gap-3 text-left ${
                        paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="payment_method" 
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-0.5 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800">Credit / Debit Card</span>
                          <CreditCard size={16} className="text-slate-400" />
                        </div>

                        {paymentMethod === 'card' && (
                          <div className="mt-3.5 space-y-3 pt-3.5 border-t border-slate-100 animate-fade-in-up text-left" onClick={(e) => e.stopPropagation()}>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Card Holder Name</label>
                              <input 
                                type="text"
                                placeholder="Enter holder name"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Card Number</label>
                              <input 
                                type="text"
                                maxLength="19"
                                placeholder="XXXX XXXX XXXX XXXX"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Expiry Date</label>
                                <input 
                                  type="text"
                                  maxLength="5"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">CVV</label>
                                <input 
                                  type="password"
                                  maxLength="3"
                                  placeholder="XXX"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Method 3: Netbanking */}
                    <div 
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`border rounded-2xl p-3 cursor-pointer transition-all flex items-start gap-3 text-left ${
                        paymentMethod === 'netbanking' ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="payment_method" 
                        checked={paymentMethod === 'netbanking'}
                        onChange={() => setPaymentMethod('netbanking')}
                        className="mt-0.5 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800">Net Banking</span>
                          <Landmark size={16} className="text-slate-400" />
                        </div>

                        {paymentMethod === 'netbanking' && (
                          <div className="mt-3.5 pt-3.5 border-t border-slate-100 animate-fade-in-up text-left" onClick={(e) => e.stopPropagation()}>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Select Bank</label>
                            <div className="relative">
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setIsBankDropdownOpen(!isBankDropdownOpen); }}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none text-left flex justify-between items-center pr-8 font-bold focus:border-indigo-600 cursor-pointer"
                              >
                                <span>{banksList.find(b => b.id === selectedBank)?.name || selectedBank}</span>
                                <span className="text-[8px] text-slate-500">▼</span>
                              </button>

                              {isBankDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto divide-y divide-slate-100 py-1">
                                  {banksList.map((bank) => (
                                    <div
                                      key={bank.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBank(bank.id);
                                        setIsBankDropdownOpen(false);
                                      }}
                                      className={`px-3.5 py-2.5 text-xs font-semibold cursor-pointer hover:bg-indigo-50/50 transition-colors text-left ${
                                        selectedBank === bank.id ? 'text-indigo-600 bg-indigo-50/20 font-bold' : 'text-slate-800'
                                      }`}
                                    >
                                      {bank.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pay button */}
                  <div className="pt-3">
                    <button
                      onClick={handlePayment}
                      disabled={
                        payAmount <= 0 ||
                        !paymentMethod ||
                        (paymentMethod === 'upi' && upiMethod === 'id' && !upiId.includes('@')) ||
                        (paymentMethod === 'card' && (!cardName || cardNumber.length < 15 || cardExpiry.length < 5 || cardCvv.length < 3))
                      }
                      className={`w-full py-3.5 text-white font-extrabold text-xs rounded-2xl active:scale-95 transition-all shadow-md ${
                        (payAmount > 0 && paymentMethod && 
                        (paymentMethod !== 'upi' || upiMethod !== 'id' || upiId.includes('@')) && 
                        (paymentMethod !== 'card' || (cardName && cardNumber.length >= 15 && cardExpiry.length === 5 && cardCvv.length === 3)))
                          ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-indigo-200'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      Pay ₹{Number(payAmount).toLocaleString('en-IN')} securely
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
                    <h4 className="text-xs font-extrabold text-indigo-950">Authorizing Payment...</h4>
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
                      <span className="font-mono text-slate-400">TXN{Math.floor(Date.now() / 1000)}</span>
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
