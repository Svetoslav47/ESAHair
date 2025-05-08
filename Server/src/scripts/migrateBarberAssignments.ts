import mongoose from 'mongoose';
import { Barber } from '../models/Barber';
import { BarberAssignment } from '../models/BarberAssignment';

interface BarberWithAssignments extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    saloonAssignments: Array<{
        date: Date;
        saloon: mongoose.Types.ObjectId;
    }>;
}

const migrateBarberAssignments = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/esahair');
        console.log('Connected to MongoDB');

        // Get all barbers with their assignments
        const barbers = await Barber.find() as BarberWithAssignments[];
        console.log(`Found ${barbers.length} barbers`);

        // Process each barber's assignments
        for (const barber of barbers) {
            console.log(`Processing barber: ${barber.name}`);
            
            // Create new assignments in the BarberAssignment collection
            for (const assignment of barber.saloonAssignments) {
                try {
                    await BarberAssignment.create({
                        barber: barber._id,
                        saloon: assignment.saloon,
                        date: assignment.date
                    });
                    console.log(`Created assignment for ${barber.name} on ${assignment.date}`);
                } catch (error: any) {
                    if (error.code === 11000) {
                        console.log(`Assignment already exists for ${barber.name} on ${assignment.date}`);
                    } else {
                        console.error(`Error creating assignment for ${barber.name}:`, error);
                    }
                }
            }
        }

        // Remove saloonAssignments from Barber model
        await Barber.updateMany({}, { $unset: { saloonAssignments: 1 } });
        console.log('Removed saloonAssignments from Barber model');

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
};

// Run the migration
migrateBarberAssignments(); 