const mongoose = require('mongoose');

const dharmashalaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  googleMapsUrl: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  contactPerson: { type: String, required: true },
  contactNumber: { type: String, required: true },
  alternateContact: { type: String },
  email: { type: String },
  website: { type: String },
  image: { type: String }, // Cover image URL
  galleryImages: [{ type: String }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isFeatured: { type: Boolean, default: false },
  amenities: [{ type: String }], // WiFi, Lift, CCTV, RO Water, etc.
  rules: { type: String },
  checkInTime: { type: String, default: '10:00' },
  checkOutTime: { type: String, default: '10:00' },
  community: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dharmashala', dharmashalaSchema);
