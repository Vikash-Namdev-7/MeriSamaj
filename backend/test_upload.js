const fs = require('fs');

async function testUpload() {
  try {
    const formData = new FormData();
    // Fetch API's FormData doesn't support streams in Node without special handling, let's just make a GET request to see if the server responds at all
    const res = await fetch('http://localhost:5001/api/v1/member/matrimonial/chat/conversations/6a5f43ebcd78efd8d5faf80c/messages');
    console.log(res.status, await res.text());
  } catch (err) {
    console.log('Error:', err.message);
  }
}
testUpload();
