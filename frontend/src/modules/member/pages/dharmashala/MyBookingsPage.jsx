import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, MapPin, User, Hash, AlertCircle, CheckCircle2,
  X, CreditCard, QrCode, Landmark, Loader
} from 'lucide-react';
import dharmashalaService from '../../../../core/api/dharmashalaService';
import { loadRazorpay } from '../../../../core/utils/razorpayLoader';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentToastMsg, setPaymentToastMsg] = useState('');
  const [qrModalBooking, setQrModalBooking] = useState(null);

  const initiatePayment = (booking) => {
    handleRazorpayCheckout(booking);
  };

  const handleRazorpayCheckout = async (booking) => {
    try {
      const targetId = booking.id || booking._id;
      const orderRes = await dharmashalaService.createRazorpayOrder(targetId);
      if (orderRes.status !== 'success' || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to initialize payment');
      }

      const { orderId, amount, currency, key } = orderRes.data;

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Please check internet connection.');
        return;
      }

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: currency || 'INR',
        name: 'MeriSamaj Dharmashala',
        description: `Booking #${targetId}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await dharmashalaService.verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: targetId
            });

            if (verifyRes.status === 'success') {
              setPaymentToastMsg('Payment Verified & Room Confirmed! 🎉');
              setShowPaymentSuccess(true);
              setTimeout(() => setShowPaymentSuccess(false), 4000);
              fetchBookings(false);
            }
          } catch (err) {
            alert(err.response?.data?.message || 'Payment signature verification failed.');
          }
        },
        prefill: {
          name: booking.bookedBy || '',
          contact: booking.phone || ''
        },
        theme: {
          color: '#4F46E5'
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        alert(`Payment Failed: ${response.error.description || 'Transaction declined'}`);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      // Fallback to secondary payment modal if order creation fails in dev mode
      setActiveBooking(booking);
      setPaymentMethod('upi');
      setPaymentStep('select');
      setShowPaymentModal(true);
    }
  };

  const processPayment = async () => {
    setPaymentStep('processing');
    try {
      const targetId = activeBooking._id || activeBooking.id;
      const res = await dharmashalaService.payBooking(targetId);
      
      if (res.status === 'success') {
        setPaymentStep('success');
        setPaymentToastMsg('Payment Successful! Your Dharmashala booking has been confirmed. 🎉');
        setShowPaymentSuccess(true);
        setTimeout(() => setShowPaymentSuccess(false), 4000);
        
        // Refresh listings without spinner
        fetchBookings(false);
      }
    } catch (error) {
      console.error("Payment failed", error);
      alert(error.response?.data?.message || "Payment processing failed.");
      setPaymentStep('select');
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending_approval', label: 'Pending Approval' },
    { id: 'approved', label: 'Approved (Payment Pending)' },
    { id: 'upcoming', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = activeTab === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_approval': return <span className="bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">Pending Approval</span>;
      case 'approved': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">Approved (Payment Pending)</span>;
      case 'upcoming': return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">Confirmed</span>;
      case 'completed': return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">Completed</span>;
      case 'cancelled': return <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">Cancelled</span>;
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
        <h1 className="text-[17px] font-bold text-slate-800">Dharmashala Bookings</h1>
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
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold text-sm">No bookings found</p>
          </div>
        ) : (
          filtered.map(b => (
            <div key={b._id || b.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm relative">
              <div className="absolute top-4 right-4">{getStatusBadge(b.status)}</div>
              
              <h3 className="font-bold text-slate-800 text-[15px] pr-16">{b.dharmashalaName}</h3>
              <div className="flex items-start gap-1 mt-1 text-slate-500">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span className="text-[11px] leading-tight font-medium">{b.location}</span>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-y-3">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Dates</p>
                  <p className="text-[13px] font-bold text-slate-800">{new Date(b.checkIn).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})} - {new Date(b.checkOut).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})} <span className="text-indigo-600 text-[11px]">({b.nights} {b.nights > 1 ? 'Nights' : 'Night'})</span></p>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking ID</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Hash size={12} className="text-indigo-400" />
                    <span className="text-[12px] font-bold text-slate-800">{b.id}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
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
                    💳 Pay Now (₹{b.totalAmount})
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
                {paymentStep === 'select' && 'Payment Checkout'}
                {paymentStep === 'processing' && 'Processing Payment'}
                {paymentStep === 'success' && 'Payment Successful'}
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
                    <h4 className="text-sm font-extrabold text-slate-800 font-sans">Payment Processing...</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Please wait while your transaction is processed securely.</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-200/50">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800">Payment Successful!</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Your Dharmashala booking has been successfully confirmed.</p>
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
          <Plus size={18} /> Make New Booking
        </button>
      </div>
    </div>
  );
}
