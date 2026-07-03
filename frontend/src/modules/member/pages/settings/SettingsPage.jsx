import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { 
  ChevronRight, Bell, Lock, User, Shield, Info, LogOut, Globe, Smartphone, 
  Check, X, Moon, Sun, ShieldAlert, ArrowLeft, Send
} from 'lucide-react';
import { useData } from '../../context/DataProvider';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { 
    logoutUser, 
    language, 
    setLanguage, 
    profilePrivacy, 
    updateProfilePrivacy, 
    granularPrivacy, 
    updateGranularPrivacy,
    followedAnnouncements,
    toggleFollowedAnnouncement
  } = useData();

  // Modal State: null | 'privacy' | 'notifications' | 'language' | 'appearance' | 'help' | 'about'
  const [activeModal, setActiveModal] = useState(null);

  // Appearance State (Sync with document class)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Privacy states
  const userGranular = granularPrivacy?.u1 || granularPrivacy || {};
  const [privacySetting, setPrivacySetting] = useState(profilePrivacy?.u1 || 'public');
  const [phoneSetting, setPhoneSetting] = useState(userGranular.phone || 'followers');
  const [emailSetting, setEmailSetting] = useState(userGranular.email || 'followers');
  const [familySetting, setFamilySetting] = useState(userGranular.familyTree || 'followers');
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);

  // Help form state
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Settings Actions
  const handleItemClick = (id) => {
    if (id === 'profile') {
      navigate('/member/profile/edit');
    } else {
      setActiveModal(id);
    }
  };

  const handleSavePrivacy = () => {
    updateProfilePrivacy(privacySetting);
    updateGranularPrivacy('phone', phoneSetting);
    updateGranularPrivacy('email', emailSetting);
    updateGranularPrivacy('familyTree', familySetting);
    setActiveModal(null);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (supportMessage.trim()) {
      setSupportSubmitted(true);
      setTimeout(() => {
        setSupportSubmitted(false);
        setSupportMessage('');
        setActiveModal(null);
      }, 2000);
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { id: 'profile', icon: User, label: 'Personal Information', color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'privacy', icon: Lock, label: 'Privacy & Security', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-amber-500', bg: 'bg-amber-50' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { id: 'language', icon: Globe, label: 'Language', color: 'text-indigo-500', bg: 'bg-indigo-50', extra: language === 'en' ? 'English' : 'Hindi' },
        { id: 'appearance', icon: Smartphone, label: 'App Appearance', color: 'text-purple-500', bg: 'bg-purple-50', extra: theme === 'dark' ? 'Dark' : 'Light' },
      ]
    },
    {
      title: 'Support & About',
      items: [
        { id: 'help', icon: Shield, label: 'Help & Support', color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'about', icon: Info, label: 'About MeriSamaj', color: 'text-slate-500', bg: 'bg-slate-100' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-surface pb-20 relative">
      <PageHeader title="Settings" />

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {settingsGroups.map((group, idx) => (
          <div key={idx} className="animate-stagger-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
            <h3 className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest mb-3 px-2">
              {group.title}
            </h3>
            <div className="bg-white rounded-[24px] border border-purple-100/20 overflow-hidden shadow-[0_4px_16px_rgba(109,40,217,0.02)]">
              {group.items.map((item, i) => (
                <div 
                  key={item.id} 
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center justify-between p-4 press-scale cursor-pointer transition-all duration-200 hover:bg-purple-50/30 ${i !== group.items.length - 1 ? 'border-b border-purple-100/10' : ''}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center border border-purple-150/15 shadow-sm`}>
                      <item.icon size={17} className={item.color} strokeWidth={2.2} />
                    </div>
                    <span className="text-[14px] font-extrabold text-text-primary">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.extra && <span className="text-[11px] font-bold text-text-muted">{item.extra}</span>}
                    <ChevronRight size={16} className="text-purple-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="mt-8 mb-4 animate-stagger-fade-in" style={{ animationDelay: '180ms' }}>
          <button 
            onClick={logoutUser}
            className="w-full bg-white border border-rose-100/60 shadow-[0_4px_12px_rgba(239,68,68,0.03)] p-4 flex items-center justify-center gap-2 rounded-[20px] press-scale cursor-pointer hover:bg-rose-50/20 transition-all duration-200"
            style={{ border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <LogOut size={16} className="text-rose-600" strokeWidth={2.5} />
            <span className="text-[14px] font-black text-rose-600 uppercase tracking-wider">Log out</span>
          </button>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest">MeriSamaj App Version 1.2.0</p>
        </div>
      </div>

      {/* ─── MODALS ─── */}

      {/* 1. Privacy & Security Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-up shadow-xl border border-purple-100/30">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Lock size={20} className="text-brand-primary" /> Privacy Settings
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Account Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['public', 'private'].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setPrivacySetting(type)}
                      className={`py-3 rounded-xl text-[13px] font-bold border transition-all ${privacySetting === type ? 'bg-purple-50 border-brand-primary text-brand-primary' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      {type === 'public' ? '🔓 Public' : '🔒 Private'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Visibility */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number Visibility</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowPhoneDropdown(!showPhoneDropdown);
                    setShowEmailDropdown(false);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 outline-none focus:border-brand-primary transition-all text-left flex items-center justify-between"
                >
                  <span>{phoneSetting === 'everyone' ? 'Everyone' : phoneSetting === 'followers' ? 'Followers Only' : 'Only Me'}</span>
                  <ChevronRight size={16} className={`text-slate-400 shrink-0 transition-transform ${showPhoneDropdown ? 'rotate-90' : ''}`} />
                </button>
                {showPhoneDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowPhoneDropdown(false)} />
                    <div className="absolute top-[70px] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                      {[
                        { value: 'everyone', label: 'Everyone' },
                        { value: 'followers', label: 'Followers Only' },
                        { value: 'none', label: 'Only Me' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setPhoneSetting(opt.value);
                            setShowPhoneDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-purple-50 text-[13px] font-bold text-slate-700 flex items-center justify-between border-b border-slate-50 last:border-0"
                        >
                          <span className={phoneSetting === opt.value ? 'text-brand-primary' : ''}>{opt.label}</span>
                          {phoneSetting === opt.value && <Check size={14} className="text-brand-primary" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Email Visibility */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Visibility</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailDropdown(!showEmailDropdown);
                    setShowPhoneDropdown(false);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 outline-none focus:border-brand-primary transition-all text-left flex items-center justify-between"
                >
                  <span>{emailSetting === 'everyone' ? 'Everyone' : emailSetting === 'followers' ? 'Followers Only' : 'Only Me'}</span>
                  <ChevronRight size={16} className={`text-slate-400 shrink-0 transition-transform ${showEmailDropdown ? 'rotate-90' : ''}`} />
                </button>
                {showEmailDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowEmailDropdown(false)} />
                    <div className="absolute top-[70px] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                      {[
                        { value: 'everyone', label: 'Everyone' },
                        { value: 'followers', label: 'Followers Only' },
                        { value: 'none', label: 'Only Me' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setEmailSetting(opt.value);
                            setShowEmailDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-purple-50 text-[13px] font-bold text-slate-700 flex items-center justify-between border-b border-slate-50 last:border-0"
                        >
                          <span className={emailSetting === opt.value ? 'text-brand-primary' : ''}>{opt.label}</span>
                          {emailSetting === opt.value && <Check size={14} className="text-brand-primary" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button 
                onClick={handleSavePrivacy}
                className="w-full py-3 bg-brand-primary text-white rounded-xl text-[14px] font-bold hover:bg-brand-dark transition-colors mt-6 shadow-md shadow-brand-primary/10"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Notifications Preferences Modal */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-up shadow-xl border border-purple-100/30">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Bell size={20} className="text-brand-primary" /> Notifications
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              {[
                { key: 'announcements', label: 'Community Announcements' },
                { key: 'matrimonial', label: 'Matrimonial Alerts' },
                { key: 'events', label: 'Event Registrations & RSVP' },
                { key: 'groups', label: 'Group Chat Messages' }
              ].map((opt) => {
                const isActive = followedAnnouncements?.[opt.key] !== false;
                return (
                  <div key={opt.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[13.5px] font-bold text-slate-700">{opt.label}</span>
                    <button 
                      onClick={() => toggleFollowedAnnouncement(opt.key)}
                      className={`w-11 h-6 rounded-full relative transition-all ${isActive ? 'bg-brand-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 transition-all shadow-sm ${isActive ? 'right-0.75' : 'left-0.75'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Language Selection Modal */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-up shadow-xl border border-purple-100/30">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Globe size={20} className="text-brand-primary" /> Select Language
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { key: 'en', label: 'English' },
                { key: 'hi', label: 'हिन्दी (Hindi)' }
              ].map((langOpt) => {
                const isSelected = language === langOpt.key;
                return (
                  <button 
                    key={langOpt.key}
                    onClick={() => {
                      setLanguage(langOpt.key);
                      setActiveModal(null);
                    }}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between font-bold text-[14px] border transition-all ${isSelected ? 'bg-purple-50 border-brand-primary text-brand-primary' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    <span>{langOpt.label}</span>
                    {isSelected && <Check size={18} className="text-brand-primary animate-scale-in" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. App Appearance Modal */}
      {activeModal === 'appearance' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-up shadow-xl border border-purple-100/30">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Smartphone size={20} className="text-brand-primary" /> Theme Settings
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'light', label: 'Light Mode', icon: Sun, color: 'text-amber-500' },
                { key: 'dark', label: 'Dark Mode', icon: Moon, color: 'text-indigo-600' }
              ].map((mode) => {
                const isSelected = theme === mode.key;
                return (
                  <button 
                    key={mode.key}
                    onClick={() => {
                      setTheme(mode.key);
                      setActiveModal(null);
                    }}
                    className={`p-5 rounded-2xl flex flex-col items-center gap-2.5 border transition-all font-bold text-[13px] ${isSelected ? 'bg-purple-50 border-brand-primary text-brand-primary shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <mode.icon size={22} className={mode.color} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. Help & Support Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-up shadow-xl border border-purple-100/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Shield size={20} className="text-brand-primary" /> Contact Support
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            {supportSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center animate-scale-in">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm mb-3">
                  <Check size={24} />
                </div>
                <h4 className="font-bold text-[15px] text-slate-700">Ticket Submitted</h4>
                <p className="text-[12px] text-slate-500 mt-1 max-w-[220px]">Our support team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">How can we help you?</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe your issue or feedback in detail..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[13px] font-medium outline-none focus:border-brand-primary focus:ring-4 focus:ring-purple-50 transition-all resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-brand-primary text-white rounded-xl text-[14px] font-bold hover:bg-brand-dark flex items-center justify-center gap-1.5 shadow-md shadow-brand-primary/10"
                >
                  <Send size={15} />
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. About MeriSamaj Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-up shadow-xl border border-purple-100/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Info size={20} className="text-brand-primary" /> About MeriSamaj
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-slate-600 text-[13px] leading-relaxed">
              <div className="text-center py-4 bg-purple-50/50 rounded-2xl border border-purple-100/30 mb-2">
                <div className="text-2xl font-black text-brand-primary">MeriSamaj</div>
                <div className="text-[11px] font-bold text-slate-400 mt-0.5">COMMUNITY CONNECT & SERVICES</div>
              </div>

              <p>
                MeriSamaj is a unified platform created to connect family members, manage community bookings, publish announcements, and facilitate matrimonial matchmaking in a highly secure and private digital ecosystem.
              </p>

              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Release Version</span>
                  <span className="font-bold text-slate-700">1.2.0 (Stable)</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Website URL</span>
                  <a href="https://merisamaj.com" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-primary hover:underline">merisamaj.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
