import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, Vote, Send, Settings, LogOut, Menu, X, Award, ShieldCheck, Users, Calendar, Briefcase, Heart, Search, BarChart3, HeartHandshake, User, ChevronDown, ChevronUp
} from 'lucide-react';
import { useData } from '../../member/context/DataProvider';
import { Avatar } from '../../member/components/common/Avatar';

export const HeadLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, members, logoutUser } = useData();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Live count of pending verification requests
  const pendingApprovalsCount = members.filter(m => !m.isVerified).length;

  const navigationConfig = [
    {
      category: 'CORE DASHBOARD',
      items: [
        { 
          name: 'President Dashboard', 
          path: '/head/dashboard', 
          icon: LayoutDashboard,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null
        }
      ]
    },
    {
      category: 'COMMUNITY LEDGERS',
      items: [
        {
          name: 'Members',
          icon: Users,
          children: [
            { name: 'All Members', path: '/head/members', search: '?tab=list' },
            { name: 'Verifications', path: '/head/members', search: '?tab=verification', badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null },
            { name: 'Samaj Analytics', path: '/head/members', search: '?tab=analytics' }
          ]
        },
        {
          name: 'Professionals',
          icon: Briefcase,
          children: [
            { name: 'Directory', path: '/head/professionals', search: '?tab=directory' },
            { name: 'Verification Requests', path: '/head/professionals', search: '?tab=verification' },
            { name: 'Compliance Monitor', path: '/head/professionals', search: '?tab=compliance' }
          ]
        },
        {
          name: 'Matrimonial',
          icon: Heart,
          children: [
            { name: 'Overview', path: '/head/matrimonial', search: '?tab=overview' },
            { name: 'Moderation Queue', path: '/head/matrimonial', search: '?tab=moderation' },
            { name: 'Analytics', path: '/head/matrimonial', search: '?tab=analytics' }
          ]
        }
      ]
    },
    {
      category: 'EVENTS & GOVERNANCE',
      items: [
        {
          name: 'Events Desk',
          icon: Calendar,
          children: [
            { name: 'Event Planner', path: '/head/events', search: '?tab=planner' },
            { name: 'Bookings & Check-ins', path: '/head/events', search: '?tab=bookings' }
          ]
        },
        {
          name: 'Circulars & Alerts',
          icon: Send,
          children: [
            { name: 'Official circulars', path: '/head/announcements' },
            { name: 'Notification Center', path: '/head/notifications' }
          ]
        },
        { 
          name: 'Fund Governance', 
          path: '/head/funds', 
          icon: Wallet 
        }
      ]
    },
    {
      category: 'PLATFORM CONTROLS',
      items: [
        { 
          name: 'Election Commission', 
          path: '/head/elections', 
          icon: Vote 
        },
        {
          name: 'Reports & Analytics',
          path: '/head/reports',
          icon: BarChart3
        },
        { 
          name: 'Community Settings', 
          path: '/head/settings', 
          icon: Settings 
        },
        {
          name: 'Profile & Account',
          path: '/head/profile',
          icon: User
        }
      ]
    }
  ];

  // Auto-expand active category
  useEffect(() => {
    const newExpanded = { ...expandedItems };
    let changed = false;
    navigationConfig.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => 
            location.pathname === child.path && 
            (!child.search || location.search === child.search)
          );
          const matchesPath = location.pathname.startsWith(item.children[0].path);
          if ((hasActiveChild || matchesPath) && !newExpanded[item.name]) {
            newExpanded[item.name] = true;
            changed = true;
          }
        }
      });
    });
    if (changed) {
      setExpandedItems(newExpanded);
    }
  }, [location.pathname, location.search]);

  const toggleExpand = (name) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const renderNavItems = (isMobile) => {
    return navigationConfig.map((section) => (
      <div key={section.category} className="space-y-1 pt-3">
        {/* Category Header */}
        <div className="px-4 py-1 text-[10px] font-black text-slate-400 tracking-widest uppercase">
          {section.category}
        </div>
        
        {section.items.map((item) => {
          const Icon = item.icon;
          
          if (item.children) {
            const isParentActive = item.children.some(child => 
              location.pathname === child.path && 
              (!child.search || location.search === child.search)
            );
            const isExpanded = expandedItems[item.name];
            
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isParentActive 
                      ? 'bg-purple-50 text-[#5b21b6] font-extrabold shadow-sm shadow-purple-500/5' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon 
                      size={18} 
                      className={`mr-3 transition-colors ${isParentActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                    />
                    <span className="text-[13px] tracking-wide">{item.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="ml-6 pl-4 border-l border-slate-100 space-y-1 mt-1 mb-2">
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.path && 
                        (!child.search || location.search === child.search);
                      
                      return (
                        <NavLink
                          key={child.name}
                          to={`${child.path}${child.search || ''}`}
                          onClick={isMobile ? () => setIsMobileOpen(false) : undefined}
                          className={`block py-1.5 px-2.5 text-[12.5px] transition-colors rounded-lg ${
                            isChildActive 
                              ? 'text-purple-600 font-bold bg-purple-50/50' 
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 font-medium'
                          }`}
                        >
                          {child.name}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            const isActive = location.pathname === item.path;
            return (
              <NavLink 
                key={item.name}
                to={item.path}
                onClick={isMobile ? () => setIsMobileOpen(false) : undefined}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-purple-50 text-[#5b21b6] font-extrabold shadow-sm shadow-purple-500/5' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold'
                }`}
              >
                {/* Active Accent Bar */}
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-purple-600" />
                )}
                
                <div className="flex items-center">
                  <Icon 
                    size={18} 
                    className={`mr-3 transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                  />
                  <span className="text-[13px] tracking-wide">{item.name}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white border border-rose-400/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          }
        })}
      </div>
    ));
  };

  const handleSignOut = () => {
    logoutUser();
    navigate('/member/login');
  };

  return (
    <div className="relative w-full h-screen bg-surface flex flex-col md:flex-row overflow-hidden">
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-[260px] h-full bg-white border-r border-slate-100 shrink-0 z-40">
        {/* Brand Header */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/25">
              म
            </div>
            <div>
              <h1 className="text-[18px] font-black text-slate-900 tracking-tight leading-none">MeriSamaj</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">DashboardKit</p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="mx-5 h-[1px] bg-slate-100 mb-5" />

        {/* Executive Tag */}
        <div className="mx-4 mb-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2">
          <Award size={16} className="text-amber-500 animate-pulse" />
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-800">
            President Council
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {renderNavItems(false)}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-4 space-y-2 mt-auto">
          <div className="mx-2 mb-2 h-[1px] bg-slate-100" />
          
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100/80">
            <Avatar 
              initials="MA" 
              size="sm" 
              imageUrl={currentUser?.avatar}
              color="bg-gradient-to-br from-amber-400 to-purple-600 text-white font-bold"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-800 truncate leading-none">Shri Mohan Lal</p>
              <p className="text-[9px] font-bold text-slate-400 truncate mt-1 leading-none">Adhyaksh (Head)</p>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all text-[12px] font-bold uppercase tracking-wider border border-rose-100"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE HEADER & TOP NAV ─── */}
      <header className="md:hidden w-full h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-md shadow-sm">
            म
          </div>
          <div>
            <h1 className="text-[15px] font-black text-slate-900 leading-none">MeriSamaj</h1>
            <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Council Head</p>
          </div>
        </div>

        <button 
          onClick={() => setIsMobileOpen(true)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 active:bg-slate-50 border border-slate-200"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* ─── MOBILE DRAWER MENU ─── */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          <div 
            className="fixed top-0 left-0 bottom-0 w-[270px] bg-white z-55 flex flex-col p-5 shadow-2xl border-r border-slate-100 animate-slide-right pb-safe"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-md shadow-sm">
                  म
                </div>
                <span className="text-[16px] font-black text-slate-900">MeriSamaj</span>
              </div>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 bg-slate-50 active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            {/* Separator */}
            <div className="mx-2 h-[1px] bg-slate-100 mb-5" />

            {/* Executive Tag */}
            <div className="mx-2 mb-4 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2">
              <Award size={16} className="text-amber-500 animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-800">
                President Council
              </span>
            </div>

            {/* Nav items list */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
              {renderNavItems(true)}
            </nav>

            {/* Footer */}
            <div className="pt-4 mt-auto border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Avatar 
                  initials="MA" 
                  size="sm" 
                  imageUrl={currentUser?.avatar}
                  color="bg-brand-primary text-white font-bold"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-slate-800 truncate leading-none">Shri Mohan Lal</p>
                  <p className="text-[9px] font-bold text-slate-400 truncate mt-1 leading-none">Adhyaksh (Head)</p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-600 bg-rose-50 rounded-xl font-bold uppercase tracking-wider text-[12px] border border-rose-100"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── MAIN CONTENT FRAME ─── */}
      <main className="flex-1 w-full h-full min-w-0 flex flex-col relative overflow-hidden bg-surface">
        {/* Top Navbar */}
        <div className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hidden md:flex z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-gray-800 font-bold text-sm tracking-wide">Council Workspace</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-400">
              <button className="hover:text-brand-primary transition-colors"><Search size={18} /></button>
              <button className="hover:text-brand-primary transition-colors relative">
                <Send size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
            </div>
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[12px] font-bold text-gray-800 leading-none">Shri Mohan Lal</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Administrator</p>
              </div>
              <Avatar 
                initials="MA" 
                size="sm" 
                imageUrl={currentUser?.avatar}
                color="bg-brand-primary text-white"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default HeadLayout;
