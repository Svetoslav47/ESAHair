import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Barber } from '../models/Barber';

// Load environment variables
config();

const clearBarberAssignments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/esahair');
    console.log('Connected to MongoDB');

    // Drop the unique index first
    await Barber.collection.dropIndex('saloonAssignments.date_1_saloonAssignments.saloon_1');
    console.log('Dropped unique index');

    // Update all barbers to remove saloonAssignments
    const result = await Barber.updateMany(
      {},
      { $set: { saloonAssignments: [] } }
    );
    console.log(`Successfully cleared assignments for ${result.modifiedCount} barbers`);

    // Recreate the unique index
    await Barber.collection.createIndex(
      { 'saloonAssignments.date': 1, 'saloonAssignments.saloon': 1 },
      { unique: true, sparse: true }
    );
    console.log('Recreated unique index');

  } catch (error) {
    console.error('Error clearing barber assignments:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
clearBarberAssignments(); 