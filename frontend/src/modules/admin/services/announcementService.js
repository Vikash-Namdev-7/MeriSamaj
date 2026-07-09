// Announcement Management Service

const initialAnnouncements = [
  {
    id: 'a-1',
    type: 'announcement',
    title: 'New Executive Committee Election Results',
    content: 'We are pleased to announce the successful election of our new Executive Committee for the term 2026-2028. Thanks to everyone who participated in the polling process.',
    status: 'Published',
    startDate: '2026-07-01',
    endDate: '2026-08-01',
    isPinned: true,
    targetType: 'Platform', // Entire Platform
    targetAudience: 'All',
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-07-01T08:00:00Z'
  },
  {
    id: 'a-2',
    type: 'notice',
    title: 'Scheduled System Maintenance: July 15',
    content: 'The MeriSamaj platform will undergo a scheduled maintenance window on July 15th, 2026, from 02:00 AM to 05:00 AM IST. Some services may be temporarily unavailable.',
    status: 'Scheduled',
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    isPinned: false,
    targetType: 'Members',
    targetAudience: 'Members',
    createdAt: '2026-07-07T14:00:00Z',
    updatedAt: '2026-07-07T14:00:00Z'
  },
  {
    id: 'a-3',
    type: 'news',
    title: 'MeriSamaj Indore Community Center Inauguration',
    content: 'A state-of-the-art community center has been inaugurated in Indore to serve local families. The center offers conference rooms, library, and banquet facilities.',
    status: 'Published',
    startDate: '2026-06-20',
    endDate: '2026-12-20',
    isPinned: false,
    targetType: 'Cities',
    targetAudience: 'Selected Cities (Indore)',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z'
  }
];

class AnnouncementService {
  constructor() {
    this.announcements = [...initialAnnouncements];
  }

  async getAllAnnouncements() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.announcements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  async createAnnouncement(annData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newAnn = {
      ...annData,
      id: `a-${Date.now()}`,
      isPinned: !!annData.isPinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.announcements.push(newAnn);
    return newAnn;
  }

  async updateAnnouncement(id, updatedData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = this.announcements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Announcement not found');
    
    this.announcements[index] = {
      ...this.announcements[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    return this.announcements[index];
  }

  async deleteAnnouncement(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.announcements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Announcement not found');
    const deleted = this.announcements[index];
    this.announcements.splice(index, 1);
    return deleted;
  }

  async togglePin(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.announcements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Announcement not found');
    
    this.announcements[index].isPinned = !this.announcements[index].isPinned;
    this.announcements[index].updatedAt = new Date().toISOString();
    return this.announcements[index];
  }
}

export const announcementService = new AnnouncementService();
