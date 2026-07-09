export const MOCK_PROFILES = [
  {
    id: 'mat_1',
    profileId: 'MP-2026-001',
    memberId: 'M-1042',
    name: 'Aarav Maheshwari',
    community: 'Global Maheshwari Samaj',
    city: 'Mumbai',
    state: 'Maharashtra',
    gender: 'Male',
    age: 28,
    profession: 'Software Engineer',
    education: 'B.Tech',
    gotra: 'Kabra',
    maritalStatus: 'Never Married',
    status: 'approved',
    verificationStatus: 'verified',
    subscription: 'premium',
    visibility: 'public',
    registrationDate: '2026-01-10T10:00:00Z',
    completionPct: 95,
    photoUrl: 'https://i.pravatar.cc/150?u=aarav'
  },
  {
    id: 'mat_2',
    profileId: 'MP-2026-002',
    memberId: 'M-2091',
    name: 'Priya Agrawal',
    community: 'Agrawal Vikas Trust',
    city: 'Delhi',
    state: 'Delhi',
    gender: 'Female',
    age: 26,
    profession: 'Doctor',
    education: 'MBBS',
    gotra: 'Bansal',
    maritalStatus: 'Never Married',
    status: 'pending',
    verificationStatus: 'unverified',
    subscription: 'free',
    visibility: 'private',
    registrationDate: '2026-03-12T14:30:00Z',
    completionPct: 70,
    photoUrl: 'https://i.pravatar.cc/150?u=priya'
  },
  {
    id: 'mat_3',
    profileId: 'MP-2026-003',
    memberId: 'M-0899',
    name: 'Rahul Jain',
    community: 'Jain Social Group',
    city: 'Ahmedabad',
    state: 'Gujarat',
    gender: 'Male',
    age: 32,
    profession: 'Business Owner',
    education: 'MBA',
    gotra: 'Garg',
    maritalStatus: 'Divorced',
    status: 'reported',
    verificationStatus: 'verified',
    subscription: 'enterprise',
    visibility: 'hidden',
    registrationDate: '2025-11-05T09:15:00Z',
    completionPct: 100,
    photoUrl: 'https://i.pravatar.cc/150?u=rahul'
  }
];

export const MOCK_REPORTS = [
  {
    id: 'rep_1',
    profileId: 'MP-2026-003',
    profileName: 'Rahul Jain',
    reporterName: 'Neha Sharma',
    community: 'Jain Social Group',
    reason: 'Fake Profile',
    evidence: 'Inconsistent details across messages.',
    priority: 'high',
    status: 'pending',
    date: '2026-07-01T10:00:00Z'
  }
];

export const MOCK_STATS = {
  totalProfiles: 12540,
  activeProfiles: 11020,
  pendingReviews: 142,
  reportedProfiles: 18,
  hiddenProfiles: 350,
  successfulMatches: 4200,
  totalGrooms: 6540,
  totalBrides: 6000,
  monthlyRegistrations: 450,
  avgCompletion: 82,
  genderRatio: { male: 52, female: 48 },
  topCommunities: [
    { name: 'Global Maheshwari Samaj', count: 4200 },
    { name: 'Agrawal Vikas Trust', count: 3800 },
    { name: 'Jain Social Group', count: 2100 }
  ]
};

export const MOCK_AUDIT_LOGS = [
  { id: 'aud_1', timestamp: '2026-07-08T09:00:00Z', action: 'Profile Approved', performedBy: 'Super Admin', details: 'Approved MP-2026-001' },
  { id: 'aud_2', timestamp: '2026-07-07T14:30:00Z', action: 'Profile Hidden', performedBy: 'Moderator Desk', details: 'Hidden MP-2026-042 due to inactivity' },
];
