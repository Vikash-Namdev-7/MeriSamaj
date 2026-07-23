const config = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'merisamaj_default_jwt_secret_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'merisamaj_default_refresh_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
  }
};

// Validate critical security variables in production
if (config.nodeEnv === 'production') {
  if (!config.mongoUri) {
    console.error('FATAL ERROR: MONGO_URI environment variable is not defined!');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change_me')) {
    console.error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing or insecure in production!');
    process.exit(1);
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.includes('change_me')) {
    console.error('FATAL SECURITY ERROR: JWT_REFRESH_SECRET environment variable is missing or insecure in production!');
    process.exit(1);
  }
}

module.exports = config;
