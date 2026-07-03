import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import BranchingFamilyTree from '../../components/family/BranchingFamilyTree';

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
    granularPrivacy
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
  
  // Calculate a deterministic date of birth based on age
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

  // Follow system state derivations
  const isBlocked = blockedUsers?.some(b => b.blockerId === 'u1' && b.blockedId === member.id);
  const privacy = profilePrivacy?.[member.id] || 'public';
  const isFollowing = followRelations?.some(r => r.followerId === 'u1' && r.followingId === member.id && r.status === 'accepted');
  const hasRequested = followRelations?.some(r => r.followerId === 'u1' && r.followingId === member.id && r.status === 'pending');
  const isPrivate = privacy === 'private';
  const canAccess = member.id === 'u1' || !isPrivate || isFollowing;

  // Get privacy settings for this member
  const memberGranular = granularPrivacy?.[member.id] || 
                         (member.id === 'u1' ? (granularPrivacy?.u1 || granularPrivacy) : null) || 
                         { phone: 'followers', email: 'followers', familyTree: 'followers' };

  const isMe = member.id === 'u1';
  
  const isFieldVisible = (fieldSetting) => {
    if (isMe) return true;
    if (fieldSetting === 'public') return true;
    if (fieldSetting === 'followers') return isFollowing;
    return false; // 'private' or 'only me'
  };

  const showPhone = isFieldVisible(memberGranular.phone);
  const showEmail = isFieldVisible(memberGranular.email);
  const showFamily = isFieldVisible(memberGranular.familyTree);

  return (
    <div className="min-h-screen bg-surface pb-12">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center gap-3 px-4 h-14 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 press-scale">
          <ArrowLeft size={22} className="text-text-primary" />
        </button>
        <h1 className="text-base font-bold text-text-primary">Member Profile</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 pt-4 px-4">
        {/* Top Profile Card */}
        <div className="bg-card rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-indigo-50 border border-indigo-100/50 flex items-center justify-center font-bold text-3xl text-indigo-700 shadow-inner">
            {member.initials}
          </div>
          
          <div className="flex items-center gap-1.5 mt-4">
            <h2 className="text-lg font-bold text-text-primary">{member.name}</h2>
            {member.isVerified && <CheckCircle size={18} className="text-emerald-500 fill-emerald-50 shrink-0" />}
            {isPrivate && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 border flex items-center gap-0.5">
                🔒 PRIVATE
              </span>
            )}
          </div>
          
          <p className="text-xs font-semibold text-text-secondary mt-1">{englishProfession}</p>
          <p className="text-[10px] font-medium text-text-secondary mt-0.5">{englishCity}</p>

          {/* Follow Button */}
          {member.id !== 'u1' && (
            <div className="w-full mt-4 border-t border-slate-50 pt-4">
              {isBlocked ? (
                <button
                  onClick={() => unblockUser(member.id)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale shadow-sm"
                >
                  Unblock User
                </button>
              ) : isFollowing ? (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => unfollowUser(member.id)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale"
                  >
                    Following
                  </button>
                  <button
                    onClick={() => blockUser(member.id)}
                    className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale"
                  >
                    Block
                  </button>
                </div>
              ) : hasRequested ? (
                <button
                  onClick={() => cancelFollowRequest(member.id)}
                  className="w-full py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale"
                >
                  Requested (Click to Cancel)
                </button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => sendFollowRequest(member.id)}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale shadow-sm shadow-indigo-100"
                  >
                    Follow {isPrivate && '🔒'}
                  </button>
                  <button
                    onClick={() => blockUser(member.id)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale"
                  >
                    Block
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {canAccess && !isBlocked && (
            <div className="w-full grid grid-cols-3 gap-2.5 mt-5 pt-5 border-t border-gray-50">
              <button 
                onClick={() => navigate(`/member/chat/${member.id}`)}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale shadow-sm shadow-indigo-100"
              >
                <MessageCircle size={14} /> Contact
              </button>
              <button 
                onClick={() => navigate(`/member/chat/${member.id}`)}
                className="py-3 bg-card border border-gray-200 text-text-primary rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale hover:bg-gray-50"
              >
                <Mail size={14} /> Message
              </button>
              {showPhone ? (
                <a 
                  href={`tel:${phoneNum}`}
                  className="py-3 bg-card border border-gray-200 text-text-primary rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 press-scale hover:bg-gray-50 text-center"
                >
                  <Phone size={14} /> Call
                </a>
              ) : (
                <button 
                  disabled
                  className="py-3 bg-gray-50 border border-gray-150 text-slate-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed text-center"
                  title="Phone visibility is restricted"
                >
                  <Phone size={14} /> Call
                </button>
              )}
            </div>
          )}
        </div>

        {/* Restricted Area Placeholder / Details Area */}
        {isBlocked ? (
          <div className="bg-card rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center mt-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <span className="text-3xl">🚫</span>
            </div>
            <h3 className="text-[15px] font-bold text-text-primary">Member is Blocked</h3>
            <p className="text-xs text-text-secondary mt-2 max-w-xs leading-relaxed">
              You have blocked this member. Unblock them first to view their profile details.
            </p>
          </div>
        ) : !canAccess ? (
          <div className="bg-card rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center mt-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-[15px] font-bold text-text-primary">This Profile is Private</h3>
            <p className="text-xs text-text-secondary mt-2 max-w-xs leading-relaxed">
              Only accepted followers can view this member's personal info, contact details, and Family Tree.
            </p>
            {!hasRequested && (
              <button
                onClick={() => sendFollowRequest(member.id)}
                className="mt-5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-xs press-scale shadow-sm"
              >
                Send Follow Request
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Section 1: Personal Information */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Personal Information</h3>
              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                <InfoField label="Member ID" value={memberIdCode} />
                <InfoField label="Date of Birth" value={dobStr} />
                <InfoField label="Mobile Number" value={showPhone ? phoneNum : (memberGranular.phone === 'private' ? '🔒 Private' : '🔒 Followers Only')} />
                <InfoField label="Email" value={showEmail ? emailAddr : (memberGranular.email === 'private' ? '🔒 Private' : '🔒 Followers Only')} />
                <InfoField label="City" value={englishCity} />
              </div>
            </div>

            {/* Section 2: Professional Information */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Professional Information</h3>
              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                <InfoField label="Profession" value={englishProfession} />
                <InfoField label="Company" value={companyName} />
                <InfoField label="Business" value={businessSector} />
                <InfoField label="Est. Year" value={estYear.toString()} />
              </div>
            </div>

            {/* Section 3: Address */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Address</h3>
              <div className="bg-card rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex gap-2.5 items-start">
                  <MapPin size={16} className="text-text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Full Address</p>
                    <p className="text-xs font-semibold text-text-primary mt-1 leading-relaxed">{fullAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Family Details (Family Tree) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Family Details (Family Tree)</h3>
              {showFamily ? (
                <div className="bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-2">
                  <div className="w-full overflow-hidden relative rounded-xl border border-gray-50">
                    <BranchingFamilyTree 
                      primaryMember={member} 
                      familyMembers={familyMembers} 
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                  <span className="text-xl">🔒</span>
                  <p className="text-xs font-semibold text-text-secondary mt-2">
                    {memberGranular.familyTree === 'private' ? 'Family details are set to Private' : 'Follow this member to view their Family Tree'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div className="px-4 py-3.5 flex justify-between items-center text-xs font-semibold">
    <span className="text-text-secondary">{label}</span>
    <span className="text-text-primary text-right">{value}</span>
  </div>
);

export default MemberDetailPage;
