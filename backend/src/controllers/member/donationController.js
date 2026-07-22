const Campaign = require('../../models/Campaign');
const Donation = require('../../models/Donation');

// Get all active campaigns — community-scoped
exports.getCampaigns = async (req, res) => {
  try {
    const rawCommunityId = req.communityId || (req.user?.communityId?._id || req.user?.communityId);
    const commIdStr = rawCommunityId ? rawCommunityId.toString() : null;
    const userCommunityName = req.user?.community;

    const filter = {
      isDeleted: { $ne: true },
      status: { $nin: ['Completed', 'Suspended', 'Archived', 'Deleted'] }
    };

    if (commIdStr) {
      filter.$or = [
        { communityId: rawCommunityId },
        { communityId: commIdStr },
        { community: userCommunityName },
        { communityId: null },
        { isGlobal: true },
        { visibility: 'GLOBAL' }
      ];
    } else if (req.user?.role === 'admin' && req.query.communityId) {
      filter.communityId = req.query.communityId;
    }

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 }).lean();

    const formattedCampaigns = campaigns.map(c => ({
      id: c._id,
      _id: c._id,
      title: c.title,
      titleEn: c.title,
      raised: c.collectedAmount || 0,
      collectedAmount: c.collectedAmount || 0,
      target: c.targetAmount || 0,
      targetAmount: c.targetAmount || 0,
      percentage: c.targetAmount > 0 ? Math.min(Math.round(((c.collectedAmount || 0) / c.targetAmount) * 100), 100) : 0,
      desc: c.description || c.shortDescription || '',
      description: c.description || c.shortDescription || '',
      city: c.city || 'Indore',
      category: c.category || 'General',
      visibility: c.visibility || 'Entire Community',
      status: c.status || 'Active',
      bannerImage: c.bannerImage || null,
      startDate: c.startDate,
      endDate: c.endDate
    }));

    res.status(200).json({ status: 'success', data: formattedCampaigns });
  } catch (error) {
    console.error('Get Member Campaigns Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single campaign details
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }

    // Community Isolation Guard
    if (req.communityId && campaign.communityId) {
      const campaignCommunityId = campaign.communityId._id ?? campaign.communityId;
      if (!campaignCommunityId.equals(req.communityId)) {
        return res.status(403).json({ status: 'error', message: 'Access denied. You cannot view a campaign of another community.' });
      }
    }

    const formattedCampaign = {
      id: campaign._id,
      title: campaign.title,
      raised: campaign.collectedAmount,
      target: campaign.targetAmount,
      percentage: campaign.targetAmount > 0 ? Math.min(Math.round((campaign.collectedAmount / campaign.targetAmount) * 100), 100) : 0,
      desc: campaign.description,
      city: campaign.city,
      bannerImage: campaign.bannerImage
    };

    res.status(200).json({
      status: 'success',
      data: formattedCampaign
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get user's donation history
exports.getHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id })
      .populate('campaign', 'title')
      .sort({ date: -1 });

    const formattedHistory = donations.map(d => {
      const dDate = new Date(d.date);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${dDate.getDate()} ${months[dDate.getMonth()]} ${dDate.getFullYear()}`;
      const formattedTime = dDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: d._id,
        purposeId: d.campaign ? d.campaign._id : null,
        purposeTitle: d.campaign ? d.campaign.title : 'Unknown Campaign',
        amount: d.amount,
        type: d.type,
        date: formattedDate,
        time: formattedTime,
        txnId: d.txnId
      };
    });

    res.status(200).json({
      status: 'success',
      data: formattedHistory
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get recent donors for a campaign
exports.getRecentDonors = async (req, res) => {
  try {
    const { id } = req.params;
    const donations = await Donation.find({ campaign: id, status: 'Approved' })
      .populate('user', 'name avatar')
      .sort({ date: -1 })
      .limit(10);
      
    const formattedDonors = donations.map(d => {
      const uName = d.user ? d.user.name : 'Anonymous';
      const uInitials = uName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
      return {
        id: d._id,
        name: uName,
        amount: d.amount,
        date: d.date.toISOString(),
        initials: uInitials,
        avatar: d.user ? d.user.avatar : ''
      };
    });

    res.status(200).json({
      status: 'success',
      data: formattedDonors
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create a new donation
exports.createDonation = async (req, res) => {
  try {
    const { purposeId, amount, type } = req.body;

    const campaign = await Campaign.findById(purposeId);
    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }

    // Security: ensure member is donating to their own community's campaign
    if (req.communityId && campaign.communityId) {
      const campaignCommunityId = campaign.communityId._id ?? campaign.communityId;
      if (!campaignCommunityId.equals(req.communityId)) {
        return res.status(403).json({ status: 'error', message: 'Cannot donate to a campaign outside your community' });
      }
    }

    const txnId = `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const donation = new Donation({
      user: req.user._id,
      campaign: purposeId,
      /**
       * communityId is inherited from the campaign's community.
       * This ensures all donations are community-scoped correctly.
       */
      communityId: campaign.communityId || req.communityId,
      amount: Number(amount),
      type: type || 'One-time',
      txnId,
      paymentMode: type === 'One-time' ? 'Online (UPI)' : 'Bank Transfer',
      status: 'Approved'
    });

    await donation.save();

    // Update campaign raised amount
    campaign.collectedAmount += Number(amount);
    await campaign.save();

    const dDate = new Date(donation.date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${dDate.getDate()} ${months[dDate.getMonth()]} ${dDate.getFullYear()}`;
    const formattedTime = dDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    res.status(201).json({
      status: 'success',
      data: {
        id: donation._id,
        purposeId: campaign._id,
        purposeTitle: campaign.title,
        amount: donation.amount,
        type: donation.type,
        date: formattedDate,
        time: formattedTime,
        txnId: donation.txnId
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get stats and top donors
exports.getStats = async (req, res) => {
  try {
    // Basic stats aggregation
    const donationsCount = await Donation.countDocuments();
    const uniqueDonorsList = await Donation.distinct('user');
    const totalDonors = uniqueDonorsList.length;
    
    const amountAggr = await Donation.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$amount" } } }]);
    const totalDonatedAmount = amountAggr.length > 0 ? amountAggr[0].totalAmount : 0;
    
    const completedPurposes = await Campaign.countDocuments({ status: 'Completed' });

    // Ensure we format large numbers nicely if needed, but for now we'll just send raw or slightly formatted
    const impactStats = [
      { id: "st1", label: "Total Contributors", value: `${totalDonors}+` },
      { id: "st2", label: "Total Donated Amount", value: `₹${totalDonatedAmount.toLocaleString()}+` },
      { id: "st3", label: "Completed Purposes", value: `${completedPurposes}+` },
      { id: "st4", label: "People Benefited", value: "5000+" } // Static for now as it's hard to track dynamic
    ];

    // Fetch top 5 recent/highest donors for topDonors section
    // In mock, it's just top donors
    const topDonations = await Donation.find({ status: 'Approved' })
      .sort({ amount: -1 })
      .limit(5)
      .populate('user', 'name avatar')
      .populate('campaign', 'title');

    const topDonors = topDonations.map((d, index) => {
      const uName = d.user ? d.user.name : 'Anonymous';
      const uInitials = uName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
      const dDate = new Date(d.date);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      return {
        id: `td_${d._id}`,
        name: uName,
        amount: d.amount,
        initials: uInitials,
        purpose: d.campaign ? d.campaign.title : 'General',
        date: `${dDate.getDate()} ${months[dDate.getMonth()]} ${dDate.getFullYear()}, ${dDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        paymentMode: d.paymentMode,
        avatar: d.user ? d.user.avatar : ''
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        impactStats,
        topDonors
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
