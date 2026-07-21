const { MongoClient } = require('mongodb');
async function main() {
  const client = new MongoClient('mongodb://localhost:27017/merisamaj');
  await client.connect();
  const db = client.db();
  
  const users = await db.collection('users').find({},{projection:{phone:1,email:1,role:1,name:1,isActive:1}}).limit(15).toArray();
  console.log('ALL USERS (first 15):');
  users.forEach(u => console.log(' ', JSON.stringify({phone:u.phone, email:u.email, role:u.role, name:u.name, active:u.isActive})));
  
  const admins = await db.collection('users').find(
    {role:{$in:['admin','head']}},
    {projection:{phone:1,email:1,role:1,name:1}}
  ).toArray();
  console.log('\nADMINS/HEADS:');
  admins.forEach(u => console.log(' ', JSON.stringify({phone:u.phone, email:u.email, role:u.role, name:u.name})));
  
  await client.close();
}
main().catch(console.error);
