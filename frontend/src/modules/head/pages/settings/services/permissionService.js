/**
 * Service for managing Role Permissions within the community.
 */

const INITIAL_PERMISSIONS = {
  Moderator: { view: true, create: true, edit: true, delete: false, approve: true, export: false },
  Volunteer: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
  EventManager: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
  DirectoryManager: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
  MatrimonialModerator: { view: true, create: false, edit: true, delete: false, approve: true, export: false }
};

export const fetchPermissions = async (communityId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const saved = localStorage.getItem(`community_permissions_${communityId}`);
      if (saved) {
        resolve(JSON.parse(saved));
      } else {
        resolve(INITIAL_PERMISSIONS);
      }
    }, 500);
  });
};

export const updatePermissions = async (communityId, payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(`community_permissions_${communityId}`, JSON.stringify(payload));
      resolve({ success: true });
    }, 800);
  });
};
