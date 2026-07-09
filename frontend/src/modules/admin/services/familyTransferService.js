import { familyService } from './familyService';

class FamilyTransferService {
  constructor() {
    this.storageKey = 'merisamaj_v6_family_transfers';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        // Initial mock transfer history
        const initialTransfers = [
          {
            id: 'TX-101',
            familyId: 'FAM-1002',
            familyName: 'Sharma Family Mumbai',
            sourceCommunity: 'Panchal Samaj',
            targetCommunity: 'Brahmin Samaj',
            transferDate: '2026-07-01T11:20:00Z',
            operator: 'Master Admin',
            status: 'Completed',
            notes: 'Moved due to genealogical corrections.'
          },
          {
            id: 'TX-102',
            familyId: 'FAM-1003',
            familyName: 'Desai Family Ahmedabad',
            sourceCommunity: 'Gujarati Samaj',
            targetCommunity: 'Patidar Samaj',
            transferDate: '2026-06-15T09:45:00Z',
            operator: 'Master Admin',
            status: 'Completed',
            notes: 'Consolidation of Gujarat-based regional cells.'
          }
        ];
        localStorage.setItem(this.storageKey, JSON.stringify(initialTransfers));
      }
    } catch (e) {
      console.error(e);
    }
  }

  _getTransfers() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  _saveTransfers(transfers) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(transfers));
    } catch (e) {
      console.error(e);
    }
  }

  async validateTransfer(familyId, targetCommunity) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const family = await familyService.getFamilyById(familyId);
    const allFamilies = familyService._getRawFamilies();

    const errors = [];
    const warnings = [];

    // Rule 1: Cannot transfer to same community
    if (family.community.toLowerCase() === targetCommunity.toLowerCase()) {
      errors.push('Family is already a member of the target community.');
    }

    // Rule 2: Check for existing matching family name in target community
    const nameMatch = allFamilies.find(f => 
      f.status !== 'Soft Deleted' &&
      f.community.toLowerCase() === targetCommunity.toLowerCase() &&
      f.name.toLowerCase() === family.name.toLowerCase() &&
      f.id !== familyId
    );
    if (nameMatch) {
      warnings.push(`A family with the name "${family.name}" already exists in the target community (${nameMatch.id}). Merging might be preferred.`);
    }

    // Rule 3: Check for duplicate members (by phone) in target community
    const targetFamilyMembers = allFamilies
      .filter(f => f.status !== 'Soft Deleted' && f.community.toLowerCase() === targetCommunity.toLowerCase())
      .flatMap(f => f.members);

    const familyPhones = family.members.map(m => m.phone).filter(Boolean);
    const duplicates = targetFamilyMembers.filter(m => m.phone && familyPhones.includes(m.phone));

    if (duplicates.length > 0) {
      errors.push(`Duplicate members detected! Phone numbers of [${duplicates.map(d => d.name).join(', ')}] already exist in the target community.`);
    }

    // Rule 4: Check if city matches target community demographics (Brahmin Samaj Indore vs Desai Mumbai)
    // Custom mock warning
    if (targetCommunity.includes('Indore') && family.city !== 'Indore') {
      warnings.push(`The target community "${targetCommunity}" is Indore-centric, but this family resides in ${family.city}.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async executeTransfer(familyId, targetCommunity, reason = '') {
    // 1. Validate
    const validation = await this.validateTransfer(familyId, targetCommunity);
    if (!validation.isValid) {
      throw new Error(`Transfer validation failed: ${validation.errors.join('; ')}`);
    }

    const family = await familyService.getFamilyById(familyId);
    const sourceCommunity = family.community;
    const now = new Date().toISOString();

    // 2. Perform the update in family service
    await familyService.updateFamily(familyId, {
      community: targetCommunity,
      auditHistory: [
        {
          date: now,
          action: 'Community Transferred',
          operator: 'Master Admin',
          details: `Transferred from '${sourceCommunity}' to '${targetCommunity}'. Reason: ${reason || 'Not specified'}`
        }
      ]
    });

    // 3. Log to transfers store
    const transfers = this._getTransfers();
    const newTx = {
      id: `TX-${100 + transfers.length + 1}`,
      familyId,
      familyName: family.name,
      sourceCommunity,
      targetCommunity,
      transferDate: now,
      operator: 'Master Admin',
      status: 'Completed',
      notes: reason || 'Community transfer processed by Master Admin.'
    };

    transfers.push(newTx);
    this._saveTransfers(transfers);

    return newTx;
  }

  async getTransferHistory() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this._getTransfers().sort((a, b) => new Date(b.transferDate) - new Date(a.transferDate));
  }
}

export const familyTransferService = new FamilyTransferService();
