const Dharmashala = require('../../models/Dharmashala');
const DharmashalaRoom = require('../../models/DharmashalaRoom');
const DharmashalaBooking = require('../../models/DharmashalaBooking');
const DharmashalaMaintenance = require('../../models/DharmashalaMaintenance');

// Helper to check user's community
const getCommunity = (req) => {
  return req.user?.community || 'Agrawal Samaj';
};

// 1. Dashboard Analytics Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const community = getCommunity(req);
    
    // Find all Dharmashalas in community
    const properties = await Dharmashala.find({ community });
    const propertyIds = properties.map(p => p._id);
    
    const totalDharmashalas = properties.length;
    const activeDharmashalas = properties.filter(p => p.status === 'Active').length;
    
    // Room Inventory Stats
    const rooms = await DharmashalaRoom.find({ dharmashala: { $in: propertyIds } });
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;
    const occupiedRooms = rooms.filter(r => r.status === 'Booked' || r.status === 'Occupied').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
    const blockedRooms = rooms.filter(r => r.status === 'Blocked').length;
    
    // Booking count stats
    const bookings = await DharmashalaBooking.find({ dharmashala: { $in: propertyIds } });
    
    const pendingRequests = bookings.filter(b => b.status === 'pending_approval').length;
    const confirmedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'upcoming').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Today check-ins/outs
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);
    
    const todayCheckIns = bookings.filter(b => 
      b.checkIn >= todayStart && b.checkIn <= todayEnd && 
      ['approved', 'pending_approval', 'checked_in'].includes(b.status)
    ).length;
    
    const todayCheckOuts = bookings.filter(b => 
      b.checkOut >= todayStart && b.checkOut <= todayEnd && 
      ['checked_in', 'checked_out', 'completed'].includes(b.status)
    ).length;
    
    const currentGuests = bookings.filter(b => b.status === 'checked_in').length;
    
    const upcomingCheckIns = bookings.filter(b => b.checkIn > todayEnd && b.status === 'approved').length;
    
    // Occupancy Rate
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    
    // Revenue calculations (current month)
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyBookings = bookings.filter(b => b.createdAt >= currentMonthStart);
    const monthlyRevenue = monthlyBookings
      .filter(b => b.paymentStatus === 'Paid' || ['checked_in', 'checked_out', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
    // Find most booked property
    const bookingCounts = {};
    bookings.forEach(b => {
      bookingCounts[b.dharmashala.toString()] = (bookingCounts[b.dharmashala.toString()] || 0) + 1;
    });
    let mostBookedId = null;
    let maxCount = 0;
    Object.keys(bookingCounts).forEach(id => {
      if (bookingCounts[id] > maxCount) {
        maxCount = bookingCounts[id];
        mostBookedId = id;
      }
    });
    const mostBookedProp = mostBookedId ? properties.find(p => p._id.toString() === mostBookedId) : null;
    const mostBookedDharmashala = mostBookedProp ? mostBookedProp.name : 'N/A';

    res.status(200).json({
      status: 'success',
      data: {
        totalDharmashalas,
        activeDharmashalas,
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        blockedRooms,
        pendingRequests,
        confirmedBookings,
        cancelledBookings,
        todayCheckIns,
        todayCheckOuts,
        currentGuests,
        upcomingCheckIns,
        occupancyRate,
        monthlyRevenue,
        mostBookedDharmashala
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. CRUD Properties
exports.getProperties = async (req, res) => {
  try {
    const community = getCommunity(req);
    const properties = await Dharmashala.find({ community }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: properties });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const community = getCommunity(req);
    
    // Parse amenities list if passed as stringified JSON array
    let amenities = req.body.amenities;
    if (typeof amenities === 'string') {
      try { amenities = JSON.parse(amenities); } catch (e) { amenities = []; }
    }
    
    // Retrieve cover photo and galleries files
    let image = req.body.image || '';
    let galleryImages = [];
    
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        image = req.files.image[0].path;
      }
      if (req.files.galleryImages) {
        galleryImages = req.files.galleryImages.map(file => file.path);
      }
    }
    
    const property = new Dharmashala({
      ...req.body,
      community,
      amenities,
      image,
      galleryImages
    });
    
    await property.save();
    res.status(201).json({ status: 'success', data: property });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (typeof updateData.amenities === 'string') {
      try { updateData.amenities = JSON.parse(updateData.amenities); } catch (e) { updateData.amenities = []; }
    }
    
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        updateData.image = req.files.image[0].path;
      }
      if (req.files.galleryImages) {
        const newGallery = req.files.galleryImages.map(file => file.path);
        // Append or replace? Let's replace or add based on design
        updateData.galleryImages = newGallery;
      }
    }
    
    const property = await Dharmashala.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!property) return res.status(404).json({ status: 'error', message: 'Property not found' });
    
    res.status(200).json({ status: 'success', data: property });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Dharmashala.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ status: 'error', message: 'Property not found' });
    
    // Cascade delete rooms and bookings
    await DharmashalaRoom.deleteMany({ dharmashala: req.params.id });
    await DharmashalaBooking.deleteMany({ dharmashala: req.params.id });
    
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. CRUD Rooms
exports.getDharmashalaRooms = async (req, res) => {
  try {
    const rooms = await DharmashalaRoom.find({ dharmashala: req.params.id });
    res.status(200).json({ status: 'success', data: rooms });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { dharmashala } = req.body;
    
    // Handle image file arrays
    let images = [];
    if (req.files && req.files.images) {
      images = req.files.images.map(file => file.path);
    }
    
    const room = new DharmashalaRoom({
      ...req.body,
      images
    });
    
    await room.save();
    
    // Update property counts
    const dharamshalaDoc = await Dharmashala.findById(dharmashala);
    if (dharamshalaDoc) {
      dharamshalaDoc.totalRooms += 1;
      if (room.isAc) dharamshalaDoc.acRooms += 1;
      else dharamshalaDoc.generalRooms += 1;
      await dharamshalaDoc.save();
    }
    
    res.status(201).json({ status: 'success', data: room });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.files && req.files.images) {
      updateData.images = req.files.images.map(file => file.path);
    }
    
    const oldRoom = await DharmashalaRoom.findById(req.params.roomId);
    if (!oldRoom) return res.status(404).json({ status: 'error', message: 'Room not found' });
    
    const room = await DharmashalaRoom.findByIdAndUpdate(req.params.roomId, updateData, { new: true });
    
    // Adjust total/ac counts if categories changed
    if (oldRoom.isAc !== room.isAc) {
      const dhDoc = await Dharmashala.findById(room.dharmashala);
      if (dhDoc) {
        if (room.isAc) {
          dhDoc.acRooms += 1;
          dhDoc.generalRooms -= 1;
        } else {
          dhDoc.acRooms -= 1;
          dhDoc.generalRooms += 1;
        }
        await dhDoc.save();
      }
    }
    
    res.status(200).json({ status: 'success', data: room });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await DharmashalaRoom.findByIdAndDelete(req.params.roomId);
    if (!room) return res.status(404).json({ status: 'error', message: 'Room not found' });
    
    // Adjust counts
    const dhDoc = await Dharmashala.findById(room.dharmashala);
    if (dhDoc) {
      dhDoc.totalRooms -= 1;
      if (room.isAc) dhDoc.acRooms -= 1;
      else dhDoc.generalRooms -= 1;
      await dhDoc.save();
    }
    
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. Bookings Management
exports.getAllBookings = async (req, res) => {
  try {
    const community = getCommunity(req);
    const properties = await Dharmashala.find({ community });
    const propertyIds = properties.map(p => p._id);
    
    const { propertyId, status, search, checkInDate, checkOutDate } = req.query;
    
    let filter = { dharmashala: { $in: propertyIds } };
    
    if (propertyId && propertyId !== 'all') {
      filter.dharmashala = propertyId;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { bookedBy: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (checkInDate) {
      filter.checkIn = { $gte: new Date(checkInDate) };
    }
    
    if (checkOutDate) {
      filter.checkOut = { $lte: new Date(checkOutDate) };
    }
    
    const bookings = await DharmashalaBooking.find(filter)
      .populate('dharmashala')
      .populate('rooms')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ status: 'success', data: bookings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update booking status history & assign rooms
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rooms, remarks, paymentStatus } = req.body;
    
    const booking = await DharmashalaBooking.findById(id);
    if (!booking) return res.status(404).json({ status: 'error', message: 'Booking request not found.' });
    
    const oldStatus = booking.status;
    booking.status = status;
    
    if (remarks) booking.remarks = remarks;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    
    // Room assignments
    if (rooms && rooms.length > 0) {
      booking.rooms = rooms;
      
      // Update room statuses based on check-in state
      const targetRoomStatus = status === 'checked_in' ? 'Occupied' : 'Booked';
      await DharmashalaRoom.updateMany(
        { _id: { $in: rooms } },
        { status: targetRoomStatus }
      );
    }
    
    // Free rooms if checked out, completed or cancelled
    if (['checked_out', 'completed', 'cancelled', 'no_show'].includes(status) && booking.rooms.length > 0) {
      await DharmashalaRoom.updateMany(
        { _id: { $in: booking.rooms } },
        { status: 'Available' }
      );
    }
    
    // Append Status Audit Log
    booking.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: req.user?.name || 'Admin'
    });
    
    await booking.save();
    
    res.status(200).json({ status: 'success', data: booking });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// 5. Maintenance Operations
exports.logMaintenance = async (req, res) => {
  try {
    const { dharmashalaId, roomId, startDate, endDate, reason, remarks } = req.body;
    
    const log = new DharmashalaMaintenance({
      dharmashala: dharmashalaId,
      room: roomId || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || 'Cleaning',
      remarks
    });
    
    await log.save();
    
    // Update room status
    if (roomId) {
      await DharmashalaRoom.findByIdAndUpdate(roomId, { status: 'Maintenance' });
    } else {
      // Block entire property rooms
      await DharmashalaRoom.updateMany(
        { dharmashala: dharmashalaId },
        { status: 'Blocked' }
      );
    }
    
    res.status(201).json({ status: 'success', data: log });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getMaintenanceLogs = async (req, res) => {
  try {
    const logs = await DharmashalaMaintenance.find({ dharmashala: req.query.dharmashalaId })
      .populate('room')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: logs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
