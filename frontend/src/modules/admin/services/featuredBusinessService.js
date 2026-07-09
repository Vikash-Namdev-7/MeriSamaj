import { professionalDirectoryService } from './professionalDirectoryService';

class FeaturedBusinessService {
  async configureFeatured(profId, config = {}) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = professionalDirectoryService._getRawProfessionals();
    const index = list.findIndex(p => p.id === profId);
    if (index === -1) throw new Error('Professional listing not found');

    const professional = list[index];
    const now = new Date().toISOString();

    const featuredConfig = {
      isPinned: config.isPinned !== undefined ? config.isPinned : professional.featuredConfig?.isPinned || false,
      priorityScore: config.priorityScore !== undefined ? parseInt(config.priorityScore) : professional.featuredConfig?.priorityScore || 0,
      carouselOrder: config.carouselOrder !== undefined ? parseInt(config.carouselOrder) : professional.featuredConfig?.carouselOrder || 0,
      homepageVisible: config.homepageVisible !== undefined ? config.homepageVisible : professional.featuredConfig?.homepageVisible || false,
      featuredDuration: config.featuredDuration !== undefined ? config.featuredDuration : professional.featuredConfig?.featuredDuration || 'Unlimited', // e.g. 7 Days, 30 Days, Custom
      startDate: config.startDate || professional.featuredConfig?.startDate || now,
      endDate: config.endDate || professional.featuredConfig?.endDate || null,
      cityFeatured: config.cityFeatured !== undefined ? config.cityFeatured : professional.featuredConfig?.cityFeatured || false,
      communityFeatured: config.communityFeatured !== undefined ? config.communityFeatured : professional.featuredConfig?.communityFeatured || false
    };

    const isFeatured = config.status === 'Featured' || professional.status === 'Featured' || config.isPinned || featuredConfig.homepageVisible;

    const auditLog = {
      id: `log-${Date.now()}`,
      action: 'Featured Config Change',
      oldValue: JSON.stringify(professional.featuredConfig || {}),
      newValue: JSON.stringify(featuredConfig),
      performedBy: 'Master Admin',
      timestamp: now
    };

    professional.featuredConfig = featuredConfig;
    professional.status = isFeatured ? 'Featured' : 'Verified';
    professional.updatedAt = now;
    professional.auditLogs = [auditLog, ...(professional.auditLogs || [])];

    list[index] = professional;
    professionalDirectoryService._saveRawProfessionals(list);
    return professional;
  }

  async evaluateExpiredFeatures() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const list = professionalDirectoryService._getRawProfessionals();
    let updatedCount = 0;
    const now = new Date();

    const updatedList = list.map(p => {
      if (p.status === 'Featured' && p.featuredConfig?.endDate) {
        const end = new Date(p.featuredConfig.endDate);
        if (end < now) {
          updatedCount++;
          const nowStr = now.toISOString();
          const auditLog = {
            id: `log-${Date.now()}-exp`,
            action: 'Featured Promotion Expired',
            oldValue: 'Featured',
            newValue: 'Verified',
            performedBy: 'System (Auto Expiry)',
            timestamp: nowStr
          };
          
          return {
            ...p,
            status: 'Verified',
            featuredConfig: {
              ...p.featuredConfig,
              homepageVisible: false,
              isPinned: false
            },
            updatedAt: nowStr,
            auditLogs: [auditLog, ...(p.auditLogs || [])]
          };
        }
      }
      return p;
    });

    if (updatedCount > 0) {
      professionalDirectoryService._saveRawProfessionals(updatedList);
    }
    return updatedCount;
  }
}

export const featuredBusinessService = new FeaturedBusinessService();
export default featuredBusinessService;
