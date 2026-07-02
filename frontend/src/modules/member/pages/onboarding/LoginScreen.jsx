import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, ArrowRight, ArrowLeft, Bell, Lock, Eye, EyeOff, AlertCircle, Globe, Check
} from 'lucide-react';
import { useData } from '../../context/DataProvider';

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
        <strong className="text-teal-400 text-base font-black tracking-widest bg-white/10 px-2 py-0.5 rounded ml-1 border border-white/10 shadow-inner">{code}</strong>
      </p>
      <p className="text-[10px] text-purple-300/60 mt-1">Do not share this code with anyone.</p>
    </div>
    <button onClick={onDismiss} className="text-xs font-bold text-purple-200 hover:text-white px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-xl press-scale border border-white/5 transition-all">Dismiss</button>
  </div>
);

const LoginScreen = () => {
  const navigate = useNavigate();
  const { loginUser, setLanguage, language } = useData();
  const inputRefs = useRef([]);

  // Step flow: 'auth'
  const [step, setStep] = useState('auth');

  // Auth details
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Forgot Password flow
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null); // null | 1 | 2 | 3
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);

  // Otp notifications
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpBanner, setShowOtpBanner] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const triggerOtpBanner = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setShowOtpBanner(true);
    setOtpError('');
    return code;
  };

  const handleVerifyOtp = (enteredOtp, onSuccess) => {
    if (enteredOtp === generatedOtp) {
      setShowOtpBanner(false);
      setOtpError('');
      onSuccess();
    } else {
      setOtpError('Invalid OTP. Please check the code shown in the notification banner.');
    }
  };

  const handleForgotSendOtp = () => {
    if (!forgotMobile || forgotMobile.length !== 10) return;
    triggerOtpBanner();
    setForgotPasswordStep(2);
  };

  const handleForgotVerifyOtp = () => {
    const entered = forgotOtp.join('');
    handleVerifyOtp(entered, () => setForgotPasswordStep(3));
  };

  const handleForgotResetPassword = () => {
    if (!forgotNewPassword || forgotNewPassword !== forgotConfirmPassword) {
      setToastMessage('Passwords do not match');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    setToastMessage('Password reset successful! Please log in.');
    setTimeout(() => setToastMessage(''), 3000);
    setForgotPasswordStep(null);
    setLoginPassword('');
  };

  const sampleUsers = [
    { id: 'mock-u1', name: 'Rajesh Agrawal', phone: '+91 98765 43210', email: 'rajesh.agrawal@email.com', initials: 'RA', community: 'Agrawal Samaj', subCommunity: 'Bisa Agrawal', city: 'Indore', profession: 'Business Owner', company: 'Agrawal Traders Pvt. Ltd.', age: 34, gender: 'Male', familyMembers: [{ id: 'f1', name: 'Sunita Agrawal', relation: 'Wife', age: 31, initials: 'SA' }] },
    { id: 'mock-u2', name: 'Dr. Neha Jain', phone: '+91 98270 54321', email: 'dr.neha.j@email.com', initials: 'NJ', community: 'Jain Samaj', subCommunity: 'Digambar', city: 'Bhopal', profession: 'Doctor', company: 'Jain Care Clinic', age: 35, gender: 'Female', familyMembers: [] }
  ];

  const handleLogin = () => {
    if (!loginIdentifier || !loginPassword) {
      setToastMessage('Please enter email/mobile and password');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem('merisamaj_registered_user') || 'null');

    if (savedUser && (loginIdentifier === savedUser.phone || loginIdentifier === savedUser.email)) {
      loginUser(savedUser);
      navigate('/member/home');
    } else {
      const match = sampleUsers.find(u => u.phone === loginIdentifier || u.email === loginIdentifier || u.name.toLowerCase().includes(loginIdentifier.toLowerCase()));
      if (match) {
        loginUser(match);
        navigate('/member/home');
      } else {
        const mockUser = {
          id: `u-${Date.now()}`,
          name: loginIdentifier.includes('@') ? loginIdentifier.split('@')[0] : 'Member User',
          phone: !loginIdentifier.includes('@') ? loginIdentifier : '+91 98765 43210',
          email: loginIdentifier.includes('@') ? loginIdentifier : 'member@email.com',
          community: 'Gupta Samaj',
          city: 'Indore',
          profession: 'Professional',
          familyMembers: [],
        };
        loginUser(mockUser);
        navigate('/member/home');
      }
    }
  };

  const renderToast = () => toastMessage && (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1e1145] text-white border border-purple-500/20 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce font-sans text-xs font-bold select-none">
      <AlertCircle size={15} className="text-purple-300" />
      <span>{toastMessage}</span>
    </div>
  );



  // ─── LOGIN FLOW ───
  if (step === 'auth') {
    const isForgotMode = forgotPasswordStep !== null;

    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 aura-bg z-0 animate-aura-pulse" />
        {showOtpBanner && <OtpBanner code={generatedOtp} onDismiss={() => setShowOtpBanner(false)} />}
        {renderToast()}

        {/* Back navigation header */}
        <div className="p-4 shrink-0 z-10 flex items-center justify-between">
          <button 
            onClick={() => {
              if (isForgotMode) setForgotPasswordStep(null);
              else navigate('/member/splash');
            }} 
            className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100/30 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="text-xs font-bold text-brand-primary">{isForgotMode ? 'Forgot Password' : 'Login'}</span>
        </div>

        <div className="flex-1 px-6 pt-2 pb-6 overflow-y-auto z-10 max-w-sm mx-auto w-full">
          {!isForgotMode ? (
            <>
              {/* Tab Switcher */}
              <div className="flex bg-purple-100/40 border border-purple-200/30 p-1.5 rounded-2xl mt-2 mb-6 shadow-inner">
                <button 
                  className="flex-1 py-2.5 text-xs font-black rounded-xl bg-[#7C3AED] text-white shadow-md"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/member/register')} 
                  className="flex-1 py-2.5 text-xs font-black rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/20 transition-all"
                >
                  Register
                </button>
              </div>

              {/* Login fields */}
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email or Mobile Number</label>
                  <div className="flex items-center gap-3 mt-2 bg-white/85 border border-purple-100/20 rounded-xl px-4 py-3.5 input-glow-focus transition-all shadow-xs">
                    <input 
                      type="text" 
                      placeholder="Enter your email or mobile number" 
                      value={loginIdentifier} 
                      onChange={(e) => setLoginIdentifier(e.target.value)} 
                      className="flex-1 text-sm text-text-primary outline-none bg-transparent placeholder-gray-400 font-bold" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Password</label>
                  <div className="flex items-center gap-3 mt-2 bg-white/85 border border-purple-100/20 rounded-xl px-4 py-3.5 input-glow-focus transition-all shadow-xs">
                    <input 
                      type={showLoginPass ? 'text' : 'password'} 
                      placeholder="Enter your password" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      className="flex-1 text-sm text-text-primary outline-none bg-transparent placeholder-gray-400 font-bold" 
                    />
                    <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="text-slate-400 hover:text-slate-650 shrink-0">
                      {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    onClick={() => setForgotPasswordStep(1)} 
                    className="text-xs font-bold text-[#7C3AED] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button 
                  onClick={handleLogin}
                  className="w-full mt-6 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md"
                >
                  Login <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : (
            /* ─── FORGOT PASSWORD FLOW ─── */
            <div className="space-y-4 animate-fade-in text-left">
              {forgotPasswordStep === 1 && (
                <div className="space-y-4 animate-scale-up">
                  <div>
                    <h2 className="text-lg font-black text-slate-850">Step 1: Forgot Password</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Enter your mobile number to receive reset OTP</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Mobile Number</label>
                    <div className="flex items-center gap-3 mt-2 bg-white/85 border border-purple-100/20 rounded-xl px-4 py-3.5 input-glow-focus transition-all shadow-xs">
                      <span className="text-sm text-text-secondary font-black">+91</span>
                      <input 
                        type="tel" 
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number" 
                        value={forgotMobile} 
                        onChange={(e) => setForgotMobile(e.target.value.replace(/\D/g, ''))} 
                        className="flex-1 text-sm text-text-primary outline-none bg-transparent placeholder-gray-400 font-bold" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleForgotSendOtp}
                    disabled={forgotMobile.length !== 10}
                    className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale transition-all ${
                      forgotMobile.length === 10 ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md' : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed'
                    }`}
                  >
                    Send OTP <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {forgotPasswordStep === 2 && (
                <div className="space-y-4 animate-scale-up">
                  <div>
                    <h2 className="text-lg font-black text-slate-850">Step 2: Verify OTP</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Enter 6-digit OTP code sent to +91 {forgotMobile}</p>
                  </div>
                  <div className="flex gap-1.5 justify-center">
                    {forgotOtp.map((digit, i) => (
                      <input
                        key={i}
                        id={`forgot-otp-${i}`}
                        ref={el => inputRefs.current[i] = el}
                        type="tel"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const newOtp = [...forgotOtp];
                          newOtp[i] = e.target.value.replace(/\D/g, '');
                          setForgotOtp(newOtp);
                          if (e.target.value && i < 5) inputRefs.current[i + 1]?.focus();
                        }}
                        className="w-10 h-12 bg-white border border-slate-200 rounded-xl text-center text-lg font-bold text-slate-800 outline-none"
                      />
                    ))}
                  </div>
                  {otpError && <p className="text-[10px] text-red-500 font-semibold text-center mt-1">{otpError}</p>}
                  <button 
                    onClick={handleForgotVerifyOtp}
                    disabled={forgotOtp.some(d => d === '')}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale disabled:opacity-45 mt-2"
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {forgotPasswordStep === 3 && (
                <div className="space-y-4 animate-scale-up">
                  <div>
                    <h2 className="text-lg font-black text-slate-850">Step 3: Reset Password</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Create a new secure password</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">New Password</label>
                    <div className="flex items-center mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                      <input 
                        type={showForgotNewPass ? 'text' : 'password'} 
                        placeholder="New Password" 
                        value={forgotNewPassword} 
                        onChange={(e) => setForgotNewPassword(e.target.value)} 
                        className="flex-1 text-xs font-semibold text-slate-800 outline-none bg-transparent" 
                      />
                      <button type="button" onClick={() => setShowForgotNewPass(!showForgotNewPass)} className="text-slate-400 hover:text-slate-650 shrink-0 ml-1">
                        {showForgotNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Confirm Password</label>
                    <div className="flex items-center mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                      <input 
                        type={showForgotConfirmPass ? 'text' : 'password'} 
                        placeholder="Re-enter New Password" 
                        value={forgotConfirmPassword} 
                        onChange={(e) => setForgotConfirmPassword(e.target.value)} 
                        className="flex-1 text-xs font-semibold text-slate-800 outline-none bg-transparent" 
                      />
                      <button type="button" onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)} className="text-slate-400 hover:text-slate-650 shrink-0 ml-1">
                        {showForgotConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleForgotResetPassword}
                    className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md"
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default LoginScreen;
