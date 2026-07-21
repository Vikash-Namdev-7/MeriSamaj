import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, ArrowRight, Bell, Eye, EyeOff, Lock, Check, AlertCircle, Gift, CheckCircle2, Loader2
} from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { useReferral } from '../referral/ReferralContext';
import { authService } from '../../../../core/auth/authService';
import { useAuth } from '../../../../core/auth/useAuth';

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

// Removed OtpBanner as per production refactor. SMS will be delivered directly to mobile.

const RegisterScreen = () => {
  const navigate = useNavigate();
  const { loginUser } = useData();
  const { register } = useAuth();
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);

  // States
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerOtp, setRegisterOtp] = useState(['', '', '', '', '', '']);
  const [isRegMobileVerified, setIsRegMobileVerified] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [otpError, setOtpError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Referral State
  const { validateReferralCode } = useReferral();
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [referralStatus, setReferralStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [referralMessage, setReferralMessage] = useState('');

  const isRegOtpComplete = registerOtp.every(d => d !== '');

  const handleRegisterSendOtp = async () => {
    if (!registerPhone || registerPhone.length !== 10) return;
    setIsLoading(true);
    setOtpError('');
    try {
      // TODO: Integrate Production SMS Provider here (Twilio/Fast2SMS)
      await authService.sendOtp({ phone: registerPhone, type: 'register' });
      setOtpSent(true);
      setToastMessage('OTP sent successfully');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      setToastMessage(error?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterVerifyOtp = async () => {
    const entered = registerOtp.join('');
    setIsLoading(true);
    setOtpError('');
    try {
      await authService.verifyOtp({ phone: registerPhone, otp: entered, type: 'register' });
      setIsRegMobileVerified(true);
      setToastMessage('Mobile number verified successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      setOtpError(error?.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNext = async () => {
    if (!registerName || !registerName.trim()) {
      setToastMessage('Full Name is required');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setToastMessage('Passwords do not match');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        name: registerName,
        phone: registerPhone,
        email: registerEmail,
        password: registerPassword,
        referralCode: referralCodeInput
      });
      
      localStorage.setItem('merisamaj_register_phone', registerPhone);
      localStorage.setItem('merisamaj_register_email', registerEmail);
      
      setToastMessage('Registration successful! Launching profile setup.');
      setTimeout(() => {
        loginUser({ name: registerName, mobile: registerPhone, email: registerEmail, isVerified: true });
        navigate('/member/onboarding');
      }, 1000);
    } catch (error) {
      setToastMessage(error?.response?.data?.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateReferral = async () => {
    if (!referralCodeInput.trim()) return;
    setReferralStatus('loading');
    const result = await validateReferralCode(referralCodeInput);
    if (result.valid) {
      setReferralStatus('success');
      setReferralMessage(result.message);
    } else {
      setReferralStatus('error');
      setReferralMessage(result.message);
    }
  };

  const renderToast = () => toastMessage && (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1e1145] text-white border border-purple-500/20 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce font-sans text-xs font-bold select-none">
      <AlertCircle size={15} className="text-purple-300" />
      <span>{toastMessage}</span>
    </div>
  );

  return (
    <div className="h-screen bg-surface flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 aura-bg z-0 animate-aura-pulse" />
      {renderToast()}

      {/* Back navigation header */}
      <div className="p-4 shrink-0 z-10 flex items-center justify-between">
        <button 
          onClick={() => navigate('/member/login', { state: { skipLanguage: true } })} 
          className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100/30 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
        >
          <ArrowRight size={18} strokeWidth={2.5} className="rotate-180" />
        </button>
        <span className="text-xs font-bold text-brand-primary">Register</span>
      </div>

      <div className="flex-1 px-6 pt-2 pb-6 overflow-y-auto z-10 max-w-sm mx-auto w-full">
        {/* Tab Switcher */}
        <div className="flex bg-purple-100/40 border border-purple-200/30 p-1.5 rounded-2xl mt-2 mb-6 shadow-inner">
          <button 
            onClick={() => navigate('/member/login', { state: { skipLanguage: true } })} 
            className="flex-1 py-2.5 text-xs font-black rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/20 transition-all"
          >
            Login
          </button>
          <button 
            className="flex-1 py-2.5 text-xs font-black rounded-xl bg-[#7C3AED] text-white shadow-md"
          >
            Register
          </button>
        </div>

        {/* ─── REGISTRATION FLOW ─── */}
        <div className="space-y-4 animate-fade-in text-left">
          {/* Step 1: Mobile verification */}
          <div className="p-4 bg-white/95 rounded-[22px] border border-purple-100/30 shadow-xs space-y-4">
            <p className="text-[10px] text-brand-primary font-black uppercase tracking-wider">Registration Step 1: Mobile Verification</p>
            
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Mobile Number</label>
              <div className="flex items-center gap-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="text-xs text-slate-500 font-black">+91</span>
                <input 
                  type="tel" 
                  maxLength={10} 
                  placeholder="Mobile Number" 
                  value={registerPhone} 
                  onChange={(e) => setRegisterPhone(e.target.value.replace(/\D/g, ''))} 
                  disabled={isRegMobileVerified}
                  className="flex-1 text-xs text-slate-800 outline-none bg-transparent placeholder-slate-400 font-semibold" 
                />
                {!isRegMobileVerified && (
                  <button 
                    type="button" 
                    onClick={handleRegisterSendOtp}
                    disabled={isLoading || registerPhone.length !== 10}
                    className="bg-[#7C3AED] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg press-scale disabled:opacity-45 shrink-0 flex items-center justify-center min-w-[70px]"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {!isRegMobileVerified && otpSent && (
              <div className="animate-fade-in space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Enter OTP</label>
                <div className="flex gap-1.5 justify-center">
                  {registerOtp.map((digit, i) => (
                    <input
                      key={i}
                      id={`reg-otp-${i}`}
                      ref={el => inputRefs.current[i] = el}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...registerOtp];
                        newOtp[i] = e.target.value.replace(/\D/g, '');
                        setRegisterOtp(newOtp);
                        if (e.target.value && i < 5) inputRefs.current[i + 1]?.focus();
                      }}
                      className="w-10 h-12 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-bold text-slate-800 outline-none"
                    />
                  ))}
                </div>
                {otpError && <p className="text-[10px] text-red-500 font-semibold text-center mt-1">{otpError}</p>}
                <button 
                  type="button" 
                  onClick={handleRegisterVerifyOtp}
                  disabled={isLoading || !isRegOtpComplete}
                  className="w-full py-2 bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-bold rounded-xl press-scale disabled:opacity-45 mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Verify OTP'}
                </button>
              </div>
            )}

            {isRegMobileVerified && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs font-bold">
                <Check size={16} strokeWidth={3} className="text-emerald-600 animate-scale-up" />
                Mobile Number Verified Successfully
              </div>
            )}
          </div>

          {/* Step 2: Account credentials */}
          <div className={`p-4 bg-white/95 rounded-[22px] border border-purple-100/30 shadow-xs space-y-4 transition-all duration-300 ${!isRegMobileVerified ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <p className="text-[10px] text-brand-primary font-black uppercase tracking-wider">Registration Step 2: Account Credentials</p>
            
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter full name" 
                value={registerName} 
                onChange={(e) => setRegisterName(e.target.value)} 
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none" 
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address <span className="normal-case text-slate-300">(Optional)</span></label>
              <input 
                type="email" 
                placeholder="Enter email address" 
                value={registerEmail} 
                onChange={(e) => setRegisterEmail(e.target.value)} 
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none" 
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Password</label>
              <div className="flex items-center mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <input 
                  type={showRegPass ? 'text' : 'password'} 
                  placeholder="Create password" 
                  value={registerPassword} 
                  onChange={(e) => setRegisterPassword(e.target.value)} 
                  className="flex-1 text-xs font-semibold text-slate-800 outline-none bg-transparent" 
                />
                <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="text-slate-400 hover:text-slate-650 shrink-0 ml-1">
                  {showRegPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Confirm Password</label>
              <div className="flex items-center mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <input 
                  type={showRegConfirmPass ? 'text' : 'password'} 
                  placeholder="Re-enter password" 
                  value={registerConfirmPassword} 
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)} 
                  className="flex-1 text-xs font-semibold text-slate-800 outline-none bg-transparent" 
                />
                <button type="button" onClick={() => setShowRegConfirmPass(!showRegConfirmPass)} className="text-slate-400 hover:text-slate-650 shrink-0 ml-1">
                  {showRegConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div className="pt-2 border-t border-purple-100/50 mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-2">
                <Gift size={14} className="text-brand-primary" /> Have a Referral Code? <span className="text-slate-300 normal-case">(Optional)</span>
              </label>
              
              {!referralStatus || referralStatus === 'error' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Referral Code" 
                      value={referralCodeInput}
                      onChange={(e) => {
                        setReferralCodeInput(e.target.value.toUpperCase());
                        setReferralStatus(null);
                        setReferralMessage('');
                      }}
                      className={`flex-1 bg-slate-50 border ${referralStatus === 'error' ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-primary'} rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none uppercase tracking-wider`}
                    />
                    <button 
                      type="button"
                      onClick={handleValidateReferral}
                      disabled={!referralCodeInput || referralStatus === 'loading'}
                      className="bg-brand-primary text-white text-[11px] font-bold px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95 transition-all w-[80px] flex justify-center"
                    >
                      {referralStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {referralStatus === 'error' && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">{referralMessage}</p>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/60 rounded-xl p-3 flex items-start gap-3 animate-fade-in shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/50">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-emerald-800">{referralMessage}</h4>
                    <p className="text-[10px] font-bold text-emerald-600/80 mt-0.5">Code Applied: {referralCodeInput}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleRegisterNext}
            disabled={isLoading || !isRegMobileVerified || !registerName || !registerPassword || !registerConfirmPassword}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 press-scale shadow-md transition-all ${
              (isRegMobileVerified && registerName && registerPassword && registerConfirmPassword) && !isLoading
                ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer shadow-purple-500/20' 
                : 'bg-purple-200/40 text-purple-400/60 cursor-not-allowed shadow-none'
            }`}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Register & Continue'} 
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
