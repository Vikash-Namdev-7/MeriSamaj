const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined!');
    }
    const conn = await mongoose.connect(config.mongoUri, {
      // Modern mongoose version doesn't require deprecated options
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default users for testing if they don't exist
    const User = require('../models/User');

    // 1. Seed/Update Default Member
    const defaultPhone = '9999999999';
    const defaultEmail = 'default@samaj.com';
    const defaultPassword = 'Password123';
    let memberUser = await User.findOne({ phone: defaultPhone });

    if (!memberUser) {
      await User.create({
        phone: defaultPhone,
        email: defaultEmail,
        password: defaultPassword, // Auto-hashed by user pre-save hook
        name: 'Default Member',
        role: 'user',
        community: 'Agrawal Samaj',
        city: 'Indore',
        isVerified: true
      });
      console.log('Default Samaj Member seeded successfully (Phone: 9999999999, Password: Password123).');
    } else {
      // Ensure role and password are correct
      memberUser.password = defaultPassword;
      memberUser.role = 'user';
      await memberUser.save();
    }

    // 2. Seed/Update Default Head User
    const headEmail = 'head@example.com';
    const headPassword = 'Head@123';
    const headPhone = '8888888888';
    
    let headUser = await User.findOne({ email: headEmail });

    if (!headUser) {
      // Fallback: check if the phone is already used
      headUser = await User.findOne({ phone: headPhone });
    }

    if (!headUser) {
      await User.create({
        phone: headPhone,
        email: headEmail,
        password: headPassword, // Auto-hashed by user pre-save hook
        name: 'Shri Mohan Lal',
        role: 'head',
        community: 'Meri Samaj',
        city: 'Indore',
        isVerified: true
      });
      console.log('Default Head (President) seeded successfully (Email: head@example.com, Password: Head@123).');
    } else {
      // Force update role and password to match our required config
      headUser.email = headEmail;
      headUser.password = headPassword;
      headUser.role = 'head';
      headUser.isVerified = true;
      await headUser.save();
      console.log('Default Head (President) database state verified and updated successfully.');
    }

    // 3. Seed Default Dharmashalas and Rooms
    const Dharmashala = require('../models/Dharmashala');
    const DharmashalaRoom = require('../models/DharmashalaRoom');
    
    const dharmashalasCount = await Dharmashala.countDocuments();
    if (dharmashalasCount === 0) {
      const seededProperties = await Dharmashala.create([
        {
          name: 'Shri Ram Dharmashala',
          description: 'Shri Ram Dharmashala offers comfortable stay options for families and community members visiting Indore. Close to the railway station.',
          address: 'Railway Road, Indore, M.P.',
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452001',
          googleMapsUrl: 'https://maps.google.com',
          latitude: '22.7196',
          longitude: '75.8577',
          contactPerson: 'Mr. Rajesh Sharma',
          contactNumber: '9827012345',
          email: 'shriram@samaj.com',
          status: 'Active',
          isFeatured: true,
          amenities: ['Parking', 'Lift', 'WiFi', 'CCTV', 'RO Water', 'Hot Water'],
          checkInTime: '10:00',
          checkOutTime: '10:00',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
          galleryImages: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop'
          ],
          community: 'Meri Samaj'
        },
        {
          name: 'Shri Krishna Dharmashala',
          description: 'Shri Krishna Dharmashala in Vijay Nagar offers pure vegetarian food facilities and comfortable lodging arrangements.',
          address: 'Vijay Nagar, Indore, M.P.',
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452010',
          googleMapsUrl: 'https://maps.google.com',
          latitude: '22.7533',
          longitude: '75.8937',
          contactPerson: 'Mr. Sunil Gupta',
          contactNumber: '9926054321',
          email: 'shrikrishna@samaj.com',
          status: 'Active',
          isFeatured: false,
          amenities: ['Parking', 'CCTV', 'Kitchen', 'Dining Hall', 'Generator', 'Temple'],
          checkInTime: '11:00',
          checkOutTime: '11:00',
          image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=600&auto=format&fit=crop',
          galleryImages: [
            'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1582719478250-c8940026e95c?w=600&h=400&fit=crop'
          ],
          community: 'Agrawal Samaj'
        }
      ]);

      // Seed corresponding rooms for each property
      for (const prop of seededProperties) {
        const roomsToCreate = [
          {
            dharmashala: prop._id,
            roomNumber: '101',
            roomName: 'Deluxe Suite',
            floor: '1st Floor',
            roomCategory: 'Suite',
            isAc: true,
            capacity: 2,
            extraMattressAllowed: true,
            maxGuests: 4,
            price: prop.name.includes('Ram') ? 1800 : 1500,
            weekendPrice: 2000,
            status: 'Available'
          },
          {
            dharmashala: prop._id,
            roomNumber: '102',
            roomName: 'Standard Room',
            floor: '1st Floor',
            roomCategory: 'Standard',
            isAc: false,
            capacity: 2,
            extraMattressAllowed: true,
            maxGuests: 3,
            price: 1000,
            weekendPrice: 1200,
            status: 'Available'
          },
          {
            dharmashala: prop._id,
            roomNumber: '103',
            roomName: 'Standard Room',
            floor: '1st Floor',
            roomCategory: 'Standard',
            isAc: false,
            capacity: 2,
            extraMattressAllowed: false,
            maxGuests: 2,
            price: 800,
            weekendPrice: 900,
            status: 'Available'
          }
        ];
        
        await DharmashalaRoom.create(roomsToCreate);
        
        // Sync counts
        prop.totalRooms = 3;
        prop.acRooms = 1;
        prop.generalRooms = 2;
        await prop.save();
      }
      console.log('Default Dharmashala items and rooms seeded successfully.');
    }

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
