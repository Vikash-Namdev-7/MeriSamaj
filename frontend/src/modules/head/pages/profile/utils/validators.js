export const calculatePasswordStrength = (password) => {
  let score = 0;
  if (!password) return { score: 0, label: 'Weak', color: 'bg-red-500' };

  if (password.length > 8) score += 1;
  if (password.length > 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score < 3) return { score: (score / 6) * 100, label: 'Weak', color: 'bg-red-500' };
  if (score < 5) return { score: (score / 6) * 100, label: 'Good', color: 'bg-yellow-500' };
  return { score: (score / 6) * 100, label: 'Strong', color: 'bg-green-500' };
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return /^\+?[\d\s-]{10,}$/.test(phone);
};
