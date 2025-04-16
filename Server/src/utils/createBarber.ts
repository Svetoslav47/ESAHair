import { Barber } from '../models/Barber';
import { connectDB } from '../db/mongodb';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const validateWorkingDays = (days: string): string[] => {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const inputDays = days.split(',').map(day => day.trim());
    
    for (const day of inputDays) {
        if (!validDays.includes(day)) {
            throw new Error(`Invalid day: ${day}. Valid days are: ${validDays.join(', ')}`);
        }
    }
    
    return inputDays;
};

const validateHour = (hour: number) => {
    if (hour < 0 || hour > 23 || !Number.isInteger(hour)) {
        throw new Error('Hour must be a whole number between 0 and 23');
    }
    return hour;
};

const validateDaysOff = (daysStr: string): Date[] => {
    if (!daysStr) return [];
    const days = daysStr.split(',').map(day => day.trim());
    return days.map(day => {
        const date = new Date(day);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${day}. Please use YYYY-MM-DD format`);
        }
        return date;
    });
};

const createBarber = async () => {
    try {
        // Connect to MongoDB
        if (!connectDB()) {
            console.error('Failed to connect to MongoDB');
            process.exit(1);
        }

        // Get barber details from user
        const name = await askQuestion('Enter barber name: ');
        const email = await askQuestion('Enter barber email: ');
        const phone = await askQuestion('Enter barber phone: ');
        const role = await askQuestion('Enter barber role (e.g., "barber", "senior barber"): ');
        const image = await askQuestion('Enter barber image URL (optional, press Enter to skip): ');
        
        // Get working hours
        const startHourStr = await askQuestion('Enter start hour (0-23): ');
        const endHourStr = await askQuestion('Enter end hour (0-23): ');
        const startHour = validateHour(parseInt(startHourStr));
        const endHour = validateHour(parseInt(endHourStr));
        
        // Get working days
        console.log('\nEnter working days (comma-separated)');
        console.log('Valid days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday');
        const workingDaysStr = await askQuestion('Working days: ');
        const workingDays = validateWorkingDays(workingDaysStr);
        
        // Get days off
        console.log('\nEnter days off (comma-separated, YYYY-MM-DD format, press Enter if none)');
        console.log('Example: 2024-12-25,2024-12-26');
        const daysOffStr = await askQuestion('Days off: ');
        const daysOff = validateDaysOff(daysOffStr);

        // Create new barber
        const barber = new Barber({
            name,
            email,
            phone,
            role,
            ...(image && { image }),
            startHour,
            endHour,
            workingDays,
            daysOff
        });

        // Save to database
        await barber.save();
        console.log('Barber created successfully:', barber);

    } catch (error) {
        console.error('Error creating barber:', error);
    } finally {
        rl.close();
        process.exit(0);
    }
};

// Run the script
createBarber(); 