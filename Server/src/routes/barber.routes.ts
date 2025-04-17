import { Router, RequestHandler } from 'express';
import { getBarbers, createBarber, getBarberAvailability } from '../controllers/barber.controller';
import { CalendarService } from '../services/calendarService';

export const setupBarberRoutes = (calendarService: CalendarService) => {
    const router = Router();
    console.log('Setting up barber routes:');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/barbers');
    console.log('  [\x1b[33mPOST\x1b[0m]   /api/barbers');
    console.log('  [\x1b[32mGET\x1b[0m]    /api/barbers/:barberName/availability');

    router.get('/', getBarbers);
    router.post('/', createBarber);

    const availabilityHandler: RequestHandler = async (req, res, next) => {
        try {
            await getBarberAvailability(req, res, calendarService);
        } catch (error) {
            next(error);
        }
    };
    router.get('/:barberName/availability', availabilityHandler);

    console.log('======================');
    return router;
}; 