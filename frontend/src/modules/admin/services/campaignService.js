import { donationAuditService } from './donationAuditService';

const seedCampaigns = [
  {
    id: 'CMP-101',
    name: 'Indore Samaj Bhavan Construction',
    community: 'Agrawal Samaj',
    city: 'Indore',
    type: 'Infrastructure',
    targetAmount: 15000000,
    collectedAmount: 8750000,
    remainingAmount: 6250000,
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    createdBy: 'Pt. Ramesh Chand',
    creatorRole: 'Community Head',
    description: 'Collection for the construction of a grand society building, library, and marriage hall auditorium in Indore.',
    contributorsCount: 450,
    documents: [
      { id: 'doc-101-1', title: 'Land Purchase & Title Deed', fileUrl: 'land_deed_indore.pdf', status: 'Verified', date: '2026-01-03' },
      { id: 'doc-101-2', title: 'Municipal Construction Approval', fileUrl: 'municipal_noc.pdf', status: 'Verified', date: '2026-01-10' }
    ],
    announcements: [
      { id: 'ann-101-1', title: 'Campaign Launched!', content: 'We have officially initiated the Samaj Bhavan Construction Campaign.', date: '2026-01-01' },
      { id: 'ann-101-2', title: 'Foundation Stone Laying Ceremony', content: 'The foundation stone will be laid on 15th August by community elders.', date: '2026-05-10' }
    ],
    auditHistory: [
      { id: 'aud-101-1', date: '2026-01-01T10:00:00Z', action: 'Campaign Created', operator: 'Pt. Ramesh Chand', details: 'Initialized from Indore Community Head desk.' },
      { id: 'aud-101-2', date: '2026-01-05T12:00:00Z', action: 'Documents Verified', operator: 'Master Admin', details: 'Municipal NOC and Land Deeds audited and verified.' }
    ]
  },
  {
    id: 'CMP-102',
    name: 'Mumbai Education Scholarship 2026',
    community: 'Brahmin Samaj',
    city: 'Mumbai',
    type: 'Education',
    targetAmount: 1000000,
    collectedAmount: 650500,
    remainingAmount: 349500,
    status: 'Active',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    createdBy: 'Pt. Ramendra Sharma',
    creatorRole: 'Community Head',
    description: 'Providing scholarships and higher education fee assistance to 100 meritorious students from economically weak backgrounds.',
    contributorsCount: 220,
    documents: [
      { id: 'doc-102-1', title: 'Scholarship Eligibility Criteria', fileUrl: 'criteria_guideline.pdf', status: 'Verified', date: '2026-02-28' }
    ],
    announcements: [
      { id: 'ann-102-1', title: 'Applications Now Open', content: 'Meritorious students can apply for grants from our online student portal.', date: '2026-03-05' }
    ],
    auditHistory: [
      { id: 'aud-102-1', date: '2026-03-01T09:30:00Z', action: 'Campaign Created', operator: 'Pt. Ramendra Sharma', details: 'Initialized from Mumbai Community Head desk.' }
    ]
  },
  {
    id: 'CMP-103',
    name: 'Varanasi Health Camp Organization',
    community: 'Brahmin Samaj',
    city: 'Varanasi',
    type: 'Healthcare',
    targetAmount: 500000,
    collectedAmount: 500000,
    remainingAmount: 0,
    status: 'Completed',
    startDate: '2026-04-10',
    endDate: '2026-05-15',
    createdBy: 'Pt. Harish Tripathi',
    creatorRole: 'Community Head',
    description: 'Free multi-specialty medical check-up, eye surgery, and free medicines distribution camp in Varanasi.',
    contributorsCount: 180,
    documents: [
      { id: 'doc-103-1', title: 'Doctor Approvals & Hospital Tie-up', fileUrl: 'hospital_tieup.pdf', status: 'Verified', date: '2026-04-05' }
    ],
    announcements: [
      { id: 'ann-103-1', title: 'Over 1200 Patients Served', content: 'The camp concluded successfully. 45 free cataract surgeries performed.', date: '2026-05-16' }
    ],
    auditHistory: [
      { id: 'aud-103-1', date: '2026-04-10T11:00:00Z', action: 'Campaign Created', operator: 'Pt. Harish Tripathi', details: 'Initialized from Varanasi Community Head desk.' },
      { id: 'aud-103-2', date: '2026-05-15T18:00:00Z', action: 'Campaign Closed', operator: 'Pt. Harish Tripathi', details: 'Goal reached. Campaign closed and marked Completed.' }
    ]
  },
  {
    id: 'CMP-104',
    name: 'Jaipur Poor Girls Marriage Support',
    community: 'Rajput Samaj',
    city: 'Jaipur',
    type: 'Welfare',
    targetAmount: 1200000,
    collectedAmount: 240000,
    remainingAmount: 960000,
    status: 'Suspended',
    startDate: '2026-02-15',
    endDate: '2026-11-30',
    createdBy: 'Kunwar Pratap Singh',
    creatorRole: 'Community Head',
    description: 'Providing dowry-free mass marriage support, gifts, and home setups for 25 underprivileged girls in Jaipur.',
    contributorsCount: 95,
    documents: [
      { id: 'doc-104-1', title: 'Verified Beneficiary List', fileUrl: 'beneficiary_list.pdf', status: 'Pending Verification', date: '2026-02-14' }
    ],
    announcements: [
      { id: 'ann-104-1', title: 'Mass Marriage Postponed', content: 'Due to compliance issues, the event is postponed until review.', date: '2026-05-01' }
    ],
    auditHistory: [
      { id: 'aud-104-1', date: '2026-02-15T14:00:00Z', action: 'Campaign Created', operator: 'Kunwar Pratap Singh', details: 'Initialized from Jaipur Community Head desk.' },
      { id: 'aud-104-2', date: '2026-05-02T10:00:00Z', action: 'Campaign Suspended', operator: 'Master Admin', details: 'Override Action: Suspended due to incomplete beneficiary documents.' }
    ]
  },
  {
    id: 'CMP-105',
    name: 'Emergency Flood Relief Fund 2026',
    community: 'Agrawal Samaj',
    city: 'Indore',
    type: 'Emergency',
    targetAmount: 2000000,
    collectedAmount: 2150000,
    remainingAmount: 0,
    status: 'Completed',
    startDate: '2026-05-01',
    endDate: '2026-05-30',
    createdBy: 'Master Admin',
    creatorRole: 'Master Admin',
    description: 'Direct emergency relief fund to provide dry food kits, clean drinking water, clothes, and shelters to flood affected families.',
    contributorsCount: 512,
    documents: [],
    announcements: [
      { id: 'ann-105-1', title: 'Immediate Relocation Commenced', content: 'Dry kits distributed to 850 families in affected sub-districts.', date: '2026-05-10' }
    ],
    auditHistory: [
      { id: 'aud-105-1', date: '2026-05-01T08:00:00Z', action: 'Campaign Created', operator: 'Master Admin', details: 'Urgent emergency campaign set up by Council Board.' }
    ]
  },
  {
    id: 'CMP-106',
    name: 'Pune Samaj Kitchen Upgradation',
    community: 'Maheshwari Samaj',
    city: 'Pune',
    type: 'Infrastructure',
    targetAmount: 800000,
    collectedAmount: 150000,
    remainingAmount: 650000,
    status: 'Active',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    createdBy: 'Ramesh Maheshwari',
    creatorRole: 'Community Head',
    description: 'Upgrading community kitchen facilities to commercial standards to support free meals during community festivals.',
    contributorsCount: 40,
    documents: [],
    announcements: [],
    auditHistory: [
      { id: 'aud-106-1', date: '2026-06-01T15:20:00Z', action: 'Campaign Created', operator: 'Ramesh Maheshwari', details: 'Initialized from Pune Community Head desk.' }
    ]
  },
  {
    id: 'CMP-107',
    name: 'Ancient Temple Restoration',
    community: 'Brahmin Samaj',
    city: 'Varanasi',
    type: 'Welfare',
    targetAmount: 3000000,
    collectedAmount: 450000,
    remainingAmount: 2550000,
    status: 'Archived',
    startDate: '2025-08-01',
    endDate: '2026-02-28',
    createdBy: 'Pt. Harish Tripathi',
    creatorRole: 'Community Head',
    description: 'Architectural restoration and structural strengthening of ancient community shrine in Varanasi.',
    contributorsCount: 88,
    documents: [],
    announcements: [],
    auditHistory: [
      { id: 'aud-107-1', date: '2025-08-01T10:00:00Z', action: 'Campaign Created', operator: 'Pt. Harish Tripathi', details: 'Initialized from Varanasi Community Head desk.' },
      { id: 'aud-107-2', date: '2026-03-01T09:00:00Z', action: 'Campaign Archived', operator: 'Pt. Harish Tripathi', details: 'Closed date expired. Moved to historical archives.' }
    ]
  }
];

class CampaignService {
  constructor() {
    this.storageKey = 'merisamaj_v6_donation_campaigns';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        localStorage.setItem(this.storageKey, JSON.stringify(seedCampaigns));
      }
    } catch (e) {
      console.error('Failed to initialize campaigns store:', e);
    }
  }

  _getRawCampaigns() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [...seedCampaigns];
    } catch (e) {
      return [...seedCampaigns];
    }
  }

  _saveRawCampaigns(campaigns) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(campaigns));
    } catch (e) {
      console.error('Failed to save campaigns store:', e);
    }
  }

  async getCampaigns(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let list = this._getRawCampaigns();

    // Filter soft deleted
    list = list.filter(c => c.status !== 'Soft Deleted');

    // Advanced search
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.community.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.createdBy.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filters.community && filters.community !== 'All') {
      list = list.filter(c => c.community.toLowerCase() === filters.community.toLowerCase());
    }

    if (filters.city && filters.city !== 'All') {
      list = list.filter(c => c.city.toLowerCase() === filters.city.toLowerCase());
    }

    if (filters.campaignStatus && filters.campaignStatus !== 'All') {
      list = list.filter(c => c.status.toLowerCase() === filters.campaignStatus.toLowerCase());
    }

    if (filters.campaignType && filters.campaignType !== 'All') {
      list = list.filter(c => c.type.toLowerCase() === filters.campaignType.toLowerCase());
    }

    if (filters.minAmount) {
      list = list.filter(c => c.targetAmount >= Number(filters.minAmount));
    }
    if (filters.maxAmount) {
      list = list.filter(c => c.targetAmount <= Number(filters.maxAmount));
    }

    // Sort
    if (filters.sort) {
      switch (filters.sort) {
        case 'newest':
          list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          break;
        case 'oldest':
          list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          break;
        case 'highest':
          list.sort((a, b) => b.targetAmount - a.targetAmount);
          break;
        case 'lowest':
          list.sort((a, b) => a.targetAmount - b.targetAmount);
          break;
        case 'recentlyUpdated':
          list.sort((a, b) => (b.updatedAt ? new Date(b.updatedAt) : new Date(b.startDate)) - (a.updatedAt ? new Date(a.updatedAt) : new Date(a.startDate)));
          break;
        default:
          list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      }
    } else {
      list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }

    return {
      data: list,
      totalCount: list.length
    };
  }

  async getCampaignById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = this._getRawCampaigns();
    const item = list.find(c => c.id === id);
    if (!item) throw new Error('Campaign not found');
    return item;
  }

  async createCampaign(campaignData, operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 500));
    const list = this._getRawCampaigns();
    const id = `CMP-${100 + list.length + 1}`;
    const now = new Date().toISOString();

    const newCampaign = {
      id,
      collectedAmount: 0,
      remainingAmount: Number(campaignData.targetAmount),
      status: 'Active',
      startDate: campaignData.startDate || now.split('T')[0],
      endDate: campaignData.endDate || now.split('T')[0],
      createdBy: operator,
      creatorRole: operator === 'Master Admin' ? 'Master Admin' : 'Community Head',
      contributorsCount: 0,
      documents: [],
      announcements: [],
      auditHistory: [
        {
          id: `aud-${Date.now()}-1`,
          date: now,
          action: 'Campaign Created',
          operator,
          details: `Campaign launched directly by ${operator}. Target goal ₹${campaignData.targetAmount}`
        }
      ],
      ...campaignData,
      targetAmount: Number(campaignData.targetAmount)
    };

    list.push(newCampaign);
    this._saveRawCampaigns(list);

    // Track Audit Log
    await donationAuditService.logEvent(id, 'Campaign Created', `Created campaign "${newCampaign.name}" with goal ₹${newCampaign.targetAmount}`, operator);

    return newCampaign;
  }

  async updateCampaign(id, updatedFields, operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 400));
    const list = this._getRawCampaigns();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');

    const existing = list[idx];
    const now = new Date().toISOString();

    const targetAmount = updatedFields.targetAmount !== undefined ? Number(updatedFields.targetAmount) : existing.targetAmount;
    const collectedAmount = existing.collectedAmount;
    const remainingAmount = Math.max(0, targetAmount - collectedAmount);

    const updated = {
      ...existing,
      ...updatedFields,
      targetAmount,
      remainingAmount,
      updatedAt: now,
      auditHistory: [
        {
          id: `aud-${Date.now()}`,
          date: now,
          action: 'Campaign Updated',
          operator,
          details: 'Campaign details, target goals or description updated.'
        },
        ...(existing.auditHistory || [])
      ]
    };

    list[idx] = updated;
    this._saveRawCampaigns(list);

    await donationAuditService.logEvent(id, 'Campaign Updated', `Updated details for campaign "${updated.name}"`, operator);
    return updated;
  }

  async changeCampaignStatus(id, newStatus, details = '', operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 300));
    const list = this._getRawCampaigns();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');

    const existing = list[idx];
    const oldStatus = existing.status;
    const now = new Date().toISOString();

    existing.status = newStatus;
    existing.updatedAt = now;
    existing.auditHistory = [
      {
        id: `aud-${Date.now()}`,
        date: now,
        action: `Campaign ${newStatus}`,
        operator,
        details: details || `Campaign status changed from '${oldStatus}' to '${newStatus}' by ${operator}.`
      },
      ...(existing.auditHistory || [])
    ];

    this._saveRawCampaigns(list);

    await donationAuditService.logEvent(id, `Campaign ${newStatus}`, `Status set to ${newStatus}. Details: ${details}`, operator);
    return existing;
  }

  async overrideDecision(id, approved = true, notes = '', operator = 'Master Admin') {
    const nextStatus = approved ? 'Active' : 'Suspended';
    const detailText = `Override Action: Master Admin forced campaign status to '${nextStatus}'. Notes: ${notes}`;
    return this.changeCampaignStatus(id, nextStatus, detailText, operator);
  }

  async softDeleteCampaign(id, operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = this._getRawCampaigns();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');

    const existing = list[idx];
    const now = new Date().toISOString();

    existing.status = 'Soft Deleted';
    existing.updatedAt = now;
    existing.auditHistory = [
      {
        id: `aud-${Date.now()}`,
        date: now,
        action: 'Campaign Soft Deleted',
        operator,
        details: `Soft deleted from systems by ${operator}.`
      },
      ...(existing.auditHistory || [])
    ];

    this._saveRawCampaigns(list);

    await donationAuditService.logEvent(id, 'Campaign Soft Deleted', `Campaign "${existing.name}" soft deleted.`, operator);
    return existing;
  }

  async addAnnouncement(id, title, content, operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = this._getRawCampaigns();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');

    const existing = list[idx];
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      date: new Date().toISOString().split('T')[0]
    };

    existing.announcements = [newAnnouncement, ...(existing.announcements || [])];
    this._saveRawCampaigns(list);

    await donationAuditService.logEvent(id, 'Announcement Created', `Added notice: "${title}"`, operator);
    return existing;
  }

  async uploadDocument(id, documentTitle, filename, operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 300));
    const list = this._getRawCampaigns();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');

    const existing = list[idx];
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: documentTitle,
      fileUrl: filename,
      status: 'Verified',
      date: new Date().toISOString().split('T')[0]
    };

    existing.documents = [...(existing.documents || []), newDoc];
    this._saveRawCampaigns(list);

    await donationAuditService.logEvent(id, 'Document Uploaded', `Uploaded document: "${documentTitle}"`, operator);
    return existing;
  }
}

export const campaignService = new CampaignService();
