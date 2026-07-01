import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { useData } from '../../context/DataProvider';
import { 
  Home, Users, Heart, BookOpen, MessageCircle, User, Vote, 
  HeartHandshake, Briefcase, Shield, X, LogOut, Award, Mail
} from 'lucide-react';
import { Avatar } from '../common/Avatar';

const hiddenPaths = ['/member/events', '/member/groups', '/member/notifications', '/member/splash', '/member/login', '/member/setup-profile', '/member/select-community', '/member/verify-otp', '/member/chat/room', '/member/chat/call', '/member/matrimonial'];

export const MemberLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobileMenuOpen, setMobileMenuOpen, currentUser, logoutUser } = useData();

  const shouldHideBottomNav = hiddenPaths.some(p => location.pathname.startsWith(p)) || location.pathname.split('/').filter(Boolean).length > 2;

  const handleMenuLinkClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const menuItems = [
    { name: 'Home', path: '/member/home', icon: Home },
    { name: 'Social Hub', path: '/member/social', icon: Users },
    { name: 'Matrimonial', path: '/member/matrimonial', icon: Heart },
    { name: 'Nimantran (Invitations)', path: '/member/nimantran', icon: Mail },
    { name: 'Directory', path: '/member/directory', icon: BookOpen },
    { name: 'Chat Messenger', path: '/member/chat', icon: MessageCircle },
    { name: 'Voting / Polls', path: '/member/voting', icon: Vote },
    { name: 'Donations', path: '/member/donation', icon: HeartHandshake },
    { name: 'Condolences', path: '/member/shradhanjali', icon: Award },
    { name: 'Professional Network', path: '/member/professional', icon: Briefcase },
    { name: 'Leadership & Board', path: '/member/leadership', icon: Shield },
    { name: 'My Profile', path: '/member/profile', icon: User },
  ];

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col md:flex-row overflow-x-hidden">
      <SideNav />
      <div className={`flex-1 w-full min-w-0 ${shouldHideBottomNav ? 'pb-0' : 'pb-20'} md:pb-0`}>
        {/* pb-20 accounts for floating bottom nav with margin */}
        <Outlet />
      </div>
      <BottomNav />

      {/* ─── MOBILE DRAWER MENU ─── */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden transition-all duration-300 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel — Dark Purple Glass */}
          <div 
            className="fixed top-0 left-0 bottom-0 z-55 w-[280px] bg-gradient-to-b from-[#1e1145] via-[#25175a] to-[#2d1b69] flex flex-col shadow-2xl md:hidden animate-slide-right pb-safe"
          >
            {/* Top User Profile Header */}
            <div className="p-5 pb-4 flex flex-col gap-3 relative">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 active:scale-95 transition-all"
              >
                <X size={14} />
              </button>
              
              {/* Brand mark */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-500/30">
                  म
                </div>
                <h2 className="text-[16px] font-bold text-white tracking-tight">MeriSamaj</h2>
              </div>

              {/* User card */}
              <div className="flex items-center gap-3 bg-white/8 rounded-2xl p-3 border border-white/8">
                <Avatar 
                  initials={currentUser?.initials || 'U'} 
                  size="md" 
                  color="bg-gradient-to-br from-purple-400 to-violet-600 text-white font-bold border-2 border-purple-300/30" 
                  imageUrl={currentUser?.avatar}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-white truncate leading-tight">
                    {currentUser?.name || 'User Profile'}
                  </h4>
                  <p className="text-[10px] font-medium text-purple-300/60 mt-0.5 uppercase tracking-wider leading-none">
                    {currentUser?.community || 'Samaj Member'}
                  </p>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="mx-5 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent" />

            {/* Scrollable Navigation Links */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleMenuLinkClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium tracking-wide transition-all active:scale-98 relative ${
                      isActive 
                        ? 'bg-white/12 text-white font-semibold' 
                        : 'text-purple-200/50 hover:bg-white/5 hover:text-purple-100'
                    }`}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-gradient-to-b from-purple-400 to-violet-400" />
                    )}
                    <Icon size={18} className={isActive ? 'text-purple-300' : 'text-purple-400/40'} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Logout Button */}
            <div className="p-4 shrink-0">
              <div className="mx-1 mb-3 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent" />
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                  navigate('/member/login');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/15 text-rose-300 hover:bg-rose-500/20 active:scale-95 transition-all rounded-xl text-[12px] font-bold uppercase tracking-wider border border-rose-400/15"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
