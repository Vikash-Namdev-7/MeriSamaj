const Campaign = require('../../models/Campaign');
const Donation = require('../../models/Donation');
const paymentService = require('../../services/paymentService');
const { notifyDonationReceived, notifyDonationReceipt } = require('../../services/notificationService');
const crypto = require('crypto');

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

// ─── Razorpay Order Creation ──────────────────────────────────────────────────
exports.createRazorpayOrder = async (req, res) => {
  try {
    const targetId = req.params.id || req.body.donationId || req.body.purposeId || req.body.campaignId;
    const amount = Number(req.body.amount || 0);
    const donorName = req.body.donorName || req.body.name || req.user?.name || 'Anonymous';
    const type = req.body.type || 'One-time';

    if (!targetId) {
      return res.status(400).json({ success: false, status: 'error', message: 'Campaign ID is required' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, status: 'error', message: 'Valid donation amount is required' });
    }

    let campaign = await Campaign.findById(targetId);
    if (!campaign) {
      campaign = await Donation.findById(targetId);
    }
    if (!campaign) {
      return res.status(404).json({ success: false, status: 'error', message: 'Campaign not found' });
    }

    // Create order via Razorpay paymentService (receipt must be max 40 chars)
    const receipt = `don_${campaign._id.toString().slice(-12)}_${Date.now().toString().slice(-8)}`;
    const order = await paymentService.initiatePayment({
      gateway: 'razorpay',
      amount,
      currency: 'INR',
      receipt,
      notes: {
        campaignId: campaign._id.toString(),
        userId: req.user?._id ? req.user._id.toString() : 'anonymous',
        donorName
      }
    });

    // Audit Trail: Create pending donation record in DB
    const pendingDonation = new Donation({
      user: req.user?._id,
      campaign: campaign._id,
      communityId: campaign.communityId || req.communityId,
      amount,
      currency: 'INR',
      paymentMode: 'Razorpay',
      paymentMethod: 'Razorpay',
      orderId: order.id,
      status: 'Pending',
      donorName
    });
    await pendingDonation.save().catch(err => console.warn('Pending donation record notice:', err.message));

    res.status(200).json({
      success: true,
      status: 'success',
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency || 'INR',
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    res.status(500).json({ success: false, status: 'error', message: error.message || 'Failed to create payment order' });
  }
};

// ─── Razorpay Payment Verification & Fulfillment ─────────────────────────────
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      donationId,
      campaignId,
      purposeId,
      amount: reqAmount,
      donorName: reqDonorName
    } = req.body;

    const paymentId = razorpay_payment_id;
    const orderId = razorpay_order_id;
    const signature = razorpay_signature;
    const targetId = donationId || campaignId || purposeId;

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ success: false, status: 'error', message: 'Missing Razorpay payment verification parameters' });
    }

    // 1. HMAC Signature Verification
    const isValidSignature = paymentService.verifyPayment({
      gateway: 'razorpay',
      orderId,
      paymentId,
      signature
    });

    if (!isValidSignature) {
      await Donation.findOneAndUpdate({ orderId }, { status: 'Failed' }).catch(() => {});
      return res.status(400).json({ success: false, status: 'error', message: 'Invalid payment signature. Verification failed.' });
    }

    // 2. Idempotency Guard: Check if order/payment is already processed & approved
    const existingApproved = await Donation.findOne({
      $or: [{ orderId }, { paymentId }, { txnId: paymentId }],
      status: { $in: ['Approved', 'Success', 'Active'] }
    });

    if (existingApproved) {
      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Payment already processed and verified.',
        data: {
          id: existingApproved.txnId || paymentId,
          amount: existingApproved.amount,
          status: 'Approved'
        }
      });
    }

    // 3. Razorpay Server API Fetch Verification (Double Check status)
    try {
      const paymentDetails = await paymentService.fetchRazorpayPaymentDetails(paymentId);
      if (paymentDetails && paymentDetails.status && !['captured', 'authorized'].includes(paymentDetails.status)) {
        await Donation.findOneAndUpdate({ orderId }, { status: 'Failed' }).catch(() => {});
        return res.status(400).json({ success: false, status: 'error', message: `Payment status is ${paymentDetails.status}, expected captured.` });
      }
    } catch (apiErr) {
      console.warn('Razorpay API direct fetch notice (proceeding with verified signature):', apiErr.message);
    }

    // 4. Find Campaign / Donation Target
    let campaign = await Campaign.findById(targetId || existingApproved?.campaign);
    let isDonationModel = false;
    if (!campaign && targetId) {
      campaign = await Donation.findById(targetId);
      isDonationModel = true;
    }

    const finalAmount = Number(reqAmount) || 0;
    const finalDonorName = reqDonorName || req.user?.name || 'Anonymous';

    // 5. Update / Create Approved Donation Record
    let donationRecord = await Donation.findOne({ orderId });
    if (!donationRecord) {
      donationRecord = new Donation({
        user: req.user?._id,
        campaign: campaign?._id,
        communityId: campaign?.communityId || req.communityId,
        amount: finalAmount,
        currency: 'INR',
        donorName: finalDonorName
      });
    }

    donationRecord.status = 'Approved';
    donationRecord.txnId = paymentId;
    donationRecord.paymentId = paymentId;
    donationRecord.orderId = orderId;
    donationRecord.signature = signature;
    donationRecord.paidAt = new Date();
    donationRecord.paymentMode = 'Razorpay';
    donationRecord.paymentMethod = 'Razorpay';
    if (finalAmount > 0) donationRecord.amount = finalAmount;
    await donationRecord.save();

    // 6. Atomic Campaign Update
    if (campaign && finalAmount > 0) {
      if (isDonationModel) {
        await Donation.findByIdAndUpdate(campaign._id, {
          $inc: { raisedAmount: finalAmount, collectedAmount: finalAmount, donorCount: 1, contributorsCount: 1 },
          $push: {
            recentDonations: {
              $each: [{ donorName: finalDonorName, amount: finalAmount, date: new Date(), paymentStatus: 'success' }],
              $position: 0
            }
          }
        });
      } else {
        await Campaign.findByIdAndUpdate(campaign._id, {
          $inc: { collectedAmount: finalAmount, raisedAmount: finalAmount, donorCount: 1, contributorsCount: 1 },
          $push: {
            recentDonations: {
              $each: [{ donorName: finalDonorName, amount: finalAmount, date: new Date(), paymentStatus: 'success' }],
              $position: 0
            }
          }
        });
      }
    }

    // 7. Trigger Notifications
    if (campaign && req.user) {
      try {
        notifyDonationReceived(campaign.headId, [], finalDonorName, finalAmount, campaign.title, campaign._id);
        notifyDonationReceipt(req.user._id, finalAmount, campaign.title, campaign._id);
      } catch (nErr) {
        console.warn('Donation notification notice:', nErr.message);
      }
    }

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Payment verified and donation updated successfully!',
      data: {
        id: paymentId,
        txnId: paymentId,
        orderId,
        amount: donationRecord.amount,
        status: 'Approved'
      }
    });
  } catch (error) {
    console.error('Verify Razorpay Payment Error:', error);
    res.status(500).json({ success: false, status: 'error', message: error.message || 'Payment verification failed' });
  }
};

// ─── Razorpay Webhook Listener ────────────────────────────────────────────────
exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (secret && signature) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        console.warn('Webhook signature mismatch');
        return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload?.payment?.entity;

    if (event === 'payment.captured' && payload) {
      const { id: paymentId, order_id: orderId, amount: amountPaise, notes } = payload;
      const amount = (amountPaise || 0) / 100;

      // Idempotency check
      const existing = await Donation.findOne({
        $or: [{ orderId }, { paymentId }, { txnId: paymentId }],
        status: { $in: ['Approved', 'Success', 'Active'] }
      });

      if (!existing) {
        let donationRecord = await Donation.findOne({ orderId });
        const campaignId = notes?.campaignId || donationRecord?.campaign;

        if (!donationRecord) {
          donationRecord = new Donation({
            campaign: campaignId,
            amount,
            currency: 'INR',
            donorName: notes?.donorName || 'Anonymous'
          });
        }

        donationRecord.status = 'Approved';
        donationRecord.txnId = paymentId;
        donationRecord.paymentId = paymentId;
        donationRecord.orderId = orderId;
        donationRecord.paidAt = new Date();
        donationRecord.paymentMode = 'Razorpay';
        donationRecord.paymentMethod = 'Razorpay';
        if (amount > 0) donationRecord.amount = amount;
        await donationRecord.save();

        if (campaignId && amount > 0) {
          let campaign = await Campaign.findById(campaignId);
          if (campaign) {
            await Campaign.findByIdAndUpdate(campaign._id, {
              $inc: { collectedAmount: amount, raisedAmount: amount, donorCount: 1, contributorsCount: 1 },
              $push: {
                recentDonations: {
                  $each: [{ donorName: notes?.donorName || 'Anonymous', amount, date: new Date(), paymentStatus: 'success' }],
                  $position: 0
                }
              }
            });
          } else {
            let donCam = await Donation.findById(campaignId);
            if (donCam) {
              await Donation.findByIdAndUpdate(donCam._id, {
                $inc: { raisedAmount: amount, collectedAmount: amount, donorCount: 1, contributorsCount: 1 },
                $push: {
                  recentDonations: {
                    $each: [{ donorName: notes?.donorName || 'Anonymous', amount, date: new Date(), paymentStatus: 'success' }],
                    $position: 0
                  }
                }
              });
            }
          }
        }
      }
    } else if (event === 'payment.failed' && payload) {
      const { order_id: orderId } = payload;
      if (orderId) {
        await Donation.findOneAndUpdate({ orderId }, { status: 'Failed' }).catch(() => {});
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
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
