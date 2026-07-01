import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, ArrowRight, ArrowLeft, MapPin, Users, CheckCircle,
  User, Camera, LogIn, UserPlus, Bell, Mail, ChevronRight, Check
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

  // Profile
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [profession, setProfession] = useState('');

  // Community 3-step
  const [communityStep, setCommunityStep] = useState('community');
  const [slideDir, setSlideDir] = useState('right');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedSubCommunity, setSelectedSubCommunity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

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

  const handleCompleteSetup = () => {
    const newUser = {
      id: `u-${Date.now()}`,
      name,
      phone: loginMethod === 'phone' ? (phone || '+91 98765 00000') : '',
      email: loginMethod === 'email' ? email : `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      community: selectedCommunity,
      subCommunity: selectedSubCommunity,
      city: selectedCity,
      profession: profession || 'Business Owner',
      company: `${name.split(' ')[1] || 'Samaj'} Enterprises`,
      age: 28,
      gender,
      avatar: avatar || null,
      familyMembers: []
    };
    clearSession();
    loginUser(newUser);
    navigate('/member/home');
  };

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
      setCommunityStep('community');
      setStep('community');
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
        <div className="absolute inset-0 aura-bg z-0" />
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] px-6 pt-12 pb-14 rounded-b-[2.5rem] relative shadow-[0_8px_30px_rgba(124,58,237,0.2)] shrink-0 z-10 border-b border-purple-400/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/10 rounded-full translate-y-6 -translate-x-4 blur-2xl" />
          
          <div className="w-16 h-16 bg-white/95 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/30 mx-auto mb-4 border border-white/20">
            <span className="text-brand-primary text-3xl font-bold font-serif">म</span>
          </div>
          <h1 className="text-3xl font-bold text-white text-center leading-tight tracking-tight">MeriSamaj</h1>
          <p className="text-purple-200/80 text-sm text-center mt-1.5 font-medium">Connecting Communities. Uniting Families.</p>
        </div>

        {/* Scrollable Profiles List */}
        <div className="flex-1 px-5 pt-5 overflow-y-auto z-10 space-y-4">
          <div className="card-neo p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                <LogIn size={16} />
              </div>
              <h2 className="text-sm font-bold text-text-primary">Quick Sign In / Switch Profile</h2>
            </div>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">Choose a preloaded profile to instantly test dynamic, personalized contents tailored to each community.</p>
            
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {sampleUsers.map(user => (
                <button 
                  key={user.id} 
                  onClick={() => handleMockLogin(user)} 
                  className="w-full flex items-center gap-3 p-2.5 bg-purple-50/30 hover:bg-brand-primary/5 border border-purple-100/20 hover:border-brand-primary/45 rounded-xl transition-all text-left press-scale"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-glow text-white font-bold flex items-center justify-center text-sm shadow-sm">{user.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-secondary font-medium mt-0.5">{user.community} · {user.city}</p>
                  </div>
                  <ArrowRight size={16} className="text-brand-primary shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="card-neo p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 bg-social-module/10 rounded-xl flex items-center justify-center text-social-module">
                <UserPlus size={16} />
              </div>
              <h2 className="text-sm font-bold text-text-primary">Create New Account</h2>
            </div>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">Sign up as a new member with any community and city to explore from scratch.</p>
            <button 
              onClick={() => setStep('phone')} 
              className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-glow text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 press-scale"
            >
              Register as Member <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 shrink-0 z-10 border-t border-purple-100/20 bg-white/30 backdrop-blur-md">
          <p className="text-[10px] font-medium text-text-muted text-center tracking-wide uppercase">MeriSamaj © 2026. Made with ❤️ for Indian Communities.</p>
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
        <div className="absolute inset-0 aura-bg z-0" />
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
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Login to MeriSamaj</h1>
          <p className="text-sm text-text-secondary mt-1.5">Enter your details to receive verification OTP</p>
          
          <div className="flex bg-purple-100/40 border border-purple-200/30 p-1 rounded-xl mt-6">
            <button onClick={() => { setLoginMethod('phone'); setOtpError(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-white text-brand-primary shadow-sm border border-purple-100/20' : 'text-text-secondary hover:text-text-primary'}`}>Mobile Number</button>
            <button onClick={() => { setLoginMethod('email'); setOtpError(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white text-brand-primary shadow-sm border border-purple-100/20' : 'text-text-secondary hover:text-text-primary'}`}>Email Address</button>
          </div>

          {loginMethod === 'phone' ? (
            <div className="mt-6">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Mobile Number</label>
              <div className="flex items-center gap-3 mt-2 bg-white/80 border border-purple-100/30 rounded-xl px-4 py-3.5 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all shadow-sm">
                <span className="text-sm text-text-secondary font-bold">+91</span>
                <div className="w-px h-5 bg-purple-200/60" />
                <input type="tel" placeholder="Enter 10-digit number" className="flex-1 text-sm text-text-primary outline-none bg-transparent placeholder-gray-400 font-medium" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
              <div className="flex items-center gap-3 mt-2 bg-white/80 border border-purple-100/30 rounded-xl px-4 py-3.5 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all shadow-sm">
                <input type="email" placeholder="Enter your email address" className="flex-1 text-sm text-text-primary outline-none bg-transparent placeholder-gray-400 font-medium" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-8 pt-4 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10">
          <button 
            onClick={handleGetOtp} 
            disabled={!canGetOtp} 
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md transition-all ${canGetOtp ? 'bg-gradient-to-r from-brand-primary to-brand-glow text-white shadow-purple-500/25' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'}`}
          >
            Get OTP <ArrowRight size={16} />
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
        <div className="absolute inset-0 aura-bg z-0" />
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
          <p className="text-sm text-text-secondary mt-1.5">
            Enter the 6-digit code sent to{' '}
            <span className="font-semibold text-text-primary">{loginMethod === 'phone' ? `+91 ${phone}` : email}</span>
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
                className={`w-11 h-14 bg-white border-2 rounded-xl text-center text-xl font-bold text-text-primary outline-none transition-all shadow-sm ${
                  digit ? 'border-brand-primary bg-purple-50/20 shadow-purple-200/50' : 'border-purple-100/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'
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
            <p className="text-xs text-text-secondary">Didn't receive code?</p>
            <button onClick={handleResendOtp} className="text-xs text-brand-primary font-semibold press-scale hover:underline">Resend OTP</button>
          </div>
        </div>

        <div className="px-6 pb-8 pt-4 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10">
          <button
            onClick={handleVerifyOtp}
            disabled={!isOtpComplete}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md transition-all ${
              isOtpComplete ? 'bg-gradient-to-r from-brand-primary to-brand-glow text-white shadow-purple-500/25' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'
            }`}
          >
            Verify OTP <CheckCircle size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─── COMMUNITY 3-STEP FLOW ────────────────────────────────────────────────
  if (step === 'community') {
    const availableSubCommunities = selectedCommunity ? (communityData[selectedCommunity]?.subCommunities || []) : [];
    const availableCities = selectedCommunity ? (communityData[selectedCommunity]?.cities || []) : [];
    const noSubCommunities = communityStep === 'subCommunity' && availableSubCommunities.length === 0;

    const stepNums = { community: 1, subCommunity: 2, city: 3 };
    const stepLabels = ['Community', 'Sub Community', 'City'];

    const handleBack = () => {
      if (communityStep === 'community') { setStep('otp'); }
      else if (communityStep === 'subCommunity') { setSlideDir('left'); setCommunityStep('community'); }
      else if (communityStep === 'city') { setSlideDir('left'); setCommunityStep('subCommunity'); }
    };

    const handleNext = () => {
      if (communityStep === 'community') { setSlideDir('right'); setCommunityStep('subCommunity'); }
      else if (communityStep === 'subCommunity') { setSlideDir('right'); setCommunityStep('city'); }
      else if (communityStep === 'city') { setStep('profile'); }
    };

    const canProceed = communityStep === 'community'
      ? !!selectedCommunity
      : communityStep === 'subCommunity'
        ? (!!selectedSubCommunity || noSubCommunities)
        : !!selectedCity;

    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 aura-bg z-0" />
        
        <div className="shrink-0 z-10">
          <div className="flex items-center gap-2 px-4 pt-4 pb-1">
            <button 
              onClick={handleBack} 
              className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100/30 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
          </div>
          <StepIndicator current={stepNums[communityStep]} total={3} labels={stepLabels} />
        </div>

        <div className="flex-1 overflow-y-auto z-10">
          <SlideIn dir={slideDir} key={communityStep}>
            <div className="px-6 pt-4 pb-4">

              {/* STEP 1: Community */}
              {communityStep === 'community' && (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-50 text-brand-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-purple-200/40">
                    <Users size={26} />
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary tracking-tight">Select Your Community</h1>
                  <p className="text-sm text-text-secondary mt-1.5">Choose the Samaj you belong to</p>
                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    {COMMUNITY_KEYS.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setSelectedCommunity(c); setSelectedSubCommunity(''); setSelectedCity(''); }}
                        className={`p-4 rounded-2xl text-xs font-bold text-left transition-all press-scale border-2 relative ${
                          selectedCommunity === c
                            ? 'bg-purple-50/50 border-brand-primary text-brand-primary shadow-sm shadow-purple-100'
                            : 'bg-white border-purple-100/30 text-text-primary hover:border-purple-200'
                        }`}
                      >
                        {selectedCommunity === c && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-primary rounded-full flex items-center justify-center shadow-sm shadow-purple-300">
                            <Check size={9} className="text-white" />
                          </div>
                        )}
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 2: Sub Community */}
              {communityStep === 'subCommunity' && (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-50 text-brand-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-purple-200/40">
                    <Users size={26} />
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary tracking-tight">Select Sub Community</h1>
                  <p className="text-sm text-text-secondary mt-1.5">
                    Within <span className="font-semibold text-brand-primary">{selectedCommunity}</span>
                  </p>

                  {noSubCommunities ? (
                    <div className="mt-10 text-center py-6">
                      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-purple-100/40">
                        <Users size={28} className="text-purple-300" />
                      </div>
                      <p className="text-sm font-bold text-text-secondary">No sub-communities listed</p>
                      <p className="text-xs text-text-muted mt-1">You can continue to city selection.</p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-2.5">
                      {availableSubCommunities.map((sc) => (
                        <button
                          key={sc}
                          onClick={() => setSelectedSubCommunity(sc)}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all press-scale ${
                            selectedSubCommunity === sc
                              ? 'bg-purple-50/50 border-brand-primary text-brand-primary shadow-sm shadow-purple-100'
                              : 'bg-white border-purple-100/30 text-text-primary hover:border-purple-200'
                          }`}
                        >
                          <span className="text-sm font-bold">{sc}</span>
                          {selectedSubCommunity === sc ? (
                            <div className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center shadow-sm">
                              <Check size={11} className="text-white" />
                            </div>
                          ) : (
                            <ChevronRight size={16} className="text-purple-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* STEP 3: City */}
              {communityStep === 'city' && (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-50 text-brand-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-purple-200/40">
                    <MapPin size={26} />
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary tracking-tight">Select Your City</h1>
                  <p className="text-sm text-text-secondary mt-1.5">Where are you based? This helps connect you locally.</p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {availableCities.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCity(c)}
                        className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all press-scale border-2 flex items-center gap-1.5 ${
                          selectedCity === c
                            ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-purple-300/30'
                            : 'bg-white border-purple-100/30 text-text-primary hover:border-purple-200'
                        }`}
                      >
                        <MapPin size={10} /> {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </SlideIn>
        </div>

        {/* ── STICKY FOOTER ── */}
        <div className="px-6 pb-8 pt-3 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10">
          {(selectedCommunity || selectedSubCommunity || selectedCity) && (
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              {selectedCommunity && <span className="text-[10px] font-bold bg-purple-50 text-brand-primary border border-purple-100/60 px-2.5 py-1 rounded-full">{selectedCommunity}</span>}
              {selectedSubCommunity && <span className="text-[10px] font-bold bg-purple-50 text-brand-primary border border-purple-100/60 px-2.5 py-1 rounded-full">{selectedSubCommunity}</span>}
              {selectedCity && <span className="text-[10px] font-bold bg-purple-50 text-brand-primary border border-purple-100/60 px-2.5 py-1 rounded-full flex items-center gap-1"><MapPin size={9} />{selectedCity}</span>}
            </div>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md transition-all ${
              canProceed ? 'bg-gradient-to-r from-brand-primary to-brand-glow text-white shadow-purple-500/25' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'
            }`}
          >
            {communityStep === 'city' ? 'Continue to Profile' : 'Continue'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─── PROFILE SETUP ────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 aura-bg z-0" />
      
      <div className="p-4 shrink-0 z-10">
        <button 
          onClick={() => { setCommunityStep('city'); setStep('community'); }} 
          className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100/30 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 px-6 pt-2 overflow-y-auto z-10">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Setup Your Profile</h1>
        <p className="text-sm text-text-secondary mt-1.5">Almost done! Tell us about yourself</p>

        {/* Selection summary card */}
        <div className="mt-4 p-3.5 bg-purple-50/50 border border-purple-200/40 rounded-2xl flex items-start gap-2.5 shadow-sm">
          <CheckCircle size={16} className="text-brand-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-primary">{selectedCommunity}{selectedSubCommunity ? ` · ${selectedSubCommunity}` : ''}</p>
            <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1 font-semibold"><MapPin size={10} className="text-purple-400" />{selectedCity}</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mt-6">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-3xl object-cover border-2 border-brand-primary shadow-lg shadow-purple-500/10" />
            ) : (
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center border-2 border-dashed border-purple-200/60 shadow-inner">
                <User size={36} className="text-purple-300/60" />
              </div>
            )}
            <label className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg press-scale cursor-pointer border-2 border-white">
              <Camera size={13} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (file) { const reader = new FileReader(); reader.onload = (ev) => setAvatar(ev.target.result); reader.readAsDataURL(file); }
              }} />
            </label>
          </div>
        </div>

        {/* Form fields */}
        <div className="mt-6 space-y-4 pb-4">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
            <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1.5 bg-white/80 border border-purple-100/30 rounded-xl px-4 py-3.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder-gray-450 font-medium shadow-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Gender</label>
            <div className="flex gap-2.5 mt-1.5">
              {['Male', 'Female', 'Other'].map(g => (
                <button key={g} onClick={() => setGender(g)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all press-scale border-2 ${gender === g ? 'bg-purple-50/50 border-brand-primary text-brand-primary shadow-sm shadow-purple-100' : 'bg-white border-purple-100/30 text-text-primary hover:border-purple-200'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Profession</label>
            <input type="text" placeholder="e.g. Doctor, Engineer, CA" value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full mt-1.5 bg-white/80 border border-purple-100/30 rounded-xl px-4 py-3.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder-gray-450 font-medium shadow-sm" />
          </div>
        </div>
      </div>

      {/* ── STICKY FOOTER ── */}
      <div className="px-6 pb-8 pt-4 shrink-0 bg-white/50 backdrop-blur-md border-t border-purple-100/30 z-10">
        <p className="text-xs text-text-secondary text-center mb-3">
          Your profile will be reviewed by the community head of <strong>{selectedCity}</strong>
        </p>
        <button
          onClick={handleCompleteSetup}
          disabled={!name || !gender}
          className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md transition-all ${name && gender ? 'bg-gradient-to-r from-brand-primary to-brand-glow text-white shadow-purple-500/25' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'}`}
        >
          Complete Setup <CheckCircle size={16} />
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
