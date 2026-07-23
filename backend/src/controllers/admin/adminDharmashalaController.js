const Dharmashala = require('../../models/Dharmashala');
const DharmashalaRoom = require('../../models/DharmashalaRoom');
const DharmashalaBooking = require('../../models/DharmashalaBooking');
const Community = require('../../models/Community');

// @desc    Get all Dharmashalas across ALL communities (Admin Global View)
// @route   GET /api/v1/admin/dharmashala/properties
// @access  Private (Admin)
exports.getAllGlobalDharmashalas = async (req, res) => {
  try {
    const { search, communityId, city, status } = req.query;
    const filter = {};

    if (communityId && communityId !== 'all') {
      filter.communityId = communityId;
    }

    if (city && city !== 'all') {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    const properties = await Dharmashala.find(filter)
      .populate('communityId', 'name city state')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ status: 'success', data: properties });
  } catch (error) {
    console.error('getAllGlobalDharmashalas error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get system-wide Dharmashala analytics & stats
// @route   GET /api/v1/admin/dharmashala/analytics
// @access  Private (Admin)
exports.getGlobalDharmashalaAnalytics = async (req, res) => {
  try {
    const totalProperties = await Dharmashala.countDocuments();
    const activeProperties = await Dharmashala.countDocuments({ status: 'Active' });
    const totalRooms = await DharmashalaRoom.countDocuments();
    const totalBookings = await DharmashalaBooking.countDocuments();
    const confirmedBookings = await DharmashalaBooking.countDocuments({ 
      status: { $in: ['approved', 'confirmed', 'upcoming', 'checked_in', 'checked_out', 'completed'] } 
    });
    
    // Revenue calculations
    const paidBookings = await DharmashalaBooking.find({ paymentStatus: 'Paid' }).lean();
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // City-wise property aggregation
    const cityAgg = await Dharmashala.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalProperties,
        activeProperties,
        totalRooms,
        totalBookings,
        confirmedBookings,
        totalRevenue,
        cityStats: cityAgg.map(c => ({ city: c._id || 'Unknown', count: c.count }))
      }
    });
  } catch (error) {
    console.error('getGlobalDharmashalaAnalytics error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all bookings across ALL communities
// @route   GET /api/v1/admin/dharmashala/bookings
// @access  Private (Admin)
exports.getGlobalBookings = async (req, res) => {
  try {
    const { status, communityId, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (communityId && communityId !== 'all') {
      filter.communityId = communityId;
    }

    if (search) {
      filter.$or = [
        { bookedBy: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await DharmashalaBooking.find(filter)
      .populate('dharmashala', 'name city address communityId')
      .populate('user', 'name phone email')
      .populate('rooms')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ status: 'success', data: bookings });
  } catch (error) {
    console.error('getGlobalBookings error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Admin Emergency Override booking status (Approve, Reject, Cancel, Force Confirm)
// @route   PATCH /api/v1/admin/dharmashala/bookings/:id/override
// @access  Private (Admin)
exports.adminOverrideBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, paymentStatus } = req.body;

    let booking = await DharmashalaBooking.findById(id);
    if (!booking) {
      booking = await DharmashalaBooking.findOne({ bookingId: id });
    }
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    booking.status = status;
    if (remarks) booking.remarks = `[Admin Override] ${remarks}`;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    if (status === 'confirmed' || status === 'upcoming') {
      booking.paymentStatus = 'Paid';
      booking.paidAt = booking.paidAt || new Date();
      booking.qrCodeData = booking.qrCodeData || `DH-QR-${booking.bookingId}-${Date.now().toString().slice(-6)}`;
    } else if (status === 'cancelled') {
      booking.cancelledBy = req.user._id;
      booking.cancelledAt = new Date();
      if (booking.paymentStatus === 'Paid') {
        booking.paymentStatus = 'Refunded';
        booking.refundAmount = booking.totalAmount;
        booking.refundedAt = new Date();
      }
    }

    booking.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: `Master Admin (${req.user?.name || 'Admin'})`
    });

    await booking.save();

    // Broadcast socket
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('dharmashala:booking_status_updated', { bookingId: booking._id, status, adminOverride: true });
      }
    } catch (e) {}

    res.status(200).json({ status: 'success', message: 'Admin override applied successfully', data: booking });
  } catch (error) {
    console.error('adminOverrideBookingStatus error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Enable or Disable property globally
// @route   PATCH /api/v1/admin/dharmashala/properties/:id/toggle-status
// @access  Private (Admin)
exports.toggleDharmashalaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Dharmashala.findById(id);
    if (!property) {
      return res.status(404).json({ status: 'error', message: 'Dharmashala property not found' });
    }

    property.status = property.status === 'Active' ? 'Inactive' : 'Active';
    await property.save();

    // If set to Inactive, reject pending approval bookings automatically
    if (property.status === 'Inactive') {
      await DharmashalaBooking.updateMany(
        { dharmashala: id, status: 'pending_approval' },
        { status: 'rejected', rejectionReason: 'Property disabled by Administrator' }
      );
    }

    res.status(200).json({ status: 'success', message: `Property status updated to ${property.status}`, data: property });
  } catch (error) {
    console.error('toggleDharmashalaStatus error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
