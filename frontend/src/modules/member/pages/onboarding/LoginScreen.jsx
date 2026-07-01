import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Phone, ArrowRight, ArrowLeft, MapPin, Users, CheckCircle,
  User, Camera, LogIn, UserPlus, Bell, Mail, ChevronRight, Check,
  Clock, ShieldCheck, GraduationCap, Briefcase, FileText, Sparkles,
  ChevronDown, PlusCircle, CheckCircle2, Lock, Eye, AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataProvider';

// ─── MOCK NESTED DATA ────────────────────────────────────────────────────────
const communityData = {
  'Agrawal Samaj': {
    subCommunities: ['Bisa Agrawal', 'Dasa Agrawal', 'Maheshwari', 'Oswal', 'Porwal'],
    cities: ['Indore', 'Ujjain', 'Bhopal', 'Jaipur', 'Ratlam', 'Gwalior', 'Sagar']
  },
  'Jain Samaj': {
    subCommunities: ['Digambar', 'Shwetambar', 'Sthanakvasi', 'Terapanthi'],
    cities: ['Mumbai', 'Surat', 'Pune', 'Ahmedabad', 'Jaipur', 'Indore', 'Delhi']
  },
  'Gupta Samaj': {
    subCommunities: ['Vaishya Gupta', 'Kayastha Gupta', 'Kshatriya Gupta'],
    cities: ['Delhi', 'Lucknow', 'Kanpur', 'Agra', 'Allahabad', 'Varanasi']
  },
  'Sharma Samaj': {
    subCommunities: ['Gaur Brahmin', 'Saraswat Brahmin', 'Kanyakubja', 'Maithil Brahmin'],
    cities: ['Jaipur', 'Delhi', 'Udaipur', 'Ajmer', 'Jodhpur', 'Bhopal', 'Nagpur']
  },
  'Patel Samaj': {
    subCommunities: ['Kadava Patel', 'Leuva Patel', 'Anjana Patel', 'Bhavssar Patel'],
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Anand', 'Gandhinagar']
  },
  'Mali Samaj': {
    subCommunities: ['Phul Mali', 'Kachhi Mali', 'Dhakad Mali', 'Teli Mali'],
    cities: ['Ujjain', 'Dewas', 'Ratlam', 'Indore', 'Bhopal', 'Mandsaur']
  },
  'Verma Samaj': {
    subCommunities: ['Kayastha Verma', 'Kshatriya Verma', 'Kurmi Verma'],
    cities: ['Lucknow', 'Kanpur', 'Gorakhpur', 'Agra', 'Delhi', 'Bhopal']
  }
};

const COMMUNITY_KEYS = Object.keys(communityData);
const SESSION_KEY = 'merisamaj_onboarding';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const saveSession = (data) => {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch (_) {}
};
const loadSession = () => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}'); } catch (_) { return {}; }
};
const clearSession = () => {
  try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
};

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
const StepIndicator = ({ current, total, labels }) => (
  <div className="px-6 pt-3 pb-3 bg-white/40 backdrop-blur-md border-b border-purple-100/30">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-bold text-brand-primary">Step {current} of {total}</p>
      <p className="text-xs font-semibold text-text-secondary">{labels[current - 1]}</p>
    </div>
    <div className="flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i < current ? 'bg-gradient-to-r from-brand-primary to-brand-glow shadow-sm shadow-purple-200' : 'bg-purple-200/40'
          }`}
        />
      ))}
    </div>
  </div>
);

// ─── SLIDE WRAPPER ────────────────────────────────────────────────────────────
const SlideIn = ({ children, dir = 'right' }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);
  const from = dir === 'right' ? 'translate-x-6' : '-translate-x-6';
  return (
    <div className={`transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-x-0' : `opacity-0 ${from}`}`}>
      {children}
    </div>
  );
};

// ─── OTP NOTIFICATION BANNER ──────────────────────────────────────────────────
const OtpBanner = ({ code, onDismiss }) => (
  <div className="fixed top-4 left-4 right-4 z-50 bg-[#1e1145]/95 text-white rounded-2xl p-4 shadow-[0_8px_32px_rgba(124,58,237,0.25)] border border-purple-500/20 backdrop-blur-xl animate-slide-in flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 animate-pulse-glow">
      <Bell size={18} className="animate-wiggle" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-bold text-purple-300 tracking-wide uppercase">Security Verification</p>
      <p className="text-sm font-medium mt-1 text-purple-50">
        Your verification code is{' '}
        <strong className="text-brand-accent text-base font-black tracking-widest bg-white/10 px-2 py-0.5 rounded ml-1 border border-white/10 shadow-inner">{code}</strong>
      </p>
      <p className="text-[10px] text-purple-300/60 mt-1">Do not share this code with anyone.</p>
    </div>
    <button onClick={onDismiss} className="text-xs font-bold text-purple-200 hover:text-white px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-xl press-scale border border-white/5 transition-all">Dismiss</button>
  </div>
);

// ─── CUSTOM SELECT DROPDOWN ───────────────────────────────────────────────────
const CustomSelect = ({ value, onChange, options, placeholder = 'Select', disabled = false, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const btnRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click/touch
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  const handleOpen = () => {
    if (disabled) return;
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropHeight = Math.min(options.length * 44 + 8, 220);
      const showAbove = spaceBelow < dropHeight + 8;
      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        ...(showAbove
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    }
    setOpen(o => !o);
  };

  const selected = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const selectedLabel = selected ? (typeof selected === 'string' ? selected : selected.label) : null;

  const dropdownList = open && (
    <div
      ref={listRef}
      style={dropdownStyle}
      className="bg-white border border-purple-100 rounded-2xl shadow-2xl shadow-purple-500/15 overflow-hidden"
    >
      <div className="max-h-52 overflow-y-auto py-1">
        {options.map((opt, i) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          const isSelected = val === value;
          return (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(val); setOpen(false); }}
              onTouchEnd={(e) => { e.preventDefault(); onChange(val); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-brand-primary text-white font-semibold'
                  : 'text-text-primary hover:bg-purple-50 hover:text-brand-primary'
              }`}
            >
              {label}
              {isSelected && <Check size={14} className="shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`w-full flex items-center justify-between border rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none transition-all ${
          disabled
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            : open
            ? 'bg-white border-brand-primary ring-4 ring-brand-primary/5'
            : 'bg-white/95 border-purple-200 text-text-primary cursor-pointer hover:bg-white hover:border-purple-300'
        }`}
      >
        <span className={selectedLabel ? 'text-text-primary' : 'text-gray-400'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown size={15} className={`shrink-0 text-text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? createPortal(dropdownList, document.body) : null}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const LoginScreen = () => {
  const navigate = useNavigate();
  const { loginUser } = useData();
  const inputRefs = useRef([]);

  const [step, setStep] = useState('landing');
  const [loginMethod, setLoginMethod] = useState('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpBanner, setShowOtpBanner] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Selection step details
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedSubCommunity, setSelectedSubCommunity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');

  // Profile Details & Verification states
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  
  // Education
  const [qualification, setQualification] = useState('');
  const [school, setSchool] = useState('');

  // Profession
  const [profession, setProfession] = useState('');
  const [company, setCompany] = useState('');

  // Address
  const [detailedAddress, setDetailedAddress] = useState('');

  // Contact
  const [alternateEmail, setAlternateEmail] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');

  // Family
  const [familyMembers, setFamilyMembers] = useState([]);
  const [tempFamilyName, setTempFamilyName] = useState('');
  const [tempFamilyRelation, setTempFamilyRelation] = useState('');
  const [tempFamilyAge, setTempFamilyAge] = useState('');

  // Other Documents
  const [panCard, setPanCard] = useState('');
  
  // Verification states
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  
  // Modals for verification simulation
  const [showAadharModal, setShowAadharModal] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [aadharNumber, setAadharNumber] = useState('');
  const [verifyingAadhar, setVerifyingAadhar] = useState(false);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [selfieSnapped, setSelfieSnapped] = useState(false);

  // Expandable sections management
  const [expandedSection, setExpandedSection] = useState(null); // null | 'personal' | 'education' | 'profession' | 'address' | 'contact' | 'family' | 'documents'

  const [slideDir, setSlideDir] = useState('right');

  // Restore sessionStorage on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved.community) setSelectedCommunity(saved.community);
    if (saved.subCommunity) setSelectedSubCommunity(saved.subCommunity);
    if (saved.city) setSelectedCity(saved.city);
  }, []);

  // Persist on change
  useEffect(() => {
    if (selectedCommunity || selectedSubCommunity || selectedCity) {
      saveSession({ community: selectedCommunity, subCommunity: selectedSubCommunity, city: selectedCity });
    }
  }, [selectedCommunity, selectedSubCommunity, selectedCity]);

  const sampleUsers = [
    { id: 'mock-u1', name: 'Rajesh Agrawal', phone: '+91 98765 43210', email: 'rajesh.agrawal@email.com', initials: 'RA', community: 'Agrawal Samaj', subCommunity: 'Bisa Agrawal', city: 'Indore', profession: 'Business Owner', company: 'Agrawal Traders Pvt. Ltd.', age: 34, gender: 'Male', familyMembers: [{ id: 'f1', name: 'Sunita Agrawal', relation: 'Wife', age: 31, initials: 'SA' }, { id: 'f2', name: 'Aarav Agrawal', relation: 'Son', age: 8, initials: 'AA' }, { id: 'f3', name: 'Priya Agrawal', relation: 'Daughter', age: 5, initials: 'PA' }] },
    { id: 'mock-u2', name: 'Dr. Neha Jain', phone: '+91 98270 54321', email: 'dr.neha.j@email.com', initials: 'NJ', community: 'Jain Samaj', subCommunity: 'Digambar', city: 'Bhopal', profession: 'Doctor', company: 'Jain Care Clinic', age: 35, gender: 'Female', familyMembers: [{ id: 'f1', name: 'Dr. Vinay Jain', relation: 'Husband', age: 37, initials: 'VJ' }, { id: 'f2', name: 'Riya Jain', relation: 'Daughter', age: 6, initials: 'RJ' }] },
    { id: 'mock-u3', name: 'Suresh Sharma', phone: '+91 94140 12345', email: 'suresh.sharma@email.com', initials: 'SS', community: 'Sharma Samaj', subCommunity: 'Gaur Brahmin', city: 'Jaipur', profession: 'Architect', company: 'Sharma & Associates', age: 42, gender: 'Male', familyMembers: [{ id: 'f1', name: 'Anita Sharma', relation: 'Wife', age: 38, initials: 'AS' }, { id: 'f2', name: 'Rohit Sharma', relation: 'Son', age: 12, initials: 'RS' }] },
    { id: 'mock-u4', name: 'Vikas Patel', phone: '+91 98260 44556', email: 'vikas.patel@email.com', initials: 'VP', community: 'Patel Samaj', subCommunity: 'Kadava Patel', city: 'Ahmedabad', profession: 'CA', company: 'Patel Consultants', age: 45, gender: 'Male', familyMembers: [{ id: 'f1', name: 'Priya Patel', relation: 'Wife', age: 42, initials: 'PP' }, { id: 'f2', name: 'Yash Patel', relation: 'Son', age: 16, initials: 'YP' }] },
    { id: 'mock-u5', name: 'Amit Mali', phone: '+91 99810 98765', email: 'amit.mali@email.com', initials: 'AM', community: 'Mali Samaj', subCommunity: 'Phul Mali', city: 'Ujjain', profession: 'Marketing Manager', company: 'Mali Enterprises', age: 31, gender: 'Male', familyMembers: [{ id: 'f1', name: 'Kiran Mali', relation: 'Wife', age: 29, initials: 'KM' }] }
  ];

  const handleMockLogin = (user) => { loginUser(user); navigate('/member/home'); };

  const handleGoToHome = () => {
    const registeredUser = JSON.parse(localStorage.getItem('merisamaj_registered_user') || '{}');
    clearSession();
    loginUser(registeredUser);
    navigate('/member/home');
  };

  const handleSaveProfile = () => {
    const newUser = {
      id: `u-${Date.now()}`,
      name: name || 'Guest User',
      phone: loginMethod === 'phone' ? (phone || '+91 98765 00000') : '',
      email: loginMethod === 'email' ? email : alternateEmail || `${(name || 'guest').toLowerCase().replace(/\s+/g, '.')}@email.com`,
      initials: (name || 'Guest User').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      community: selectedCommunity,
      subCommunity: selectedSubCommunity,
      city: selectedCity,
      profession: profession || 'Business Owner',
      company: company || `${(name || 'guest').split(' ')[1] || 'Samaj'} Enterprises`,
      age: dob ? (new Date().getFullYear() - new Date(dob).getFullYear()) : 28,
      gender: gender || 'Male',
      avatar: avatar || null,
      familyMembers: familyMembers,
      isAadharVerified: isAadharVerified,
      isFaceVerified: isFaceVerified,
      pincode: pincode,
      district: district,
      state: stateName,
      bloodGroup: bloodGroup,
      maritalStatus: maritalStatus,
      qualification: qualification,
      school: school,
      detailedAddress: detailedAddress
    };

    localStorage.setItem('merisamaj_registered_user', JSON.stringify(newUser));
    setStep('success');
  };

  const isProfileReady = name.trim() !== '' && gender !== '';

  const calculateCompletion = () => {
    let pct = 20; // base from selections page
    if (name) pct += 25;
    if (gender) pct += 25;
    if (qualification) pct += 6;
    if (profession) pct += 6;
    if (detailedAddress) pct += 6;
    if (alternateEmail || alternatePhone) pct += 6;
    if (familyMembers.length > 0) pct += 6;
    return Math.min(pct, 100);
  };

  // Prefill State and District when a 6-digit Pincode is entered
  useEffect(() => {
    if (pincode.length === 6) {
      if (pincode.startsWith('452')) {
        setDistrict('Indore');
        setStateName('Madhya Pradesh');
      } else if (pincode.startsWith('456')) {
        setDistrict('Ujjain');
        setStateName('Madhya Pradesh');
      } else if (pincode.startsWith('457')) {
        setDistrict('Ratlam');
        setStateName('Madhya Pradesh');
      } else if (pincode.startsWith('302')) {
        setDistrict('Jaipur');
        setStateName('Rajasthan');
      } else if (pincode.startsWith('110')) {
        setDistrict('New Delhi');
        setStateName('Delhi');
      } else {
        setDistrict('Indore');
        setStateName('Madhya Pradesh');
      }
    }
  }, [pincode]);

  const handleGetOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setShowOtpBanner(true);
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    const entered = otp.join('');
    if (entered === generatedOtp) {
      setStep('selection');
      setShowOtpBanner(false);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP. Please check the code shown in the notification banner.');
    }
  };

  const handleResendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setShowOtpBanner(true);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ─── LANDING ──────────────────────────────────────────────────────────────
  if (step === 'landing') {
    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes auraPulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.05); opacity: 0.55; }
          }
          .animate-fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .animate-aura-pulse { animation: auraPulse 6s ease-in-out infinite; }
          .hover-card-premium { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
          .hover-card-premium:hover {
            transform: translateY(-2.5px) scale(1.005);
            box-shadow: 0 12px 24px -10px rgba(124, 58, 237, 0.15);
            border-color: rgba(139, 92, 246, 0.35);
          }
          .input-glow-focus { transition: all 0.25s ease; }
          .input-glow-focus:focus-within {
            border-color: #7c3aed !important;
            box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08) !important;
            transform: translateY(-1px);
          }
          .btn-modern-shine { position: relative; overflow: hidden; }
          .btn-modern-shine::after {
            content: '';
            position: absolute;
            top: -50%; left: -60%;
            width: 30%; height: 200%;
            background: rgba(255,255,255,0.18);
            transform: rotate(30deg);
            transition: all 0.6s ease;
          }
          .btn-modern-shine:hover::after { left: 120%; }

          /* ── Dropdown font-size overrides ─────────────────────────── */
          select { font-size: 14px; }
          select option { font-size: 14px; }
        `}</style>

        <div className="absolute inset-0 aura-bg z-0 animate-aura-pulse" />
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] px-6 pt-12 pb-14 rounded-b-[2.5rem] relative shadow-[0_8px_30px_rgba(124,58,237,0.2)] shrink-0 z-10 border-b border-purple-400/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/10 rounded-full translate-y-6 -translate-x-4 blur-2xl" />
          
          <div className="w-16 h-16 bg-white/95 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/30 mx-auto mb-4 border border-white/20 animate-float">
            <span className="text-brand-primary text-3xl font-bold font-serif">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white text-center leading-tight tracking-tight">MeriSamaj</h1>
          <p className="text-purple-200/80 text-sm text-center mt-1.5 font-medium">Connecting Communities. Uniting Families.</p>
        </div>

        {/* Scrollable Profiles List */}
        <div className="flex-1 px-5 pt-5 overflow-y-auto z-10 space-y-4">
          <div className="card-neo p-4 hover-card-premium animate-fade-in-up">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary animate-pulse">
                <LogIn size={16} />
              </div>
              <h2 className="text-sm font-bold text-text-primary">Quick Sign-In / Switch Profile</h2>
            </div>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">Select a pre-loaded profile to instantly test dynamic and personalized content customized for each community.</p>
            
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {sampleUsers.map(user => (
                <button 
                  key={user.id} 
                  onClick={() => handleMockLogin(user)} 
                  className="w-full flex items-center gap-3 p-2.5 bg-purple-50/20 hover:bg-brand-primary/5 border border-purple-100/10 hover:border-brand-primary/45 rounded-xl transition-all duration-300 text-left scale-100 hover:scale-[1.01] hover:-translate-y-0.5 active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-glow text-white font-bold flex items-center justify-center text-sm shadow-sm transition-transform duration-300 group-hover:scale-105">{user.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-secondary font-medium mt-0.5">{user.community} · {user.city}</p>
                  </div>
                  <ArrowRight size={16} className="text-brand-primary shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="card-neo p-4 hover-card-premium animate-fade-in-up [animation-delay:0.12s]">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 bg-social-module/10 rounded-xl flex items-center justify-center text-social-module animate-pulse">
                <UserPlus size={16} />
              </div>
              <h2 className="text-sm font-bold text-text-primary">Create New Account</h2>
            </div>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">Register as a new member with any community and city to explore from scratch.</p>
            <button 
              onClick={() => setStep('phone')} 
              className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.015] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group"
            >
              Register as a Member <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 shrink-0 z-10 border-t border-purple-100/20 bg-white/30 backdrop-blur-md">
          <p className="text-[10px] font-medium text-text-muted text-center tracking-wide uppercase">MeriSamaj © 2026. Built with ❤️ for Indian Communities.</p>
        </div>
      </div>
    );
  }

  // ─── PHONE / EMAIL ────────────────────────────────────────────────────────
  if (step === 'phone') {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const canGetOtp = loginMethod === 'phone' ? phone.length === 10 : isEmailValid;
    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 aura-bg z-0 animate-aura-pulse" />
        {showOtpBanner && <OtpBanner code={generatedOtp} onDismiss={() => setShowOtpBanner(false)} />}
        
        <div className="p-4 shrink-0 z-10 flex items-center justify-between">
          <button 
            onClick={() => setStep('landing')} 
            className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100/30 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 px-6 pt-2 overflow-y-auto z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-50 text-brand-primary rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-purple-200/40">
            {loginMethod === 'phone' ? <Phone size={26} /> : <Mail size={26} />}
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Log in to MeriSamaj</h1>
          <p className="text-sm text-text-secondary mt-1.5 font-semibold">Enter your details to receive verification OTP</p>
          
          <div className="flex bg-purple-100/40 border border-purple-200/30 p-1.5 rounded-xl mt-6 shadow-inner">
            <button onClick={() => { setLoginMethod('phone'); setOtpError(''); }} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all duration-300 ${loginMethod === 'phone' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-text-secondary hover:text-text-primary hover:bg-white/20'}`}>Mobile Number</button>
            <button onClick={() => { setLoginMethod('email'); setOtpError(''); }} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all duration-300 ${loginMethod === 'email' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-text-secondary hover:text-text-primary hover:bg-white/20'}`}>Email Address</button>
          </div>

          {loginMethod === 'phone' ? (
            <div className="mt-6">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Mobile Number</label>
              <div className="flex items-center gap-3 mt-2 bg-white/85 border border-purple-100/20 rounded-xl px-4 py-3.5 input-glow-focus transition-all shadow-xs">
                <span className="text-sm text-text-secondary font-black">+91</span>
                <div className="w-px h-5 bg-purple-200/60" />
                <input type="tel" placeholder="Enter 10-digit mobile number" className="flex-1 text-sm text-text-primary outline-none bg-transparent placeholder-gray-400 font-bold" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
              <div className="flex items-center gap-3 mt-2 bg-white/85 border border-purple-100/20 rounded-xl px-4 py-3.5 input-glow-focus transition-all shadow-xs">
                <input type="email" placeholder="Enter your email address" className="flex-1 text-sm text-text-primary outline-none bg-transparent placeholder-gray-400 font-bold" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-8 pt-4 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10">
          <button 
            onClick={handleGetOtp} 
            disabled={!canGetOtp} 
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md transition-all duration-300 ${canGetOtp ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.015] hover:-translate-y-0.5 active:scale-95 group' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'}`}
          >
            Get OTP <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <p className="text-[11px] text-text-muted text-center mt-3 font-medium">By continuing, you agree to our Terms of Service</p>
        </div>
      </div>
    );
  }

  // ─── OTP VERIFICATION ─────────────────────────────────────────────────────
  if (step === 'otp') {
    const isOtpComplete = otp.every(d => d !== '');
    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 aura-bg z-0 animate-aura-pulse" />
        {showOtpBanner && <OtpBanner code={generatedOtp} onDismiss={() => setShowOtpBanner(false)} />}
        
        <div className="p-4 shrink-0 z-10 flex items-center justify-between">
          <button 
            onClick={() => setStep('phone')} 
            className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100/30 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 px-6 pt-2 overflow-y-auto z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-50 text-brand-primary rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-purple-200/40">
            <Bell size={26} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Verify OTP</h1>
          <p className="text-sm text-text-secondary mt-1.5 font-semibold">
            Enter the 6-digit code sent to <span className="font-bold text-text-primary">{loginMethod === 'phone' ? `+91 ${phone}` : email}</span>.
          </p>

          <div className="flex gap-2 mt-8 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                ref={el => inputRefs.current[i] = el}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={`w-11 h-14 bg-white border-2 rounded-xl text-center text-xl font-bold text-text-primary outline-none transition-all shadow-xs focus:scale-105 duration-200 ${
                  digit ? 'border-brand-primary bg-purple-50/20 shadow-purple-200/50' : 'border-purple-100/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5'
                }`}
              />
            ))}
          </div>

          {otpError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-red-600 font-semibold text-center">{otpError}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1 mt-5">
            <p className="text-xs text-text-secondary">Didn't receive the code?</p>
            <button onClick={handleResendOtp} className="text-xs text-brand-primary font-black press-scale hover:underline">Resend OTP</button>
          </div>
        </div>

        <div className="px-6 pb-8 pt-4 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10">
          <button
            onClick={handleVerifyOtp}
            disabled={!isOtpComplete}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md transition-all duration-300 ${
              isOtpComplete ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.015] hover:-translate-y-0.5 active:scale-95' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'
            }`}
          >
            Verify OTP <CheckCircle size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─── COMBINED SELECTION STEP ──────────────────────────────────────────────
  if (step === 'selection') {
    const availableSubCommunities = selectedCommunity ? (communityData[selectedCommunity]?.subCommunities || []) : [];
    const availableCities = selectedCommunity ? (communityData[selectedCommunity]?.cities || []) : [];
    const canProceed = selectedCommunity && selectedSubCommunity && selectedCity && pincode.length === 6;

    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 aura-bg z-0 animate-aura-pulse" />
        
        {/* Header */}
        <div className="p-4 shrink-0 z-10 flex items-center justify-between">
          <button 
            onClick={() => setStep('otp')} 
            className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100/30 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="text-xs font-bold text-brand-primary">Step 3/5</span>
        </div>

        <div className="flex-1 px-6 pt-2 pb-6 overflow-y-auto z-10 space-y-5 font-sans">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-50 text-brand-primary rounded-2xl flex items-center justify-center shadow-sm border border-purple-200/40">
            <Users size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">Which community do you belong to?</h1>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-semibold">
              Select your community, category, and location to connect your profile to the right community.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Community Dropdown */}
            <div className="animate-cascade-1">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Select Community</label>
              <CustomSelect
                value={selectedCommunity}
                onChange={(val) => { setSelectedCommunity(val); setSelectedSubCommunity(''); setSelectedCity(''); }}
                options={COMMUNITY_KEYS}
                placeholder="Select community"
              />
            </div>

            {/* Sub Community Dropdown */}
            <div className="animate-cascade-2">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Sub-Community / Category</label>
              <CustomSelect
                value={selectedSubCommunity}
                onChange={setSelectedSubCommunity}
                options={availableSubCommunities}
                placeholder="Select sub-community"
                disabled={!selectedCommunity}
              />
            </div>

            {/* Pincode & City Container */}
            <div className="grid grid-cols-2 gap-4 animate-cascade-3">
              {/* Pincode Input */}
              <div>
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Enter Pincode</label>
                <input
                  type="tel"
                  maxLength={6}
                  placeholder="Enter 6-digit pin"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white/95 border border-purple-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all"
                />
              </div>

              {/* City Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Select City / Village</label>
                <CustomSelect
                  value={selectedCity}
                  onChange={setSelectedCity}
                  options={availableCities}
                  placeholder="Select city"
                  disabled={!selectedCommunity || !pincode}
                />
              </div>
            </div>

            {/* District & State (Auto-filled) */}
            {pincode.length === 6 && (
              <div className="bg-purple-50/40 p-4 border border-purple-100/50 rounded-2xl space-y-2 animate-fade-in-up">
                <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">Location Details (Auto-filled)</p>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-text-primary">
                  <p><strong>District:</strong> {district}</p>
                  <p><strong>State:</strong> {stateName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-8 pt-4 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10">
          <button
            onClick={() => setStep('profile')}
            disabled={!canProceed}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 press-scale shadow-md transition-all duration-300 ${
              canProceed ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.015] hover:-translate-y-0.5 active:scale-95 group' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'
            }`}
          >
            Proceed <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    );
  }

  // ─── PROFILE STRENGTHEN STEP ───────────────────────────────────────────────
  if (step === 'profile') {
    const compPct = calculateCompletion();
    const isProfileReady = name && gender;

    const handleAddFamilyMember = () => {
      if (!tempFamilyName || !tempFamilyRelation || !tempFamilyAge) return;
      const newMember = {
        id: `fam-${Date.now()}`,
        name: tempFamilyName,
        relation: tempFamilyRelation,
        age: tempFamilyAge
      };
      setFamilyMembers(prev => [...prev, newMember]);
      setTempFamilyName('');
      setTempFamilyRelation('');
      setTempFamilyAge('');
    };

    const handleRemoveFamilyMember = (id) => {
      setFamilyMembers(prev => prev.filter(m => m.id !== id));
    };

    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 aura-bg z-0" />
        
        {/* Header */}
        <div className="p-4 shrink-0 z-10 flex items-center justify-between">
          <button 
            onClick={() => setStep('selection')} 
            className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100/30 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="text-xs font-bold text-brand-primary">Step 4/5</span>
        </div>

        <div className="flex-1 px-6 pt-2 pb-6 overflow-y-auto z-10 space-y-5 font-sans">
          
          {/* Header Title */}
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-1.5">
              Strengthen Your Profile <Sparkles size={18} className="text-amber-500 animate-pulse" />
            </h1>
            <p className="text-[11px] text-text-secondary mt-1 font-semibold leading-relaxed">
              The more complete your information, the higher the trust and better connection experience within the community.
            </p>
          </div>

          {/* Progress Completion Bar */}
          <div className="bg-white p-4.5 rounded-3xl border border-purple-100/30 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-extrabold">
              <span className="text-slate-700">Profile Completion Tracker</span>
              <span className="text-brand-primary text-sm font-black">{compPct}% completed</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-primary to-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${compPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">Recommended: Adding more details builds trust among community members.</p>
          </div>

          {/* Profile photo block */}
          <div className="bg-white p-4 rounded-3xl border border-purple-100/30 shadow-xs flex items-center gap-4">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-600 shadow-sm" />
              ) : (
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex items-center justify-center text-slate-350">
                  <User size={24} />
                </div>
              )}
              <label className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md cursor-pointer border border-white text-white">
                <Camera size={11} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setAvatar(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Upload Profile Photo</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Uploading a clear photo helps the admin approve your profile quickly.</p>
            </div>
          </div>

          {/* Detailed information lists (Expandable sections) */}
          <div className="space-y-3.5">
            {/* SECTION 3: Personal Information */}
            <div className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover-card-premium transition-all duration-350 ${expandedSection === 'personal' ? 'border-purple-300 ring-4 ring-purple-500/5 bg-gradient-to-b from-white to-purple-50/5' : 'border-purple-100/30'}`}>
              <div 
                onClick={() => setExpandedSection(expandedSection === 'personal' ? null : 'personal')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0"><User size={16} /></div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-850">3. Personal Information</h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Full name, birth date, gender, marital status, etc.</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${expandedSection === 'personal' ? 'rotate-90' : ''}`} />
              </div>
              {expandedSection === 'personal' && (
                <div className="p-4.5 border-t border-slate-100 bg-slate-50/30 space-y-4 animate-fade-in text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Gender <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 mt-1">
                      {['Male', 'Female', 'Other'].map(g => (
                        <button key={g} type="button" onClick={() => setGender(g)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${gender === g ? 'bg-purple-55 border-brand-primary text-brand-primary' : 'bg-white border-purple-100/30 text-text-primary hover:border-purple-200'}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</label>
                      <div className="mt-1">
                        <CustomSelect
                          value={bloodGroup}
                          onChange={setBloodGroup}
                          options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                          placeholder="Select"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Marital Status</label>
                    <div className="mt-1">
                      <CustomSelect
                        value={maritalStatus}
                        onChange={setMaritalStatus}
                        options={['Single', 'Married', 'Widowed', 'Divorced', 'Separated', 'Other']}
                        placeholder="Select marital status"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: Education */}
            <div className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover-card-premium transition-all duration-350 ${expandedSection === 'education' ? 'border-purple-300 ring-4 ring-purple-500/5 bg-gradient-to-b from-white to-purple-50/5' : 'border-purple-100/30'}`}>
              <div 
                onClick={() => setExpandedSection(expandedSection === 'education' ? null : 'education')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0"><GraduationCap size={16} /></div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-850">4. Education Details</h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Add your qualification and school/college details.</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${expandedSection === 'education' ? 'rotate-90' : ''}`} />
              </div>
              {expandedSection === 'education' && (
                <div className="p-4.5 border-t border-slate-100 bg-slate-50/30 space-y-3 animate-fade-in text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Qualification</label>
                    <input type="text" placeholder="e.g. 12th, Graduate, B.Tech, MBA" value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">School / College Name</label>
                    <input type="text" placeholder="Enter school or college name" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: Profession */}
            <div className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover-card-premium transition-all duration-350 ${expandedSection === 'profession' ? 'border-purple-300 ring-4 ring-purple-500/5 bg-gradient-to-b from-white to-purple-50/5' : 'border-purple-100/30'}`}>
              <div 
                onClick={() => setExpandedSection(expandedSection === 'profession' ? null : 'profession')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0"><Briefcase size={16} /></div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-850">5. Profession / Occupation</h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Share your job, business, or occupation details.</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${expandedSection === 'profession' ? 'rotate-90' : ''}`} />
              </div>
              {expandedSection === 'profession' && (
                <div className="p-4.5 border-t border-slate-100 bg-slate-50/30 space-y-3 animate-fade-in text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Profession / Occupation</label>
                    <input type="text" placeholder="e.g. Businessman, Software Engineer, Teacher" value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Company / Business Name</label>
                    <input type="text" placeholder="Enter company or store name" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 6: Address */}
            <div className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover-card-premium transition-all duration-350 ${expandedSection === 'address' ? 'border-purple-300 ring-4 ring-purple-500/5 bg-gradient-to-b from-white to-purple-50/5' : 'border-purple-100/30'}`}>
              <div 
                onClick={() => setExpandedSection(expandedSection === 'address' ? null : 'address')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0"><MapPin size={16} /></div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-850">6. Detailed Address</h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">House number, landmark, street/colony details.</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${expandedSection === 'address' ? 'rotate-90' : ''}`} />
              </div>
              {expandedSection === 'address' && (
                <div className="p-4.5 border-t border-slate-100 bg-slate-50/30 animate-fade-in text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">House No. / Street / Landmark</label>
                  <textarea placeholder="Enter full address" value={detailedAddress} onChange={(e) => setDetailedAddress(e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 h-20 resize-none font-sans" />
                </div>
              )}
            </div>

            {/* SECTION 7: Contact */}
            <div className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover-card-premium transition-all duration-350 ${expandedSection === 'contact' ? 'border-purple-300 ring-4 ring-purple-500/5 bg-gradient-to-b from-white to-purple-50/5' : 'border-purple-100/30'}`}>
              <div 
                onClick={() => setExpandedSection(expandedSection === 'contact' ? null : 'contact')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0"><Mail size={16} /></div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-850">7. Contact Information</h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Enter alternate email ID and a secondary mobile number.</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${expandedSection === 'contact' ? 'rotate-90' : ''}`} />
              </div>
              {expandedSection === 'contact' && (
                <div className="p-4.5 border-t border-slate-100 bg-slate-50/30 space-y-3 animate-fade-in text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Alternate Email</label>
                    <input type="email" placeholder="example@email.com" value={alternateEmail} onChange={(e) => setAlternateEmail(e.target.value)} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Alternate Mobile Number</label>
                    <input type="tel" maxLength={10} placeholder="Enter 10-digit number" value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value.replace(/\D/g, ''))} className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 8: Family Details */}
            <div className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover-card-premium transition-all duration-350 ${expandedSection === 'family' ? 'border-purple-300 ring-4 ring-purple-500/5 bg-gradient-to-b from-white to-purple-50/5' : 'border-purple-100/30'}`}>
              <div 
                onClick={() => setExpandedSection(expandedSection === 'family' ? null : 'family')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0"><Users size={16} /></div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-850">8. Family Details</h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Add family member details (Name, relation, age).</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${expandedSection === 'family' ? 'rotate-90' : ''}`} />
              </div>
              {expandedSection === 'family' && (
                <div className="p-4.5 border-t border-slate-100 bg-slate-50/30 space-y-4 animate-fade-in text-left">
                  {/* Members list */}
                  {familyMembers.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Added Family Members</p>
                      {familyMembers.map(m => (
                        <div key={m.id} className="flex justify-between items-center bg-white p-2.5 border border-slate-150 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{m.name} <span className="text-indigo-600 font-semibold">({m.relation})</span></p>
                            <p className="text-[10px] text-slate-500 font-medium">Age: {m.age} years</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveFamilyMember(m.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add fields */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/60 space-y-3">
                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-wider">Add Member</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400">Name</label>
                        <input type="text" placeholder="Enter name" value={tempFamilyName} onChange={e => setTempFamilyName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400">Relation</label>
                        <CustomSelect
                          value={tempFamilyRelation}
                          onChange={setTempFamilyRelation}
                          options={[
                            { value: 'Wife', label: 'Wife' },
                            { value: 'Husband', label: 'Husband' },
                            { value: 'Son', label: 'Son' },
                            { value: 'Daughter', label: 'Daughter' },
                            { value: 'Father', label: 'Father' },
                            { value: 'Mother', label: 'Mother' },
                            { value: 'Brother', label: 'Brother' },
                            { value: 'Sister', label: 'Sister' }
                          ]}
                          placeholder="Select"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-bold text-slate-400">Age</label>
                        <div className="flex gap-2 items-center">
                          <input type="tel" maxLength={3} placeholder="Enter age" value={tempFamilyAge} onChange={e => setTempFamilyAge(e.target.value.replace(/\D/g, ''))} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none" />
                          <button 
                            type="button" 
                            onClick={handleAddFamilyMember}
                            className="bg-brand-primary hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 shrink-0"
                          >
                            <PlusCircle size={14} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Green Privacy Message Block */}
          <div className="bg-emerald-50 p-4 border border-emerald-100 rounded-2xl flex items-start gap-2.5 shadow-xs text-left">
            <Lock size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-black text-emerald-800 leading-tight">Your privacy is our priority</p>
              <p className="text-[10px] text-emerald-700/80 mt-1 leading-relaxed font-semibold">
                All your information will be kept secure, encrypted, and confidential. It will not be shared with any external member or entity without your permission.
              </p>
            </div>
          </div>
        </div>

        {/* Footer sticky actions */}
        <div className="px-6 pb-8 pt-4 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10">
          <button
            onClick={handleSaveProfile}
            disabled={!isProfileReady}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 press-scale shadow-md transition-all ${
              isProfileReady ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.015] hover:-translate-y-0.5 active:scale-95 group' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'
            }`}
          >
            Complete & Save My Profile <CheckCircle2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─── REGISTRATION SUCCESS STEP ─────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
        {/* Confetti Animation Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-40 animate-pulse">
          <div className="absolute top-10 left-10 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          <div className="absolute top-1/4 right-20 w-3 h-3 bg-indigo-500 rounded-full animate-bounce" />
          <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
        </div>
        <div className="absolute inset-0 aura-bg z-0 animate-aura-pulse" />

        <div className="flex-1 overflow-y-auto px-6 py-8 z-10 flex flex-col justify-center text-center max-w-sm mx-auto space-y-6">
          {/* Green Check Circle Banner */}
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200/50 scale-110 animate-bounce duration-700">
            <Check size={36} strokeWidth={3} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Registration Successful!</h1>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Thank you! Your registration has been completed successfully.
            </p>
          </div>

          {/* Status Box 2: Strengthen Profile recommendation */}
          <div className="bg-indigo-50/40 border border-purple-100/40 p-4 rounded-[20px] flex gap-3 text-left shadow-xs hover-card-premium">
            <ShieldCheck size={20} className="text-indigo-650 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-indigo-900 leading-tight">Strengthen Your Profile</h4>
              <p className="text-[10px] text-indigo-800/80 leading-relaxed mt-1 font-semibold">
                Adding more information increases trust in your profile and provides faster access to services.
              </p>
            </div>
          </div>

          {/* Status Box 3: What happens next list */}
          <div className="bg-slate-55/60 border border-slate-200/40 p-4.5 rounded-[20px] text-left space-y-2 shadow-xs text-xs font-semibold text-slate-600 leading-relaxed hover-card-premium">
            <h4 className="text-[11px] font-black text-slate-880 flex items-center gap-1"><AlertCircle size={13} className="text-slate-500" /> What happens next?</h4>
            <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-500">
              <li>Your profile details will be verified by the community admin.</li>
              <li>Once approved, you will be able to fully utilize all features of the app.</li>
              <li>You can continue to refine and update your profile details in the meantime.</li>
            </ul>
          </div>
        </div>

        {/* Footer sticky Actions */}
        <div className="px-6 pb-8 pt-4 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10 flex flex-col gap-3 max-w-sm mx-auto w-full">
          <button
            onClick={handleGoToHome}
            className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-black rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.015] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5 press-scale group"
          >
            Go to Home Page <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => setStep('profile')}
            className="text-xs font-bold text-indigo-600 hover:underline hover:text-indigo-700 py-1 transition-all"
          >
            Improve Profile Details
          </button>
        </div>
      </div>
    );
  }

  // ─── LANDING BACKUP (Setup Profile fallback) ──────────────────────────────
  return null;
};

export default LoginScreen;
