import { mockProfessionals } from '../../member/data/mockProfessionals';

class ProfessionalDirectoryService {
  constructor() {
    this.storageKey = 'merisamaj_v6_professionals';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        // Build rich initial professionals list with complete attributes
        const enriched = mockProfessionals.map((p, index) => {
          let communityId = 'c2';
          if (p.id === 'p4' || p.id === 'p5') communityId = 'c1'; // Indore & Bhopal
          else if (p.id === 'p1') communityId = 'c2';
          else if (p.id === 'p2') communityId = 'c3';
          else if (p.id === 'p3') communityId = 'c4';
          else if (p.id === 'p6') communityId = 'c5';
          else if (p.id === 'p7') communityId = 'c6';

          // Assign compliance alerts and health attributes
          const documents = p.documents || [
            { id: 'doc1', type: 'GST Certificate', status: index === 2 ? 'Rejected' : 'Verified', fileName: 'GST_Registration.pdf', fileUrl: '#', notes: index === 2 ? 'Incomplete document uploaded' : 'Verified on GST Portal', expiryDate: index === 4 ? '2026-05-01' : '2028-12-31' },
            { id: 'doc2', type: 'Trade License', status: 'Verified', fileName: 'Trade_License_2026.pdf', fileUrl: '#', notes: 'Valid till 2027', expiryDate: '2027-06-30' },
            { id: 'doc3', type: 'Shop Registration', status: 'Verified', fileName: 'Shop_Establishment_Certificate.pdf', fileUrl: '#', notes: 'Verified establishment', expiryDate: '2029-01-01' }
          ];

          return {
            ...p,
            communityId,
            status: p.status || (index === 0 ? 'Featured' : index === 3 ? 'Suspended' : index === 5 ? 'Submitted' : 'Verified'), 
            ownerName: p.ownerName || (index === 0 ? 'Shri Ramesh Kumar' : index === 1 ? 'Shri Vikas Yadav' : index === 2 ? 'Shri Alok Gupta' : 'Shri Mohan Lal'),
            ownerPhoto: p.ownerPhoto || null,
            ownerEmail: p.ownerEmail || `owner${index + 1}@merisamaj.org`,
            ownerPhone: p.phone || `+91 98765 0000${index}`,
            memberId: p.memberId || `M-${10000 + index}`,
            gstNumber: p.gstNumber || `22AAAAA0000A1Z${index}`,
            panNumber: p.panNumber || `ABCDE1234${String.fromCharCode(65 + index)}`,
            businessId: p.businessId || `B-${20000 + index}`,
            experience: p.experience || `${5 + index} Years`,
            verificationBadge: p.verificationBadge || (index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze'),
            rating: p.rating || 4.5,
            views: p.views || (120 * (index + 1) + 45),
            category: p.category || 'Manufacturing',
            subcategory: p.subcategory || (p.category === 'Health' ? 'Diagnostics' : p.category === 'Construction' ? 'Civil Contractors' : 'General Trade'),
            businessHours: p.businessHours || '09:00 AM - 08:00 PM',
            website: p.website || `www.${(p.title || 'business').toLowerCase().replace(/\s+/g, '')}.com`,
            socialLinks: p.socialLinks || { facebook: '#', linkedin: '#', twitter: '#' },
            contact: p.phone || '+91 98765 43210',
            address: p.address || '101, Main Street, Vijay Nagar',
            landmark: p.landmark || 'Near Capital Tower',
            state: p.state || 'Madhya Pradesh',
            pinCode: p.pinCode || '452010',
            emergencyContact: p.emergencyContact || '+91 90000 12345',
            pipelineStage: index === 5 ? 'Document Review' : 'Final Approval',
            documents,
            gallery: p.gallery || [
              { id: 'img1', fileType: 'Photo', fileUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', fileName: 'storefront.jpg', caption: 'Business Front View', sortOrder: 1, isCoverImage: true, isFeaturedImage: true },
              { id: 'img2', fileType: 'Photo', fileUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', fileName: 'interior.jpg', caption: 'Interior Workspace', sortOrder: 2, isCoverImage: false, isFeaturedImage: false }
            ],
            complaints: p.complaints || (index === 3 ? [
              { id: 'comp1', type: 'Policy Violation', reportedBy: 'Anil Agrawal', evidence: 'Spam listing report', priority: 'High', status: 'Pending', assignedDate: '2026-07-01T10:00:00Z', notes: 'Needs immediate audit.' }
            ] : []),
            productsServices: [
              { id: 'prod1', name: 'Premium Service Consultation', price: '₹1,500', description: 'One-on-one expert business advice session', status: 'Active' },
              { id: 'prod2', name: 'Standard Implementation Suite', price: '₹12,000', description: 'Full implementation package for systems integration', status: 'Active' }
            ],
            reviews: [
              { id: 'rev1', reviewerName: 'Vijay Agrawal', rating: 5, comment: 'Excellent services and extremely professional staff!', date: '2026-06-25T14:30:00Z' },
              { id: 'rev2', reviewerName: 'Suman Agrawal', rating: 4, comment: 'Good overall experience, prompt response.', date: '2026-06-20T11:15:00Z' }
            ],
            auditLogs: p.auditLogs || [
              { id: 'log1', action: 'Listing Creation', oldValue: null, newValue: 'Draft created', performedBy: 'Ramesh Kumar', timestamp: '2026-05-10T14:00:00Z' },
              { id: 'log2', action: 'Verification Review', oldValue: 'Submitted', newValue: 'Verified', performedBy: 'Shri Mohan Lal Agrawal', timestamp: '2026-05-12T11:00:00Z' }
            ],
            isDeleted: false,
            createdAt: p.createdAt || new Date(Date.now() - 1000 * 60 * 60 * 24 * (30 - index)).toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString()
          };
        });
        localStorage.setItem(this.storageKey, JSON.stringify(enriched));
      }
    } catch (e) {
      console.error('Failed to initialize professional store:', e);
    }
  }

  _getRawProfessionals() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  _saveRawProfessionals(professionals) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(professionals));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to save professionals to storage:', e);
    }
  }

  async getProfessionals(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 150));
    let list = this._getRawProfessionals();

    if (!filters.includeDeleted) {
      list = list.filter(p => !p.isDeleted);
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        (p.ownerName && p.ownerName.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.ownerEmail && p.ownerEmail.toLowerCase().includes(q)) ||
        (p.gstNumber && p.gstNumber.toLowerCase().includes(q)) ||
        (p.panNumber && p.panNumber.toLowerCase().includes(q)) ||
        (p.businessId && p.businessId.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (filters.community && filters.community !== 'All' && filters.community !== 'All Communities') {
      list = list.filter(p => p.communityId === filters.community);
    }
    if (filters.city && filters.city !== 'All' && filters.city !== 'All Cities') {
      list = list.filter(p => p.city.toLowerCase() === filters.city.toLowerCase());
    }
    if (filters.category && filters.category !== 'All' && filters.category !== 'All Categories') {
      list = list.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.subcategory && filters.subcategory !== 'All') {
      list = list.filter(p => p.subcategory.toLowerCase() === filters.subcategory.toLowerCase());
    }
    if (filters.verificationStatus && filters.verificationStatus !== 'All') {
      list = list.filter(p => p.verificationBadge === filters.verificationStatus);
    }
    if (filters.listingStatus && filters.listingStatus !== 'All') {
      list = list.filter(p => p.status === filters.listingStatus);
    }
    if (filters.featuredStatus && filters.featuredStatus !== 'All') {
      const isFeatured = filters.featuredStatus === 'Featured';
      list = list.filter(p => (p.status === 'Featured') === isFeatured);
    }
    if (filters.experience && filters.experience !== 'All') {
      list = list.filter(p => {
        const yrs = parseInt(p.experience) || 0;
        if (filters.experience === 'junior') return yrs < 5;
        if (filters.experience === 'senior') return yrs >= 5 && yrs <= 10;
        if (filters.experience === 'expert') return yrs > 10;
        return true;
      });
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'rating':
          list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'name':
          list.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'updated':
          list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          break;
        default:
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return {
      data: list,
      totalCount: list.length
    };
  }

  async getProfessionalById(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const list = this._getRawProfessionals();
    const item = list.find(p => p.id === id);
    if (!item) throw new Error('Professional listing not found');
    return item;
  }

  async updateProfessional(id, fields) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = this._getRawProfessionals();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Professional listing not found');

    const existing = list[index];
    const now = new Date().toISOString();

    const changes = Object.keys(fields)
      .map(k => `${k}: ${JSON.stringify(existing[k])} -> ${JSON.stringify(fields[k])}`)
      .join(', ');

    const auditLog = {
      id: `log-${Date.now()}`,
      action: 'Listing Update',
      oldValue: `Fields: ${Object.keys(fields).join(', ')}`,
      newValue: changes,
      performedBy: 'Master Admin',
      timestamp: now
    };

    const updated = {
      ...existing,
      ...fields,
      updatedAt: now,
      auditLogs: [auditLog, ...(existing.auditLogs || [])]
    };

    list[index] = updated;
    this._saveRawProfessionals(list);
    return updated;
  }

  async changeStatus(id, newStatus, reason = '') {
    return this.updateProfessional(id, { 
      status: newStatus,
      statusNotes: reason
    });
  }

  async softDeleteProfessional(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = this._getRawProfessionals();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Professional listing not found');

    const existing = list[index];
    const now = new Date().toISOString();

    const auditLog = {
      id: `log-${Date.now()}`,
      action: 'Listing Soft Delete',
      oldValue: existing.status,
      newValue: 'isDeleted = true',
      performedBy: 'Master Admin',
      timestamp: now
    };

    existing.isDeleted = true;
    existing.status = 'Deleted';
    existing.updatedAt = now;
    existing.auditLogs = [auditLog, ...(existing.auditLogs || [])];

    this._saveRawProfessionals(list);
    return existing;
  }

  async restoreProfessional(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = this._getRawProfessionals();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Professional listing not found');

    const existing = list[index];
    const now = new Date().toISOString();

    const auditLog = {
      id: `log-${Date.now()}`,
      action: 'Listing Restoration',
      oldValue: 'isDeleted = true',
      newValue: 'Verified',
      performedBy: 'Master Admin',
      timestamp: now
    };

    existing.isDeleted = false;
    existing.status = 'Verified';
    existing.updatedAt = now;
    existing.auditLogs = [auditLog, ...(existing.auditLogs || [])];

    this._saveRawProfessionals(list);
    return existing;
  }

  async transferCommunity(id, targetCommunityId) {
    return this.updateProfessional(id, { communityId: targetCommunityId });
  }

  async transferOwner(id, targetOwnerMemberId, ownerName) {
    return this.updateProfessional(id, { 
      memberId: targetOwnerMemberId, 
      ownerName: ownerName 
    });
  }

  getUniqueFilters() {
    const list = this._getRawProfessionals().filter(p => !p.isDeleted);
    const communities = [...new Set(list.map(p => p.communityId))].sort();
    const cities = [...new Set(list.map(p => p.city))].sort();
    const categories = [...new Set(list.map(p => p.category))].sort();
    return { communities, cities, categories };
  }
}

export const professionalDirectoryService = new ProfessionalDirectoryService();
export default professionalDirectoryService;
