import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Heart, MessageCircle, User } from 'lucide-react';

const tabPaths = ['/member/home', '/member/social', '/member/matrimonial', '/member/chat', '/member/profile'];

// Sub-pages where bottom nav should be hidden
const hiddenPaths = ['/member/events', '/member/groups', '/member/notifications', '/member/splash', '/member/login', '/member/setup-profile', '/member/select-community', '/member/verify-otp', '/member/chat/room', '/member/chat/call', '/member/matrimonial'];

export const BottomNav = () => {
  const location = useLocation();
  
  // Hide on onboarding and sub-pages
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));
  // Also hide if we're on a detail page (more than 2 segments, e.g. /member/social/123)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  if (shouldHide || pathSegments.length > 2) {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/member/home', icon: Home },
    { name: 'Social', path: '/member/social', icon: Users },
    { name: 'Matrimony', path: '/member/matrimonial', icon: Heart },
    { name: 'Chat', path: '/member/chat', icon: MessageCircle },
    { name: 'Profile', path: '/member/profile', icon: User },
  ];

  const getActiveColor = (itemName) => {
    if (itemName === 'Social') return '#3B82F6';
    if (itemName === 'Matrimony') return '#F43F5E';
    return '#7C3AED';
  };

  return (
    <div 
      className="responsive-fixed-bottom z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Frosted glass container with purple glow line */}
      <div className="mx-3 mb-2 rounded-2xl bg-white/75 backdrop-blur-2xl border border-white/60 shadow-[0_-4px_30px_rgba(124,58,237,0.08),0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around h-[66px] px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeColor = getActiveColor(item.name);
            return (
              <NavLink 
                key={item.name}
                to={item.path}
                replace
                className="flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative group"
              >
                {/* Active pill background */}
                {isActive && (
                  <div 
                    className="absolute inset-x-2 top-1.5 bottom-1.5 rounded-xl transition-all duration-300"
                    style={{ backgroundColor: `${activeColor}08` }}
                  />
                )}
                
                <div className={`relative z-10 transition-all duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                  <item.icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ color: isActive ? activeColor : '#9CA3AF' }}
                    fill={isActive && (item.icon === Heart || item.icon === Home) ? 'currentColor' : 'none'}
                    className="transition-all duration-300"
                  />
                </div>
                <span 
                  className={`text-[10px] mt-1 transition-all duration-200 relative z-10 ${isActive ? 'font-bold' : 'font-medium'}`}
                  style={{ color: isActive ? activeColor : '#9CA3AF' }}
                >
                  {item.name}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div 
                    className="absolute -top-0.5 w-5 h-[3px] rounded-full transition-all duration-300"
                    style={{ backgroundColor: activeColor }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
