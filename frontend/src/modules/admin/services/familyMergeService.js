import { familyService } from './familyService';

class FamilyMergeService {
  async detectDuplicates() {
    await new Promise(resolve => setTimeout(resolve, 800));
    const all = familyService._getRawFamilies().filter(f => f.status !== 'Soft Deleted');
    const suggestions = [];
    const processedPairs = new Set();

    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const f1 = all[i];
        const f2 = all[j];
        
        let confidence = 0;
        let reasons = [];

        // Check 1: Head phone matching (High confidence)
        const p1 = f1.headPhone ? f1.headPhone.replace(/[^0-9]/g, '') : '';
        const p2 = f2.headPhone ? f2.headPhone.replace(/[^0-9]/g, '') : '';
        if (p1 && p2 && p1 === p2) {
          confidence += 85;
          reasons.push('Identical Head of Family phone number');
        }

        // Check 2: Family name and city match (Medium confidence)
        const name1 = f1.name.toLowerCase().replace(/family|samaj/g, '').trim();
        const name2 = f2.name.toLowerCase().replace(/family|samaj/g, '').trim();
        if (name1 && name2 && name1 === name2 && f1.city.toLowerCase() === f2.city.toLowerCase()) {
          confidence += 40;
          reasons.push('Matching family surname in the same city');
        }

        // Check 3: Address overlap (Low confidence)
        const addr1 = f1.address.toLowerCase().slice(0, 15);
        const addr2 = f2.address.toLowerCase().slice(0, 15);
        if (addr1 && addr2 && addr1 === addr2) {
          confidence += 30;
          reasons.push('Similar residential street address');
        }

        // Check 4: Shared member names
        const namesF1 = f1.members.map(m => m.name.toLowerCase());
        const namesF2 = f2.members.map(m => m.name.toLowerCase());
        const shared = namesF1.filter(name => namesF2.includes(name));
        if (shared.length > 0) {
          confidence += shared.length * 15;
          reasons.push(`Shared member names: [${shared.join(', ')}]`);
        }

        if (confidence >= 40) {
          const pairKey = [f1.id, f2.id].sort().join('-');
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey);
            suggestions.push({
              id: `DUP-${f1.id}-${f2.id}`,
              familyA: f1,
              familyB: f2,
              confidence: Math.min(confidence, 99),
              reasons
            });
          }
        }
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  async mergeFamilies(targetId, sourceId, options = {}) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const list = familyService._getRawFamilies();
    
    const targetIndex = list.findIndex(f => f.id === targetId);
    const sourceIndex = list.findIndex(f => f.id === sourceId);

    if (targetIndex === -1 || sourceIndex === -1) {
      throw new Error('Target or Source family not found');
    }

    const now = new Date().toISOString();
    const target = list[targetIndex];
    const source = list[sourceIndex];

    // 1. Move members
    // Avoid double heads or ID duplicates
    const mergedMembers = [...target.members];
    source.members.forEach(sm => {
      // Check if duplicate member by name or phone
      const exists = mergedMembers.some(tm => 
        tm.name.toLowerCase() === sm.name.toLowerCase() || 
        (sm.phone && tm.phone === sm.phone)
      );

      if (!exists) {
        // Adapt relation if it conflicts with target
        let relation = sm.relation;
        if (relation === 'Self') {
          relation = options.sourceHeadRelation || 'Family Member';
        }
        
        mergedMembers.push({
          ...sm,
          id: `${targetId}-m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          relation,
          isVerified: true
        });
      }
    });

    // 2. Combine history, address, activities
    const combinedDonations = [...(target.donationHistory || []), ...(source.donationHistory || [])];
    const combinedActivity = [...(target.communityActivity || []), ...(source.communityActivity || [])];
    
    const targetAudits = target.auditHistory || [];
    const sourceAudits = source.auditHistory || [];

    const newAudit = {
      date: now,
      action: 'Merged Family Records',
      operator: 'Master Admin',
      details: `Merged duplicate family "${source.name}" (${source.id}) into "${target.name}" (${target.id}). Consolidated ${source.members.length} members.`
    };

    const combinedAudits = [newAudit, ...targetAudits, ...sourceAudits];

    // 3. Update target
    target.members = mergedMembers;
    target.donationHistory = combinedDonations;
    target.communityActivity = combinedActivity;
    target.auditHistory = combinedAudits;
    target.updatedAt = now;

    // 4. Soft delete / merge out source
    source.status = 'Soft Deleted';
    source.updatedAt = now;
    source.auditHistory = [
      {
        date: now,
        action: 'Merged Out',
        operator: 'Master Admin',
        details: `This record was merged into target family: ${target.name} (${target.id})`
      },
      ...sourceAudits
    ];

    familyService._saveRawFamilies(list);
    return target;
  }

  async splitFamily(familyId, memberIds, newFamilyDetails) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const list = familyService._getRawFamilies();
    const index = list.findIndex(f => f.id === familyId);
    if (index === -1) throw new Error('Family not found');

    const now = new Date().toISOString();
    const originalFamily = list[index];

    // 1. Extract moving members
    const movingMembers = originalFamily.members.filter(m => memberIds.includes(m.id));
    if (movingMembers.length === 0) {
      throw new Error('No valid members selected to split');
    }

    // 2. Remove from original family
    originalFamily.members = originalFamily.members.filter(m => !memberIds.includes(m.id));
    originalFamily.updatedAt = now;
    originalFamily.auditHistory = [
      {
        date: now,
        action: 'Family Split (Members Removed)',
        operator: 'Master Admin',
        details: `Split off ${movingMembers.length} members into a new family. Members moved: [${movingMembers.map(m=>m.name).join(', ')}]`
      },
      ...(originalFamily.auditHistory || [])
    ];

    // If head was removed, pick a new head for original family
    if (memberIds.includes(originalFamily.headId) && originalFamily.members.length > 0) {
      const nextHead = originalFamily.members.find(m => m.relation === 'Self') || originalFamily.members[0];
      originalFamily.headId = nextHead.id;
      originalFamily.headName = nextHead.name;
      originalFamily.headPhone = nextHead.phone || '';
      nextHead.relation = 'Self';
    }

    // 3. Create the new family
    const newId = `FAM-${1000 + list.length + 1}`;
    
    // Configure new head of family
    const headName = newFamilyDetails.headName;
    const headMember = movingMembers.find(m => m.name === headName) || movingMembers[0];
    
    // Remap relations in new family
    const remappedMembers = movingMembers.map(m => {
      if (m.id === headMember.id) {
        return { ...m, relation: 'Self' };
      }
      return m;
    });

    const newFamily = {
      id: newId,
      name: newFamilyDetails.name || `${headMember.name} Family`,
      community: newFamilyDetails.community || originalFamily.community,
      city: newFamilyDetails.city || originalFamily.city,
      address: newFamilyDetails.address || originalFamily.address,
      headId: headMember.id,
      headName: headMember.name,
      headPhone: headMember.phone || '',
      status: 'Active',
      verificationStatus: 'Verified',
      createdAt: now,
      updatedAt: now,
      members: remappedMembers,
      documents: [],
      donationHistory: [],
      communityActivity: [],
      auditHistory: [
        {
          date: now,
          action: 'Family Split (Created)',
          operator: 'Master Admin',
          details: `Split off from parent family: ${originalFamily.name} (${originalFamily.id})`
        }
      ]
    };

    list.push(newFamily);
    familyService._saveRawFamilies(list);
    return { originalFamily, newFamily };
  }
}

export const familyMergeService = new FamilyMergeService();
