const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const updatePassword = async (currentPassword, newPassword) => {
  await delay(1000);
  return { success: true, message: 'Password updated successfully' };
};

export const toggleTwoFactorAuth = async (enabled, method = 'email') => {
  await delay(800);
  return { success: true, enabled, method };
};

export const getActiveSessions = async () => {
  await delay(600);
  return [
    { id: '1', device: 'MacBook Pro', browser: 'Chrome', os: 'macOS', ip: '192.168.1.10', location: 'Jaipur, India', time: new Date().toISOString(), isCurrent: true },
    { id: '2', device: 'iPhone 13', browser: 'Safari', os: 'iOS', ip: '192.168.1.12', location: 'Jaipur, India', time: new Date(Date.now() - 86400000).toISOString(), isCurrent: false }
  ];
};

export const logoutSession = async (sessionId) => {
  await delay(500);
  return { success: true, message: 'Session terminated' };
};

export const getAuditLogs = async () => {
  await delay(700);
  return [
    { id: '1', action: 'Profile Updated', description: 'Updated address and phone number', timestamp: new Date().toISOString(), device: 'MacBook Pro', status: 'success', icon: 'User' },
    { id: '2', action: 'Password Changed', description: 'User changed their password', timestamp: new Date(Date.now() - 172800000).toISOString(), device: 'MacBook Pro', status: 'success', icon: 'Lock' },
    { id: '3', action: 'Failed Login', description: 'Incorrect password attempt', timestamp: new Date(Date.now() - 259200000).toISOString(), device: 'Unknown Device', status: 'failed', icon: 'ShieldAlert' }
  ];
};
