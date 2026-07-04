import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Crown, Search, SlidersHorizontal, ArrowUpDown, ChevronRight, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '../../components/common/Avatar';
import { useData } from '../../context/DataProvider';
import { mockAdmins } from '../../data/mockUsers';
import { t } from '../../utils/translations';

// Helper to translate roles into Hindi
const getHindiRole = (role) => {
  if (role === 'President') return 'अध्यक्ष';
  if (role === 'Patron') return 'संरक्षक';
  if (role === 'Vice President') return 'उपाध्यक्ष';
  if (role === 'Secretary') return 'सचिव';
  if (role === 'Joint Secretary') return 'संयुक्त सचिव';
  if (role === 'Treasurer') return 'कोषाध्यक्ष';
  if (role.startsWith('Minister')) {
    const match = role.match(/\(([^)]+)\)/);
    const category = match ? match[1] : '';
    let catHi = category;
    if (category === 'Education') catHi = 'शिक्षा';
    if (category === 'Youth') catHi = 'युवा';
    if (category === 'Women Welfare') catHi = 'महिला कल्याण';
    if (category === 'Social') catHi = 'सामाजिक';
    return `मंत्री (${catHi})`;
  }
  if (role === 'Zonal Head') return 'क्षेत्रीय प्रभारी';
  if (role === 'Area Sub-Head') return 'क्षेत्रीय प्रतिनिधि';
  return role;
};

// Helper to get badge bg colors
const getBadgeColor = (role) => {
  if (role === 'President') return 'bg-[#f08c35]';
  if (role === 'Patron') return 'bg-amber-600';
  if (role === 'Vice President') return 'bg-[#1e58b8]';
  if (role === 'Secretary') return 'bg-[#ff3b68]';
  if (role === 'Joint Secretary') return 'bg-[#1dbf73]';
  if (role === 'Treasurer') return 'bg-[#00a651]';
  return 'bg-[#ff3b68]'; // Default red/pink
};

// Helper for title roles
const getSubTitle = (role) => {
  if (role === 'President') return 'समाज अध्यक्ष';
  if (role === 'Patron') return 'मुख्य संरक्षक';
  if (role === 'Vice President') return 'समाज उपाध्यक्ष';
  if (role === 'Secretary') return 'मुख्य सचिव';
  if (role === 'Joint Secretary') return 'संयुक्त सचिव';
  if (role === 'Treasurer') return 'कोषाध्यक्ष';
  if (role.startsWith('Minister')) return 'कार्यकारिणी सदस्य';
  if (role === 'Zonal Head') return 'जोनल प्रमुख';
  if (role === 'Area Sub-Head') return 'क्षेत्र प्रतिनिधि';
  return 'पदाधिकारी';
};

// ─── HERO SECTION: Selected Leader Split Layout ───
const HeroBanner = ({ leader, language, onBack, navigate }) => {
  if (!leader) return null;

  return (
    <div className="bg-gradient-to-b from-[#1e1145] via-[#25175a] to-surface pt-12 pb-6 px-5 relative overflow-hidden">
      {/* Background ambient float-orbs */}
      <div className="absolute top-4 right-10 w-24 h-24 rounded-full z-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)', filter: 'blur(16px)', animation: 'float-orb 7s ease-in-out infinite' }} 
      />
      <div className="absolute bottom-10 left-4 w-20 h-20 rounded-full z-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(12px)', animation: 'float-orb 9s ease-in-out infinite 1s' }} 
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 relative z-20">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform shrink-0 press-scale"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-white text-[22px] font-black tracking-tight">{t('Samaj Netrutva', language)}</h1>
          <p className="text-purple-200/70 text-[12px] font-bold mt-0.5">{t('Our Leadership, Our Pride', language)}</p>
        </div>
      </div>
      
      {/* Split Details Container Card */}
      <div className="bg-white rounded-[28px] border border-purple-100/20 p-5 flex flex-col gap-5 shadow-[0_12px_32px_rgba(30,17,69,0.06)] relative z-10">
        
        {/* Top Info Split: Photo on left, Info on right */}
        <div className="flex gap-5 items-start">
          {/* Left: Portrait Photo */}
          <div className="w-[125px] h-[150px] shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-purple-100/10 relative shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
            <img 
              src={`https://i.pravatar.cc/300?u=${leader.initials}`} 
              className="w-full h-full object-cover" 
              alt={leader.name} 
            />
          </div>
          
          {/* Right: Text Information */}
          <div className="flex-1 flex flex-col justify-start">
            <div className="flex items-center gap-1.5 mb-2">
              {['President', 'Patron'].includes(leader.role) && (
                <Crown size={18} className="text-amber-500 fill-amber-500 shrink-0" />
              )}
              <span className={`text-white text-[9px] font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider ${getBadgeColor(leader.role)} shadow-sm`}>
                {getHindiRole(leader.role)}
              </span>
            </div>
            
            <h2 className="text-[19px] font-black text-text-primary leading-tight tracking-tight">
              {leader.name}
            </h2>
            
            <p className="text-brand-accent text-[12px] font-bold mt-1">
              {getSubTitle(leader.role)}
            </p>
            
            {/* Phone & Location */}
            <div className="flex flex-col gap-1.5 mt-3.5 text-text-secondary text-[12px] font-bold">
              {leader.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-purple-400 shrink-0" />
                  <span>{leader.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-purple-400 shrink-0" />
                <span>{leader.city}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-[1px] bg-purple-100/15 w-full" />
        
        {/* Bottom Actions: Chat Only */}
        <div className="w-full">
          <button 
            onClick={() => navigate(`/member/chat/${leader.id}`)} 
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[13px] font-black flex items-center justify-center gap-2 hover:shadow-lg shadow-emerald-500/20 active:scale-95 transition-all press-scale"
          >
            <MessageCircle size={14} strokeWidth={2.5} /> चैट करें
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CORE COMMITTEE: Horizontal Scroll Cards ───
const CoreCommitteeCard = ({ member, language, isSelected, onSelect, navigate }) => {
  // Map Joint Secretary role to bg-[#6B21A8] (purple) and "मंत्री" for badge consistency
  const badgeColor = member.role === 'Vice President' 
    ? 'bg-[#1e58b8]' 
    : member.role === 'Secretary' 
    ? 'bg-[#ff3b68]' 
    : member.role === 'Joint Secretary' 
    ? 'bg-[#6B21A8]' 
    : getBadgeColor(member.role);
    
  const hindiRole = member.role === 'Vice President' 
    ? 'उपाध्यक्ष' 
    : member.role === 'Secretary' 
    ? 'सचिव' 
    : member.role === 'Joint Secretary' 
    ? 'मंत्री' 
    : getHindiRole(member.role);

  return (
    <div 
      onClick={onSelect}
      className={`shrink-0 w-[114px] sm:w-[124px] bg-white rounded-[24px] overflow-hidden flex flex-col items-center cursor-pointer transition-all duration-300 pb-3.5 border ${
        isSelected 
          ? 'border-brand-primary ring-4 ring-brand-primary/10 shadow-[0_8px_24px_rgba(124,58,237,0.12)] scale-[1.02]' 
          : 'border-purple-100/20 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:border-purple-200'
      }`}
    >
      {/* Full Width Portrait Photo */}
      <div className="w-full aspect-square overflow-hidden bg-gray-50 shrink-0 mb-2 relative border-b border-purple-50">
        <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
      </div>
      
      {/* Role Badge - below photo, above name */}
      <div className="mb-1.5 shrink-0">
        <span className={`text-white text-[7.5px] sm:text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm ${badgeColor}`}>
          {hindiRole}
        </span>
      </div>
      
      {/* Office Bearer Name */}
      <h4 className="text-slate-800 text-[9.5px] sm:text-[10.5px] font-extrabold text-center leading-tight mb-2 px-1.5 line-clamp-2">
        {member.name.replace(' Agrawal', '').replace(' Sharma', '').replace(' Patel', '')}
      </h4>

      {/* Centered Short purple divider line */}
      <div className="w-5 h-[1.5px] bg-brand-primary/30 rounded-full mb-2" />
      
      {/* Chat Action Button */}
      <div className="flex justify-center w-full mt-auto" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => navigate(`/member/chat/${member.id}`)} 
          className="w-8 h-8 rounded-xl border border-emerald-100 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-200 text-emerald-600 shrink-0 press-scale"
          style={{ background: 'rgba(16,185,129,0.04)' }}
        >
          <MessageCircle size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

// ─── MINISTER GRID CARD ───
const MinisterCard = ({ member, language, isSelected, onSelect, navigate }) => (
  <div 
    onClick={onSelect}
    className={`bg-white rounded-[24px] p-4 cursor-pointer transition-all duration-300 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
      isSelected 
        ? 'border-brand-primary ring-4 ring-brand-primary/10 shadow-[0_8px_24px_rgba(124,58,237,0.12)] scale-[1.01]' 
        : 'border-purple-100/20 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-purple-200'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-13 h-13 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-purple-50 shadow-sm relative">
        <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[8.5px] font-black text-white px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider ${getBadgeColor(member.role)}`}>
            {getHindiRole(member.role)}
          </span>
        </div>
        <h4 className="text-[14.5px] font-extrabold text-gray-900 truncate leading-tight">{member.name}</h4>
        {member.phone && (
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">{member.phone}</p>
        )}
      </div>
    </div>
    
    <div className="flex gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => navigate(`/member/chat/${member.id}`)} 
        className="w-9 h-9 rounded-xl border border-emerald-100 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-200 text-emerald-600 press-scale shadow-sm"
        style={{ background: 'rgba(16,185,129,0.04)' }}
      >
        <MessageCircle size={13} strokeWidth={2.2} />
      </button>
    </div>
  </div>
);

// ─── AREA DELEGATE ROW ───
const DelegateRow = ({ member, language, isSelected, onSelect, navigate }) => (
  <div 
    onClick={onSelect}
    className={`flex items-center gap-3 py-3.5 px-3 rounded-xl cursor-pointer transition-all active:scale-[0.99] border ${isSelected ? 'bg-brand-primary/5 border-brand-primary/20' : 'border-transparent hover:bg-gray-50'}`}
  >
    <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-sm relative">
      <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[14px] font-extrabold text-gray-900 truncate">{member.name}</h4>
      <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1 mt-0.5">
        <MapPin size={10} /> {member.area || member.zone}
        {member.members && <span className="ml-1">· {member.members} {t('members', language)}</span>}
      </p>
    </div>
    <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => navigate(`/member/chat/${member.id}`)} className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#00a651] active:scale-90 transition-transform">
        <MessageCircle size={14} />
      </button>
    </div>
  </div>
);

// ─── SECTION HEADER ───
const SectionHeader = ({ titleHi, titleEn, onViewAll, language }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">{titleHi}</h3>
      {titleEn && <p className="text-[13px] text-gray-500 font-medium">{titleEn}</p>}
    </div>
    {onViewAll && (
      <button onClick={onViewAll} className="text-[14px] text-[#1e58b8] font-bold flex items-center gap-1">
        {t('View All', language)} <ChevronRight size={16} />
      </button>
    )}
  </div>
);

// ─── MAIN PAGE ───
const LeadershipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, language } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // All, Zonal Head, Area Sub-Head
  const [sortOrder, setSortOrder] = useState('none'); // none, name-asc, name-desc, members-desc
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const cityAdmins = mockAdmins.filter(a => a.city === currentUser.city);
  
  const patron = cityAdmins.find(a => a.role === 'Patron');
  const president = cityAdmins.find(a => a.role === 'President');
  const coreCommittee = cityAdmins.filter(a => ['Vice President', 'Secretary', 'Joint Secretary', 'Treasurer'].includes(a.role));
  const ministers = cityAdmins.filter(a => a.role.startsWith('Minister'));
  const zonalHeads = cityAdmins.filter(a => a.role === 'Zonal Head');
  const areaDelegates = cityAdmins.filter(a => a.role === 'Area Sub-Head');

  // Initialize selectedId from navigation state or default to President
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || president?.id || patron?.id || (cityAdmins[0]?.id || null));

  // Sync state if navigation state changes
  useEffect(() => {
    if (location.state?.selectedId) {
      setSelectedId(location.state.selectedId);
      // Clean up navigation state so user can toggle selection freely
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.selectedId]);

  // Selected leader profile matching selectedId
  const selectedLeader = cityAdmins.find(a => a.id === selectedId) || president || patron || cityAdmins[0];

  // Apply Filter and Search
  let delegates = [...zonalHeads, ...areaDelegates];
  if (activeFilter !== 'All') {
    delegates = delegates.filter(d => d.role === activeFilter);
  }

  const filteredDelegates = delegates.filter(d =>
    !searchQuery || 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.area && d.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.zone && d.zone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Apply Sorting
  if (sortOrder === 'name-asc') {
    filteredDelegates.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'name-desc') {
    filteredDelegates.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortOrder === 'members-desc') {
    filteredDelegates.sort((a, b) => (b.members || 0) - (a.members || 0));
  }

  const handleSelectLeader = (id) => {
    setSelectedId(id);
    // Smooth scroll to top of details card
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      
      {/* ─── HERO: Selected Leader Details Section ─── */}
      <HeroBanner 
        leader={selectedLeader} 
        language={language} 
        onBack={() => navigate(-1)} 
        navigate={navigate} 
      />

      {/* ─── PRESIDENT CARD (Always shown) ─── */}
      {president && (
        <div className="px-5 mb-6">
          <div 
            onClick={() => handleSelectLeader(president.id)}
            className="bg-white border border-[#f08c35]/30 rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform hover:border-[#f08c35]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-[100px]" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-amber-50">
                  <img src={`https://i.pravatar.cc/150?u=${president.initials}`} className="w-full h-full object-cover" alt={president.name} />
                </div>
                <div className="absolute -top-2 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                  <Crown size={12} className="text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold text-[#f08c35] bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-amber-100/50">{t('President', language)}</span>
                </div>
                <h4 className="text-[15px] font-extrabold text-gray-900 leading-tight truncate mb-0.5">{president.name}</h4>
                {president.phone && <p className="text-[11px] font-medium text-gray-500">{president.phone}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => navigate(`/member/chat/${president.id}`)} className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#00a651] active:scale-90 transition-transform">
                  <MessageCircle size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CORE COMMITTEE: Horizontal Scroll ─── */}
      {coreCommittee.length > 0 && (
        <div className="mb-6">
          <div className="px-5">
            <SectionHeader titleHi="मुख्य पदाधिकारी" titleEn="Core Committee" language={language} />
          </div>
          <div className="flex gap-3.5 overflow-x-auto scrollbar-hide px-5 pb-2.5">
            {coreCommittee.map(m => (
              <CoreCommitteeCard 
                key={m.id} 
                member={m} 
                language={language} 
                isSelected={selectedLeader?.id === m.id}
                onSelect={() => handleSelectLeader(m.id)}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── MINISTERS: executive board grid ─── */}
      {ministers.length > 0 && (
        <div className="px-5 mb-6">
          <SectionHeader titleHi={t('Executive Board', language)} titleEn="Executive Board" language={language} />
          <div className="grid grid-cols-1 gap-2.5">
            {ministers.map(m => (
              <MinisterCard 
                key={m.id} 
                member={m} 
                language={language} 
                isSelected={selectedLeader?.id === m.id}
                onSelect={() => handleSelectLeader(m.id)}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}



      {/* ─── FOOTER ─── */}
      <div className="mt-8 px-5 text-center">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />
        <p className="text-[11px] text-gray-400">{currentUser.community} · {currentUser.city}</p>
        <p className="text-[10px] text-gray-300 mt-0.5">अंतिम अपडेट · जून 2026</p>
      </div>
    </div>
  );
};

export default LeadershipPage;
