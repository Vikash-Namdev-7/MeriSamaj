/**
 * announcementService.js
 * API service for Announcement Channels.
 * All verified community members auto-subscribed — no join/leave needed.
 */
import { axiosPrivate } from './axiosPrivate';

const BASE = '/member/announcements';

export const announcementService = {
  // ─── Channel Management ──────────────────────────────────────────────────────
  /** Create a channel (Head only) */
  createChannel: (formData) =>
    axiosPrivate.post(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /** Get all channels in community (auto-visible) */
  getChannels: () =>
    axiosPrivate.get(BASE),

  /** Get channel detail */
  getChannelById: (channelId) =>
    axiosPrivate.get(`${BASE}/${channelId}`),

  /** Update channel (Head only) */
  updateChannel: (channelId, formData) =>
    axiosPrivate.patch(`${BASE}/${channelId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /** Delete channel (Head only) */
  deleteChannel: (channelId) =>
    axiosPrivate.delete(`${BASE}/${channelId}`),

  /** Archive / unarchive channel (Head only) */
  archiveChannel: (channelId) =>
    axiosPrivate.patch(`${BASE}/${channelId}/archive`),

  // ─── Announcements ───────────────────────────────────────────────────────────
  /** Post a new announcement (text or image) */
  postAnnouncement: (channelId, data) =>
    axiosPrivate.post(`${BASE}/${channelId}/messages`, data),

  /** Post image announcement (multipart) */
  postImageAnnouncement: (channelId, formData) =>
    axiosPrivate.post(`${BASE}/${channelId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /** Get paginated announcements in channel */
  getAnnouncements: (channelId, params = {}) =>
    axiosPrivate.get(`${BASE}/${channelId}/messages`, { params }),

  /** Pin an announcement (Head only) */
  pinAnnouncement: (messageId) =>
    axiosPrivate.patch(`${BASE}/messages/${messageId}/pin`),

  /** Delete an announcement */
  deleteAnnouncement: (messageId) =>
    axiosPrivate.delete(`${BASE}/messages/${messageId}`)
};
