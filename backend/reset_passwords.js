require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const adminHash = await bcrypt.hash('Admin@1234', 10);
  const headHash  = await bcrypt.hash('Head@1234', 10);

  // Raw update bypasses all mongoose hooks — direct hash write
  const adminRes = await mongoose.connection.db.collection('users').updateOne(
    { phone: '7777777777' },
    { $set: { password: adminHash } }
  );
  const headRes = await mongoose.connection.db.collection('users').updateOne(
    { phone: '8888888888' },
    { $set: { password: headHash } }
  );

  console.log('Admin update:', adminRes.modifiedCount, 'docs modified');
  console.log('Head update:', headRes.modifiedCount, 'docs modified');

  // Verify
  const adminDoc = await mongoose.connection.db.collection('users').findOne({ phone: '7777777777' });
  const headDoc  = await mongoose.connection.db.collection('users').findOne({ phone: '8888888888' });

  const adminOk = await bcrypt.compare('Admin@1234', adminDoc.password);
  const headOk  = await bcrypt.compare('Head@1234', headDoc.password);

  console.log('Admin@1234 verify:', adminOk);
  console.log('Head@1234 verify:', headOk);

  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
