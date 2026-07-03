import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataProvider';
import { Mail, Search, Bell, MapPin, Heart, Plus, Calendar, Clock, ChevronLeft, User, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NimantranHomePage() {
  const navigate = useNavigate();
  const { invitations, currentUser, setMobileMenuOpen, getUnreadCountForModule } = useData();
  const [activeFilter, setActiveFilter] = useState('Upcoming');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filters = ['Today', 'This Week', 'This Month', 'Upcoming', 'Past'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredInvitations = invitations.filter(inv => {
    // Only show Approved for regular users, all for admins/creators
    if (inv.status !== 'Approved' && currentUser.role !== 'admin' && inv.creatorId !== currentUser.id) {
      return false;
    }
    
    const invDate = new Date(inv.date);
    invDate.setHours(0, 0, 0, 0);

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      if (!inv.groomName.toLowerCase().includes(lowerQuery) &&
          !inv.brideName.toLowerCase().includes(lowerQuery) &&
          !inv.location.toLowerCase().includes(lowerQuery) &&
          !inv.familyName.toLowerCase().includes(lowerQuery)) {
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
    // Simple mock filters for this week/month
    return true; 
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)] border-b border-purple-100/30">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100/30 flex items-center justify-center text-brand-primary">
              <Mail size={16} />
            </div>
            <h1 className="text-base font-bold text-text-primary tracking-tight">Invitations</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSearching(!isSearching)} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-all press-scale">
            <Search size={18} />
          </button>
          <button onClick={() => navigate('/member/notifications?module=nimantran')} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary relative hover:bg-purple-50 transition-all press-scale">
            <Bell size={18} />
            {getUnreadCountForModule('nimantran') > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-primary" />
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
            className="px-4 py-3.5 bg-white/40 backdrop-blur-md border-b border-purple-100/20 overflow-hidden"
          >
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search (Name, Venue...)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-purple-100/30 rounded-2xl pl-10 pr-4 py-3 text-[13px] font-bold outline-none focus:border-brand-primary/45 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] transition-all"
                autoFocus
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Pills */}
      <div className="bg-white/70 backdrop-blur-md border-b border-purple-100/20 px-4 py-3 flex overflow-x-auto snap-x scrollbar-hide gap-2 sticky top-[56px] z-20 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-5 py-2 rounded-xl text-[12px] font-bold transition-all press-scale ${
                activeFilter === filter 
                  ? 'bg-brand-primary text-white shadow-md shadow-purple-300/40' 
                  : 'bg-purple-50 text-brand-primary border border-purple-100/30 hover:bg-purple-100/40'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 max-w-4xl mx-auto w-full">
        <AnimatePresence>
          {filteredInvitations.map(inv => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card-neo overflow-hidden"
            >
              {/* Card Header (Visual) */}
              <div className="relative overflow-hidden flex flex-col items-center justify-center text-center border-b border-rose-100/30 bg-rose-50/20 min-h-[160px]">
                {inv.status === 'Pending' && <span className="absolute top-3 right-3 bg-amber-50 text-amber-700 border border-amber-250/30 text-[10px] px-2.5 py-0.5 rounded-lg font-bold z-20">Pending</span>}
                {inv.status === 'Rejected' && <span className="absolute top-3 right-3 bg-rose-550/10 text-rose-700 border border-rose-250/30 text-[10px] px-2.5 py-0.5 rounded-lg font-bold z-20">Rejected</span>}

                {inv.image ? (
                  <img src={inv.image} alt="Invitation Card" className="w-full h-48 object-cover" />
                ) : (
                  <>
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                    <h3 className="text-brand-primary font-bold text-[13px] mb-3.5 z-10 tracking-widest mt-6 uppercase">Wedding Invitation</h3>
                    <div className="flex items-center justify-center gap-3.5 text-2xl font-black text-rose-500 z-10">
                      <span>{inv.groomName}</span>
                      <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shadow-sm">
                        <Heart size={16} className="text-rose-500 fill-rose-500" />
                      </div>
                      <span>{inv.brideName}</span>
                    </div>
                    <p className="text-text-secondary text-[11px] font-bold mt-3.5 z-10 border-t border-rose-150/40 pt-2 px-8 mb-6">
                      - Cordially Invited -
                    </p>
                  </>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100/40 flex flex-col items-center justify-center shrink-0 shadow-inner">
                    <span className="text-brand-primary text-[10px] font-bold leading-none block mb-0.5">{new Date(inv.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-brand-primary text-[16px] font-black leading-none">{new Date(inv.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="font-bold text-text-primary text-[15px] truncate">Wedding of {inv.groomName} &amp; {inv.brideName}</h4>
                    <p className="text-text-secondary text-[12px] font-semibold mt-1 truncate">
                      {inv.familyName}
                    </p>
                    <p className="text-text-secondary text-[12px] flex items-start gap-1 mt-1 font-medium">
                      <MapPin size={14} className="shrink-0 mt-0.5 text-rose-400" /> 
                      <span className="truncate">{inv.location}</span>
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 mt-5">
                  <button 
                    onClick={() => navigate(`/member/nimantran/${inv.id}`)}
                    className="flex-1 bg-purple-50 text-brand-primary font-bold text-[12px] py-2.5 rounded-xl border border-purple-150/30 hover:bg-purple-100/40 active:scale-95 transition-all press-scale"
                  >
                    View Card
                  </button>
                  <a 
                    href={inv.mapLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-50 text-emerald-700 font-bold text-[12px] py-2.5 rounded-xl text-center border border-emerald-100/50 hover:bg-emerald-100/50 active:scale-95 transition-all press-scale"
                  >
                    Navigate
                  </a>
                  <button 
                    onClick={() => navigate(`/member/nimantran/${inv.id}`)}
                    className="flex-1 bg-gradient-to-r from-brand-primary to-brand-glow text-white shadow-md shadow-purple-500/25 font-bold text-[12px] py-2.5 rounded-xl active:scale-95 transition-all press-scale"
                  >
                    RSVP
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredInvitations.length === 0 && (
          <div className="text-center text-text-secondary py-20 flex flex-col items-center card-neo border-dashed">
            <Mail size={48} className="mb-4 text-purple-200" />
            <h3 className="text-text-primary font-bold text-lg">No Invitations</h3>
            <p className="text-sm mt-1">No invitations found for this filter.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/member/nimantran/create')}
        className="fixed bottom-[100px] right-5 w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-glow text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 active:scale-90 transition-transform z-30 press-scale hover:scale-105"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}
