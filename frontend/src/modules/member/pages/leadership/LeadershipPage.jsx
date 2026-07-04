import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Crown, ChevronRight, MapPin,
  Users, Building, Building2, Globe, Home, CheckCircle,
  BookOpen, Heart, Shield, Star, Calendar, Landmark
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataProvider';
import { mockAdmins } from '../../data/mockUsers';

// ─── ROLE HELPERS ─────────────────────────────────────────────────────────────
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

const getBadgeColor = (role) => {
  if (role === 'President') return 'bg-[#f08c35]';
  if (role === 'Patron') return 'bg-amber-600';
  if (role === 'Vice President') return 'bg-[#7c3aed]';
  if (role === 'Secretary') return 'bg-[#ff3b68]';
  if (role === 'Joint Secretary') return 'bg-[#ff3b68]';
  if (role === 'Treasurer') return 'bg-[#00a651]';
  return 'bg-[#ff3b68]';
};

const COMMITTEE_DATA = [
  { id: 'state', nameHi: 'मध्यप्रदेश राज्य समिति', nameEn: 'State Committee', icon: Globe, gradient: 'from-blue-500 to-blue-700', members: 18532, seeds: ['s1','s2','s3'], extra: 45 },
  { id: 'division', nameHi: 'इंदौर संभाग समिति', nameEn: 'Division Committee', icon: Building, gradient: 'from-indigo-500 to-indigo-700', members: 3245, seeds: ['d1','d2','d3'], extra: 12 },
  { id: 'district', nameHi: 'इंदौर जिला समिति', nameEn: 'District Committee', icon: Landmark, gradient: 'from-rose-500 to-rose-700', members: 582, seeds: ['di1','di2','di3'], extra: 8 },
  { id: 'city', nameHi: 'इंदौर शहर समिति', nameEn: 'City Committee', icon: Building2, gradient: 'from-orange-500 to-orange-700', members: 185, seeds: ['c1','c2','c3'], extra: 5 },
  { id: 'tehsil', nameHi: 'सांवेर तहसील समिति', nameEn: 'Tehsil Committee', icon: Home, gradient: 'from-teal-500 to-teal-700', members: 76, seeds: ['t1','t2','t3'], extra: 3 },
  { id: 'village', nameHi: 'ग्राम समिति', nameEn: 'Village Committee', icon: Users, gradient: 'from-emerald-500 to-emerald-700', members: 32, seeds: ['v1','v2','v3'], extra: 2 },
];

const STATS_DATA = [
  { id: 'members', labelHi: 'कुल सदस्य', labelEn: 'Total Members', value: 248756, suffix: '+', icon: Users, color: 'from-purple-500 to-violet-600' },
  { id: 'states', labelHi: 'राज्य', labelEn: 'States', value: 28, suffix: '', icon: Globe, color: 'from-orange-500 to-amber-600' },
  { id: 'districts', labelHi: 'जिले', labelEn: 'Districts', value: 350, suffix: '+', icon: Landmark, color: 'from-blue-500 to-cyan-600' },
  { id: 'villages', labelHi: 'ग्राम इकाइयाँ', labelEn: 'Village Units', value: 5000, suffix: '+', icon: Home, color: 'from-emerald-500 to-teal-600' },
];

const MISSION_PILLARS = [
  { icon: BookOpen, labelHi: 'शिक्षा', labelEn: 'Education', desc: 'ज्ञान और विकास', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Heart, labelHi: 'सेवा', labelEn: 'Service', desc: 'समाज की सेवा', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  { icon: Shield, labelHi: 'विकास', labelEn: 'Development', desc: 'सतत प्रगति', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Star, labelHi: 'एकता', labelEn: 'Unity', desc: 'एक समाज, एक लक्ष्य', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

// ─── COUNT-UP HOOK ────────────────────────────────────────────────────────────
const useCountUp = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const timer = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / totalFrames, 3);
      setCount(Math.floor(eased * target));
      if (frame >= totalFrames) { setCount(target); clearInterval(timer); }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
};

// ─── HINDI NAME HELPER ────────────────────────────────────────────────────────
const getHindiName = (name) => {
  if (name === 'Seth Govindram Agrawal') return 'सेठ गोविंदराम अग्रवाल';
  if (name === 'Seth Kirodimal Agrawal') return 'सेठ किरोड़ीमल अग्रवाल';
  if (name === 'Shri Mohan Lal Agrawal') return 'श्री मोहन लाल अग्रवाल';
  if (name === 'Smt. Kamla Agrawal') return 'श्रीमती कमला अग्रवाल';
  if (name === 'Shri Ramesh Chand Agrawal') return 'श्री रमेश चंद्र अग्रवाल';
  if (name === 'Shri Suresh Kumar Agrawal') return 'श्री सुरेश कुमार अग्रवाल';
  if (name === 'Shri Dinesh Kumar Agrawal') return 'श्री दिनेश कुमार अग्रवाल';
  if (name === 'Shri Vinod Kumar Agrawal') return 'श्री विनोद कुमार अग्रवाल';
  if (name === 'Shri Ashok Kumar Agrawal') return 'श्री अशोक कुमार अग्रवाल';
  if (name === 'Shri Deepak Kumar Agrawal') return 'श्री दीपक कुमार अग्रवाल';
  if (name === 'Smt. Seema Agrawal') return 'श्रीमती सीमा अग्रवाल';
  if (name === 'Shri Mahesh Chand Agrawal') return 'श्री महेश चंद्र अग्रवाल';
  if (name === 'Shri Ramakant Agrawal') return 'श्री रमाकांत अग्रवाल';
  if (name === 'Shri Kamal Agrawal') return 'श्री कमल अग्रवाल';
  if (name === 'Shri Prakashchand Agrawal') return 'श्री प्रकाशचंद्र अग्रवाल';
  if (name === 'Smt. Omprakash Agrawal') return 'श्रीमती ओमप्रकाश अग्रवाल';
  if (name === 'Shri Shankar Lal Agrawal') return 'श्री शंकर लाल अग्रवाल';
  if (name === 'Shri Govind Agrawal') return 'श्री गोविंद अग्रवाल';
  if (name === 'Shri Bhanwarlal Agrawal') return 'श्री भंवरलाल अग्रवाल';
  return name;
};

// ─── PREMIUM HERO BANNER ──────────────────────────────────────────────────────
const HeroBanner = ({ leader, onBack, navigate }) => {
  if (!leader) return null;
  const isPresident = leader.role === 'President';
  const isPatron = leader.role === 'Patron';

  const roleDisplay = isPresident ? 'PRESIDENT' : isPatron ? 'PATRON' : leader.role.toUpperCase();
  const subDisplay = isPresident ? 'SAMAJ PRESIDENT' : isPatron ? 'SAMAJ PATRON' : `SAMAJ ${leader.role.toUpperCase()}`;

  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #120b32 0%, #1e1145 50%, #2e1a6c 100%)' }}>
      <div className="relative z-10 px-2 pt-12 pb-5">
        {/* Header Row */}
        <div className="flex items-center gap-3 mb-5 px-2">
          <button onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-white text-[20px] font-black tracking-tight">समाज नेतृत्व</h1>
            <p className="text-purple-200/70 text-[11px] font-semibold mt-0.5">हमारा नेतृत्व, हमारा गौरव</p>
          </div>
        </div>

        {/* Hero Card styled exactly like HomePage President Card */}
        <div 
          onClick={() => navigate(`/member/directory/${leader.id}`)}
          className="relative w-full rounded-[24px] bg-gradient-to-r from-[#1e1145] via-[#2d1b69] to-[#4C1D95] shadow-xl shadow-purple-500/10 border border-purple-400/10 overflow-hidden py-9 px-4 shrink-0 cursor-pointer active:scale-[0.99] transition-all duration-300"
        >
          {/* Dark overlay backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e1145] via-[#2d1b69]/70 via-[#2d1b69]/15 to-transparent pointer-events-none z-0" />

          {/* Blended portrait on top of overlay */}
          <img 
            src={`https://i.pravatar.cc/300?u=${leader.initials}`} 
            className="absolute right-0 top-0 bottom-0 w-[58%] h-full object-cover object-[center_30%] pointer-events-none z-10" 
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, black 45%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, black 45%)'
            }}
            alt={leader.name} 
          />

          {/* Left content */}
          <div className="relative z-20 flex flex-col justify-between h-full max-w-[52%]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400/60 flex items-center justify-center bg-black/20 shadow-sm shrink-0">
                <Crown size={14} className="text-amber-400 fill-amber-400" />
              </div>
              <span className="bg-purple-500/80 backdrop-blur-sm text-white text-[7.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-purple-400/30">
                {roleDisplay}
              </span>
            </div>

            <div className="mt-3">
              <h4 className="text-white text-[15.5px] font-black leading-tight tracking-tight drop-shadow-sm">
                {leader.name}
              </h4>
              <p className="text-amber-300/90 text-[9.5px] font-extrabold mt-0.5 uppercase tracking-wide">
                {subDisplay}
              </p>
            </div>

            {/* Golden Separator */}
            <div className="flex items-center gap-1.5 my-2.5 w-28">
              <div className="h-[1px] flex-1 bg-amber-400/25" />
              <div className="w-1 h-1 rotate-45 bg-amber-400/60" />
              <div className="h-[1px] flex-1 bg-amber-400/25" />
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-white/90 text-[9px] font-bold mb-3.5">
              <MapPin size={10} className="text-white/70 shrink-0" />
              <span>{leader.city}, Madhya Pradesh</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full max-w-[160px]" onClick={(e) => e.stopPropagation()}>
              <a 
                href={`tel:${leader.phone}`}
                className="flex-1 py-1.5 rounded-xl border border-purple-300/30 hover:bg-white/5 text-white text-[9px] font-black flex items-center justify-center gap-1.5 active:scale-95 transition-transform text-center backdrop-blur-sm"
              >
                <Phone size={10} /> Call
              </a>
              <button 
                onClick={() => navigate(`/member/chat/${leader.id}`)}
                className="flex-1 py-1.5 rounded-xl border border-emerald-300/30 hover:bg-white/5 text-white text-[9px] font-black flex items-center justify-center gap-1.5 active:scale-95 transition-transform backdrop-blur-sm"
              >
                <MessageCircle size={10} /> Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CORE COMMITTEE CARD ──────────────────────────────────────────────────────
const CoreCommitteeCard = ({ member, isSelected, onSelect }) => {
  const colorMap = { 'Vice President': 'bg-[#7c3aed]', 'Secretary': 'bg-[#ff3b68]', 'Joint Secretary': 'bg-[#ff3b68]', 'Treasurer': 'bg-[#00a651]' };
  const badgeColor = colorMap[member.role] || getBadgeColor(member.role);
  const hindiMap = { 'Vice President': 'उपाध्यक्ष', 'Secretary': 'महासचिव', 'Joint Secretary': 'संगठन मंत्री', 'Treasurer': 'कोषाध्यक्ष' };
  const hindiRole = hindiMap[member.role] || getHindiRole(member.role);

  return (
    <div onClick={onSelect}
      className={`shrink-0 w-[calc((100vw-36px)/4.25)] max-w-[85px] bg-white rounded-2xl flex flex-col items-center cursor-pointer transition-all duration-200 pb-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border ${
        isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-100 hover:border-purple-200 hover:-translate-y-0.5'
      }`}>
      <div className="w-full aspect-[3/3.2] overflow-hidden bg-gray-55 shrink-0 mb-2 relative rounded-t-2xl">
        <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
        <div className="absolute top-1.5 left-1.5">
          <span className={`text-white text-[7px] font-bold px-1.5 py-0.5 rounded-md shadow-sm leading-none ${badgeColor}`}>{hindiRole}</span>
        </div>
      </div>
      <h4 className="text-slate-900 text-[9.5px] font-extrabold text-center leading-tight mb-1.5 px-1 h-7 flex items-center justify-center">
        {member.name.replace(' Agrawal', '').replace(' Sharma', '').replace(' Patel', '').replace('Shri ', '')}
      </h4>
      <div onClick={(e) => e.stopPropagation()}>
        <button onClick={() => window.open(`tel:${member.phone || '9999999999'}`)}
          className="w-7 h-7 rounded-full border border-purple-200 flex items-center justify-center text-[#a855f7] hover:bg-purple-50 transition-colors">
          <Phone size={12} />
        </button>
      </div>
    </div>
  );
};

// ─── COMMITTEE CARD ───────────────────────────────────────────────────────────
const CommitteeCard = ({ data, navigate }) => {
  const { icon: Icon, nameHi, nameEn, members, seeds } = data;

  const colorMap = {
    'State Committee': { bg: 'bg-[#6C3BFF]', icon: Globe },
    'Division Committee': { bg: 'bg-[#ff9f43]', icon: Building },
    'District Committee': { bg: 'bg-[#ff5252]', icon: MapPin },
    'City Committee': { bg: 'bg-[#3380ff]', icon: Building2 },
    'Tehsil Committee': { bg: 'bg-[#00a680]', icon: Home },
    'Village Committee': { bg: 'bg-[#10b981]', icon: Users }
  };

  const theme = colorMap[nameEn] || { bg: 'bg-purple-600', icon: Icon };
  const TargetIcon = theme.icon;

  return (
    <motion.div 
      onClick={() => navigate('/member/directory/list', { state: { filterType: 'committee', filterVal: nameEn } })}
      whileHover={{ y: -2, scale: 1.01 }} 
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl p-4.5 border border-purple-100/50 shadow-[0_4px_16px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_8px_24px_rgba(108,59,255,0.06)] transition-all flex items-center justify-between gap-4"
    >
      {/* Left: Icon Container */}
      <div className={`w-12 h-12 rounded-2xl ${theme.bg} flex items-center justify-center shrink-0 shadow-sm`}>
        <TargetIcon size={22} color="#fff" strokeWidth={2} />
      </div>

      {/* Middle-Left: Titles */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-[12.5px] font-black text-slate-800 truncate leading-tight">{nameHi}</h4>
        <p className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{nameEn}</p>
      </div>

      {/* Middle: Avatar list */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2">
        {seeds.slice(0, 3).map((seed) => (
          <div key={seed} className="w-8 h-8 rounded-lg overflow-hidden border border-gray-150 shadow-sm shrink-0">
            <img src={`https://i.pravatar.cc/100?u=${seed}`} className="w-full h-full object-cover" alt="" />
          </div>
        ))}
      </div>

      {/* Middle-Right: Member count inside bubble chip */}
      <div className="shrink-0 flex items-center gap-1.5 bg-slate-50/60 px-2.5 py-1.5 rounded-xl border border-gray-100/50">
        <Users size={11} className="text-gray-450 shrink-0" />
        <div className="leading-none">
          <p className="text-[7.5px] text-gray-400 font-bold uppercase tracking-wider">कुल सदस्य</p>
          <p className="text-[10.5px] font-extrabold text-slate-700 mt-0.5">{members.toLocaleString('en-IN')}+</p>
        </div>
      </div>

      {/* Right: View All button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          navigate('/member/directory/list', { state: { filterType: 'committee', filterVal: nameEn } });
        }}
        className="shrink-0 py-2 px-3.5 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all active:scale-95 shadow-sm shadow-purple-500/5"
        style={{ background: 'rgba(108,59,255,0.06)', color: '#6C3BFF', border: '1px solid rgba(108,59,255,0.12)' }}
      >
        View All <ChevronRight size={10} strokeWidth={3} />
      </button>
    </motion.div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ stat }) => {
  const { count, ref } = useCountUp(stat.value);
  const Icon = stat.icon;
  const fmt = (n) => {
    if (n >= 100000) return (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  };
  return (
    <motion.div ref={ref} whileHover={{ scale: 1.03, y: -3 }} transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl p-4.5 border border-purple-50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col items-center text-center relative overflow-hidden">
      {/* Decorative vertical top stripe */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.color}`} />
      
      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2.5 shadow-md`}>
        <Icon size={20} color="#fff" strokeWidth={2.2} />
      </div>
      <p className="text-[21px] font-black text-slate-800 leading-none tracking-tight">{fmt(count)}{stat.suffix}</p>
      <p className="text-[11px] font-black text-slate-700 mt-1.5">{stat.labelHi}</p>
      <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{stat.labelEn}</p>
    </motion.div>
  );
};

// ─── MISSION SECTION ──────────────────────────────────────────────────────────
const MissionSection = () => (
  <div className="rounded-[32px] overflow-hidden relative"
    style={{ 
      background: 'linear-gradient(135deg, #0e072b 0%, #170d3e 60%, #221258 100%)', 
      border: '1.5px solid rgba(124,58,237,0.25)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
    }}>
    {/* Background ambient orbs */}
    <div className="absolute top-0 right-0 w-44 h-44 rounded-full pointer-events-none opacity-20"
      style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)', filter: 'blur(20px)' }} />
    <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full pointer-events-none opacity-25"
      style={{ background: 'radial-gradient(circle, #6c3bff 0%, transparent 70%)', filter: 'blur(15px)' }} />

    <div className="px-5 py-5.5 relative z-10">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-purple-200/80 text-[9px] font-black uppercase tracking-widest">हमारा लक्ष्य और विचार</p>
      </div>
      <h3 className="text-white text-[13.5px] font-black leading-snug mb-4">शिक्षा, सेवा, विकास और एकता को बढ़ावा देकर समाज को एक सूत्र में बांधना।</h3>
      
      <div className="grid grid-cols-2 gap-2.5">
        {MISSION_PILLARS.map(({ icon: Icon, labelHi, labelEn, desc, color, bg }) => (
          <div key={labelHi} className={`rounded-2xl p-3 border backdrop-blur-md transition-transform hover:scale-[1.02] duration-200 ${bg}`}
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={14} className={`${color} shrink-0`} />
              <p className="text-white text-[11px] font-black leading-none">{labelHi}</p>
            </div>
            <p className="text-purple-200/50 text-[8px] font-bold uppercase tracking-wider">{labelEn}</p>
            <p className="text-purple-200/40 text-[8px] mt-1.5 leading-snug">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const SectionHeader = ({ titleHi, subtitleEn, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-start gap-2">
      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#6C3BFF] to-[#8B5CFF] mt-0.5 shrink-0" />
      <div>
        <h3 className="text-[15.5px] font-black text-slate-800 tracking-tight leading-none">{titleHi}</h3>
        {subtitleEn && <p className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider mt-1">{subtitleEn}</p>}
      </div>
    </div>
    {action && (
      <button onClick={action.onClick}
        className="text-[9px] font-black uppercase tracking-wider text-[#6C3BFF] bg-purple-50/80 px-3 py-1 rounded-lg border border-purple-100 flex items-center gap-0.5 active:scale-95 transition-all shadow-sm shadow-purple-500/5"
      >
        {action.label} <ChevronRight size={11} strokeWidth={3} />
      </button>
    )}
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const LeadershipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useData();

  const sliderRef = useRef(null);
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  const cityAdmins = mockAdmins.filter(a => a.city === currentUser.city);
  const patron = cityAdmins.find(a => a.role === 'Patron');
  const president = cityAdmins.find(a => a.role === 'President');
  const coreCommittee = cityAdmins.filter(a => ['Vice President', 'Secretary', 'Joint Secretary', 'Treasurer'].includes(a.role));

  const [selectedId, setSelectedId] = useState(
    location.state?.selectedId || president?.id || patron?.id || cityAdmins[0]?.id || null
  );

  useEffect(() => {
    if (location.state?.selectedId) {
      setSelectedId(location.state.selectedId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.selectedId]);

  const selectedLeader = cityAdmins.find(a => a.id === selectedId) || president || patron || cityAdmins[0];

  const handleSelectLeader = (id) => {
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#F8F7FF' }}>

      {/* HERO BANNER */}
      <HeroBanner leader={selectedLeader} onBack={() => navigate(-1)} navigate={navigate} />

      {/* 2-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-5 px-2 pt-5 max-w-5xl mx-auto">

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* राष्ट्रीय कार्यकारिणी */}
          {coreCommittee.length > 0 && (
            <div>
              <SectionHeader titleHi="राष्ट्रीय कार्यकारिणी" subtitleEn="Core Committee"
                action={{ label: 'सभी देखें', onClick: () => navigate('/member/directory/list') }} />
              <div className="relative">
                <div 
                  ref={sliderRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 items-stretch scroll-smooth"
                >
                  {coreCommittee.map(m => (
                    <CoreCommitteeCard key={m.id} member={m}
                      isSelected={selectedLeader?.id === m.id}
                      onSelect={() => handleSelectLeader(m.id)} />
                  ))}
                </div>
                
                {/* Floating Scroll Arrow */}
                <button 
                  onClick={scrollRight}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#6C3BFF] hover:border-purple-200 active:scale-90 transition-all z-20"
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}

          {/* हमारा संगठन */}
          <div>
            <SectionHeader titleHi="हमारा संगठन" subtitleEn="समाज की एक मजबूत संरचना" />
            <div className="flex flex-col gap-3">
              {COMMITTEE_DATA.map((data, idx) => (
                <motion.div key={data.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}>
                  <CommitteeCard data={data} navigate={navigate} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* समाज की ताकत */}
          <div>
            <SectionHeader titleHi="समाज की ताकत" subtitleEn="Community Strength" />
            <div className="grid grid-cols-2 gap-3">
              {STATS_DATA.map(stat => <StatCard key={stat.id} stat={stat} />)}
            </div>
          </div>

          {/* Mission */}
          <MissionSection />

          {/* Footer */}
          <div className="text-center py-4">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-200/40 to-transparent mb-4" />
            <p className="text-[10px] text-gray-400">{currentUser.community} · {currentUser.city}</p>
            <p className="text-[9px] text-gray-300 mt-0.5">अंतिम अपडेट · जून 2026</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeadershipPage;
