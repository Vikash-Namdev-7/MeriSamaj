const Campaign = require('../../models/Campaign');
const Donation = require('../../models/Donation');
const Expense = require('../../models/Expense');

// Helper to get community ID of the head
const getCommunityId = (req) => {
  return req.user?.community || req.user?.communityId || 'c1'; 
};

// 1. Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const community = getCommunityId(req);
    
    const campaigns = await Campaign.find({ community });
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'Published' || c.status === 'Active').length;
    const scheduledCampaigns = campaigns.filter(c => c.status === 'Scheduled').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;
    
    const amountAggr = await Campaign.aggregate([
      { $match: { community } },
      { $group: { _id: null, totalTarget: { $sum: "$targetAmount" }, totalRaised: { $sum: "$collectedAmount" }, totalExpenses: { $sum: "$expenseAmount" } } }
    ]);
    const totalTargetAmount = amountAggr.length > 0 ? amountAggr[0].totalTarget : 0;
    const totalRaisedAmount = amountAggr.length > 0 ? amountAggr[0].totalRaised : 0;
    const totalExpenseAmount = amountAggr.length > 0 ? amountAggr[0].totalExpenses : 0;
    
    const donationsCount = await Donation.countDocuments(); // Should filter by community campaigns
    const uniqueDonorsList = await Donation.distinct('user');
    const totalDonors = uniqueDonorsList.length;

    res.status(200).json({
      status: 'success',
      data: {
        totalCampaigns,
        activeCampaigns,
        scheduledCampaigns,
        completedCampaigns,
        expiredCampaigns: 0,
        totalTargetAmount,
        totalRaisedAmount,
        totalExpenseAmount,
        availableBalance: totalRaisedAmount - totalExpenseAmount,
        totalDonors,
        averageDonation: donationsCount > 0 ? Math.round(totalRaisedAmount / donationsCount) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Get All Campaigns (Data Table)
exports.getAllCampaigns = async (req, res) => {
  try {
    const community = getCommunityId(req);
    const campaigns = await Campaign.find({ community }).sort({ createdAt: -1 }).populate('createdBy', 'name');
    
    const formatted = campaigns.map(c => ({
      id: c._id,
      title: c.title,
      category: c.category,
      targetAmount: c.targetAmount,
      raisedAmount: c.collectedAmount,
      expenseAmount: c.expenseAmount || 0,
      availableBalance: (c.collectedAmount || 0) - (c.expenseAmount || 0),
      remainingAmount: Math.max(0, c.targetAmount - c.collectedAmount),
      progress: c.targetAmount > 0 ? Math.min(Math.round((c.collectedAmount / c.targetAmount) * 100), 100) : 0,
      totalDonors: c.contributorsCount,
      startDate: c.startDate,
      endDate: c.endDate,
      visibility: c.visibility,
      status: c.status,
      createdBy: c.createdBy ? c.createdBy.name : 'Admin',
      createdDate: c.createdAt,
      lastUpdated: c.updatedAt,
      bannerImage: c.bannerImage
    }));

    res.status(200).json({ status: 'success', data: formatted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const parseCampaignBody = (body, file) => {
  const data = { ...body };
  if (file) {
    data.bannerImage = file.path;
  }
  
  // Clean up bannerImage if it is not a valid URL/string (e.g. sent as an empty object or string)
  if (data.bannerImage !== undefined && data.bannerImage !== null) {
    if (typeof data.bannerImage !== 'string' || data.bannerImage === '[object Object]' || data.bannerImage === '') {
      delete data.bannerImage;
    }
  }
  
  if (typeof data.locations === 'string') {
    try { data.locations = JSON.parse(data.locations); } catch (e) { data.locations = []; }
  }
  if (typeof data.targetedMembers === 'string') {
    try { data.targetedMembers = JSON.parse(data.targetedMembers); } catch (e) { data.targetedMembers = []; }
  }
  if (typeof data.targetAudiences === 'string') {
    try { data.targetAudiences = JSON.parse(data.targetAudiences); } catch (e) { data.targetAudiences = []; }
  }
  return data;
};

// 3. Create Campaign
exports.createCampaign = async (req, res) => {
  try {
    const community = getCommunityId(req);
    const parsedData = parseCampaignBody(req.body, req.file);
    const newCampaign = new Campaign({
      ...parsedData,
      community,
      createdBy: req.user?._id
    });
    
    await newCampaign.save();
    res.status(201).json({ status: 'success', data: newCampaign });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// 4. Update Campaign
exports.updateCampaign = async (req, res) => {
  try {
    const parsedData = parseCampaignBody(req.body, req.file);
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, parsedData, { new: true });
    if (!campaign) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    res.status(200).json({ status: 'success', data: campaign });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// 5. Delete / Archive Campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 6. Get Campaign By ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name');
    if (!campaign) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    res.status(200).json({ status: 'success', data: campaign });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 7. Get Campaign Donors
exports.getCampaignDonors = async (req, res) => {
  try {
    const donations = await Donation.find({ campaign: req.params.id })
      .populate('user', 'name memberId')
      .sort({ date: -1 });

    const formatted = donations.map(d => ({
      id: d._id,
      name: d.user?.name || 'Anonymous',
      memberId: d.user?.memberId || 'N/A',
      family: 'N/A', // Update if we expand user schema
      mobile: 'N/A', // Update if we expand user schema
      amount: d.amount,
      paymentMethod: d.paymentMode,
      txnId: d.txnId,
      date: d.date,
      status: d.status
    }));

    res.status(200).json({ status: 'success', data: formatted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 8. Update Campaign Status
exports.updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!campaign) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    res.status(200).json({ status: 'success', data: campaign });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// 9. Add Expense to Campaign
exports.addExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, category, date, notes } = req.body;
    
    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    
    const availableBalance = (campaign.collectedAmount || 0) - (campaign.expenseAmount || 0);
    if (amount > availableBalance) {
      return res.status(400).json({ status: 'error', message: 'Expense amount cannot exceed available balance' });
    }
    
    const expense = new Expense({
      campaign: id,
      title,
      description,
      amount,
      category,
      date: date || Date.now(),
      notes,
      createdBy: req.user?._id
    });
    
    await expense.save();
    
    // Update campaign expense amount
    campaign.expenseAmount = (campaign.expenseAmount || 0) + Number(amount);
    await campaign.save();
    
    res.status(201).json({ status: 'success', data: expense });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// 10. Get Expenses for Campaign
exports.getCampaignExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ campaign: req.params.id }).sort({ date: -1 }).populate('createdBy', 'name');
    res.status(200).json({ status: 'success', data: expenses });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 11. Get Full Ledger
exports.getLedger = async (req, res) => {
  try {
    const community = getCommunityId(req);
    
    // Fetch all campaigns to get basic totals
    const campaigns = await Campaign.find({ community }, 'title collectedAmount expenseAmount');
    
    // Fetch all expenses in the community
    const campaignIds = campaigns.map(c => c._id);
    const expenses = await Expense.find({ campaign: { $in: campaignIds } })
      .populate('campaign', 'title category')
      .sort({ date: -1 });
      
    // Fetch all donations
    const donations = await Donation.find({ campaign: { $in: campaignIds }, status: 'Approved' })
      .populate('campaign', 'title category')
      .populate('user', 'name memberId')
      .sort({ date: -1 });
      
    const transactions = [
      ...donations.map(d => ({
        id: `don_${d._id}`,
        type: 'INCOME',
        title: `Donation from ${d.user?.name || 'Anonymous'}`,
        campaignTitle: d.campaign?.title || 'Unknown',
        amount: d.amount,
        date: d.date,
        txnId: d.txnId
      })),
      ...expenses.map(e => ({
        id: `exp_${e._id}`,
        type: 'EXPENSE',
        title: e.title,
        campaignTitle: e.campaign?.title || 'Unknown',
        amount: e.amount,
        date: e.date,
        category: e.category
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort all by date descending
    
    const totalIncome = campaigns.reduce((sum, c) => sum + (c.collectedAmount || 0), 0);
    const totalExpenses = campaigns.reduce((sum, c) => sum + (c.expenseAmount || 0), 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        totalIncome,
        totalExpenses,
        availableBalance: totalIncome - totalExpenses,
        campaignsBalance: campaigns.map(c => ({
          id: c._id,
          title: c.title,
          collected: c.collectedAmount || 0,
          expenses: c.expenseAmount || 0,
          balance: (c.collectedAmount || 0) - (c.expenseAmount || 0)
        })),
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
