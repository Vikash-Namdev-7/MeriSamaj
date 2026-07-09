import { professionalDirectoryService } from './professionalDirectoryService';

class ProfessionalDuplicateService {
  async detectDuplicates() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const list = professionalDirectoryService._getRawProfessionals().filter(p => !p.isDeleted);
    const duplicates = [];

    // Simple nested loop to compare pairings and match values
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        const matchReasons = [];

        if (a.gstNumber && b.gstNumber && a.gstNumber.toLowerCase().trim() === b.gstNumber.toLowerCase().trim()) {
          matchReasons.push('Duplicate GST Number');
        }
        if (a.phone && b.phone && a.phone.replace(/[^0-9]/g, '') === b.phone.replace(/[^0-9]/g, '')) {
          matchReasons.push('Duplicate Phone Number');
        }
        if (a.ownerEmail && b.ownerEmail && a.ownerEmail.toLowerCase().trim() === b.ownerEmail.toLowerCase().trim()) {
          matchReasons.push('Duplicate Email');
        }
        if (a.title && b.title && a.title.toLowerCase().replace(/\s+/g, '') === b.title.toLowerCase().replace(/\s+/g, '')) {
          matchReasons.push('Duplicate Business Title');
        }
        if (a.address && b.address && a.address.toLowerCase().trim() === b.address.toLowerCase().trim()) {
          matchReasons.push('Duplicate Location Address');
        }

        if (matchReasons.length > 0) {
          duplicates.push({
            id: `${a.id}-${b.id}`,
            primaryBusiness: a,
            duplicateBusiness: b,
            reasons: matchReasons,
            confidence: matchReasons.length >= 2 ? 'High' : 'Medium'
          });
        }
      }
    }

    return duplicates;
  }

  async mergeBusinesses(primaryId, duplicateId, mergeOptions = {}) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const list = professionalDirectoryService._getRawProfessionals();
    const primaryIndex = list.findIndex(p => p.id === primaryId);
    const duplicateIndex = list.findIndex(p => p.id === duplicateId);

    if (primaryIndex === -1 || duplicateIndex === -1) {
      throw new Error('Primary or duplicate business listing not found');
    }

    const primary = list[primaryIndex];
    const duplicate = list[duplicateIndex];
    const now = new Date().toISOString();

    // 1. Consolidate Lists (Gallery, Reviews, Complaints, Products/Services)
    const consolidatedReviews = [...(primary.reviews || []), ...(duplicate.reviews || [])];
    const consolidatedComplaints = [...(primary.complaints || []), ...(duplicate.complaints || [])];
    const consolidatedProducts = [...(primary.productsServices || []), ...(duplicate.productsServices || [])];
    const consolidatedGallery = [...(primary.gallery || []), ...(duplicate.gallery || [])];

    // 2. Combine stats (views, rating calculation)
    const totalViews = (primary.views || 0) + (duplicate.views || 0);
    const totalRatingSum = ((primary.rating || 0) * (primary.reviews?.length || 1)) + ((duplicate.rating || 0) * (duplicate.reviews?.length || 1));
    const totalReviewsCount = (primary.reviews?.length || 0) + (duplicate.reviews?.length || 0);
    const avgRating = totalReviewsCount > 0 ? parseFloat((totalRatingSum / totalReviewsCount).toFixed(1)) : primary.rating;

    // 3. Keep audit logs from both
    const mergeAuditLog = {
      id: `log-${Date.now()}`,
      action: 'Business Merge Consolidated',
      oldValue: `Consolidated duplicate listing ID: ${duplicate.id}`,
      newValue: `Merged all properties into primary ID: ${primary.id}`,
      performedBy: 'Master Admin',
      timestamp: now,
      reason: mergeOptions.reason || 'Consolidated duplicate business entries.'
    };
    
    const consolidatedAuditLogs = [
      mergeAuditLog,
      ...(primary.auditLogs || []),
      ...(duplicate.auditLogs || []).map(log => ({ ...log, notes: `[Merged from ${duplicate.id}] ${log.notes || ''}` }))
    ];

    // 4. Update primary
    list[primaryIndex] = {
      ...primary,
      views: totalViews,
      rating: avgRating,
      reviews: consolidatedReviews,
      complaints: consolidatedComplaints,
      productsServices: consolidatedProducts,
      gallery: consolidatedGallery,
      auditLogs: consolidatedAuditLogs,
      updatedAt: now
    };

    // 5. Mark duplicate as Archived and Soft Deleted
    list[duplicateIndex] = {
      ...duplicate,
      isDeleted: true,
      status: 'Archived',
      updatedAt: now,
      auditLogs: [
        {
          id: `log-${Date.now()}-del`,
          action: 'Merged & Archived',
          oldValue: duplicate.status,
          newValue: `Archived as duplicate of ${primary.id}`,
          performedBy: 'Master Admin',
          timestamp: now
        },
        ...(duplicate.auditLogs || [])
      ]
    };

    professionalDirectoryService._saveRawProfessionals(list);
    return list[primaryIndex];
  }
}

export const professionalDuplicateService = new ProfessionalDuplicateService();
export default professionalDuplicateService;
