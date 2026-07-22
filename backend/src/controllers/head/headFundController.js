const Fund = require('../../models/Fund');
const Contribution = require('../../models/Contribution');
const FundExpense = require('../../models/FundExpense');
const User = require('../../models/User');
const { notifyFundCreated } = require('../../services/notificationService');

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

const getCommunityId = (req) => {
  let communityId = req.communityId || req.user?.communityId;
  if (communityId) return communityId;
  if (req.user?.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
    return req.user.assignedCommunityIds[0];
  }
  if (req.user?.community) {
    return req.user.community;
  }
  return null;
};

// 1. Get Head Panel Funds (Scoped to Head's communityId)
exports.getFunds = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const funds = await Fund.find({ communityId, scope: 'COMMUNITY' })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const formatted = [];
    for (const f of funds) {
      const contributions = await Contribution.find({ fundId: f._id });
      const totalCollected = contributions.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
      const totalContributors = contributions.filter(c => c.paidAmount > 0).length;

      const expenses = await FundExpense.find({ fundId: f._id });
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      formatted.push({
        id: f._id.toString(),
        name: f.name,
        purpose: f.purpose || '',
        description: f.description || '',
        scope: f.scope,
        communityId: f.communityId,
        targetAmount: f.targetAmount,
        contributionPerMember: f.contributionPerMember,
        collectedAmount: totalCollected,
        remainingAmount: Math.max(0, f.targetAmount - totalCollected),
        expenseAmount: totalExpenses,
        availableBalance: totalCollected - totalExpenses,
        totalContributors,
        startDate: formatDate(f.startDate),
        endDate: formatDate(f.endDate),
        dueDate: formatDate(f.dueDate),
        status: f.status,
        createdBy: f.createdBy ? f.createdBy.name : 'Community Head',
        createdDate: f.createdAt
      });
    }

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getHeadFunds error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Get Fund Details by ID
exports.getFundById = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    const fund = await Fund.findOne({ _id: req.params.id, communityId });

    if (!fund) {
      return res.status(403).json({ success: false, message: 'Access Denied or Fund not found.' });
    }

    const contributions = await Contribution.find({ fundId: fund._id });
    const totalCollected = contributions.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
    const totalContributors = contributions.filter(c => c.paidAmount > 0).length;

    const expenses = await FundExpense.find({ fundId: fund._id });
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const data = {
      id: fund._id.toString(),
      name: fund.name,
      purpose: fund.purpose || '',
      description: fund.description || '',
      scope: fund.scope,
      communityId: fund.communityId,
      targetAmount: fund.targetAmount,
      contributionPerMember: fund.contributionPerMember,
      collectedAmount: totalCollected,
      remainingAmount: Math.max(0, fund.targetAmount - totalCollected),
      expenseAmount: totalExpenses,
      availableBalance: totalCollected - totalExpenses,
      totalContributors,
      startDate: formatDate(fund.startDate),
      endDate: formatDate(fund.endDate),
      dueDate: formatDate(fund.dueDate),
      status: fund.status,
      createdBy: fund.createdBy ? fund.createdBy.name : 'Community Head',
      createdDate: fund.createdAt
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getHeadFundById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Create Fund
exports.createFund = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const { name, purpose, description, targetAmount, contributionPerMember, startDate, endDate, dueDate } = req.body;

    if (!name || !targetAmount || !contributionPerMember) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const fund = new Fund({
      name,
      purpose,
      description,
      targetAmount: Number(targetAmount),
      contributionPerMember: Number(contributionPerMember),
      startDate: startDate || new Date(),
      endDate: endDate || null,
      dueDate: dueDate || null,
      scope: 'COMMUNITY',
      communityId,
      createdBy: req.user._id
    });

    await fund.save();

    // Seed contributions ledger for all members of this community
    const members = await User.find({ communityId, role: 'user', accountStatus: { $ne: 'deleted' } });
    const contributions = members.map(m => ({
      fundId: fund._id,
      memberId: m._id,
      communityId,
      assignedAmount: fund.contributionPerMember,
      paidAmount: 0,
      transactions: []
    }));

    if (contributions.length > 0) {
      await Contribution.insertMany(contributions);
    }

    // ── Notification: notify community members about new fund ─────────────────────
    try {
      if (members.length > 0) {
        notifyFundCreated(members.map(m => m._id), fund.name, fund._id);
      }
    } catch (notifErr) {
      console.warn('[Notify] createFund fund_created failed:', notifErr.message);
    }

    res.status(201).json({ success: true, data: fund });
  } catch (error) {
    console.error('createHeadFund error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Update Fund
exports.updateFund = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    const fund = await Fund.findOne({ _id: req.params.id, communityId });

    if (!fund) {
      return res.status(403).json({ success: false, message: 'Access Denied or Fund not found.' });
    }

    const { name, purpose, description, targetAmount, contributionPerMember, startDate, endDate, dueDate, status } = req.body;

    // Check if payments exist
    const hasPayments = await Contribution.exists({ fundId: fund._id, paidAmount: { $gt: 0 } });
    if (hasPayments) {
      if (contributionPerMember && Number(contributionPerMember) !== fund.contributionPerMember) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update contribution fees because members have already made payments.'
        });
      }
    }

    if (name) fund.name = name;
    if (purpose !== undefined) fund.purpose = purpose;
    if (description !== undefined) fund.description = description;
    if (targetAmount) fund.targetAmount = Number(targetAmount);
    if (startDate) fund.startDate = startDate;
    if (endDate !== undefined) fund.endDate = endDate;
    if (dueDate !== undefined) fund.dueDate = dueDate;
    if (status) fund.status = status;

    if (!hasPayments && contributionPerMember) {
      fund.contributionPerMember = Number(contributionPerMember);
    }

    await fund.save();

    // Sync ledgers if the contribution fee changed
    if (!hasPayments && contributionPerMember && Number(contributionPerMember) !== fund.contributionPerMember) {
      await Contribution.updateMany(
        { fundId: fund._id },
        { assignedAmount: Number(contributionPerMember) }
      );
    }

    res.status(200).json({ success: true, data: fund });
  } catch (error) {
    console.error('updateHeadFund error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. Delete Fund
exports.deleteFund = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    const fund = await Fund.findOne({ _id: req.params.id, communityId });

    if (!fund) {
      return res.status(403).json({ success: false, message: 'Access Denied or Fund not found.' });
    }

    const hasPayments = await Contribution.exists({ fundId: fund._id, paidAmount: { $gt: 0 } });
    if (hasPayments) {
      fund.status = 'Closed';
      await fund.save();
      return res.status(400).json({
        success: false,
        message: 'Fund has transaction records. It has been closed/archived instead of deleted.'
      });
    }

    await Fund.findByIdAndDelete(req.params.id);
    await Contribution.deleteMany({ fundId: req.params.id });
    await FundExpense.deleteMany({ fundId: req.params.id });

    res.status(200).json({ success: true, message: 'Fund deleted successfully.' });
  } catch (error) {
    console.error('deleteHeadFund error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6. Get contributions ledger
exports.getFundContributions = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    const fund = await Fund.findOne({ _id: req.params.id, communityId });
    if (!fund) {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    const contributions = await Contribution.find({ fundId: fund._id })
      .populate('memberId', 'name email phone avatar');

    const formatted = contributions.map(c => ({
      memberId: c.memberId ? c.memberId._id : null,
      name: c.memberId ? c.memberId.name : 'Unknown Member',
      email: c.memberId ? c.memberId.email : '',
      phone: c.memberId ? c.memberId.phone : '',
      avatar: c.memberId ? c.memberId.avatar : '',
      assignedAmount: c.assignedAmount,
      paidAmount: c.paidAmount,
      remainingAmount: Math.max(0, c.assignedAmount - c.paidAmount),
      status: c.paidAmount >= c.assignedAmount ? 'Paid' : c.paidAmount > 0 ? 'Partial' : 'Pending',
      lastPaymentDate: c.lastPaymentDate ? new Date(c.lastPaymentDate).toLocaleDateString('en-GB') : '-'
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getHeadFundContributions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 7. Get expenses
exports.getFundExpenses = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    const fund = await Fund.findOne({ _id: req.params.id, communityId });
    if (!fund) {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    const expenses = await FundExpense.find({ fundId: fund._id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    console.error('getHeadFundExpenses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 8. Add Expense
exports.addExpense = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    const fund = await Fund.findOne({ _id: req.params.id, communityId });
    if (!fund) {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    const { title, description, amount, category, date, receiptAttached } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const expense = new FundExpense({
      fundId: fund._id,
      communityId,
      title,
      description,
      amount: Number(amount),
      category: category || 'General',
      date: date || new Date(),
      addedBy: req.user.name || 'Community Head',
      receiptAttached: receiptAttached || false
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error('addHeadFundExpense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 9. Get transactions list
exports.getFundTransactions = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    const fund = await Fund.findOne({ _id: req.params.id, communityId });
    if (!fund) {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    const contributions = await Contribution.find({ fundId: fund._id })
      .populate('memberId', 'name phone');

    const list = [];
    contributions.forEach(c => {
      c.transactions.forEach(t => {
        list.push({
          id: t._id,
          txnId: t.txnId,
          memberName: c.memberId ? c.memberId.name : 'Unknown Member',
          memberPhone: c.memberId ? c.memberId.phone : '',
          amount: t.amount,
          paymentMode: t.paymentMode,
          status: t.status,
          date: t.date
        });
      });
    });

    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error('getHeadFundTransactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 10. Get overall stats
exports.getStats = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    const funds = await Fund.find({ communityId, scope: 'COMMUNITY' });
    const totalFunds = funds.length;
    const activeCount = funds.filter(f => f.status === 'Active').length;
    const completedCount = funds.filter(f => f.status === 'Completed').length;

    let overallTarget = 0;
    let overallCollected = 0;
    let overallExpenses = 0;

    for (const f of funds) {
      overallTarget += f.targetAmount || 0;
      const contributions = await Contribution.find({ fundId: f._id });
      overallCollected += contributions.reduce((sum, c) => sum + (c.paidAmount || 0), 0);

      const expenses = await FundExpense.find({ fundId: f._id });
      overallExpenses += expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    }

    res.status(200).json({
      success: true,
      data: {
        totalFunds,
        activeCount,
        completedCount,
        overallTarget,
        overallCollected,
        overallExpenses,
        overallPending: Math.max(0, overallTarget - overallCollected),
        availableBalance: overallCollected - overallExpenses
      }
    });
  } catch (error) {
    console.error('getHeadFundStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
