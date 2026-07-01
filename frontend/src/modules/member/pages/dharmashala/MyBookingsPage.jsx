import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, MapPin, User, Hash, AlertCircle, CheckCircle2,
  X, CreditCard, QrCode, Landmark 
} from 'lucide-react';
import { mockBookings } from '../../data/mockDharmashala';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  
  // Persistent bookings list from localStorage
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('merisamaj_dharmashala_bookings');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('merisamaj_dharmashala_bookings', JSON.stringify(mockBookings));
    return mockBookings;
  });

  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentToastMsg, setPaymentToastMsg] = useState('');

  // Payment checkout states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'processing' | 'success'
  
  // Checkout fields
  const [upiId, setUpiId] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    // Poll localStorage for status updates (e.g. simulation completed)
    const interval = setInterval(() => {
      const saved = localStorage.getItem('merisamaj_dharmashala_bookings');
      if (saved) {
        setBookings(JSON.parse(saved));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const initiatePayment = (booking) => {
    setActiveBooking(booking);
    setPaymentMethod('upi');
    setPaymentStep('select');
    setUpiId('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      // Update local storage
      const updated = bookings.map(b => {
        if (b.id === activeBooking.id) {
          return { ...b, status: 'upcoming' }; // marks booking as upcoming (confirmed & paid)
        }
        return b;
      });
      setBookings(updated);
      localStorage.setItem('merisamaj_dharmashala_bookings', JSON.stringify(updated));

      // Set success screen
      setPaymentStep('success');
      setPaymentToastMsg('भुगतान सफल! आपकी धर्मशाला बुकिंग सफलतापूर्वक पुष्टीकृत हो गई है। 🎉');
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 4000);
    }, 2500);
  };

  const tabs = [
    { id: 'all', label: 'सभी' },
    { id: 'pending_approval', label: 'स्वीकृति लंबित' },
    { id: 'approved', label: 'स्वीकृत (भुगतान लंबित)' },
    { id: 'upcoming', label: 'पुष्टीकृत' },
    { id: 'completed', label: 'पूर्ण' },
    { id: 'cancelled', label: 'रद्द' },
  ];

  const filtered = activeTab === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_approval': return <span className="bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">लंबित स्वीकृति</span>;
      case 'approved': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">स्वीकृत (भुगतान लंबित)</span>;
      case 'upcoming': return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">पुष्टीकृत</span>;
      case 'completed': return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">पूर्ण</span>;
      case 'cancelled': return <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">रद्द</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-30 shadow-sm shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[17px] font-bold text-slate-800">धर्मशाला बुकिंग सूची</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 sticky top-14 z-20 shadow-sm">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-colors ${
              activeTab === t.id 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold text-sm">कोई बुकिंग नहीं मिली</p>
          </div>
        ) : (
          filtered.map(b => (
            <div key={b.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm relative">
              <div className="absolute top-4 right-4">{getStatusBadge(b.status)}</div>
              
              <h3 className="font-bold text-slate-800 text-[15px] pr-16">{b.dharmashalaName}</h3>
              <div className="flex items-start gap-1 mt-1 text-slate-500">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span className="text-[11px] leading-tight font-medium">{b.location}</span>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-y-3">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">बुकिंग तिथियां</p>
                  <p className="text-[13px] font-bold text-slate-800">{new Date(b.checkIn).toLocaleDateString('hi-IN', {day:'numeric', month:'short', year:'numeric'})} - {new Date(b.checkOut).toLocaleDateString('hi-IN', {day:'numeric', month:'short', year:'numeric'})} <span className="text-indigo-600 text-[11px]">({b.nights} रात)</span></p>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">बुकिंग आईडी</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Hash size={12} className="text-indigo-400" />
                    <span className="text-[12px] font-bold text-slate-800">{b.id}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">कुल राशि</p>
                  <p className="text-[13px] font-black text-emerald-600 mt-0.5">₹ {b.totalAmount}</p>
                </div>
              </div>

              {/* Payment Button for Approved Bookings */}
              {b.status === 'approved' && (
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => initiatePayment(b)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 rounded-2xl text-[12.5px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                  >
                    💳 भुगतान करें (Pay ₹{b.totalAmount})
                  </button>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-800 leading-tight">{b.bookedBy}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{b.phone}</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ChevronLeft size={16} className="rotate-180" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Success Toast */}
      {showPaymentSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white text-[12.5px] font-black px-5 py-3.5 rounded-full shadow-lg z-[60] animate-bounce-in border border-white/10 flex items-center gap-2 max-w-[90%] text-center">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{paymentToastMsg}</span>
        </div>
      )}

      {/* Payment Checkout Modal */}
      {showPaymentModal && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-card border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-[15px] font-black text-slate-800">
                {paymentStep === 'select' && 'भुगतान विवरण (Checkout)'}
                {paymentStep === 'processing' && 'भुगतान प्रसंस्करण (Processing)'}
                {paymentStep === 'success' && 'भुगतान सफल (Success)'}
              </h3>
              {paymentStep !== 'processing' && (
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {paymentStep === 'select' && (
                <>
                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-150/60 p-4 rounded-2xl flex justify-between items-center text-xs font-bold text-slate-805">
                    <div className="text-left font-sans">
                      <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Dharamshala Booking</span>
                      <span className="text-slate-900 text-sm mt-0.5 block">{activeBooking.dharmashalaName}</span>
                      <span className="text-[9.5px] text-indigo-600 mt-0.5 block font-medium">ID: {activeBooking.id}</span>
                    </div>
                    <span className="text-emerald-650 text-lg font-black shrink-0">₹{activeBooking.totalAmount}</span>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block text-left">Choose Payment Method</label>
                    
                    {/* Method 1: UPI */}
                    <div 
                      onClick={() => setPaymentMethod('upi')}
                      className={`border rounded-2xl p-3 cursor-pointer transition-all flex items-start gap-3 text-left ${
                        paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50/5' : 'border-gray-200 bg-card hover:border-gray-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="pay_method" 
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="mt-0.5 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800">UPI (Google Pay, PhonePe, Paytm)</span>
                          <QrCode size={16} className="text-slate-400" />
                        </div>
                        {paymentMethod === 'upi' && (
                          <div className="mt-3.5 space-y-3 pt-3.5 border-t border-slate-100 animate-fade-in" onClick={e => e.stopPropagation()}>
                            <input 
                              type="text"
                              placeholder="Enter UPI ID (e.g. name@upi)"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Method 2: Cards */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`border rounded-2xl p-3 cursor-pointer transition-all flex items-start gap-3 text-left ${
                        paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/5' : 'border-gray-200 bg-card hover:border-gray-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="pay_method" 
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
                          <div className="mt-3.5 space-y-3 pt-3.5 border-t border-slate-100 animate-fade-in text-left" onClick={e => e.stopPropagation()}>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Card Holder Name</label>
                              <input 
                                type="text"
                                placeholder="Enter cardholder name"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Card Number</label>
                              <input 
                                type="text"
                                maxLength="19"
                                placeholder="XXXX XXXX XXXX XXXX"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Expiry Date</label>
                                <input 
                                  type="text"
                                  maxLength="5"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">CVV</label>
                                <input 
                                  type="password"
                                  maxLength="3"
                                  placeholder="XXX"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
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
                        paymentMethod === 'netbanking' ? 'border-indigo-600 bg-indigo-50/5' : 'border-gray-200 bg-card hover:border-gray-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="pay_method" 
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
                          <div className="mt-3.5 space-y-2 pt-3.5 border-t border-slate-100 animate-fade-in text-xs font-bold text-slate-600 text-left" onClick={e => e.stopPropagation()}>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Popular Banks</p>
                            <div className="grid grid-cols-2 gap-2">
                              {['SBI', 'HDFC', 'ICICI', 'AXIS'].map(bank => (
                                <button key={bank} type="button" className="py-2.5 border border-slate-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/10 hover:text-indigo-700 transition-all font-extrabold text-[11px] text-center">
                                  {bank} Bank
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {paymentStep === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-650 rounded-full animate-spin"></div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 font-sans">भुगतान प्रक्रिया में है...</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">कृपया प्रतीक्षा करें, आपका लेनदेन सुरक्षित रूप से पूरा किया जा रहा है।</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-200/50">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800">भुगतान सफल रहा!</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">आपकी धर्मशाला बुकिंग की सफलतापूर्वक पुष्टि हो गई है।</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-left w-full text-xs font-semibold text-slate-600 space-y-1.5 font-sans">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Receipt details</p>
                    <p><strong>Dharmashala:</strong> {activeBooking.dharmashalaName}</p>
                    <p><strong>Booking ID:</strong> {activeBooking.id}</p>
                    <p><strong>Amount Paid:</strong> <span className="text-emerald-600 font-extrabold">₹{activeBooking.totalAmount}</span></p>
                    <p><strong>Status:</strong> Confirmed &amp; Paid</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-slate-50 border-t border-slate-100 p-4">
              {paymentStep === 'select' && (
                <button
                  onClick={processPayment}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 press-scale"
                >
                  Pay ₹{activeBooking.totalAmount}
                </button>
              )}
              {paymentStep === 'success' && (
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all press-scale"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 pb-6 z-40">
        <button 
          onClick={() => navigate('/member/dharmashala')}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={18} /> नई बुकिंग करें
        </button>
      </div>
    </div>
  );
}
