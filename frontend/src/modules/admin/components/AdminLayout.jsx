import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Heart, Calendar, Settings, LogOut, Menu, X, ShieldAlert, Send, Search, Building2, CreditCard, Globe, ChevronDown, ChevronUp, Network, Briefcase, HeartHandshake, Megaphone, Landmark
} from 'lucide-react';
import { useData } from '../../member/context/DataProvider';
import { Avatar } from '../../member/components/common/Avatar';
import { useAdminAuth } from '../auth/useAdminAuth';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { members, logoutUser } = useData();
  const { adminAuth, adminLogout } = useAdminAuth();
  const adminUser = adminAuth.adminUser;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  // Calculate real-time pending approvals count
  const pendingCount = members.filter(m => !m.isVerified).length;

  const navigationConfig = [
    {
      category: 'CORE DASHBOARD',
      items: [
        { 
          name: 'Admin Dashboard', 
          path: '/admin/dashboard', 
          icon: LayoutDashboard 
        }
      ]
    },
    {
      category: 'USER MANAGEMENT',
      items: [
        { 
          name: 'Users', 
          icon: Users,
          badge: pendingCount > 0 ? pendingCount : null,
          children: [
            { name: 'All Users', path: '/admin/users', search: '?tab=list' },
            { name: 'User Analytics', path: '/admin/users', search: '?tab=analytics' },
          ]
        },
        { 
          name: 'Communities', 
          path: '/admin/communities', 
          icon: Landmark 
        },
        { 
          name: 'Community Heads', 
          path: '/admin/community-heads', 
          icon: Users 
        },
        { 
          name: 'Global Families', 
          path: '/admin/families', 
          icon: Network 
        },
        { 
          name: 'City Management', 
          path: '/admin/cities', 
          icon: Building2 
        }
      ]
    },
    {
      category: 'PLATFORM MODULES',
      items: [
        { 
          name: 'Platform Matrimonial', 
          icon: Heart,
          children: [
            { name: 'Overview', path: '/admin/matrimonial', search: '?tab=overview' },
            { name: 'Profiles Directory', path: '/admin/matrimonial', search: '?tab=directory' },
            { name: 'Moderation Queue', path: '/admin/matrimonial', search: '?tab=moderation' },
            { name: 'Reports & Complaints', path: '/admin/matrimonial', search: '?tab=reports' },
            { name: 'Match Analytics', path: '/admin/matrimonial', search: '?tab=analytics' },
            { name: 'Community Comparison', path: '/admin/matrimonial', search: '?tab=comparison' },
            { name: 'Audit Logs', path: '/admin/matrimonial', search: '?tab=audit' }
          ]
        },
        { 
          name: 'Event Management', 
          icon: Calendar,
          children: [
            { name: 'Overview', path: '/admin/events', search: '?tab=overview' },
            { name: 'All Events', path: '/admin/events', search: '?tab=all' },
            { name: 'Create Event', path: '/admin/events', search: '?tab=create' },
            { name: 'Event Monitoring', path: '/admin/events', search: '?tab=monitoring' },
            { name: 'Featured Events', path: '/admin/events', search: '?tab=featured' },
            { name: 'Event Analytics', path: '/admin/events', search: '?tab=analytics' }
          ]
        },
        { 
          name: 'Global Professional Directory', 
          icon: Briefcase,
          children: [
            { name: 'Overview', path: '/admin/professionals/overview' },
            { name: 'Directory Grid', path: '/admin/professionals/grid' },
            { name: 'Approval Queue', path: '/admin/professionals/approvals' },
            { name: 'Category Manager', path: '/admin/professionals/categories' }
          ]
        },
        { 
          name: 'Global Donations', 
          icon: HeartHandshake,
          children: [
            { name: 'Dashboard Overview', path: '/admin/donations', search: '?tab=overview' },
            { name: 'Campaign Directory', path: '/admin/donations', search: '?tab=campaigns' },
            { name: 'Transaction Center', path: '/admin/donations', search: '?tab=transactions' },
            { name: 'Financial Analytics', path: '/admin/donations', search: '?tab=analytics' },
            { name: 'Community Comparison', path: '/admin/donations', search: '?tab=comparison' },
            { name: 'Audit Tracker', path: '/admin/donations', search: '?tab=audit' }
          ]
        },
        {
          name: 'Samaj Funds',
          path: '/admin/funds',
          icon: Landmark
        }
      ]
    },
    {
      category: 'SOCIAL MANAGEMENT',
      items: [
        {
          name: 'Social',
          icon: Globe,
          children: [
            { name: 'City Feed', path: '/admin/social/city-feed' },
            { name: 'Community Feed', path: '/admin/social/community-feed' },
            { name: 'Community Groups', path: '/admin/groups' }
          ]
        }
      ]
    },

    {
      category: 'SYSTEM & CONTENT',
      items: [
        { 
          name: 'Content Management', 
          icon: Globe,
          children: [
            { name: 'Overview', path: '/admin/cms', search: '?tab=dashboard' },
            { name: 'Banners & Sliders', path: '/admin/cms', search: '?tab=banners' },
            { name: 'Announcements & Notices', path: '/admin/cms', search: '?tab=announcements' },
            { name: 'Page Builder', path: '/admin/cms', search: '?tab=pages' },
            { name: 'FAQ Directory', path: '/admin/cms', search: '?tab=faqs' },
            { name: 'Media Library', path: '/admin/cms', search: '?tab=media' },
            { name: 'Footer & Contact', path: '/admin/cms', search: '?tab=settings' }
          ]
        },
        { 
          name: 'Subscription Mgmt', 
          icon: CreditCard,
          children: [
            { name: 'Overview', path: '/admin/subscriptions', search: '?tab=overview' },
            { name: 'Plans', path: '/admin/subscriptions', search: '?tab=plans' },
            { name: 'Subscribers', path: '/admin/subscriptions', search: '?tab=subscribers' },
            { name: 'Usage', path: '/admin/subscriptions', search: '?tab=usage' },
            { name: 'Revenue', path: '/admin/subscriptions', search: '?tab=revenue' },
            { name: 'Coupons', path: '/admin/subscriptions', search: '?tab=coupons' },
            { name: 'Invoices', path: '/admin/subscriptions', search: '?tab=invoices' },
            { name: 'Notifications', path: '/admin/subscriptions', search: '?tab=notifications' },
            { name: 'Settings', path: '/admin/subscriptions', search: '?tab=settings' }
          ]
        },
        { 
          name: 'System Config', 
          path: '/admin/config', 
          icon: Settings 
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
          // Auto-expand if the route matches the parent path prefix
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

  const handleSignOut = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  const renderNavItems = (isMobile) => {
    return navigationConfig.map((section) => (
      <div key={section.category} className="space-y-1 pt-3">
        {/* Category Header */}
        <div className="px-4 py-1 text-[10px] font-black tracking-widest uppercase" style={{ color: 'rgba(167,139,250,0.7)' }}>
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
                    isParentActive ? 'font-semibold' : 'hover:bg-white/5'
                  }`}
                  style={isParentActive ? {
                    background: 'rgba(124,58,237,0.18)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    color: '#ffffff',
                  } : {
                    border: '1px solid transparent',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  <div className="flex items-center">
                    <Icon 
                      size={18} 
                      className="mr-3 transition-colors"
                      style={{ color: isParentActive ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
                    />
                    <span className="text-[13px] tracking-wide">{item.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.6)' }} /> : <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="ml-6 pl-4 border-l border-white/10 space-y-1 mt-1 mb-2">
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.path && 
                        (!child.search || location.search === child.search);
                      
                      return (
                        <NavLink
                          key={child.name}
                          to={`${child.path}${child.search || ''}`}
                          onClick={isMobile ? () => setIsMobileOpen(false) : undefined}
                          className={`block py-1.5 px-2.5 text-[12.5px] transition-colors rounded-lg ${
                            isChildActive ? 'font-bold' : 'hover:bg-white/5 font-medium'
                          }`}
                          style={isChildActive ? {
                            background: 'rgba(124,58,237,0.15)',
                            color: '#ffffff'
                          } : {
                            color: 'rgba(255,255,255,0.75)'
                          }}
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
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive ? 'font-semibold' : 'hover:bg-white/5'
                }`}
                style={isActive ? {
                  background: 'rgba(124,58,237,0.18)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  color: '#ffffff',
                } : {
                  border: '1px solid transparent',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {/* Active Accent Bar */}
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full" style={{ background: 'linear-gradient(180deg, #A78BFA, #7C3AED)', boxShadow: '0 0 8px rgba(124,58,237,0.6)' }} />
                )}
                
                <div className="flex items-center">
                  <Icon 
                    size={18} 
                    className="mr-3 transition-colors"
                    style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
                  />
                  <span className="text-[13px] tracking-wide relative z-10">{item.name}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white border border-rose-400/30 animate-pulse relative z-10">
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

  return (
    <div className="relative w-full h-screen bg-surface flex flex-col md:flex-row overflow-hidden">
      {/* ─── DESKTOP SIDEBAR ─── */}
      {isDesktopSidebarOpen && (
      <aside 
        className="hidden md:flex flex-col w-[260px] h-full shrink-0 z-40 transition-all duration-300"
        style={{
          background: 'linear-gradient(160deg, #13093a 0%, #1e1145 30%, #25175a 65%, #2d1b69 100%)',
          borderRight: '1px solid rgba(167,139,250,0.12)',
          boxShadow: '4px 0 48px rgba(0,0,0,0.3), inset -1px 0 0 rgba(167,139,250,0.08)',
        }}
      >
        {/* Brand Header */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', boxShadow: '0 4px 16px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}
            >
              <span className="relative z-10">म</span>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
            </div>
            <div>
              <h1 className="text-[18px] font-black text-white tracking-tight leading-none">MeriSamaj</h1>
              <p className="text-[9px] font-semibold uppercase tracking-widest mt-1" style={{ color: 'rgba(167,139,250,0.6)' }}>Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="mx-5 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent mb-5" />

        {/* Admin Tag */}
        <div className="mx-4 mb-4 px-4 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <ShieldAlert size={16} className="text-amber-500 animate-pulse" />
          <span className="text-[11px] font-extrabold tracking-wider uppercase" style={{ color: 'rgba(253,230,138,0.9)' }}>
            Moderator Desk Mode
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {renderNavItems(false)}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-4 space-y-2 mt-auto">
          <div className="mx-2 mb-2 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent" />
          
          <div className="flex items-center gap-3 p-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
          >
            <Avatar 
              initials={adminUser?.initials || (adminUser?.name ? adminUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A')} 
              size="sm" 
              imageUrl={adminUser?.avatar}
              color="bg-gradient-to-br from-violet-400 to-purple-600 text-white font-bold"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-white truncate leading-none">{adminUser?.name || 'Administrator'}</p>
              <p className="text-[9px] font-semibold truncate mt-1 leading-none" style={{ color: 'rgba(167,139,250,0.55)' }}>Council Admin</p>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[12px] font-bold uppercase tracking-wider active:scale-95"
            style={{
              background: 'rgba(239,68,68,0.12)',
              color: 'rgba(252,165,165,0.9)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>
      )}

      {/* ─── MOBILE HEADER & TOP NAV ─── */}
      <header className="md:hidden w-full h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-md shadow-sm">
            म
          </div>
          <div>
            <h1 className="text-[15px] font-black text-slate-900 leading-none">MeriSamaj</h1>
            <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Admin Desk</p>
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
            className="fixed top-0 left-0 bottom-0 w-[288px] z-55 flex flex-col shadow-2xl animate-slide-right pb-safe"
            style={{
              background: 'linear-gradient(160deg, #13093a 0%, #1e1145 30%, #25175a 65%, #2d1b69 100%)',
              borderRight: '1px solid rgba(167,139,250,0.12)',
              boxShadow: '4px 0 48px rgba(0,0,0,0.3), inset -1px 0 0 rgba(167,139,250,0.08)',
            }}
          >
            <div className="flex items-center justify-between p-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', boxShadow: '0 4px 16px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                >
                  <span className="relative z-10">म</span>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
                </div>
                <div>
                  <h1 className="text-[17px] font-black text-white tracking-tight leading-none">MeriSamaj</h1>
                  <p className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(167,139,250,0.6)' }}>Admin Desk</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 transition-all active:scale-90"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Separator */}
            <div className="mx-5 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent mb-4" />

            {/* Admin Tag */}
            <div className="mx-4 mb-4 px-3 py-2.5 rounded-xl flex items-center gap-2"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <ShieldAlert size={16} className="text-amber-500 animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-wider uppercase" style={{ color: 'rgba(253,230,138,0.9)' }}>
                Moderator Desk Mode
              </span>
            </div>

            {/* Nav items list */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-1 no-scrollbar">
              {renderNavItems(true)}
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto space-y-2">
              <div className="mx-2 mb-2 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent" />
              
              <div className="flex items-center gap-3 p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
              >
                <Avatar 
                  initials={adminUser?.initials || (adminUser?.name ? adminUser.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'A')} 
                  size="sm" 
                  imageUrl={adminUser?.avatar}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-white truncate leading-none">{adminUser?.name || 'Admin'}</p>
                  <p className="text-[9px] font-semibold truncate mt-1 leading-none" style={{ color: 'rgba(167,139,250,0.55)' }}>Council Admin</p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold uppercase tracking-wider text-[12px] transition-all active:scale-95"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  color: 'rgba(252,165,165,0.9)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
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
            <button 
              onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md transition-all active:scale-95"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-gray-800 font-bold text-sm tracking-wide">Master Administration</h2>
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
                <p className="text-[12px] font-bold text-gray-800 leading-none">{adminUser?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Master Admin</p>
              </div>
              <Avatar 
                initials={adminUser?.initials || (adminUser?.name ? adminUser.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'A')} 
                size="sm" 
                imageUrl={adminUser?.avatar}
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
export default AdminLayout;
