import { DayOff } from '../models/DayOff';
import { Barber } from '../models/Barber';
import { connectDB } from '../db/mongodb';
import readline from 'readline';
import { Document, Types } from 'mongoose';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const validateDate = (dateStr: string): Date => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}. Please use YYYY-MM-DD format`);
    }
    return date;
};

interface BarberDocument {
    _id: Types.ObjectId;
    name: string;
}

interface PopulatedDayOff {
    _id: Types.ObjectId;
    barber: BarberDocument;
    date: Date;
    reason?: string;
}

const listBarbers = async () => {
    const barbers = await Barber.find({}, 'name');
    console.log('\nAvailable barbers:');
    barbers.forEach((barber, index) => {
        console.log(`${index + 1}. ${barber.name}`);
    });
    return barbers;
};

const addDayOff = async () => {
    try {
        // Connect to MongoDB
        if (!connectDB()) {
            console.error('Failed to connect to MongoDB');
            process.exit(1);
        }

        // List available barbers
        const barbers = await listBarbers();
        
        // Get barber selection
        const selection = await askQuestion('\nEnter barber number: ');
        const selectedBarber = barbers[parseInt(selection) - 1];
        
        if (!selectedBarber) {
            throw new Error('Invalid barber selection');
        }

        // Get day off details
        console.log('\nEnter day off date (YYYY-MM-DD format):');
        const dateStr = await askQuestion('Date: ');
        const date = validateDate(dateStr);

        const reason = await askQuestion('Reason (optional, press Enter to skip): ');

        // Create day off record
        const dayOff = new DayOff({
            barber: selectedBarber._id,
            date,
            ...(reason && { reason })
        });

        // Save to database
        await dayOff.save();
        console.log('Day off added successfully:', {
            barber: selectedBarber.name,
            date: date.toISOString().split('T')[0],
            reason
        });

    } catch (error) {
        console.error('Error adding day off:', error);
    } finally {
        rl.close();
        process.exit(0);
    }
};

const listDaysOff = async () => {
    try {
        // Connect to MongoDB
        if (!connectDB()) {
            console.error('Failed to connect to MongoDB');
            process.exit(1);
        }

        // List available barbers
        const barbers = await listBarbers();
        
        // Get barber selection
        const selection = await askQuestion('\nEnter barber number (or press Enter to see all): ');
        
        let daysOff: PopulatedDayOff[];
        if (selection) {
            const selectedBarber = barbers[parseInt(selection) - 1];
            if (!selectedBarber) {
                throw new Error('Invalid barber selection');
            }
            daysOff = await DayOff.find({ barber: selectedBarber._id })
                .populate<{ barber: BarberDocument }>('barber', 'name')
                .lean() as PopulatedDayOff[];
        } else {
            daysOff = await DayOff.find()
                .populate<{ barber: BarberDocument }>('barber', 'name')
                .lean() as PopulatedDayOff[];
        }

        console.log('\nDays off:');
        daysOff.forEach(dayOff => {
            console.log(`- ${dayOff.barber.name}: ${dayOff.date.toISOString().split('T')[0]}${dayOff.reason ? ` (${dayOff.reason})` : ''}`);
        });

    } catch (error) {
        console.error('Error listing days off:', error);
    } finally {
        rl.close();
        process.exit(0);
    }
};

// Check command line arguments to determine action
const action = process.argv[2];
if (action === 'add') {
    addDayOff();
} else if (action === 'list') {
    listDaysOff();
} else {
    console.log('Usage: npm run manage-days-off -- [add|list]');
    process.exit(1);
} 