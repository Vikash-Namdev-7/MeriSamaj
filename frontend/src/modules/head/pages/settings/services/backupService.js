/**
 * Service for Backups, Restores and Audit Logs.
 */

export const triggerManualBackup = async (communityId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, timestamp: new Date().toISOString(), size: '45 KB' });
    }, 2000);
  });
};

export const fetchAuditLogs = async (communityId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, action: 'Updated Registration Rules', user: 'Shri Mohan Lal', timestamp: new Date(Date.now() - 3600000).toISOString(), detail: 'Enabled Aadhaar requirement' },
        { id: 2, action: 'Changed Theme Color', user: 'Shri Mohan Lal', timestamp: new Date(Date.now() - 86400000).toISOString(), detail: 'Primary color to #7e22ce' },
        { id: 3, action: 'Exported JSON Backup', user: 'Admin System', timestamp: new Date(Date.now() - 172800000).toISOString(), detail: 'Automated weekly backup' }
      ]);
    }, 600);
  });
};

export const fetchVersionHistory = async (communityId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { version: 'v1.2', date: new Date().toISOString(), author: 'Shri Mohan Lal', active: true },
        { version: 'v1.1', date: new Date(Date.now() - 86400000 * 7).toISOString(), author: 'Admin System', active: false },
        { version: 'v1.0', date: new Date(Date.now() - 86400000 * 30).toISOString(), author: 'System Init', active: false }
      ]);
    }, 500);
  });
};
