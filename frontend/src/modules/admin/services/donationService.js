import { campaignService } from './campaignService';
import { donationAuditService } from './donationAuditService';

const seedTransactions = [
  {
    id: 'TXN-701',
    memberId: 'm1001-h1',
    memberName: 'Rajesh Agrawal',
    memberInitials: 'RA',
    community: 'Agrawal Samaj',
    city: 'Indore',
    campaignId: 'CMP-101',
    campaignName: 'Indore Samaj Bhavan Construction',
    amount: 5000,
    paymentMethod: 'UPI',
    referenceNumber: 'UPI9081273910',
    paymentStatus: 'Approved',
    receiptStatus: 'Generated',
    date: '2026-05-12T10:30:00Z',
    paymentProof: 'upi_screenshot_rajesh.jpg',
    notes: 'Direct donation for Indore Samaj Bhavan.'
  },
  {
    id: 'TXN-702',
    memberId: 'm1002-h1',
    memberName: 'Rajesh Sharma',
    memberInitials: 'RS',
    community: 'Brahmin Samaj',
    city: 'Mumbai',
    campaignId: 'CMP-102',
    campaignName: 'Mumbai Education Scholarship 2026',
    amount: 25000,
    paymentMethod: 'NEFT',
    referenceNumber: 'NEFTUTIB000192',
    paymentStatus: 'Approved',
    receiptStatus: 'Generated',
    date: '2026-06-20T15:30:00Z',
    paymentProof: 'neft_receipt.pdf',
    notes: 'Scholarship fund contribution.'
  },
  {
    id: 'TXN-703',
    memberId: 'm1003-h1',
    memberName: 'Anita Desai',
    memberInitials: 'AD',
    community: 'Patidar Samaj',
    city: 'Ahmedabad',
    campaignId: 'CMP-103',
    campaignName: 'Varanasi Health Camp Organization',
    amount: 10000,
    paymentMethod: 'Card',
    referenceNumber: 'TXN3049102931',
    paymentStatus: 'Approved',
    receiptStatus: 'Generated',
    date: '2026-05-01T11:20:00Z',
    paymentProof: null,
    notes: 'Health camp sponsor.'
  },
  {
    id: 'TXN-704',
    memberId: 'm1004-h1',
    memberName: 'Kunwar Pratap Singh',
    memberInitials: 'KP',
    community: 'Rajput Samaj',
    city: 'Jaipur',
    campaignId: 'CMP-104',
    campaignName: 'Jaipur Poor Girls Marriage Support',
    amount: 15000,
    paymentMethod: 'NEFT',
    referenceNumber: 'NEFTHDFC000098',
    paymentStatus: 'Pending Verification',
    receiptStatus: 'Pending',
    date: '2026-07-01T09:15:00Z',
    paymentProof: 'proof_marriage_support.png',
    notes: 'Marriage sponsorship.'
  },
  {
    id: 'TXN-705',
    memberId: 'm1001-h2',
    memberName: 'Sunita Agrawal',
    memberInitials: 'SA',
    community: 'Agrawal Samaj',
    city: 'Indore',
    campaignId: 'CMP-101',
    campaignName: 'Indore Samaj Bhavan Construction',
    amount: 2500,
    paymentMethod: 'UPI',
    referenceNumber: 'UPI9081273988',
    paymentStatus: 'Pending Verification',
    receiptStatus: 'Pending',
    date: '2026-07-05T14:40:00Z',
    paymentProof: 'upi_screenshot_sunita.jpg',
    notes: 'Monthly contribution.'
  },
  {
    id: 'TXN-706',
    memberId: 'm1005-h1',
    memberName: 'Ramesh Maheshwari',
    memberInitials: 'RM',
    community: 'Maheshwari Samaj',
    city: 'Pune',
    campaignId: 'CMP-106',
    campaignName: 'Pune Samaj Kitchen Upgradation',
    amount: 50000,
    paymentMethod: 'UPI',
    referenceNumber: 'UPI9081274000',
    paymentStatus: 'Rejected',
    receiptStatus: 'Pending',
    date: '2026-06-15T18:20:00Z',
    paymentProof: 'upi_screenshot_fail.jpg',
    notes: 'Failed payment reference check.',
    rejectionReason: 'Reference ID not found in bank statement.'
  },
  {
    id: 'TXN-707',
    memberId: 'm1006-h1',
    memberName: 'Virendra Joshi',
    memberInitials: 'VJ',
    community: 'Brahmin Samaj',
    city: 'Varanasi',
    campaignId: 'CMP-107',
    campaignName: 'Ancient Temple Restoration',
    amount: 15000,
    paymentMethod: 'Cash',
    referenceNumber: 'CASH-8910',
    paymentStatus: 'Approved',
    receiptStatus: 'Generated',
    date: '2026-01-20T12:00:00Z',
    paymentProof: null,
    notes: 'Manual cash submission to local Head Pt. Harish.'
  }
];

class DonationService {
  constructor() {
    this.storageKey = 'merisamaj_v6_donation_txns';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        localStorage.setItem(this.storageKey, JSON.stringify(seedTransactions));
      }
    } catch (e) {
      console.error('Failed to initialize transactions store:', e);
    }
  }

  _getRawTransactions() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [...seedTransactions];
    } catch (e) {
      return [...seedTransactions];
    }
  }

  _saveRawTransactions(txns) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(txns));
    } catch (e) {
      console.error('Failed to save transactions store:', e);
    }
  }

  async getTransactions(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let list = this._getRawTransactions();

    // Advanced search
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(t => 
        t.id.toLowerCase().includes(q) ||
        (t.memberName && t.memberName.toLowerCase().includes(q)) ||
        t.memberId.toLowerCase().includes(q) ||
        t.community.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.campaignName.toLowerCase().includes(q) ||
        (t.referenceNumber && t.referenceNumber.toLowerCase().includes(q))
      );
    }

    // Filter properties
    if (filters.community && filters.community !== 'All') {
      list = list.filter(t => t.community.toLowerCase() === filters.community.toLowerCase());
    }

    if (filters.city && filters.city !== 'All') {
      list = list.filter(t => t.city.toLowerCase() === filters.city.toLowerCase());
    }

    if (filters.campaignId && filters.campaignId !== 'All') {
      list = list.filter(t => t.campaignId === filters.campaignId);
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'All') {
      list = list.filter(t => t.paymentStatus.toLowerCase() === filters.paymentStatus.toLowerCase());
    }

    if (filters.paymentMethod && filters.paymentMethod !== 'All') {
      list = list.filter(t => t.paymentMethod.toLowerCase() === filters.paymentMethod.toLowerCase());
    }

    if (filters.minAmount) {
      list = list.filter(t => t.amount >= Number(filters.minAmount));
    }
    if (filters.maxAmount) {
      list = list.filter(t => t.amount <= Number(filters.maxAmount));
    }

    // Sort
    if (filters.sort) {
      switch (filters.sort) {
        case 'newest':
          list.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'oldest':
          list.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'highestAmount':
          list.sort((a, b) => b.amount - a.amount);
          break;
        case 'lowestAmount':
          list.sort((a, b) => a.amount - b.amount);
          break;
        default:
          list.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    } else {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return {
      data: list,
      totalCount: list.length
    };
  }

  async getTransactionsByCampaign(campaignId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = this._getRawTransactions();
    return list.filter(t => t.campaignId === campaignId);
  }

  async approveManualPayment(txnId, operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 500));
    const txns = this._getRawTransactions();
    const idx = txns.findIndex(t => t.id === txnId);
    if (idx === -1) throw new Error('Transaction not found');

    const txn = txns[idx];
    if (txn.paymentStatus === 'Approved') return txn;

    txn.paymentStatus = 'Approved';
    txn.receiptStatus = 'Generated';
    txn.approvedBy = operator;
    txn.approvedAt = new Date().toISOString();

    this._saveRawTransactions(txns);

    // Update Campaign Collection Progress
    try {
      const campaign = await campaignService.getCampaignById(txn.campaignId);
      if (campaign) {
        const newCollected = campaign.collectedAmount + txn.amount;
        const target = campaign.targetAmount;
        const newRemaining = Math.max(0, target - newCollected);
        const newContributors = campaign.contributorsCount + 1;

        await campaignService.updateCampaign(txn.campaignId, {
          collectedAmount: newCollected,
          remainingAmount: newRemaining,
          contributorsCount: newContributors
        }, operator);
      }
    } catch (e) {
      console.error('Failed to update campaign collections during transaction approval:', e);
    }

    await donationAuditService.logEvent(
      txn.campaignId,
      'Payment Approved',
      `Approved manual payment of ₹${txn.amount} from member ${txn.memberName} (TXN ID: ${txn.id}).`,
      operator
    );

    return txn;
  }

  async rejectPayment(txnId, reason = 'Proof is incorrect or blur', operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 400));
    const txns = this._getRawTransactions();
    const idx = txns.findIndex(t => t.id === txnId);
    if (idx === -1) throw new Error('Transaction not found');

    const txn = txns[idx];
    txn.paymentStatus = 'Rejected';
    txn.rejectionReason = reason;
    txn.rejectedBy = operator;
    txn.rejectedAt = new Date().toISOString();

    this._saveRawTransactions(txns);

    await donationAuditService.logEvent(
      txn.campaignId,
      'Payment Rejected',
      `Rejected payment of ₹${txn.amount} from member ${txn.memberName}. Reason: ${reason}.`,
      operator
    );

    return txn;
  }

  async issueRefund(txnId, notes = '', operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 500));
    const txns = this._getRawTransactions();
    const idx = txns.findIndex(t => t.id === txnId);
    if (idx === -1) throw new Error('Transaction not found');

    const txn = txns[idx];
    const prevStatus = txn.paymentStatus;
    txn.paymentStatus = 'Refunded';
    txn.refundNotes = notes;
    txn.refundedBy = operator;
    txn.refundedAt = new Date().toISOString();

    this._saveRawTransactions(txns);

    // If the payment was previously approved, we deduct the amount from the campaign collections
    if (prevStatus === 'Approved') {
      try {
        const campaign = await campaignService.getCampaignById(txn.campaignId);
        if (campaign) {
          const newCollected = Math.max(0, campaign.collectedAmount - txn.amount);
          const target = campaign.targetAmount;
          const newRemaining = Math.max(0, target - newCollected);
          const newContributors = Math.max(0, campaign.contributorsCount - 1);

          await campaignService.updateCampaign(txn.campaignId, {
            collectedAmount: newCollected,
            remainingAmount: newRemaining,
            contributorsCount: newContributors
          }, operator);
        }
      } catch (e) {
        console.error('Failed to deduct campaign collections during refund:', e);
      }
    }

    await donationAuditService.logEvent(
      txn.campaignId,
      'Payment Refunded',
      `Refunded payment of ₹${txn.amount} for member ${txn.memberName}. Notes: ${notes}.`,
      operator
    );

    return txn;
  }

  async createTransaction(txnData, operator = 'Master Admin') {
    await new Promise(resolve => setTimeout(resolve, 400));
    const txns = this._getRawTransactions();
    const id = `TXN-${700 + txns.length + 1}`;
    const initials = txnData.memberName ? txnData.memberName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DN';

    const newTxn = {
      id,
      memberInitials: initials,
      paymentStatus: txnData.paymentStatus || 'Approved',
      receiptStatus: txnData.paymentStatus === 'Approved' ? 'Generated' : 'Pending',
      date: new Date().toISOString(),
      ...txnData,
      amount: Number(txnData.amount)
    };

    txns.push(newTxn);
    this._saveRawTransactions(txns);

    // If approved on creation, increment campaign collection directly
    if (newTxn.paymentStatus === 'Approved') {
      try {
        const campaign = await campaignService.getCampaignById(newTxn.campaignId);
        if (campaign) {
          const newCollected = campaign.collectedAmount + newTxn.amount;
          const target = campaign.targetAmount;
          const newRemaining = Math.max(0, target - newCollected);
          const newContributors = campaign.contributorsCount + 1;

          await campaignService.updateCampaign(newTxn.campaignId, {
            collectedAmount: newCollected,
            remainingAmount: newRemaining,
            contributorsCount: newContributors
          }, operator);
        }
      } catch (e) {
        console.error('Failed to update campaign collections during transaction creation:', e);
      }
    }

    return newTxn;
  }
}

export const donationService = new DonationService();
