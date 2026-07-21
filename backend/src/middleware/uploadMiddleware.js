const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'merisamaj_uploads',
      resource_type: isVideo ? 'video' : 'auto',
      allowed_formats: isVideo 
        ? ['mp4', 'webm', 'mov', 'ogg'] 
        : ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf']
    };
  },
});

// File Filter to allow images, PDFs, and video formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif',
    'application/pdf',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and MP4/WebM/OGG/MOV videos are allowed.'), false);
  }
};

// Initialize Multer (Up limit to 15 MB for video support)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
