const express = require('express');
const { uploadChatImage } = require('./src/middleware/uploadMiddleware');

const app = express();
app.post('/test/:conversationId', (req, res, next) => {
  // Mock req.user for the middleware if needed, though uploadMiddleware doesn't use it directly
  req.user = { _id: '123' };
  next();
}, uploadChatImage, (req, res) => {
  res.json({ success: true, file: req.file });
});

const server = app.listen(5002, () => {
  console.log('Test server running on 5002');
  
  // Now make a request to it
  const FormData = require('form-data');
  const fs = require('fs');
  const axios = require('axios'); // Wait, axios is not installed. We'll use http
  const http = require('http');

  const form = new FormData();
  form.append('photo', fs.createReadStream('./test_cloudinary.js'));

  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/test/12345',
    method: 'POST',
    headers: form.getHeaders()
  };

  const req = http.request(options, (res2) => {
    let data = '';
    res2.on('data', chunk => data += chunk);
    res2.on('end', () => {
      console.log('Response:', res2.statusCode, data);
      server.close();
    });
  });

  req.on('error', (e) => {
    console.error('Request Error:', e.message);
    server.close();
  });

  form.pipe(req);
});
