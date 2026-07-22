const Donation = require('../models/Donation');
const User = require('../models/User');
const { handleDonationPayment } = require('../utils/paymentHandler');
const { notifyDonationReceived, notifyDonationReceipt } = require('../services/notificationService');

// GET /member/donations — Server-side filtered to status: "Active", isDeleted: false
exports.getActiveDonations = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {
      status: 'Active',
      isDeleted: false
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.title = new RegExp(search.trim(), 'i');
    }

    const donations = await Donation.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /member/donations/:id — Get single donation details (isDeleted: false)
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, isDeleted: false });

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation campaign not found' });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /member/donations/:id/donate — Donate to campaign
exports.donate = async (req, res) => {
  try {
    const { amount, donorName } = req.body;
    const donationId = req.params.id;

    const donation = await Donation.findOne({ _id: donationId, status: 'Active', isDeleted: false });

    if (!donation) {
      return res.status(400).json({ success: false, message: 'Donation campaign is closed or inactive' });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid donation amount' });
    }

    const name = donorName && donorName.trim() ? donorName.trim() : (req.user?.name || 'Anonymous');

    // Trigger payment handler pipeline
    const paymentResult = await handleDonationPayment(donationId, parsedAmount, { donorName: name, userId: req.user?._id });

    // Atomically update raisedAmount, donorCount, and push to recentDonations
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      {
        $inc: { raisedAmount: parsedAmount, donorCount: 1 },
        $push: {
          recentDonations: {
            $each: [{
              donorName: name,
              amount: parsedAmount,
              date: new Date(),
              paymentStatus: paymentResult.paymentStatus || 'success'
            }],
            $position: 0,
            $slice: 50 // Keep top 50 recent donors
          }
        }
      },
      { new: true }
    );

    // ── Non-critical notifications ──────────────────────────────────────────
    try {
      // Find the community head (if this campaign belongs to a community)
      // The simple Donation model doesn't store communityId, so we skip head lookup
      // and notify only admins + the donor.
      const adminIds = await User.find({ role: 'admin' }).distinct('_id');
      await notifyDonationReceived(
        null,       // headId — not available from this model; override below if needed
        adminIds,
        name,
        parsedAmount,
        updatedDonation.title,
        updatedDonation._id
      );
      if (req.user?._id) {
        await notifyDonationReceipt(req.user._id, parsedAmount, updatedDonation.title, updatedDonation._id);
      }
    } catch (notifyErr) {
      console.warn('[Notify] Donation notifications failed:', notifyErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Donation processed successfully',
      payment: paymentResult,
      data: updatedDonation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
