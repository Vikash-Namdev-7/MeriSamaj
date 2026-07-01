export const mockNimantran = [
  {
    id: 'nim1',
    creatorId: 'u1', // Admin or whoever created it
    groomName: 'Rahul',
    brideName: 'Priya',
    familyName: 'Shri Mohanlal Sharma',
    date: '2027-02-15', // Format YYYY-MM-DD
    timeFood: '12:30 PM',
    timeBaraat: '07:00 PM',
    timePhere: '10:30 PM',
    location: 'Shriram Garden, Aerodrome Road, Indore, MP',
    mapLink: 'https://maps.google.com',
    contact: '9999999999',
    message: 'आप सादर आमंत्रित हैं।',
    status: 'Pending', // Pending, Approved, Rejected
    image: null,
    rsvps: [
      { memberId: 'm1', status: 'attending' },
      { memberId: 'm2', status: 'attending_family' },
    ]
  },
  {
    id: 'nim2',
    creatorId: 'm2',
    groomName: 'Ankit',
    brideName: 'Neha',
    familyName: 'Shri Verma Ji',
    date: '2027-02-21',
    timeFood: '01:00 PM',
    timeBaraat: '06:00 PM',
    timePhere: '09:00 PM',
    location: 'Ujjain, MP',
    mapLink: 'https://maps.google.com',
    contact: '9876543210',
    message: 'सभी का स्वागत है।',
    status: 'Approved',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
    rsvps: [
      { memberId: 'u1', status: 'not_attending' },
    ]
  },
  {
    id: 'nim3',
    creatorId: 'm3',
    groomName: 'Sagar',
    brideName: 'Pooja',
    familyName: 'Shri Gupta Ji',
    date: '2027-02-28',
    timeFood: '12:00 PM',
    timeBaraat: '05:00 PM',
    timePhere: '08:00 PM',
    location: 'Dewas, MP',
    mapLink: 'https://maps.google.com',
    contact: '9123456789',
    message: 'कृपया पधारें।',
    status: 'Rejected',
    image: null,
    rsvps: []
  },
  {
    id: 'nim4',
    creatorId: 'u1',
    groomName: 'Vikash',
    brideName: 'Aarti',
    familyName: 'Namdev Family',
    date: '2027-03-10',
    timeFood: '02:00 PM',
    timeBaraat: '06:00 PM',
    timePhere: '09:00 PM',
    location: 'Namdev Bhawan, Bhopal, MP',
    mapLink: 'https://maps.google.com',
    contact: '8888888888',
    message: 'आप सपरिवार आमंत्रित हैं।',
    status: 'Approved',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop',
    rsvps: [
      { memberId: 'm2', status: 'attending' }
    ]
  }
];
