export const mockFamilies = [
  {
    id: 'FAM-1001',
    name: 'Agrawal Family Indore',
    community: 'Agrawal Samaj',
    city: 'Indore',
    address: '42, Vijay Nagar, Indore, MP - 452010',
    headId: 'm1001-h1',
    headName: 'Rajesh Agrawal',
    headPhone: '+91 98765 43210',
    status: 'Active',
    verificationStatus: 'Verified',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2026-07-01T15:30:00Z',
    members: [
      { id: 'm1001-h1', name: 'Rajesh Agrawal', relation: 'Self', age: 34, phone: '+91 98765 43210', occupation: 'Business Owner', maritalStatus: 'Married', dob: '1991-03-15', gender: 'Male', isVerified: true, avatar: null, initials: 'RA' },
      { id: 'm1001-m2', name: 'Sunita Agrawal', relation: 'Wife', age: 31, phone: '+91 98765 43211', occupation: 'Homemaker', maritalStatus: 'Married', dob: '1994-08-20', gender: 'Female', isVerified: true, avatar: null, initials: 'SA' },
      { id: 'm1001-m3', name: 'Aarav Agrawal', relation: 'Son', age: 8, phone: '', occupation: 'Student', maritalStatus: 'Single', dob: '2018-05-12', gender: 'Male', isVerified: true, avatar: null, initials: 'AA' },
      { id: 'm1001-m4', name: 'Priya Agrawal', relation: 'Daughter', age: 5, phone: '', occupation: 'Student', maritalStatus: 'Single', dob: '2021-11-30', gender: 'Female', isVerified: true, avatar: null, initials: 'PA' }
    ],
    documents: [
      { id: 'doc1001-1', type: 'Identity Proof', name: 'Aadhaar Card', status: 'Approved', fileUrl: 'aadhaar_rajesh.jpg' },
      { id: 'doc1001-2', type: 'Address Proof', name: 'Utility Bill', status: 'Approved', fileUrl: 'electricity_bill.pdf' }
    ],
    donationHistory: [
      { id: 'don-1', amount: 5000, date: '2026-05-12', purpose: 'Samaj Bhawan Renovation' },
      { id: 'don-2', amount: 2000, date: '2026-06-20', purpose: 'Matrimonial Sammelan Contribution' }
    ],
    communityActivity: [
      { date: '2026-07-06', activity: 'Logged in to Indore Portal', type: 'Login' },
      { date: '2026-07-05', activity: 'Updated Matrimonial Profile', type: 'Update' }
    ],
    auditHistory: [
      { date: '2024-01-15T10:00:00Z', action: 'Family Created', operator: 'Self Registered', details: 'Initial registration' },
      { date: '2024-01-20T11:00:00Z', action: 'Verification Approved', operator: 'Shri Mohan Lal Agrawal', details: 'Approved matching documents' }
    ]
  },
  {
    id: 'FAM-1002',
    name: 'Sharma Family Mumbai',
    community: 'Brahmin Samaj',
    city: 'Mumbai',
    address: '102, Shanti Vihar, Andheri East, Mumbai, MH - 400069',
    headId: 'm1002-h1',
    headName: 'Rajesh Sharma',
    headPhone: '+91 98765 43210',
    status: 'Active',
    verificationStatus: 'Verified',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2026-07-08T08:00:00Z',
    members: [
      { id: 'm1002-h1', name: 'Rajesh Sharma', relation: 'Self', age: 45, phone: '+91 98765 43210', occupation: 'Business Owner', maritalStatus: 'Married', dob: '1981-01-15', gender: 'Male', isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u1', initials: 'RS' },
      { id: 'm1002-m2', name: 'Sushma Sharma', relation: 'Wife', age: 41, phone: '+91 98765 43222', occupation: 'Homemaker', maritalStatus: 'Married', dob: '1985-05-10', gender: 'Female', isVerified: true, avatar: null, initials: 'SS' },
      { id: 'm1002-m3', name: 'Nitin Sharma', relation: 'Son', age: 18, phone: '+91 98765 43223', occupation: 'Student', maritalStatus: 'Single', dob: '2008-11-20', gender: 'Male', isVerified: true, avatar: null, initials: 'NS' }
    ],
    documents: [
      { id: 'doc1002-1', type: 'Identity Proof', name: 'Aadhaar Card', status: 'Approved', fileUrl: 'aadhaar_rajesh_s.jpg' }
    ],
    donationHistory: [
      { id: 'don-3', amount: 10000, date: '2026-01-10', purpose: 'Education Scholarship Fund' }
    ],
    communityActivity: [
      { date: '2026-07-08', activity: 'Logged in to Master Panel', type: 'Login' }
    ],
    auditHistory: [
      { date: '2023-01-15T10:30:00Z', action: 'Family Created', operator: 'System', details: 'Onboarded via website' }
    ]
  },
  {
    id: 'FAM-1003',
    name: 'Desai Family Ahmedabad',
    community: 'Patidar Samaj',
    city: 'Ahmedabad',
    address: 'A-203, Gokul Dham, Satellite, Ahmedabad, GJ - 380015',
    headId: 'm1003-h1',
    headName: 'Anita Desai',
    headPhone: '+91 98765 43211',
    status: 'Active',
    verificationStatus: 'Verified',
    createdAt: '2023-02-20T14:45:00Z',
    updatedAt: '2026-07-07T18:20:00Z',
    members: [
      { id: 'm1003-h1', name: 'Anita Desai', relation: 'Self', age: 38, phone: '+91 98765 43211', occupation: 'Teacher', maritalStatus: 'Married', dob: '1988-06-12', gender: 'Female', isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u2', initials: 'AD' },
      { id: 'm1003-m2', name: 'Vimal Desai', relation: 'Husband', age: 41, phone: '+91 98765 43288', occupation: 'Software Engineer', maritalStatus: 'Married', dob: '1985-02-18', gender: 'Male', isVerified: true, avatar: null, initials: 'VD' }
    ],
    documents: [
      { id: 'doc1003-1', type: 'Identity Proof', name: 'Voter ID', status: 'Approved', fileUrl: 'voter_anita.jpg' }
    ],
    donationHistory: [],
    communityActivity: [],
    auditHistory: [
      { date: '2023-02-20T14:45:00Z', action: 'Family Created', operator: 'System', details: 'Imported from old database' }
    ]
  },
  {
    id: 'FAM-1004',
    name: 'Singh Family Jaipur',
    community: 'Rajput Samaj',
    city: 'Jaipur',
    address: '15, Rana Pratap Nagar, Jaipur, RJ - 302012',
    headId: 'm1004-h1',
    headName: 'Vikram Singh',
    headPhone: '+91 98765 43212',
    status: 'Active',
    verificationStatus: 'Pending',
    createdAt: '2023-05-10T09:15:00Z',
    updatedAt: '2023-05-10T09:20:00Z',
    members: [
      { id: 'm1004-h1', name: 'Vikram Singh', relation: 'Self', age: 28, phone: '+91 98765 43212', occupation: 'Software Engineer', maritalStatus: 'Single', dob: '1998-04-20', gender: 'Male', isVerified: false, avatar: 'https://i.pravatar.cc/150?u=u3', initials: 'VS' },
      { id: 'm1004-m2', name: 'Suryaveer Singh', relation: 'Father', age: 58, phone: '', occupation: 'Retired', maritalStatus: 'Married', dob: '1968-08-05', gender: 'Male', isVerified: false, avatar: null, initials: 'SS' },
      { id: 'm1004-m3', name: 'Rukmani Kanwar', relation: 'Mother', age: 53, phone: '', occupation: 'Homemaker', maritalStatus: 'Married', dob: '1973-12-10', gender: 'Female', isVerified: false, avatar: null, initials: 'RK' }
    ],
    documents: [
      { id: 'doc1004-1', type: 'Identity Proof', name: 'Aadhaar Card', status: 'Pending Approval', fileUrl: 'aadhaar_vikram.jpg' }
    ],
    donationHistory: [],
    communityActivity: [],
    auditHistory: [
      { date: '2023-05-10T09:15:00Z', action: 'Family Created', operator: 'Self Registered', details: 'Awaiting verification approval' }
    ]
  },
  {
    id: 'FAM-1005',
    name: 'Verma Family Delhi',
    community: 'Agarwal Samaj',
    city: 'Delhi',
    address: 'D-56, Pitampura, Delhi - 110034',
    headId: 'm1005-h1',
    headName: 'Sunita Verma',
    headPhone: '+91 98765 43213',
    status: 'Suspended',
    verificationStatus: 'Verified',
    createdAt: '2023-06-01T11:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
    members: [
      { id: 'm1005-h1', name: 'Sunita Verma', relation: 'Self', age: 52, phone: '+91 98765 43213', occupation: 'Homemaker', maritalStatus: 'Married', dob: '1974-05-10', gender: 'Female', isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u4', initials: 'SV' },
      { id: 'm1005-m2', name: 'Ramesh Verma', relation: 'Husband', age: 56, phone: '+91 98765 43255', occupation: 'Govt Employee', maritalStatus: 'Married', dob: '1970-02-14', gender: 'Male', isVerified: true, avatar: null, initials: 'RV' }
    ],
    documents: [
      { id: 'doc1005-1', type: 'Identity Proof', name: 'PAN Card', status: 'Approved', fileUrl: 'pan_sunita.jpg' }
    ],
    donationHistory: [
      { id: 'don-4', amount: 15000, date: '2025-08-15', purpose: 'Community Medical Camp' }
    ],
    communityActivity: [],
    auditHistory: [
      { date: '2023-06-01T11:00:00Z', action: 'Family Created', operator: 'System', details: 'Created' },
      { date: '2026-06-15T10:00:00Z', action: 'Status Suspended', operator: 'Admin System', details: 'Suspended due to reports of false data' }
    ]
  },
  {
    id: 'FAM-1006',
    name: 'Patel Family Surat',
    community: 'Patidar Samaj',
    city: 'Surat',
    address: 'B-701, Royal Palace, Varachha Road, Surat, GJ - 395006',
    headId: 'm1006-h1',
    headName: 'Amit Patel',
    headPhone: '+91 98765 43214',
    status: 'Active',
    verificationStatus: 'Verified',
    createdAt: '2023-08-22T16:30:00Z',
    updatedAt: '2026-07-08T07:45:00Z',
    members: [
      { id: 'm1006-h1', name: 'Amit Patel', relation: 'Self', age: 60, phone: '+91 98765 43214', occupation: 'Industrialist', maritalStatus: 'Married', dob: '1966-07-22', gender: 'Male', isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u5', initials: 'AP' },
      { id: 'm1006-m2', name: 'Jasmin Patel', relation: 'Wife', age: 55, phone: '+91 98765 43266', occupation: 'Homemaker', maritalStatus: 'Married', dob: '1971-04-12', gender: 'Female', isVerified: true, avatar: null, initials: 'JP' },
      { id: 'm1006-m3', name: 'Hardik Patel', relation: 'Son', age: 30, phone: '+91 98765 43267', occupation: 'Business Owner', maritalStatus: 'Single', dob: '1996-09-08', gender: 'Male', isVerified: true, avatar: null, initials: 'HP' }
    ],
    documents: [
      { id: 'doc1006-1', type: 'Identity Proof', name: 'Passport', status: 'Approved', fileUrl: 'passport_amit.jpg' }
    ],
    donationHistory: [
      { id: 'don-5', amount: 50000, date: '2025-12-25', purpose: 'Community Hospital Wing' }
    ],
    communityActivity: [
      { date: '2026-07-08', activity: 'Logged in', type: 'Login' }
    ],
    auditHistory: [
      { date: '2023-08-22T16:30:00Z', action: 'Family Created', operator: 'System', details: 'Created' }
    ]
  },
  {
    id: 'FAM-1007',
    name: 'Gupta Family Bhopal',
    community: 'Agarwal Samaj',
    city: 'Bhopal',
    address: '42, Arera Colony, Bhopal, MP - 462016',
    headId: 'm1007-h1',
    headName: 'Sanjay Gupta',
    headPhone: '+91 99999 88888',
    status: 'Active',
    verificationStatus: 'Pending',
    createdAt: '2026-06-10T12:00:00Z',
    updatedAt: '2026-06-10T12:00:00Z',
    members: [
      { id: 'm1007-h1', name: 'Sanjay Gupta', relation: 'Self', age: 48, phone: '+91 99999 88888', occupation: 'CA', maritalStatus: 'Married', dob: '1978-01-20', gender: 'Male', isVerified: false, avatar: null, initials: 'SG' },
      { id: 'm1007-m2', name: 'Anshu Gupta', relation: 'Wife', age: 44, phone: '', occupation: 'Teacher', maritalStatus: 'Married', dob: '1982-10-15', gender: 'Female', isVerified: false, avatar: null, initials: 'AG' }
    ],
    documents: [
      { id: 'doc1007-1', type: 'Identity Proof', name: 'Aadhaar Card', status: 'Pending Approval', fileUrl: 'aadhaar_sanjay.jpg' }
    ],
    donationHistory: [],
    communityActivity: [],
    auditHistory: [
      { date: '2026-06-10T12:00:00Z', action: 'Family Created', operator: 'Self Registered', details: 'Created via mobile app' }
    ]
  },
  {
    id: 'FAM-1008',
    name: 'Mali Family Ujjain',
    community: 'Mali Samaj',
    city: 'Ujjain',
    address: '105, Mahakal Marg, Ujjain, MP - 456001',
    headId: 'm1008-h1',
    headName: 'Radhe Shyam Mali',
    headPhone: '+91 98888 77777',
    status: 'Archived',
    verificationStatus: 'Verified',
    createdAt: '2022-05-15T09:00:00Z',
    updatedAt: '2026-05-10T11:00:00Z',
    members: [
      { id: 'm1008-h1', name: 'Radhe Shyam Mali', relation: 'Self', age: 65, phone: '+91 98888 77777', occupation: 'Retired Farmer', maritalStatus: 'Widowed', dob: '1961-05-15', gender: 'Male', isVerified: true, avatar: null, initials: 'RM' },
      { id: 'm1008-m2', name: 'Kailash Mali', relation: 'Son', age: 38, phone: '+91 98888 77778', occupation: 'Shopkeeper', maritalStatus: 'Married', dob: '1988-09-12', gender: 'Male', isVerified: true, avatar: null, initials: 'KM' }
    ],
    documents: [
      { id: 'doc1008-1', type: 'Identity Proof', name: 'Voter ID', status: 'Approved', fileUrl: 'voter_radheshyam.jpg' }
    ],
    donationHistory: [
      { id: 'don-6', amount: 5000, date: '2023-04-10', purpose: 'Dharamshala Construction' }
    ],
    communityActivity: [],
    auditHistory: [
      { date: '2022-05-15T09:00:00Z', action: 'Family Created', operator: 'System', details: 'System Import' },
      { date: '2026-05-10T11:00:00Z', action: 'Family Archived', operator: 'Admin', details: 'Archived due to relocation' }
    ]
  }
];
