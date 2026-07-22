require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

try {
  const chatStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `merisamaj/chat_messages/test`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ],
      public_id: `chat_${Date.now()}`
    })
  });
  console.log('CloudinaryStorage initialized successfully.');
} catch (e) {
  console.error('CloudinaryStorage failed:', e.message);
}
