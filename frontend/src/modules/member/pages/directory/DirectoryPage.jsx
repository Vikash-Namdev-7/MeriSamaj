import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataProvider';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Users, 
  Award, 
  BookOpen, 
  Heart, 
  Cpu, 
  Menu, 
  Bell,
  ArrowRight,
  Store,
  GraduationCap,
  Filter
} from 'lucide-react';
import { useDraggableScroll } from '../../../../hooks/useDraggableScroll';

const DirectoryPage = () => {
  const navigate = useNavigate();
  const { setMobileMenuOpen, getUnreadCountForModule } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useDraggableScroll();

  // Categories with hardcoded display counts matching the mockup
  const categories = [
    { id: 'executive', name: 'Executive Members', count: 120, icon: Award, iconColor: 'text-amber-600 bg-amber-50', filterVal: 'Executive' },
    { id: 'business', name: 'Business Owners', count: 350, icon: Briefcase, iconColor: 'text-purple-600 bg-purple-50', filterVal: 'Business Owner' },
    { id: 'teacher', name: 'Teachers', count: 85, icon: BookOpen, iconColor: 'text-blue-600 bg-blue-50', filterVal: 'Teacher' },
    { id: 'doctor', name: 'Doctors', count: 45, icon: Heart, iconColor: 'text-rose-600 bg-rose-50', filterVal: 'Doctor' },
    { id: 'engineer', name: 'Engineers', count: 60, icon: Cpu, iconColor: 'text-emerald-600 bg-emerald-50', filterVal: 'Software Engineer' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/member/directory/list', { state: { initialSearch: searchQuery } });
  };

  const handleQuickFilterClick = (type, val) => {
    navigate('/member/directory/list', { state: { filterType: type, filterVal: val } });
  };

  return (
    <div className="min-h-screen bg-surface pb-16">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1 -ml-1 press-scale">
            <Menu size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary tracking-tight">Directory</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/member/profile/family')} 
            className="text-xs font-bold text-brand-primary bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100/50 press-scale flex items-center gap-1 hover:bg-purple-100/50 transition-colors"
          >
            <Users size={13} />
            My Family
          </button>
          <button onClick={() => navigate('/member/notifications?module=community')} className="p-1 press-scale relative">
            <Bell size={22} className="text-text-primary" />
            {getUnreadCountForModule('community') > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 max-w-4xl mx-auto space-y-6">
        {/* Purple Hero Banner */}
        <div className="bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] text-white rounded-[28px] p-5 relative overflow-hidden shadow-xl shadow-purple-500/15 border border-purple-400/15 flex flex-col justify-between min-h-[170px]">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <h2 className="text-[20px] font-bold text-white tracking-tight">Our Community, Our Family</h2>
            <p className="text-xs text-purple-200/80 font-medium">Connect, Collaborate, Grow</p>
          </div>

          {/* Community Illustration */}
          <div className="flex justify-center items-end mt-4 relative z-10 w-full">
            <svg viewBox="0 0 200 80" className="w-56 h-20 text-white" fill="currentColor">
              <circle cx="100" cy="35" r="14" className="text-purple-300" />
              <path d="M78 80 C78 50, 122 50, 122 80 Z" className="text-purple-400" />
              <circle cx="68" cy="42" r="11" className="text-purple-200" />
              <path d="M50 80 C50 55, 86 55, 86 80 Z" className="text-purple-300" />
              <circle cx="132" cy="42" r="11" className="text-purple-200" />
              <path d="M114 80 C114 55, 150 55, 150 80 Z" className="text-purple-300" />
              <circle cx="40" cy="48" r="9" className="text-purple-100" />
              <path d="M26 80 C26 60, 54 60, 54 80 Z" className="text-purple-200" />
              <circle cx="160" cy="48" r="9" className="text-purple-100" />
              <path d="M146 80 C146 60, 174 60, 174 80 Z" className="text-purple-200" />
            </svg>
          </div>
        </div>

        {/* Search Bar — Glass */}
        <form onSubmit={handleSearchSubmit} className="space-y-1.5">
          <div className="flex items-center bg-white/85 backdrop-blur-md rounded-2xl px-4 py-3.5 gap-2.5 border border-purple-100/30 shadow-sm focus-within:border-brand-primary/40 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] transition-all">
            <Search size={18} className="text-text-secondary shrink-0" />
            <input 
              type="text" 
              placeholder="Search member name, profession, city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text-primary flex-1 outline-none placeholder-text-secondary"
            />
            <button 
              type="button"
              onClick={() => navigate('/member/directory/list', { state: { openFilters: true, initialSearch: searchQuery } })} 
              className="p-1 text-text-secondary hover:text-brand-primary press-scale transition-colors"
            >
              <Filter size={18} />
            </button>
            <button type="submit" className="p-1 -mr-1 press-scale text-brand-primary font-bold text-xs ml-1 border-l border-purple-100/30 pl-2">
              Search
            </button>
          </div>
        </form>

        {/* Quick Filters */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Quick Filters</label>
          
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" ref={scrollRef}>
            <button
              onClick={() => handleQuickFilterClick('city', 'Indore')}
              className="shrink-0 card-neo py-3.5 px-5 flex flex-col items-center justify-center gap-1.5 w-20 text-center press-scale"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-50 flex items-center justify-center text-brand-primary">
                <MapPin size={16} />
              </div>
              <span className="text-[10px] font-bold text-text-primary">City</span>
            </button>

            <button
              onClick={() => handleQuickFilterClick('profession', 'all')}
              className="shrink-0 card-neo py-3.5 px-5 flex flex-col items-center justify-center gap-1.5 w-20 text-center press-scale"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-violet-50 flex items-center justify-center text-purple-600">
                <Briefcase size={16} />
              </div>
              <span className="text-[10px] font-bold text-text-primary">Profession</span>
            </button>

            <button
              onClick={() => navigate('/member/professional')}
              className="shrink-0 card-neo py-3.5 px-5 flex flex-col items-center justify-center gap-1.5 w-20 text-center press-scale"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center text-amber-600">
                <Store size={16} />
              </div>
              <span className="text-[10px] font-bold text-text-primary">Business</span>
            </button>

            <button
              onClick={() => handleQuickFilterClick('age', 'youth')}
              className="shrink-0 card-neo py-3.5 px-5 flex flex-col items-center justify-center gap-1.5 w-20 text-center press-scale"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center text-emerald-600">
                <Users size={16} />
              </div>
              <span className="text-[10px] font-bold text-text-primary">Youth</span>
            </button>

            <button
              onClick={() => handleQuickFilterClick('age', 'senior')}
              className="shrink-0 card-neo py-3.5 px-5 flex flex-col items-center justify-center gap-1.5 w-20 text-center press-scale"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center text-rose-600">
                <GraduationCap size={16} />
              </div>
              <span className="text-[10px] font-bold text-text-primary">Seniors</span>
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Categories</h3>
            <button 
              onClick={() => navigate('/member/directory/list')}
              className="text-xs font-bold text-brand-primary hover:text-purple-800 flex items-center gap-0.5 cursor-pointer"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="card-neo overflow-hidden divide-y divide-purple-100/20">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => handleQuickFilterClick('profession', cat.filterVal)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.iconColor}`}>
                    <cat.icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary font-medium">
                  <span className="text-xs font-bold bg-purple-50 border border-purple-100/40 px-2.5 py-0.5 rounded-full text-brand-primary">{cat.count}</span>
                  <span className="text-purple-300 text-xs font-bold">&gt;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DirectoryPage;
