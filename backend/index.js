require('dotenv').config();
const dns = require('dns');

// Set Node.js DNS servers to Google Public DNS to resolve MongoDB Atlas SRV lookup errors
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./src/index');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port : http://localhost:${PORT}`);
});
