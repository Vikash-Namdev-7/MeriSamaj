/**
 * Utility functions for validating community settings data.
 */

export const validateEmail = (email) => {
  if (!email) return true; // Optional field
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  if (!phone) return true;
  const re = /^\+?[\d\s-]{10,15}$/;
  return re.test(String(phone));
};

export const validateUrl = (url) => {
  if (!url) return true;
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch (_) {
    return false;
  }
};

export const validateImageSize = (file, maxSizeMB = 5) => {
  if (!file) return true;
  const sizeInMB = file.size / (1024 * 1024);
  return sizeInMB <= maxSizeMB;
};

export const validateImageType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']) => {
  if (!file) return true;
  return allowedTypes.includes(file.type);
};

export const validateSettingsObject = (settings) => {
  const errors = {};
  
  if (!settings.general?.name?.trim()) {
    errors.name = 'Community name is required.';
  }
  
  if (settings.general?.email && !validateEmail(settings.general.email)) {
    errors.email = 'Invalid email address.';
  }

  if (settings.general?.phone && !validatePhone(settings.general.phone)) {
    errors.phone = 'Invalid phone number format.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
