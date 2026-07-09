import React, { useState } from 'react';
import { Lock, Shield, AlertTriangle, Eye, EyeOff, ShieldCheck, Phone } from 'lucide-react';
import { calculatePasswordStrength } from '../utils/validators';

export const SecurityCenter = ({ changePassword, toggle2FA, profile }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const strength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordsMatch && strength.score >= 50) {
      changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-neo p-6">
        <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
          <Lock size={16} className="text-brand-primary" />
          Change Password
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            
            {newPassword && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all`} style={{ width: `${strength.score}%` }}></div>
                </div>
                <span className={`text-[10px] font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              className={`w-full px-4 py-2.5 rounded-xl border ${newPassword && !passwordsMatch ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/10'} focus:ring-4 transition-all text-sm font-medium`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {newPassword && !passwordsMatch && (
              <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Passwords do not match</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!passwordsMatch || strength.score < 50}
            className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Password
          </button>
        </form>
      </div>

      <div className="card-neo p-6 border border-emerald-100/50">
        <h3 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
          <Shield size={16} className={profile?.twoFactorEnabled ? 'text-emerald-500' : 'text-gray-400'} />
          Two-Factor Authentication (2FA)
        </h3>
        <p className="text-xs text-gray-500 mb-6 max-w-2xl">
          Add an extra layer of security to your account. When enabled, you'll be required to provide a code in addition to your password when signing in.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <div className={`flex-1 p-4 rounded-xl border ${profile?.twoFactorEnabled ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-200 bg-gray-50'} flex items-start gap-4`}>
            <div className={`p-2 rounded-lg ${profile?.twoFactorEnabled ? 'bg-emerald-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1">Email OTP</h4>
              <p className="text-[11px] text-gray-500 mb-3">Receive a verification code at {profile?.email}</p>
              <button 
                onClick={() => toggle2FA(!profile?.twoFactorEnabled, 'email')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${profile?.twoFactorEnabled ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
              >
                {profile?.twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-4 opacity-70">
            <div className="p-2 rounded-lg bg-white text-gray-400 shadow-sm">
              <Phone size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">SMS OTP <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] uppercase">Coming Soon</span></h4>
              <p className="text-[11px] text-gray-500 mb-3">Receive a verification code via SMS</p>
              <button disabled className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gray-200 text-gray-400 cursor-not-allowed">
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
