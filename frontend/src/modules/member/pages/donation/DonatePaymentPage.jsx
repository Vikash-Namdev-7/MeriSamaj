import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CreditCard, QrCode, Landmark, ChevronDown } from 'lucide-react';
import { useDonation } from './DonationContext';

const DonatePaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { purposes, makeDonation } = useDonation();

  // Retrieve details passed from setup state
  const { purposeId, amount, type, method } = location.state || {};

  const purpose = purposes.find(p => p.id === purposeId);

  const [selectedBank, setSelectedBank] = useState('SBI');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [netBankingStep, setNetBankingStep] = useState('select'); // 'select' | 'login' | 'otp'
  const [bankUserId, setBankUserId] = useState('');
  const [bankPassword, setBankPassword] = useState('');
  const [bankOtp, setBankOtp] = useState('');

  const [upiMethod, setUpiMethod] = useState('apps'); // 'apps' | 'qr' | 'id'
  const [userUpiId, setUserUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');

  const banksList = [
    { id: 'SBI', name: 'State Bank of India (SBI)', short: 'SBI' },
    { id: 'HDFC', name: 'HDFC Bank', short: 'HDFC' },
    { id: 'ICICI', name: 'ICICI Bank', short: 'ICICI' },
    { id: 'AXIS', name: 'Axis Bank', short: 'Axis' },
    { id: 'PNB', name: 'Punjab National Bank (PNB)', short: 'PNB' },
    { id: 'BOB', name: 'Bank of Baroda (BOB)', short: 'BOB' },
    { id: 'KOTAK', name: 'Kotak Mahindra Bank', short: 'Kotak' }
  ];
  const selectedBankObj = banksList.find(b => b.id === selectedBank) || banksList[0];

  const isFormValid = () => {
    if (!method) return true;
    if (method.includes('कार्ड') || method.includes('card') || method.includes('डेबिट')) {
      return cardName.trim() !== '' && cardNumber.replace(/\s/g, '').length >= 15 && cardExpiry.length === 5 && cardCvv.length === 3;
    }
    if (method.includes('UPI')) {
      if (upiMethod === 'id') {
        return isUpiVerified;
      }
      return true;
    }
    return true;
  };

  const handleNextProcess = () => {
    if (method.includes('बैंकिंग') || method.includes('netbank') || method.includes('बैंक')) {
      if (netBankingStep === 'select') {
        setNetBankingStep('login');
        return;
      }
    }
    handlePaymentComplete();
  };

  if (!purpose || !amount) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <ArrowLeft size={48} className="text-gray-300 mb-3" />
        <h2 className="text-base font-bold text-text-primary">Details Missing</h2>
        <p className="text-xs text-text-secondary mt-1 mb-6">Not enough details to continue the payment process.</p>
        <button onClick={() => navigate('/member/donation')} className="btn-primary py-2 px-6 text-xs">
          Go back to Donation Dashboard
        </button>
      </div>
    );
  }

  const handlePaymentComplete = () => {
    // Cast in-memory transaction
    const txn = makeDonation(purposeId, amount, type);
    
    // Route to Success Screen 4
    navigate('/member/donation/success', { state: { txn } });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-surface pb-16">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary">Make Payment</h1>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-xl mx-auto space-y-6">
        
        {/* 1. Donation Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Donation Details</h3>
          
          <div className="bg-card rounded-2xl p-4.5 border border-gray-100 shadow-sm space-y-3.5 text-xs">
            <div className="flex justify-between pb-2.5 border-b border-gray-50">
              <span className="font-semibold text-text-secondary">Purpose:</span>
              <span className="font-bold text-purple-900">{purpose.title}</span>
            </div>
            <div className="flex justify-between pb-2.5 border-b border-gray-50">
              <span className="font-semibold text-text-secondary">Amount:</span>
              <span className="font-extrabold text-text-primary">₹{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-text-secondary">Donation Type:</span>
              <span className="font-bold text-text-primary">{type}</span>
            </div>
          </div>
        </div>

        {/* 2. Payment Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Payment Summary</h3>
          
          <div className="bg-card rounded-2xl p-4.5 border border-gray-100 shadow-sm flex justify-between items-center text-xs">
            <span className="font-bold text-text-primary text-[13px]">Total Amount:</span>
            <span className="font-black text-purple-900 text-base">₹{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* 3. Pay Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Make Payment</h3>
          
          <div className="bg-card rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-5 text-center">
            
            {/* Payment Method Specific Renders */}
            {netBankingStep === 'login' ? (
              <div className="w-full text-left space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-gray-150/50">
                  <Landmark size={18} className="text-purple-600" />
                  <h4 className="text-xs font-bold text-text-primary">{selectedBankObj.name} - Secure Login</h4>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">User ID / Customer ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter User ID" 
                      value={bankUserId}
                      onChange={(e) => setBankUserId(e.target.value)}
                      className="w-full bg-surface border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter Password" 
                      value={bankPassword}
                      onChange={(e) => setBankPassword(e.target.value)}
                      className="w-full bg-surface border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 w-full">
                  <button 
                    type="button"
                    onClick={() => setNetBankingStep('select')}
                    className="flex-1 py-3 border border-gray-200 text-text-secondary text-xs font-bold rounded-xl press-scale hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    disabled={!bankUserId || !bankPassword}
                    onClick={() => setNetBankingStep('otp')}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl press-scale shadow-sm ${
                      (bankUserId && bankPassword)
                        ? 'bg-purple-700 hover:bg-purple-800 text-white cursor-pointer' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Login
                  </button>
                </div>
              </div>
            ) : netBankingStep === 'otp' ? (
              <div className="w-full text-left space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-gray-150/50">
                  <ShieldCheck size={18} className="text-emerald-600 animate-bounce" />
                  <h4 className="text-xs font-bold text-text-primary">OTP Verification</h4>
                </div>

                <div className="space-y-3.5 text-center">
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Enter the **6-digit OTP** sent to your registered mobile number to complete the secure transaction.
                  </p>
                  
                  <div className="max-w-[180px] mx-auto">
                    <input 
                      type="text" 
                      placeholder="• • • • • •" 
                      maxLength="6"
                      value={bankOtp}
                      onChange={(e) => setBankOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center bg-surface border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold tracking-widest text-text-primary outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 w-full">
                  <button 
                    type="button"
                    onClick={() => setNetBankingStep('login')}
                    className="flex-1 py-3 border border-gray-200 text-text-secondary text-xs font-bold rounded-xl press-scale hover:bg-gray-50"
                  >
                    Go Back
                  </button>
                  <button 
                    type="button"
                    disabled={bankOtp.length !== 6}
                    onClick={handlePaymentComplete}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl press-scale shadow-sm ${
                      bankOtp.length === 6
                        ? 'bg-purple-700 hover:bg-purple-800 text-white cursor-pointer' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Verify
                  </button>
                </div>
              </div>
            ) : (
              <>
                {method.includes('UPI') ? (
                  <div className="w-full flex flex-col items-center">
                    {/* Segmented controls for UPI Apps vs QR vs UPI ID */}
                    <div className="flex bg-gray-50 p-1 rounded-xl w-full mb-4 border border-gray-200/50">
                      <button
                        type="button"
                        onClick={() => setUpiMethod('apps')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          upiMethod === 'apps'
                            ? 'bg-white text-purple-950 shadow-sm border border-gray-100'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        UPI Apps
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMethod('qr')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          upiMethod === 'qr'
                            ? 'bg-white text-purple-950 shadow-sm border border-gray-100'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        QR Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMethod('id')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          upiMethod === 'id'
                            ? 'bg-white text-purple-950 shadow-sm border border-gray-100'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        UPI ID
                      </button>
                    </div>

                    {upiMethod === 'apps' ? (
                      <div className="w-full text-left space-y-4 py-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Select app for payment</label>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { id: 'gpay', name: 'Google Pay', short: 'GPay', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                            { id: 'phonepe', name: 'PhonePe', short: 'PhonePe', color: 'text-purple-600 bg-purple-50 border-purple-100' },
                            { id: 'paytm', name: 'Paytm', short: 'Paytm', color: 'text-sky-600 bg-sky-50 border-sky-100' },
                            { id: 'bhim', name: 'BHIM UPI', short: 'BHIM', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
                          ].map(app => {
                            const isSelected = selectedUpiApp === app.id;
                            return (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => setSelectedUpiApp(app.id)}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                                  isSelected 
                                    ? 'border-purple-600 bg-purple-50/50 text-purple-950 shadow-sm' 
                                    : 'border-gray-150 bg-surface text-text-secondary hover:border-gray-200'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${app.color}`}>
                                  {app.short[0]}
                                </span>
                                <span>{app.name}</span>
                              </button>
                            );
                          })}
                        </div>
                        
                        <div className="bg-purple-50/30 rounded-xl p-2.5 border border-purple-100/50 text-[10px] text-purple-800 text-center font-medium">
                          Click 'Complete Payment' below to complete secure payment via the selected app.
                        </div>
                      </div>
                    ) : upiMethod === 'qr' ? (
                      <div className="space-y-3 flex flex-col items-center">
                        {/* SVG QR Code Illustration */}
                        <div className="p-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                          <svg viewBox="0 0 100 100" className="w-36 h-36 text-text-primary" fill="currentColor">
                            {/* Finder patterns */}
                            <rect x="5" y="5" width="25" height="25" />
                            <rect x="9" y="9" width="17" height="17" fill="white" />
                            <rect x="12" y="12" width="11" height="11" />
                            
                            <rect x="70" y="5" width="25" height="25" />
                            <rect x="74" y="9" width="17" height="17" fill="white" />
                            <rect x="77" y="12" width="11" height="11" />
                            
                            <rect x="5" y="70" width="25" height="25" />
                            <rect x="9" y="74" width="17" height="17" fill="white" />
                            <rect x="12" y="77" width="11" height="11" />
                            
                            {/* QR Code Pixel Blocks */}
                            <rect x="35" y="10" width="10" height="5" />
                            <rect x="55" y="5" width="10" height="15" />
                            <rect x="40" y="25" width="15" height="5" />
                            <rect x="5" y="45" width="10" height="10" />
                            <rect x="20" y="35" width="5" height="15" />
                            <rect x="35" y="40" width="25" height="10" />
                            <rect x="75" y="35" width="15" height="5" />
                            <rect x="85" y="45" width="10" height="15" />
                            <rect x="40" y="60" width="5" height="20" />
                            <rect x="55" y="75" width="10" height="10" />
                            <rect x="70" y="65" width="15" height="5" />
                            <rect x="80" y="80" width="15" height="15" />
                            <rect x="15" y="55" width="15" height="5" />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-text-primary flex items-center justify-center gap-1.5">
                            <QrCode size={15} className="text-purple-600" />
                            samaj@upi
                          </div>
                          <p className="text-[10px] text-text-secondary">Scan this QR code or click the button below.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full text-left space-y-3.5 py-1">
                        <div>
                          <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Enter your UPI ID</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="username@upi"
                              value={userUpiId}
                              onChange={(e) => {
                                setUserUpiId(e.target.value);
                                setIsUpiVerified(false);
                              }}
                              className="flex-1 bg-surface border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-purple-600"
                            />
                            <button
                              type="button"
                              disabled={!userUpiId.includes('@') || verifyingUpi}
                              onClick={() => {
                                setVerifyingUpi(true);
                                setTimeout(() => {
                                  setVerifyingUpi(false);
                                  setIsUpiVerified(true);
                                }, 1200);
                              }}
                              className={`px-4 py-2.5 text-xs font-bold rounded-xl press-scale border transition-all ${
                                userUpiId.includes('@') && !verifyingUpi
                                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                                  : 'bg-gray-50 border-gray-150 text-gray-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              {verifyingUpi ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        </div>

                        {isUpiVerified && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] text-emerald-800 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                            <div>
                              <p className="font-bold">Verified Name: RAHUL SHARMA</p>
                              <p className="text-[9px] text-emerald-700/80 mt-0.5">UPI ID verified successfully.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (method.includes('कार्ड') || method.includes('card') || method.includes('डेबिट')) ? (
                  <div className="w-full text-left space-y-4">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-gray-150/50">
                      <CreditCard size={18} className="text-purple-600" />
                      <h4 className="text-xs font-bold text-text-primary">Enter Card Details</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Cardholder Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter Name" 
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-surface border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Card Number</label>
                        <input 
                          type="text" 
                          placeholder="XXXX XXXX XXXX XXXX" 
                          maxLength="19"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            setCardNumber(val);
                          }}
                          className="w-full bg-surface border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-text-primary outline-none focus:border-purple-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Expiry (MM/YY)</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            maxLength="5"
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) {
                                val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                              }
                              setCardExpiry(val);
                            }}
                            className="w-full bg-surface border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-text-primary outline-none focus:border-purple-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">CVV</label>
                          <input 
                            type="password" 
                            placeholder="***" 
                            maxLength="3"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-surface border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-text-primary outline-none focus:border-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (method.includes('बैंकिंग') || method.includes('netbank') || method.includes('बैंक')) ? (
                  <div className="w-full text-left space-y-4">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-gray-150/50">
                      <Landmark size={18} className="text-purple-600" />
                      <h4 className="text-xs font-bold text-text-primary">Select your bank</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'SBI', name: 'State Bank of India', short: 'SBI' },
                        { id: 'HDFC', name: 'HDFC Bank', short: 'HDFC' },
                        { id: 'ICICI', name: 'ICICI Bank', short: 'ICICI' },
                        { id: 'AXIS', name: 'Axis Bank', short: 'Axis' }
                      ].map(bank => {
                        const isBankSelected = selectedBank === bank.id;
                        return (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                              isBankSelected 
                                ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-sm' 
                                : 'border-gray-200 bg-surface text-text-secondary hover:border-gray-300'
                            }`}
                          >
                            {bank.short}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Or select other bank</label>
                      
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                          className="w-full bg-surface border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary outline-none flex items-center justify-between transition-colors focus:border-purple-600 active:border-purple-600"
                        >
                          <span>{selectedBankObj.name}</span>
                          <ChevronDown size={14} className={`text-text-secondary transition-transform duration-200 ${isBankDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isBankDropdownOpen && (
                          <>
                            {/* Backdrop Click Handler */}
                            <div 
                              className="fixed inset-0 z-40 bg-transparent" 
                              onClick={() => setIsBankDropdownOpen(false)} 
                            />
                            
                            {/* Dropdown Options List */}
                            <div className="absolute left-0 right-0 mt-1 bg-card border border-gray-150 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-48 overflow-y-auto divide-y divide-gray-50/50">
                              {banksList.map(bank => {
                                const isCurrent = bank.id === selectedBank;
                                return (
                                  <div
                                    key={bank.id}
                                    onClick={() => {
                                      setSelectedBank(bank.id);
                                      setIsBankDropdownOpen(false);
                                    }}
                                    className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                                      isCurrent 
                                        ? 'bg-purple-50 text-purple-950 font-extrabold' 
                                        : 'text-text-primary hover:bg-gray-50'
                                    }`}
                                  >
                                    {bank.name}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-700">
                      <CreditCard size={28} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">Secure Gateway Redirect</h4>
                      <p className="text-[10px] text-text-secondary mt-1 max-w-xs leading-normal">
                        You are going to complete secure payment via {method}.
                      </p>
                    </div>
                  </div>
                )}

                {/* Complete Payment Button */}
                <button 
                  onClick={handleNextProcess}
                  disabled={!isFormValid()}
                  className={`w-full py-4 text-xs font-bold rounded-2xl press-scale shadow-md ${
                    isFormValid() 
                      ? 'bg-purple-700 hover:bg-purple-800 text-white cursor-pointer' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Complete Payment
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-secondary font-medium">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Your donation is secure and transparent.</span>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default DonatePaymentPage;
