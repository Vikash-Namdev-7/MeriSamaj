import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Heart, BookOpen, User, Settings, LogOut, MessageCircle } from 'lucide-react';
import { useData } from '../../context/DataProvider';

const tabPaths = ['/member/home', '/member/social', '/member/matrimonial', '/member/directory', '/member/profile'];
const hiddenPaths = ['/member/events', '/member/groups', '/member/notifications', '/member/splash', '/member/login', '/member/setup-profile', '/member/select-community', '/member/verify-otp'];

export const SideNav = () => {
  const location = useLocation();
  const { logoutUser } = useData();
  
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));
  const pathSegments = location.pathname.split('/').filter(Boolean);
  if (shouldHide || pathSegments.length > 2) {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/member/home', icon: Home },
    { name: 'Social', path: '/member/social', icon: Users },
    { name: 'Matrimony', path: '/member/matrimonial', icon: Heart },
    { name: 'Chat', path: '/member/chat', icon: MessageCircle },
    { name: 'Directory', path: '/member/directory', icon: BookOpen },
    { name: 'Profile', path: '/member/profile', icon: User },
  ];

  return (
    <div className="hidden md:flex flex-col w-[260px] h-screen bg-gradient-to-b from-[#1e1145] via-[#25175a] to-[#2d1b69] sticky top-0 border-r border-white/5">
      {/* Brand Logo */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
            म
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-white tracking-tight">MeriSamaj</h1>
            <p className="text-[10px] font-medium text-purple-300/60 tracking-wide">Your Community Platform</p>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-5 h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent mb-3" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink 
              key={item.name}
              to={item.path}
              replace
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-250 group relative ${
                isActive 
                  ? 'bg-white/10 text-white font-semibold' 
                  : 'text-purple-200/60 hover:bg-white/5 hover:text-purple-100'
              }`}
            >
              {/* Active left accent bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-gradient-to-b from-purple-400 to-violet-400" />
              )}
              
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`mr-3 transition-all duration-300 ${isActive ? 'text-purple-300' : 'text-purple-400/50 group-hover:text-purple-300/70'}`}
                fill={isActive && item.icon === Heart ? 'currentColor' : 'none'}
              />
              <span className={`text-[14px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 space-y-1">
        <div className="mx-2 mb-2 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent" />
        <NavLink 
          to="/member/settings"
          className="flex items-center px-4 py-2.5 text-purple-200/50 hover:bg-white/5 hover:text-purple-100 rounded-xl transition-all"
        >
          <Settings size={18} className="mr-3 text-purple-400/40" />
          <span className="text-[13px] font-medium">Settings</span>
        </NavLink>
        <button 
          onClick={logoutUser}
          className="w-full flex items-center px-4 py-2.5 text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all"
        >
          <LogOut size={18} className="mr-3" />
          <span className="text-[13px] font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
