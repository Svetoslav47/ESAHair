const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function fixBarberEmailIndex() {
  await mongoose.connect(MONGODB_URI);
  const collection = mongoose.connection.collection('barbers');

  // List all indexes
  const indexes = await collection.indexes();
  console.log('Current indexes:', indexes);

  // Drop the old unique index on email if it exists
  const emailIndex = indexes.find(idx => idx.key && idx.key.email === 1);
  if (emailIndex) {
    console.log('Dropping old index:', emailIndex.name);
    await collection.dropIndex(emailIndex.name);
  } else {
    console.log('No old unique index on email found.');
  }

  // Create the new sparse unique index
  await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
  console.log('Created new sparse unique index on email.');

  await mongoose.disconnect();
  console.log('Done!');
}

fixBarberEmailIndex().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 