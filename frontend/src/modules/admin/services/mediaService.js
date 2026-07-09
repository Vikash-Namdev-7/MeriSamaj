// Media Manager Service

const initialMedia = [
  {
    id: 'm-1',
    name: 'hero_main_banner.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=60',
    folder: 'Banners',
    tags: ['Hero', 'Homepage', '2026'],
    size: '428 KB',
    uploadedAt: '2026-07-01T12:00:00Z'
  },
  {
    id: 'm-2',
    name: 'youth_festival_promo.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=60',
    folder: 'Events',
    tags: ['Youth', 'Festival', 'Indore'],
    size: '312 KB',
    uploadedAt: '2026-07-05T09:30:00Z'
  },
  {
    id: 'm-3',
    name: 'official_privacy_policy.pdf',
    type: 'document',
    url: '#',
    folder: 'Documents',
    tags: ['Legal', 'Privacy', 'Compliance'],
    size: '1.2 MB',
    uploadedAt: '2026-07-06T15:30:00Z'
  },
  {
    id: 'm-4',
    name: 'verified_icon_violet.svg',
    type: 'icon',
    url: 'https://img.icons8.com/color/48/verified-badge.png',
    folder: 'Icons',
    tags: ['Badge', 'Verified', 'UI'],
    size: '12 KB',
    uploadedAt: '2026-06-15T11:00:00Z'
  },
  {
    id: 'm-5',
    name: 'matrimony_welcome_banner.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=60',
    folder: 'Banners',
    tags: ['Matrimony', 'Promo', 'Upgrade'],
    size: '512 KB',
    uploadedAt: '2026-06-01T10:00:00Z'
  }
];

class MediaService {
  constructor() {
    this.mediaItems = [...initialMedia];
    this.folders = ['Banners', 'Events', 'Documents', 'Icons', 'Uncategorized'];
  }

  async getMediaItems() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mediaItems];
  }

  async getFolders() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.folders];
  }

  async uploadFile(fileMock) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate longer upload delay
    const newMedia = {
      id: `m-${Date.now()}`,
      name: fileMock.name || 'uploaded_file.jpg',
      type: fileMock.type || 'image',
      url: fileMock.url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
      folder: fileMock.folder || 'Uncategorized',
      tags: fileMock.tags || [],
      size: fileMock.size || '120 KB',
      uploadedAt: new Date().toISOString()
    };
    this.mediaItems.unshift(newMedia);
    return newMedia;
  }

  async deleteFile(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.mediaItems.findIndex(m => m.id === id);
    if (index === -1) throw new Error('File not found');
    const deleted = this.mediaItems[index];
    this.mediaItems.splice(index, 1);
    return deleted;
  }

  async createFolder(name) {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (this.folders.includes(name)) throw new Error('Folder already exists');
    this.folders.push(name);
    return name;
  }
}

export const mediaService = new MediaService();
