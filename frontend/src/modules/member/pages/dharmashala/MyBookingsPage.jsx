import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, MapPin, User, Hash, AlertCircle } from 'lucide-react';
import { mockBookings } from '../../data/mockDharmashala';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = [
    { id: 'all', label: 'सभी' },
    { id: 'upcoming', label: 'आगामी' },
    { id: 'completed', label: 'पूर्ण' },
    { id: 'cancelled', label: 'रद्द' },
  ];

  const filtered = activeTab === 'all' 
    ? mockBookings 
    : mockBookings.filter(b => b.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">आगामी</span>;
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
