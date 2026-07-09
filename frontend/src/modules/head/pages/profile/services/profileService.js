// MOCK SERVICE FOR FUTURE API INTEGRATION
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getHeadProfile = async () => {
  await delay(800);
  return {
    firstName: 'Mohan',
    lastName: 'Lal',
    email: 'mohan.lal@merisamaj.com',
    phone: '+91 98765 43210',
    gender: 'Male',
    dob: '1975-08-15',
    bloodGroup: 'B+',
    address: '123 Heritage Society',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    emergencyContact: '+91 98765 00000',
    avatar: null,
    communityId: 'CM-12345',
    communityName: 'Agrawal Samaj',
    designation: 'Adhyaksh (Head)',
    memberSince: '2023-01-10',
    accountStatus: 'Active',
    twoFactorEnabled: false
  };
};

export const updateHeadProfile = async (data) => {
  await delay(1000);
  return { success: true, message: 'Profile updated successfully', data };
};

export const uploadProfileAvatar = async (file) => {
  await delay(1500);
  return { success: true, url: URL.createObjectURL(file) };
};

export const getCommunityStats = async () => {
  await delay(500);
  return {
    totalMembers: 1250,
    totalEvents: 45,
    matrimonialApprovals: 120,
    professionalListings: 85,
    rating: 4.8,
    workingArea: 'Rajasthan, India'
  };
};
