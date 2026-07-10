require('dotenv').config();
const dns = require('dns');

// Set Node.js DNS servers to Google Public DNS to resolve MongoDB Atlas SRV lookup errors
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./src/index');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port : http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${PORT} is already in use by another process!`);
    console.error(`Please kill the process using port ${PORT} and restart the server.`);
    console.error(`You can release it in PowerShell by running:`);
    console.error(`  Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
