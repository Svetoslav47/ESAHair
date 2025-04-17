import { connectDB } from '../db/mongodb';

export const setupDatabase = async () => {
    if (!await connectDB()) {
        console.error('Failed to connect to MongoDB');
        process.exit(1);
    }
}; 