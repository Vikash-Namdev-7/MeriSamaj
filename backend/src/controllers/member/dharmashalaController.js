const Dharmashala = require('../../models/Dharmashala');
const DharmashalaRoom = require('../../models/DharmashalaRoom');
const DharmashalaBooking = require('../../models/DharmashalaBooking');
const DharmashalaMaintenance = require('../../models/DharmashalaMaintenance');

// Get all Dharmashalas (List with filters)
exports.getAllDharmashalas = async (req, res) => {
  try {
    const { search, city, ac, food } = req.query;
    let query = { status: { $ne: 'Inactive' } };
    
    // Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { address: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // City filter
    if (city && city !== 'all') {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    
    // AC filter
    if (ac === 'true') {
      query.amenities = { $in: [/ac/i, /air conditioning/i] };
    }
    
    // Food filter
    if (food === 'true') {
      query.amenities = { $in: [/kitchen/i, /dining/i, /food/i] };
    }
    
    const dharamshalas = await Dharmashala.find(query).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: dharamshalas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single Dharmashala detail with rooms list
exports.getDharmashalaById = async (req, res) => {
  try {
    const dharamshala = await Dharmashala.findById(req.params.id);
    if (!dharamshala) {
      return res.status(404).json({ status: 'error', message: 'Dharmashala not found' });
    }
    
    // Fetch all active rooms for this property
    let rooms = await DharmashalaRoom.find({ 
      dharmashala: req.params.id,
      status: { $ne: 'Blocked' }
    });

    if (rooms.length === 0) {
      rooms = await DharmashalaRoom.create([
        {
          dharmashala: req.params.id,
          roomNumber: '101',
          roomName: 'Deluxe AC',
          floor: '1st Floor',
          roomCategory: 'Deluxe',
          isAc: true,
          capacity: 2,
          extraMattressAllowed: true,
          maxGuests: 3,
          price: 1500,
          status: 'Available'
        },
        {
          dharmashala: req.params.id,
          roomNumber: '102',
          roomName: 'Standard General',
          floor: '1st Floor',
          roomCategory: 'Standard',
          isAc: false,
          capacity: 2,
          extraMattressAllowed: true,
          maxGuests: 3,
          price: 1000,
          status: 'Available'
        }
      ]);
      await Dharmashala.findByIdAndUpdate(req.params.id, {
        totalRooms: 2,
        acRooms: 1,
        generalRooms: 1
      });
    }
    
    res.status(200).json({ 
      status: 'success', 
      data: { ...dharamshala.toObject(), rooms } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get availability calendar arrays
exports.getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    
    const dharamshala = await Dharmashala.findById(id);
    if (!dharamshala) {
      return res.status(404).json({ status: 'error', message: 'Dharmashala not found' });
    }
    
    // Count total rooms active
    let totalRoomCount = await DharmashalaRoom.countDocuments({ 
      dharmashala: id, 
      status: { $ne: 'Blocked' } 
    });

    if (totalRoomCount === 0) {
      await DharmashalaRoom.create([
        {
          dharmashala: id,
          roomNumber: '101',
          roomName: 'Deluxe AC',
          floor: '1st Floor',
          roomCategory: 'Deluxe',
          isAc: true,
          capacity: 2,
          extraMattressAllowed: true,
          maxGuests: 3,
          price: 1500,
          status: 'Available'
        },
        {
          dharmashala: id,
          roomNumber: '102',
          roomName: 'Standard General',
          floor: '1st Floor',
          roomCategory: 'Standard',
          isAc: false,
          capacity: 2,
          extraMattressAllowed: true,
          maxGuests: 3,
          price: 1000,
          status: 'Available'
        }
      ]);
      await Dharmashala.findByIdAndUpdate(id, {
        totalRooms: 2,
        acRooms: 1,
        generalRooms: 1
      });
      totalRoomCount = 2;
    }
    
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0); // last day of month
    
    // Find active bookings in this month
    const bookings = await DharmashalaBooking.find({
      dharmashala: id,
      status: { $in: ['pending_approval', 'approved', 'upcoming', 'checked_in'] },
      checkIn: { $lte: endDate },
      checkOut: { $gte: startDate }
    });
    
    // Find maintenance locks in this month
    const maintenance = await DharmashalaMaintenance.find({
      dharmashala: id,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });
    
    const totalDays = endDate.getDate();
    const days = [];
    
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(y, m - 1, day);
      currentDate.setHours(0,0,0,0);
      
      const dailyBookings = bookings.filter(b => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        checkIn.setHours(0,0,0,0);
        checkOut.setHours(0,0,0,0);
        return currentDate >= checkIn && currentDate < checkOut;
      });
      
      const dailyMaintenance = maintenance.filter(block => {
        const start = new Date(block.startDate);
        const end = new Date(block.endDate);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        return currentDate >= start && currentDate < end;
      });
      
      // Calculate capacity blocked
      const blockedRoomsCount = dailyBookings.length + dailyMaintenance.length;
      
      let status = 'available';
      if (totalRoomCount > 0 && blockedRoomsCount >= totalRoomCount) {
        status = 'booked';
      } else if (blockedRoomsCount > 0) {
        status = 'partial';
      }
      
      days.push({ day, status });
    }
    
    res.status(200).json({ status: 'success', data: days });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create a new booking checking real-time availability
exports.createBooking = async (req, res) => {
  try {
    const { dharmashalaId, checkIn, checkOut, roomType, checkInTime, checkOutTime, bookedBy, phone, specialRequests } = req.body;
    
    const dharamshala = await Dharmashala.findById(dharmashalaId);
    if (!dharamshala) {
      return res.status(404).json({ status: 'error', message: 'Dharmashala not found' });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (nights <= 0) {
      return res.status(400).json({ status: 'error', message: 'Check-out date must be after check-in date.' });
    }
    
    // 1. Get room IDs currently occupied on these dates
    const bookedRoomIds = new Set();
    const overlappingBookings = await DharmashalaBooking.find({
      dharmashala: dharmashalaId,
      status: { $in: ['pending_approval', 'approved', 'upcoming', 'checked_in'] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate }
    });
    overlappingBookings.forEach(b => b.rooms.forEach(roomId => bookedRoomIds.add(roomId.toString())));
    
    // 2. Get room IDs locked for maintenance
    const maintenanceBlocks = await DharmashalaMaintenance.find({
      dharmashala: dharmashalaId,
      room: { $ne: null },
      startDate: { $lt: checkOutDate },
      endDate: { $gt: checkInDate }
    });
    maintenanceBlocks.forEach(block => bookedRoomIds.add(block.room.toString()));
    
    // 3. Find available room of matching category
    const isAc = roomType === 'AC';
    let allRooms = await DharmashalaRoom.find({ dharmashala: dharmashalaId });

    if (allRooms.length === 0) {
      allRooms = await DharmashalaRoom.create([
        {
          dharmashala: dharmashalaId,
          roomNumber: '101',
          roomName: 'Deluxe AC',
          floor: '1st Floor',
          roomCategory: 'Deluxe',
          isAc: true,
          capacity: 2,
          extraMattressAllowed: true,
          maxGuests: 3,
          price: 1500,
          status: 'Available'
        },
        {
          dharmashala: dharmashalaId,
          roomNumber: '102',
          roomName: 'Standard General',
          floor: '1st Floor',
          roomCategory: 'Standard',
          isAc: false,
          capacity: 2,
          extraMattressAllowed: true,
          maxGuests: 3,
          price: 1000,
          status: 'Available'
        }
      ]);
      await Dharmashala.findByIdAndUpdate(dharmashalaId, {
        totalRooms: 2,
        acRooms: 1,
        generalRooms: 1
      });
    }

    let availableRooms = allRooms.filter(r => 
      !bookedRoomIds.has(r._id.toString()) &&
      r.status === 'Available' &&
      r.isAc === isAc
    );
    
    // Fallback: If no room matches the specific preference, try to find ANY available room
    if (availableRooms.length === 0) {
      availableRooms = allRooms.filter(r => 
        !bookedRoomIds.has(r._id.toString()) &&
        r.status === 'Available'
      );
    }
    
    if (availableRooms.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No available rooms found for the selected type and dates.' 
      });
    }
    
    // Assign the first free room
    const targetRoom = availableRooms[0];
    const pricePerNight = targetRoom.price;
    const totalAmount = pricePerNight * nights;
    
    const bookingId = `DH${Date.now().toString().slice(-8)}`;
    
    const booking = new DharmashalaBooking({
      bookingId,
      dharmashala: dharmashalaId,
      communityId: dharamshala.communityId || req.communityId,
      rooms: [targetRoom._id],
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      roomType: roomType || (isAc ? 'AC' : 'General'),
      checkInTime: checkInTime || dharamshala.checkInTime,
      checkOutTime: checkOutTime || dharamshala.checkOutTime,
      totalAmount,
      bookedBy: bookedBy || req.user.name,
      phone: phone || req.user.phone,
      specialRequests,
      status: 'pending_approval'
    });
    
    await booking.save();
    
    // Simulate background admin approval in 8 seconds for local/dev mock response
    setTimeout(async () => {
      try {
        await DharmashalaBooking.findByIdAndUpdate(booking._id, { status: 'approved' });
      } catch (err) {
        console.error("Simulation auto approval error:", err);
      }
    }, 8000);
    
    res.status(201).json({ status: 'success', data: booking });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get booking history for current user
exports.getBookingHistory = async (req, res) => {
  try {
    const bookings = await DharmashalaBooking.find({ user: req.user._id })
      .populate('dharmashala')
      .populate('rooms')
      .sort({ createdAt: -1 });
    
    const formatted = bookings.map(b => ({
      id: b.bookingId,
      _id: b._id,
      dharmashalaId: b.dharmashala?._id,
      dharmashalaName: b.dharmashala?.name || 'Dharmashala',
      location: b.dharmashala?.address || b.dharmashala?.location || '',
      status: b.status,
      checkIn: b.checkIn.toISOString().split('T')[0],
      checkOut: b.checkOut.toISOString().split('T')[0],
      nights: b.nights,
      totalAmount: b.totalAmount,
      bookedBy: b.bookedBy,
      phone: b.phone,
      roomType: b.roomType,
      rooms: b.rooms.map(r => r.roomNumber),
      checkInTime: b.checkInTime,
      checkOutTime: b.checkOutTime
    }));
    
    res.status(200).json({ status: 'success', data: formatted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Confirm payment for booking
exports.payBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = await DharmashalaBooking.findOne({ bookingId: id });
    if (!booking) {
      booking = await DharmashalaBooking.findById(id);
    }
    
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }
    
    booking.status = 'upcoming';
    booking.paymentStatus = 'Paid';
    await booking.save();
    
    res.status(200).json({ status: 'success', data: booking });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
