import { mockFamilies } from '../pages/families/mockFamilies';

class FamilyService {
  constructor() {
    this.storageKey = 'merisamaj_v6_global_families';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        localStorage.setItem(this.storageKey, JSON.stringify(mockFamilies));
      }
    } catch (e) {
      console.error('Failed to initialize localStorage for families:', e);
    }
  }

  _getRawFamilies() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [...mockFamilies];
    } catch (e) {
      return [...mockFamilies];
    }
  }

  _saveRawFamilies(families) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(families));
    } catch (e) {
      console.error('Failed to save families to localStorage:', e);
    }
  }

  async getFamilies(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 600));
    let list = this._getRawFamilies();

    // Exclude soft deleted unless specified
    list = list.filter(f => f.status !== 'Soft Deleted');

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(f => 
        f.id.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.community.toLowerCase().includes(q) ||
        f.headName.toLowerCase().includes(q) ||
        f.headPhone.includes(q) ||
        f.members.some(m => m.name.toLowerCase().includes(q) || (m.phone && m.phone.includes(q)))
      );
    }

    if (filters.community && filters.community !== 'All' && filters.community !== 'All Communities') {
      list = list.filter(f => f.community.toLowerCase() === filters.community.toLowerCase());
    }

    if (filters.city && filters.city !== 'All' && filters.city !== 'All Cities') {
      list = list.filter(f => f.city.toLowerCase() === filters.city.toLowerCase());
    }

    if (filters.status && filters.status !== 'All') {
      list = list.filter(f => f.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.verificationStatus && filters.verificationStatus !== 'All') {
      list = list.filter(f => f.verificationStatus.toLowerCase() === filters.verificationStatus.toLowerCase());
    }

    if (filters.minMembers) {
      list = list.filter(f => f.members.length >= Number(filters.minMembers));
    }

    // Sort options: newest | oldest | largest | updated
    if (filters.sort) {
      switch (filters.sort) {
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'largest':
          list.sort((a, b) => b.members.length - a.members.length);
          break;
        case 'updated':
          list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          break;
        default:
          break;
      }
    } else {
      // Default newest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return {
      data: list,
      totalCount: list.length
    };
  }

  async getFamilyById(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const list = this._getRawFamilies();
    const family = list.find(f => f.id === id);
    if (!family) throw new Error('Family record not found');
    return family;
  }

  async createFamily(familyData) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const list = this._getRawFamilies();
    const id = `FAM-${1000 + list.length + 1}`;
    const now = new Date().toISOString();
    
    const newFamily = {
      id,
      status: 'Active',
      verificationStatus: 'Pending',
      createdAt: now,
      updatedAt: now,
      documents: [],
      donationHistory: [],
      communityActivity: [],
      auditHistory: [{
        date: now,
        action: 'Family Created',
        operator: 'Master Admin',
        details: `Family registered directly by Master Admin. Assigned ID: ${id}`
      }],
      ...familyData,
      members: (familyData.members || []).map((m, i) => ({
        ...m,
        id: m.id || `${id}-m${i+1}`,
        initials: m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      }))
    };

    // Auto set head if not specified
    if (!newFamily.headId && newFamily.members.length > 0) {
      const selfMember = newFamily.members.find(m => m.relation === 'Self') || newFamily.members[0];
      newFamily.headId = selfMember.id;
      newFamily.headName = selfMember.name;
      newFamily.headPhone = selfMember.phone || '';
    }

    list.push(newFamily);
    this._saveRawFamilies(list);
    return newFamily;
  }

  async updateFamily(id, updatedFields) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const list = this._getRawFamilies();
    const index = list.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Family not found');

    const now = new Date().toISOString();
    const existing = list[index];

    const updated = {
      ...existing,
      ...updatedFields,
      updatedAt: now,
      auditHistory: [
        {
          date: now,
          action: 'Family Updated',
          operator: 'Master Admin',
          details: 'Family profile records updated'
        },
        ...(existing.auditHistory || [])
      ]
    };

    list[index] = updated;
    this._saveRawFamilies(list);
    return updated;
  }

  async changeStatus(id, newStatus) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const list = this._getRawFamilies();
    const index = list.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Family not found');

    const now = new Date().toISOString();
    const existing = list[index];
    const oldStatus = existing.status;

    existing.status = newStatus;
    existing.updatedAt = now;
    existing.auditHistory = [
      {
        date: now,
        action: `Status Changed (${newStatus})`,
        operator: 'Master Admin',
        details: `Family status modified from '${oldStatus}' to '${newStatus}'`
      },
      ...(existing.auditHistory || [])
    ];

    this._saveRawFamilies(list);
    return existing;
  }

  async verifyFamily(id, isApproved = true) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const list = this._getRawFamilies();
    const index = list.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Family not found');

    const now = new Date().toISOString();
    const existing = list[index];
    const newStatus = isApproved ? 'Verified' : 'Rejected';

    existing.verificationStatus = newStatus;
    existing.updatedAt = now;

    if (isApproved && existing.documents) {
      existing.documents = existing.documents.map(d => ({ ...d, status: 'Approved' }));
    }

    existing.auditHistory = [
      {
        date: now,
        action: `Verification ${newStatus}`,
        operator: 'Master Admin',
        details: `Family verification status set to ${newStatus}`
      },
      ...(existing.auditHistory || [])
    ];

    this._saveRawFamilies(list);
    return existing;
  }

  async softDeleteFamily(id) {
    return this.changeStatus(id, 'Soft Deleted');
  }

  async changeHead(familyId, newHeadId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const list = this._getRawFamilies();
    const index = list.findIndex(f => f.id === familyId);
    if (index === -1) throw new Error('Family not found');

    const now = new Date().toISOString();
    const existing = list[index];
    const oldHeadName = existing.headName;
    const newHeadMember = existing.members.find(m => m.id === newHeadId);
    if (!newHeadMember) throw new Error('Member not found in family');

    existing.headId = newHeadId;
    existing.headName = newHeadMember.name;
    existing.headPhone = newHeadMember.phone || '';
    existing.updatedAt = now;

    // Adjust relations if needed: old head can become 'Other' or spouse, and new head becomes 'Self' (or similar)
    existing.members = existing.members.map(m => {
      if (m.id === newHeadId) {
        return { ...m, relation: 'Self' };
      }
      if (m.relation === 'Self') {
        return { ...m, relation: 'Family Member' }; // Reset previous head relation
      }
      return m;
    });

    existing.auditHistory = [
      {
        date: now,
        action: 'Head of Family Changed',
        operator: 'Master Admin',
        details: `Head changed from '${oldHeadName}' to '${newHeadMember.name}'`
      },
      ...(existing.auditHistory || [])
    ];

    this._saveRawFamilies(list);
    return existing;
  }
}

export const familyService = new FamilyService();
