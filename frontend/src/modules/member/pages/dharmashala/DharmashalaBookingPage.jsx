import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, MapPin, X, Info, Loader } from 'lucide-react';
import dharmashalaService from '../../../../core/api/dharmashalaService';
import { useData } from '../../context/DataProvider';

export default function DharmashalaBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification, user } = useData();
  
  const [dh, setDh] = useState(null);
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkInTime, setCheckInTime] = useState('10:00');
  const [checkOutTime, setCheckOutTime] = useState('10:00');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchDharmashalaDetails = async () => {
    setIsLoading(true);
    try {
      const dhRes = await dharmashalaService.getDharmashalaById(id);
      if (dhRes.status === 'success') {
        setDh(dhRes.data);
      }
      
      const avRes = await dharmashalaService.getAvailability(id, currentMonth, currentYear);
      if (avRes.status === 'success') {
        setDays(avRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch booking details/availability", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDharmashalaDetails();
  }, [id, currentMonth, currentYear]);

  // Fallback images if single image
  const galleryImages = useMemo(() => {
    if (!dh) return [];
    if (dh.galleryImages && dh.galleryImages.length > 0) {
      return dh.galleryImages;
    }
    return [
      dh.image,
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c8940026e95c?w=600&h=400&fit=crop'
    ].filter(Boolean);
  }, [dh]);

  // Empty slots for start of month
  const firstDayIndex = useMemo(() => {
    // 0 = Sunday, 1 = Monday, etc.
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    // Return empty array with that length
    return Array.from({ length: firstDay });
  }, [currentMonth, currentYear]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-emerald-100 text-emerald-800 font-bold';
      case 'booked': return 'bg-rose-100 text-rose-800 font-bold';
      case 'partial': return 'bg-amber-100 text-amber-800 font-bold';
      default: return 'bg-transparent text-slate-700';
    }
  };

  const getMonthNameHindi = (m) => {
    const months = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    return months[m - 1];
  };

  const handlePrevMonth = () => {
    setSelectedDate(null);
    setCurrentMonth(prev => {
      if (prev === 1) {
        setCurrentYear(y => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(null);
    setCurrentMonth(prev => {
      if (prev === 12) {
        setCurrentYear(y => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  const handleConfirmBooking = async () => {
    if (!dh || !selectedDate) return;

    // Check-in and check-out dates
    const checkInDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${selectedDate.day.toString().padStart(2, '0')}`;
    // Assume checkout is next day for simplicity (1 night)
    const checkOutDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${(selectedDate.day + 1).toString().padStart(2, '0')}`;

    try {
      const res = await dharmashalaService.createBooking({
        dharmashalaId: dh._id,
        checkIn: checkInDateStr,
        checkOut: checkOutDateStr,
        roomType: dh.hasAcRooms ? 'AC' : 'General',
        checkInTime,
        checkOutTime,
        bookedBy: user?.name || 'Default Member',
        phone: user?.phone || '9999999999'
      });

      if (res.status === 'success') {
        setShowConfirmModal(false);
        setShowSuccessModal(true);

        // Push local/global notification
        addNotification?.({
          type: 'community',
          title: 'बुकिंग अनुरोध प्राप्त हुआ',
          message: `${dh.name} के लिए आपका बुकिंग अनुरोध समीक्षा के अधीन है।`,
        });
      }
    } catch (error) {
      console.error("Booking creation failed", error);
      alert(error.response?.data?.message || "बुकिंग अनुरोध भेजने में समस्या आई।");
    }
  };

  if (isLoading && !dh) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-650" size={32} />
      </div>
    );
  }

  if (!dh) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <p className="text-slate-500 font-bold mb-4">धर्मशाला नहीं मिली</p>
        <button onClick={() => navigate('/member/dharmashala')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">वापस जाएं</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 font-sans overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[17px] font-bold text-slate-800">उपलब्धता कैलेंडर</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Dharmashala Image Gallery */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="relative h-48 w-full bg-slate-100">
            {galleryImages.length > 0 ? (
              <img src={galleryImages[activeImageIndex]} alt="Dharmashala" className="w-full h-full object-cover transition-opacity duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-200">No Image</div>
            )}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md">
                {galleryImages.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === i ? 'bg-white scale-110' : 'bg-white/50'}`} 
                  />
                ))}
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="text-[18px] font-black text-slate-800">{dh.name}</h2>
            <div className="flex items-start gap-1 mt-1 text-slate-500">
              <MapPin size={14} className="mt-0.5 shrink-0 text-indigo-500" />
              <p className="text-[13px] font-medium">{dh.address || dh.location}{dh.city ? `, ${dh.city}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader className="animate-spin text-indigo-650" size={24} />
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"><ChevronLeft size={20} /></button>
            <h3 className="font-bold text-[15px] text-indigo-700">{getMonthNameHindi(currentMonth)} {currentYear}</h3>
            <button onClick={handleNextMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-y-1.5 text-center mb-2">
            {['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'].map(d => (
              <div key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</div>
            ))}
            
            {/* Empty slots for start of month */}
            {firstDayIndex.map((_, i) => (
              <div key={`empty-${i}`} className="text-[11px] text-slate-300 flex items-center justify-center aspect-square" />
            ))}

            {days.map(d => (
              <div key={d.day} className="flex items-center justify-center">
                <button 
                  onClick={() => setSelectedDate(d)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] transition-all ${getStatusColor(d.status)} ${selectedDate?.day === d.day ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                >
                  {d.day}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap justify-between gap-2 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-100"></span> उपलब्ध</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-100"></span> बुक्ड</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-100"></span> आंशिक उपलब्ध</div>
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100/50 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-bold text-indigo-400 mb-1 uppercase tracking-wider">चयनित तिथि</h4>
                <span className="text-[15px] font-black text-indigo-900">{selectedDate.day} {getMonthNameHindi(currentMonth)} {currentYear}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusColor(selectedDate.status)}`}>
                {selectedDate.status === 'available' ? 'पूर्ण उपलब्ध' : selectedDate.status === 'booked' ? 'बुक्ड' : 'आंशिक उपलब्ध'}
              </span>
            </div>

            {selectedDate.status === 'partial' && (
              <div className="bg-white/60 p-3 rounded-xl border border-amber-200/50 flex items-start gap-2">
                <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-slate-800">यह तिथि आंशिक रूप से बुक है</p>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">पहले से बुक समय: <span className="font-bold text-amber-700">दोपहर 12:00 से शाम 05:00 तक</span></p>
                  <p className="text-[10px] text-slate-500 mt-1">आप बचे हुए समय के लिए बुकिंग कर सकते हैं।</p>
                </div>
              </div>
            )}

            {selectedDate.status !== 'booked' && (
              <div className="pt-3 border-t border-indigo-100 flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">चेक-इन समय</label>
                  <div className="relative">
                    <input 
                      type="time" 
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-800 outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">चेक-आउट समय</label>
                  <div className="relative">
                    <input 
                      type="time" 
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-800 outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">बुकिंग की पुष्टि करें</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium px-2 mb-4">
                क्या आप {selectedDate?.day} {getMonthNameHindi(currentMonth)} {currentYear} को <strong className="text-slate-700">{checkInTime}</strong> से <strong className="text-slate-700">{checkOutTime}</strong> तक बुकिंग कन्फर्म करना चाहते हैं?
              </p>
            </div>
            
            <div className="flex border-t border-slate-100">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-4 text-[14px] font-bold text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                रद्द करें
              </button>
              <div className="w-px bg-slate-100" />
              <button 
                onClick={handleConfirmBooking}
                className="flex-1 py-4 text-[14px] font-bold text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
              >
                हाँ, कन्फर्म करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">अनुरोध भेजा गया!</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed font-semibold px-2 mb-4">
                Your booking request has been successfully sent to the admin. Please wait until the admin reviews and approves your request.
              </p>
            </div>
            
            <div className="flex border-t border-slate-100">
              <button 
                onClick={() => navigate('/member/dharmashala/bookings')}
                className="flex-1 py-4 text-[14px] font-black text-indigo-650 bg-indigo-50/30 hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
              >
                मेरी बुकिंग्स देखें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 pb-6 z-40">
        <button 
          onClick={() => setShowConfirmModal(true)}
          disabled={!selectedDate || selectedDate.status === 'booked'}
          className={`w-full py-3.5 rounded-xl font-bold text-[14px] shadow-sm transition-all ${!selectedDate || selectedDate.status === 'booked' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'}`}
        >
          {selectedDate?.status === 'booked' ? 'तिथि उपलब्ध नहीं' : 'बुकिंग करें'}
        </button>
      </div>
    </div>
  );
}
