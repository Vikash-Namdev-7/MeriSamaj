import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataProvider';
import { Mail, Search, Bell, MapPin, Plus, ChevronLeft, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvitationHomePage() {
  const navigate = useNavigate();
  const { invitations, currentUser, setMobileMenuOpen, getUnreadCountForModule } = useData();
  const [activeFilter, setActiveFilter] = useState('My Invitations');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filters = ['My Invitations', 'Today', 'This Week', 'This Month', 'Upcoming', 'Past'];

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredInvitations = invitations.filter(inv => {
    // Only show Approved for regular users, all for admins/creators
    if (inv.status !== 'Approved' && currentUser.role !== 'admin' && inv.creatorId !== currentUser.id) {
      return false;
    }
    
    const invDate = parseLocalDate(inv.date);
    invDate.setHours(0, 0, 0, 0);

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const matchGroom = inv.groomName?.toLowerCase().includes(lowerQuery);
      const matchBride = inv.brideName?.toLowerCase().includes(lowerQuery);
      const matchTitle = inv.title?.toLowerCase().includes(lowerQuery);
      const matchHost = inv.hostName?.toLowerCase().includes(lowerQuery);
      const matchLocation = inv.location?.toLowerCase().includes(lowerQuery);
      const matchFamily = inv.familyName?.toLowerCase().includes(lowerQuery);

      if (!matchGroom && !matchBride && !matchTitle && !matchHost && !matchLocation && !matchFamily) {
        return false;
      }
    }

    if (activeFilter === 'Upcoming') {
      return invDate >= today;
    }
    if (activeFilter === 'Past') {
      return invDate < today;
    }
    if (activeFilter === 'Today') {
      return invDate.getTime() === today.getTime();
    }
    if (activeFilter === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return invDate >= startOfWeek && invDate <= endOfWeek;
    }
    if (activeFilter === 'This Month') {
      return invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear();
    }
    if (activeFilter === 'My Invitations') {
      const creatorIdStr = typeof inv.creatorId === 'object' && inv.creatorId !== null
        ? inv.creatorId._id || inv.creatorId.id
        : inv.creatorId;
      return String(creatorIdStr) === String(currentUser?.id || currentUser?._id);
    }
    return true; 
  });

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans select-none pb-24">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/85 backdrop-blur-xl px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.03)] border-b border-purple-100/30">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 hover:bg-purple-50 transition-colors press-scale">
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Mail size={17} strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <h1 className="text-[17px] font-extrabold text-slate-800 tracking-tight leading-tight">Invitations</h1>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Nimantran Hub</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSearching(!isSearching)} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 hover:bg-purple-50 transition-all press-scale">
            <Search size={18} />
          </button>
          <button onClick={() => navigate('/member/notifications?module=nimantran')} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 relative hover:bg-purple-50 transition-all press-scale">
            <Mail size={18} />
            {getUnreadCountForModule('nimantran') > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-3 bg-white/70 backdrop-blur-md border-b border-purple-100/20 overflow-hidden"
          >
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by Groom, Bride, Family, Venue..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-purple-100/40 rounded-2xl pl-10 pr-4 py-3 text-[13px] font-bold outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all text-slate-800 placeholder-slate-400"
                autoFocus
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Pills */}
      <div className="bg-white/70 backdrop-blur-md border-b border-purple-100/20 px-4 py-3 flex overflow-x-auto scrollbar-hide gap-2 sticky top-[56px] z-20 shadow-xs">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11.5px] font-bold transition-all press-scale border ${
                activeFilter === filter 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 shadow-md shadow-purple-500/20' 
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-purple-50/50 hover:border-purple-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        <AnimatePresence>
          {filteredInvitations.map(inv => {
            const images = inv.images || (inv.image ? [inv.image] : []);
            const displayTitle = inv.title || `Wedding of ${inv.groomName} & ${inv.brideName}`;
            const displayHost = inv.hostName || inv.familyName;

            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[26px] border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.08)] transition-all duration-300"
              >
                {/* Card Header (Visual Banner) */}
                <div className="relative overflow-hidden flex flex-col items-center justify-center text-center border-b border-purple-100/20 min-h-[165px]">
                  {inv.status === 'Pending' && <span className="absolute top-3 right-3 bg-amber-50 text-amber-700 border border-amber-200/60 text-[9.5px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider z-20">Pending Approval</span>}
                  {inv.status === 'Rejected' && <span className="absolute top-3 right-3 bg-rose-50 text-rose-700 border border-rose-200/60 text-[9.5px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider z-20">Rejected</span>}

                  {images.length > 0 ? (
                    <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                      <img src={images[0]} alt="Invitation Card" className="w-full h-full object-cover" />
                      {images.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                          +{images.length - 1} More Photos
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full h-48 bg-gradient-to-br from-[#2A0E5C] via-[#3B1578] to-[#5B21B6] flex flex-col items-center justify-center text-center p-6 text-white shadow-inner">
                      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }} />
                      <h3 className="font-extrabold text-[17px] tracking-tight relative z-10 leading-snug max-w-[85%] text-amber-200">{displayTitle}</h3>
                      <p className="text-[12px] opacity-90 font-bold mt-1.5 z-10 uppercase tracking-wider text-purple-100">{displayHost}</p>
                      <p className="text-[10px] text-purple-200 mt-3 z-10 border-t border-white/15 pt-1.5 px-6 font-semibold uppercase tracking-widest">
                        - Cordially Invited -
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4.5 text-left">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-[18px] bg-purple-50 border border-purple-100 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      <span className="text-purple-600 text-[9.5px] font-extrabold leading-none block mb-0.5 uppercase tracking-wider">{new Date(inv.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-purple-700 text-[17px] font-black leading-none">{new Date(inv.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-[15.5px] truncate tracking-tight">{displayTitle}</h4>
                      <p className="text-slate-500 text-[12px] font-semibold mt-0.5 truncate">
                        {displayHost}
                      </p>
                      <p className="text-slate-500 text-[11.5px] flex items-center gap-1 mt-1 font-medium truncate">
                        <MapPin size={13} className="shrink-0 text-purple-600" /> 
                        <span className="truncate">{inv.location}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100">
                    <button 
                      onClick={() => navigate(`/member/invitations/${inv._id || inv.id}`)}
                      className="flex-1 bg-purple-50 text-purple-700 font-bold text-[11.5px] py-2.5 rounded-xl border border-purple-100 hover:bg-purple-100/60 active:scale-95 transition-all press-scale"
                    >
                      View Card
                    </button>
                    <a 
                      href={inv.mapLink || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-50 text-emerald-700 font-bold text-[11.5px] py-2.5 rounded-xl text-center border border-emerald-100 hover:bg-emerald-100/60 active:scale-95 transition-all press-scale"
                    >
                      Navigate
                    </a>
                    <button 
                      onClick={() => navigate(`/member/invitations/${inv._id || inv.id}`)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 font-bold text-[11.5px] py-2.5 rounded-xl active:scale-95 transition-all press-scale"
                    >
                      RSVP
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredInvitations.length === 0 && (
          <div className="text-center text-slate-500 py-16 flex flex-col items-center bg-white rounded-[28px] border border-slate-200/80 p-8 shadow-xs">
            <Mail size={44} className="mb-3 text-purple-300" />
            <h3 className="text-slate-800 font-extrabold text-base">No Invitations Found</h3>
            <p className="text-xs font-medium text-slate-400 mt-1">No invitations match the selected filter.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/member/invitations/create')}
        className="fixed bottom-[92px] right-5 w-13 h-13 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 active:scale-90 transition-transform z-30 press-scale hover:scale-105"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}
