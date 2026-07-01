// This file seeds the initial context for the Fund Module

export const mockUsers = [
  { id: 'm1', name: 'Rahul Sharma', phone: '9876543210', profilePic: 'RS' },
  { id: 'm2', name: 'Manish Jain', phone: '9822XXXX10', profilePic: 'MJ' },
  { id: 'm3', name: 'Ashok Agrawal', phone: '9755XXXX88', profilePic: 'AA' },
  { id: 'm4', name: 'Sonu Gupta', phone: '9687XXXX21', profilePic: 'SG' },
  { id: 'm5', name: 'Virendra Joshi', phone: '9826XXXX33', profilePic: 'VJ' },
  { id: 'm6', name: 'Mahesh Patel', phone: '9988XXXX44', profilePic: 'MP' },
  { id: 'm7', name: 'Sanjay Kumar', phone: '9766XXXX22', profilePic: 'SK' },
  { id: 'm8', name: 'Dinesh Verma', phone: '9123XXXX55', profilePic: 'DV' },
];

export const initialFunds = [
  {
    id: 'f1',
    name: 'Dharamshala Maintenance Fund',
    purpose: 'Annual maintenance and repair of the Samaj Dharamshala',
    description: 'We are raising funds for repairing the roof, painting the main hall, and upgrading the community kitchen facilities before the upcoming festival season.',
    targetAmount: 500000,
    contributionPerMember: 2500,
    dueDate: '2024-12-31',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Active',
    assignedMembers: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']
  },
  {
    id: 'f2',
    name: 'Education Scholarship Fund 2024',
    purpose: 'Support bright students from underprivileged families',
    description: 'Provide financial assistance to 50 meritorious students for their higher education fees.',
    targetAmount: 250000,
    contributionPerMember: 1000,
    dueDate: '2024-08-15',
    startDate: '2024-05-01',
    endDate: '2024-08-15',
    status: 'Active',
    assignedMembers: ['m1', 'm2', 'm4', 'm6', 'm8'] // partial assignment example
  },
  {
    id: 'f3',
    name: 'Community Hospital Wing Construction',
    purpose: 'New pediatric wing in the community hospital',
    description: 'Successfully raised funds and completed the pediatric wing last year.',
    targetAmount: 1500000,
    contributionPerMember: 5000,
    dueDate: '2023-10-30',
    startDate: '2023-01-01',
    endDate: '2023-11-15',
    status: 'Completed',
    assignedMembers: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']
  }
];

// Stores member ledgers per fund
export const initialContributions = {
  'f1': [
    { memberId: 'm1', assignedAmount: 2500, paidAmount: 0, lastPaymentDate: null },
    { memberId: 'm2', assignedAmount: 2500, paidAmount: 1000, lastPaymentDate: '10 June 2024' },
    { memberId: 'm3', assignedAmount: 2500, paidAmount: 0, lastPaymentDate: null },
    { memberId: 'm4', assignedAmount: 2500, paidAmount: 2500, lastPaymentDate: '01 June 2024' },
    { memberId: 'm5', assignedAmount: 2500, paidAmount: 0, lastPaymentDate: null },
    { memberId: 'm6', assignedAmount: 2500, paidAmount: 2500, lastPaymentDate: '05 June 2024' },
    { memberId: 'm7', assignedAmount: 2500, paidAmount: 1500, lastPaymentDate: '12 June 2024' },
    { memberId: 'm8', assignedAmount: 2500, paidAmount: 2500, lastPaymentDate: '14 June 2024' },
  ],
  'f2': [
    { memberId: 'm1', assignedAmount: 1000, paidAmount: 1000, lastPaymentDate: '01 July 2024' },
    { memberId: 'm2', assignedAmount: 1000, paidAmount: 500, lastPaymentDate: '05 July 2024' },
    { memberId: 'm4', assignedAmount: 1000, paidAmount: 0, lastPaymentDate: null },
    { memberId: 'm6', assignedAmount: 1000, paidAmount: 1000, lastPaymentDate: '10 July 2024' },
    { memberId: 'm8', assignedAmount: 1000, paidAmount: 0, lastPaymentDate: null },
  ],
  'f3': [
    { memberId: 'm1', assignedAmount: 5000, paidAmount: 5000, lastPaymentDate: '15 Oct 2023' },
    { memberId: 'm2', assignedAmount: 5000, paidAmount: 5000, lastPaymentDate: '10 Oct 2023' },
    { memberId: 'm3', assignedAmount: 5000, paidAmount: 5000, lastPaymentDate: '01 Oct 2023' },
    { memberId: 'm4', assignedAmount: 5000, paidAmount: 5000, lastPaymentDate: '05 Oct 2023' },
    { memberId: 'm5', assignedAmount: 5000, paidAmount: 5000, lastPaymentDate: '12 Oct 2023' },
    { memberId: 'm6', assignedAmount: 5000, paidAmount: 5000, lastPaymentDate: '14 Oct 2023' },
    { memberId: 'm7', assignedAmount: 5000, paidAmount: 5000, lastPaymentDate: '20 Oct 2023' },
    { memberId: 'm8', assignedAmount: 5000, paidAmount: 5000, lastPaymentDate: '22 Oct 2023' },
  ]
};

export const initialExpenses = {
  'f1': [
    { id: 'e1', title: 'Roof Waterproofing', category: 'Maintenance', amount: 45000, date: '2024-05-15', addedBy: 'Admin (Ramesh)', receiptAttached: true },
    { id: 'e2', title: 'Plumbing Repairs', category: 'Maintenance', amount: 12500, date: '2024-06-02', addedBy: 'Admin (Ramesh)', receiptAttached: false },
  ],
  'f2': [
    { id: 'e3', title: 'First Semester Fees', category: 'Education', amount: 150000, date: '2024-06-10', addedBy: 'Admin (Ramesh)', receiptAttached: true },
  ],
  'f3': [
    { id: 'e4', title: 'Construction Final Payment', category: 'Infrastructure', amount: 1450000, date: '2023-11-01', addedBy: 'Admin (Ramesh)', receiptAttached: true },
  ]
};
