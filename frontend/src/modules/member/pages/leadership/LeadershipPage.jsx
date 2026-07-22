import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Crown, ChevronRight, MapPin,
  Users, Building, Building2, Globe, Home, CheckCircle,
  BookOpen, Heart, Shield, Star, Calendar, Landmark, MessageSquare
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

// ─── MOCK DATA STRUCTURES FOR CITIES & CABINET ─────────────────────────────────
const NATIONAL_LEADER = {
  id: 'national_pres',
  name: 'Shri Mohan Lal Agrawal',
  initials: 'MA',
  role: 'President',
  city: 'Indore',
  phone: '+91 98765 43210'
};

const CITIES_LEADERSHIP_DATA = {
  "Indore": {
    cityName: "Indore",
    cityLeader: { id: 'l_indore', name: 'Shri Mohan Lal Agrawal', initials: 'MA', role: 'President', city: 'Indore', phone: '+91 98765 43210' },
    members: [
      { id: 'm_indore_1', name: 'Shri Ramesh Chand Agrawal', initials: 'RA', role: 'Vice President', city: 'Indore', phone: '+91 98765 11111' },
      { id: 'm_indore_2', name: 'Shri Suresh Kumar Agrawal', initials: 'SA', role: 'Secretary', city: 'Indore', phone: '+91 98765 22222' },
      { id: 'm_indore_3', name: 'Shri Dinesh Kumar Agrawal', initials: 'DA', role: 'Joint Secretary', city: 'Indore', phone: '+91 98765 33334' },
      { id: 'm_indore_4', name: 'Shri Vinod Kumar Agrawal', initials: 'VA', role: 'Treasurer', city: 'Indore', phone: '+91 98765 33333' }
    ]
  },
  "Jaipur": {
    cityName: "Jaipur",
    cityLeader: { id: 'l_jaipur', name: 'Smt. Kamla Agrawal', initials: 'KA', role: 'President', city: 'Jaipur', phone: '+91 98765 43211' },
    members: [
      { id: 'm_jaipur_1', name: 'Shri Ramesh Chand Agrawal', initials: 'RA', role: 'Vice President', city: 'Jaipur', phone: '+91 98765 11111' },
      { id: 'm_jaipur_2', name: 'Shri Suresh Kumar Agrawal', initials: 'SA', role: 'Secretary', city: 'Jaipur', phone: '+91 98765 22222' },
      { id: 'm_jaipur_3', name: 'Shri Dinesh Kumar Agrawal', initials: 'DA', role: 'Joint Secretary', city: 'Jaipur', phone: '+91 98765 33334' },
      { id: 'm_jaipur_4', name: 'Shri Vinod Kumar Agrawal', initials: 'VA', role: 'Treasurer', city: 'Jaipur', phone: '+91 98765 33333' }
    ]
  },
  "Bhopal": {
    cityName: "Bhopal",
    cityLeader: { id: 'l_bhopal', name: 'Shri Kailash Agrawal', initials: 'KA', role: 'President', city: 'Bhopal', phone: '+91 98260 11223' },
    members: [
      { id: 'm_bhopal_1', name: 'Shri Omprakash Agrawal', initials: 'OA', role: 'Vice President', city: 'Bhopal', phone: '+91 98260 22334' },
      { id: 'm_bhopal_2', name: 'Shri Ramdev Agrawal', initials: 'RA', role: 'Secretary', city: 'Bhopal', phone: '+91 98260 33445' },
      { id: 'm_bhopal_3', name: 'Shri Hari Agrawal', initials: 'HA', role: 'Treasurer', city: 'Bhopal', phone: '+91 98260 44556' }
    ]
  },
  "Ujjain": {
    cityName: "Ujjain",
    cityLeader: { id: 'l_ujjain', name: 'Shri Ghanshyam Agrawal', initials: 'GA', role: 'President', city: 'Ujjain', phone: '+91 98930 44556' },
    members: [
      { id: 'm_ujjain_1', name: 'Shri Santosh Agrawal', initials: 'SA', role: 'Vice President', city: 'Ujjain', phone: '+91 98930 55667' },
      { id: 'm_ujjain_2', name: 'Shri Rajesh Agrawal', initials: 'RA', role: 'Secretary', city: 'Ujjain', phone: '+91 98930 66778' }
    ]
  },
  "Gwalior": {
    cityName: "Gwalior",
    cityLeader: { id: 'l_gwalior', name: 'Shri Omprakash Agrawal', initials: 'OA', role: 'President', city: 'Gwalior', phone: '+91 94251 11223' },
    members: [
      { id: 'm_gwalior_1', name: 'Shri Prakash Agrawal', initials: 'PA', role: 'Vice President', city: 'Gwalior', phone: '+91 94251 22334' },
      { id: 'm_gwalior_2', name: 'Shri Sunil Agrawal', initials: 'SA', role: 'Secretary', city: 'Gwalior', phone: '+91 94251 33445' }
    ]
  },
  "Jabalpur": {
    cityName: "Jabalpur",
    cityLeader: { id: 'l_jabalpur', name: 'Shri Madan Lal Agrawal', initials: 'MA', role: 'President', city: 'Jabalpur', phone: '+91 93000 11223' },
    members: [
      { id: 'm_jabalpur_1', name: 'Shri Vijay Agrawal', initials: 'VA', role: 'Vice President', city: 'Jabalpur', phone: '+91 93000 22334' },
      { id: 'm_jabalpur_2', name: 'Shri Rakesh Agrawal', initials: 'RA', role: 'Secretary', city: 'Jabalpur', phone: '+91 93000 33445' }
    ]
  }
};

const CABINET_MEMBERS_DATA = [
  // Indore
  { id: 'cab_1', name: 'Shri Ashok Kumar Agrawal', initials: 'AA', role: 'Minister (Education)', phone: '+91 98765 44444', city: 'Indore' },
  { id: 'cab_2', name: 'Shri Deepak Kumar Agrawal', initials: 'DA', role: 'Minister (Youth)', phone: '+91 98765 55555', city: 'Indore' },
  { id: 'cab_3', name: 'Smt. Seema Agrawal', initials: 'SA', role: 'Minister (Women Welfare)', phone: '+91 98765 66666', city: 'Indore' },
  { id: 'cab_4', name: 'Shri Mahesh Chand Agrawal', initials: 'MA', role: 'Minister (Social)', phone: '+91 98765 77777', city: 'Indore' },
  { id: 'cab_5', name: 'Shri Vinod Kumar Agrawal', initials: 'VA', role: 'Minister (Finance)', phone: '+91 98765 33333', city: 'Indore' },

  // Bhopal
  { id: 'cab_b1', name: 'Shri Kamal Agrawal', initials: 'KA', role: 'Minister (Education)', phone: '+91 98260 11223', city: 'Bhopal' },
  { id: 'cab_b2', name: 'Shri Ramakant Agrawal', initials: 'RA', role: 'Minister (Youth)', phone: '+91 98260 33445', city: 'Bhopal' },
  { id: 'cab_b3', name: 'Smt. Omprakash Agrawal', initials: 'OA', role: 'Minister (Women Welfare)', phone: '+91 98260 44556', city: 'Bhopal' },

  // Ujjain
  { id: 'cab_u1', name: 'Shri Santosh Agrawal', initials: 'SA', role: 'Minister (Education)', phone: '+91 98930 55667', city: 'Ujjain' },
  { id: 'cab_u2', name: 'Shri Rajesh Agrawal', initials: 'RA', role: 'Minister (Finance)', phone: '+91 98930 66778', city: 'Ujjain' },

  // Gwalior
  { id: 'cab_g1', name: 'Shri Prakash Agrawal', initials: 'PA', role: 'Minister (Youth)', phone: '+91 94251 22334', city: 'Gwalior' },
  { id: 'cab_g2', name: 'Shri Sunil Agrawal', initials: 'SA', role: 'Minister (Social)', phone: '+91 94251 33445', city: 'Gwalior' },

  // Jabalpur
  { id: 'cab_ja1', name: 'Shri Vijay Agrawal', initials: 'VA', role: 'Minister (Education)', phone: '+91 93000 22334', city: 'Jabalpur' },
  { id: 'cab_ja2', name: 'Shri Rakesh Agrawal', initials: 'RA', role: 'Minister (Finance)', phone: '+91 93000 33445', city: 'Jabalpur' },

  // Jaipur
  { id: 'cab_j1', name: 'Shri Ashok Kumar Sharma', initials: 'AS', role: 'Minister (Education)', phone: '+91 98290 12345', city: 'Jaipur' },
  { id: 'cab_j2', name: 'Shri Deepak Sharma', initials: 'DS', role: 'Minister (Youth)', phone: '+91 98290 23456', city: 'Jaipur' },
  { id: 'cab_j3', name: 'Smt. Seema Sharma', initials: 'SS', role: 'Minister (Women Welfare)', phone: '+91 98290 34567', city: 'Jaipur' }
];

const CITIES_LIST_DATA = [
  { id: 'indore', nameHi: 'इंदौर महानगर समिति', nameEn: 'Indore', icon: Building2, bg: 'bg-[#6C3BFF]', members: 185, seeds: ['c1','c2','c3'] },
  { id: 'bhopal', nameHi: 'भोपाल नगर समिति', nameEn: 'Bhopal', icon: Landmark, bg: 'bg-[#ff9f43]', members: 142, seeds: ['b1','b2','b3'] },
  { id: 'ujjain', nameHi: 'उज्जैन नगर समिति', nameEn: 'Ujjain', icon: Home, bg: 'bg-[#ff5252]', members: 95, seeds: ['u1','u2','u3'] },
  { id: 'gwalior', nameHi: 'ग्वालियर नगर समिति', nameEn: 'Gwalior', icon: Building, bg: 'bg-[#3380ff]', members: 78, seeds: ['g1','g2','g3'] },
  { id: 'jabalpur', nameHi: 'जबलपुर नगर समिति', nameEn: 'Jabalpur', icon: Globe, bg: 'bg-[#00a680]', members: 64, seeds: ['ja1','ja2','ja3'] },
  { id: 'jaipur', nameHi: 'जयपुर नगर समिति', nameEn: 'Jaipur', icon: Users, bg: 'bg-[#10b981]', members: 120, seeds: ['v1','v2','v3'] }
];

const STATS_DATA = [
  { id: 'members', labelHi: 'कुल सदस्य', labelEn: 'Total Members', value: 248756, suffix: '+', icon: Users, color: 'from-purple-500 to-violet-600' },
  { id: 'states', labelHi: 'राज्य', labelEn: 'States', value: 28, suffix: '', icon: Globe, color: 'from-orange-500 to-amber-600' },
  { id: 'districts', labelHi: 'जिले', labelEn: 'Districts', value: 350, suffix: '+', icon: Landmark, color: 'from-blue-500 to-cyan-600' },
  { id: 'villages', labelHi: 'ग्राम इकाइयाँ', labelEn: 'Village Units', value: 5000, suffix: '+', icon: Home, color: 'from-emerald-500 to-teal-600' },
];

const MISSION_PILLARS = [
  { icon: BookOpen, labelHi: 'शिक्षा', labelEn: 'Education', desc: 'ज्ञान and विकास', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
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
const LeaderHeroBanner = ({ city, onBack, navigate, hideHeader = false, activeCityDetail }) => {
  const leader = city 
    ? (CITIES_LEADERSHIP_DATA[city]?.cityLeader || NATIONAL_LEADER)
    : NATIONAL_LEADER;

  const isPresident = leader.role === 'President';
  const isPatron = leader.role === 'Patron';

  const roleDisplay = isPresident ? 'PRESIDENT' : isPatron ? 'PATRON' : leader.role.toUpperCase();
  const subDisplay = isPresident ? 'SAMAJ PRESIDENT' : isPatron ? 'SAMAJ PATRON' : `SAMAJ ${leader.role.toUpperCase()}`;

  const cityHindiMap = {
    'Indore': 'इंदौर',
    'Bhopal': 'भोपाल',
    'Ujjain': 'उज्जैन',
    'Gwalior': 'ग्वालियर',
    'Jabalpur': 'जबलपुर',
    'Jaipur': 'जयपुर'
  };
  const cityHindi = city ? (cityHindiMap[city] || city) : '';
  const title = city ? `${cityHindi} शहर` : 'समाज नेतृत्व';
  const subtitle = city ? `${city.toUpperCase()} CITY LEADERSHIP` : 'हमारा नेतृत्व, हमारा गौरव';

  return (
    <div className={`relative overflow-hidden ${city ? 'mx-[-8px] sm:mx-0 sm:rounded-[32px]' : ''}`} style={{ background: 'linear-gradient(135deg, #120b32 0%, #1e1145 50%, #2e1a6c 100%)' }}>
      <div className="relative z-10 px-2 pt-6 pb-5">
        
        {/* Header Row (Conditional) */}
        {!hideHeader && (
          <div className="flex items-center gap-3 mb-5 px-2 pt-4">
            {onBack && (
              <button onClick={onBack}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
            )}
            <div>
              <h1 className="text-white text-[20px] font-black tracking-tight">{title}</h1>
              <p className="text-purple-200/70 text-[11px] font-semibold mt-0.5">{subtitle}</p>
            </div>
          </div>
        )}

        {/* Hero Card Layout */}
        <div 
          onClick={() => navigate(`/member/directory/${leader.id}`, { state: { fromCity: activeCityDetail } })}
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
              <div className="h-[1px] bg-amber-400/25" />
              <div className="w-1 h-1 rotate-45 bg-amber-400/60" />
              <div className="h-[1px] bg-amber-400/25" />
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
                onClick={() => navigate(`/member/chat/member/${leader.id}`)}
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

// ─── REUSABLE MEMBER SLIDER CARD ──────────────────────────────────────────────
const MemberSliderCard = ({ member, navigate, activeCityDetail }) => {
  const colorMap = { 'Vice President': 'bg-[#7c3aed]', 'Secretary': 'bg-[#ff3b68]', 'Joint Secretary': 'bg-[#ff3b68]', 'Treasurer': 'bg-[#00a651]' };
  const badgeColor = colorMap[member.role] || getBadgeColor(member.role);
  const hindiMap = { 'Vice President': 'उपाध्यक्ष', 'Secretary': 'महासचिव', 'Joint Secretary': 'संगठन मंत्री', 'Treasurer': 'कोषाध्यक्ष' };
  const hindiRole = hindiMap[member.role] || getHindiRole(member.role);

  return (
    <div onClick={() => navigate(`/member/directory/${member.id}`, { state: { fromCity: activeCityDetail } })}
      className="shrink-0 w-[calc((100vw-36px)/3.25)] max-w-[105px] bg-white rounded-2xl flex flex-col items-center cursor-pointer transition-all duration-200 pb-2 border border-gray-100 hover:border-purple-200 hover:-translate-y-0.5 relative overflow-hidden"
    >
      <div className="w-full aspect-[3/3.1] overflow-hidden bg-gray-55 shrink-0 mb-1 pointer-events-none">
        <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
      </div>
      
      {/* Badge in-between image and name */}
      <span className={`text-white text-[6.5px] font-black px-1.5 py-0.5 rounded-md shadow-sm leading-none mb-1 shrink-0 ${badgeColor}`}>
        {hindiRole}
      </span>

      {/* Name text with reduced height/margin */}
      <h4 className="text-slate-900 text-[9px] font-extrabold text-center leading-tight mb-1 px-1 h-5 flex items-center justify-center truncate w-full">
        {member.name.replace(' Agrawal', '').replace(' Sharma', '').replace(' Patel', '').replace('Shri ', '')}
      </h4>

      {/* Shrink buttons and spacing */}
      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
        <button onClick={() => window.open(`tel:${member.phone || '9999999999'}`)}
          className="w-5.5 h-5.5 rounded-full border border-purple-200 flex items-center justify-center text-[#a855f7] hover:bg-purple-50 transition-colors"
        >
          <Phone size={9} />
        </button>
        <button onClick={() => navigate(`/member/chat/member/${member.id}`)}
          className="w-5.5 h-5.5 rounded-full border border-emerald-250 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <MessageCircle size={9} />
        </button>
      </div>
    </div>
  );
};

// ─── CABINET MEMBER CARD ──────────────────────────────────────────────────────
const CabinetMemberCard = ({ member, navigate, activeCityDetail }) => {
  const badgeColor = getBadgeColor(member.role);
  const hindiRole = getHindiRole(member.role);

  return (
    <div 
      onClick={() => navigate(`/member/directory/${member.id}`, { state: { fromCity: activeCityDetail } })}
      className="bg-white rounded-3xl p-3 border border-purple-100/55 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 cursor-pointer hover:border-purple-200 transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-55 shrink-0 border border-purple-100/50 shadow-sm">
          <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
        </div>
        <div className="min-w-0">
          <span className={`text-[6.5px] font-black text-white px-1.5 py-0.5 rounded-md leading-none ${badgeColor}`}>
            {hindiRole}
          </span>
          <h4 className="text-[11.5px] font-black text-slate-800 truncate mt-0.5 leading-tight">{member.name}</h4>
        </div>
      </div>
      
      <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center gap-1">
        <a href={`tel:${member.phone}`}
          className="w-6 h-6 rounded-lg border border-purple-100 flex items-center justify-center text-[#6C3BFF] hover:bg-purple-50 active:scale-95 transition-all"
          style={{ background: 'rgba(108,59,255,0.04)' }}>
          <Phone size={9.5} />
        </a>
        <a href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
          className="w-6 h-6 rounded-lg border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all"
          style={{ background: 'rgba(16,185,129,0.04)' }}>
          <MessageCircle size={9.5} className="text-emerald-500" />
        </a>
        <button onClick={() => navigate(`/member/chat/member/${member.id}`)}
          className="w-6 h-6 rounded-lg border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
          style={{ background: 'rgba(51,128,255,0.04)' }}>
          <MessageSquare size={9.5} className="text-blue-500" />
        </button>
      </div>
    </div>
  );
};

// ─── CITY CARD ────────────────────────────────────────────────────────────────
const CityCard = ({ data, onClick }) => {
  const { nameHi, nameEn, icon: Icon, bg, members, seeds } = data;
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }} 
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl p-4.5 border border-purple-100/50 shadow-[0_4px_16px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_8px_24px_rgba(108,59,255,0.06)] transition-all flex items-center justify-between gap-4"
    >
      {/* Left: Icon Container */}
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon size={22} color="#fff" strokeWidth={2} />
      </div>

      {/* Middle-Left: Titles */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-[12.5px] font-black text-slate-800 truncate leading-tight">{nameHi}</h4>
        <p className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{nameEn} City</p>
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
          onClick();
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

  const [activeCityDetail, setActiveCityDetail] = useState(
    location.state?.activeCityDetail || null
  );
  const [showAllCities, setShowAllCities] = useState(false);

  // Setup sliders refs
  const cityLeadersSliderRef = useRef(null);
  const userCitySliderRef = useRef(null);
  const detailCitySliderRef = useRef(null);

  const scrollSlider = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  const userCity = currentUser?.city || 'Indore';
  const userCityData = CITIES_LEADERSHIP_DATA[userCity] || CITIES_LEADERSHIP_DATA['Indore'];

  const allCityLeaders = Object.keys(CITIES_LEADERSHIP_DATA).map(key => CITIES_LEADERSHIP_DATA[key].cityLeader);
  const visibleCities = showAllCities ? CITIES_LIST_DATA : CITIES_LIST_DATA.slice(0, 4);

  // Handle back from detail view
  const handleBackToMain = () => {
    setActiveCityDetail(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing a specific city details view
  if (activeCityDetail) {
    const detailData = CITIES_LEADERSHIP_DATA[activeCityDetail];
    const cityCabinet = CABINET_MEMBERS_DATA.filter(m => m.city === activeCityDetail);

    return (
      <div className="min-h-screen pb-28" style={{ backgroundColor: '#F8F7FF' }}>
        {/* City Leader Hero Banner */}
        <LeaderHeroBanner city={activeCityDetail} onBack={handleBackToMain} navigate={navigate} hideHeader={false} activeCityDetail={activeCityDetail} />

        <div className="flex flex-col lg:flex-row gap-5 px-2 pt-5 max-w-5xl mx-auto">
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* City Office Bearers Slider */}
            {detailData && detailData.members && (
              <div>
                <SectionHeader 
                  titleHi={`${activeCityDetail} कार्यकारिणी`} 
                  subtitleEn={`${activeCityDetail} Office Bearers`} 
                />
                <div className="relative">
                  <div 
                    ref={detailCitySliderRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 items-stretch scroll-smooth"
                  >
                    {detailData.members.map(m => (
                      <MemberSliderCard key={m.id} member={m} navigate={navigate} activeCityDetail={activeCityDetail} />
                    ))}
                  </div>
                  <button 
                    onClick={() => scrollSlider(detailCitySliderRef)}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#6C3BFF] hover:border-purple-200 active:scale-90 transition-all z-20"
                  >
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* City Scoped Cabinet Ministers Grid */}
            {cityCabinet.length > 0 && (
              <div>
                <SectionHeader titleHi="मंत्रिमंडल" subtitleEn="Cabinet Ministers" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cityCabinet.map(m => (
                    <CabinetMemberCard key={m.id} member={m} navigate={navigate} activeCityDetail={activeCityDetail} />
                  ))}
                </div>
              </div>
            )}

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
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#F8F7FF' }}>

      {/* 1. Main Leader Hero Banner (overall national top leader) */}
      <LeaderHeroBanner city={null} onBack={() => navigate(-1)} navigate={navigate} hideHeader={false} activeCityDetail={activeCityDetail} />

      {/* 2-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-5 px-2 pt-5 max-w-5xl mx-auto">

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* 2. City Leaders Slider (NEW) */}
          <div>
            <SectionHeader titleHi="शहर अध्यक्ष" subtitleEn="City Presidents" />
            <div className="relative">
              <div 
                ref={cityLeadersSliderRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 items-stretch scroll-smooth"
              >
                {allCityLeaders.map(m => (
                  <MemberSliderCard key={m.id} member={m} navigate={navigate} activeCityDetail={activeCityDetail} />
                ))}
              </div>
              <button 
                onClick={() => scrollSlider(cityLeadersSliderRef)}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#6C3BFF] hover:border-purple-200 active:scale-90 transition-all z-20"
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* 3. "Your City" Leader Section (NEW) */}
          <div className="space-y-4">
            {/* Scoped city president card with integrated header (hideHeader={false}) */}
            <LeaderHeroBanner city={userCity} navigate={navigate} hideHeader={false} activeCityDetail={activeCityDetail} />
            
            {/* Scoped city office-bearers slider */}
            <div className="relative">
              <div 
                ref={userCitySliderRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 items-stretch scroll-smooth"
              >
                {userCityData.members.map(m => (
                  <MemberSliderCard key={m.id} member={m} navigate={navigate} activeCityDetail={activeCityDetail} />
                ))}
              </div>
              <button 
                onClick={() => scrollSlider(userCitySliderRef)}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#6C3BFF] hover:border-purple-200 active:scale-90 transition-all z-20"
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* 4. "Our Organization" Section */}
          <div>
            <SectionHeader 
              titleHi="हमारा संगठन" 
              subtitleEn="समाज की एक मजबूत संरचना" 
              action={{ 
                label: showAllCities ? "कम देखें" : "सभी देखें", 
                onClick: () => setShowAllCities(!showAllCities) 
              }} 
            />
            <div className="flex flex-col gap-3">
              {visibleCities.map((data) => (
                <CityCard 
                  key={data.id} 
                  data={data} 
                  onClick={() => {
                    setActiveCityDetail(data.nameEn);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              ))}
            </div>
          </div>



          {/* Community Strength (Stats) */}
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
