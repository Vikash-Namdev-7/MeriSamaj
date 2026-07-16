const config = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  nodeEnv: process.env.NODE_ENV || 'development',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};

// Validate critical variables in production
if (config.nodeEnv === 'production') {
  if (!config.mongoUri) {
    console.error('FATAL ERROR: MONGO_URI environment variable is not defined!');
    process.exit(1);
  }
  if (!config.jwtSecret) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is not defined!');
    process.exit(1);
  }
}

module.exports = config;
