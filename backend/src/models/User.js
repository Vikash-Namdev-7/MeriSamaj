const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Auth Fields
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  
  // Basic Profile Fields
  name: { type: String },
  avatar: { type: String }, // URL from cloudinary or base64
  gender: { type: String },
  dob: { type: Date },
  bloodGroup: { type: String },
  maritalStatus: { type: String },
  gotra: { type: String },
  
  // Community Fields
  community: { type: String },
  subCommunity: { type: String },
  
  // Location Fields
  city: { type: String },
  district: { type: String },
  state: { type: String },
  pincode: { type: String },
  
  // Education & Profession
  qualification: { type: String },
  school: { type: String },
  passingYear: { type: String },
  profession: { type: String },
  company: { type: String },
  annualIncome: { type: String },
  workCity: { type: String },
  
  // Detailed Address
  houseNumber: { type: String },
  streetAddress: { type: String },
  landmark: { type: String },
  areaAddress: { type: String },
  pincodeAddress: { type: String },
  detailedAddress: { type: String },
  alternatePhone: { type: String },
  alternateEmail: { type: String },
  
  // Family Members Array
  familyMembers: [{
    name: String,
    relation: String,
    age: String,
    phone: String,
    mobile: String,
    gotra: String
  }],
  
  // Preferences (Matrimonial/Other)
  prefEducation: { type: String },
  prefAge: { type: String },
  prefHeight: { type: String },
  prefOccupation: { type: String },
  prefCity: { type: String },
  
  // Verification Flags
  isAadharVerified: { type: Boolean, default: false },
  isFaceVerified: { type: Boolean, default: false },
  
  // Metadata
  referralCode: { type: String },
  role: { type: String, enum: ['user', 'admin', 'head'], default: 'user' }
}, {
  timestamps: true
});

// Password Hash Middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
