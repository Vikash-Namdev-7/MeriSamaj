import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, Camera, LogOut, Globe, Lock, Check, ArrowLeft, Sparkles, ShieldCheck, User, Briefcase, Package, Activity, Users, Gift, Grid, Settings as SettingsIcon, Edit3, Heart, Bookmark, Plus } from 'lucide-react';
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
    unblockUser
  } = useData();

  const [activeTab, setActiveTab] = useState('posts');

  // Social Links Modal State
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [facebook, setFacebook] = useState(currentUser.facebook || 'https://facebook.com/user');
  const [twitter, setTwitter] = useState(currentUser.twitter || 'https://twitter.com/user');
  const [linkedin, setLinkedin] = useState(currentUser.linkedin || 'https://linkedin.com/in/user');

  // Blocked Users Modal State
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  // Privacy Settings Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
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

  
  const userGranular = granularPrivacy?.u1 || granularPrivacy || {};
  const [myPrivacySetting, setMyPrivacySetting] = useState(profilePrivacy?.u1 || 'public');
  const [myPhoneSetting, setMyPhoneSetting] = useState(userGranular.phone || 'followers');
  const [myEmailSetting, setMyEmailSetting] = useState(userGranular.email || 'followers');
  const [myFamilySetting, setMyFamilySetting] = useState(userGranular.familyTree || 'followers');

  // Sync form state when modal opens
  useEffect(() => {
    if (showPrivacyModal) {
      setMyPrivacySetting(profilePrivacy?.u1 || 'public');
      const latestGranular = granularPrivacy?.u1 || granularPrivacy || {};
      setMyPhoneSetting(latestGranular.phone || 'followers');
      setMyEmailSetting(latestGranular.email || 'followers');
      setMyFamilySetting(latestGranular.familyTree || 'followers');
    }
  }, [showPrivacyModal, profilePrivacy, granularPrivacy]);

  // Members lists Modal State (Followers/Following)
  const [membersListModalType, setMembersListModalType] = useState(null); // 'followers', 'following', or null

  useEffect(() => {
    if (showSocialModal || showPrivacyModal || membersListModalType || showBlockedModal || showActivityDashboard || showHighlightSelectionModal || showHighlightCreationModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSocialModal, showPrivacyModal, membersListModalType, showBlockedModal, showActivityDashboard, showHighlightSelectionModal, showHighlightCreationModal]);

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
  const myFollowerRelations = followRelations?.filter(r => r.followingId === 'u1' && r.status === 'accepted') || [];
  const myFollowingRelations = followRelations?.filter(r => r.followerId === 'u1' && r.status === 'accepted') || [];

  const myFollowers = members.filter(m => myFollowerRelations.some(r => r.followerId === m.id));
  const myFollowing = members.filter(m => myFollowingRelations.some(r => r.followingId === m.id));

  // Pending Received Requests
  const pendingRequestsRelations = followRelations?.filter(r => r.followingId === 'u1' && r.status === 'pending') || [];
  const pendingRequests = members.filter(m => pendingRequestsRelations.some(r => r.followerId === m.id));

  // Blocked Members derivation
  const blockedMembersIds = blockedUsers?.filter(b => b.blockerId === 'u1').map(b => b.blockedId) || [];
  const blockedMembersList = members.filter(m => blockedMembersIds.includes(m.id));

  // My Posts
  const myPosts = posts?.filter(p => p.author.name === currentUser.name) || [];
  const likedPosts = posts?.filter(p => p.isLiked) || [];
  const savedPosts = posts?.filter(p => p.isSaved) || [];

  return (
    <div className="min-h-screen bg-surface pb-24 relative overflow-x-hidden">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/member/social')} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary tracking-tight">My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Instagram-Inspired Profile Header Block */}
        <div className="bg-white pb-6 pt-4 px-4 shadow-[0_2px_12px_rgba(124,58,237,0.03)] border-b border-purple-100/30">
          
          {/* Top Row: Avatar & Stats */}
          <div className="flex items-center justify-between gap-6">
            <div className="relative shrink-0">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-sm transition-all ${
                currentUser.isPremium 
                  ? 'border-amber-400 p-[2px] bg-gradient-to-tr from-amber-500 to-yellow-300' 
                  : 'border-brand-primary/20 p-[2px] bg-white'
              }`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white">
                  <Avatar initials={currentUser.initials} src={currentUser.avatar} size="xl" className="w-full h-full object-cover" />
                </div>
              </div>
              <label className={`absolute bottom-0 right-0 w-7 h-7 text-white rounded-full shadow-md flex items-center justify-center press-scale border-[1.5px] border-white cursor-pointer ${
                currentUser.isPremium ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-primary hover:bg-brand-dark'
              }`}>
                <Camera size={11} />
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
            
            <div className="flex-1 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <span className="text-[16px] sm:text-[18px] font-black text-text-primary leading-none">{myPosts.length}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary mt-1">Posts</span>
              </div>
              <button onClick={() => setMembersListModalType('followers')} className="flex flex-col items-center press-scale">
                <span className="text-[16px] sm:text-[18px] font-black text-text-primary leading-none">{myFollowers.length}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary mt-1">Followers</span>
              </button>
              <button onClick={() => setMembersListModalType('following')} className="flex flex-col items-center press-scale">
                <span className="text-[16px] sm:text-[18px] font-black text-text-primary leading-none">{myFollowing.length}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary mt-1">Following</span>
              </button>
            </div>
          </div>

          {/* Name & Bio Block */}
          <div className="mt-4 space-y-1">
            <h2 className="text-[15px] font-bold text-text-primary tracking-tight leading-tight flex items-center gap-1.5">
              {currentUser.name}
              {profilePrivacy?.u1 === 'private' && <span className="text-xs">🔒</span>}
              {currentUser.isVerified && <CheckCircle size={14} className="text-emerald-500 fill-emerald-50 shrink-0" />}
              {currentUser.isPremium && (
                <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wider flex items-center gap-0.5 border border-amber-400/20">
                  👑 {currentUser.membershipPlan || 'PRO'}
                </span>
              )}
            </h2>
            <p className="text-[12px] font-semibold text-text-secondary">{currentUser.profession || 'Member'}</p>
            {(currentUser.city || currentUser.state) && (
              <p className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                📍 {currentUser.city}{currentUser.city && currentUser.state && ', '}{currentUser.state}
              </p>
            )}

            {/* Social Links Summary */}
            {(currentUser.linkedin || currentUser.twitter || currentUser.facebook) && (
              <a href={currentUser.linkedin || currentUser.facebook || currentUser.twitter} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-brand-primary flex items-center gap-1 mt-1 truncate">
                <Globe size={12} /> {new URL(currentUser.linkedin || currentUser.facebook || currentUser.twitter || 'https://linktr.ee/user').hostname}
              </a>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 mt-4">
            <button 
              onClick={() => navigate('/member/profile/edit')}
              className="flex-1 py-1.5 bg-purple-50 text-brand-primary rounded-lg text-[13px] font-bold border border-purple-100 shadow-sm press-scale transition-colors"
            >
              Edit Profile
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`http://localhost:5174/member/directory/u1`);
              }}
              className="flex-1 py-1.5 bg-purple-50 text-brand-primary rounded-lg text-[13px] font-bold border border-purple-100 shadow-sm press-scale transition-colors"
            >
              Share Profile
            </button>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="bg-white pb-3 pt-1 px-4 overflow-hidden border-b border-purple-100/30">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
            {/* New Highlight Button */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group" onClick={() => setShowHighlightSelectionModal(true)}>
               <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white group-hover:bg-slate-50 transition-colors">
                  <Plus size={24} className="text-slate-800" />
               </div>
               <span className="text-[12px] font-medium text-slate-800">New</span>
            </div>
            {/* Existing Highlights */}
            {highlights.map(h => (
               <div key={h.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-200 p-[2px]">
                     <img src={h.cover} className="w-full h-full rounded-full object-cover" alt={h.title} />
                  </div>
                  <span className="text-[12px] font-medium text-slate-800">{h.title}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Tabs Below Profile Info */}
        <div className="flex items-center border-b border-purple-100/30 bg-white sticky top-14 z-20">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center transition-all relative ${
              activeTab === 'posts' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Grid size={26} />
            {activeTab === 'posts' && (
              <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 flex items-center justify-center transition-all relative ${
              activeTab === 'liked' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Heart size={26} />
            {activeTab === 'liked' && (
              <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 flex items-center justify-center transition-all relative ${
              activeTab === 'saved' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Bookmark size={26} />
            {activeTab === 'saved' && (
              <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 flex items-center justify-center transition-all relative ${
              activeTab === 'settings' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SettingsIcon size={26} />
            {activeTab === 'settings' && (
              <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
            )}
          </button>
        </div>

        {/* Posts Tab Content */}
        {activeTab === 'posts' && (
          <div className="px-1">
            <div className="grid grid-cols-3 gap-[2px] md:gap-1">
              {myPosts.length > 0 ? (
                myPosts.map((post) => (
                  <div key={post.id} className="aspect-square bg-purple-50/50 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate(`/member/social/${post.id}`)}>
                    {post.image || (post.images && post.images.length > 0) ? (
                      <img src={post.image || post.images[0]} alt="Post thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center border border-purple-100/30">
                        <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider mb-1">{post.category}</span>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 line-clamp-3 leading-tight">{post.content}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-16 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center mb-4">
                    <Camera size={24} className="text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">No Posts Yet</h3>
                  <p className="text-[11px] mt-1">Share a moment with your community.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Liked Tab Content */}
        {activeTab === 'liked' && (
          <div className="px-1">
            <div className="grid grid-cols-3 gap-[2px] md:gap-1">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <div key={post.id} className="aspect-square bg-purple-50/50 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate(`/member/social/${post.id}`)}>
                    {post.image || (post.images && post.images.length > 0) ? (
                      <img src={post.image || post.images[0]} alt="Post thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center border border-purple-100/30">
                        <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider mb-1">{post.category}</span>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 line-clamp-3 leading-tight">{post.content}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-16 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center mb-4">
                    <Heart size={24} className="text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">No Liked Posts</h3>
                  <p className="text-[11px] mt-1">Posts you like will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Tab Content */}
        {activeTab === 'saved' && (
          <div className="px-1">
            <div className="grid grid-cols-3 gap-[2px] md:gap-1">
              {savedPosts.length > 0 ? (
                savedPosts.map((post) => (
                  <div key={post.id} className="aspect-square bg-purple-50/50 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate(`/member/social/${post.id}`)}>
                    {post.image || (post.images && post.images.length > 0) ? (
                      <img src={post.image || post.images[0]} alt="Post thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center border border-purple-100/30">
                        <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider mb-1">{post.category}</span>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 line-clamp-3 leading-tight">{post.content}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-16 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center mb-4">
                    <Bookmark size={24} className="text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">No Saved Posts</h3>
                  <p className="text-[11px] mt-1">Posts you save will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <>
            {/* Premium Upgrade Promotion Banner */}
            <div className="px-4">
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
          <div className="px-4">
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
          </div>
        )}

        {/* Profile Menu Actions List */}
        <div className="px-4">
          <div className="card-neo overflow-hidden divide-y divide-purple-100/20">


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

            {/* Action 6: Logout */}
            <button 
              onClick={() => {
                logoutUser();
                navigate('/member/login');
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
        </>
        )}
      </div>

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
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col max-h-[75vh] animate-scale-pop border border-purple-100/20" style={{ touchAction: 'auto' }}>
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
            
            <div className="overflow-y-auto py-4 space-y-3 flex-1 min-h-[200px]">
              {(membersListModalType === 'followers' ? myFollowers : myFollowing).length > 0 ? (
                (membersListModalType === 'followers' ? myFollowers : myFollowing).map(m => (
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
                    No {membersListModalType === 'followers' ? 'followers' : 'following'} found.
                  </p>
                </div>
              )}
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
    </div>
  );
};

export default MyProfilePage;
