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
        { communityId: { $exists: false } },
        { isGlobal: true },
        { visibility: 'GLOBAL' },
        { visibility: 'Entire Community' },
        { visibility: 'COMMUNITY' }
      ];
    } else if (req.user?.role === 'admin' && req.query.communityId) {
      filter.communityId = req.query.communityId;
    }

    const [campaignDocs, donationDocs] = await Promise.all([
      Campaign.find(filter).sort({ createdAt: -1 }).lean().catch(() => []),
      Donation.find({ ...filter, title: { $exists: true, $ne: '' } }).sort({ createdAt: -1 }).lean().catch(() => [])
    ]);

    const formattedCampaigns = [
      ...donationDocs.map(d => {
        const rAmount = d.raisedAmount || 0;
        const tAmount = d.targetAmount || 0;
        const dCount = d.donorCount || (Array.isArray(d.recentDonations) ? d.recentDonations.length : 0);
        return {
          id: d._id,
          _id: d._id,
          title: d.title,
          titleEn: d.title,
          raised: rAmount,
          raisedAmount: rAmount,
          collectedAmount: rAmount,
          target: tAmount,
          targetAmount: tAmount,
          donorCount: dCount,
          recentDonations: d.recentDonations || [],
          percentage: tAmount > 0 ? Math.min(Math.round((rAmount / tAmount) * 100), 100) : 0,
          desc: d.description || '',
          description: d.description || '',
          city: d.city || 'Indore',
          category: d.category || 'General',
          visibility: 'Entire Community',
          status: d.status || 'Active',
          bannerImage: d.coverImage || null,
          coverImage: d.coverImage || null,
          startDate: d.createdAt,
          endDate: null
        };
      }),
      ...campaignDocs.map(c => {
        const rAmount = c.collectedAmount || c.raisedAmount || 0;
        const tAmount = c.targetAmount || 0;
        const dCount = c.donorCount || (Array.isArray(c.recentDonations) ? c.recentDonations.length : 0);
        return {
          id: c._id,
          _id: c._id,
          title: c.title,
          titleEn: c.title,
          raised: rAmount,
          raisedAmount: rAmount,
          collectedAmount: rAmount,
          target: tAmount,
          targetAmount: tAmount,
          donorCount: dCount,
          recentDonations: c.recentDonations || [],
          percentage: tAmount > 0 ? Math.min(Math.round((rAmount / tAmount) * 100), 100) : 0,
          desc: c.description || c.shortDescription || '',
          description: c.description || c.shortDescription || '',
          city: c.city || 'Indore',
          category: c.category || 'General',
          visibility: c.visibility || 'Entire Community',
          status: c.status || 'Active',
          bannerImage: c.bannerImage || null,
          coverImage: c.bannerImage || null,
          startDate: c.startDate,
          endDate: c.endDate
        };
      })
    ];

    res.status(200).json({ success: true, status: 'success', data: formattedCampaigns });
  } catch (error) {
    console.error('Get Member Campaigns Error:', error);
    res.status(500).json({ success: false, status: 'error', message: error.message });
  }
};

// Get single campaign details
exports.getCampaignById = async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      campaign = await Donation.findById(req.params.id);
    }
    if (!campaign) {
      return res.status(404).json({ success: false, status: 'error', message: 'Campaign not found' });
    }

    // Community Isolation Guard
    if (req.communityId && campaign.communityId) {
      const campaignCommunityId = campaign.communityId._id ?? campaign.communityId;
      if (!campaignCommunityId.equals(req.communityId)) {
        return res.status(403).json({ success: false, status: 'error', message: 'Access denied. You cannot view a campaign of another community.' });
      }
    }

    const raised = campaign.raisedAmount || campaign.collectedAmount || 0;
    const target = campaign.targetAmount || 0;
    const donorCount = campaign.donorCount || (Array.isArray(campaign.recentDonations) ? campaign.recentDonations.length : 0);

    const formattedCampaign = {
      id: campaign._id,
      _id: campaign._id,
      title: campaign.title,
      raised,
      raisedAmount: raised,
      collectedAmount: raised,
      target,
      targetAmount: target,
      donorCount,
      recentDonations: campaign.recentDonations || [],
      percentage: target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0,
      desc: campaign.description || campaign.shortDescription || '',
      city: campaign.city || 'Indore',
      bannerImage: campaign.bannerImage || campaign.coverImage || null,
      coverImage: campaign.coverImage || campaign.bannerImage || null,
      category: campaign.category || 'General',
      status: campaign.status || 'Active',
      description: campaign.description || campaign.shortDescription || ''
    };

    res.status(200).json({
      success: true,
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

// Create a new donation (Member monetary contribution)
exports.createDonation = async (req, res) => {
  try {
    const targetId = req.params.id || req.body.purposeId || req.body.campaignId;
    const amount = Number(req.body.amount || 0);
    const type = req.body.type || 'One-time';
    const donorName = req.body.name || req.user?.name || 'Anonymous';

    if (!targetId) {
      return res.status(400).json({ success: false, status: 'error', message: 'Campaign ID is required' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, status: 'error', message: 'Valid donation amount is required' });
    }

    let campaign = await Campaign.findById(targetId);
    let isDonationModel = false;
    if (!campaign) {
      campaign = await Donation.findById(targetId);
      isDonationModel = true;
    }

    if (!campaign) {
      return res.status(404).json({ success: false, status: 'error', message: 'Campaign not found' });
    }

    // Community Isolation Guard
    if (req.communityId && campaign.communityId) {
      const c1 = (campaign.communityId._id || campaign.communityId).toString();
      const c2 = (req.communityId._id || req.communityId).toString();
      if (c1 !== c2 && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, status: 'error', message: 'Cannot donate to a campaign outside your community' });
      }
    }

    const txnId = req.body.txnId || `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    // Save individual payment record in DB
    const paymentRecord = new Donation({
      user: req.user._id,
      campaign: campaign._id,
      communityId: campaign.communityId || req.communityId,
      amount,
      paymentMode: type === 'One-time' ? 'Online (UPI)' : 'Bank Transfer',
      txnId,
      status: 'Active'
    });
    await paymentRecord.save().catch((err) => console.warn('Payment record save notice:', err.message));

    // Update target campaign collected amount and donor count
    if (isDonationModel) {
      campaign.raisedAmount = (campaign.raisedAmount || 0) + amount;
      campaign.donorCount = (campaign.donorCount || 0) + 1;
      if (!Array.isArray(campaign.recentDonations)) {
        campaign.recentDonations = [];
      }
      campaign.recentDonations.unshift({
        donorName,
        amount,
        date: new Date(),
        paymentStatus: 'success'
      });
      await campaign.save();
    } else {
      campaign.collectedAmount = (campaign.collectedAmount || 0) + amount;
      await campaign.save();
    }

    const dDate = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${dDate.getDate()} ${months[dDate.getMonth()]} ${dDate.getFullYear()}`;
    const formattedTime = dDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    res.status(201).json({
      success: true,
      status: 'success',
      message: 'Thank you! Your donation was processed successfully.',
      data: {
        id: txnId,
        purposeId: campaign._id,
        purposeTitle: campaign.title,
        amount,
        type,
        date: formattedDate,
        time: formattedTime,
        txnId
      }
    });
  } catch (error) {
    console.error('Create Donation Error:', error);
    res.status(500).json({ success: false, status: 'error', message: error.message });
  }
};

// Get stats and top donors
exports.getStats = async (req, res) => {
  try {
    const uniqueDonorsList = await Donation.distinct('user');
    const totalDonors = uniqueDonorsList.filter(Boolean).length;

    const amountAggr = await Donation.aggregate([
      { $match: { amount: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    const totalDonatedAmount = amountAggr.length > 0 ? (amountAggr[0].totalAmount || 0) : 0;

    const completedPurposes = await Campaign.countDocuments({ status: 'Completed' });

    const impactStats = [
      { id: "st1", label: "Total Contributors", value: `${totalDonors || 0}+` },
      { id: "st2", label: "Total Donated Amount", value: `₹${totalDonatedAmount.toLocaleString('en-IN')}+` },
      { id: "st3", label: "Completed Purposes", value: `${completedPurposes || 0}+` },
      { id: "st4", label: "People Benefited", value: "5000+" }
    ];

    // Fetch top 5 approved individual donations
    let topDonations = await Donation.find({ amount: { $exists: true, $gt: 0 } })
      .sort({ amount: -1 })
      .limit(5)
      .populate('user', 'name avatar')
      .populate('campaign', 'title')
      .lean();

    let topDonors = [];
    if (topDonations.length > 0) {
      topDonors = topDonations.map((d) => {
        const uName = d.user ? d.user.name : (d.donorName || 'Anonymous');
        const uInitials = uName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const dDate = new Date(d.createdAt || d.date || Date.now());
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return {
          id: `td_${d._id}`,
          name: uName,
          amount: d.amount,
          initials: uInitials,
          purpose: d.campaign ? d.campaign.title : (d.purpose || 'General Relief'),
          date: `${dDate.getDate()} ${months[dDate.getMonth()]} ${dDate.getFullYear()}`,
          paymentMode: d.paymentMode || 'Online (UPI)',
          avatar: d.user ? d.user.avatar : ''
        };
      });
    } else {
      // Fallback: extract recentDonations from Donation campaigns
      const campaigns = await Donation.find({ 'recentDonations.0': { $exists: true } }).lean();
      const allRecent = [];
      campaigns.forEach(c => {
        (c.recentDonations || []).forEach(rd => {
          allRecent.push({
            id: `rd_${rd._id || Math.random()}`,
            name: rd.donorName || 'Anonymous',
            amount: rd.amount || 0,
            initials: (rd.donorName || 'A').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            purpose: c.title || 'General Relief',
            date: new Date(rd.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            paymentMode: 'Online (UPI)',
            avatar: ''
          });
        });
      });
      topDonors = allRecent.sort((a, b) => b.amount - a.amount).slice(0, 5);
    }

    res.status(200).json({
      success: true,
      status: 'success',
      data: {
        impactStats,
        topDonors
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ success: false, status: 'error', message: error.message });
  }
};
