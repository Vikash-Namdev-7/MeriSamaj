import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Building2, Smartphone, CheckCircle2, Loader2, Coins } from 'lucide-react';
import { useReferral } from './ReferralContext';

const RedeemPointsPage = () => {
  const navigate = useNavigate();
  const { availablePoints, conversionRate, redeemPoints } = useReferral();
  
  const [method, setMethod] = useState('UPI');
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleRedeem = async (e) => {
    e.preventDefault();
    setError('');
    const numAmount = parseInt(amount);

    if (!numAmount || isNaN(numAmount) || numAmount < 500) {
      setError('Minimum redeem is 500 points');
      return;
    }
    if (numAmount > availablePoints) {
      setError('Insufficient points');
      return;
    }
    if (!details.trim()) {
      setError(`Please enter your ${method} details`);
      return;
    }

    setLoading(true);
    try {
      await redeemPoints(numAmount, method, details);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to process redemption');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#F8F7FC] min-h-screen pb-20 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-emerald-100 max-w-sm w-full">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Request Sent!</h2>
          <p className="text-sm font-medium text-slate-500 mb-8">
            Your redemption request for {amount} points has been submitted. The amount will reflect in your {method} account within 24-48 hours.
          </p>
          <button 
            onClick={() => navigate('/member/referral/earnings', { replace: true })}
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[14px] font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            Back to Earnings
          </button>
        </div>
      </div>
    );
  }

  const redeemableAmount = availablePoints * conversionRate;

  return (
    <div className="bg-[#F8F7FC] min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-5 h-16 flex items-center border-b border-gray-150/40 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-800 active:scale-95 transition-transform">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-[17px] font-black text-slate-800 ml-3">Redeem Points</h1>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Available Points Card */}
        <div className="relative rounded-[24px] overflow-hidden shadow-[0_8px_24px_rgba(16,185,129,0.15)] bg-gradient-to-br from-[#065F46] via-[#047857] to-[#059669]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins size={16} className="text-emerald-200" />
              <p className="text-emerald-100 text-[12px] font-bold uppercase tracking-wider">Available Points</p>
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-white text-4xl font-black leading-none">{availablePoints.toLocaleString()}</h2>
              <div className="mt-4 pt-4 border-t border-emerald-500/30 flex justify-between items-center">
                <span className="text-emerald-200/80 text-[12px] font-semibold uppercase tracking-wider">Redeemable Amount</span>
                <span className="text-white text-xl font-black">₹{redeemableAmount.toLocaleString()}.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRedeem} className="space-y-6">
          
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100/50">
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Points to Redeem</label>
            <div className="relative">
              <Coins size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
              <input
                type="number"
                placeholder="Enter points (Min 500)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="500"
                max={availablePoints}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-[15px] font-bold text-slate-800 outline-none focus:border-brand-primary/40 focus:bg-white transition-all shadow-inner"
              />
            </div>
            {amount && !isNaN(parseInt(amount)) && (
              <p className="text-[11px] font-bold text-emerald-500 mt-2 ml-1 flex items-center gap-1">
                You will receive: ₹{(parseInt(amount) * conversionRate).toLocaleString()}.00
              </p>
            )}
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100/50">
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Select Withdrawal Method</label>
            <div className="space-y-2.5">
              {[
                { id: 'UPI', icon: Smartphone, label: 'UPI Transfer' },
                { id: 'Bank Transfer', icon: Building2, label: 'Bank Transfer' },
                { id: 'Wallet', icon: Wallet, label: 'Wallet Balance' }
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = method === opt.id;
                return (
                  <label key={opt.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon size={16} />
                      </div>
                      <span className={`text-[14px] font-bold ${isSelected ? 'text-brand-primary' : 'text-slate-700'}`}>{opt.label}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-brand-primary' : 'border-slate-300'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />}
                    </div>
                    <input type="radio" className="hidden" name="method" value={opt.id} checked={isSelected} onChange={() => { setMethod(opt.id); setDetails(''); }} />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100/50">
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
              {method === 'UPI' ? 'Enter UPI ID' : method === 'Bank Transfer' ? 'Enter Account Number' : 'Enter Wallet Mobile Number'}
            </label>
            <input
              type="text"
              placeholder={method === 'UPI' ? 'yourname@upi' : method === 'Bank Transfer' ? 'Account Number' : 'Mobile Number'}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-[14px] font-bold text-slate-800 outline-none focus:border-brand-primary/40 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-3 text-center text-[12px] font-bold">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-primary text-white rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Redeem Now'}
          </button>
          
          <p className="text-center text-[11px] font-semibold text-slate-400">
            Minimum Redeem: 500 Points<br/>1 Point = ₹{conversionRate}
          </p>

        </form>

      </div>
    </div>
  );
};

export default RedeemPointsPage;
