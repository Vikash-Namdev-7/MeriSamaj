import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, HelpCircle, Info, CreditCard, ShieldCheck, 
  CheckCircle2, QrCode, Landmark, Sparkles, X, Heart, SwitchCamera,
  Download, RefreshCw, Star, ShieldAlert, Award, FileText
} from 'lucide-react';
import { useData } from '../../context/DataProvider';

const MatrimonialSubscriptionPage = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useData();

  // Active Tab for pricing plan views
  const [activePlanCategory, setActivePlanCategory] = useState('Groom'); // 'Groom' | 'Bride' | 'Combo'
  const [selectedDuration, setSelectedDuration] = useState('3 months'); // '1 month' | '3 months' | 'Till Marriage'
  
  // Checkout flow state
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('select-method'); // 'select-method' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState(''); // 'upi' | 'card' | 'netbanking'
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [upiId, setUpiId] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  // Administration simulator modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // pricing configuration structure
  const pricingData = {
    'Groom': {
      '1 month': { final: 599, original: 1999 },
      '3 months': { final: 1499, original: 4999 },
      'Till Marriage': { final: 3999, original: 9999 }
    },
    'Bride': {
      '1 month': { final: 599, original: 1999 },
      '3 months': { final: 1499, original: 4999 },
      'Till Marriage': { final: 3999, original: 9999 }
    },
    'Combo': {
      '1 month': { final: 999, original: 2999 },
      '3 months': { final: 2499, original: 7999 },
      'Till Marriage': { final: 5999, original: 14999 }
    }
  };

  const featureLists = {
    'Groom': [
      'Unlock Bride (Female) Directory searching',
      'View contact details of up to 30 matching profiles',
      'Send up to 50 matrimonial interests per month',
      'Spotlight profile placement for 15 days',
      'Gotra and compatibility matchmaking score calculator',
      'Standard online customer support'
    ],
    'Bride': [
      'Unlock Groom (Male) Directory searching',
      'View contact details of up to 30 matching profiles',
      'Send up to 50 matrimonial interests per month',
      'Spotlight profile placement for 15 days',
      'Gotra and compatibility matchmaking score calculator',
      'Standard online customer support'
    ],
    'Combo': [
      'Manage both 1 Groom (Son) and 1 Bride (Daughter) profile simultaneously',
      'Seamlessly switch active search view to filter match listings',
      'Unlock contact details of up to 100 matching profiles',
      'Send unlimited matrimonial interests',
      'Dual spotlights (15 days for groom, 15 days for bride)',
      'Gotra, Gana & Kundali matchmaking calculations',
      'Dedicated relationship customer manager support'
    ]
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Scroll lock effect for overlays
  useEffect(() => {
    const isOverlayOpen = showCheckout || showCancelModal || showInvoiceHistory;
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showCheckout, showCancelModal, showInvoiceHistory]);

  const sub = currentUser?.matrimonySubscription;
  const isCurrentlySubscribed = sub && sub.status === 'active';

  const currentPriceObj = pricingData[activePlanCategory][selectedDuration];

  const handleConfirmPayment = () => {
    setCheckoutStep('processing');
    setTimeout(() => {
      // Setup the subscription object in currentUser
      updateProfile({
        matrimonySubscription: {
          plan: activePlanCategory,
          status: 'active',
          expiry: selectedDuration,
          startDate: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          activeProfileType: activePlanCategory === 'Combo' ? 'groom' : (activePlanCategory === 'Groom' ? 'groom' : 'bride')
        }
      });
      setCheckoutStep('success');
      showToast(`Subscribed to ${activePlanCategory} Plan Successfully! 💖`);
    }, 2000);
  };

  const handleCancelSubscription = () => {
    updateProfile({
      matrimonySubscription: {
        ...sub,
        status: 'inactive'
      }
    });
    setShowCancelModal(false);
    showToast('Matrimonial Subscription Cancelled.');
  };

  const handleToggleComboActiveProfile = () => {
    if (!isCurrentlySubscribed || sub.plan !== 'Combo') return;
    const nextActive = sub.activeProfileType === 'groom' ? 'bride' : 'groom';
    updateProfile({
      matrimonySubscription: {
        ...sub,
        activeProfileType: nextActive
      }
    });
    showToast(`Switched active view to ${nextActive === 'groom' ? "Son's Profile (Groom)" : "Daughter's Profile (Bride)"} 🔄`);
  };

  const mockInvoices = [
    { id: 'INV-2026-001', date: sub?.startDate || 'Today', amount: pricingData[sub?.plan || 'Groom'][sub?.expiry || '3 months'].final, status: 'Paid' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#FFF9F9] to-white pb-24 text-slate-800 animate-fade-in font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-55 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar — Rose Theme */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-rose-100 flex items-center gap-3 px-4 h-15 sticky top-0 z-30 shadow-[0_2px_12px_rgba(244,63,94,0.03)]">
        <button 
          onClick={() => navigate(-1)} 
          className="w-9 h-9 rounded-xl bg-rose-50/50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors press-scale"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-base font-black text-rose-600 tracking-tight leading-none">Matrimonial Premium Plans</h1>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">विवाह प्रीमियम सदस्यता</p>
        </div>
      </div>

      <div className="px-5 pt-6 max-w-md mx-auto space-y-6">

        {/* ─── CASE A: USER IS ALREADY SUBSCRIBED (Active Dashboard) ─── */}
        {isCurrentlySubscribed ? (
          <div className="space-y-5 animate-fade-in">
            {/* Active Subscription Status Card */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-3xl p-6 shadow-lg shadow-rose-500/20 relative overflow-hidden border border-rose-400/25">
              <div className="absolute -right-4 -bottom-4 opacity-15">
                <Heart size={140} fill="white" />
              </div>
              <span className="bg-white/20 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest border border-white/10">
                Active Member
              </span>
              <h2 className="text-[26px] font-black mt-3.5 tracking-tight leading-none">
                {sub.plan} Membership
              </h2>
              <p className="text-rose-100 text-[12px] font-semibold mt-1">
                Duration: {sub.expiry} (Started: {sub.startDate})
              </p>
              
              <div className="mt-6 flex gap-3.5 border-t border-white/15 pt-5 text-[11px] font-bold text-rose-50/90">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-rose-200">Gotra Match</p>
                  <p className="mt-0.5 text-white font-extrabold text-[12px]">Unlimited</p>
                </div>
                <div className="w-[1px] bg-white/10" />
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-rose-200">Support</p>
                  <p className="mt-0.5 text-white font-extrabold text-[12px]">
                    {sub.plan === 'Combo' ? 'VIP Manager' : 'Standard'}
                  </p>
                </div>
              </div>
            </div>

            {/* COMBO DUAL SEARCH UTILITIES */}
            {sub.plan === 'Combo' && (
              <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                    <SwitchCamera size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider leading-none">Combo Dual Account Selector</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Toggle matches matching either son or daughter</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-2.5 flex items-center justify-between border border-slate-200/60">
                  <button
                    onClick={handleToggleComboActiveProfile}
                    className={`flex-1 text-center py-2.5 rounded-xl font-black text-[11.5px] transition-all border ${
                      sub.activeProfileType === 'groom'
                        ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Son's Search (Groom)
                  </button>
                  <button
                    onClick={handleToggleComboActiveProfile}
                    className={`flex-1 text-center py-2.5 rounded-xl font-black text-[11.5px] transition-all border ${
                      sub.activeProfileType === 'bride'
                        ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Daughter's Search (Bride)
                  </button>
                </div>

                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-start gap-2.5">
                  <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-indigo-900 leading-normal font-semibold">
                    You are currently active as <strong>{sub.activeProfileType === 'groom' ? "Son's Search (Groom)" : "Daughter's Search (Bride)"}</strong>. Matrimony homepage results are automatically filtered to show profiles of the opposite gender.
                  </p>
                </div>
              </div>
            )}

            {/* Account Administration Controls */}
            <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
              <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-wider mb-2.5">Subscription Controls</h4>
              
              <button
                onClick={() => {
                  setActivePlanCategory(sub.plan);
                  setSelectedDuration(sub.expiry);
                  setShowCheckout(true);
                  setCheckoutStep('select-method');
                }}
                className="w-full py-3 bg-slate-50 hover:bg-rose-50/30 hover:text-rose-600 border border-slate-200/70 text-slate-700 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <RefreshCw size={14} /> Change / Renew Plan
              </button>

              <button
                onClick={() => setShowInvoiceHistory(!showInvoiceHistory)}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <FileText size={14} /> View Billing Invoices
              </button>

              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 bg-red-50 hover:bg-red-100/50 text-red-600 border border-red-100 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                Cancel Matrimonial Membership
              </button>

              {/* Invoice History details toggle */}
              {showInvoiceHistory && (
                <div className="pt-4 border-t border-slate-100 space-y-2.5 animate-fade-in">
                  <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider font-sans">Invoice History</p>
                  {mockInvoices.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center p-3 bg-slate-50/70 border border-slate-200/50 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-750">{inv.id}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{inv.date} · {inv.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-700">₹{inv.amount}</span>
                        <button 
                          onClick={() => showToast('Receipt downloaded successfully! 📄')}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 rounded-lg text-slate-450 hover:text-rose-500 active:scale-90 transition-all"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-5 animate-fade-in">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowCancelModal(false)} />
                <div className="bg-white rounded-3xl p-6 z-10 shadow-2xl max-w-sm w-full text-center space-y-4 font-sans border border-slate-100">
                  <div className="w-12 h-12 bg-red-50 text-red-550 rounded-full flex items-center justify-center mx-auto border border-red-100">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Cancel Membership?</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-bold">
                      Are you sure you want to cancel your matrimonial premium membership? You will instantly lose access to premium profiles, matching gotras, and unlocked contact details.
                    </p>
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-150 text-slate-500 text-xs font-black rounded-xl"
                    >
                      Keep Plan
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="flex-1 py-3 bg-red-500 hover:bg-red-650 text-white text-xs font-black rounded-xl shadow-md"
                    >
                      Yes, Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (

          /* ─── CASE B: USER IS NOT SUBSCRIBED (Plans Presentation & Picker) ─── */
          <div className="space-y-6 animate-fade-in">
            {/* Introductory Promo Header */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-100">
                <Heart size={12} className="text-rose-500" fill="currentColor" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Premium Matrimonial Search</span>
              </div>
              <h2 className="text-[20px] font-black text-indigo-950 tracking-tight leading-tight">Find Your Ideal Life Partner</h2>
              <p className="text-[12px] text-slate-450 font-bold leading-normal px-2">
                Upgrade to our specialized plans tailored for grooms, brides, or families searching for both.
              </p>
            </div>

            {/* Custom Category Switch Tabs */}
            <div className="bg-rose-50/70 border border-rose-100/50 rounded-2xl p-1.5 flex items-center justify-between shadow-xs">
              {['Groom', 'Bride', 'Combo'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActivePlanCategory(category)}
                  className={`flex-1 text-center py-2.5 rounded-xl font-black text-[11.5px] transition-all ${
                    activePlanCategory === category
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                      : 'text-slate-500 hover:bg-rose-100/20'
                  }`}
                >
                  {category === 'Combo' ? 'Combo Plan' : `${category} Plan`}
                </button>
              ))}
            </div>

            {/* Selected Plan Details Card */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-[0_4px_24px_rgba(244,63,94,0.04)] p-6 space-y-6 relative overflow-hidden">
              {activePlanCategory === 'Combo' && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black px-3.5 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles size={8} className="text-yellow-400" /> Best Value For Parents
                </div>
              )}

              {/* Pricing selector */}
              <div>
                <h3 className="text-[17px] font-black text-indigo-950 uppercase tracking-wider">
                  {activePlanCategory === 'Combo' ? 'Combo Membership' : `${activePlanCategory} Membership`}
                </h3>
                <p className="text-[10.5px] text-slate-450 font-semibold mt-0.5">
                  {activePlanCategory === 'Combo' 
                    ? 'Dual search plan for both a son and a daughter simultaneously' 
                    : `Premium features tailored specifically for searching ${activePlanCategory === 'Groom' ? 'brides' : 'grooms'}`}
                </p>

                {/* Duration selector radio pills */}
                <div className="grid grid-cols-3 gap-2 mt-4.5">
                  {['1 month', '3 months', 'Till Marriage'].map((duration) => {
                    const priceObj = pricingData[activePlanCategory][duration];
                    const selected = selectedDuration === duration;
                    return (
                      <div
                        key={duration}
                        onClick={() => setSelectedDuration(duration)}
                        className={`border rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                          selected 
                            ? 'bg-rose-50/70 border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.5)]' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-wider ${selected ? 'text-rose-500' : 'text-slate-400'}`}>
                          {duration === 'Till Marriage' ? 'Till Marriage' : duration.split(' ')[0] + ' Mo'}
                        </span>
                        <span className="text-[15px] font-black text-slate-800 mt-1 leading-none">
                          ₹{priceObj.final}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold line-through mt-0.5">
                          ₹{priceObj.original}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plan Benefits features checklist */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Plan Benefits:</p>
                <div className="space-y-2.5">
                  {featureLists[activePlanCategory].map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 mt-0.5">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <p className="text-[12px] text-slate-650 font-bold leading-normal">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-650 text-white rounded-2xl text-[14px] font-black shadow-md shadow-rose-500/20 active:scale-95 transition-transform uppercase tracking-wider flex justify-center items-center gap-1.5"
              >
                Subscribe Now · ₹{currentPriceObj.final}
              </button>
            </div>

            {/* Premium Guarantee Badges */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex gap-3 items-center">
              <ShieldCheck size={26} className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-[11.5px] font-black text-slate-800 leading-none uppercase tracking-wider">100% Secure & Trust Verified</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-1">
                  All profiles undergo strict verification. Your details are shared securely and only with consent.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── checkout MODAL SHEET ─── */}
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in" data-swipe-block="true">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowCheckout(false)} />
            <div className="bg-white text-slate-800 w-full rounded-t-[32px] p-5 pb-safe z-10 shadow-2xl max-w-md animate-slide-up flex flex-col font-sans max-h-[85vh] overflow-y-auto">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />
              
              {/* Checkout Steps */}
              {checkoutStep === 'select-method' && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div className="text-center">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Secure Checkout</h3>
                    <p className="text-[10.5px] text-slate-450 font-bold mt-0.5">Pay safely via UPI, Cards or Net Banking</p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-4 flex justify-between items-center shrink-0">
                    <div>
                      <p className="text-xs font-black text-rose-900 leading-none">{activePlanCategory} Plan ({selectedDuration})</p>
                      <p className="text-[9.5px] text-rose-500 font-bold mt-1.5 uppercase tracking-wide font-sans">Refundable under terms</p>
                    </div>
                    <span className="text-[18px] font-black text-rose-600">₹{currentPriceObj.final}</span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                    <label className={`flex items-center gap-3.5 p-3.5 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'upi' ? 'bg-rose-50/30 border-rose-450' : 'bg-white border-slate-200'}`}>
                      <input type="radio" name="paymethod" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="accent-rose-500" />
                      <QrCode size={18} className="text-slate-400" />
                      <span className="text-xs font-black text-slate-750">UPI / QR Code (GPay, PhonePe, BHIM)</span>
                    </label>

                    <label className={`flex items-center gap-3.5 p-3.5 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'bg-rose-50/30 border-rose-450' : 'bg-white border-slate-200'}`}>
                      <input type="radio" name="paymethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-rose-500" />
                      <CreditCard size={18} className="text-slate-400" />
                      <span className="text-xs font-black text-slate-750">Debit / Credit Card (Visa, RuPay, Master)</span>
                    </label>

                    <label className={`flex items-center gap-3.5 p-3.5 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'bg-rose-50/30 border-rose-450' : 'bg-white border-slate-200'}`}>
                      <input type="radio" name="paymethod" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} className="accent-rose-500" />
                      <Landmark size={18} className="text-slate-400" />
                      <span className="text-xs font-black text-slate-750">Net Banking</span>
                    </label>
                  </div>

                  {/* Fields rendering relative to selected method */}
                  {paymentMethod === 'upi' && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3.5 animate-fade-in shrink-0">
                      <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">UPI Address Details</p>
                      <div className="flex gap-2">
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                          <button key={app} onClick={() => setSelectedUpiApp(app)} className={`flex-1 py-2 text-[10px] font-black rounded-lg border ${selectedUpiApp === app ? 'bg-rose-500 border-rose-500 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-500'}`}>{app}</button>
                        ))}
                      </div>
                      <input required type="text" placeholder="Enter UPI ID (e.g., username@okaxis)" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400" />
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 animate-fade-in shrink-0">
                      <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider font-sans font-sans">Card Details</p>
                      <input required type="text" placeholder="Cardholder's Name" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400" />
                      <input required type="text" placeholder="Card Number (XXXX XXXX XXXX XXXX)" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400" />
                      <div className="grid grid-cols-2 gap-3.5">
                        <input required type="text" placeholder="Expiry Date (MM/YY)" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400" />
                        <input required type="password" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400" />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 animate-fade-in shrink-0 relative">
                      <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">Select Bank</p>
                      <button onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-left flex justify-between items-center">{selectedBank} <span>▼</span></button>
                      {isBankDropdownOpen && (
                        <div className="absolute left-4 right-4 top-20 z-20 bg-white border border-slate-200 shadow-xl rounded-xl divide-y divide-slate-100 max-h-36 overflow-y-auto">
                          {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank'].map(bank => (
                            <button key={bank} onClick={() => { setSelectedBank(bank); setIsBankDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 font-bold">{bank}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2.5 pt-3 pb-4 mt-auto shrink-0 font-sans">
                    <button onClick={() => setShowCheckout(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-150 text-slate-500 rounded-xl text-xs font-black">Cancel</button>
                    <button onClick={handleConfirmPayment} disabled={!paymentMethod} className={`flex-1 py-3.5 text-white rounded-xl text-xs font-black shadow-md ${paymentMethod ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-350 cursor-not-allowed'}`}>Confirm & Pay</button>
                  </div>
                </div>
              )}

              {checkoutStep === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 flex-1">
                  <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
                  <div className="text-center font-sans">
                    <h3 className="text-sm font-black text-slate-800 font-sans">Processing Payment</h3>
                    <p className="text-[10.5px] text-slate-400 mt-1 font-semibold">Please do not close or hit back button...</p>
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-5 text-center flex-1">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 animate-scale-up">
                    <CheckCircle2 size={36} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-indigo-950 font-sans">Subscription Activated!</h3>
                    <p className="text-xs text-slate-450 mt-1 leading-relaxed px-4 font-bold font-sans">
                      Your Matrimonial Premium Plan is now active. You can now unlock contact details, search matching gotras, and find your partner!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      navigate('/member/matrimonial');
                    }}
                    className="w-full max-w-[200px] py-3 bg-rose-500 text-white rounded-xl text-xs font-black shadow-md uppercase tracking-wider font-sans"
                  >
                    Go to Matrimony Home
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrimonialSubscriptionPage;
