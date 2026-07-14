import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Users, MessageCircle, MapPin, Compass, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '../../components/common/Avatar';
import { useData } from '../../context/DataProvider';
import { PlusCircle, Edit2, Search as SearchIcon } from 'lucide-react';
import { mockMembers } from '../../data/mockUsers';

import FeedPage from './FeedPage';
import GroupsPage from '../groups/GroupsPage';
import ChatListPage from '../chat/ChatListPage';
import DirectoryPage from '../directory/DirectoryPage';
import { DiscoverContent } from './components/DiscoverContent';

// React Icons
import { FiUsers } from 'react-icons/fi';
import { HiOutlineChatAlt } from 'react-icons/hi';
import { MdOutlineGroupAdd } from 'react-icons/md';



// Custom Tab Icons matching the requested design and React Icons
const CityFeedIcon = ({ size = 26, isActive }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 -960 960 960"
    fill={isActive ? '#7C3AED' : '#828E9E'}
    className="transition-all duration-200"
  >
    <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z" />
  </svg>
);

const CommunityFeedIcon = ({ size = 26, isActive }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={isActive ? '#7C3AED' : '#828E9E'}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-all duration-200"
  >
    <circle cx="12" cy="12.5" r="7.5" opacity="0.6" />
    <circle cx="12" cy="5.5" r="1.5" />
    <path d="M10 9a2.2 2.2 0 0 1 4 0" />
    <circle cx="12" cy="12.5" r="1.5" />
    <path d="M10 16a2.2 2.2 0 0 1 4 0" />
    <circle cx="6" cy="15.5" r="1.5" />
    <path d="M4 19a2.2 2.2 0 0 1 4 0" />
    <circle cx="18" cy="15.5" r="1.5" />
    <path d="M16 19a2.2 2.2 0 0 1 4 0" />
  </svg>
);

const GroupsIcon = ({ size = 26, isActive }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={isActive ? '#7C3AED' : '#828E9E'}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-all duration-200"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" strokeWidth="2.5" />
    <line x1="16" y1="11" x2="22" y2="11" strokeWidth="2.5" />
  </svg>
);

const ChatIcon = ({ size = 26, isActive }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={isActive ? '#7C3AED' : '#828E9E'}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-all duration-200"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const DiscoverIcon = ({ size = 26, isActive }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={isActive ? '#7C3AED' : '#828E9E'}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-all duration-200"
  >
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.2,7.8 13.8,13.8 7.8,16.2 10.2,10.2" fill={isActive ? '#7C3AED' : 'none'} opacity={isActive ? '0.15' : '1'} />
    <polygon points="16.2,7.8 13.8,13.8 7.8,16.2 10.2,10.2" />
  </svg>
);

const SocialHubPage = ({ initialTab = 'city-feed' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setMobileMenuOpen, getUnreadCountForModule } = useData();
  const [activeTab, setActiveTab] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const [triggerCreateGroup, setTriggerCreateGroup] = useState(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchTriggeredRef = useRef(false);
  const isWheelingRef = useRef(false);
  const wheelTimeoutRef = useRef(null);
  const lastTabScrollY = useRef({});

  const tabs = [
    { id: 'city-feed', label: 'City Feed', icon: CityFeedIcon, component: FeedPage, feedProps: { feedType: 'city' } },
    { id: 'community-feed', label: 'Community Feed', icon: CommunityFeedIcon, component: FeedPage, feedProps: { feedType: 'community' } },
    { id: 'groups', label: 'Groups', icon: GroupsIcon, component: GroupsPage },
    { id: 'chat', label: 'Chat', icon: ChatIcon, component: ChatListPage },
    { id: 'discover', label: 'Discover', icon: DiscoverIcon, component: DiscoverContent }
  ];

  // Set initial scroll position based on route state or initialTab
  useEffect(() => {
    let passedTabId = location.state?.tab || initialTab;
    if (passedTabId === 'feed') passedTabId = 'city-feed';
    if (passedTabId === 'connect') passedTabId = 'community-feed';
    const tabIndex = tabs.findIndex(t => t.id === passedTabId);
    if (tabIndex !== -1 && scrollContainerRef.current) {
      setActiveTab(tabIndex);
      // Use setTimeout to ensure the DOM is fully rendered and clientWidth is available
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: tabIndex * scrollContainerRef.current.clientWidth,
            behavior: 'instant'
          });
        }
      }, 50);
    }
  }, [initialTab, location.state]);

  // Keep scroll position aligned on resize/rotation
  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          left: activeTab * scrollContainerRef.current.clientWidth,
          behavior: 'instant'
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const handleScroll = (e) => {
    if (!e.target) return;
    const scrollLeft = e.target.scrollLeft;
    const clientWidth = e.target.clientWidth;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== activeTab && newIndex >= 0 && newIndex < tabs.length) {
      setActiveTab(newIndex);
    }
  };

  const handleTabScroll = (e) => {
    const tabId = e.currentTarget.dataset.tabId;
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Only apply the hide-on-scroll behavior to the City Feed and Community Feed tabs
    if (tabId !== 'city-feed' && tabId !== 'community-feed') {
      lastTabScrollY.current[tabId] = currentScrollY;
      return;
    }

    const lastScroll = lastTabScrollY.current[tabId] || 0;
    const difference = currentScrollY - lastScroll;

    if (Math.abs(difference) > 8) {
      if (difference > 0 && currentScrollY > 60) {
        // Scrolling down -> hide BottomNav
        window.dispatchEvent(new CustomEvent('toggle-bottom-nav', { detail: false }));
      } else {
        // Scrolling up -> show BottomNav
        window.dispatchEvent(new CustomEvent('toggle-bottom-nav', { detail: true }));
      }
    }
    lastTabScrollY.current[tabId] = currentScrollY;
  };

  useEffect(() => {
    // Show bottom nav instantly when user switches tabs
    window.dispatchEvent(new CustomEvent('toggle-bottom-nav', { detail: true }));
  }, [activeTab]);

  const scrollToTab = (index) => {
    if (scrollContainerRef.current && !isTransitioningRef.current) {
      isTransitioningRef.current = true;
      scrollContainerRef.current.scrollTo({
        left: index * scrollContainerRef.current.clientWidth,
        behavior: 'smooth'
      });
      setActiveTab(index);
      
      // Lock swiping transitions for 400ms to prevent multi-page skips
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 400);
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, []);

  // Custom Touch Gestures
  const handleTouchStart = (e) => {
    if (isTransitioningRef.current) return;
    if (e.target.closest('[data-swipe-block="true"]')) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchTriggeredRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (isTransitioningRef.current || touchTriggeredRef.current) return;
    if (e.target.closest('[data-swipe-block="true"]')) return;
    
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    // Trigger horizontal swipe if horizontal movement is dominant and exceeds threshold
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 60) {
        touchTriggeredRef.current = true;
        if (diffX < 0) {
          if (activeTab < tabs.length - 1) {
            scrollToTab(activeTab + 1);
          }
        } else {
          if (activeTab > 0) {
            scrollToTab(activeTab - 1);
          }
        }
      }
    }
  };

  const handleWheel = (e) => {
    if (e.target.closest('[data-swipe-block="true"]')) return;
    if (Math.abs(e.deltaX) > 15) {
      if (!isTransitioningRef.current && !isWheelingRef.current) {
        isWheelingRef.current = true;
        if (e.deltaX > 0) {
          if (activeTab < tabs.length - 1) {
            scrollToTab(activeTab + 1);
          }
        } else {
          if (activeTab > 0) {
            scrollToTab(activeTab - 1);
          }
        }
      }

      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      wheelTimeoutRef.current = setTimeout(() => {
        isWheelingRef.current = false;
      }, 150);
    }
  };

  // Render unified FAB based on active tab
  const renderFAB = () => {
    if (activeTab === 0) { // City Feed
      return (
        <button 
          onClick={() => navigate('/member/social/create', { state: { feedType: 'city' } })} 
          className="responsive-fixed-fab w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] text-white rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.35)] flex items-center justify-center press-scale hover:scale-105 transition-transform absolute bottom-6 right-5 z-50"
        >
          <PlusCircle size={24} />
        </button>
      );
    }
    if (activeTab === 1) { // Community Feed
      return (
        <button 
          onClick={() => navigate('/member/social/create', { state: { feedType: 'community' } })} 
          className="responsive-fixed-fab w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] text-white rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.35)] flex items-center justify-center press-scale hover:scale-105 transition-transform absolute bottom-6 right-5 z-50"
        >
          <PlusCircle size={24} />
        </button>
      );
    }
    if (activeTab === 2) { // Groups
      return (
        <button 
          onClick={() => setTriggerCreateGroup(true)} 
          className="responsive-fixed-fab w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-glow text-white rounded-2xl shadow-[0_8px_30px_rgba(124,58,237,0.35)] flex items-center justify-center press-scale hover:scale-105 transition-transform absolute bottom-6 right-5 z-50"
        >
          <Users size={22} />
        </button>
      );
    }
    return null;
  };

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden relative ${activeTab === tabs.findIndex(t => t.id === 'chat') ? 'bg-white' : 'bg-surface'}`}>
      
      {/* ─── FIXED GLOBAL HEADER ─── */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-purple-100/30 flex-shrink-0 shadow-[0_2px_12px_rgba(124,58,237,0.02)]">
        <div className="flex items-center justify-between px-5 h-14">
          {isSearchOpen ? (
            <div className="flex-1 flex items-center gap-3 bg-purple-50/40 border border-purple-100/20 px-3.5 py-1.5 rounded-xl">
              <Search size={18} className="text-purple-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-[14px] text-text-primary font-bold placeholder-text-muted"
                autoFocus
              />
              <button onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }} className="text-purple-400 hover:text-brand-primary p-0.5">
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <button className="text-text-primary" onClick={() => setMobileMenuOpen(true)}>
                  <Menu size={24} />
                </button>
                <h1 className="text-[19px] font-bold text-text-primary tracking-tight">Social Hub</h1>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-text-primary" onClick={() => setIsSearchOpen(true)}>
                  <Search size={21} />
                </button>
                <button className="relative text-text-primary" onClick={() => navigate('/member/notifications?module=community')}>
                  <Bell size={21} />
                  {getUnreadCountForModule('community') > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {getUnreadCountForModule('community')}
                    </span>
                  )}
                </button>

              </div>
            </>
          )}
        </div>

        {/* ─── TAB BAR ─── */}
        <div className="flex relative">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button 
                key={tab.id}
                onClick={() => scrollToTab(idx)}
                className={`flex-1 py-3.5 flex items-center justify-center transition-all ${isActive ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Icon size={24} isActive={isActive} className={isActive ? 'drop-shadow-sm scale-110' : ''} />
              </button>
            );
          })}
          {/* Active Tab Indicator */}
          <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-brand-primary to-brand-glow rounded-t-full transition-all duration-300 ease-out" 
               style={{ width: `${100 / tabs.length}%`, transform: `translateX(${activeTab * 100}%)` }} 
          />
        </div>
      </div>

      {/* ─── SWIPEABLE CONTENT CONTAINER ─── */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
        className="flex overflow-x-hidden scrollbar-hide flex-1"
      >
        {tabs.map((tab) => {
          const Component = tab.component;
          const extraProps = tab.feedProps || {};
          const groupsProps = tab.id === 'groups' ? {
            triggerCreateGroup,
            onGroupCreateTriggered: () => setTriggerCreateGroup(false)
          } : {};
          return (
            <div 
              key={tab.id} 
              data-tab-id={tab.id}
              onScroll={handleTabScroll}
              className={`w-full h-full flex-shrink-0 overflow-y-auto ${tab.id === 'chat' ? 'bg-white pb-0' : 'pb-28'}`}
            >
              <Component isHub={true} {...extraProps} {...groupsProps} searchQuery={searchQuery} />
            </div>
          );
        })}
      </div>

      {/* ─── UNIFIED FAB ─── */}
      {renderFAB()}

    </div>
  );
};

export default SocialHubPage;
