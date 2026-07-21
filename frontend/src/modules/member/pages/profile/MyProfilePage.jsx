import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, Camera, LogOut, Globe, Lock, Check, ArrowLeft, Sparkles, ShieldCheck, User, Briefcase, Package, Activity, Users, Gift, Grid, Settings as SettingsIcon, Edit3, Heart, Bookmark, Plus, Crown, MapPin, Sun, Moon, Mail, Phone } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { Avatar } from '../../components/common/Avatar';
import { ActivityDashboard } from './components/ActivityDashboard';
import { AnimatePresence, motion } from 'framer-motion';

const MyProfilePage = () => {
  const navigate = useNavigate();
  
  const { 
    currentUser, 
    logoutUser, 
    updateProfile,
    profilePrivacy,
    followRelations,
    blockedUsers,
    members,
    posts,
    acceptFollowRequest,
    rejectFollowRequest,
    removeFollower,
    unfollowUser,
    updateProfilePrivacy,
    updateGranularPrivacy,
    granularPrivacy,
    unblockUser,
    language,
    setLanguage,
    followedAnnouncements,
    toggleFollowedAnnouncement
  } = useData();

  const [activeTab, setActiveTab] = useState('posts');
  const [showSettingsPage, setShowSettingsPage] = useState(false);

  // Social Links Modal State
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [facebook, setFacebook] = useState(currentUser.facebook || 'https://facebook.com/user');
  const [twitter, setTwitter] = useState(currentUser.twitter || 'https://twitter.com/user');
  const [linkedin, setLinkedin] = useState(currentUser.linkedin || 'https://linkedin.com/in/user');

  // Blocked Users Modal State
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  // Privacy Settings Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // Preferences settings modal states & support form state
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);
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
  
  // Activity Dashboard State
  const [showActivityDashboard, setShowActivityDashboard] = useState(false);
  
  // Highlights State
  const [highlights, setHighlights] = useState([
    { id: 1, title: 'indore ✨', cover: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=150&q=80' },
    { id: 2, title: '💥', cover: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=150&q=80' },
    { id: 3, title: '🤍', cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=150&q=80' },
  ]);
  const [showHighlightSelectionModal, setShowHighlightSelectionModal] = useState(false);
  const [showHighlightCreationModal, setShowHighlightCreationModal] = useState(false);
  const [selectedHighlightItems, setSelectedHighlightItems] = useState([]);
  const [newHighlightTitle, setNewHighlightTitle] = useState('Highlights');

  
  const myId = currentUser?.id || currentUser?._id || 'u1';
  const userGranular = granularPrivacy?.[myId] || granularPrivacy?.u1 || granularPrivacy || {};
  const [myPrivacySetting, setMyPrivacySetting] = useState(profilePrivacy?.[myId] || profilePrivacy?.u1 || 'public');
  const [myPhoneSetting, setMyPhoneSetting] = useState(userGranular.phone || 'followers');
  const [myEmailSetting, setMyEmailSetting] = useState(userGranular.email || 'followers');
  const [myFamilySetting, setMyFamilySetting] = useState(userGranular.familyTree || 'followers');

  // Sync form state when modal opens
  useEffect(() => {
    if (showPrivacyModal) {
      setMyPrivacySetting(profilePrivacy?.[myId] || profilePrivacy?.u1 || 'public');
      const latestGranular = granularPrivacy?.[myId] || granularPrivacy?.u1 || granularPrivacy || {};
      setMyPhoneSetting(latestGranular.phone || 'followers');
      setMyEmailSetting(latestGranular.email || 'followers');
      setMyFamilySetting(latestGranular.familyTree || 'followers');
    }
  }, [showPrivacyModal, profilePrivacy, granularPrivacy, myId]);

  // Members lists Modal State (Followers/Following)
  const [membersListModalType, setMembersListModalType] = useState(null); // 'followers', 'following', or null
  const [membersSearchQuery, setMembersSearchQuery] = useState('');

  useEffect(() => {
    setMembersSearchQuery('');
  }, [membersListModalType]);

  useEffect(() => {
    if (showSocialModal || showPrivacyModal || membersListModalType || showBlockedModal || showActivityDashboard || showHighlightSelectionModal || showHighlightCreationModal || showNotificationsModal || showLanguageModal || showThemeModal || showHelpModal || showAboutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSocialModal, showPrivacyModal, membersListModalType, showBlockedModal, showActivityDashboard, showHighlightSelectionModal, showHighlightCreationModal, showNotificationsModal, showLanguageModal, showThemeModal, showHelpModal, showAboutModal]);

  const handleSaveSocials = () => {
    updateProfile({ facebook, twitter, linkedin });
    setShowSocialModal(false);
  };

  const handleSavePrivacy = () => {
    updateProfilePrivacy(myPrivacySetting);
    updateGranularPrivacy('phone', myPhoneSetting);
    updateGranularPrivacy('email', myEmailSetting);
    updateGranularPrivacy('familyTree', myFamilySetting);
    setShowPrivacyModal(false);
  };

  // Follow states derivations
  const myFollowerRelations = followRelations?.filter(r => r.followingId === myId && r.status === 'accepted') || [];
  const myFollowingRelations = followRelations?.filter(r => r.followerId === myId && r.status === 'accepted') || [];

  const myFollowers = members.filter(m => myFollowerRelations.some(r => r.followerId === m.id));
  const myFollowing = members.filter(m => myFollowingRelations.some(r => r.followingId === m.id));

  // Pending Received Requests
  const pendingRequestsRelations = followRelations?.filter(r => r.followingId === myId && r.status === 'pending') || [];
  const pendingRequests = members.filter(m => pendingRequestsRelations.some(r => r.followerId === m.id));

  // Blocked Members derivation
  const blockedMembersIds = blockedUsers?.filter(b => b.blockerId === myId).map(b => b.blockedId) || [];
  const blockedMembersList = members.filter(m => blockedMembersIds.includes(m.id));

  // My Posts
  const myPosts = posts?.filter(p => p.author.name === currentUser.name) || [];
  const likedPosts = posts?.filter(p => p.isLiked) || [];
  const savedPosts = posts?.filter(p => p.isSaved) || [];

  const renderSettingsPage = () => {
    return (
      <div className="min-h-screen bg-surface pb-24 relative overflow-x-hidden animate-slide-up">
        {/* Header Bar — settings view */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 flex items-center justify-between px-4 h-14 sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)]">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSettingsPage(false)} className="p-1 -ml-1 press-scale">
              <ArrowLeft size={22} className="text-text-primary" />
            </button>
            <h1 className="text-base font-bold text-text-primary tracking-tight">Settings</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-3.5 py-6 space-y-6">
          {/* Premium Upgrade Promotion Banner */}
          <div>
            {!currentUser.isPremium ? (
              <div 
                onClick={() => navigate('/member/profile/upgrade')}
                className="p-4.5 rounded-[24px] bg-gradient-to-r from-rose-500 via-pink-500 to-[#e62e52] text-white shadow-lg shadow-rose-500/15 flex items-center justify-between cursor-pointer press-scale border border-rose-400/20"
              >
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-300 fill-amber-300 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Upgrade Membership</h3>
                  </div>
                  <p className="text-[10px] text-white/90 font-semibold leading-relaxed">
                    Access direct contacts, send 50+ super interests & get a Gold Badge!
                  </p>
                </div>
                <ChevronRight size={18} className="text-white/80 shrink-0 ml-2" />
              </div>
            ) : (
              <div 
                onClick={() => navigate('/member/profile/upgrade')}
                className="p-4.5 rounded-[24px] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white shadow-lg shadow-amber-550/15 flex items-center justify-between cursor-pointer press-scale border border-yellow-400/20"
              >
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-white fill-white/10" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">{currentUser.membershipPlan || 'Pro Max'} Active</h3>
                  </div>
                  <p className="text-[10px] text-white/90 font-semibold leading-relaxed">
                    Valid plan until: {currentUser.membershipExpiry || 'Till Marriage'} · Enjoy premium matchmaking!
                  </p>
                </div>
                <ChevronRight size={18} className="text-white/80 shrink-0 ml-2" />
              </div>
            )}
          </div>

          {/* Follow Requests Manager */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/50 rounded-3xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>👋</span> Follow Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-2.5">
                {pendingRequests.map(reqUser => (
                  <div key={reqUser.id} className="flex items-center justify-between bg-white rounded-2xl p-3 border border-amber-100 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={reqUser.initials} size="sm" color="bg-purple-50 text-brand-primary" />
                      <div>
                        <h4 className="text-[12.5px] font-bold text-text-primary leading-none">{reqUser.name}</h4>
                        <p className="text-[10px] text-text-secondary mt-1">{reqUser.city}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => acceptFollowRequest(reqUser.id)}
                        className="px-3.5 py-1.5 bg-brand-primary text-white rounded-xl text-[11px] font-bold shadow-sm hover:bg-brand-dark press-scale transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => rejectFollowRequest(reqUser.id)}
                        className="px-3.5 py-1.5 bg-gray-100 text-text-secondary rounded-xl text-[11px] font-bold hover:bg-gray-200 press-scale transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Menu Actions List */}
          <div className="space-y-4">
            
            {/* Group 1: Account Info */}
            <div className="bg-white rounded-[24px] overflow-hidden border border-purple-100/10 shadow-[0_8px_30px_rgba(124,58,237,0.03)] divide-y divide-purple-100/20">
              <div className="px-4.5 py-3 bg-purple-50/20 border-b border-purple-100/20">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">Account Information</span>
              </div>
              
              {/* Action 1: Personal Info */}
              <button 
                onClick={() => navigate('/member/profile/edit')}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Personal Info</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Add and update your information</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

              {/* Action 1.5: Family Details */}
              <button 
                onClick={() => navigate('/member/profile/family')}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Family Details</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Manage family tree & details</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

              {/* Action 2: Professional Info */}
              <button 
                onClick={() => navigate('/member/professional/apply')}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Professional Info</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Add business and services</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

              {/* Action 3: Services / Products */}
              <button 
                onClick={() => navigate('/member/professional')}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <Package size={18} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Services / Products</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Your products and business services</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

              {/* Action 4: Social Media Links */}
              <button 
                onClick={() => setShowSocialModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <Globe size={18} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Social Media Links</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Add social media profile links</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>
            </div>

            {/* Group 2: Connections & Privacy */}
            <div className="bg-white rounded-[24px] overflow-hidden border border-purple-100/10 shadow-[0_8px_30px_rgba(124,58,237,0.03)] divide-y divide-purple-100/20">
              <div className="px-4.5 py-3 bg-purple-50/20 border-b border-purple-100/20">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">Security & Sharing</span>
              </div>
              
              {/* Action: Refer & Earn */}
              <button 
                onClick={() => navigate('/member/referral')}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <Gift size={18} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Refer & Earn</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Invite friends and get rewards</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

              {/* Action 5: Privacy Settings */}
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <Lock size={18} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Privacy Settings</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Manage profile privacy</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

              {/* Action: Blocked Users */}
              <button 
                onClick={() => setShowBlockedModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <span className="text-base">🚫</span>
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Blocked Users</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">List of blocked members</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

              {/* Action: Notifications */}
              <button 
                onClick={() => setShowNotificationsModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <span className="text-base">🔔</span>
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Notifications</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Manage announcement alerts</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

            </div>

            {/* Group 2.5: Support & About */}
            <div className="bg-white rounded-[24px] overflow-hidden border border-purple-100/10 shadow-[0_8px_30px_rgba(124,58,237,0.03)] divide-y divide-purple-100/20">
              <div className="px-4.5 py-3 bg-purple-50/20 border-b border-purple-100/20">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">Support & Info</span>
              </div>

              {/* Action: Help & Support */}
              <button 
                onClick={() => setShowHelpModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <span className="text-base">🛡️</span>
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">Help & Support</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Contact community admin</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>

              {/* Action: About */}
              <button 
                onClick={() => setShowAboutModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center shrink-0 border border-purple-100/40 shadow-sm">
                    <span className="text-base">ℹ️</span>
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-text-primary block">About MeriSamaj</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Version info & details</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-purple-300" />
              </button>
            </div>

            {/* Group 3: Session Management */}
            <div className="bg-white rounded-[24px] overflow-hidden border border-purple-100/10 shadow-[0_8px_30px_rgba(124,58,237,0.03)] divide-y divide-purple-100/20">
              {/* Action 6: Logout */}
              <button 
                onClick={() => {
                  logoutUser();
                  navigate('/member/login', { state: { skipLanguage: true } });
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50/30 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 group-hover:bg-red-100/60 text-red-500 flex items-center justify-center shrink-0 border border-red-100/40 shadow-sm">
                    <LogOut size={18} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-red-500 block">Logout</span>
                    <span className="text-[9.5px] font-medium text-text-secondary mt-0.5 block leading-none">Logout from the application</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-red-400" />
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface pb-24 relative overflow-x-hidden">
      {showSettingsPage ? (
        renderSettingsPage()
      ) : (
        <>
          {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 flex items-center justify-between px-4 h-14 sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/member/social')} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary tracking-tight">My Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettingsPage(true)}
            className="p-2 rounded-full transition-all duration-300 press-scale text-text-primary hover:bg-slate-100/60"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto sm:px-4 py-0 sm:py-6 space-y-4">
        
        {/* ─── PROFILE HEADER CARD ─── */}
        <div className="bg-white sm:rounded-[28px] overflow-hidden border-b sm:border border-purple-100/10 shadow-[0_8px_30px_rgba(124,58,237,0.04)] relative">
          {/* Cover photo banner */}
          <div className="h-56 sm:h-72 w-full relative bg-gradient-to-br from-purple-900/15 via-[#25175a]/10 to-[#1e1145]/15 overflow-hidden">
            <img 
              src={currentUser.cover || "https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=800&q=80"} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
            {/* Gradient cover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            
            {/* Floating decoration bubbles for 3D depth */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-6 right-20 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl animate-bounce" />
            
            {/* Cover Upload Trigger */}
            <label className="absolute top-3.5 right-3.5 w-8.5 h-8.5 bg-black/40 hover:bg-black/65 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/25 cursor-pointer transition-all press-scale shadow-md z-10">
              <Camera size={13} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      updateProfile({ cover: event.target.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Profile details block */}
          <div className="px-4.5 pb-3.5 pt-3 relative flex flex-row-reverse items-stretch justify-between gap-4 sm:gap-6">
            
            {/* Overlapping Avatar */}
            <div className="shrink-0 z-10 mr-1 sm:mr-3 flex flex-col items-center justify-between pb-1 self-stretch">
              <div className="-mt-[70px] sm:-mt-[88px] relative">
                {/* Glowing ring */}
                <div className={`w-[110px] h-[110px] sm:w-[135px] sm:h-[135px] rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-[3px] bg-white border ${
                  currentUser.isPremium 
                    ? 'border-amber-400 bg-gradient-to-tr from-amber-500 to-yellow-350 shadow-[0_8px_20px_rgba(245,158,11,0.25)]' 
                    : 'border-brand-primary/25 bg-gradient-to-tr from-purple-500 to-indigo-400 shadow-[0_8px_20px_rgba(124,58,237,0.15)]'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white">
                    <Avatar initials={currentUser.initials} src={currentUser.avatar} size="xl" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>

                {/* Avatar Camera trigger */}
                <label className={`absolute bottom-0.5 right-0.5 w-8.5 h-8.5 text-white rounded-full shadow-md flex items-center justify-center press-scale border-[1.5px] border-white cursor-pointer transition-all ${
                  currentUser.isPremium ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-primary hover:bg-brand-dark'
                }`}>
                  <Camera size={12} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updateProfile({ avatar: event.target.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Follow count statistics bar */}
              <div className="flex-1 flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-bold text-slate-500 mt-4 sm:mt-6 text-center whitespace-nowrap">
                <button onClick={() => setMembersListModalType('followers')} className="hover:text-brand-primary transition-colors press-scale">
                  <span className="font-extrabold text-slate-800">{myFollowers.length}</span> <span className="text-slate-400 font-medium">followers</span>
                </button>
                <span className="text-slate-300">•</span>
                <button onClick={() => setMembersListModalType('following')} className="hover:text-brand-primary transition-colors press-scale">
                  <span className="font-extrabold text-slate-800">{myFollowing.length}</span> <span className="text-slate-400 font-medium">following</span>
                </button>
              </div>
            </div>

            {/* User credentials details */}
            <div className="text-left space-y-2 flex-1 pt-0 sm:pt-0.5 ml-1 sm:ml-3">
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="text-[17px] xs:text-[20px] sm:text-[25px] font-black text-slate-800 tracking-tight leading-none flex items-center gap-1.5 break-words flex-wrap max-w-full">
                  {currentUser.name}
                  {profilePrivacy?.u1 === 'private' && <span className="text-xs">🔒</span>}
                  {currentUser.isVerified && <CheckCircle size={18} className="text-emerald-500 fill-emerald-50 shrink-0" />}
                </h2>
                {currentUser.isPremium ? (
                  <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm tracking-wider flex items-center gap-0.5 border border-amber-400/20">
                    👑 {currentUser.membershipPlan || 'PRO'}
                  </span>
                ) : (
                  <span className="bg-purple-50 text-brand-primary text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded border border-purple-100/50 tracking-wider">
                    Member
                  </span>
                )}
              </div>

              {/* Bio metadata columns */}
              <div className="text-[12px] sm:text-[14.5px] font-semibold text-slate-500 flex flex-col gap-2 mt-2.5">
                <p className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400 shrink-0" /> 
                  <span>{currentUser.profession || 'Community Member'}{currentUser.company ? ` at ${currentUser.company}` : ''}</span>
                </p>
                {(currentUser.city || currentUser.state) && (
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" /> 
                    <span>{currentUser.city}{currentUser.city && currentUser.state && ', '}{currentUser.state}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400 shrink-0" /> 
                  <span>{currentUser.community || 'Community Not Assigned'}{currentUser.subCommunity ? ` (${currentUser.subCommunity})` : ''}</span>
                </p>
                {currentUser.phone && (
                  <p className="flex items-center gap-2 flex-wrap text-[11px] sm:text-[13.5px] text-slate-450 mt-0.5">
                    <Phone size={12} className="text-slate-400 shrink-0" /> 
                    <span>{currentUser.phone}</span>
                  </p>
                )}
                {currentUser.email && (
                  <p className="flex items-center gap-2 flex-wrap text-[11px] sm:text-[13.5px] text-slate-450">
                    <Mail size={12} className="text-slate-400 shrink-0" /> 
                    <span className="truncate max-w-[170px] sm:max-w-xs">{currentUser.email}</span>
                  </p>
                )}
              </div>

              {/* Social Links Badge */}
              {(currentUser.linkedin || currentUser.facebook || currentUser.twitter) && (
                <a 
                  href={currentUser.linkedin || currentUser.facebook || currentUser.twitter} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[13px] font-bold text-brand-primary inline-flex items-center gap-1.5 mt-1 bg-purple-50 hover:bg-purple-100/70 border border-purple-100/30 px-3.5 py-1.5 rounded-full transition-colors truncate max-w-full"
                >
                  <Globe size={13} /> {new URL(currentUser.linkedin || currentUser.facebook || currentUser.twitter || 'https://linktr.ee/user').hostname}
                </a>
              )}



            </div>

          </div>
        </div>

        {/* ─── STATISTICS CARDS (Posts, Friends, Family) ─── */}
        <div className="grid grid-cols-3 gap-3 mx-3.5 sm:mx-0">
          {/* Card 1: Posts */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => setActiveTab('posts')}
            className="rounded-[24px] p-4 flex flex-col items-center justify-center text-center bg-white border border-purple-100/10 shadow-sm relative overflow-hidden group transition-all duration-300 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fdfcff 100%)',
              boxShadow: '0 8px 24px -6px rgba(124,58,237,0.04), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100/40 shadow-sm mb-2 text-brand-primary">
              <Grid size={17} />
            </div>
            <span className="text-[17px] font-black text-slate-850 leading-none">{myPosts.length}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2">Posts</span>
          </motion.div>

          {/* Card 2: Friends */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => setMembersListModalType('followers')}
            className="rounded-[24px] p-4 flex flex-col items-center justify-center text-center bg-white border border-purple-100/10 shadow-sm relative overflow-hidden group transition-all duration-300 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fdfcff 100%)',
              boxShadow: '0 8px 24px -6px rgba(124,58,237,0.04), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/40 shadow-sm mb-2 text-blue-500">
              <Users size={17} />
            </div>
            <span className="text-[17px] font-black text-slate-850 leading-none">{myFollowers.length}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2">Friends</span>
          </motion.div>

          {/* Card 3: Family */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => navigate('/member/profile/family')}
            className="rounded-[24px] p-4 flex flex-col items-center justify-center text-center bg-white border border-purple-100/10 shadow-sm relative overflow-hidden group transition-all duration-300 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fdfcff 100%)',
              boxShadow: '0 8px 24px -6px rgba(124,58,237,0.04), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100/40 shadow-sm mb-2 text-rose-500">
              <Heart size={17} fill="currentColor" />
            </div>
            <span className="text-[17px] font-black text-slate-850 leading-none">
              {currentUser.familyMembers?.length || 0}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2">Family</span>
          </motion.div>
        </div>


        {/* ─── HIGHLIGHTS SECTION ─── */}
        <div className="bg-white rounded-3xl p-4 border border-purple-100/10 shadow-sm mx-3.5 sm:mx-0">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide py-1">
            {/* New Highlight Button */}
            <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group" onClick={() => setShowHighlightSelectionModal(true)}>
               <div className="w-14 h-14 rounded-full border border-dashed border-slate-350 flex items-center justify-center bg-white group-hover:bg-slate-50 transition-colors">
                  <Plus size={20} className="text-slate-800" />
               </div>
               <span className="text-[11px] font-semibold text-slate-700">New</span>
            </div>
            {/* Existing Highlights */}
            {highlights.map(h => (
               <div key={h.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
                  <div className="w-14 h-14 rounded-full border-2 border-brand-primary/10 p-[1.5px] bg-white">
                     <img src={h.cover} className="w-full h-full rounded-full object-cover" alt={h.title} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">{h.title}</span>
               </div>
            ))}
          </div>
        </div>

        {/* ─── TAB NAVIGATION BAR ─── */}
        <div className="flex items-center border border-purple-100/30 bg-white/75 backdrop-blur-xl sticky top-14 z-20 rounded-2xl p-1 gap-1 shadow-[0_4px_16px_rgba(124,58,237,0.02)] mx-3.5 sm:mx-0">
          {[
            { id: 'posts', icon: Grid, label: 'Posts' },
            { id: 'liked', icon: Heart, label: 'Liked' },
            { id: 'saved', icon: Bookmark, label: 'Saved' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative press-scale ${
                  isActive ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-650'
                }`}
                style={isActive ? { background: 'rgba(124,58,237,0.07)' } : {}}
              >
                <tab.icon size={19} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                <span className="text-[9px] font-black uppercase tracking-wider mt-1">{tab.label}</span>
                {isActive && (
                  <motion.div layoutId="profileTabActive" className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── TABS CONTENT PANELS ─── */}
        
        {/* Posts Tab Content */}
        {activeTab === 'posts' && (
          <div className="px-0.5 mx-3.5 sm:mx-0">
            <div className="grid grid-cols-3 gap-1 md:gap-1.5">
              {myPosts.length > 0 ? (
                myPosts.map((post) => (
                  <div key={post.id} className="aspect-square bg-white rounded-2xl overflow-hidden relative cursor-pointer hover:opacity-90 border border-slate-100 shadow-sm transition-all press-scale" onClick={() => navigate(`/member/social/${post.id}`)}>
                    {post.image || (post.images && post.images.length > 0) ? (
                      <img src={post.image || post.images[0]} alt="Post thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#fdfcff]/50">
                        <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest mb-1.5 bg-purple-50 px-1.5 py-0.5 rounded">{post.category}</span>
                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 line-clamp-3 leading-tight">{post.content}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[28px] border border-purple-100/10 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                    <Camera size={22} className="text-slate-400" />
                  </div>
                  <h3 className="text-xs font-black text-slate-700">No Posts Yet</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Share a moment with your community.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Liked Tab Content */}
        {activeTab === 'liked' && (
          <div className="px-0.5 mx-3.5 sm:mx-0">
            <div className="grid grid-cols-3 gap-1 md:gap-1.5">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <div key={post.id} className="aspect-square bg-white rounded-2xl overflow-hidden relative cursor-pointer hover:opacity-90 border border-slate-100 shadow-sm transition-all press-scale" onClick={() => navigate(`/member/social/${post.id}`)}>
                    {post.image || (post.images && post.images.length > 0) ? (
                      <img src={post.image || post.images[0]} alt="Post thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#fdfcff]/50">
                        <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest mb-1.5 bg-purple-50 px-1.5 py-0.5 rounded">{post.category}</span>
                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 line-clamp-3 leading-tight">{post.content}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[28px] border border-purple-100/10 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                    <Heart size={22} className="text-slate-400" />
                  </div>
                  <h3 className="text-xs font-black text-slate-700">No Liked Posts</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Posts you like will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Tab Content */}
        {activeTab === 'saved' && (
          <div className="px-0.5 mx-3.5 sm:mx-0">
            <div className="grid grid-cols-3 gap-1 md:gap-1.5">
              {savedPosts.length > 0 ? (
                savedPosts.map((post) => (
                  <div key={post.id} className="aspect-square bg-white rounded-2xl overflow-hidden relative cursor-pointer hover:opacity-90 border border-slate-100 shadow-sm transition-all press-scale" onClick={() => navigate(`/member/social/${post.id}`)}>
                    {post.image || (post.images && post.images.length > 0) ? (
                      <img src={post.image || post.images[0]} alt="Post thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#fdfcff]/50">
                        <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest mb-1.5 bg-purple-50 px-1.5 py-0.5 rounded">{post.category}</span>
                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 line-clamp-3 leading-tight">{post.content}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[28px] border border-purple-100/10 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                    <Bookmark size={22} className="text-slate-400" />
                  </div>
                  <h3 className="text-xs font-black text-slate-700">No Saved Posts</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Posts you save will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Social Links Modal */}
      {showSocialModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-pop border border-purple-100/20" style={{ touchAction: 'auto' }}>
            <h3 className="text-[16px] font-bold text-text-primary">Add Social Media Links</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">Facebook</label>
                <input 
                  type="text" 
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full mt-1 bg-surface border border-purple-100/30 rounded-xl px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">Twitter</label>
                <input 
                  type="text" 
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full mt-1 bg-surface border border-purple-100/30 rounded-xl px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">LinkedIn</label>
                <input 
                  type="text" 
                  value={linkedin}
                  onChange={(e) => setlinkedin(e.target.value)}
                  className="w-full mt-1 bg-surface border border-purple-100/30 rounded-xl px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowSocialModal(false)}
                className="flex-1 py-3 border border-purple-100/30 text-text-primary rounded-2xl font-bold text-xs press-scale text-center hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSocials}
                className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-glow text-white rounded-2xl font-bold text-xs press-scale text-center hover:shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Privacy Settings Modal */}
      {showPrivacyModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-pop border border-purple-100/20 max-h-[85vh] overflow-y-auto" style={{ touchAction: 'auto' }}>
            <div className="flex items-center justify-between border-b border-purple-100/20 pb-2.5">
              <h3 className="text-[16px] font-bold text-text-primary">Privacy Settings</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-purple-300 hover:text-brand-primary w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            
            <div className="space-y-4 pt-1">
              {/* Profile Type Toggle */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-secondary uppercase block">Profile Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMyPrivacySetting('public')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      myPrivacySetting === 'public'
                        ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-purple-200'
                        : 'bg-white border-purple-100/30 text-text-secondary hover:border-purple-200'
                    }`}
                  >
                    🔓 Public
                  </button>
                  <button
                    onClick={() => setMyPrivacySetting('private')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      myPrivacySetting === 'private'
                        ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-purple-200'
                        : 'bg-white border-purple-100/30 text-text-secondary hover:border-purple-200'
                    }`}
                  >
                    🔒 Private
                  </button>
                </div>
              </div>

              {/* Granular Option: Phone */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-secondary uppercase">Mobile Visibility</label>
                <select
                  value={myPhoneSetting}
                  onChange={(e) => setMyPhoneSetting(e.target.value)}
                  className="w-full bg-surface border border-purple-100/30 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers Only</option>
                  <option value="private">Only Me</option>
                </select>
              </div>

              {/* Granular Option: Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-secondary uppercase">Email Visibility</label>
                <select
                  value={myEmailSetting}
                  onChange={(e) => setMyEmailSetting(e.target.value)}
                  className="w-full bg-surface border border-purple-100/30 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers Only</option>
                  <option value="private">Only Me</option>
                </select>
              </div>

              {/* Granular Option: Family Tree */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-secondary uppercase">Family Tree Visibility</label>
                <select
                  value={myFamilySetting}
                  onChange={(e) => setMyFamilySetting(e.target.value)}
                  className="w-full bg-surface border border-purple-100/30 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers Only</option>
                  <option value="private">Only Me</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-purple-100/20">
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="flex-1 py-3 border border-purple-100/30 text-text-primary rounded-2xl font-bold text-xs press-scale text-center hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePrivacy}
                className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-glow text-white rounded-2xl font-bold text-xs press-scale text-center hover:shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Members List Modal (Followers / Following) */}
      {membersListModalType && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col h-[80vh] max-h-[80vh] animate-scale-pop border border-purple-100/20" style={{ touchAction: 'auto' }}>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100/20 shrink-0">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                {membersListModalType === 'followers' ? 'Followers' : 'Following'}
              </h3>
              <button 
                onClick={() => setMembersListModalType(null)}
                className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 flex items-center justify-center text-brand-primary font-bold transition-all active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="mt-3.5 mb-2 shrink-0 relative">
              <input
                type="text"
                placeholder="Search by name, city, gotra..."
                value={membersSearchQuery}
                onChange={(e) => setMembersSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-purple-100/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-inner"
              />
              <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
              {membersSearchQuery && (
                <button
                  onClick={() => setMembersSearchQuery('')}
                  className="absolute right-3.5 top-3 text-[10px] font-black text-slate-400 hover:text-slate-650"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto py-4 space-y-3 flex-1 min-h-[200px]">
              {(() => {
                const listToRender = (membersListModalType === 'followers' ? myFollowers : myFollowing)
                  .filter(m => {
                    const q = membersSearchQuery.toLowerCase();
                    return (
                      m.name?.toLowerCase().includes(q) ||
                      m.city?.toLowerCase().includes(q) ||
                      m.profession?.toLowerCase().includes(q) ||
                      m.subCommunity?.toLowerCase().includes(q)
                    );
                  });
                return listToRender.length > 0 ? (
                  listToRender.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3.5 bg-purple-50/30 border border-purple-100/20 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={m.initials} size="sm" color="bg-purple-100 text-brand-primary font-bold" />
                        <div>
                          <h4 className="text-[13px] font-bold text-text-primary leading-none">{m.name}</h4>
                          <p className="text-[10px] text-text-secondary mt-1">{m.city}</p>
                        </div>
                      </div>
                      {membersListModalType === 'followers' ? (
                        <button
                          onClick={() => removeFollower(m.id)}
                          className="px-3.5 py-1.5 bg-red-50 text-red-650 hover:bg-red-100/60 rounded-xl text-[11px] font-bold press-scale transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => unfollowUser(m.id)}
                          className="px-3.5 py-1.5 bg-purple-50 text-brand-primary hover:bg-purple-100/60 rounded-xl text-[11px] font-bold press-scale transition-colors"
                        >
                          Unfollow
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-text-muted">
                    <p className="text-xs font-semibold">
                      {membersSearchQuery ? 'No search results found.' : `No ${membersListModalType === 'followers' ? 'followers' : 'following'} found.`}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Blocked Users Modal */}
      {showBlockedModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col max-h-[75vh] animate-scale-pop border border-purple-100/20" style={{ touchAction: 'auto' }}>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100/20 shrink-0">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                Blocked Users
              </h3>
              <button 
                onClick={() => setShowBlockedModal(false)}
                className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 flex items-center justify-center text-brand-primary font-bold transition-all active:scale-95"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto py-4 space-y-3 flex-1 min-h-[200px]">
              {blockedMembersList.length > 0 ? (
                blockedMembersList.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3.5 bg-purple-50/30 border border-purple-100/20 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={m.initials} size="sm" color="bg-red-50 text-red-650 font-bold animate-pulse-glow" />
                      <div>
                        <h4 className="text-[13px] font-bold text-text-primary leading-none">{m.name}</h4>
                        <p className="text-[10px] text-text-secondary mt-1">{m.city}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => unblockUser(m.id)}
                      className="px-3.5 py-1.5 bg-purple-50 text-brand-primary hover:bg-purple-100/60 rounded-xl text-[11px] font-bold press-scale transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-text-muted">
                  <p className="text-xs font-semibold">
                    No blocked users found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <AnimatePresence>
        {showActivityDashboard && (
          <ActivityDashboard onClose={() => setShowActivityDashboard(false)} />
        )}
      </AnimatePresence>

      {/* Highlight Selection Modal */}
      {showHighlightSelectionModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0c0c0c] flex flex-col animate-slide-up h-full w-full max-w-md mx-auto" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 shrink-0">
            <div className="flex items-center gap-6">
              <button onClick={() => setShowHighlightSelectionModal(false)} className="text-white p-1 -ml-1 active:scale-95 transition-transform">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-white text-[19px] font-semibold tracking-tight">Add to highlight</h2>
            </div>
            <button 
              onClick={() => {
                setShowHighlightSelectionModal(false);
                setShowHighlightCreationModal(true);
              }}
              disabled={selectedHighlightItems.length === 0}
              className={`text-[15px] font-semibold tracking-wide ${selectedHighlightItems.length > 0 ? 'text-[#0095f6]' : 'text-white/40'}`}
            >
              Next
            </button>
          </div>
          {/* Grid of user's posts */}
          <div className="flex-1 overflow-y-auto bg-[#0c0c0c] p-[1px]" style={{ touchAction: 'auto' }}>
            <div className="grid grid-cols-3 gap-[2px]">
              {(() => {
                const userImages = posts.filter(p => p.author.id === currentUser.id && p.images && p.images.length > 0).flatMap(p => p.images);
                const displayImages = userImages.length > 0 ? userImages : [
                  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=500&q=80',
                  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=500&q=80',
                  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80',
                  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=500&q=80',
                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80',
                  'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=500&q=80'
                ];
                
                return displayImages.map((imgUrl, idx) => {
                  const isSelected = selectedHighlightItems.includes(imgUrl);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (isSelected) {
                          setSelectedHighlightItems(prev => prev.filter(url => url !== imgUrl));
                        } else {
                          setSelectedHighlightItems(prev => [...prev, imgUrl]);
                        }
                      }}
                      className="aspect-[9/16] bg-gray-900 relative cursor-pointer overflow-hidden group"
                    >
                      <img src={imgUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10 group-active:bg-black/30 transition-colors" />
                      <div className="absolute top-2 right-2">
                        <div className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-[#0095f6] border-[#0095f6] scale-100 opacity-100' 
                            : 'border-white/80 bg-black/20 backdrop-blur-sm opacity-80'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Highlight Creation Modal */}
      {showHighlightCreationModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0c0c0c] flex flex-col animate-slide-up h-full w-full max-w-md mx-auto" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 shrink-0">
            <div className="flex items-center gap-6">
              <button onClick={() => {
                setShowHighlightCreationModal(false);
                setShowHighlightSelectionModal(true);
              }} className="text-white p-1 -ml-1 active:scale-95 transition-transform">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-white text-[19px] font-semibold tracking-tight">New highlight</h2>
            </div>
            <button 
              onClick={() => {
                setHighlights(prev => [{
                  id: Date.now(),
                  title: newHighlightTitle || 'Highlights',
                  cover: selectedHighlightItems[0]
                }, ...prev]);
                setShowHighlightCreationModal(false);
                setSelectedHighlightItems([]);
                setNewHighlightTitle('Highlights');
              }}
              className="text-[#0095f6] text-[15px] font-semibold tracking-wide active:text-white/70 transition-colors"
            >
              Done
            </button>
          </div>
          {/* Edit Cover & Title */}
          <div className="flex-1 flex flex-col items-center pt-16 px-6" style={{ touchAction: 'auto' }}>
            <div className="w-[88px] h-[88px] rounded-full p-[2px] bg-gradient-to-tr from-gray-500 to-gray-300 mb-3 shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0c0c0c] border-[3px] border-[#0c0c0c]">
                <img src={selectedHighlightItems[0]} className="w-full h-full object-cover" />
              </div>
            </div>
            <button className="text-[#0095f6] text-[13.5px] font-medium mb-8 active:opacity-70 transition-opacity">Edit cover</button>
            <div className="w-full max-w-[200px] relative">
              <input 
                type="text"
                value={newHighlightTitle}
                onChange={(e) => setNewHighlightTitle(e.target.value)}
                className="w-full bg-transparent border-b-[1.5px] border-[#0095f6] text-center text-white text-[17px] font-medium outline-none pb-2 placeholder:text-white/30 focus:border-[#0095f6] transition-colors"
                placeholder="Highlights"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Notifications Preferences Modal */}
      {showNotificationsModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-pop border border-purple-100/20 max-h-[85vh] overflow-y-auto" style={{ touchAction: 'auto' }}>
            <div className="flex items-center justify-between border-b border-purple-100/20 pb-2.5">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <span>🔔</span> Notifications
              </h3>
              <button onClick={() => setShowNotificationsModal(false)} className="text-purple-300 hover:text-brand-primary w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="space-y-3 pt-1">
              {[
                { key: 'announcements', label: 'Community Announcements' },
                { key: 'matrimonial', label: 'Matrimonial Alerts' },
                { key: 'events', label: 'Event RSVP Alerts' },
                { key: 'groups', label: 'Group Chat Messages' }
              ].map((opt) => {
                const isActive = followedAnnouncements?.[opt.key] !== false;
                return (
                  <div key={opt.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60">
                    <span className="text-[13px] font-bold text-slate-700">{opt.label}</span>
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
        </div>,
        document.body
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-pop border border-purple-100/20" style={{ touchAction: 'auto' }}>
            <div className="flex items-center justify-between border-b border-purple-100/20 pb-2.5">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <span>🌐</span> Select Language
              </h3>
              <button onClick={() => setShowLanguageModal(false)} className="text-purple-300 hover:text-brand-primary w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="space-y-2.5 pt-1">
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
                      setShowLanguageModal(false);
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
        </div>,
        document.body
      )}

      {/* Theme Settings Modal */}
      {showThemeModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-pop border border-purple-100/20" style={{ touchAction: 'auto' }}>
            <div className="flex items-center justify-between border-b border-purple-100/20 pb-2.5">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <span>📱</span> Theme Settings
              </h3>
              <button onClick={() => setShowThemeModal(false)} className="text-purple-300 hover:text-brand-primary w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
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
                      setShowThemeModal(false);
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
        </div>,
        document.body
      )}

      {/* Help & Support Modal */}
      {showHelpModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-pop border border-purple-100/20" style={{ touchAction: 'auto' }}>
            <div className="flex items-center justify-between border-b border-purple-100/20 pb-2.5">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <span>🛡️</span> Contact Support
              </h3>
              <button onClick={() => {
                setShowHelpModal(false);
                setSupportSubmitted(false);
                setSupportMessage('');
              }} className="text-purple-300 hover:text-brand-primary w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center font-bold">✕</button>
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
              <form onSubmit={(e) => {
                e.preventDefault();
                if (supportMessage.trim()) {
                  setSupportSubmitted(true);
                  setTimeout(() => {
                    setSupportSubmitted(false);
                    setSupportMessage('');
                    setShowHelpModal(false);
                  }, 2000);
                }
              }} className="space-y-4">
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
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* About MeriSamaj Modal */}
      {showAboutModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ touchAction: 'none' }} onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-pop border border-purple-100/20" style={{ touchAction: 'auto' }}>
            <div className="flex items-center justify-between border-b border-purple-100/20 pb-2.5">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <span>ℹ️</span> About MeriSamaj
              </h3>
              <button onClick={() => setShowAboutModal(false)} className="text-purple-300 hover:text-brand-primary w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="space-y-4 text-slate-600 text-[13px] leading-relaxed pt-1">
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyProfilePage;
