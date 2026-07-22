const Donation = require('../models/Donation');

// GET /admin/donations — List all donations
exports.getAllDonations = async (req, res) => {
  try {
    const { includeDeleted, status, category } = req.query;
    const filter = {};

    if (includeDeleted !== 'true') {
      filter.isDeleted = false;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
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

// POST /admin/donations — Create new donation campaign
exports.createDonation = async (req, res) => {
  try {
    const { title, description, targetAmount, category, coverImage, status } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ success: false, message: 'Title and target amount are required' });
    }

    const donation = new Donation({
      title,
      description,
      targetAmount: Number(targetAmount),
      category: category || 'General',
      coverImage: coverImage || '',
      status: status || 'Active',
      raisedAmount: 0,
      donorCount: 0,
      recentDonations: []
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: donation
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /admin/donations/:id — Update donation fields (stripping raisedAmount, donorCount, recentDonations)
exports.updateDonation = async (req, res) => {
  try {
    const updatePayload = { ...req.body };

    // Explicitly strip fields that must only be updated via member donations
    delete updatePayload.raisedAmount;
    delete updatePayload.donorCount;
    delete updatePayload.recentDonations;
    delete updatePayload.isDeleted;

    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: donation
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /admin/donations/:id/close — Close donation (status: "Closed")
exports.closeDonation = async (req, res) => {
  try {
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { status: 'Closed' } },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation closed successfully',
      data: donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /admin/donations/:id — Soft delete donation (isDeleted: true)
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully',
      data: donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
