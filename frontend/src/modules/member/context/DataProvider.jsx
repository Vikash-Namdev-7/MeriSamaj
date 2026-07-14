import React, { createContext, useContext, useState, useEffect } from 'react';

// Import initial mocks
import { currentUser as initialUser, mockMembers as initialMembers, mockAdmins as initialAdmins } from '../data/mockUsers';
import { mockPosts as initialPosts } from '../data/mockPosts';
import { mockEvents as initialEvents } from '../data/mockEvents';
import { mockMatrimonialProfiles as initialMatrimonial } from '../data/mockMatrimonial';
import { mockObituaries as initialObituaries } from '../data/mockObituaries';
import { mockChats as initialChats, mockMessages as initialMessages } from '../data/mockChats';
import { mockProfessionals as initialProfessionals } from '../data/mockProfessionals';
import invitationService from '../../../core/api/invitationService';

const getCommunitySurname = (community) => {
  if (!community) return 'Agrawal';
  if (community.includes('Mali')) return 'Mali';
  if (community.includes('Gupta')) return 'Gupta';
  if (community.includes('Sharma')) return 'Sharma';
  if (community.includes('Jain')) return 'Jain';
  if (community.includes('Patel')) return 'Patel';
  if (community.includes('Verma')) return 'Verma';
  return 'Agrawal';
};

const initialGroups = [
  { id: 'g1', name: 'Community General Group', initials: 'CG', members: 125, online: 8, posts: 28, category: 'General', lastActivity: '10:30 AM', isJoined: true, description: 'General discussion and announcement group for all community members.', isMuted: false, unread: 5, creatorId: 's1' },
  { id: 'g2', name: 'Youth Group', initials: 'YG', members: 85, online: 4, posts: 15, category: 'Youth', lastActivity: '09:15 AM', isJoined: true, description: 'For networking, career, and creative activities among community youth.', isMuted: false, unread: 2, creatorId: 'u1' },
  { id: 'g3', name: 'Women Group', initials: 'WG', members: 60, online: 2, posts: 45, category: 'Women', lastActivity: 'Yesterday', isJoined: true, description: 'Dialogue on women welfare, empowerment, and cottage industry.', isMuted: false, unread: 0, creatorId: 'm2' },
  { id: 'g4', name: 'Business Group', initials: 'BG', members: 45, online: 5, posts: 8, category: 'Business', lastActivity: 'Yesterday', isJoined: false, description: 'Business platform for community traders, entrepreneurs, and professionals.', isMuted: false, unread: 0, creatorId: 'm3' },
  { id: 'g5', name: 'Education Group', initials: 'EG', members: 55, online: 3, posts: 22, category: 'Education', lastActivity: '18/05/24', isJoined: false, description: 'Information on scholarship, school/college admission, and career guidance.', isMuted: false, unread: 0, creatorId: 's2' },
  { id: 'g6', name: 'Religious & Spiritual Group', initials: 'RG', members: 75, online: 6, posts: 19, category: 'Religious', lastActivity: '17/05/24', isJoined: false, description: 'Group for Satsang, religious festivals, and spiritual discussion.', isMuted: false, unread: 0, creatorId: 's7' }
];

const initialGroupMessages = {
  g1: [
    { id: 1, senderId: 's1', senderName: 'Rajesh Sharma', initials: 'RS', role: 'Admin', text: 'Hello to all members! A meeting has been scheduled at Samaj Bhawan at 7 PM today! Everyone\'s presence is mandatory.', time: '10:30 AM', isMe: false, reactions: ['🔥', '👍'] },
    { id: 2, senderId: 'me', senderName: 'Rajesh Agrawal', initials: 'RA', role: 'Member', text: 'Yes, I will be present.', time: '10:32 AM', isMe: true },
    { id: 3, senderId: 's2', senderName: 'Sushma Devi', initials: 'SD', role: 'Member', text: 'What will be the agenda of the program?', time: '10:35 AM', isMe: false },
    { id: 4, senderId: 's1', senderName: 'Rajesh Sharma', initials: 'RS', role: 'Admin', text: 'Agenda document has been shared in the group.', time: '10:40 AM', isMe: false },
    { id: 5, senderId: 's1', senderName: 'Rajesh Sharma', initials: 'RS', role: 'Admin', time: '10:40 AM', isMe: false, attachment: { type: 'file', name: 'Agenda.pdf', size: '1.2 MB' } },
    { id: 6, senderId: 's3', senderName: 'Veena Patel', initials: 'VP', role: 'Member', text: 'Thank you Admin', time: '10:45 AM', isMe: false }
  ],
  g2: [
    { id: 1, senderId: 's4', senderName: 'Amit', initials: 'AM', role: 'Member', text: 'There is a meeting tomorrow, everyone please come on time.', time: '09:15 AM', isMe: false }
  ],
  g3: [
    { id: 1, senderId: 's5', senderName: 'Reema', initials: 'RM', role: 'Member', text: 'Today\'s program was successful, thank you everyone.', time: 'Yesterday', isMe: false }
  ],
  g4: [
    { id: 1, senderId: 's6', senderName: 'Sunil', initials: 'SL', role: 'Member', text: 'Let\'s talk about the new order tomorrow.', time: 'Yesterday', isMe: false }
  ],
  g5: [
    { id: 1, senderId: 's2', senderName: 'Sudha', initials: 'SH', role: 'Member', text: 'Notes have been shared, please check.', time: '18/05/24', isMe: false }
  ],
  g6: [
    { id: 1, senderId: 's7', senderName: 'Pooja', initials: 'PJ', role: 'Member', text: 'The time for Satsang has been set for 7 PM.', time: '17/05/24', isMe: false }
  ]
};

const initialNotifications = [
  { id: 'n1', type: 'announcement', title: 'Annual Samaj Mahotsav', message: 'Registration is now open for the Annual Mahotsav on Jul 15.', time: '10 min ago', isRead: false },
  { id: 'n2', type: 'matrimonial', title: 'New Interest Received', message: 'Amit Agrawal has expressed interest in your matrimonial profile.', time: '1 hour ago', isRead: false },
  { id: 'n3', type: 'event', title: 'Event Reminder', message: 'Youth Career Seminar is happening tomorrow at 3 PM.', time: '3 hours ago', isRead: true },
  { id: 'n4', type: 'community', title: 'New Member Joined', message: 'Pooja Agrawal from Ahmedabad has joined the community.', time: '5 hours ago', isRead: true },
  { id: 'n5', type: 'announcement', title: 'Office Bearers Meeting', message: 'Monthly meeting scheduled for Sunday, 10 AM at Samaj Bhawan.', time: '1 day ago', isRead: true },
  { id: 'ng1', type: 'group', groupId: 'g1', groupName: 'Agrawal Youth Indore', title: 'New message in Agrawal Youth Indore', message: 'Vikas Jain: Has anyone got the details for the upcoming...', time: '12 min ago', isRead: false },
  { id: 'nv1', type: 'voting', title: 'समाज चुनाव शुरू हुआ', message: 'Samaj Head election voting has started. Cast your vote before Jul 20.', time: '2 hours ago', isRead: false },
  { id: 'nd1', type: 'donation', title: 'योगदान प्राप्त हुआ', message: 'आपके ₹5,000 के योगदान की रसीद जेनरेट हो गई है।', time: '4 hours ago', isRead: false },
  { id: 'nn1', type: 'nimantran', title: 'नया आमंत्रण', message: 'राकेश गुप्ता ने आपको गृह प्रवेश कार्यक्रम में आमंत्रित किया है।', time: '30 min ago', isRead: false },
  { id: 'ns1', type: 'shradhanjali', title: 'श्रद्धांजलि सभा सूचना', message: 'स्व. रामप्रसाद जी की पगड़ी रस्म कल दोपहर 2 बजे रखी गई है।', time: '1 day ago', isRead: false }
];

const defaultSentNotifications = [
  {
    id: 'nlog-1',
    communityId: 'c1',
    type: 'Announcement',
    audience: 'Entire Community',
    title: 'Samaj Bhawan Renovation Fund',
    subtitle: 'Contribution request',
    message: 'We are starting the renovation of our Indore Samaj Bhawan. We request all members to contribute generously to this noble cause.',
    channels: ['Push', 'Email', 'In-App'],
    attachments: [{ name: 'Renovation_Plan.pdf', type: 'document', size: '2.4 MB' }],
    ctaButton: { text: 'Donate Now', url: '/head/funds' },
    status: 'Delivered',
    stats: { sentCount: 120, openCount: 95, clickCount: 42 },
    scheduledTime: null,
    expiryDate: null,
    createdBy: 'Rajesh Agrawal',
    createdTime: '2026-07-01T10:00:00Z',
    isPinned: true
  },
  {
    id: 'nlog-2',
    communityId: 'c1',
    type: 'Event Update',
    audience: 'Volunteers',
    title: 'Volunteer Briefing - Career Seminar',
    subtitle: 'Meeting instructions',
    message: 'All volunteers for tomorrow\'s Youth Career Seminar are requested to assemble at the venue by 2 PM for a final briefing.',
    channels: ['Push', 'SMS'],
    attachments: [],
    ctaButton: null,
    status: 'Delivered',
    stats: { sentCount: 15, openCount: 15, clickCount: 10 },
    scheduledTime: null,
    expiryDate: null,
    createdBy: 'Rajesh Agrawal',
    createdTime: '2026-07-06T15:00:00Z',
    isPinned: false
  },
  {
    id: 'nlog-3',
    communityId: 'c1',
    type: 'Emergency Alert',
    audience: 'Entire Community',
    title: 'Heavy Rain Warning - Meeting Postponed',
    subtitle: 'Urgent notice',
    message: 'Due to the heavy rain warning issued by the meteorological department, today\'s executive body meeting is postponed to next Sunday.',
    channels: ['Push', 'SMS', 'Email', 'In-App'],
    attachments: [],
    ctaButton: null,
    status: 'Delivered',
    stats: { sentCount: 120, openCount: 110, clickCount: 88 },
    scheduledTime: null,
    expiryDate: null,
    createdBy: 'Rajesh Agrawal',
    createdTime: '2026-07-07T08:00:00Z',
    isPinned: false
  },
  {
    id: 'nlog-4',
    communityId: 'c1',
    type: 'Matrimonial Update',
    audience: 'Verified Members',
    title: 'New Matrimonial Profiles Added',
    subtitle: 'Weekly digest',
    message: '5 new matrimonial profiles of brides and grooms have been verified and added to our Agrawal Samaj Indore directory this week.',
    channels: ['Push', 'Email'],
    attachments: [],
    ctaButton: { text: 'View Profiles', url: '/head/matrimonial' },
    status: 'Delivered',
    stats: { sentCount: 95, openCount: 72, clickCount: 30 },
    scheduledTime: null,
    expiryDate: null,
    createdBy: 'Rajesh Agrawal',
    createdTime: '2026-07-05T09:00:00Z',
    isPinned: false
  },
  {
    id: 'nlog-5',
    communityId: 'c1',
    type: 'Announcement',
    audience: 'Committee Members',
    title: 'Monthly Audit Report Discussion',
    subtitle: 'Agenda notice',
    message: 'Please review the monthly audit report sent via email. We will discuss it during the committee meeting next Tuesday.',
    channels: ['Email'],
    attachments: [{ name: 'Audit_Report_June.pdf', type: 'document', size: '1.8 MB' }],
    ctaButton: null,
    status: 'Failed',
    stats: { sentCount: 10, openCount: 0, clickCount: 0 },
    scheduledTime: null,
    expiryDate: null,
    createdBy: 'Rajesh Agrawal',
    createdTime: '2026-07-06T11:00:00Z',
    isPinned: false
  },
  {
    id: 'nlog-6',
    communityId: 'c1',
    type: 'Festival Greeting',
    audience: 'Entire Community',
    title: 'Happy Guru Purnima Greetings',
    subtitle: 'Greetings from President',
    message: 'Wishing all members a very happy and blessed Guru Purnima. Let us follow the path of knowledge and wisdom shown by our gurus.',
    channels: ['Push', 'In-App'],
    attachments: [],
    ctaButton: null,
    status: 'Queued',
    stats: { sentCount: 0, openCount: 0, clickCount: 0 },
    scheduledTime: '2026-07-10T08:00:00Z',
    expiryDate: null,
    createdBy: 'Rajesh Agrawal',
    createdTime: '2026-07-07T12:00:00Z',
    isPinned: false
  }
];

const defaultTemplates = [
  {
    id: 'tpl-1',
    type: 'Community Announcement',
    titleTemplate: 'General Body Meeting - {{communityName}}',
    bodyTemplate: 'Dear Members, you are cordially invited to the general body meeting scheduled on {{date}} at {{time}} at {{location}}. Agenda: audit discussion and election prep.',
    variables: ['communityName', 'date', 'time', 'location'],
    createdBy: 'System'
  },
  {
    id: 'tpl-2',
    type: 'Meeting Reminder',
    titleTemplate: 'Reminder: Committee Meeting Today',
    bodyTemplate: 'Dear Committee Member, this is a gentle reminder for our monthly meeting scheduled today at {{time}} at {{location}}. Please be on time.',
    variables: ['time', 'location'],
    createdBy: 'System'
  },
  {
    id: 'tpl-3',
    type: 'Event Reminder',
    titleTemplate: 'Reminder: {{eventName}}',
    bodyTemplate: 'Hello {{memberName}}, the event "{{eventName}}" is scheduled on {{date}} at {{time}} at {{location}}. We look forward to seeing you.',
    variables: ['memberName', 'eventName', 'date', 'time', 'location'],
    createdBy: 'System'
  },
  {
    id: 'tpl-4',
    type: 'Registration Approved',
    titleTemplate: 'Registration Approved: {{eventName}}',
    bodyTemplate: 'Dear {{memberName}}, your registration for "{{eventName}}" has been approved. Please carry your digital pass for automated attendance check-in.',
    variables: ['memberName', 'eventName'],
    createdBy: 'System'
  },
  {
    id: 'tpl-5',
    type: 'Member Verification',
    titleTemplate: 'Profile Verified: {{communityName}}',
    bodyTemplate: 'Dear {{memberName}}, congratulations! Your member listing in {{communityName}} has been successfully verified. You now have full access to directories and funds.',
    variables: ['memberName', 'communityName'],
    createdBy: 'System'
  }
];

export const getNotificationModule = (type) => {
  if (['announcement', 'event', 'system', 'global'].includes(type)) return 'home';
  if (['matrimonial'].includes(type)) return 'matrimonial';
  if (['nimantran', 'invitation'].includes(type)) return 'nimantran';
  if (['chat', 'group', 'message'].includes(type)) return 'chat';
  if (['donation'].includes(type)) return 'donation';
  if (['voting'].includes(type)) return 'voting';
  if (['shradhanjali'].includes(type)) return 'shradhanjali';
  if (['community', 'member', 'follow_request_sent', 'follow_accept', 'follow_request'].includes(type)) return 'community';
  return 'home';
};

const adaptGroups = (groupsList, community) => {
  const surname = getCommunitySurname(community);
  return groupsList.map(g => {
    const newName = g.name.replaceAll('Agrawal', surname).replaceAll('Mali', surname).replaceAll('Gupta', surname).replaceAll('Sharma', surname).replaceAll('Jain', surname).replaceAll('Patel', surname).replaceAll('Verma', surname);
    const newDesc = g.description.replaceAll('Agrawal', surname).replaceAll('Mali', surname).replaceAll('Gupta', surname).replaceAll('Sharma', surname).replaceAll('Jain', surname).replaceAll('Patel', surname).replaceAll('Verma', surname);
    const newInitials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return {
      ...g,
      name: newName,
      description: newDesc,
      initials: newInitials
    };
  });
};

const adaptGroupMessages = (messagesMap, community) => {
  const surname = getCommunitySurname(community);
  const result = {};
  Object.keys(messagesMap).forEach(key => {
    result[key] = messagesMap[key].map(m => {
      const newName = m.senderName ? m.senderName.replaceAll('Agrawal', surname).replaceAll('Jain', surname).replaceAll('Mali', surname).replaceAll('Gupta', surname).replaceAll('Sharma', surname).replaceAll('Patel', surname).replaceAll('Verma', surname) : '';
      const newInitials = newName ? newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';
      return {
        ...m,
        senderName: newName,
        initials: newInitials,
        text: m.text ? m.text.replaceAll('Agrawal', surname).replaceAll('Jain', surname).replaceAll('Mali', surname).replaceAll('Gupta', surname).replaceAll('Sharma', surname).replaceAll('Patel', surname).replaceAll('Verma', surname) : m.text
      };
    });
  });
  return result;
};

const adaptNotifications = (notificationsList, community) => {
  const surname = getCommunitySurname(community);
  return notificationsList.map(n => {
    const newTitle = n.title.replaceAll('Agrawal', surname).replaceAll('Mali', surname).replaceAll('Gupta', surname);
    const newMessage = n.message.replaceAll('Agrawal', surname).replaceAll('Mali', surname).replaceAll('Gupta', surname);
    const newGroupName = n.groupName ? n.groupName.replaceAll('Agrawal', surname).replaceAll('Mali', surname).replaceAll('Gupta', surname) : undefined;
    return {
      ...n,
      title: newTitle,
      message: newMessage,
      groupName: newGroupName
    };
  });
};

const adaptMembers = (membersList, community) => {
  const surname = getCommunitySurname(community);
  return membersList.map(m => {
    const newName = m.name.replaceAll('Agrawal', surname);
    const newInitials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const newFamily = m.familyMembers?.map(fm => {
      const newFmName = fm.name.replaceAll('Agrawal', surname);
      return {
        ...fm,
        name: newFmName,
        initials: newFmName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      };
    });
    return {
      ...m,
      name: newName,
      initials: newInitials,
      community: community,
      familyMembers: newFamily
    };
  });
};

const adaptAdmins = (adminsList, community) => {
  const surname = getCommunitySurname(community);
  return adminsList.map(a => {
    const newName = a.name.replaceAll('Agrawal', surname);
    const newInitials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return {
      ...a,
      name: newName,
      initials: newInitials,
      community: community
    };
  });
};

const adaptPosts = (postsList, community) => {
  const surname = getCommunitySurname(community);
  return postsList.map(p => {
    const newAuthorName = p.author.name.replaceAll('Agrawal', surname);
    const newAuthorInitials = newAuthorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const newContent = p.content.replaceAll('Agrawal', surname);
    return {
      ...p,
      author: {
        ...p.author,
        name: newAuthorName,
        initials: newAuthorInitials
      },
      content: newContent,
      community: community
    };
  });
};

const adaptStories = (storiesList, community) => {
  const surname = getCommunitySurname(community);
  return storiesList.map(s => {
    const newName = s.name.replaceAll('Agrawal', surname);
    const newInitials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return {
      ...s,
      name: newName,
      initials: newInitials
    };
  });
};

const adaptMatrimonial = (profilesList, currentUser) => {
  if (!currentUser) return profilesList;
  const community = currentUser.community;
  const surname = getCommunitySurname(community);
  
  let oppositeGender = currentUser.gender === 'Male' ? 'Female' : 'Male';
  
  if (currentUser.matrimonySubscription && currentUser.matrimonySubscription.status === 'active') {
    const sub = currentUser.matrimonySubscription;
    if (sub.plan === 'Groom') {
      oppositeGender = 'Female';
    } else if (sub.plan === 'Bride') {
      oppositeGender = 'Male';
    } else if (sub.plan === 'Combo') {
      oppositeGender = sub.activeProfileType === 'groom' ? 'Female' : 'Male';
    }
  }

  return profilesList
    .filter(p => p.gender === oppositeGender)
    .map(p => {
      const newName = p.name.replaceAll('Agrawal', surname);
      const newInitials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return {
        ...p,
        name: newName,
        initials: newInitials,
        community: community
      };
    });
};

const defaultFollowRelations = [
  { followerId: 'u1', followingId: 'm1', status: 'accepted' },
  { followerId: 'm1', followingId: 'u1', status: 'accepted' },
  { followerId: 'm2', followingId: 'u1', status: 'accepted' },
  { followerId: 'm3', followingId: 'u1', status: 'pending' },
  { followerId: 'u1', followingId: 'm2', status: 'pending' }
];

const defaultProfilePrivacy = {
  u1: 'public',
  m1: 'public',
  m2: 'private',
  m3: 'public',
  m4: 'private',
  m5: 'public',
  m6: 'private'
};

const defaultBlockedUsers = [];

const defaultGranularPrivacy = {
  u1: { phone: 'followers', email: 'followers', familyTree: 'followers', gallery: 'followers' },
  m1: { phone: 'public', email: 'public', familyTree: 'public', gallery: 'public' },
  m2: { phone: 'followers', email: 'followers', familyTree: 'followers', gallery: 'followers' },
  m3: { phone: 'private', email: 'private', familyTree: 'private', gallery: 'private' },
  m4: { phone: 'followers', email: 'followers', familyTree: 'followers', gallery: 'followers' },
  m5: { phone: 'public', email: 'public', familyTree: 'public', gallery: 'public' },
  m6: { phone: 'private', email: 'private', familyTree: 'private', gallery: 'private' }
};

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // Helpers for localStorage
  const loadState = (key, defaultState) => {
    try {
      const serialized = localStorage.getItem(`merisamaj_v6_${key}`);
      if (serialized === null) {
        // Save initial to localStorage so it's persisted immediately
        localStorage.setItem(`merisamaj_v6_${key}`, JSON.stringify(defaultState));
        return defaultState;
      }
      return JSON.parse(serialized);
    } catch (err) {
      return defaultState;
    }
  };

  const saveState = (key, state) => {
    try {
      localStorage.setItem(`merisamaj_v6_${key}`, JSON.stringify(state));
    } catch (err) {
      console.error('Could not save state', err);
    }
  };

  // State Definitions
  const [currentUser, setCurrentUser] = useState(() => {
    const loaded = loadState('currentUser', initialUser);
    return {
      ...loaded,
      communityId: loaded?.communityId || 'c1'
    };
  });
  const [members, setMembers] = useState(() => loadState('members', initialMembers));
  const [admins, setAdmins] = useState(() => {
    const loaded = loadState('admins', initialAdmins);
    if (loaded && loaded.length < initialAdmins.length) {
      localStorage.setItem('merisamaj_v6_admins', JSON.stringify(initialAdmins));
      return initialAdmins;
    }
    return loaded;
  });
  const [posts, setPosts] = useState(() => {
    return initialPosts.map((p) => ({
      ...p,
      commentsList: p.commentsList || []
    }));
  });

  const [stories, setStories] = useState(() => {
    return [
      { id: 's1', memberId: 'm1', name: 'Suresh Agrawal', initials: 'SA', avatar: null, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', timestamp: '2 hours ago', hasSeen: false },
      { id: 's1_2', memberId: 'm1', name: 'Suresh Agrawal', initials: 'SA', avatar: null, image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', timestamp: '1 hour ago', text: 'Indore Samaj General Meeting', hasSeen: false },
      { id: 's2', memberId: 'm2', name: 'Kavita Agrawal', initials: 'KA', avatar: null, image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', timestamp: '4 hours ago', hasSeen: false },
      { id: 's2_2', memberId: 'm2', name: 'Kavita Agrawal', initials: 'KA', avatar: null, image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800', timestamp: '3 hours ago', text: 'Mahila Udyog Exhibition', hasSeen: false },
      { id: 's3', memberId: 'm3', name: 'Deepak Agrawal', initials: 'DA', avatar: null, image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800', timestamp: '6 hours ago', hasSeen: false },
      { id: 's4', memberId: 'm4', name: 'Anita Agrawal', initials: 'AA', avatar: null, image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', timestamp: '8 hours ago', hasSeen: false }
    ];
  });

  useEffect(() => {
    localStorage.removeItem('merisamaj_v6_posts');
    localStorage.removeItem('posts');
    setPosts(initialPosts.map((p) => ({
      ...p,
      commentsList: p.commentsList || []
    })));
  }, [initialPosts]);

  const [followedAnnouncements, setFollowedAnnouncements] = useState(() => loadState('followedAnnouncements', {
    announcements: true,
    matrimonial: true,
    events: true,
    groups: true
  }));
  const [events, setEvents] = useState(() => {
    const saved = loadState('events', initialEvents);
    return saved.map((savedEv, index) => {
      // Establish generic RBAC bindings: e1 and e6 belong to the head's community (c1)
      let communityId = 'c2';
      if (savedEv.id === 'e1' || savedEv.id === 'e6') communityId = 'c1';
      else if (savedEv.id === 'e2') communityId = 'c2';
      else if (savedEv.id === 'e3') communityId = 'c3';
      else if (savedEv.id === 'e4') communityId = 'c4';
      else if (savedEv.id === 'e5') communityId = 'c5';

      const initEv = initialEvents.find(e => e.id === savedEv.id);
      const merged = initEv ? { ...initEv, ...savedEv } : savedEv;
      
      return {
        ...merged,
        communityId,
        status: merged.status || 'Published',
        gallery: merged.gallery || [
          { id: 'g1', fileType: 'Photo', fileUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', fileName: 'seminar_crowd.jpg', caption: 'Inauguration Ceremony', isCoverImage: true, isFeaturedImage: true, uploadMetadata: { fileSizeInBytes: 1204500, mimeType: 'image/jpeg', uploadedAt: '2026-07-01T10:00:00Z' }, sortOrder: 1 },
          { id: 'g2', fileType: 'Photo', fileUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', fileName: 'stage_setup.jpg', caption: 'Main Stage View', isCoverImage: false, isFeaturedImage: false, uploadMetadata: { fileSizeInBytes: 890400, mimeType: 'image/jpeg', uploadedAt: '2026-07-01T10:15:00Z' }, sortOrder: 2 },
          { id: 'g3', fileType: 'Document', fileUrl: '#', fileName: 'Event_Brochure.pdf', caption: 'Official Brochure', isCoverImage: false, isFeaturedImage: false, uploadMetadata: { fileSizeInBytes: 2500000, mimeType: 'application/pdf', uploadedAt: '2026-07-02T12:00:00Z' }, sortOrder: 3 }
        ],
        announcements: merged.announcements || [
          { id: 'ann1', content: 'Registrations are now open! Early bird discount available.', status: 'Published', scheduleTime: null, expirationTime: null, communityId, author: 'Shri Mohan Lal Agrawal' },
          { id: 'ann2', content: 'Note: Please carry your membership ID card for automated check-in.', status: 'Published', scheduleTime: null, expirationTime: null, communityId, author: 'Shri Mohan Lal Agrawal' }
        ],
        registrations: merged.registrations || [
          { id: 'reg1', memberId: 'm1', name: 'Suresh Agrawal', phone: '+91 94140 12345', email: 'suresh.architect@email.com', role: 'Architect', avatar: null, registeredAt: '2026-07-01T10:00:00Z', status: 'Approved', attendance: 'Attended', checkinTime: '2026-07-07T10:05:00Z' },
          { id: 'reg2', memberId: 'm2', name: 'Kavita Agrawal', phone: '+91 98270 54321', email: 'dr.kavita.a@email.com', role: 'Doctor', avatar: null, registeredAt: '2026-07-02T11:30:00Z', status: 'Pending Approval', attendance: 'Registered', checkinTime: null },
          { id: 'reg3', memberId: 'm5', name: 'Vikas Agrawal', phone: '+91 98260 44556', email: 'ca.vikas@email.com', role: 'CA', avatar: null, registeredAt: '2026-07-03T14:15:00Z', status: 'Approved', attendance: 'Late', checkinTime: '2026-07-07T10:45:00Z' },
          { id: 'reg4', memberId: 'm3', name: 'Deepak Agrawal', phone: '+91 99810 98765', email: 'deepak.se@email.com', role: 'Software Engineer', avatar: null, registeredAt: '2026-07-04T09:00:00Z', status: 'Waiting List', attendance: 'Absent', checkinTime: null },
          { id: 'reg5', memberId: 'm4', name: 'Anita Agrawal', phone: '+91 98930 11223', email: 'anita.teacher@email.com', role: 'Teacher', avatar: null, registeredAt: '2026-07-04T12:00:00Z', status: 'Cancelled', attendance: 'Cancelled', checkinTime: null }
        ],
        auditLogs: merged.auditLogs || [
          { id: 'log1', action: 'Create Event', entityType: 'Event', entityId: merged.id || `e-${index}`, oldValue: null, newValue: `${merged.title} created as Draft`, performedBy: 'Shri Mohan Lal Agrawal', timestamp: '2026-06-30T09:00:00Z', ipAddress: '192.168.1.100', device: 'Chrome / Windows', reason: 'Initial scheduling' },
          { id: 'log2', action: 'Publish Event', entityType: 'Event', entityId: merged.id || `e-${index}`, oldValue: 'Draft', newValue: 'Published', performedBy: 'Shri Mohan Lal Agrawal', timestamp: '2026-06-30T09:15:00Z', ipAddress: '192.168.1.100', device: 'Chrome / Windows', reason: 'Ready for public view' }
        ]
      };
    });
  });
  const [obituaries, setObituaries] = useState(() => loadState('obituaries', initialObituaries));
  
  // Dynamic Configuration for Invitation Form Fields
  const [invitationFormConfig, setInvitationFormConfig] = useState(() => loadState('invitationFormConfig', {
    enableFeastTime: true,
    enableProgramTime: true,
    enableMapLink: true,
    enableContact: true,
    enableMessage: true,
    enablePhotos: true,
    enableMembersTab: true,
    enablePresidentsTab: true,
    enableGroupsTab: true,
    enableFriendsTab: true,
    enableBatchInvite: true
  }));

  const updateInvitationConfig = (newConfig) => {
    setInvitationFormConfig(newConfig);
    saveState('invitationFormConfig', newConfig);
  };

  const [professionals, setProfessionals] = useState(() => {
    const saved = loadState('professionals', initialProfessionals);
    return saved.map((p, index) => {
      // Establish generic RBAC bindings: some belong to c1, others to c2 etc.
      let communityId = 'c2';
      if (p.id === 'p4' || p.id === 'p5') communityId = 'c1'; // Indore & Bhopal
      else if (p.id === 'p1') communityId = 'c2';
      else if (p.id === 'p2') communityId = 'c3';
      else if (p.id === 'p3') communityId = 'c4';
      else if (p.id === 'p6') communityId = 'c5';
      else if (p.id === 'p7') communityId = 'c6';
      
      return {
        ...p,
        communityId,
        status: p.status || 'Verified', // Lifecycle: Draft, Submitted, Under Review, Verified, Featured, Inactive, Suspended, Removed
        ownerName: p.ownerName || 'Shri Ramesh Kumar',
        ownerPhoto: p.ownerPhoto || null,
        memberId: p.memberId || `M-${10000 + index}`,
        gstNumber: p.gstNumber || `22AAAAA0000A1Z${index}`,
        businessId: p.businessId || `B-${20000 + index}`,
        experience: p.experience || `${5 + index} Years`,
        verificationBadge: p.verificationBadge || 'Gold',
        rating: p.rating || 4.5,
        category: p.category || 'Manufacturing',
        subcategory: p.subcategory || 'Heavy Machinery',
        businessHours: p.businessHours || '09:00 AM - 08:00 PM',
        website: p.website || `www.${(p.title || 'business').toLowerCase().replace(' ', '')}.com`,
        socialLinks: p.socialLinks || { facebook: '#', linkedin: '#', twitter: '#' },
        contact: p.contact || p.phone || '+91 98765 43210',
        address: p.address || '101, Main Street, Vijay Nagar',
        landmark: p.landmark || 'Near Capital Tower',
        state: p.state || 'Madhya Pradesh',
        pinCode: p.pinCode || '452010',
        emergencyContact: p.emergencyContact || '+91 90000 12345',
        documents: p.documents || [
          { id: 'doc1', type: 'GST Certificate', status: 'Verified', fileName: 'GST_Registration.pdf', fileUrl: '#', notes: 'Verified on GST Portal' },
          { id: 'doc2', type: 'Trade License', status: 'Verified', fileName: 'Trade_License_2026.pdf', fileUrl: '#', notes: 'Valid till 2027' },
          { id: 'doc3', type: 'Shop Registration', status: 'Verified', fileName: 'Shop_Establishment_Certificate.pdf', fileUrl: '#', notes: 'Verified establishment' }
        ],
        gallery: p.gallery || [
          { id: 'img1', fileType: 'Photo', fileUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', fileName: 'storefront.jpg', caption: 'Business Front View', sortOrder: 1, isCoverImage: true, isFeaturedImage: true },
          { id: 'img2', fileType: 'Photo', fileUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', fileName: 'interior.jpg', caption: 'Interior Workspace', sortOrder: 2, isCoverImage: false, isFeaturedImage: false }
        ],
        complaints: p.complaints || [
          { id: 'comp1', type: 'Quality Issue', reportedBy: 'Anil Agrawal', evidence: 'Defective products received', priority: 'Medium', status: 'Pending', assignedDate: '2026-06-15T10:00:00Z', notes: '' }
        ],
        auditLogs: p.auditLogs || [
          { id: 'log1', action: 'Listing Creation', oldValue: null, newValue: 'Draft created', performedBy: 'Ramesh Kumar', timestamp: '2026-05-10T14:00:00Z' },
          { id: 'log2', action: 'Verification Review', oldValue: 'Submitted', newValue: 'Verified', performedBy: 'Shri Mohan Lal Agrawal', timestamp: '2026-05-12T11:00:00Z' }
        ]
      };
    });
  });
  const [matrimonialProfiles, setMatrimonialProfiles] = useState(() => {
    const saved = loadState('matrimonialProfiles', initialMatrimonial);
    return saved.map((p, index) => {
      let communityId = 'c2';
      // mt1, mt2, and mt_khyati belong to the Community Head's community ('c1')
      if (p.id === 'mt1' || p.id === 'mt2' || p.id === 'mt_khyati') {
        communityId = 'c1';
      } else if (p.id === 'mt3') communityId = 'c2';
      else if (p.id === 'mt4') communityId = 'c3';
      else if (p.id === 'mt5') communityId = 'c4';
      else if (p.id === 'mt6') communityId = 'c5';
      else if (p.id === 'mt7') communityId = 'c6';
      else if (p.id === 'mt8') communityId = 'c7';
      else if (p.id === 'mt9') communityId = 'c8';
      else if (p.id === 'mt10') communityId = 'c9';

      return {
        ...p,
        communityId,
        status: p.status || 'Published', // Draft, Submitted, Under Review, Approved, Published, Matched, Archived, Rejected, Correction Requested
        verificationStatus: p.verificationStatus || 'Verified', // Pending, Under Review, Verified, Rejected
        verificationBadge: p.verificationBadge || (p.verifiedStatus ? 'Gold' : 'None'),
        familyBackground: p.familyBackground || `${p.familyAffluence || 'Middle Class'} / ${p.familyValues || 'Traditional'} Values`,
        documents: p.documents || [
          { id: 'doc1', type: 'Community Certificate', status: 'Verified', fileName: 'Community_Cert.pdf', fileUrl: '#' },
          { id: 'doc2', type: 'Identity Proof', status: 'Verified', fileName: 'Aadhaar_Card.pdf', fileUrl: '#' },
          { id: 'doc3', type: 'Address Proof', status: 'Verified', fileName: 'Utility_Bill.pdf', fileUrl: '#' }
        ],
        complaints: p.complaints || [
          { id: 'comp1', type: 'Fake Information', reportedBy: 'Sunil Agrawal', evidence: 'Age is incorrect', priority: 'Medium', status: 'Pending', assignedDate: '2026-06-25T10:00:00Z', notes: '' }
        ],
        auditLogs: p.auditLogs || [
          { id: 'log1', action: 'Profile Created', oldStatus: null, newStatus: 'Draft', performedBy: p.name, timestamp: '2026-04-10T12:00:00Z', reason: 'Initial registration' },
          { id: 'log2', action: 'Profile Verification', oldStatus: 'Submitted', newStatus: 'Published', performedBy: 'Shri Mohan Lal Agrawal', timestamp: '2026-04-15T15:00:00Z', reason: 'Verified certificates' }
        ]
      };
    });
  });
  const [language, setLanguage] = useState(() => loadState('language', 'en'));
  const [groups, setGroups] = useState(() => {
    const saved = loadState('groups', initialGroups);
    return initialGroups.map(initG => {
      const savedG = saved.find(g => g.id === initG.id);
      if (savedG) {
        return {
          ...initG,
          isJoined: savedG.isJoined !== undefined ? savedG.isJoined : initG.isJoined,
          isMuted: savedG.isMuted !== undefined ? savedG.isMuted : initG.isMuted,
          unread: savedG.unread !== undefined ? savedG.unread : initG.unread,
        };
      }
      return initG;
    });
  });
  const [groupMessages, setGroupMessages] = useState(() => {
    const saved = loadState('groupMessages', initialGroupMessages);
    const merged = { ...initialGroupMessages };
    Object.keys(saved).forEach(key => {
      if (saved[key] && saved[key].length > 0) {
        merged[key] = saved[key];
      }
    });
    return merged;
  });
  const [notifications, setNotifications] = useState(() => loadState('notifications', initialNotifications));
  const [sentNotifications, setSentNotifications] = useState(() => loadState('sentNotifications', defaultSentNotifications));
  const [notificationTemplates, setNotificationTemplates] = useState(() => loadState('notificationTemplates', defaultTemplates));

  // Event Reminders State: { [eventId]: true/false }
  const [eventReminders, setEventReminders] = useState(() => loadState('eventReminders', {}));

  // Event RSVP Registrations: { [eventId]: { name, phone, attendees, registeredAt } }
  const [eventRegistrations, setEventRegistrations] = useState(() => loadState('eventRegistrations', {}));

  // Survey Responses State: { [surveyId]: { [questionId]: answer } }
  const [surveyResponses, setSurveyResponses] = useState(() => loadState('surveyResponses', {}));

  // Mobile Menu Navigation Drawer State
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Direct Message Chats & Messages States
  const [chats, setChats] = useState(() => loadState('chats', initialChats));
  const [chatMessages, setChatMessages] = useState(() => loadState('chatMessages', initialMessages));

  // Follow System & Privacy States
  const [profilePrivacy, setProfilePrivacy] = useState(() => loadState('profilePrivacy', defaultProfilePrivacy));
  const [followRelations, setFollowRelations] = useState(() => loadState('followRelations', defaultFollowRelations));
  const [blockedUsers, setBlockedUsers] = useState(() => loadState('blockedUsers', defaultBlockedUsers));
  const [granularPrivacy, setGranularPrivacy] = useState(() => loadState('granularPrivacy', defaultGranularPrivacy));

  // Invitations State
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const data = await invitationService.getInvitations();
        setInvitations(data);
      } catch (error) {
        console.error('Failed to load invitations', error);
      }
    };
    if (currentUser) {
      loadInvitations();
    }
  }, [currentUser]);

  // Sync to localStorage when state changes
  useEffect(() => saveState('currentUser', currentUser), [currentUser]);
  useEffect(() => saveState('members', members), [members]);
  useEffect(() => saveState('admins', admins), [admins]);
  // useEffect(() => saveState('posts', posts), [posts]); // Disabled persistence for Feed redesign
  useEffect(() => saveState('followedAnnouncements', followedAnnouncements), [followedAnnouncements]);
  useEffect(() => saveState('events', events), [events]);
  useEffect(() => saveState('obituaries', obituaries), [obituaries]);
  useEffect(() => saveState('matrimonialProfiles', matrimonialProfiles), [matrimonialProfiles]);
  useEffect(() => saveState('language', language), [language]);
  useEffect(() => saveState('professionals', professionals), [professionals]);
  useEffect(() => saveState('groups', groups), [groups]);
  useEffect(() => saveState('groupMessages', groupMessages), [groupMessages]);
  useEffect(() => saveState('notifications', notifications), [notifications]);
  useEffect(() => saveState('sentNotifications', sentNotifications), [sentNotifications]);
  useEffect(() => saveState('notificationTemplates', notificationTemplates), [notificationTemplates]);
  useEffect(() => saveState('eventReminders', eventReminders), [eventReminders]);
  useEffect(() => saveState('eventRegistrations', eventRegistrations), [eventRegistrations]);
  useEffect(() => saveState('surveyResponses', surveyResponses), [surveyResponses]);
  useEffect(() => saveState('chats', chats), [chats]);
  useEffect(() => saveState('chatMessages', chatMessages), [chatMessages]);
  
  // Follow System Syncs
  useEffect(() => saveState('profilePrivacy', profilePrivacy), [profilePrivacy]);
  useEffect(() => saveState('followRelations', followRelations), [followRelations]);
  useEffect(() => saveState('blockedUsers', blockedUsers), [blockedUsers]);
  useEffect(() => saveState('granularPrivacy', granularPrivacy), [granularPrivacy]);
  // useEffect(() => saveState('invitations', invitations), [invitations]); // Disabled persistence so newly created cards reset on refresh

  // Follow System Methods
  const sendFollowRequest = (targetUserId) => {
    setFollowRelations(prev => {
      const exists = prev.some(r => r.followerId === 'u1' && r.followingId === targetUserId);
      if (exists) return prev;

      const targetPrivacy = profilePrivacy[targetUserId] || 'public';
      const status = targetPrivacy === 'private' ? 'pending' : 'accepted';

      return [...prev, { followerId: 'u1', followingId: targetUserId, status }];
    });

    // Add simulated follow notification for other user if private
    const targetPrivacy = profilePrivacy[targetUserId] || 'public';
    if (targetPrivacy === 'private') {
      const targetName = members.find(m => m.id === targetUserId)?.name || admins.find(a => a.id === targetUserId)?.name || 'Someone';
      const newNotification = {
        id: `nf_follow_req_${Date.now()}`,
        type: 'follow_request_sent',
        title: 'Follow Request Sent',
        message: `You requested to follow ${targetName}.`,
        time: 'Just now',
        isRead: false
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const cancelFollowRequest = (targetUserId) => {
    setFollowRelations(prev => prev.filter(r => !(r.followerId === 'u1' && r.followingId === targetUserId && r.status === 'pending')));
  };

  const acceptFollowRequest = (senderUserId) => {
    setFollowRelations(prev => prev.map(r => {
      if (r.followerId === senderUserId && r.followingId === 'u1' && r.status === 'pending') {
        return { ...r, status: 'accepted' };
      }
      return r;
    }));

    // Add a notification for current user
    const sender = members.find(m => m.id === senderUserId) || admins.find(a => a.id === senderUserId);
    const senderName = sender ? sender.name : 'A member';
    const newNotification = {
      id: `nf_accept_${Date.now()}`,
      type: 'follow_accept',
      title: 'Follow Request Accepted',
      message: `You accepted ${senderName}'s follow request.`,
      time: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const rejectFollowRequest = (senderUserId) => {
    setFollowRelations(prev => prev.filter(r => !(r.followerId === senderUserId && r.followingId === 'u1' && r.status === 'pending')));
  };

  const unfollowUser = (targetUserId) => {
    setFollowRelations(prev => prev.filter(r => !(r.followerId === 'u1' && r.followingId === targetUserId)));
  };

  const removeFollower = (targetUserId) => {
    setFollowRelations(prev => prev.filter(r => !(r.followerId === targetUserId && r.followingId === 'u1')));
  };

  const updateProfilePrivacy = (privacySetting) => {
    setProfilePrivacy(prev => ({
      ...prev,
      u1: privacySetting
    }));
  };

  const updateGranularPrivacy = (field, setting) => {
    setGranularPrivacy(prev => {
      // Check if it's already a dictionary style or flat style
      if (prev && prev.u1) {
        return {
          ...prev,
          u1: {
            ...prev.u1,
            [field]: setting
          }
        };
      } else {
        // If it was flat, convert to dictionary style and save
        return {
          ...prev,
          u1: {
            ...prev,
            [field]: setting
          }
        };
      }
    });
  };

  const blockUser = (targetUserId) => {
    setBlockedUsers(prev => {
      if (prev.some(b => b.blockerId === 'u1' && b.blockedId === targetUserId)) return prev;
      return [...prev, { blockerId: 'u1', blockedId: targetUserId }];
    });
    // Remove any follow relationships
    setFollowRelations(prev => prev.filter(r => 
      !( (r.followerId === 'u1' && r.followingId === targetUserId) || (r.followerId === targetUserId && r.followingId === 'u1') )
    ));
  };

  const unblockUser = (targetUserId) => {
    setBlockedUsers(prev => prev.filter(b => !(b.blockerId === 'u1' && b.blockedId === targetUserId)));
  };

  const updateProfile = (updatedData) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
  };

  const loginUser = (userData) => {
    setCurrentUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('posts');
    setPosts(initialPosts);
  };

  const addFamilyMember = (newMember) => {
    const memberWithId = { ...newMember, id: `f${Date.now()}`, initials: newMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() };
    setCurrentUser(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, memberWithId]
    }));
  };

  const deleteFamilyMember = (memberId) => {
    setCurrentUser(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(m => m.id !== memberId)
    }));
  };

  const updateFamilyMember = (memberId, updatedMember) => {
    setCurrentUser(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(m => m.id === memberId ? { ...m, ...updatedMember, initials: updatedMember.name ? updatedMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : m.initials } : m)
    }));
  };

  const createPost = (postContent, images = [], options = {}) => {
    const newPost = {
      id: `p${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        initials: currentUser.initials,
        avatar: currentUser.avatar
      },
      community: currentUser.community,
      content: postContent,
      images,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false,
      ...options
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleEventRSVP = (eventId) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          isRegistered: !e.isRegistered,
          attendees: e.isRegistered ? e.attendees - 1 : e.attendees + 1
        };
      }
      return e;
    }));
  };

  const togglePostLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const togglePostSave = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isSaved: !p.isSaved
        };
      }
      return p;
    }));
  };

  const addPostComment = (postId, commentText) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: `c${Date.now()}`,
          author: {
            id: currentUser.id,
            name: currentUser.name,
            initials: currentUser.initials,
            avatar: currentUser.avatar
          },
          text: commentText,
          time: 'Just now',
          likes: 0,
          isLiked: false
        };
        return {
          ...p,
          comments: (p.comments || 0) + 1,
          commentsList: [...(p.commentsList || []), newComment]
        };
      }
      return p;
    }));
  };

  const addCommentReply = (postId, commentId, replyText) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsList: (p.commentsList || []).map(c => {
            if (c.id === commentId) {
              const newReply = {
                id: `r-${Date.now()}`,
                author: {
                  name: currentUser.name,
                  initials: currentUser.initials,
                  avatar: currentUser.avatar,
                  isVerified: true
                },
                text: replyText,
                time: 'Just now'
              };
              return {
                ...c,
                replies: [...(c.replies || []), newReply]
              };
            }
            return c;
          })
        };
      }
      return p;
    }));
  };

  const toggleCommentLike = (postId, commentId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsList: (p.commentsList || []).map(c => {
            if (c.id === commentId) {
              return {
                ...c,
                isLiked: !c.isLiked,
                likes: c.isLiked ? c.likes - 1 : c.likes + 1
              };
            }
            return c;
          })
        };
      }
      return p;
    }));
  };

  const toggleFollowedAnnouncement = (type) => {
    setFollowedAnnouncements(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const addMatrimonialProfile = (profileData) => {
    const newProfile = {
      ...profileData,
      id: `mp${Date.now()}`,
      name: currentUser.name,
      initials: currentUser.initials,
      city: currentUser.city,
      photos: 1,
      isNew: true,
      interests: { sent: false, received: false }
    };
    setMatrimonialProfiles(prev => [newProfile, ...prev]);
  };

  const toggleMatrimonialInterest = (profileId) => {
    setMatrimonialProfiles(prev => {
      const updated = prev.map(p => {
        if (p.id === profileId) {
          const newSent = !p.interests.sent;
          return {
            ...p,
            interests: {
              ...p.interests,
              sent: newSent,
              // If withdrawing, reset accepted status
              accepted: newSent ? p.interests.accepted : false
            }
          };
        }
        return p;
      });

      // Find if we just sent a request
      const target = updated.find(p => p.id === profileId);
      if (target && target.interests?.sent && !target.interests?.accepted) {
        // Trigger auto acceptance after 5 seconds to simulate target response
        setTimeout(() => {
          setMatrimonialProfiles(current => current.map(item => {
            if (item.id === profileId) {
              return {
                ...item,
                interests: {
                  ...item.interests,
                  accepted: true
                }
              };
            }
            return item;
          }));

          // Trigger a global custom event so active pages can show a toast
          const event = new CustomEvent('matrimonialInterestAccepted', {
            detail: { profileId, name: target.name }
          });
          window.dispatchEvent(event);
        }, 5000);
      }

      return updated;
    });
  };

  const handleMatrimonialInterestResponse = (profileId, status) => {
    setMatrimonialProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        return {
          ...p,
          interests: {
            ...p.interests,
            received: false,
            accepted: status === 'accept'
          }
        };
      }
      return p;
    }));
  };

  const updateMatrimonialBio = (newBio) => {
    setCurrentUser(prev => ({
      ...prev,
      matrimonialBio: newBio
    }));
  };

  const getOrCreateChat = (memberId) => {
    const existing = chats.find(c => !c.isGroup && c.participants.includes(memberId) && c.participants.includes('u1'));
    if (existing) {
      return existing.id;
    }

    const recipient = members.find(m => m.id === memberId) || 
                      matrimonialProfiles.find(p => p.id === memberId) || 
                      { name: 'Samaj Member', initials: 'SM' };

    const newChatId = `c_dm_${memberId}`;
    const newChat = {
      id: newChatId,
      isGroup: false,
      participants: ['u1', memberId],
      name: recipient.name,
      avatar: recipient.avatar || null,
      initials: recipient.initials || recipient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      lastMessage: {
        text: 'No messages yet',
        timestamp: new Date().toISOString(),
        senderId: memberId,
        isRead: true
      },
      unreadCount: 0,
      online: recipient.online || false
    };

    setChats(prev => [newChat, ...prev]);
    setChatMessages(prev => ({
      ...prev,
      [newChatId]: []
    }));

    return newChatId;
  };

  const sendChatMessage = (chatId, text) => {
    const newMsg = {
      id: `m_${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      senderId: 'u1',
      senderName: currentUser?.name?.split(' ')[0] || 'You'
    };

    setChatMessages(prev => {
      const currentMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: [...currentMsgs, newMsg]
      };
    });

    setChats(prev => {
      const target = prev.find(c => c.id === chatId);
      if (!target) return prev;
      const updatedTarget = {
        ...target,
        lastMessage: {
          text,
          timestamp: new Date().toISOString(),
          senderId: 'u1',
          isRead: true
        }
      };
      return [updatedTarget, ...prev.filter(c => c.id !== chatId)];
    });

    // Simulate Reply for DM Chats
    const targetChat = chats.find(c => c.id === chatId);
    if (targetChat && !targetChat.isGroup) {
      setTimeout(() => {
        const autoText = [
          'हाँ, बिल्कुल! 😊',
          'ठीक है, मैं देख लूंगा।',
          'धन्यवाद! बताता हूँ।',
          'अच्छा, समझ गया।',
          'जी हाँ, कल मिलते हैं।',
          'Sure! Will get back to you.',
        ][Math.floor(Math.random() * 6)];

        const replyMsg = {
          id: `m_${Date.now()}_reply`,
          text: autoText,
          timestamp: new Date().toISOString(),
          senderId: targetChat.participants.find(p => p !== 'u1') || 'member',
          senderName: targetChat.name.split(' ')[0] || 'Member'
        };

        setChatMessages(current => {
          const currentMsgs = current[chatId] || [];
          return {
            ...current,
            [chatId]: [...currentMsgs, replyMsg]
          };
        });

        setChats(current => {
          const target = current.find(c => c.id === chatId);
          if (!target) return current;
          const updatedTarget = {
            ...target,
            lastMessage: {
              text: autoText,
              timestamp: new Date().toISOString(),
              senderId: replyMsg.senderId,
              isRead: false
            },
            unreadCount: (target.unreadCount || 0) + 1
          };
          return [updatedTarget, ...current.filter(c => c.id !== chatId)];
        });
      }, 1500);
    }
    
    // Simulate Reply for Matrimonial Chats
    if (chatId.startsWith('matrimonial_')) {
      setTimeout(() => {
        const partnerId = chatId.replace('matrimonial_', '');
        const autoText = [
          'Thanks for messaging! I went through your profile and found it interesting. 😊',
          'Let me discuss this with my parents and get back to you soon. 🙏',
          'Hi! Let us connect over a call sometime this weekend? 📞',
          'Hi, nice to meet you. Would you like to share your horoscope first? ✨',
          'Yes, absolutely. I am open to discussing further. 💍',
        ][Math.floor(Math.random() * 5)];

        const mockDict = {
          'feed_priya': 'Priyel',
          'feed_ruchi': 'Aakanksha',
          's_verma': 'S verma',
          'rani': 'Rani',
          'jagriti': 'Jagriti',
          'pragati': 'Pragati',
          'txar8899': 'TXAR8899',
          'aanchal': 'Aanchal'
        };
        const partnerName = mockDict[partnerId] || 'Partner';

        const replyMsg = {
          id: `m_${Date.now()}_reply`,
          text: autoText,
          timestamp: new Date().toISOString(),
          senderId: partnerId,
          senderName: partnerName
        };

        setChatMessages(current => {
          const currentMsgs = current[chatId] || [];
          return {
            ...current,
            [chatId]: [...currentMsgs, replyMsg]
          };
        });
      }, 2000);
    }
  };

  const addObituary = (obituary) => {
    setObituaries([obituary, ...obituaries]);
  };

  const addStory = (storyImage, storyText = '') => {
    const newStory = {
      id: `story-${Date.now()}`,
      memberId: 'me',
      name: currentUser.name,
      initials: currentUser.initials,
      avatar: currentUser.avatar,
      image: storyImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      text: storyText,
      timestamp: 'Just now',
      hasSeen: false
    };
    setStories(prev => [newStory, ...prev]);
  };

  const toggleObituaryShraddhanjali = (obId) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return {
          ...ob,
          hasOfferedShraddhanjali: !ob.hasOfferedShraddhanjali,
          shraddhanjaliCount: ob.hasOfferedShraddhanjali ? ob.shraddhanjaliCount - 1 : ob.shraddhanjaliCount + 1,
          userHasHaathJode: !ob.userHasHaathJode,
          haathJodeCount: ob.userHasHaathJode ? (ob.haathJodeCount || 0) - 1 : (ob.haathJodeCount || 0) + 1
        };
      }
      return ob;
    }));
  };

  // New Shradhanjali interaction functions
  const toggleHaathJode = (obId) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return {
          ...ob,
          userHasHaathJode: !ob.userHasHaathJode,
          haathJodeCount: ob.userHasHaathJode ? (ob.haathJodeCount || 0) - 1 : (ob.haathJodeCount || 0) + 1,
          // Legacy sync
          hasOfferedShraddhanjali: !ob.userHasHaathJode,
          shraddhanjaliCount: ob.userHasHaathJode ? (ob.shraddhanjaliCount || 0) - 1 : (ob.shraddhanjaliCount || 0) + 1
        };
      }
      return ob;
    }));
  };

  const toggleMalaArpan = (obId) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return {
          ...ob,
          userHasMalaArpan: !ob.userHasMalaArpan,
          malaArpanCount: ob.userHasMalaArpan ? Math.max(0, (ob.malaArpanCount || 0) - 1) : (ob.malaArpanCount || 0) + 1
        };
      }
      return ob;
    }));
  };

  const incrementMalaArpan = (obId, delta) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return {
          ...ob,
          malaArpanCount: Math.max(0, (ob.malaArpanCount || 0) + delta),
          userHasMalaArpan: true
        };
      }
      return ob;
    }));
  };

  const saveShradhanjali = (obId) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return {
          ...ob,
          isSaved: !ob.isSaved,
          saves: ob.isSaved ? Math.max(0, (ob.saves || 0) - 1) : (ob.saves || 0) + 1
        };
      }
      return ob;
    }));
  };

  const shareShradhanjali = (obId) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return { ...ob, shares: (ob.shares || 0) + 1 };
      }
      return ob;
    }));
  };

  const incrementObituaryViews = (obId) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return { ...ob, views: (ob.views || 0) + 1 };
      }
      return ob;
    }));
  };

  const addObituaryComment = (obId, commentText) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return {
          ...ob,
          comments: [
            ...(ob.comments || []),
            { 
              id: `c${Date.now()}`, 
              name: currentUser.name, 
              initials: currentUser.initials,
              text: commentText, 
              timestamp: 'अभी', 
              likes: 0,
              isLiked: false
            }
          ]
        };
      }
      return ob;
    }));
  };

  const likeObituaryComment = (obId, commentId) => {
    setObituaries(prev => prev.map(ob => {
      if (ob.id === obId) {
        return {
          ...ob,
          comments: (ob.comments || []).map(c => {
            if (c.id === commentId) {
              return {
                ...c,
                isLiked: !c.isLiked,
                likes: c.isLiked ? Math.max(0, (c.likes || 0) - 1) : (c.likes || 0) + 1
              };
            }
            return c;
          })
        };
      }
      return ob;
    }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setCurrentUser(initialUser);
    setMembers(initialMembers);
    setAdmins(initialAdmins);
    setPosts(initialPosts);
    setEvents(initialEvents);
    setMatrimonialProfiles(initialMatrimonial);
    setGroups(initialGroups);
    setGroupMessages(initialGroupMessages);
    setNotifications(initialNotifications);
  };

  const createGroup = (groupData) => {
    const newGroup = {
      id: `g${Date.now()}`,
      name: groupData.name,
      initials: groupData.name.substring(0, 2),
      avatarUrl: groupData.avatarUrl || null,
      members: groupData.members || 1,
      online: 1,
      posts: 0,
      category: groupData.category || 'General',
      lastActivity: 'Just now',
      isJoined: true,
      description: groupData.description || '',
      isMuted: false,
      unread: 0,
      privacy: groupData.privacy,
      chatSettings: groupData.chatSettings,
      creatorId: currentUser.id
    };
    setGroups(prev => [newGroup, ...prev]);
    setGroupMessages(prev => ({
      ...prev,
      [newGroup.id]: groupData.initialMessage ? [
        {
          id: Date.now(),
          senderId: 'me',
          senderName: currentUser.name,
          initials: currentUser.initials,
          role: 'Admin',
          text: groupData.initialMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true
        }
      ] : []
    }));
  };

  const joinGroup = (groupId) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, isJoined: true, members: g.members + 1 } : g));
  };

  const leaveGroup = (groupId) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, isJoined: false, members: g.members - 1 } : g));
  };

  const toggleGroupMute = (groupId) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, isMuted: !g.isMuted } : g));
  };

  const updateGroupDetails = (groupId, updatedFields) => {
    setGroups(prevGroups => prevGroups.map(g => {
      if (g.id === groupId) {
        let initials = g.initials;
        if (updatedFields.name) {
          initials = updatedFields.name.split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        }
        return {
          ...g,
          ...updatedFields,
          initials
        };
      }
      return g;
    }));
  };

  const reactToGroupMessage = (groupId, messageId, emoji) => {
    setGroupMessages(prev => {
      const messages = prev[groupId] || [];
      const updatedMessages = messages.map(m => {
        if (m.id === messageId) {
          const currentReactions = m.reactions || [];
          let nextReactions;
          if (currentReactions.includes(emoji)) {
            nextReactions = currentReactions.filter(r => r !== emoji);
          } else {
            nextReactions = [...currentReactions, emoji];
          }
          return {
            ...m,
            reactions: nextReactions
          };
        }
        return m;
      });
      return {
        ...prev,
        [groupId]: updatedMessages
      };
    });
  };

  const sendGroupMessage = (groupId, text, attachment = null, replyTo = null) => {
    const newMsg = {
      id: Date.now(),
      senderId: 'me',
      senderName: currentUser.name,
      initials: currentUser.initials,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      attachment: attachment,
      replyTo: replyTo
    };
    setGroupMessages(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMsg]
    }));

    // Trigger mock notification response for other members if group notifications are active
    const targetGroup = groups.find(g => g.id === groupId);
    if (targetGroup && !targetGroup.isMuted) {
      setTimeout(() => {
        const replyMsg = {
          id: Date.now() + 1,
          senderId: 'mock-reply',
          senderName: 'Vikas Jain',
          initials: 'VJ',
          text: `Got your message, Rajesh! Thanks for sharing.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        };
        setGroupMessages(prev => {
          const currentList = prev[groupId] || [];
          if (currentList.some(m => m.senderId === 'mock-reply' && m.text.includes('Got your message'))) {
            return prev;
          }
          return {
            ...prev,
            [groupId]: [...currentList, replyMsg]
          };
        });
        
        // Also add a group notification!
        const newNotification = {
          id: `ng-${Date.now()}`,
          type: 'group',
          groupId: groupId,
          groupName: targetGroup.name,
          title: `New message in ${targetGroup.name}`,
          message: `Vikas Jain: Got your message, Rajesh!`,
          time: 'Just now',
          isRead: false
        };
        setNotifications(prev => [newNotification, ...prev]);
      }, 3000);
    }
  };

  const markAllNotificationsRead = (moduleName = null) => {
    setNotifications(prev => prev.map(n => {
      if (moduleName && getNotificationModule(n.type) !== moduleName) return n;
      return { ...n, isRead: true };
    }));
  };

  const addNotification = (notificationData) => {
    const newNotification = {
      id: `nd-${Date.now()}`,
      time: 'Just now',
      isRead: false,
      ...notificationData
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getNotificationsForModule = (moduleName) => {
    return adaptedNotificationsList.filter(n => getNotificationModule(n.type) === moduleName);
  };

  const getUnreadCountForModule = (moduleName) => {
    return adaptedNotificationsList.filter(n => getNotificationModule(n.type) === moduleName && !n.isRead).length;
  };

  const clearChatMessages = (groupId) => {
    setGroupMessages(prev => ({
      ...prev,
      [groupId]: []
    }));
  };

  const activeCommunity = currentUser ? currentUser.community : 'Agrawal Samaj';

  const adaptedMembersList = adaptMembers(members, activeCommunity);
  const adaptedAdminsList = adaptAdmins(admins, activeCommunity);
  const adaptedPostsList = adaptPosts(posts, activeCommunity);
  const adaptedStoriesList = adaptStories(stories, activeCommunity);
  const adaptedMatrimonialList = adaptMatrimonial(matrimonialProfiles, currentUser);
  const adaptedGroupsList = adaptGroups(groups, activeCommunity);
  const adaptedGroupMessagesMap = adaptGroupMessages(groupMessages, activeCommunity);
  const adaptedNotificationsList = adaptNotifications(notifications, activeCommunity);

  const updateInvitationRSVP = async (invitationId, status) => {
    try {
      const updatedInv = await invitationService.updateRSVP(invitationId, status);
      setInvitations(prev => prev.map(inv => inv._id === invitationId || inv.id === invitationId ? updatedInv : inv));
    } catch (error) {
      console.error('Failed to update RSVP', error);
    }
  };

  const createInvitation = async (invitationData) => {
    try {
      const newInv = await invitationService.createInvitation(invitationData);
      setInvitations(prev => [newInv, ...prev]);
      return newInv;
    } catch (error) {
      console.error('Failed to create invitation', error);
      throw error;
    }
  };

  const addInvitesToInvitation = (invitationId, memberIds = [], groupIds = []) => {
    setInvitations(prev => prev.map(inv => {
      if (inv.id === invitationId) {
        return {
          ...inv,
          invitedMemberIds: Array.from(new Set([...(inv.invitedMemberIds || []), ...memberIds])),
          invitedGroupIds: Array.from(new Set([...(inv.invitedGroupIds || []), ...groupIds]))
        };
      }
      return inv;
    }));
  };

  const updateInvitationStatus = (invitationId, status) => {
    setInvitations(prev => prev.map(inv => (inv.id === invitationId || inv._id === invitationId) ? { ...inv, status } : inv));
  };

  const updateInvitation = (invitationId, updatedData) => {
    setInvitations(prev => prev.map(inv => (inv.id === invitationId || inv._id === invitationId) ? { ...inv, ...updatedData } : inv));
  };

  const deleteInvitation = (invitationId) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId && inv._id !== invitationId));
  };

  const verifyMember = (memberId) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, isVerified: true } : m));
  };

  const rejectMember = (memberId) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: `e-${Date.now()}`,
      communityId: currentUser?.communityId || 'c1',
      status: eventData.status || 'Published',
      attendees: 0,
      isRegistered: false,
      gallery: [],
      announcements: [],
      registrations: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'Create Event',
          entityType: 'Event',
          entityId: `e-${Date.now()}`,
          oldValue: null,
          newValue: `${eventData.title} created`,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          device: 'Browser Console',
          reason: 'Administrative creation'
        }
      ]
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const updateEvent = (eventId, updatedData) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const merged = { ...ev, ...updatedData };
        // Log changes
        const changes = Object.keys(updatedData).map(k => `${k}: ${JSON.stringify(ev[k])} -> ${JSON.stringify(updatedData[k])}`).join(', ');
        const log = {
          id: `log-${Date.now()}`,
          action: 'Edit Event',
          entityType: 'Event',
          entityId: eventId,
          oldValue: `Fields updated: ${Object.keys(updatedData).join(', ')}`,
          newValue: changes,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          device: 'Browser Console',
          reason: 'Manual event updates'
        };
        merged.auditLogs = [log, ...(merged.auditLogs || [])];
        return merged;
      }
      return ev;
    }));
  };

  const deleteEvent = (eventId) => {
    // Soft delete
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const log = {
          id: `log-${Date.now()}`,
          action: 'Soft Delete Event',
          entityType: 'Event',
          entityId: eventId,
          oldValue: 'Active',
          newValue: 'Deleted (isDeleted = true)',
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          device: 'Browser Console',
          reason: 'Administrative deletion'
        };
        return { ...ev, isDeleted: true, auditLogs: [log, ...(ev.auditLogs || [])] };
      }
      return ev;
    }));
  };

  const duplicateEvent = (eventId) => {
    setEvents(prev => {
      const src = prev.find(ev => ev.id === eventId);
      if (!src) return prev;
      const dupId = `e-${Date.now()}`;
      const duplicated = {
        ...src,
        id: dupId,
        title: `${src.title} (Copy)`,
        titleEn: src.titleEn ? `${src.titleEn} (Copy)` : undefined,
        status: 'Draft',
        registrations: [],
        gallery: [],
        announcements: [],
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            action: 'Duplicate Event',
            entityType: 'Event',
            entityId: dupId,
            oldValue: `Source: ${src.title} (${src.id})`,
            newValue: 'Created duplicate event copy as Draft',
            performedBy: currentUser?.name || 'Admin',
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1',
            device: 'Browser Console',
            reason: 'Cloned from existing'
          }
        ]
      };
      return [duplicated, ...prev];
    });
  };

  const updateRegistrationStatus = (eventId, regId, status) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const updatedRegs = (ev.registrations || []).map(r => {
          if (r.id === regId) {
            const oldStatus = r.status;
            const updated = { ...r, status };
            const log = {
              id: `log-${Date.now()}`,
              action: 'Registration Approval',
              entityType: 'Registration',
              entityId: regId,
              oldValue: `Member ${r.name}: ${oldStatus}`,
              newValue: `Status changed to ${status}`,
              performedBy: currentUser?.name || 'Admin',
              timestamp: new Date().toISOString(),
              ipAddress: '127.0.0.1',
              device: 'Browser Console',
              reason: 'Administrative review'
            };
            ev.auditLogs = [log, ...(ev.auditLogs || [])];
            return updated;
          }
          return r;
        });
        return { ...ev, registrations: updatedRegs };
      }
      return ev;
    }));
  };

  const updateAttendanceStatus = (eventId, regId, attendance) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const updatedRegs = (ev.registrations || []).map(r => {
          if (r.id === regId) {
            const oldAttendance = r.attendance || 'Registered';
            const checkinTime = (attendance === 'Checked In' || attendance === 'Late') ? new Date().toISOString() : null;
            const updated = { ...r, attendance, checkinTime };
            const log = {
              id: `log-${Date.now()}`,
              action: 'Attendance Update',
              entityType: 'Registration',
              entityId: regId,
              oldValue: `Attendance: ${oldAttendance}`,
              newValue: `Attendance: ${attendance}`,
              performedBy: currentUser?.name || 'Admin',
              timestamp: new Date().toISOString(),
              ipAddress: '127.0.0.1',
              device: 'Browser Console',
              reason: 'Manual attendance toggle'
            };
            ev.auditLogs = [log, ...(ev.auditLogs || [])];
            return updated;
          }
          return r;
        });
        return { ...ev, registrations: updatedRegs };
      }
      return ev;
    }));
  };

  const uploadGalleryItem = (eventId, item) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const newItem = { ...item, id: `g-${Date.now()}`, sortOrder: (ev.gallery || []).length + 1 };
        const gallery = [...(ev.gallery || []), newItem];
        const log = {
          id: `log-${Date.now()}`,
          action: 'Gallery Upload',
          entityType: 'Gallery',
          entityId: newItem.id,
          oldValue: `Gallery size: ${(ev.gallery || []).length}`,
          newValue: `Added ${item.fileType}: ${item.fileName}`,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          device: 'Browser Console',
          reason: 'Gallery media upload'
        };
        return { ...ev, gallery, auditLogs: [log, ...(ev.auditLogs || [])] };
      }
      return ev;
    }));
  };

  const deleteGalleryItem = (eventId, itemId) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const gallery = (ev.gallery || []).filter(item => item.id !== itemId);
        const log = {
          id: `log-${Date.now()}`,
          action: 'Gallery Item Delete',
          entityType: 'Gallery',
          entityId: itemId,
          oldValue: `Gallery size: ${(ev.gallery || []).length}`,
          newValue: `Removed gallery item ${itemId}`,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          device: 'Browser Console',
          reason: 'Gallery item deletion'
        };
        return { ...ev, gallery, auditLogs: [log, ...(ev.auditLogs || [])] };
      }
      return ev;
    }));
  };

  const addEventAnnouncement = (eventId, announcementContent) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const newAnn = {
          id: `ann-${Date.now()}`,
          content: announcementContent,
          status: 'Published',
          scheduleTime: null,
          expirationTime: null,
          communityId: ev.communityId,
          author: currentUser?.name || 'Admin'
        };
        const announcements = [newAnn, ...(ev.announcements || [])];
        const log = {
          id: `log-${Date.now()}`,
          action: 'Broadcast Announcement',
          entityType: 'Announcement',
          entityId: newAnn.id,
          oldValue: `Announcements size: ${(ev.announcements || []).length}`,
          newValue: `Broadcast notice: "${announcementContent.substring(0, 30)}..."`,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          device: 'Browser Console',
          reason: 'Broadcast circular'
        };
        return { ...ev, announcements, auditLogs: [log, ...(ev.auditLogs || [])] };
      }
      return ev;
    }));
  };

  const addProfessional = (profData) => {
    const newProf = {
      ...profData,
      id: `p-${Date.now()}`,
      communityId: currentUser?.communityId || 'c1',
      status: profData.status || 'Submitted',
      verificationBadge: 'None',
      rating: 0,
      documents: profData.documents || [],
      gallery: [],
      complaints: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'Listing Creation',
          oldValue: null,
          newValue: 'Listing initialized in state',
          performedBy: currentUser?.name || 'Owner',
          timestamp: new Date().toISOString()
        }
      ]
    };
    setProfessionals(prev => [newProf, ...prev]);
  };

  const updateProfessional = (profId, updatedData) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === profId) {
        const merged = { ...p, ...updatedData };
        const changes = Object.keys(updatedData).map(k => `${k}: ${JSON.stringify(p[k])} -> ${JSON.stringify(updatedData[k])}`).join(', ');
        const log = {
          id: `log-${Date.now()}`,
          action: 'Listing Update',
          oldValue: `Fields: ${Object.keys(updatedData).join(', ')}`,
          newValue: changes,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString()
        };
        merged.auditLogs = [log, ...(merged.auditLogs || [])];
        return merged;
      }
      return p;
    }));
  };

  const deleteProfessional = (profId) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === profId) {
        const log = {
          id: `log-${Date.now()}`,
          action: 'Listing Soft Delete',
          oldValue: 'Active',
          newValue: 'isDeleted = true',
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString()
        };
        return { ...p, isDeleted: true, auditLogs: [log, ...(p.auditLogs || [])] };
      }
      return p;
    }));
  };

  const updateProfessionalStatus = (profId, status) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === profId) {
        const oldStatus = p.status;
        const log = {
          id: `log-${Date.now()}`,
          action: 'Status Change',
          oldValue: oldStatus,
          newValue: status,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString()
        };
        return { ...p, status, auditLogs: [log, ...(p.auditLogs || [])] };
      }
      return p;
    }));
  };

  const updateProfessionalDocumentStatus = (profId, docId, status, notes) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === profId) {
        const updatedDocs = (p.documents || []).map(d => {
          if (d.id === docId) {
            return { ...d, status, notes: notes || d.notes };
          }
          return d;
        });
        const log = {
          id: `log-${Date.now()}`,
          action: 'Document Review',
          oldValue: `Doc ${docId} Status`,
          newValue: `Status: ${status}, Notes: ${notes || 'N/A'}`,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString()
        };
        return { ...p, documents: updatedDocs, auditLogs: [log, ...(p.auditLogs || [])] };
      }
      return p;
    }));
  };

  const resolveProfessionalComplaint = (profId, complaintId, status, notes) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === profId) {
        const updatedComplaints = (p.complaints || []).map(c => {
          if (c.id === complaintId) {
            return { ...c, status, notes: notes || c.notes };
          }
          return c;
        });
        const log = {
          id: `log-${Date.now()}`,
          action: 'Complaint Resolution',
          oldValue: `Complaint ${complaintId} Status`,
          newValue: `Status: ${status}, Notes: ${notes || 'N/A'}`,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString()
        };
        return { ...p, complaints: updatedComplaints, auditLogs: [log, ...(p.auditLogs || [])] };
      }
      return p;
    }));
  };

  const sendCommunityNotification = (notifData) => {
    const newLog = {
      ...notifData,
      id: `nlog-${Date.now()}`,
      communityId: currentUser?.communityId || 'c1',
      status: notifData.scheduledTime ? 'Queued' : 'Delivered',
      stats: { sentCount: 120, openCount: 0, clickCount: 0 },
      createdBy: currentUser?.name || 'Admin',
      createdTime: new Date().toISOString(),
      isPinned: false
    };
    setSentNotifications(prev => [newLog, ...prev]);

    // Also push to member notifications tray if sent immediately
    if (!notifData.scheduledTime) {
      const newTrayNotif = {
        id: `n-${Date.now()}`,
        type: notifData.type.toLowerCase().replace(' ', '_'),
        title: notifData.title,
        message: notifData.message,
        time: 'Just now',
        isRead: false
      };
      setNotifications(prev => [newTrayNotif, ...prev]);
    }
  };

  const cancelScheduledNotification = (logId) => {
    setSentNotifications(prev => prev.map(log => {
      if (log.id === logId && log.status === 'Queued') {
        return { ...log, status: 'Failed', message: `${log.message} (Cancelled by Admin)` };
      }
      return log;
    }));
  };

  const retryFailedNotification = (logId) => {
    setSentNotifications(prev => prev.map(log => {
      if (log.id === logId) {
        return { 
          ...log, 
          status: 'Delivered', 
          stats: { ...log.stats, sentCount: log.stats.sentCount || 120, openCount: Math.floor((log.stats.sentCount || 120) * 0.8) } 
        };
      }
      return log;
    }));
  };

  const deleteNotificationLog = (logId) => {
    setSentNotifications(prev => prev.filter(log => log.id !== logId));
  };

  const addNotificationTemplate = (tplData) => {
    const newTpl = {
      ...tplData,
      id: `tpl-${Date.now()}`,
      createdBy: currentUser?.name || 'Admin'
    };
    setNotificationTemplates(prev => [...prev, newTpl]);
  };

  const updateNotificationTemplate = (tplId, updatedData) => {
    setNotificationTemplates(prev => prev.map(t => t.id === tplId ? { ...t, ...updatedData } : t));
  };

  const deleteNotificationTemplate = (tplId) => {
    setNotificationTemplates(prev => prev.filter(t => t.id !== tplId));
  };

  const togglePinNotificationLog = (logId) => {
    setSentNotifications(prev => prev.map(log => {
      if (log.id === logId) {
        return { ...log, isPinned: !log.isPinned };
      }
      return log;
    }));
  };

  const updateMatrimonialProfileStatus = (profileId, status, reason) => {
    setMatrimonialProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const oldStatus = p.status;
        const log = {
          id: `log-${Date.now()}`,
          action: 'Status Change',
          oldStatus,
          newStatus: status,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          reason: reason || 'Status transition update'
        };
        return { ...p, status, auditLogs: [log, ...(p.auditLogs || [])] };
      }
      return p;
    }));
  };

  const updateMatrimonialProfileDocumentStatus = (profileId, docId, status, notes) => {
    setMatrimonialProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const updatedDocs = (p.documents || []).map(d => d.id === docId ? { ...d, status, notes } : d);
        const log = {
          id: `log-${Date.now()}`,
          action: 'Document Verification',
          oldStatus: `Doc ${docId} Status`,
          newStatus: status,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          reason: notes || 'Document verification update'
        };
        return { ...p, documents: updatedDocs, auditLogs: [log, ...(p.auditLogs || [])] };
      }
      return p;
    }));
  };

  const resolveMatrimonialComplaint = (profileId, complaintId, status, notes) => {
    setMatrimonialProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const updatedComplaints = (p.complaints || []).map(c => c.id === complaintId ? { ...c, status, notes } : c);
        const log = {
          id: `log-${Date.now()}`,
          action: 'Complaint Resolution',
          oldStatus: `Complaint ${complaintId} Status`,
          newStatus: status,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          reason: notes || 'Complaint closure update'
        };
        return { ...p, complaints: updatedComplaints, auditLogs: [log, ...(p.auditLogs || [])] };
      }
      return p;
    }));
  };

  const updateMatrimonialProfile = (profileId, updatedData) => {
    setMatrimonialProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const merged = { ...p, ...updatedData };
        const log = {
          id: `log-${Date.now()}`,
          action: 'Profile Moderation',
          oldStatus: 'Active',
          newStatus: 'Moderated details updated',
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
          reason: 'Profile content moderation'
        };
        merged.auditLogs = [log, ...(merged.auditLogs || [])];
        return merged;
      }
      return p;
    }));
  };

  const value = {
    currentUser,
    members: adaptedMembersList,
    admins: adaptedAdminsList,
    posts: adaptedPostsList,
    events,
    verifyMember,
    rejectMember,
    addEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    updateRegistrationStatus,
    updateAttendanceStatus,
    uploadGalleryItem,
    deleteGalleryItem,
    addEventAnnouncement,
    professionals,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    updateProfessionalStatus,
    updateProfessionalDocumentStatus,
    resolveProfessionalComplaint,
    sentNotifications,
    notificationTemplates,
    sendCommunityNotification,
    cancelScheduledNotification,
    retryFailedNotification,
    deleteNotificationLog,
    addNotificationTemplate,
    updateNotificationTemplate,
    deleteNotificationTemplate,
    togglePinNotificationLog,
    rawMatrimonialProfiles: matrimonialProfiles,
    updateMatrimonialProfileStatus,
    updateMatrimonialProfileDocumentStatus,
    resolveMatrimonialComplaint,
    updateMatrimonialProfile,
    matrimonialProfiles: adaptedMatrimonialList,
    updateProfile,
    loginUser,
    logoutUser,
    addFamilyMember,
    deleteFamilyMember,
    updateFamilyMember,
    createPost,
    toggleEventRSVP,
    togglePostLike,
    togglePostSave,
    addPostComment,
    addCommentReply,
    toggleCommentLike,
    followedAnnouncements,
    toggleFollowedAnnouncement,
    addMatrimonialProfile,
    toggleMatrimonialInterest,
    handleMatrimonialInterestResponse,
    updateMatrimonialBio,
    chats,
    chatMessages,
    getOrCreateChat,
    sendChatMessage,
    invitations,
    createInvitation,
    addInvitesToInvitation,
    updateInvitationRSVP,
    updateInvitationStatus,
    updateInvitation,
    deleteInvitation,
    invitationFormConfig,
    updateInvitationConfig,
    obituaries,
    addObituary,
    toggleObituaryShraddhanjali,
    addObituaryComment,
    toggleHaathJode,
    toggleMalaArpan,
    incrementMalaArpan,
    saveShradhanjali,
    shareShradhanjali,
    incrementObituaryViews,
    likeObituaryComment,
    resetAllData,
    language,
    setLanguage,
    groups: adaptedGroupsList,
    groupMessages: adaptedGroupMessagesMap,
    notifications: adaptedNotificationsList,
    joinGroup,
    leaveGroup,
    toggleGroupMute,
    sendGroupMessage,
    createGroup,
    markAllNotificationsRead,
    addNotification,
    getNotificationsForModule,
    getUnreadCountForModule,
    getNotificationModule,
    updateGroupDetails,
    reactToGroupMessage,
    clearChatMessages,
    stories: adaptedStoriesList,
    addStory,
    
    // Follow System & Privacy Exports
    profilePrivacy,
    followRelations,
    blockedUsers,
    granularPrivacy,
    sendFollowRequest,
    cancelFollowRequest,
    acceptFollowRequest,
    rejectFollowRequest,
    unfollowUser,
    removeFollower,
    updateProfilePrivacy,
    updateGranularPrivacy,
    blockUser,
    unblockUser,

    // Event Reminders
    eventReminders,
    toggleEventReminder: (eventId) => {
      setEventReminders(prev => {
        const updated = { ...prev, [eventId]: !prev[eventId] };
        return updated;
      });
    },

    // Event RSVP Registrations
    eventRegistrations,
    registerForEvent: (eventId, registrationData) => {
      setEventRegistrations(prev => ({
        ...prev,
        [eventId]: { ...registrationData, registeredAt: new Date().toISOString() }
      }));
    },
    cancelEventRegistration: (eventId) => {
      setEventRegistrations(prev => {
        const updated = { ...prev };
        delete updated[eventId];
        return updated;
      });
    },

    // Survey Responses
    surveyResponses,
    submitSurveyAnswer: (surveyId, questionId, answer) => {
      setSurveyResponses(prev => ({
        ...prev,
        [surveyId]: { ...(prev[surveyId] || {}), [questionId]: answer }
      }));
    },
    submitFullSurvey: (surveyId, answersMap) => {
      setSurveyResponses(prev => ({
        ...prev,
        [surveyId]: { ...answersMap, submittedAt: new Date().toISOString() }
      }));
    },

    // Mobile Menu
    isMobileMenuOpen,
    setMobileMenuOpen,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
