class ApprovalQueueService {
  constructor() {
    this.storageKey = 'merisamaj_v6_approvals';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        const mockApprovals = this._generateMockApprovals();
        localStorage.setItem(this.storageKey, JSON.stringify(mockApprovals));
      }
    } catch (e) {
      console.error('Error initializing approvals store:', e);
    }
  }

  _generateMockApprovals() {
    const modules = [
      'Member Registration',
      'Member Verification',
      'Family Verification',
      'Matrimonial Profile',
      'Professional Listing',
      'Event Creation',
      'Event Update',
      'Community Fund Request',
      'Donation Campaign',
      'Community Transfer Request',
      'Community Head Request',
      'Featured Listing',
      'Featured Event',
      'CMS Publishing',
      'Banner Publishing',
      'Announcement Publishing'
    ];

    const communities = [
      'Agrawal Samaj',
      'Brahmin Samaj',
      'Maheshwari Samaj',
      'Patidar Samaj',
      'Khandelwal Samaj',
      'Jain Samaj'
    ];

    const cities = ['Indore', 'Mumbai', 'Ahmedabad', 'Jaipur', 'Pune', 'Delhi'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    const mockApplicants = [
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 98260 12345', memberId: 'MS-AG-102', joinDate: '2025-01-10' },
      { name: 'Neha Agrawal', email: 'neha.agrawal@example.com', phone: '+91 98930 54321', memberId: 'MS-BR-305', joinDate: '2024-11-15' },
      { name: 'Karan Malhotra', email: 'karan.m@example.com', phone: '+91 91110 88990', memberId: 'MS-MH-889', joinDate: '2025-03-22' },
      { name: 'Anita Sen', email: 'anita.sen@example.com', phone: '+91 94250 67890', memberId: 'MS-PT-412', joinDate: '2025-02-05' },
      { name: 'Sumit Verma', email: 'sumit.v@example.com', phone: '+91 99260 45678', memberId: 'MS-KH-511', joinDate: '2024-08-19' },
      { name: 'Ritu Gupta', email: 'ritu.g@example.com', phone: '+91 98935 98765', memberId: 'MS-JN-209', joinDate: '2025-05-30' },
      { name: 'Rajesh Patidar', email: 'rajesh.p@example.com', phone: '+91 97520 11223', memberId: 'MS-PT-772', joinDate: '2025-04-12' },
      { name: 'Rohit Bajaj', email: 'rohit.bajaj@example.com', phone: '+91 96170 33445', memberId: 'MS-AG-150', joinDate: '2025-06-01' }
    ];

    const communityHeads = [
      { name: 'Vikash Namdev', email: 'vikash.head@example.com', id: 'CH-AG-901' },
      { name: 'Amit Sharma', email: 'amit.head@example.com', id: 'CH-BR-902' },
      { name: 'Sanjay Agrawal', email: 'sanjay.head@example.com', id: 'CH-MH-903' },
      { name: 'Preeti Patidar', email: 'preeti.head@example.com', id: 'CH-PT-904' }
    ];

    const data = [];
    const now = new Date();

    // Create 25 realistic mock entries
    for (let i = 1; i <= 25; i++) {
      const module = modules[i % modules.length];
      const community = communities[i % communities.length];
      const city = cities[i % cities.length];
      const applicant = mockApplicants[i % mockApplicants.length];
      const priority = priorities[i % priorities.length];
      const assignedHead = communityHeads[i % communityHeads.length];
      
      // Distribute statuses realistically
      let status = 'Pending';
      if (i % 5 === 0) status = 'Under Review';
      else if (i % 7 === 0) status = 'Escalated';
      else if (i % 9 === 0) status = 'Returned';
      else if (i % 11 === 0) status = 'Waiting Documents';
      else if (i % 13 === 0) status = 'Approved';
      else if (i % 15 === 0) status = 'Completed';
      else if (i % 17 === 0) status = 'Rejected';

      const daysAgo = i + 1;
      const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const updatedDate = new Date(createdDate.getTime() + (daysAgo / 2) * 24 * 60 * 60 * 1000);

      // SLA deadline: 4 days from creation
      const slaDeadline = new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000);

      // Generate a description/title based on module
      let title = '';
      let details = {};
      switch (module) {
        case 'Member Registration':
          title = `Register: ${applicant.name}`;
          details = { reason: 'New member registration request for community database', address: `Flat ${100 + i}, Royal Enclave, ${city}`, dob: '1995-08-12' };
          break;
        case 'Member Verification':
          title = `Verification: ${applicant.name}`;
          details = { reason: 'Verification Badge request for profiles security validation', qualification: 'MCA', occupation: 'Software Engineer' };
          break;
        case 'Family Verification':
          title = `Family Profile: FAM-${1000 + i}`;
          details = { familyName: `${applicant.name.split(' ')[1]} Family`, size: 4, headOfFamily: applicant.name, correlationNotes: 'All siblings reside in Indore and Pune.' };
          break;
        case 'Matrimonial Profile':
          title = `Matrimonial: ${applicant.name}`;
          details = { bio: 'A simple, ambitious, family-oriented individual looking for a matching soul.', caste: 'Agrawal (Garg)', income: '₹12 LPA', height: "5'8\"" };
          break;
        case 'Professional Listing':
          title = `Business: ${applicant.name.split(' ')[1]} Consultancies`;
          details = { businessName: `${applicant.name.split(' ')[1]} Consultancy Services`, category: 'Information Technology', address: `A-block, IT Park, ${city}`, gst: `23AAAAA${1000 + i}A1Z2` };
          break;
        case 'Event Creation':
          title = `Event: Samaj Holi Utsav 2026`;
          details = { venue: `Samaj Parisar, ${city}`, dateTime: '2026-08-15T18:00:00Z', expectedAttendees: 500, description: 'Traditional celebration with music, color, and dinner.' };
          break;
        case 'Event Update':
          title = `Update Event: Holi Venue Change`;
          details = { eventId: `EV-${100 + i}`, oldVenue: `Samaj Parisar, ${city}`, newVenue: `Grand Marriott Banquet, ${city}`, reason: 'Expected double turnout.' };
          break;
        case 'Community Fund Request':
          title = `Fund Request: ₹${50000 + i * 5000}`;
          details = { purpose: 'Primary school building painting and repair work', estimatedCost: 75000, bankDetails: `State Bank of India - AC: ${9990000000 + i}` };
          break;
        case 'Donation Campaign':
          title = `Campaign: Medical Relief Fund`;
          details = { targetAmount: 250000, campaignType: 'Medical Aid', durationDays: 30, organizer: applicant.name };
          break;
        case 'Community Transfer Request':
          title = `Transfer: FAM-${1000 + i} to ${community}`;
          details = { familyId: `FAM-${1000 + i}`, sourceCommunity: 'Other Samaj', targetCommunity: community, reason: 'Genealogical relocation' };
          break;
        case 'Community Head Request':
          title = `Nomination: ${applicant.name} for Head`;
          details = { targetSamaj: community, experiences: '10+ years of active social work inside community cell', references: 'Amit Sharma, Vikash Namdev' };
          break;
        case 'Featured Listing':
          title = `Featured: ${applicant.name.split(' ')[1]} Sweets`;
          details = { businessId: `BUS-${100 + i}`, durationMonths: 3, chargePaid: '₹5,000', slotRequested: 'Top Banner Directory' };
          break;
        case 'Featured Event':
          title = `Featured: Charity Marathon Banner`;
          details = { eventId: `EV-${200 + i}`, bannerUrl: 'charity_banner.png', promotionCost: '₹3,500' };
          break;
        case 'CMS Publishing':
          title = `CMS: History of ${community}`;
          details = { category: 'Editorial Articles', wordCount: 1200, summary: 'A comprehensive history tracing origins and transitions over 3 centuries.' };
          break;
        case 'Banner Publishing':
          title = `Banner: Diwali Wishes 2026`;
          details = { dimension: '1200x400px', displayOrder: 1, duration: '2026-10-25 to 2026-11-05' };
          break;
        case 'Announcement Publishing':
          title = `Announcement: Samaj Scholarship 2026`;
          details = { eligibility: 'Students scoring 90% or above in Board examinations', scholarshipAmount: '₹10,000 per student' };
          break;
        default:
          title = `Approval Request #${1000 + i}`;
          details = { note: 'Auto generated future approval mock template' };
      }

      // Timeline events
      const timeline = [
        {
          id: `t-${i}-1`,
          action: 'Created',
          performedBy: applicant.name,
          role: 'Member',
          timestamp: createdDate.toISOString(),
          notes: 'Request submitted successfully to the portal.'
        }
      ];

      if (status !== 'Pending') {
        timeline.push({
          id: `t-${i}-2`,
          action: 'Assigned',
          performedBy: 'System Scheduler',
          role: 'Automated Agent',
          timestamp: new Date(createdDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          notes: `Assigned automatically to Zone Reviewer: ${assignedHead.name}`
        });

        timeline.push({
          id: `t-${i}-3`,
          action: 'Reviewed',
          performedBy: assignedHead.name,
          role: 'Community Head',
          timestamp: updatedDate.toISOString(),
          notes: `Preliminary check complete. Status updated to ${status}.`
        });
      }

      // Documents
      const documents = [
        {
          id: `doc-${i}-1`,
          name: 'Aadhaar_Card_Front.pdf',
          size: '1.4 MB',
          url: '#',
          status: status === 'Approved' || status === 'Completed' ? 'Verified' : 'Pending',
          notes: status === 'Approved' ? 'Matches identity credentials' : ''
        },
        {
          id: `doc-${i}-2`,
          name: 'Address_Proof.pdf',
          size: '2.1 MB',
          url: '#',
          status: status === 'Approved' || status === 'Completed' ? 'Verified' : 'Pending',
          notes: status === 'Approved' ? 'Matches current city declaration' : ''
        }
      ];

      // Audit History
      const auditHistory = [
        {
          id: `aud-${i}-1`,
          timestamp: createdDate.toISOString(),
          admin: applicant.name,
          actionType: 'Create Request',
          oldValue: 'None',
          newValue: 'Pending Approval',
          details: 'Initial submission of approval task',
          reason: 'Initial setup'
        }
      ];

      if (status !== 'Pending') {
        auditHistory.push({
          id: `aud-${i}-2`,
          timestamp: updatedDate.toISOString(),
          admin: assignedHead.name,
          actionType: 'Review Progress',
          oldValue: 'Pending',
          newValue: status,
          details: `Community head updated request lifecycle path to: ${status}`,
          reason: 'Review complete'
        });
      }

      // Comments
      const comments = [
        {
          id: `comm-${i}-1`,
          user: applicant.name,
          role: 'Member',
          text: 'Requesting fast-track review if possible as coordinates are complete.',
          timestamp: createdDate.toISOString()
        }
      ];

      if (status === 'Returned') {
        comments.push({
          id: `comm-${i}-2`,
          user: assignedHead.name,
          role: 'Community Head',
          text: 'The address proof scan is slightly blurry. Could you please double check?',
          timestamp: updatedDate.toISOString()
        });
      }

      data.push({
        id: `APP-${2000 + i}`,
        module,
        community,
        city,
        applicant,
        title,
        submittedBy: { name: applicant.name, email: applicant.email, role: 'Member' },
        assignedHead,
        priority,
        status,
        approvalStage: status === 'Completed' || status === 'Approved' ? 'Completed' : status === 'Pending' ? 'Initial Stage' : 'Document Check',
        documents,
        timeline,
        auditHistory,
        comments,
        relatedRecords: [
          { id: `REC-${300 + i}`, type: 'Member Directory Record', title: `${applicant.name} Profile`, status: 'Active' }
        ],
        slaDeadline: slaDeadline.toISOString(),
        createdAt: createdDate.toISOString(),
        updatedAt: updatedDate.toISOString(),
        lastReviewedBy: status !== 'Pending' ? assignedHead.name : null,
        details
      });
    }

    return data;
  }

  _getRawApprovals() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  _saveRawApprovals(approvals) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(approvals));
    } catch (e) {
      console.error('Error writing to approvals storage:', e);
    }
  }

  async getApprovals(filters = {}) {
    // Mock API Delay
    await new Promise(resolve => setTimeout(resolve, 300));
    let list = this._getRawApprovals();

    // 1. Search Query Match
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(item => 
        item.id.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q) ||
        item.community.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.applicant.name.toLowerCase().includes(q) ||
        item.applicant.phone.includes(q) ||
        item.title.toLowerCase().includes(q)
      );
    }

    // 2. Filters
    if (filters.module && filters.module !== 'All') {
      list = list.filter(item => item.module === filters.module);
    }
    if (filters.community && filters.community !== 'All') {
      list = list.filter(item => item.community === filters.community);
    }
    if (filters.city && filters.city !== 'All') {
      list = list.filter(item => item.city === filters.city);
    }
    if (filters.priority && filters.priority !== 'All') {
      list = list.filter(item => item.priority === filters.priority);
    }
    if (filters.status && filters.status !== 'All') {
      list = list.filter(item => item.status === filters.status);
    }
    if (filters.approvalStage && filters.approvalStage !== 'All') {
      list = list.filter(item => item.approvalStage === filters.approvalStage);
    }
    if (filters.assignedReviewer && filters.assignedReviewer !== 'All') {
      list = list.filter(item => item.assignedHead && item.assignedHead.name === filters.assignedReviewer);
    }
    if (filters.slaStatus && filters.slaStatus !== 'All') {
      const now = new Date().getTime();
      if (filters.slaStatus === 'Overdue') {
        list = list.filter(item => new Date(item.slaDeadline).getTime() < now && !['Approved', 'Rejected', 'Completed', 'Archived'].includes(item.status));
      } else if (filters.slaStatus === 'Normal') {
        list = list.filter(item => new Date(item.slaDeadline).getTime() >= now || ['Approved', 'Rejected', 'Completed', 'Archived'].includes(item.status));
      }
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      list = list.filter(item => new Date(item.createdAt).getTime() >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      list = list.filter(item => new Date(item.createdAt).getTime() <= end);
    }

    // 3. Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'highest-priority':
          const priorityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          list.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
          break;
        case 'recently-updated':
          list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          break;
        default:
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return {
      data: list,
      totalCount: list.length
    };
  }

  async getApproval(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = this._getRawApprovals();
    return list.find(item => item.id === id) || null;
  }

  async createApproval(approvalData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = this._getRawApprovals();
    
    const id = `APP-${2000 + list.length + 1}`;
    const nowStr = new Date().toISOString();
    const slaDeadline = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();

    const newRecord = {
      id,
      module: approvalData.module || 'Custom Approval',
      title: approvalData.title || `Verification Task: ${id}`,
      community: approvalData.community || 'General Samaj',
      city: approvalData.city || 'Indore',
      applicant: approvalData.applicant || { name: 'Anonymous Member', email: 'anon@example.com', phone: 'N/A', memberId: 'MS-XX', joinDate: nowStr },
      submittedBy: approvalData.submittedBy || { name: 'System', role: 'System' },
      assignedHead: approvalData.assignedHead || null,
      priority: approvalData.priority || 'Medium',
      status: 'Pending',
      approvalStage: 'Initial Stage',
      documents: approvalData.documents || [],
      timeline: [
        {
          id: `t-${id}-1`,
          action: 'Created',
          performedBy: approvalData.submittedBy?.name || 'System',
          role: approvalData.submittedBy?.role || 'Member',
          timestamp: nowStr,
          notes: 'Approval request generated and registered in core ledger.'
        }
      ],
      auditHistory: [
        {
          id: `aud-${id}-1`,
          timestamp: nowStr,
          admin: approvalData.submittedBy?.name || 'System',
          actionType: 'Create Request',
          oldValue: 'None',
          newValue: 'Pending Approval',
          details: 'Initialized approval request.',
          reason: 'Initial setup'
        }
      ],
      comments: [],
      relatedRecords: approvalData.relatedRecords || [],
      slaDeadline,
      createdAt: nowStr,
      updatedAt: nowStr,
      lastReviewedBy: null,
      details: approvalData.details || {}
    };

    list.push(newRecord);
    this._saveRawApprovals(list);
    return newRecord;
  }

  async updateApproval(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = this._getRawApprovals();
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) throw new Error('Approval request not found');

    const updated = {
      ...list[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    this._saveRawApprovals(list);
    return updated;
  }

  async deleteApproval(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = this._getRawApprovals();
    const filtered = list.filter(item => item.id !== id);
    this._saveRawApprovals(filtered);
    return true;
  }
}

export const approvalQueueService = new ApprovalQueueService();
export default approvalQueueService;
