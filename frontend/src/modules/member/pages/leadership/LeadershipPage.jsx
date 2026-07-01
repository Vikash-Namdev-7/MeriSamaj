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
    <div className="bg-gradient-to-b from-[#1e1145] via-[#25175a] to-surface pt-12 pb-6 px-5 relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 relative z-20">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform shrink-0 hover:bg-white/15 press-scale">
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-white text-[22px] font-bold tracking-tight">{t('Samaj Netrutva', language)}</h1>
          <p className="text-purple-200/70 text-[12px] font-medium mt-0.5">{t('Our Leadership, Our Pride', language)}</p>
        </div>
      </div>
      
      {/* Split Details Container Card */}
      <div className="card-neo bg-white/95 p-5 flex flex-col gap-5 shadow-xl shadow-purple-900/10">
        
        {/* Top Info Split: Photo on left, Info on right */}
        <div className="flex gap-5 items-start">
          {/* Left: Portrait Photo */}
          <div className="w-[125px] h-[150px] shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-purple-100/20 relative shadow-sm">
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
              <span className={`text-white text-[10px] font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider ${getBadgeColor(leader.role)} shadow-sm`}>
                {getHindiRole(leader.role)}
              </span>
            </div>
            
            <h2 className="text-[19px] font-bold text-text-primary leading-tight tracking-tight">
              {leader.name}
            </h2>
            
            <p className="text-brand-accent text-[12px] font-bold mt-1">
              {getSubTitle(leader.role)}
            </p>
            
            {/* Phone & Location */}
            <div className="flex flex-col gap-1.5 mt-3.5 text-text-secondary text-[12px] font-medium">
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
        <div className="h-[1px] bg-purple-100/20 w-full" />
        
        {/* Bottom Actions: Call and Chat */}
        <div className="flex gap-4 w-full">
          <a 
            href={`tel:${leader.phone}`} 
            className="flex-1 py-3 rounded-xl border border-purple-200/60 text-brand-primary text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-purple-50/50 active:scale-95 transition-all text-center press-scale"
          >
            <Phone size={15} /> कॉल करें
          </a>
          <button 
            onClick={() => navigate(`/member/chat/${leader.id}`)} 
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:shadow-lg shadow-emerald-500/20 active:scale-95 transition-all press-scale"
          >
            <MessageCircle size={15} /> चैट करें
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
      className={`shrink-0 w-[108px] sm:w-[118px] bg-white rounded-[16px] overflow-hidden shadow-[0_3px_12px_rgba(0,0,0,0.04)] border flex flex-col items-center cursor-pointer active:scale-[0.98] transition-transform pb-2 ${isSelected ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-gray-100'}`}
    >
      {/* Full Width Portrait Photo */}
      <div className="w-full aspect-square overflow-hidden bg-gray-50 shrink-0 mb-1.5 relative">
        <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
      </div>
      
      {/* Role Badge - below photo, above name */}
      <div className="mb-1 shrink-0">
        <span className={`text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm ${badgeColor}`}>
          {hindiRole}
        </span>
      </div>
      
      {/* Office Bearer Name */}
      <h4 className="text-slate-800 text-[9px] sm:text-[9.5px] font-black text-center leading-tight mb-1.5 px-1 line-clamp-2">
        {member.name.replace(' Agrawal', '').replace(' Sharma', '').replace(' Patel', '')}
      </h4>

      {/* Centered Short purple divider line */}
      <div className="w-4.5 h-[1.2px] bg-purple-600 rounded-full mb-1.5" />
      
      {/* Call / Chat Action Buttons */}
      <div className="flex gap-1 justify-center w-full mt-auto" onClick={(e) => e.stopPropagation()}>
        <a 
          href={`tel:${member.phone}`} 
          className="w-6 h-6 rounded-full border border-purple-200 flex items-center justify-center hover:bg-purple-50 transition-colors text-purple-600 shrink-0"
        >
          <Phone size={10} />
        </a>
        <button 
          onClick={() => navigate(`/member/chat/${member.id}`)} 
          className="w-6 h-6 rounded-full border border-emerald-200 flex items-center justify-center hover:bg-emerald-50 transition-colors text-emerald-600 shrink-0"
        >
          <MessageCircle size={10} />
        </button>
      </div>
    </div>
  );
};

// ─── MINISTER GRID CARD ───
const MinisterCard = ({ member, language, isSelected, onSelect, navigate }) => (
  <div 
    onClick={onSelect}
    className={`bg-white rounded-2xl border shadow-sm p-3 cursor-pointer transition-all active:scale-[0.99] ${isSelected ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-gray-100'}`}
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-sm relative">
        <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm ${getBadgeColor(member.role)}`}>
            {getHindiRole(member.role)}
          </span>
        </div>
        <h4 className="text-[14px] font-extrabold text-gray-900 truncate leading-tight">{member.name}</h4>
        {member.phone && (
          <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{member.phone}</p>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <a href={`tel:${member.phone}`} className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#1e58b8] active:scale-90 transition-transform">
          <Phone size={14} />
        </a>
        <button onClick={() => navigate(`/member/chat/${member.id}`)} className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#00a651] active:scale-90 transition-transform">
          <MessageCircle size={14} />
        </button>
      </div>
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
      <a href={`tel:${member.phone}`} className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#1e58b8] active:scale-90 transition-transform">
        <Phone size={14} />
      </a>
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

      {/* ─── PATRON (if different from selected leader) ─── */}
      {patron && selectedLeader?.id !== patron.id && (
        <div className="px-5 mb-6">
          <div 
            onClick={() => handleSelectLeader(patron.id)}
            className="bg-white border border-[#f08c35]/30 rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform hover:border-[#f08c35]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-[100px]" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-amber-50">
                  <img src={`https://i.pravatar.cc/150?u=${patron.initials}`} className="w-full h-full object-cover" alt={patron.name} />
                </div>
                <div className="absolute -top-2 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                  <Crown size={12} className="text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold text-[#f08c35] bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-amber-100/50">{t('Patron', language)}</span>
                </div>
                <h4 className="text-[15px] font-extrabold text-gray-900 leading-tight truncate mb-0.5">{patron.name}</h4>
                {patron.phone && <p className="text-[11px] font-medium text-gray-500">{patron.phone}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <a href={`tel:${patron.phone}`} className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#1e58b8] active:scale-90 transition-transform">
                  <Phone size={14} />
                </a>
                <button onClick={() => navigate(`/member/chat/${patron.id}`)} className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#00a651] active:scale-90 transition-transform">
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

      {/* ─── AREA DELEGATES: Searchable List ─── */}
      <div className="px-5">
        <SectionHeader titleHi={t('Area Delegates', language)} titleEn="Regional Delegates" language={language} />

        {/* Search bar */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('Search by name, role or area...', language)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 active:scale-95 transition-transform ${activeFilter !== 'All' ? 'bg-blue-50 border-blue-200 text-[#1e58b8]' : 'bg-white border-gray-250 text-gray-400'}`}
            >
              <SlidersHorizontal size={16} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-150 rounded-xl shadow-lg p-1.5 z-30 flex flex-col gap-0.5 text-[11px] font-extrabold w-[160px]">
                <button type="button" onClick={() => { setActiveFilter('All'); setShowFilterMenu(false); }} className={`p-2 text-left rounded-lg transition-colors ${activeFilter === 'All' ? 'bg-blue-50 text-[#1e58b8]' : 'text-gray-600 hover:bg-gray-50'}`}>सभी (All)</button>
                <button type="button" onClick={() => { setActiveFilter('Zonal Head'); setShowFilterMenu(false); }} className={`p-2 text-left rounded-lg transition-colors ${activeFilter === 'Zonal Head' ? 'bg-blue-50 text-[#1e58b8]' : 'text-gray-600 hover:bg-gray-50'}`}>क्षेत्रीय प्रभारी (Zonal)</button>
                <button type="button" onClick={() => { setActiveFilter('Area Sub-Head'); setShowFilterMenu(false); }} className={`p-2 text-left rounded-lg transition-colors ${activeFilter === 'Area Sub-Head' ? 'bg-blue-50 text-[#1e58b8]' : 'text-gray-600 hover:bg-gray-50'}`}>क्षेत्रीय प्रतिनिधि (Area)</button>
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 active:scale-95 transition-transform ${sortOrder !== 'none' ? 'bg-blue-50 border-blue-200 text-[#1e58b8]' : 'bg-white border-gray-250 text-gray-400'}`}
            >
              <ArrowUpDown size={16} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-155 rounded-xl shadow-lg p-1.5 z-30 flex flex-col gap-0.5 text-[11px] font-extrabold w-[150px]">
                <button type="button" onClick={() => { setSortOrder('none'); setShowSortMenu(false); }} className={`p-2 text-left rounded-lg transition-colors ${sortOrder === 'none' ? 'bg-blue-50 text-[#1e58b8]' : 'text-gray-600 hover:bg-gray-50'}`}>डिफ़ॉल्ट (Default)</button>
                <button type="button" onClick={() => { setSortOrder('name-asc'); setShowSortMenu(false); }} className={`p-2 text-left rounded-lg transition-colors ${sortOrder === 'name-asc' ? 'bg-blue-50 text-[#1e58b8]' : 'text-gray-600 hover:bg-gray-50'}`}>नाम: A से Z (Name A-Z)</button>
                <button type="button" onClick={() => { setSortOrder('name-desc'); setShowSortMenu(false); }} className={`p-2 text-left rounded-lg transition-colors ${sortOrder === 'name-desc' ? 'bg-blue-50 text-[#1e58b8]' : 'text-gray-600 hover:bg-gray-50'}`}>नाम: Z से A (Name Z-A)</button>
                <button type="button" onClick={() => { setSortOrder('members-desc'); setShowSortMenu(false); }} className={`p-2 text-left rounded-lg transition-colors ${sortOrder === 'members-desc' ? 'bg-blue-50 text-[#1e58b8]' : 'text-gray-600 hover:bg-gray-50'}`}>सदस्य संख्या (Members)</button>
              </div>
            )}
          </div>
        </div>

        {/* Delegate list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
          {filteredDelegates.length > 0 ? (
            filteredDelegates.map(m => (
              <DelegateRow 
                key={m.id} 
                member={m} 
                language={language} 
                isSelected={selectedLeader?.id === m.id}
                onSelect={() => handleSelectLeader(m.id)}
                navigate={navigate}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-[13px] text-gray-400">{t('No results found', language)}</p>
            </div>
          )}
        </div>
      </div>

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
