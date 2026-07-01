// Mock member data with realistic Indian community names
export const currentUser = {
  id: 'u1',
  name: 'Rajesh Agrawal',
  phone: '+91 98765 43210',
  email: 'rajesh.agrawal@email.com',
  avatar: null,
  initials: 'RA',
  community: 'Agrawal Samaj',
  city: 'Indore',
  profession: 'Business Owner',
  company: 'Agrawal Traders Pvt. Ltd.',
  age: 34,
  gender: 'Male',
  dob: '1991-03-15',
  address: '42, Vijay Nagar, Indore, MP - 452010',
  memberSince: '2024-01-15',
  isVerified: true,
  matrimonialBio: 'I run a fashion design studio in Indore. I spend...',
  familyMembers: [
    { id: 'f1', name: 'Sunita Agrawal', relation: 'Wife', age: 31, avatar: null, initials: 'SA' },
    { id: 'f2', name: 'Aarav Agrawal', relation: 'Son', age: 8, avatar: null, initials: 'AA' },
    { id: 'f3', name: 'Priya Agrawal', relation: 'Daughter', age: 5, avatar: null, initials: 'PA' },
  ],
};

export const mockMembers = [
  {
    id: 'm1',
    name: 'Suresh Agrawal',
    initials: 'SA',
    city: 'Jaipur',
    profession: 'Architect',
    community: 'Agrawal Samaj',
    gender: 'Male',
    age: 42,
    isVerified: true,
    avatar: null,
    phone: '+91 94140 12345',
    email: 'suresh.architect@email.com',
    company: 'Agrawal & Associates Architects',
    education: 'B.Arch',
    familyMembers: [
      { id: 'm1-f1', name: 'Anita Agrawal', relation: 'Wife', age: 38, initials: 'AA' },
      { id: 'm1-f2', name: 'Rohit Agrawal', relation: 'Son', age: 12, initials: 'RA' }
    ]
  },
  {
    id: 'm2',
    name: 'Kavita Agrawal',
    initials: 'KA',
    city: 'Indore',
    profession: 'Doctor',
    community: 'Agrawal Samaj',
    gender: 'Female',
    age: 35,
    isVerified: true,
    avatar: null,
    phone: '+91 98270 54321',
    email: 'dr.kavita.a@email.com',
    company: 'Agrawal Care Clinic',
    education: 'MBBS, MD',
    familyMembers: [
      { id: 'm2-f1', name: 'Dr. Vinay Agrawal', relation: 'Husband', age: 37, initials: 'VA' },
      { id: 'm2-f2', name: 'Riya Agrawal', relation: 'Daughter', age: 6, initials: 'RA' }
    ]
  },
  {
    id: 'm3',
    name: 'Deepak Agrawal',
    initials: 'DA',
    city: 'Bhopal',
    profession: 'Software Engineer',
    community: 'Agrawal Samaj',
    gender: 'Male',
    age: 29,
    isVerified: false,
    avatar: null,
    phone: '+91 99810 98765',
    email: 'deepak.se@email.com',
    company: 'Agrawal Tech Solutions',
    education: 'B.Tech CSE',
    familyMembers: [
      { id: 'm3-f1', name: 'Omprakash Agrawal', relation: 'Father', age: 58, initials: 'OA' },
      { id: 'm3-f2', name: 'Sunita Agrawal', relation: 'Mother', age: 54, initials: 'SA' }
    ]
  },
  {
    id: 'm4',
    name: 'Anita Agrawal',
    initials: 'AA',
    city: 'Ujjain',
    profession: 'Teacher',
    community: 'Agrawal Samaj',
    gender: 'Female',
    age: 38,
    isVerified: true,
    avatar: null,
    phone: '+91 98930 11223',
    email: 'anita.teacher@email.com',
    company: 'Bright Minds Academy',
    education: 'M.A., B.Ed',
    familyMembers: [
      { id: 'm4-f1', name: 'Manoj Agrawal', relation: 'Husband', age: 41, initials: 'MA' },
      { id: 'm4-f2', name: 'Sneha Agrawal', relation: 'Daughter', age: 10, initials: 'SA' }
    ]
  },
  {
    id: 'm5',
    name: 'Vikas Agrawal',
    initials: 'VA',
    city: 'Indore',
    profession: 'CA',
    community: 'Agrawal Samaj',
    gender: 'Male',
    age: 45,
    isVerified: true,
    avatar: null,
    phone: '+91 98260 44556',
    email: 'ca.vikas@email.com',
    company: 'Vikas Agrawal & Co. CAs',
    education: 'FCA (Chartered Accountant)',
    familyMembers: [
      { id: 'm5-f1', name: 'Priya Agrawal', relation: 'Wife', age: 42, initials: 'PA' },
      { id: 'm5-f2', name: 'Yash Agrawal', relation: 'Son', age: 16, initials: 'YA' },
      { id: 'm5-f3', name: 'Ananya Agrawal', relation: 'Daughter', age: 11, initials: 'AA' }
    ]
  },
  {
    id: 'm6',
    name: 'Pooja Agrawal',
    initials: 'PA',
    city: 'Ahmedabad',
    profession: 'Pharmacist',
    community: 'Agrawal Samaj',
    gender: 'Female',
    age: 31,
    isVerified: true,
    avatar: null,
    phone: '+91 97129 88776',
    email: 'pooja.pharma@email.com',
    company: 'Agrawal Medicos',
    education: 'B.Pharm',
    familyMembers: [
      { id: 'm6-f1', name: 'Sanjay Agrawal', relation: 'Husband', age: 34, initials: 'SA' },
      { id: 'm6-f2', name: 'Kunal Agrawal', relation: 'Son', age: 4, initials: 'KA' }
    ]
  },
  {
    id: 'm7',
    name: 'Ramesh Agrawal',
    initials: 'RA',
    city: 'Lucknow',
    profession: 'Lawyer',
    community: 'Agrawal Samaj',
    gender: 'Male',
    age: 50,
    isVerified: true,
    avatar: null,
    phone: '+91 94150 99887',
    email: 'advocate.ramesh@email.com',
    company: 'Agrawal Legal Associates',
    education: 'BA LLB',
    familyMembers: [
      { id: 'm7-f1', name: 'Suman Agrawal', relation: 'Wife', age: 46, initials: 'SA' },
      { id: 'm7-f2', name: 'Nitin Agrawal', relation: 'Son', age: 21, initials: 'NA' }
    ]
  },
  {
    id: 'm8',
    name: 'Neha Agrawal',
    initials: 'NA',
    city: 'Indore',
    profession: 'Interior Designer',
    community: 'Agrawal Samaj',
    gender: 'Female',
    age: 27,
    isVerified: false,
    avatar: null,
    phone: '+91 90090 33445',
    email: 'neha.designs@email.com',
    company: 'Creative Spaces Interior',
    education: 'B.Des',
    familyMembers: [
      { id: 'm8-f1', name: 'Shri Vijay Agrawal', relation: 'Father', age: 56, initials: 'VA' },
      { id: 'm8-f2', name: 'Smt. Asha Agrawal', relation: 'Mother', age: 51, initials: 'AA' }
    ]
  },
  {
    id: 'm9',
    name: 'Amit Agrawal',
    initials: 'AA',
    city: 'Delhi',
    profession: 'Marketing Manager',
    community: 'Agrawal Samaj',
    gender: 'Male',
    age: 33,
    isVerified: true,
    avatar: null,
    phone: '+91 98110 55667',
    email: 'amit.marketing@email.com',
    company: 'Agrawal Retail Corp',
    education: 'MBA (Marketing)',
    familyMembers: [
      { id: 'm9-f1', name: 'Kiran Agrawal', relation: 'Wife', age: 30, initials: 'KA' },
      { id: 'm9-f2', name: 'Drishti Agrawal', relation: 'Daughter', age: 2, initials: 'DA' }
    ]
  },
  {
    id: 'm10',
    name: 'Suman Agrawal',
    initials: 'SA',
    city: 'Jaipur',
    profession: 'Homemaker',
    community: 'Agrawal Samaj',
    gender: 'Female',
    age: 48,
    isVerified: true,
    avatar: null,
    phone: '+91 94140 77889',
    email: 'suman.agrawal@email.com',
    company: 'Agrawal Household',
    education: 'B.A.',
    familyMembers: [
      { id: 'm10-f1', name: 'Shri Suresh Agrawal', relation: 'Husband', age: 52, initials: 'SA' },
      { id: 'm10-f2', name: 'Preeti Agrawal', relation: 'Daughter', age: 20, initials: 'PA' }
    ]
  },
];

export const mockAdmins = [
  // Level 0: Patron (Sanrakshak)
  { id: 'a0', name: 'Seth Govindram Agrawal', initials: 'GA', city: 'Indore', role: 'Patron', avatar: null, phone: '+91 98765 00000' },
  { id: 'a0_j', name: 'Seth Kirodimal Agrawal', initials: 'KA', city: 'Jaipur', role: 'Patron', avatar: null, phone: '+91 98765 00001' },

  // Level 1: President (Adhyaksh)
  { id: 'a1', name: 'Shri Mohan Lal Agrawal', initials: 'MA', city: 'Indore', role: 'President', avatar: null, phone: '+91 98765 43210' },
  { id: 'a2', name: 'Smt. Kamla Agrawal', initials: 'KA', city: 'Jaipur', role: 'President', avatar: null, phone: '+91 98765 43211' },
  
  // Level 2: Core Committee (Mukhya Padadhikari)
  { id: 'a10', name: 'Shri Ramesh Chand Agrawal', initials: 'RA', city: 'Indore', role: 'Vice President', avatar: null, phone: '+91 98765 11111' },
  { id: 'a11', name: 'Shri Suresh Kumar Agrawal', initials: 'SA', city: 'Indore', role: 'Secretary', avatar: null, phone: '+91 98765 22222' },
  { id: 'a12b', name: 'Shri Dinesh Kumar Agrawal', initials: 'DA', city: 'Indore', role: 'Joint Secretary', avatar: null, phone: '+91 98765 33334' },
  { id: 'a12', name: 'Shri Vinod Kumar Agrawal', initials: 'VA', city: 'Indore', role: 'Treasurer', avatar: null, phone: '+91 98765 33333' },

  // Jaipur Core Committee
  { id: 'a10_j', name: 'Shri Ramesh Chand Agrawal', initials: 'RA', city: 'Jaipur', role: 'Vice President', avatar: null, phone: '+91 98765 11111' },
  { id: 'a11_j', name: 'Shri Suresh Kumar Agrawal', initials: 'SA', city: 'Jaipur', role: 'Secretary', avatar: null, phone: '+91 98765 22222' },
  { id: 'a12b_j', name: 'Shri Dinesh Kumar Agrawal', initials: 'DA', city: 'Jaipur', role: 'Joint Secretary', avatar: null, phone: '+91 98765 33334' },
  { id: 'a12_j', name: 'Shri Vinod Kumar Agrawal', initials: 'VA', city: 'Jaipur', role: 'Treasurer', avatar: null, phone: '+91 98765 33333' },

  // Level 3: Executive Board (Mantrimandal)
  { id: 'a13', name: 'Shri Ashok Kumar Agrawal', initials: 'AA', city: 'Indore', role: 'Minister (Education)', avatar: null, phone: '+91 98765 44444' },
  { id: 'a14', name: 'Shri Deepak Kumar Agrawal', initials: 'DA', city: 'Indore', role: 'Minister (Youth)', avatar: null, phone: '+91 98765 55555' },
  { id: 'a15', name: 'Smt. Seema Agrawal', initials: 'SA', city: 'Indore', role: 'Minister (Women Welfare)', avatar: null, phone: '+91 98765 66666' },
  { id: 'a16', name: 'Shri Mahesh Chand Agrawal', initials: 'MA', city: 'Indore', role: 'Minister (Social)', avatar: null, phone: '+91 98765 77777' },

  // Jaipur Executive Board
  { id: 'a13_j', name: 'Shri Ashok Kumar Agrawal', initials: 'AA', city: 'Jaipur', role: 'Minister (Education)', avatar: null, phone: '+91 98765 44444' },
  { id: 'a14_j', name: 'Shri Deepak Kumar Agrawal', initials: 'DA', city: 'Jaipur', role: 'Minister (Youth)', avatar: null, phone: '+91 98765 55555' },
  { id: 'a15_j', name: 'Smt. Seema Agrawal', initials: 'SA', city: 'Jaipur', role: 'Minister (Women Welfare)', avatar: null, phone: '+91 98765 66666' },
  { id: 'a16_j', name: 'Shri Mahesh Chand Agrawal', initials: 'MA', city: 'Jaipur', role: 'Minister (Social)', avatar: null, phone: '+91 98765 77777' },

  // Level 4: Zonal Heads (Kshetriya Prabhari)
  { id: 'a20', name: 'Shri Ramakant Agrawal', initials: 'RA', city: 'Indore', role: 'Zonal Head', zone: 'East Zone', avatar: null, phone: '+91 98765 88881' },
  { id: 'a21', name: 'Shri Kamal Agrawal', initials: 'KA', city: 'Indore', role: 'Zonal Head', zone: 'West Zone', avatar: null, phone: '+91 98765 88882' },

  // Jaipur Zonal Heads
  { id: 'a20_j', name: 'Shri Ramakant Agrawal', initials: 'RA', city: 'Jaipur', role: 'Zonal Head', zone: 'East Zone', avatar: null, phone: '+91 98765 88881' },
  { id: 'a21_j', name: 'Shri Kamal Agrawal', initials: 'KA', city: 'Jaipur', role: 'Zonal Head', zone: 'West Zone', avatar: null, phone: '+91 98765 88882' },

  // Level 5: Regional Delegates (Area Sub-Heads)
  { id: 'a4', name: 'Shri Prakashchand Agrawal', initials: 'PA', city: 'Indore', area: 'Vijay Nagar', role: 'Area Sub-Head', members: 142, avatar: null },
  { id: 'a5', name: 'Smt. Omprakash Agrawal', initials: 'OA', city: 'Indore', area: 'Palasia', role: 'Area Sub-Head', members: 89, avatar: null },
  { id: 'a6', name: 'Shri Shankar Lal Agrawal', initials: 'SA', city: 'Indore', area: 'Rajwada', role: 'Area Sub-Head', members: 210, avatar: null },
  { id: 'a7', name: 'Shri Govind Agrawal', initials: 'GA', city: 'Indore', area: 'Bhawarkuan', role: 'Area Sub-Head', members: 156, avatar: null },
  { id: 'a8', name: 'Shri Bhanwarlal Agrawal', initials: 'BA', city: 'Indore', area: 'Sudama Nagar', role: 'Area Sub-Head', members: 312, avatar: null },

  // Jaipur Regional Delegates
  { id: 'a4_j', name: 'Shri Prakashchand Agrawal', initials: 'PA', city: 'Jaipur', area: 'Malviya Nagar', role: 'Area Sub-Head', members: 142, avatar: null },
  { id: 'a5_j', name: 'Smt. Omprakash Agrawal', initials: 'OA', city: 'Jaipur', area: 'C-Scheme', role: 'Area Sub-Head', members: 89, avatar: null },
  { id: 'a6_j', name: 'Shri Shankar Lal Agrawal', initials: 'SA', city: 'Jaipur', area: 'Vaishali Nagar', role: 'Area Sub-Head', members: 210, avatar: null },
  { id: 'a7_j', name: 'Shri Govind Agrawal', initials: 'GA', city: 'Jaipur', area: 'Raja Park', role: 'Area Sub-Head', members: 156, avatar: null },
  { id: 'a8_j', name: 'Shri Bhanwarlal Agrawal', initials: 'BA', city: 'Jaipur', area: 'Mansarovar', role: 'Area Sub-Head', members: 312, avatar: null },
];
