// Audience Management Service

const segmentReachMap = {
  'Entire Platform': 25000,
  'Members': 24800,
  'Community Heads': 124,
  'Volunteers': 850,
  'Donors': 2400,
  'Premium Members': 1800,
  'Event Participants': 3100,
  'Professional Directory Users': 2900,
  'Matrimonial Users': 4200,
  'Custom User Groups': 350,
  // Cities
  'Indore': 5200,
  'Mumbai': 4800,
  'Pune': 3400,
  'Jaipur': 2800,
  'Ahmedabad': 4100,
  'Varanasi': 1700,
  // Communities
  'Agrawal Samaj': 6500,
  'Brahmin Samaj': 5400,
  'Maheshwari Samaj': 4200,
  'Rajput Samaj': 3800,
  'Jain Samaj': 2900,
  'Khandelwal Samaj': 2200
};

const mockMembers = [
  { name: 'Vikash Namdev', city: 'Indore', community: 'Agrawal Samaj', email: 'vikash@merisamaj.org', phone: '+91 98765 43210', category: 'Member', isVerified: true },
  { name: 'Amit Agrawal', city: 'Indore', community: 'Agrawal Samaj', email: 'amit.a@example.com', phone: '+91 98234 11223', category: 'Donor', isVerified: true },
  { name: 'Preeti Patidar', city: 'Pune', community: 'Patidar Samaj', email: 'preeti.p@example.com', phone: '+91 98111 22233', category: 'Volunteer', isVerified: true },
  { name: 'Ramesh Sharma', city: 'Mumbai', community: 'Brahmin Samaj', email: 'ramesh.sharma@example.com', phone: '+91 99000 88776', category: 'Community Head', isVerified: true },
  { name: 'Sanjay Agrawal', city: 'Ahmedabad', community: 'Agrawal Samaj', email: 'sanjay.ag@example.com', phone: '+91 97777 55443', category: 'Premium Member', isVerified: true },
  { name: 'Nisha Khandelwal', city: 'Jaipur', community: 'Khandelwal Samaj', email: 'nisha.k@example.com', phone: '+91 94140 12345', category: 'Matrimonial User', isVerified: true },
  { name: 'Rajesh Maheshwari', city: 'Pune', community: 'Maheshwari Samaj', email: 'rajesh.m@example.com', phone: '+91 93300 44556', category: 'Professional Directory User', isVerified: true },
  { name: 'Sneh Lata Jain', city: 'Delhi', community: 'Jain Samaj', email: 'sneh.jain@example.com', phone: '+91 91223 34455', category: 'Donor', isVerified: true },
  { name: 'Harish Tripathi', city: 'Varanasi', community: 'Brahmin Samaj', email: 'harish.t@example.com', phone: '+91 98555 44433', category: 'Community Head', isVerified: true },
  { name: 'Pooja Rajput', city: 'Jaipur', community: 'Rajput Samaj', email: 'pooja.r@example.com', phone: '+91 92222 11111', category: 'Event Participant', isVerified: true }
];

class AudienceManagementService {
  async estimateReach(audienceDef = {}) {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const { targetType, targetAudience, community, city } = audienceDef;
      
      let reach = 25000;
      let breakdown = { email: 0, push: 0, sms: 0, whatsapp: 0, web: 0 };
      
      if (targetType === 'Cities' && city && city !== 'All Cities') {
        reach = segmentReachMap[city] || 1500;
      } else if (targetType === 'Community' && community && community !== 'All Communities') {
        reach = segmentReachMap[community] || 2000;
      } else if (targetAudience && targetAudience !== 'All Platform Members') {
        reach = segmentReachMap[targetAudience] || 1000;
      } else {
        reach = segmentReachMap['Entire Platform'];
      }

      // Calculate breakdown based on reach
      breakdown.email = Math.floor(reach * 0.90);
      breakdown.push = Math.floor(reach * 0.75);
      breakdown.sms = Math.floor(reach * 0.95);
      breakdown.whatsapp = Math.floor(reach * 0.85);
      breakdown.web = reach;

      return {
        success: true,
        reach,
        breakdown,
        demographics: {
          gender: { male: 54, female: 45, unspecified: 1 },
          ageGroups: { '18-25': 15, '26-35': 38, '36-50': 27, '50+': 20 }
        }
      };
    } catch (e) {
      return { success: false, error: e.message, reach: 0 };
    }
  }

  async previewAudience(audienceDef = {}) {
    await new Promise(resolve => setTimeout(resolve, 250));
    try {
      const { targetType, targetAudience, community, city } = audienceDef;

      let filtered = [...mockMembers];

      if (targetType === 'Cities' && city && city !== 'All Cities') {
        filtered = filtered.filter(m => m.city === city);
      }
      if (targetType === 'Community' && community && community !== 'All Communities') {
        filtered = filtered.filter(m => m.community === community);
      }
      if (targetAudience && targetAudience !== 'All Platform Members') {
        // Simple mapping verification
        if (targetAudience === 'Community Heads') {
          filtered = filtered.filter(m => m.category === 'Community Head');
        } else if (targetAudience === 'Donors') {
          filtered = filtered.filter(m => m.category === 'Donor');
        } else if (targetAudience === 'Volunteers') {
          filtered = filtered.filter(m => m.category === 'Volunteer');
        } else if (targetAudience === 'Premium Members') {
          filtered = filtered.filter(m => m.category === 'Premium Member');
        } else if (targetAudience === 'Matrimonial Users') {
          filtered = filtered.filter(m => m.category === 'Matrimonial User');
        } else if (targetAudience === 'Professional Directory Users') {
          filtered = filtered.filter(m => m.category === 'Professional Directory User');
        } else if (targetAudience === 'Event Participants') {
          filtered = filtered.filter(m => m.category === 'Event Participant');
        }
      }

      // If filter returns empty, return a subset of original mock members to keep UI alive
      if (filtered.length === 0) {
        filtered = mockMembers.slice(0, 3);
      }

      return { success: true, previewList: filtered };
    } catch (e) {
      return { success: false, error: e.message, previewList: [] };
    }
  }

  async validateAudience(audienceDef = {}) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const conflicts = [];
    const warnings = [];

    const { targetType, targetAudience, community, city, priority, startDate, endDate } = audienceDef;

    // Simple business validation rules
    if (!startDate) {
      warnings.push('Start Date is missing; campaign scheduler will default to immediate publish.');
    }

    if (priority === 'Critical') {
      warnings.push('Critical priority broadcast selected. This will bypass scheduling, override notifications, and alert all communication channels immediately.');
    }

    // Check conflict mock
    if (targetType === 'Community' && community === 'Brahmin Samaj' && city === 'Indore') {
      conflicts.push({
        type: 'Date Overlap',
        description: 'Brahmin Samaj Indore has an active "Education Drive" banner campaign running on the same dates.',
        impact: 'High email notification overlap.'
      });
    }

    if (targetType === 'Platform' && priority === 'Critical') {
      conflicts.push({
        type: 'Channel Traffic Warning',
        description: 'An emergency alert broadcast to the entire platform may trigger email spam warnings on large domains (e.g. Gmail).',
        impact: 'Deliverability rate could decrease by 15%.'
      });
    }

    return {
      success: true,
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }
}

export const audienceManagementService = new AudienceManagementService();
