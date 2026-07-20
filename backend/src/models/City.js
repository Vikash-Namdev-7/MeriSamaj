const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    state: {
      type: String,
      default: 'Madhya Pradesh',
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name and state before saving to ensure uniqueness across states
citySchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    const baseStr = `${this.name}-${this.state || ''}`;
    this.slug = baseStr
      .toLowerCase()
      .replace(/\s+/g, '-')          
      .replace(/[^\w-]+/g, '')       
      .replace(/--+/g, '-')          
      .trim();
  }
  next();
});

const City = mongoose.model('City', citySchema);

module.exports = City;
