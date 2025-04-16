import { Service } from '../models/Service';
import { connectDB } from '../db/mongodb';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const validateDuration = (duration: number) => {
    if (duration <= 0 || !Number.isInteger(duration)) {
        throw new Error('Duration must be a positive whole number');
    }
    return duration;
};

const validatePrice = (price: number) => {
    if (price <= 0) {
        throw new Error('Price must be a positive number');
    }
    return price;
};

const createService = async () => {
    try {
        // Connect to MongoDB
        if (!connectDB()) {
            console.error('Failed to connect to MongoDB');
            process.exit(1);
        }

        // Get service details from user
        const name = await askQuestion('Enter service name: ');
        const description = await askQuestion('Enter service description: ');
        const image = await askQuestion('Enter service image URL (optional, press Enter to skip): ');
        
        const durationStr = await askQuestion('Enter service duration in minutes: ');
        const duration = validateDuration(parseInt(durationStr));
        
        const priceStr = await askQuestion('Enter service price: ');
        const price = validatePrice(parseFloat(priceStr));

        // Create new service
        const service = new Service({
            name,
            description,
            ...(image && { image }),
            duration,
            price
        });

        // Save to database
        await service.save();
        console.log('Service created successfully:', service);

    } catch (error) {
        console.error('Error creating service:', error);
    } finally {
        rl.close();
        process.exit(0);
    }
};

// Run the script
createService(); 