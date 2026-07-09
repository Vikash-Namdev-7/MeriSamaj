export const calculateProfileCompletion = (profileData) => {
  if (!profileData) return 0;
  
  const weights = {
    avatar: 10,
    firstName: 10,
    lastName: 10,
    email: 10,
    phone: 10,
    gender: 5,
    dob: 5,
    bloodGroup: 5,
    address: 10,
    emergencyContact: 10,
    twoFactorEnabled: 15
  };

  let score = 0;
  let totalWeights = 0;

  for (const [key, weight] of Object.entries(weights)) {
    totalWeights += weight;
    // Check if the value exists and is not an empty string or null
    if (profileData[key] !== undefined && profileData[key] !== null && profileData[key] !== '') {
      score += weight;
    }
  }

  return Math.round((score / totalWeights) * 100);
};

export const getMissingFields = (profileData) => {
  if (!profileData) return [];
  const requiredFields = ['avatar', 'firstName', 'lastName', 'email', 'phone', 'address', 'emergencyContact'];
  return requiredFields.filter(field => !profileData[field]);
};
