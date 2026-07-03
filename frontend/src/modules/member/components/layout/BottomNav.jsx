import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Heart, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (itemName === 'Social') return { hex: '#3B82F6', shadow: 'rgba(59,130,246,0.35)', bg: 'rgba(59,130,246,0.1)' };
    if (itemName === 'Matrimony') return { hex: '#F43F5E', shadow: 'rgba(244,63,94,0.35)', bg: 'rgba(244,63,94,0.1)' };
    return { hex: '#7C3AED', shadow: 'rgba(124,58,237,0.35)', bg: 'rgba(124,58,237,0.1)' };
  };

  return (
    <div 
      className="responsive-fixed-bottom z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Premium glass nav container */}
      <div className="mx-3 mb-2.5 rounded-[26px] overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.65)',
          boxShadow: '0 -2px 24px rgba(124,58,237,0.07), 0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Thin gradient top line */}
        <div className="h-[1.5px] w-full" 
          style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.15) 50%, transparent 90%)' }} 
        />
        
        <div className="flex items-center justify-around h-[64px] px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const colors = getActiveColor(item.name);
            return (
              <NavLink 
                key={item.name}
                to={item.path}
                replace
                className="flex flex-col items-center justify-center w-full h-full relative group"
              >
                {/* Active pill background with spring animation */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-x-1.5 top-2 bottom-2 rounded-[16px]"
                      style={{ backgroundColor: colors.bg }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Icon */}
                <motion.div 
                  className="relative z-10"
                  animate={{ 
                    y: isActive ? -1 : 0,
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {/* Glow behind active icon */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-full blur-md scale-150 opacity-30 pointer-events-none"
                      style={{ background: colors.hex }}
                    />
                  )}
                  <item.icon 
                    size={isActive ? 22 : 21} 
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ color: isActive ? colors.hex : '#A0AEC0' }}
                    fill={isActive && (item.icon === Heart || item.icon === Home) ? 'currentColor' : 'none'}
                    className="transition-colors duration-200 relative z-10"
                  />
                </motion.div>

                {/* Label */}
                <motion.span 
                  className="text-[9.5px] mt-0.5 relative z-10 font-semibold"
                  animate={{ color: isActive ? colors.hex : '#B0BAC9' }}
                  transition={{ duration: 0.2 }}
                  style={{ fontWeight: isActive ? 700 : 500 }}
                >
                  {item.name}
                </motion.span>
                
                {/* Active top indicator dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      className="absolute -top-0 w-6 h-[3px] rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${colors.hex}, transparent)` }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
