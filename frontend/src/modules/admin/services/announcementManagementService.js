// Announcement Management Service
import { communicationAuditService } from './communicationAuditService';

const STORAGE_KEY = 'merisamaj_v6_announcements';

const seedAnnouncements = [
  {
    id: 'a-1',
    title: 'New Executive Committee Election Results',
    subtitle: 'Official updates for term 2026-2028',
    content: '<p>We are pleased to announce the successful election of our new Executive Committee for the term 2026-2028. Thanks to everyone who participated in the polling process.</p>',
    shortDescription: 'Announcing the results of the Executive Committee election for the term 2026-2028.',
    category: 'Platform Announcements',
    priority: 'High',
    status: 'Published',
    startDate: '2026-07-01',
    endDate: '2026-08-01',
    themeColor: '#8B5CF6',
    ctaButton: 'View Full Committee',
    ctaUrl: 'https://merisamaj.com/committee',
    targetType: 'Platform', // Platform, City, Community, Community Heads, Members, Custom
    targetAudience: 'All Platform Members',
    community: 'Agrawal Samaj',
    city: 'All Cities',
    banner: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60',
    tags: ['election', 'committee', 'announcement'],
    reach: 12500,
    deliveryRate: 98.4,
    readRate: 72.1,
    clickRate: 34.5,
    engagementRate: 53.3,
    avgReadTime: 45, // in seconds
    isPinned: true,
    createdBy: 'Vikash Namdev',
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-07-01T08:05:00Z',
    versions: [
      { version: 1, title: 'New Executive Committee Election Results', content: '<p>We are pleased to announce the successful election of our new Executive Committee for the term 2026-2028. Thanks to everyone who participated in the polling process.</p>', updatedAt: '2026-07-01T08:00:00Z' }
    ]
  },
  {
    id: 'a-2',
    title: 'Scheduled System Maintenance: July 15',
    subtitle: 'System downtime and updates',
    content: '<p>The MeriSamaj platform will undergo a scheduled maintenance window on July 15th, 2026, from 02:00 AM to 05:00 AM IST. Some services may be temporarily unavailable.</p>',
    shortDescription: 'System maintenance on July 15, 2026 from 02:00 AM to 05:00 AM IST.',
    category: 'System Maintenance Notices',
    priority: 'Medium',
    status: 'Scheduled',
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    scheduleTime: '2026-07-14T18:00:00Z',
    themeColor: '#3B82F6',
    ctaButton: 'Status Page',
    ctaUrl: 'https://status.merisamaj.com',
    targetType: 'Members',
    targetAudience: 'All Platform Members',
    community: 'Platform Global',
    city: 'All Cities',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
    tags: ['maintenance', 'system', 'downtime'],
    reach: 15400,
    deliveryRate: 100.0,
    readRate: 0,
    clickRate: 0,
    engagementRate: 0,
    avgReadTime: 0,
    isPinned: false,
    createdBy: 'Vikash Namdev',
    createdAt: '2026-07-07T14:00:00Z',
    updatedAt: '2026-07-07T14:00:00Z',
    versions: [
      { version: 1, title: 'Scheduled System Maintenance: July 15', content: '<p>The MeriSamaj platform will undergo a scheduled maintenance window on July 15th, 2026, from 02:00 AM to 05:00 AM IST. Some services may be temporarily unavailable.</p>', updatedAt: '2026-07-07T14:00:00Z' }
    ]
  },
  {
    id: 'a-3',
    title: 'Indore Samaj Bhavan Inauguration Ceremony',
    subtitle: 'A new home for our community programs',
    content: '<p>A state-of-the-art community center has been inaugurated in Indore to serve local families. The center offers conference rooms, library, and banquet facilities. You are cordially invited to the ribbon cutting and prayers.</p>',
    shortDescription: 'Inauguration of a new state-of-the-art community center in Indore.',
    category: 'City Announcements',
    priority: 'High',
    status: 'Published',
    startDate: '2026-06-20',
    endDate: '2026-08-20',
    themeColor: '#EC4899',
    ctaButton: 'Register RSVP',
    ctaUrl: 'https://merisamaj.com/rsvp/indore-bhavan',
    targetType: 'Cities',
    targetAudience: 'Indore Members',
    community: 'All Communities',
    city: 'Indore',
    banner: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60',
    tags: ['inauguration', 'indore', 'bhavan'],
    reach: 4800,
    deliveryRate: 97.2,
    readRate: 85.3,
    clickRate: 46.8,
    engagementRate: 66.2,
    avgReadTime: 82,
    isPinned: false,
    createdBy: 'Pt. Ramesh Chand',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z',
    versions: [
      { version: 1, title: 'Indore Samaj Bhavan Inauguration Ceremony', content: '<p>A state-of-the-art community center has been inaugurated in Indore to serve local families. The center offers conference rooms, library, and banquet facilities. You are cordially invited to the ribbon cutting and prayers.</p>', updatedAt: '2026-06-20T10:00:00Z' }
    ]
  },
  {
    id: 'a-4',
    title: 'Emergency Flood Relief Fund Support',
    subtitle: 'Urgent call for contribution and safety guidelines',
    content: '<p>Due to heavy floods in regional sub-divisions, we request all community members to remain safe and participate in our relief drive. Supplies and medical kits are being organized immediately.</p>',
    shortDescription: 'Urgent emergency flood relief contribution call and regional safety guidelines.',
    category: 'Emergency Alerts',
    priority: 'Critical',
    status: 'Published',
    startDate: '2026-07-09',
    endDate: '2026-07-16',
    themeColor: '#EF4444',
    ctaButton: 'Contribute Now',
    ctaUrl: 'https://merisamaj.com/donations/flood-relief',
    targetType: 'Platform',
    targetAudience: 'All Members & Donors',
    community: 'Platform Global',
    city: 'All Cities',
    banner: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=60',
    tags: ['emergency', 'flood', 'relief'],
    reach: 18500,
    deliveryRate: 99.8,
    readRate: 94.2,
    clickRate: 68.7,
    engagementRate: 81.5,
    avgReadTime: 120,
    isPinned: true,
    createdBy: 'Vikash Namdev',
    createdAt: '2026-07-09T05:00:00Z',
    updatedAt: '2026-07-09T05:00:00Z',
    versions: [
      { version: 1, title: 'Emergency Flood Relief Fund Support', content: '<p>Due to heavy floods in regional sub-divisions, we request all community members to remain safe and participate in our relief drive. Supplies and medical kits are being organized immediately.</p>', updatedAt: '2026-07-09T05:00:00Z' }
    ]
  },
  {
    id: 'a-5',
    title: 'Annual Shravan Teej Festival Celebration',
    subtitle: 'Cultural programs, swings & food stalls',
    content: '<p>Celebrate the Shravan Teej Festival with your family. Join us for traditional folk music, swings, and delicious food stalls. Traditional attire is highly encouraged!</p>',
    shortDescription: 'Shravan Teej Festival cultural programs, swings, and food stalls.',
    category: 'Festival Greetings',
    priority: 'Low',
    status: 'Draft',
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    themeColor: '#10B981',
    ctaButton: 'View Event Details',
    ctaUrl: 'https://merisamaj.com/events/teej-2026',
    targetType: 'Community',
    targetAudience: 'Agrawal & Maheshwari Communities',
    community: 'Agrawal Samaj',
    city: 'Jaipur',
    banner: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=800&auto=format&fit=crop&q=60',
    tags: ['festival', 'teej', 'cultural'],
    reach: 6000,
    deliveryRate: 0,
    readRate: 0,
    clickRate: 0,
    engagementRate: 0,
    avgReadTime: 0,
    isPinned: false,
    createdBy: 'Vikash Namdev',
    createdAt: '2026-07-09T06:30:00Z',
    updatedAt: '2026-07-09T06:30:00Z',
    versions: [
      { version: 1, title: 'Annual Shravan Teej Festival Celebration', content: '<p>Celebrate the Shravan Teej Festival with your family. Join us for traditional folk music, swings, and delicious food stalls. Traditional attire is highly encouraged!</p>', updatedAt: '2026-07-09T06:30:00Z' }
    ]
  }
];

class AnnouncementManagementService {
  constructor() {
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAnnouncements));
      }
    } catch (e) {
      console.error('Failed to initialize announcements storage:', e);
    }
  }

  async getAllAnnouncements(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 350));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let announcements = data ? JSON.parse(data) : [];

      // Filter out hard deleted ones (we will support soft delete by filtering out)
      announcements = announcements.filter(a => !a.isDeleted);

      // Filtering logic
      if (filters.category && filters.category !== 'All') {
        announcements = announcements.filter(a => a.category === filters.category);
      }
      if (filters.priority && filters.priority !== 'All') {
        announcements = announcements.filter(a => a.priority === filters.priority);
      }
      if (filters.status && filters.status !== 'All') {
        announcements = announcements.filter(a => a.status === filters.status);
      }
      if (filters.community && filters.community !== 'All') {
        announcements = announcements.filter(a => a.community === filters.community || a.community === 'All Communities' || a.community === 'Platform Global');
      }
      if (filters.city && filters.city !== 'All') {
        announcements = announcements.filter(a => a.city === filters.city || a.city === 'All Cities');
      }
      if (filters.createdBy && filters.createdBy !== 'All') {
        announcements = announcements.filter(a => a.createdBy === filters.createdBy);
      }
      if (filters.startDate) {
        announcements = announcements.filter(a => new Date(a.startDate) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        announcements = announcements.filter(a => new Date(a.endDate) <= new Date(filters.endDate));
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        announcements = announcements.filter(a => 
          a.title.toLowerCase().includes(query) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(query)) ||
          a.content.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query) ||
          (a.tags && a.tags.some(t => t.toLowerCase().includes(query)))
        );
      }

      // Sort logic
      const sort = filters.sort || 'newest';
      announcements.sort((a, b) => {
        if (sort === 'newest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sort === 'oldest') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sort === 'reach') {
          return b.reach - a.reach;
        } else if (sort === 'readRate') {
          return b.readRate - a.readRate;
        } else if (sort === 'engagement') {
          return b.engagementRate - a.engagementRate;
        }
        return 0;
      });

      return { success: true, data: announcements };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.message, data: [] };
    }
  }

  async getAnnouncementById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const list = data ? JSON.parse(data) : [];
      const item = list.find(a => a.id === id && !a.isDeleted);
      if (!item) throw new Error('Announcement not found');
      return { success: true, data: item };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async createAnnouncement(annData, reason = 'Announcement created') {
    await new Promise(resolve => setTimeout(resolve, 400));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const list = data ? JSON.parse(data) : [];

      const newId = `a-${Date.now()}`;
      const newAnn = {
        ...annData,
        id: newId,
        reach: annData.status === 'Published' ? Math.floor(Math.random() * 10000 + 1000) : 0,
        deliveryRate: annData.status === 'Published' ? parseFloat((Math.random() * 5 + 95).toFixed(1)) : 0,
        readRate: annData.status === 'Published' ? parseFloat((Math.random() * 40 + 50).toFixed(1)) : 0,
        clickRate: annData.status === 'Published' ? parseFloat((Math.random() * 20 + 10).toFixed(1)) : 0,
        engagementRate: annData.status === 'Published' ? parseFloat((Math.random() * 30 + 40).toFixed(1)) : 0,
        avgReadTime: annData.status === 'Published' ? Math.floor(Math.random() * 90 + 30) : 0,
        createdBy: 'Vikash Namdev',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versions: [
          {
            version: 1,
            title: annData.title,
            content: annData.content,
            updatedAt: new Date().toISOString()
          }
        ]
      };

      list.push(newAnn);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // Log action
      await communicationAuditService.logAction({
        action: 'Announcement Created',
        announcementId: newId,
        announcementTitle: newAnn.title,
        prevValue: null,
        newValue: newAnn.status,
        reason,
        audience: newAnn.targetAudience,
        community: newAnn.community
      });

      return { success: true, data: newAnn };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async updateAnnouncement(id, updatedData, reason = 'Announcement details updated') {
    await new Promise(resolve => setTimeout(resolve, 400));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const list = data ? JSON.parse(data) : [];

      const index = list.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Announcement not found');

      const prevAnn = list[index];
      const nextVersion = (prevAnn.versions ? prevAnn.versions.length : 1) + 1;
      const newVersionRecord = {
        version: nextVersion,
        title: updatedData.title || prevAnn.title,
        content: updatedData.content || prevAnn.content,
        updatedAt: new Date().toISOString()
      };

      const updatedAnn = {
        ...prevAnn,
        ...updatedData,
        updatedAt: new Date().toISOString(),
        versions: [...(prevAnn.versions || []), newVersionRecord]
      };

      list[index] = updatedAnn;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // Log action
      await communicationAuditService.logAction({
        action: 'Updated',
        announcementId: id,
        announcementTitle: updatedAnn.title,
        prevValue: JSON.stringify({ title: prevAnn.title, status: prevAnn.status }),
        newValue: JSON.stringify({ title: updatedAnn.title, status: updatedAnn.status }),
        reason,
        audience: updatedAnn.targetAudience,
        community: updatedAnn.community
      });

      return { success: true, data: updatedAnn };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async duplicateAnnouncement(id, reason = 'Announcement duplicated') {
    const itemRes = await this.getAnnouncementById(id);
    if (!itemRes.success) return itemRes;

    const source = itemRes.data;
    const duplicatedData = {
      ...source,
      title: `${source.title} (Copy)`,
      status: 'Draft',
      reach: 0,
      deliveryRate: 0,
      readRate: 0,
      clickRate: 0,
      engagementRate: 0,
      avgReadTime: 0
    };
    delete duplicatedData.id;
    delete duplicatedData.createdAt;
    delete duplicatedData.updatedAt;
    delete duplicatedData.versions;

    return this.createAnnouncement(duplicatedData, reason);
  }

  async cloneCampaign(id, reason = 'Campaign cloned') {
    return this.duplicateAnnouncement(id, reason);
  }

  async archiveAnnouncement(id, reason = 'Moved to archives') {
    const itemRes = await this.getAnnouncementById(id);
    if (!itemRes.success) return itemRes;
    const item = itemRes.data;

    const res = await this.updateAnnouncement(id, { status: 'Archived' }, reason);
    if (res.success) {
      await communicationAuditService.logAction({
        action: 'Archived',
        announcementId: id,
        announcementTitle: item.title,
        prevValue: item.status,
        newValue: 'Archived',
        reason,
        audience: item.targetAudience,
        community: item.community
      });
    }
    return res;
  }

  async restoreAnnouncement(id, reason = 'Restored from archives') {
    const itemRes = await this.getAnnouncementById(id);
    if (!itemRes.success) return itemRes;
    const item = itemRes.data;

    const res = await this.updateAnnouncement(id, { status: 'Draft' }, reason);
    if (res.success) {
      await communicationAuditService.logAction({
        action: 'Restored',
        announcementId: id,
        announcementTitle: item.title,
        prevValue: item.status,
        newValue: 'Draft',
        reason,
        audience: item.targetAudience,
        community: item.community
      });
    }
    return res;
  }

  async softDeleteAnnouncement(id, reason = 'Soft deleted') {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const list = data ? JSON.parse(data) : [];

      const index = list.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Announcement not found');

      const prev = list[index];
      list[index] = {
        ...prev,
        isDeleted: true,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      await communicationAuditService.logAction({
        action: 'Deleted',
        announcementId: id,
        announcementTitle: prev.title,
        prevValue: prev.status,
        newValue: 'Soft Deleted',
        reason,
        audience: prev.targetAudience,
        community: prev.community
      });

      return { success: true, message: 'Announcement deleted successfully' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async publishAnnouncement(id, reason = 'Published instantly') {
    const itemRes = await this.getAnnouncementById(id);
    if (!itemRes.success) return itemRes;
    const item = itemRes.data;

    // Simulate metrics on publish
    const publishUpdate = {
      status: 'Published',
      reach: Math.floor(Math.random() * 8000 + 2000),
      deliveryRate: parseFloat((Math.random() * 3 + 97).toFixed(1)),
      readRate: parseFloat((Math.random() * 30 + 45).toFixed(1)),
      clickRate: parseFloat((Math.random() * 15 + 8).toFixed(1)),
      engagementRate: parseFloat((Math.random() * 20 + 35).toFixed(1)),
      avgReadTime: Math.floor(Math.random() * 60 + 20)
    };

    const res = await this.updateAnnouncement(id, publishUpdate, reason);
    if (res.success) {
      await communicationAuditService.logAction({
        action: 'Published',
        announcementId: id,
        announcementTitle: item.title,
        prevValue: item.status,
        newValue: 'Published',
        reason,
        audience: item.targetAudience,
        community: item.community
      });
    }
    return res;
  }

  async unpublishAnnouncement(id, reason = 'Reverted to draft') {
    const itemRes = await this.getAnnouncementById(id);
    if (!itemRes.success) return itemRes;
    const item = itemRes.data;

    const res = await this.updateAnnouncement(id, { status: 'Draft' }, reason);
    if (res.success) {
      await communicationAuditService.logAction({
        action: 'Unpublished',
        announcementId: id,
        announcementTitle: item.title,
        prevValue: item.status,
        newValue: 'Draft',
        reason,
        audience: item.targetAudience,
        community: item.community
      });
    }
    return res;
  }

  async scheduleAnnouncement(id, scheduleTime, reason = 'Scheduled publishing date set') {
    const itemRes = await this.getAnnouncementById(id);
    if (!itemRes.success) return itemRes;
    const item = itemRes.data;

    const res = await this.updateAnnouncement(id, { status: 'Scheduled', scheduleTime }, reason);
    if (res.success) {
      await communicationAuditService.logAction({
        action: 'Scheduled',
        announcementId: id,
        announcementTitle: item.title,
        prevValue: item.status,
        newValue: 'Scheduled',
        reason: `${reason} (Schedule: ${scheduleTime})`,
        audience: item.targetAudience,
        community: item.community
      });
    }
    return res;
  }

  async cancelSchedule(id, reason = 'Schedule cancelled') {
    const itemRes = await this.getAnnouncementById(id);
    if (!itemRes.success) return itemRes;
    const item = itemRes.data;

    const res = await this.updateAnnouncement(id, { status: 'Draft', scheduleTime: null }, reason);
    if (res.success) {
      await communicationAuditService.logAction({
        action: 'Cancelled',
        announcementId: id,
        announcementTitle: item.title,
        prevValue: item.status,
        newValue: 'Draft',
        reason,
        audience: item.targetAudience,
        community: item.community
      });
    }
    return res;
  }

  // Bulk Operations
  async bulkPublish(ids, reason = 'Bulk Publish operation') {
    let successCount = 0;
    for (const id of ids) {
      const res = await this.publishAnnouncement(id, reason);
      if (res.success) successCount++;
    }
    return { success: true, count: successCount };
  }

  async bulkArchive(ids, reason = 'Bulk Archive operation') {
    let successCount = 0;
    for (const id of ids) {
      const res = await this.archiveAnnouncement(id, reason);
      if (res.success) successCount++;
    }
    return { success: true, count: successCount };
  }

  async bulkDelete(ids, reason = 'Bulk Delete operation') {
    let successCount = 0;
    for (const id of ids) {
      const res = await this.softDeleteAnnouncement(id, reason);
      if (res.success) successCount++;
    }
    return { success: true, count: successCount };
  }

  async bulkRestore(ids, reason = 'Bulk Restore operation') {
    let successCount = 0;
    for (const id of ids) {
      const res = await this.restoreAnnouncement(id, reason);
      if (res.success) successCount++;
    }
    return { success: true, count: successCount };
  }

  async bulkSchedule(ids, scheduleTime, reason = 'Bulk Schedule operation') {
    let successCount = 0;
    for (const id of ids) {
      const res = await this.scheduleAnnouncement(id, scheduleTime, reason);
      if (res.success) successCount++;
    }
    return { success: true, count: successCount };
  }

  async bulkDuplicate(ids, reason = 'Bulk Duplicate operation') {
    let successCount = 0;
    for (const id of ids) {
      const res = await this.duplicateAnnouncement(id, reason);
      if (res.success) successCount++;
    }
    return { success: true, count: successCount };
  }

  async bulkAudienceUpdate(ids, targetAudience, reason = 'Bulk Audience Update') {
    let successCount = 0;
    for (const id of ids) {
      const res = await this.updateAnnouncement(id, { targetAudience }, reason);
      if (res.success) successCount++;
    }
    return { success: true, count: successCount };
  }

  async bulkStatusUpdate(ids, status, reason = 'Bulk Status Update') {
    let successCount = 0;
    for (const id of ids) {
      const res = await this.updateAnnouncement(id, { status }, reason);
      if (res.success) successCount++;
    }
    return { success: true, count: successCount };
  }
}

export const announcementManagementService = new AnnouncementManagementService();
