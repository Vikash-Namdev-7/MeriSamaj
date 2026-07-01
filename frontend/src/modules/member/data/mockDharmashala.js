export const mockDharamshalas = [
  {
    id: 'dh1',
    name: 'Shri Ram Dharmashala',
    location: 'Railway Road, Indore, M.P.',
    totalRooms: 25,
    acRooms: 10,
    generalRooms: 15,
    hasAcRooms: true,
    hasFoodFacility: false,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'dh2',
    name: 'Shri Krishna Dharmashala',
    location: 'Vijay Nagar, Indore, M.P.',
    totalRooms: 30,
    acRooms: 12,
    generalRooms: 18,
    hasAcRooms: true,
    hasFoodFacility: true,
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'dh3',
    name: 'Shri Shyam Dharmashala',
    location: 'Chhoti Gwaltoli, Indore, M.P.',
    totalRooms: 20,
    acRooms: 8,
    generalRooms: 12,
    hasAcRooms: true,
    hasFoodFacility: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'dh4',
    name: 'Shri Mahakal Dharmashala',
    location: 'Near Mahakal Temple, Ujjain, M.P.',
    totalRooms: 15,
    acRooms: 5,
    generalRooms: 10,
    hasAcRooms: true,
    hasFoodFacility: true,
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop'
  },
  {
    id: 'dh5',
    name: 'Lakeview Dharmashala',
    location: 'VIP Road, Bhopal, M.P.',
    totalRooms: 18,
    acRooms: 0,
    generalRooms: 18,
    hasAcRooms: false,
    hasFoodFacility: true,
    image: 'https://images.unsplash.com/photo-1582719478250-c8940026e95c?w=600&h=400&fit=crop'
  }
];

export const mockBookings = [
  {
    id: 'DH20240615001',
    dharmashalaId: 'dh1',
    dharmashalaName: 'Shri Ram Dharmashala',
    location: 'Railway Road, Indore, M.P.',
    status: 'upcoming',
    checkIn: '2024-06-15',
    checkOut: '2024-06-17',
    nights: 2,
    totalAmount: 2500,
    bookedBy: 'Rahul Sharma',
    phone: '9876543210'
  },
  {
    id: 'DH20240510005',
    dharmashalaId: 'dh2',
    dharmashalaName: 'Shri Krishna Dharmashala',
    location: 'Vijay Nagar, Indore, M.P.',
    status: 'completed',
    checkIn: '2024-05-10',
    checkOut: '2024-05-12',
    nights: 2,
    totalAmount: 1800,
    bookedBy: 'Manish Jain',
    phone: '9822XXXX10'
  },
  {
    id: 'DH20240420002',
    dharmashalaId: 'dh3',
    dharmashalaName: 'Shri Shyam Dharmashala',
    location: 'Chhoti Gwaltoli, Indore',
    status: 'cancelled',
    checkIn: '2024-04-20',
    checkOut: '2024-04-21',
    nights: 1,
    totalAmount: 1200,
    bookedBy: 'Kishore Agrawal',
    phone: '9755XXXX88'
  }
];
