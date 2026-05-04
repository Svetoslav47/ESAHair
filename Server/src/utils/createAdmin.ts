import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ensureAdminUser } from './ensureAdminUser';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salon');
    console.log('Connected to MongoDB');

    const adminCreated = await ensureAdminUser();
    if (!adminCreated) {
      console.log('Admin user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 