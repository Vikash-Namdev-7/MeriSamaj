import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MessageCircle, Phone, Mail, MapPin, Grid, Info, Users, Globe, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataProvider';
import BranchingFamilyTree from '../../components/family/BranchingFamilyTree';
import { Avatar } from '../../components/common/Avatar';

// English mappings
const cityMap = {
  'Indore': 'Indore, Madhya Pradesh',
  'Jaipur': 'Jaipur, Rajasthan',
  'Bhopal': 'Bhopal, Madhya Pradesh',
  'Ujjain': 'Ujjain, Madhya Pradesh',
  'Ahmedabad': 'Ahmedabad, Gujarat',
  'Lucknow': 'Lucknow, Uttar Pradesh',
  'Delhi': 'Delhi',
  'Kota': 'Kota, Rajasthan',
  'Alwar': 'Alwar, Rajasthan',
  'Bikaner': 'Bikaner, Rajasthan',
  'Udaipur': 'Udaipur, Rajasthan',
  'Pune': 'Pune, Maharashtra',
};

const professionMap = {
  'Architect': 'Architect',
  'Doctor': 'Doctor',
  'Software Engineer': 'Software Engineer',
  'Teacher': 'Teacher',
  'CA': 'CA',
  'Pharmacist': 'Pharmacist',
  'Lawyer': 'Lawyer',
  'Interior Designer': 'Interior Designer',
  'Marketing Manager': 'Marketing Manager',
  'Homemaker': 'Homemaker',
  'Business Owner': 'Business Owner',
};

const businessTypeMap = {
  'Architect': 'Construction & Designing',
  'Doctor': 'Healthcare & Medical',
  'Software Engineer': 'IT & Software Services',
  'Teacher': 'Education Services',
  'CA': 'Financial Audits & Advisory',
  'Pharmacist': 'Pharma Manufacturing & Retail',
  'Lawyer': 'Legal Services & Advisory',
  'Interior Designer': 'Home Decor & Design',
  'Marketing Manager': 'Marketing & Advertising',
  'Homemaker': 'Family Care',
  'Business Owner': 'Manufacturing & Trading',
};

const MemberDetailPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('posts');
  
  const { 
    members, 
    admins,
    profilePrivacy,
    followRelations,
    blockedUsers,
    sendFollowRequest,
    cancelFollowRequest,
    unfollowUser,
    blockUser,
    unblockUser,
    granularPrivacy,
    posts,
    currentUser
  } = useData();

  // Find member in either members or admins list
  const member = members.find(m => m.id === memberId) || 
                 admins.find(a => a.id === memberId) || 
                 members[0];

  // Helper hash function to generate realistic deterministic values for fields
  const getHashValue = (str, offset = 0) => {
    if (!str) return 0;
    return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + offset;
  };
  const hash = getHashValue(member.id);

  // Dynamic deterministic properties matching Screen 3 layout
  const memberIdCode = `SM${7000 + (hash % 999)}`;
  const birthYear = 2026 - (member.age || 40);
  const birthDay = 1 + (hash % 28);
  const birthMonth = 1 + (hash % 12);
  const dobStr = `${birthDay.toString().padStart(2, '0')}/${birthMonth.toString().padStart(2, '0')}/${birthYear}`;
  const phoneNum = member.phone || `98765${(10000 + (hash % 89999))}`;
  const emailAddr = member.email || `${member.name.toLowerCase().replace(/\s+/g, '')}@email.com`;
  const englishCity = cityMap[member.city] || `${member.city}, Rajasthan`;

  // Professional details
  const englishProfession = professionMap[member.profession] || member.role || 'Business Owner';
  const companyName = member.company || `${member.name.split(' ')[1] || 'Sharma'} Industries`;
  const businessSector = businessTypeMap[member.profession] || 'Manufacturing & Trading';
  const estYear = 2000 + (hash % 24);

  // Full Address
  const fullAddress = member.address || `${10 + (hash % 200)}, Vaishali Nagar, ${englishCity} - ${302000 + (hash % 999)}`;

  // Set up mock family list if not present
  const getMockFamilyMembers = (m) => {
    if (m.familyMembers && m.familyMembers.length > 0) {
      return m.familyMembers;
    }
    const lastName = m.name.split(' ')[1] || 'Sharma';
    return [
      { id: `${m.id}-f1`, name: `Sunita ${lastName}`, relation: 'Wife', age: m.age - 3, initials: 'SA' },
      { id: `${m.id}-f2`, name: `Aarav ${lastName}`, relation: 'Son', age: Math.max(5, m.age - 25), initials: 'AA' }
    ];
  };
  const familyMembers = getMockFamilyMembers(member);

  const myId = currentUser?.id || currentUser?._id || 'u1';

  // Follow system state derivations
  const isBlocked = blockedUsers?.some(b => b.blockerId === myId && b.blockedId === member.id);
  const privacy = profilePrivacy?.[member.id] || 'public';
  const isFollowing = followRelations?.some(r => r.followerId === myId && r.followingId === member.id && r.status === 'accepted');
  const hasRequested = followRelations?.some(r => r.followerId === myId && r.followingId === member.id && r.status === 'pending');
  const isPrivate = privacy === 'private';
  const canAccess = member.id === myId || !isPrivate || isFollowing;

  // Get privacy settings for this member
  const memberGranular = granularPrivacy?.[member.id] || 
                         (member.id === myId ? (granularPrivacy?.[myId] || granularPrivacy) : null) || 
                         { phone: 'followers', email: 'followers', familyTree: 'followers' };

  const isMe = member.id === myId;
  
  const isFieldVisible = (fieldSetting) => {
    if (isMe) return true;
    if (fieldSetting === 'public') return true;
    if (fieldSetting === 'followers') return isFollowing;
    return false; // 'private' or 'only me'
  };

  const showPhone = isFieldVisible(memberGranular.phone);
  const showEmail = isFieldVisible(memberGranular.email);
  const showFamily = isFieldVisible(memberGranular.familyTree);

  // Stats
  const memberFollowers = members.filter(m => followRelations?.some(r => r.followingId === member.id && r.followerId === m.id && r.status === 'accepted'));
  const memberFollowing = members.filter(m => followRelations?.some(r => r.followerId === member.id && r.followingId === m.id && r.status === 'accepted'));
  const memberPosts = posts?.filter(p => p.author.id === member.id) || [];

  // Mock Highlights for this user
  const memberHighlights = [
    { id: 1, title: 'Memories', cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=150&q=80' },
    { id: 2, title: 'Travel', cover: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=150&q=80' }
  ];

  return (
    <div className="min-h-screen bg-surface pb-24 relative overflow-x-hidden">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            if (location.state?.fromCity) {
              navigate('/member/leadership', { state: { activeCityDetail: location.state.fromCity } });
            } else {
              navigate(-1);
            }
          }} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary tracking-tight">{member.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Instagram-Inspired Profile Header Block */}
        <div className="bg-white pb-6 pt-4 px-4 shadow-[0_2px_12px_rgba(124,58,237,0.03)] border-b border-purple-100/30">
          
          {/* Top Row: Avatar & Stats */}
          <div className="flex items-center justify-between gap-6">
            <div className="relative shrink-0">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-sm transition-all ${
                member.isPremium 
                  ? 'border-amber-400 p-[2px] bg-gradient-to-tr from-amber-500 to-yellow-300' 
                  : 'border-brand-primary/20 p-[2px] bg-white'
              }`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white">
                  <Avatar initials={member.initials} src={member.avatar} size="xl" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <span className="text-[16px] sm:text-[18px] font-black text-text-primary leading-none">{memberPosts.length}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary mt-1">Posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[16px] sm:text-[18px] font-black text-text-primary leading-none">{memberFollowers.length}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary mt-1">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[16px] sm:text-[18px] font-black text-text-primary leading-none">{memberFollowing.length}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary mt-1">Following</span>
              </div>
            </div>
          </div>

          {/* Name & Bio Block */}
          <div className="mt-4 space-y-1">
            <h2 className="text-[15px] font-bold text-text-primary tracking-tight leading-tight flex items-center gap-1.5">
              {member.name}
              {isPrivate && <span className="text-xs">🔒</span>}
              {member.isVerified && <CheckCircle size={14} className="text-emerald-500 fill-emerald-50 shrink-0" />}
              {member.isPremium && (
                <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wider flex items-center gap-0.5 border border-amber-400/20">
                  👑 PRO
                </span>
              )}
            </h2>
            <p className="text-[12px] font-semibold text-text-secondary">{englishProfession}</p>
            <p className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
              📍 {englishCity}
            </p>
          </div>

          {/* Action Buttons Row */}
          {!isMe && (
            <div className="flex items-center gap-2 mt-4">
              {isBlocked ? (
                <button
                  onClick={() => unblockUser(member.id)}
                  className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-[13px] font-bold shadow-sm press-scale transition-colors"
                >
                  Unblock
                </button>
              ) : isFollowing ? (
                <>
                  <button
                    onClick={() => unfollowUser(member.id)}
                    className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[13px] font-bold shadow-sm press-scale transition-colors"
                  >
                    Following
                  </button>
                  <button
                    onClick={() => navigate(`/member/chat/${member.id}`)}
                    className="flex-1 py-1.5 bg-purple-50 text-brand-primary rounded-lg text-[13px] font-bold border border-purple-100 shadow-sm press-scale transition-colors"
                  >
                    Message
                  </button>
                </>
              ) : hasRequested ? (
                <button
                  onClick={() => cancelFollowRequest(member.id)}
                  className="flex-1 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[13px] font-bold shadow-sm press-scale transition-colors"
                >
                  Requested
                </button>
              ) : (
                <button
                  onClick={() => sendFollowRequest(member.id)}
                  className="flex-1 py-1.5 bg-brand-primary text-white rounded-lg text-[13px] font-bold shadow-sm press-scale transition-colors"
                >
                  Follow
                </button>
              )}
            </div>
          )}
        </div>

        {/* Highlights Section */}
        {canAccess && (
          <div className="bg-white pb-3 pt-1 px-4 overflow-hidden border-b border-purple-100/30">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
              {/* Existing Highlights */}
              {memberHighlights.map(h => (
                 <div key={h.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer">
                    <div className="w-16 h-16 rounded-full border-2 border-slate-200 p-[2px]">
                       <img src={h.cover} className="w-full h-full rounded-full object-cover" alt={h.title} />
                    </div>
                    <span className="text-[12px] font-medium text-slate-800">{h.title}</span>
                 </div>
              ))}
            </div>
          </div>
        )}

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
              <motion.div layoutId="memberProfileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 flex items-center justify-center transition-all relative ${
              activeTab === 'details' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info size={26} />
            {activeTab === 'details' && (
              <motion.div layoutId="memberProfileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {isBlocked ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                <span className="text-3xl">🚫</span>
              </div>
              <h3 className="text-[15px] font-bold text-text-primary">Member is Blocked</h3>
              <p className="text-xs text-text-secondary mt-2 max-w-xs leading-relaxed">
                You have blocked this member. Unblock them first to view their profile details.
              </p>
            </div>
          ) : !canAccess ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-[15px] font-bold text-text-primary">This Profile is Private</h3>
              <p className="text-xs text-text-secondary mt-2 max-w-xs leading-relaxed">
                Only accepted followers can view this member's posts and details.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'posts' && (
                <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                  {memberPosts.length > 0 ? (
                    memberPosts.flatMap(p => p.images).map((imgUrl, idx) => (
                      <div key={idx} className="aspect-square bg-purple-50/50 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity">
                        <img src={imgUrl} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 flex flex-col items-center justify-center py-20">
                      <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center mb-3">
                        <Camera size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-text-primary">No Posts Yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="p-4 space-y-6">
                  {/* Section 1: Personal Information */}
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider pl-1">Personal Information</h3>
                    <div className="bg-white rounded-2xl border border-purple-100/50 shadow-sm divide-y divide-gray-50 overflow-hidden">
                      <InfoField label="Member ID" value={memberIdCode} />
                      <InfoField label="Date of Birth" value={dobStr} />
                      <InfoField label="Mobile Number" value={showPhone ? phoneNum : (memberGranular.phone === 'private' ? '🔒 Private' : '🔒 Followers Only')} />
                      <InfoField label="Email" value={showEmail ? emailAddr : (memberGranular.email === 'private' ? '🔒 Private' : '🔒 Followers Only')} />
                    </div>
                  </div>

                  {/* Section 2: Professional Information */}
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider pl-1">Professional Information</h3>
                    <div className="bg-white rounded-2xl border border-purple-100/50 shadow-sm divide-y divide-gray-50 overflow-hidden">
                      <InfoField label="Company" value={companyName} />
                      <InfoField label="Business" value={businessSector} />
                      <InfoField label="Est. Year" value={estYear.toString()} />
                    </div>
                  </div>

                  {/* Section 3: Address */}
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider pl-1">Address</h3>
                    <div className="bg-white rounded-2xl p-4 border border-purple-100/50 shadow-sm">
                      <div className="flex gap-2.5 items-start">
                        <MapPin size={16} className="text-text-secondary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-text-primary leading-relaxed">{fullAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div className="px-4 py-3.5 flex justify-between items-center text-[13px]">
    <span className="text-text-secondary font-medium">{label}</span>
    <span className="text-text-primary font-bold text-right">{value}</span>
  </div>
);

export default MemberDetailPage;
