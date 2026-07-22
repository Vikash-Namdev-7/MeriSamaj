/**
 * groupService.js
 * API service for Community Groups and Group Chat.
 */
import { axiosPrivate } from './axiosPrivate';

const BASE = '/member/groups';

export const groupService = {
  // ─── Group CRUD ─────────────────────────────────────────────────────────────
  /** Create a new group (avatar via FormData) */
  createGroup: (formData) =>
    axiosPrivate.post(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /** Get all groups in community (paginated, filterable) */
  getGroups: (params = {}) =>
    axiosPrivate.get(BASE, { params }),

  /** Get groups I'm a member of */
  getMyGroups: () =>
    axiosPrivate.get(`${BASE}/mine`),

  /** Get group detail by ID */
  getGroupById: (groupId) =>
    axiosPrivate.get(`${BASE}/${groupId}`),

  /** Update group info or avatar (accepts FormData or plain JSON) */
  updateGroup: (groupId, data) => {
    const isFormData = data instanceof FormData;
    return axiosPrivate.patch(`${BASE}/${groupId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  },

  /** Delete a group (Head only) */
  deleteGroup: (groupId) =>
    axiosPrivate.delete(`${BASE}/${groupId}`),

  // ─── Approval ───────────────────────────────────────────────────────────────
  /** Approve or reject a pending group */
  approveGroup: (groupId, action) =>
    axiosPrivate.patch(`${BASE}/${groupId}/approve`, { action }),

  // ─── Join / Leave ────────────────────────────────────────────────────────────
  joinGroup:  (groupId) => axiosPrivate.post(`${BASE}/${groupId}/join`),
  leaveGroup: (groupId) => axiosPrivate.post(`${BASE}/${groupId}/leave`),

  // ─── Member Management & Invitations ─────────────────────────────────────────
  addMember:     (groupId, userIds)      => axiosPrivate.post(`${BASE}/${groupId}/members`, { userIds }),
  removeMember:  (groupId, userId)       => axiosPrivate.delete(`${BASE}/${groupId}/members/${userId}`),
  getPendingInvitations: ()              => axiosPrivate.get(`${BASE}/invitations/pending`),
  acceptInvitation: (invitationId)       => axiosPrivate.patch(`${BASE}/invitations/${invitationId}/accept`),
  declineInvitation: (invitationId)      => axiosPrivate.patch(`${BASE}/invitations/${invitationId}/decline`),
  promoteAdmin:  (groupId, userId)       => axiosPrivate.patch(`${BASE}/${groupId}/members/${userId}/promote`),
  demoteAdmin:   (groupId, userId)       => axiosPrivate.patch(`${BASE}/${groupId}/members/${userId}/demote`),
  // ─── Join Requests ────────────────────────────────────────────────────────────
  getJoinRequests: (groupId)             => axiosPrivate.get(`${BASE}/${groupId}/requests`),
  approveJoinRequest: (groupId, reqId)   => axiosPrivate.patch(`${BASE}/${groupId}/requests/${reqId}/approve`),
  rejectJoinRequest: (groupId, reqId)    => axiosPrivate.patch(`${BASE}/${groupId}/requests/${reqId}/reject`),
  // ─── Settings ────────────────────────────────────────────────────────────────
  updateGroupSettings: (groupId, chatPermissions) =>
    axiosPrivate.patch(`${BASE}/${groupId}/settings`, { chatPermissions }),

  // ─── Group Chat ──────────────────────────────────────────────────────────────
  /** Get the conversation linked to a group */
  getGroupConversation: (groupId) =>
    axiosPrivate.get(`${BASE}/${groupId}/conversation`),

  /** Get paginated group messages */
  getGroupMessages: (conversationId, params = {}) =>
    axiosPrivate.get(`${BASE}/conversations/${conversationId}/messages`, { params }),

  /** Send text/reply message to group */
  sendGroupMessage: (conversationId, data) =>
    axiosPrivate.post(`${BASE}/conversations/${conversationId}/messages`, data),

  /** Send image to group (multipart) */
  sendGroupImageMessage: (conversationId, formData) =>
    axiosPrivate.post(`${BASE}/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /** Delete a group message */
  deleteGroupMessage: (messageId, deleteFor = 'me') =>
    axiosPrivate.delete(`${BASE}/messages/${messageId}`, {
      data: { deleteFor }
    }),

  // ─── Pin / Unpin ─────────────────────────────────────────────────────────────
  getPinnedMessages: (conversationId) =>
    axiosPrivate.get(`${BASE}/conversations/${conversationId}/pinned`),

  pinMessage:   (messageId) => axiosPrivate.patch(`${BASE}/messages/${messageId}/pin`),
  unpinMessage: (messageId) => axiosPrivate.patch(`${BASE}/messages/${messageId}/unpin`),

  /** Get group members list */
  getGroupMembers: (groupId) =>
    axiosPrivate.get(`${BASE}/${groupId}/members`),

  /** Add members (used by GroupDetailPage) */
  addGroupMembers: (groupId, userIds) =>
    axiosPrivate.post(`${BASE}/${groupId}/members`, { userIds }),

  /** Mute notifications for a group (local-only toggle, no backend endpoint yet) */
  muteGroup: async (_groupId) => { /* optimistic only */ },

  /** Mark group messages as seen */
  markGroupSeen: (conversationId, messageIds = []) =>
    axiosPrivate.post(`${BASE}/conversations/${conversationId}/seen`, { messageIds })
};
